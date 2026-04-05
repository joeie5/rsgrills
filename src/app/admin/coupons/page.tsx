'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, Calendar, Tag, Check, X } from 'lucide-react';
import styles from './Coupons.module.css';

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
    if (!newCoupon.code || !newCoupon.percentage || !newCoupon.valid_until) {
      alert('Please fill in all fields, including the expiry date.');
      return;
    }

    const { error } = await supabase.from('coupons').insert([{
      code: newCoupon.code.toUpperCase(),
      percentage_off: parseInt(newCoupon.percentage),
      valid_from: new Date(newCoupon.valid_from).toISOString(),
      valid_until: new Date(newCoupon.valid_until).toISOString(),
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
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Coupon Management</h1>
          <p className={styles.subtitle}>Create and manage customer discounts</p>
        </div>
      </header>

      <div className={styles.couponGrid}>
        {/* Create Form - Second in source but can be first on mobile via CSS order */}
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={20} /> Create Coupon
          </h2>
          <form onSubmit={addCoupon} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>Coupon Code</label>
              <input 
                type="text" 
                value={newCoupon.code}
                onChange={e => setNewCoupon({...newCoupon, code: e.target.value})}
                placeholder="e.g. WELCOME20"
                className={styles.input}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Percentage Off (%)</label>
              <input 
                type="number" 
                min="1"
                max="100"
                value={newCoupon.percentage}
                onChange={e => setNewCoupon({...newCoupon, percentage: e.target.value})}
                placeholder="e.g. 20"
                className={styles.input}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Valid From</label>
              <input 
                type="date" 
                value={newCoupon.valid_from}
                onChange={e => setNewCoupon({...newCoupon, valid_from: e.target.value})}
                className={styles.input}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Valid Until</label>
              <input 
                type="date" 
                value={newCoupon.valid_until}
                onChange={e => setNewCoupon({...newCoupon, valid_until: e.target.value})}
                className={styles.input}
                required
              />
            </div>
            <button 
              type="submit"
              className={styles.submitBtn}
            >
              Create Coupon
            </button>
          </form>
        </div>

        {/* List Section */}
        <div className={styles.listSection}>
          <h2 className={styles.sectionTitle}>Active & Scheduled Coupons</h2>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
              <div className="animate-pulse">Loading coupons...</div>
            </div>
          ) : coupons.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '4rem 2rem', 
              background: 'white', 
              borderRadius: '24px', 
              border: '2px dashed #f0f0f0' 
            }}>
              <Tag size={40} style={{ margin: '0 auto 1.5rem', color: '#cbd5e1' }} />
              <p style={{ color: '#94a3b8', fontWeight: 500 }}>No coupons found. Create your first discount to get started!</p>
            </div>
          ) : (
            <div className={styles.couponList}>
              {coupons.map(coupon => (
                <div key={coupon.id} className={styles.couponItem} style={{ 
                  opacity: coupon.is_active ? 1 : 0.6,
                  filter: coupon.is_active ? 'none' : 'grayscale(1)'
                }}>
                  <div className={styles.couponInfo}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span className={styles.couponCode}>{coupon.code}</span>
                      <span className={styles.couponBadge}>{coupon.percentage_off}% OFF</span>
                    </div>
                    <div className={styles.couponMeta}>
                      <Calendar size={14} style={{ color: 'var(--primary)' }} /> 
                      <span>
                        Valid {new Date(coupon.valid_from).toLocaleDateString()} — {new Date(coupon.valid_until).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className={styles.actionButtons}>
                    <button 
                      onClick={() => toggleStatus(coupon.id, coupon.is_active)}
                      className={`${styles.actionBtn} ${coupon.is_active ? styles.toggleBtnOn : styles.toggleBtnOff}`}
                      title={coupon.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {coupon.is_active ? <Check size={18} /> : <X size={18} />}
                    </button>
                    <button 
                       onClick={() => deleteCoupon(coupon.id)}
                       className={`${styles.actionBtn} ${styles.deleteBtn}`}
                       title="Delete"
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
    </div>
  );
}
