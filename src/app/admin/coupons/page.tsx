'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, Calendar, Tag, Check, X } from 'lucide-react';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    percentage: '',
    valid_from: new Date().toISOString().split('T')[0],
    valid_until: ''
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setCoupons(data);
    setLoading(false);
  };

  const addCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code || !newCoupon.percentage) return;

    const { error } = await supabase.from('coupons').insert([{
      code: newCoupon.code.toUpperCase(),
      percentage_off: parseInt(newCoupon.percentage),
      valid_from: new Date(newCoupon.valid_from).toISOString(),
      valid_until: newCoupon.valid_until ? new Date(newCoupon.valid_until).toISOString() : null,
      is_active: true
    }]);

    if (!error) {
      setNewCoupon({
        code: '',
        percentage: '',
        valid_from: new Date().toISOString().split('T')[0],
        valid_until: ''
      });
      fetchCoupons();
    } else {
      alert(error.message);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('coupons')
      .update({ is_active: !currentStatus })
      .eq('id', id);
    if (!error) fetchCoupons();
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (!error) fetchCoupons();
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Coupon Management</h1>
          <p style={{ color: '#666' }}>Create and manage customer discounts</p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
        {/* List */}
        <div>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Active Coupons</h2>
            {loading ? (
              <p>Loading coupons...</p>
            ) : coupons.length === 0 ? (
              <p style={{ color: '#999', textAlign: 'center', padding: '2rem' }}>No coupons found.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {coupons.map(coupon => (
                  <div key={coupon.id} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '1rem',
                    border: '1px solid #f0f0f0',
                    borderRadius: '12px',
                    backgroundColor: coupon.is_active ? 'transparent' : '#f9f9f9'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <strong style={{ fontSize: '1.1rem', color: coupon.is_active ? '#000' : '#999' }}>{coupon.code}</strong>
                        <span style={{ 
                          padding: '0.2rem 0.6rem', 
                          backgroundColor: 'var(--primary)', 
                          color: 'white', 
                          fontSize: '0.75rem', 
                          borderRadius: '99px',
                          fontWeight: 700 
                        }}>{coupon.percentage_off}% OFF</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem', fontSize: '0.8rem', color: '#666' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Calendar size={14} /> 
                          {new Date(coupon.valid_from).toLocaleDateString()} 
                          {coupon.valid_until ? ` - ${new Date(coupon.valid_until).toLocaleDateString()}` : ' (No expiry)'}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        onClick={() => toggleStatus(coupon.id, coupon.is_active)}
                        style={{
                          padding: '0.5rem',
                          borderRadius: '8px',
                          border: '1px solid #ddd',
                          backgroundColor: 'white',
                          color: coupon.is_active ? '#22c55e' : '#666',
                          cursor: 'pointer'
                        }}
                      >
                        {coupon.is_active ? <Check size={18} /> : <X size={18} />}
                      </button>
                      <button 
                         onClick={() => deleteCoupon(coupon.id)}
                         style={{
                           padding: '0.5rem',
                           borderRadius: '8px',
                           border: '1px solid #fee2e2',
                           backgroundColor: 'white',
                           color: '#ef4444',
                           cursor: 'pointer'
                         }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Create Form */}
        <div style={{ position: 'sticky', top: '2rem' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={20} /> Create Coupon
            </h2>
            <form onSubmit={addCoupon} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Coupon Code</label>
                <input 
                  type="text" 
                  value={newCoupon.code}
                  onChange={e => setNewCoupon({...newCoupon, code: e.target.value})}
                  placeholder="e.g. WELCOME20"
                  style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Percentage Off (%)</label>
                <input 
                  type="number" 
                  min="1"
                  max="100"
                  value={newCoupon.percentage}
                  onChange={e => setNewCoupon({...newCoupon, percentage: e.target.value})}
                  placeholder="e.g. 20"
                  style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Valid From</label>
                <input 
                  type="date" 
                  value={newCoupon.valid_from}
                  onChange={e => setNewCoupon({...newCoupon, valid_from: e.target.value})}
                  style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Valid Until (Optional)</label>
                <input 
                  type="date" 
                  value={newCoupon.valid_until}
                  onChange={e => setNewCoupon({...newCoupon, valid_until: e.target.value})}
                  style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
                />
              </div>
              <button 
                type="submit"
                style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  fontWeight: 700,
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Create Coupon
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
