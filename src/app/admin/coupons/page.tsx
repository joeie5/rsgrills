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
              <label className={styles.label}>Valid Until (Optional)</label>
              <input 
                type="date" 
                value={newCoupon.valid_until}
                onChange={e => setNewCoupon({...newCoupon, valid_until: e.target.value})}
                className={styles.input}
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
          <h2 className={styles.sectionTitle}>Active Coupons</h2>
          {loading ? (
            <p>Loading coupons...</p>
          ) : coupons.length === 0 ? (
            <p style={{ color: '#999', textAlign: 'center', padding: '2rem' }}>No coupons found.</p>
          ) : (
            <div className={styles.couponList}>
              {coupons.map(coupon => (
                <div key={coupon.id} className={styles.couponItem} style={{ 
                  backgroundColor: coupon.is_active ? 'transparent' : '#f9f9f9',
                  opacity: coupon.is_active ? 1 : 0.7
                }}>
                  <div className={styles.couponInfo}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span className={styles.couponCode}>{coupon.code}</span>
                      <span className={styles.couponBadge}>{coupon.percentage_off}% OFF</span>
                    </div>
                    <div className={styles.couponMeta}>
                      <Calendar size={14} /> 
                      <span>
                        {new Date(coupon.valid_from).toLocaleDateString()} 
                        {coupon.valid_until ? ` - ${new Date(coupon.valid_until).toLocaleDateString()}` : ' (No expiry)'}
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
