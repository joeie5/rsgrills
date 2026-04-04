'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ShoppingBag, Search, Eye, Filter } from 'lucide-react';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    fetchOrders();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('admin-orders')
      .on('postgres_changes', { event: '*', table: 'orders', schema: 'public' }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filter]);

  const fetchOrders = async () => {
    setLoading(true);
    let query = supabase.from('orders').select('*, delivery_zones(name)');
    
    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (data) setOrders(data);
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#F5A623';
      case 'paid': return '#4A90E2';
      case 'preparing': return '#7B61FF';
      case 'delivered': return '#4CAF50';
      case 'cancelled': return '#FF4444';
      default: return '#888';
    }
  };

  return (
    <div>
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Manage Orders</h1>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Filter size={20} color="#888" />
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            style={{ 
              padding: '0.5rem 1rem', 
              borderRadius: '8px', 
              border: '1px solid #ddd',
              backgroundColor: 'white',
              fontWeight: 600
            }}
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="preparing">Preparing</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </header>

      {loading ? (
        <div>Loading orders...</div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem', backgroundColor: 'white', borderRadius: '16px' }}>
          <ShoppingBag size={48} style={{ margin: '0 auto 1rem', opacity: 0.1 }} />
          <p style={{ color: '#888' }}>No orders found matching this filter.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <th style={{ padding: '1.25rem', fontWeight: 600 }}>Order ID</th>
                <th style={{ padding: '1.25rem', fontWeight: 600 }}>Customer</th>
                <th style={{ padding: '1.25rem', fontWeight: 600 }}>Amount</th>
                <th style={{ padding: '1.25rem', fontWeight: 600 }}>Date</th>
                <th style={{ padding: '1.25rem', fontWeight: 600 }}>Items</th>
                <th style={{ padding: '1.25rem', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '1.25rem', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} style={{ borderBottom: '1px solid #f9f9f9', transition: 'background 0.2s' }}>
                  <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: '#888' }}>#{order.id.slice(0, 8)}</td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ fontWeight: 600 }}>{order.customer_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#888' }}>{order.delivery_zones?.name}</div>
                  </td>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 700 }}>£{order.total_price.toLocaleString()}</td>
                  <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem' }}>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', maxWidth: '180px' }}>
                     <div style={{ 
                       whiteSpace: 'nowrap', 
                       overflow: 'hidden', 
                       textOverflow: 'ellipsis',
                       color: '#666'
                     }} title={order.items?.map((i: any) => `${i.quantity}x ${i.name}`).join(', ')}>
                       {order.items?.map((i: any) => `${i.quantity}x ${i.name}`).join(', ') || 'No items'}
                     </div>
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span style={{ 
                      backgroundColor: getStatusColor(order.status) + '22', 
                      color: getStatusColor(order.status), 
                      padding: '0.4rem 0.8rem', 
                      borderRadius: '99px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase'
                    }}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      style={{ 
                        padding: '0.4rem 0.8rem', 
                        borderRadius: '8px', 
                        border: '1px solid #eee',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        backgroundColor: 'white'
                      }}
                    >
                      <Eye size={16} />
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem'
        }} onClick={() => setSelectedOrder(null)}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Order Details</h2>
              <button onClick={() => setSelectedOrder(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
              <div>
                <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#888', marginBottom: '0.5rem' }}>Customer</h3>
                <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>{selectedOrder.customer_name}</p>
                <p style={{ fontSize: '0.85rem', color: '#666' }}>ID: #{selectedOrder.id.slice(0, 8)}</p>
              </div>
              <div>
                <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#888', marginBottom: '0.5rem' }}>Status</h3>
                <span style={{ 
                  backgroundColor: getStatusColor(selectedOrder.status) + '22', 
                  color: getStatusColor(selectedOrder.status), 
                  padding: '0.4rem 0.8rem', 
                  borderRadius: '99px',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>{selectedOrder.status}</span>
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#888', marginBottom: '1rem' }}>Items Ordered</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {selectedOrder.items?.map((item: any, idx: number) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid #f0f0f0' }}>
                    <span>{item.quantity}x {item.name}</span>
                    <span style={{ fontWeight: 600 }}>£{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ backgroundColor: '#f8f8f8', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <span>Total Amount</span>
                <span style={{ fontWeight: 700 }}>£{selectedOrder.total_price.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <span>Payment Mode</span>
                <span>{selectedOrder.is_downpayment ? '40% Downpayment' : 'Full Payment'}</span>
              </div>
              {selectedOrder.is_downpayment && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed #ddd', color: 'var(--primary)', fontWeight: 700 }}>
                  <span>Amount Paid (Due Now)</span>
                  <span>£{(selectedOrder.amount_due_now || (selectedOrder.total_price * 0.4)).toLocaleString()}</span>
                </div>
              )}
              {selectedOrder.applied_coupon && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', color: '#22c55e', fontSize: '0.85rem' }}>
                  <span>Coupon Applied</span>
                  <span>{selectedOrder.applied_coupon}</span>
                </div>
              )}
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#888', marginBottom: '0.5rem' }}>Update Status</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {['pending', 'preparing', 'delivered', 'cancelled'].map(s => (
                  <button 
                    key={s}
                    onClick={async () => {
                      const { error } = await supabase.from('orders').update({ status: s }).eq('id', selectedOrder.id);
                      if (!error) {
                        setSelectedOrder({...selectedOrder, status: s});
                        fetchOrders();
                      }
                    }}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      border: '1px solid #ddd',
                      backgroundColor: selectedOrder.status === s ? '#f0f0f0' : 'white',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      textTransform: 'capitalize'
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
