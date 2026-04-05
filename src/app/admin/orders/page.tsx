'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ShoppingBag, Search, Eye, Filter, X } from 'lucide-react';
import styles from './Orders.module.css';

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
    <div className={styles.container}>
      <header className={styles.ordersHeader}>
        <h1 className={styles.title}>Manage Orders</h1>
        
        <div className={styles.filterSection}>
          <Filter size={20} color="#888" />
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className={styles.filterSelect}
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
        <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>Loading orders...</div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem', backgroundColor: 'white', borderRadius: '16px' }}>
          <ShoppingBag size={48} style={{ margin: '0 auto 1rem', opacity: 0.1 }} />
          <p style={{ color: '#888' }}>No orders found matching this filter.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className={styles.tableContainer}>
            <table className={styles.ordersTable}>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} className={styles.orderRow}>
                    <td style={{ fontSize: '0.85rem', color: '#888' }}>#{order.id.slice(0, 8)}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{order.customer_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#666' }}>{order.delivery_zones?.name || 'Pickup'}</div>
                    </td>
                    <td style={{ fontWeight: 700 }}>£{order.total_price.toLocaleString()}</td>
                    <td style={{ fontSize: '0.85rem' }}>{new Date(order.created_at).toLocaleDateString()}</td>
                    <td style={{ fontSize: '0.85rem', maxWidth: '180px' }}>
                       <div style={{ 
                         whiteSpace: 'nowrap', 
                         overflow: 'hidden', 
                         textOverflow: 'ellipsis',
                         color: '#666'
                       }} title={order.items?.map((i: any) => `${i.quantity}x ${i.name}`).join(', ')}>
                         {order.items?.map((i: any) => `${i.quantity}x ${i.name}`).join(', ') || 'No items'}
                       </div>
                    </td>
                    <td>
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
                    <td>
                      <button onClick={() => setSelectedOrder(order)} className={styles.viewBtn}>
                        <Eye size={16} />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className={styles.orderCards}>
            {orders.map(order => (
              <div key={order.id} className={styles.orderCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardId}>#{order.id.slice(0, 8)}</div>
                  <div className={styles.cardAmount}>£{order.total_price.toLocaleString()}</div>
                </div>
                
                <div className={styles.cardInfo}>
                  <div className={styles.customerName}>{order.customer_name}</div>
                  <div className={styles.deliveryZone}>{order.delivery_zones?.name || 'Pickup'}</div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                   <span style={{ 
                    backgroundColor: getStatusColor(order.status) + '22', 
                    color: getStatusColor(order.status), 
                    padding: '0.3rem 0.75rem', 
                    borderRadius: '8px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase'
                  }}>
                    {order.status}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#888', alignSelf: 'center' }}>
                    {new Date(order.created_at).toLocaleDateString()}
                  </span>
                </div>

                <button 
                  onClick={() => setSelectedOrder(order)} 
                  className={styles.viewBtn}
                  style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', padding: '0.75rem' }}
                >
                  <Eye size={18} />
                  View Details
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className={styles.modalOverlay} onClick={() => setSelectedOrder(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Order Details</h2>
              <button 
                onClick={() => setSelectedOrder(null)} 
                style={{ color: '#888', cursor: 'pointer', padding: '0.5rem' }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '1.5rem', 
              marginBottom: '2rem' 
            }}>
              <div>
                <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#888', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>Customer</h3>
                <p style={{ fontWeight: 700, fontSize: '1.1rem', margin: 0 }}>{selectedOrder.customer_name}</p>
                <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.2rem' }}>ID: #{selectedOrder.id.slice(0, 8)}</p>
              </div>
              <div>
                <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#888', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Current Status</h3>
                <span style={{ 
                  backgroundColor: getStatusColor(selectedOrder.status) + '22', 
                  color: getStatusColor(selectedOrder.status), 
                  padding: '0.4rem 1rem', 
                  borderRadius: '99px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  textTransform: 'uppercase'
                }}>{selectedOrder.status}</span>
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#888', marginBottom: '1rem', letterSpacing: '0.05em' }}>Items Ordered</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {selectedOrder.items?.map((item: any, idx: number) => (
                  <div key={idx} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    paddingBottom: '0.75rem', 
                    borderBottom: '1px solid #f5f5f5' 
                  }}>
                    <span style={{ fontSize: '0.95rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--primary)', marginRight: '0.5rem' }}>{item.quantity}x</span> 
                      {item.name}
                    </span>
                    <span style={{ fontWeight: 600 }}>£{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ backgroundColor: '#f9f9f9', padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                <span style={{ color: '#666' }}>Subtotal Amount</span>
                <span style={{ fontWeight: 700 }}>£{selectedOrder.total_price.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                <span style={{ color: '#666' }}>Payment Method</span>
                <span style={{ fontWeight: 600 }}>{selectedOrder.is_downpayment ? '40% Downpayment' : 'Full Payment'}</span>
              </div>
              
              {selectedOrder.is_downpayment && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginTop: '0.75rem', 
                  paddingTop: '0.75rem', 
                  borderTop: '1px dashed #ddd', 
                  color: 'var(--primary)', 
                  fontWeight: 800,
                  fontSize: '1.05rem'
                }}>
                  <span>Paid Now (40%)</span>
                  <span>£{(selectedOrder.amount_due_now || (selectedOrder.total_price * 0.4)).toLocaleString()}</span>
                </div>
              )}
              
              {selectedOrder.applied_coupon && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', color: '#22c55e', fontSize: '0.85rem', fontWeight: 600 }}>
                  <span>Coupon Applied ({selectedOrder.applied_coupon})</span>
                  <span>Discounted</span>
                </div>
              )}
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#888', marginBottom: '1rem', letterSpacing: '0.05em' }}>Update Status</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
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
                      padding: '0.6rem 1.2rem',
                      borderRadius: '10px',
                      border: '1px solid',
                      borderColor: selectedOrder.status === s ? 'var(--primary)' : '#ddd',
                      backgroundColor: selectedOrder.status === s ? 'var(--primary)' : 'white',
                      color: selectedOrder.status === s ? 'white' : '#666',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                      transition: 'all 0.2s'
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
