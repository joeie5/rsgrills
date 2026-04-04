'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Package, List, MapPin, ShoppingBag, Layout } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    orders: 0
  });
  const [loading, setLoading] = useState(true);
  const [siteSettings, setSiteSettings] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const [
          { count: pCount },
          { count: cCount },
          { count: zCount },
          { count: oCount }
        ] = await Promise.all([
          supabase.from('products').select('*', { count: 'exact', head: true }),
          supabase.from('categories').select('*', { count: 'exact', head: true }),
          supabase.from('delivery_zones').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('*', { count: 'exact', head: true })
        ]);

        setStats({
          products: pCount || 0,
          categories: cCount || 0,
          orders: oCount || 0
        });

        const { data: ss } = await supabase.from('site_settings').select('*').limit(1).single();
        if (ss) setSiteSettings(ss);
      } catch (err) {
        console.error('Dashboard stats error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const toggleStoreStatus = async () => {
    if (!siteSettings) return;
    setSaving(true);
    const newVal = !siteSettings.is_store_open;
    
    const { error } = await supabase
      .from('site_settings')
      .update({ is_store_open: newVal })
      .match({ id: siteSettings.id });

    if (!error) {
      setSiteSettings({ ...siteSettings, is_store_open: newVal });
    } else {
      alert('Error toggling store status: ' + error.message);
    }
    setSaving(false);
  };

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2rem' }}>Dashboard Overview</h1>

      {siteSettings && (
        <div style={{ 
          backgroundColor: 'white', 
          padding: '1.5rem 2rem', 
          borderRadius: '16px', 
          boxShadow: '0 4px 6px rgba(0,0,0,0.02)', 
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderLeft: `6px solid ${siteSettings.is_store_open ? '#48BB78' : '#F56565'}`
        }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: siteSettings.is_store_open ? '#48BB78' : '#F56565' }}></div>
              Store Status: {siteSettings.is_store_open ? 'OPEN' : 'CLOSED'}
            </h2>
            <p style={{ color: '#666', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
              {siteSettings.is_store_open ? 'Customers can currently place orders.' : 'Storefront is currently in browse-only mode.'}
            </p>
          </div>
          <button 
            onClick={toggleStoreStatus}
            disabled={saving}
            style={{ 
              backgroundColor: siteSettings.is_store_open ? '#FFF5F5' : '#F0FFF4', 
              color: siteSettings.is_store_open ? '#F56565' : '#48BB78', 
              padding: '0.6rem 1.25rem', 
              borderRadius: '10px', 
              fontWeight: 700,
              border: `1px solid ${siteSettings.is_store_open ? '#FEB2B2' : '#9AE6B4'}`,
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '0.9rem'
            }}
          >
            {saving ? 'Processing...' : (siteSettings.is_store_open ? 'Close Store' : 'Open Store')}
          </button>
        </div>
      )}
      
      {loading ? (
        <div>Loading stats...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
          <StatCard 
            title="Total Products" 
            value={stats.products} 
            icon={<Package size={24} color="#FF8C00" />} 
            color="rgba(255, 140, 0, 0.1)" 
          />
          <StatCard 
            title="Categories" 
            value={stats.categories} 
            icon={<List size={24} color="#4A90E2" />} 
            color="rgba(74, 144, 226, 0.1)" 
          />
          <StatCard 
            title="Total Orders" 
            value={stats.orders} 
            icon={<ShoppingBag size={24} color="#F5A623" />} 
            color="rgba(245, 166, 35, 0.1)" 
          />
          <Link href="/admin/hero" style={{ textDecoration: 'none', color: 'inherit' }}>
            <StatCard 
              title="Site Branding" 
              value={1} 
              icon={<Layout size={24} color="#6B46C1" />} 
              color="rgba(107, 70, 193, 0.1)" 
            />
          </Link>
        </div>
      )}

      {/* Recent Activity Placeholder */}
      <div style={{ marginTop: '3rem', backgroundColor: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Recent Order Activity</h2>
        <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
          <ShoppingBag size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
          <p>No recent orders to show. Your stats will populate as customers place orders.</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string, value: number, icon: React.ReactNode, color: string }) {
  return (
    <div style={{ 
      backgroundColor: 'white', 
      padding: '1.5rem', 
      borderRadius: '20px', 
      boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
      display: 'flex',
      alignItems: 'center',
      gap: '1.5rem'
    }}>
      <div style={{ 
        width: '60px', 
        height: '60px', 
        backgroundColor: color, 
        borderRadius: '16px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        {icon}
      </div>
      <div>
        <h3 style={{ fontSize: '0.9rem', color: '#888', fontWeight: 600 }}>{title}</h3>
        <p style={{ fontSize: '1.75rem', fontWeight: 800 }}>{value}</p>
      </div>
    </div>
  );
}
