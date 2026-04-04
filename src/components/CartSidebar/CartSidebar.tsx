'use client';

import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Truck, MapPin, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import styles from './CartSidebar.module.css';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onClearCart: () => void;
  deliveryZones: { id: string; name: string; price: number }[];
  pickupLocations: { id: string; name: string; address: string; opening_hours: string; price: number }[];
}

const CartSidebar = ({ 
  isOpen, 
  onClose, 
  items, 
  onUpdateQuantity, 
  onRemove,
  onClearCart,
  deliveryZones,
  pickupLocations 
}: CartSidebarProps) => {
  const [step, setStep] = useState(1); // 1: Review, 2: Method, 3: Zone/Location, 4: Name
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup' | null>(null);
  const [selectedZone, setSelectedZone] = useState<{ id: string; name: string; price: number } | null>(null);
  const [selectedPickup, setSelectedPickup] = useState<{ id: string; name: string; address: string; opening_hours: string; price: number } | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [paymentMode, setPaymentMode] = useState<'full' | '40_percent'>('full');
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; percentage: number } | null>(null);
  const [isCouponsLoading, setIsCouponsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = appliedCoupon ? (subtotal * appliedCoupon.percentage) / 100 : 0;
  const discountedSubtotal = subtotal - discountAmount;
  const deliveryFee = deliveryType === 'delivery' && selectedZone ? selectedZone.price : (deliveryType === 'pickup' && selectedPickup ? selectedPickup.price : 0);
  const total = discountedSubtotal + deliveryFee;
  const amountDueNow = paymentMode === '40_percent' ? total * 0.4 : total;

  useEffect(() => {
    // Reset coupon if items change
    setAppliedCoupon(null);
  }, [items]);

  useEffect(() => {
    // Force full payment if a coupon is applied
    if (appliedCoupon) {
      setPaymentMode('full');
    }
  }, [appliedCoupon]);

  if (!isOpen) return null;

  const handleStep2Select = (type: 'delivery' | 'pickup') => {
    setDeliveryType(type);
    setStep(3);
  };

  const handleApplyCoupon = async () => {
    if (!couponInput) return;
    setIsCouponsLoading(true);
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', couponInput.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error || !data) {
      alert('Invalid or inactive coupon code');
      setAppliedCoupon(null);
    } else {
      const now = new Date();
      const validFrom = new Date(data.valid_from);
      const validUntil = data.valid_until ? new Date(data.valid_until) : null;

      if (now < validFrom || (validUntil && now > validUntil)) {
        alert('This coupon is not valid at this time');
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon({ code: data.code, percentage: data.percentage_off });
      }
    }
    setIsCouponsLoading(false);
  };

  const handleSubmitOrder = async () => {
    if (!customerName || !deliveryType) return;
    setIsSubmitting(true);

    try {
      // 1. Attempt to Save to Supabase (Dashboard Sync)
      let orderId = 'NEW';
      const { data, error: dbError } = await supabase.from('orders').insert([{
        customer_name: customerName,
        total_price: total,
        status: 'pending',
        delivery_zone_id: deliveryType === 'delivery' ? selectedZone?.id : null,
        pickup_location_id: deliveryType === 'pickup' ? selectedPickup?.id : null,
        items: items,
        subtotal: subtotal,
        delivery_fee: deliveryFee,
        is_downpayment: paymentMode === '40_percent',
        amount_due_now: amountDueNow,
        applied_coupon: appliedCoupon?.code || null
      }]).select().single();

      if (dbError) {
        console.error('Database sync failed:', dbError);
        const errorDetails = `Error ${dbError.code}: ${dbError.message}${dbError.details ? ` (${dbError.details})` : ''}`;
        alert(`Dashboard Sync Warning!\n\n${errorDetails}\n\nYou can proceed to WhatsApp, but the dashboard record might be missing.`);
      } else if (data) {
        orderId = data.id.slice(0, 8);
      }

      // 2. Generate WhatsApp Message
      const itemsList = items.map(i => `• ${i.name} (x${i.quantity}) - £${(i.price * i.quantity).toLocaleString()}`).join('\n');
      const orderSummary = `
*New Order from ${customerName}*
--------------------------
*Items:*
${itemsList}

*Subtotal:* £${subtotal.toLocaleString()}
${appliedCoupon ? `*Discount (${appliedCoupon.percentage}%):* -£${discountAmount.toLocaleString()}` : ''}
*${deliveryType === 'delivery' ? 'Delivery' : 'Pickup'} Fee:* £${deliveryFee.toLocaleString()}
--------------------------
*Total:* £${total.toLocaleString()}
*Payment:* ${paymentMode === 'full' ? 'Full Payment' : '40% Downpayment'}
*Amount Due Now:* £${amountDueNow.toLocaleString()}

*Order Ref:* #${orderId}
`.trim();

      const encodedMessage = encodeURIComponent(orderSummary);
      const whatsappUrl = `https://wa.me/2347025206883?text=${encodedMessage}`;

      // 3. Cleanup
      localStorage.removeItem('rsgrills_cart');
      onClearCart();
      onClose();

      // 4. Redirect
      window.open(whatsappUrl, '_blank');
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sidebar} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={24} />
          </button>
          <div className={styles.headerTitle}>
             {step > 1 && (
               <button className={styles.backBtn} onClick={() => setStep(step - 1)}>
                  <ArrowLeft size={18} />
               </button>
             )}
             <h2>{step === 1 ? 'Your Cart' : step === 2 ? 'Method' : step === 3 ? (deliveryType === 'delivery' ? 'Select Zone' : 'Select Pickup Point') : 'Checkout'}</h2>
          </div>
        </header>

        <div className={styles.content}>
          {step === 1 && (
            <div className={styles.itemList}>
              {items.length === 0 ? (
                <div className={styles.emptyCart}>
                  <ShoppingBag size={64} className={styles.emptyIcon} />
                  <p>Your cart is empty</p>
                  <button className={styles.continueBtn} onClick={onClose}>Continue Shopping</button>
                </div>
              ) : (
                items.map(item => (
                  <div key={item.id} className={styles.item}>
                    <div className={styles.itemInfo}>
                      <h3>{item.name}</h3>
                      <p>£{item.price.toLocaleString()}</p>
                    </div>
                    <div className={styles.controls}>
                      <button onClick={() => onUpdateQuantity(item.id, -1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => onUpdateQuantity(item.id, 1)}>+</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {step === 2 && (
            <div className={styles.options}>
              <button 
                className={`${styles.optionBtn} ${deliveryType === 'delivery' ? styles.activeOption : ''}`}
                onClick={() => handleStep2Select('delivery')}
              >
                <div className={styles.optionContent}>
                   <Truck size={24} />
                   <div>
                     <strong>Home Delivery</strong>
                     <p>Get it delivered to your doorstep</p>
                   </div>
                </div>
              </button>
              
              <button 
                className={`${styles.optionBtn} ${deliveryType === 'pickup' ? styles.activeOption : ''}`}
                onClick={() => handleStep2Select('pickup')}
              >
                <div className={styles.optionContent}>
                   <MapPin size={24} />
                   <div>
                     <strong>Pickup</strong>
                     <p>Collect from our Peterborough location</p>
                   </div>
                </div>
              </button>
            </div>
          )}

          {step === 3 && (
            <div className={styles.zoneList}>
              {deliveryType === 'delivery' ? (
                deliveryZones.map(zone => (
                  <button 
                    key={zone.id} 
                    className={`${styles.zoneBtn} ${selectedZone?.id === zone.id ? styles.activeZone : ''}`}
                    onClick={() => {
                      setSelectedZone(zone);
                      setStep(4);
                    }}
                  >
                    <span>{zone.name}</span>
                    <strong>£{zone.price.toLocaleString()}</strong>
                  </button>
                ))
              ) : (
                pickupLocations.map(loc => (
                  <button 
                    key={loc.id} 
                    className={`${styles.zoneBtn} ${selectedPickup?.id === loc.id ? styles.activeZone : ''}`}
                    style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '1rem' }}
                    onClick={() => {
                      setSelectedPickup(loc);
                      setStep(4);
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700 }}>{loc.name}</span>
                      <strong style={{ color: 'var(--primary)', fontSize: '0.85rem' }}>£{loc.price?.toLocaleString() || '0.00'}</strong>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#666', fontWeight: 400 }}>{loc.address}</span>
                  </button>
                ))
              )}
            </div>
          )}

          {step === 4 && (
            <div className={styles.form}>
               <div className={styles.formGroup}>
                 <label>Your Full Name</label>
                 <input 
                   type="text" 
                   value={customerName} 
                   onChange={(e) => setCustomerName(e.target.value)}
                   placeholder="Enter your name"
                 />
               </div>

               <div className={styles.couponSection}>
                 <label>Coupon Code</label>
                 <div className={styles.couponInputGroup}>
                   <input 
                     type="text" 
                     value={couponInput} 
                     onChange={(e) => setCouponInput(e.target.value)}
                     placeholder="Enter code"
                     disabled={!!appliedCoupon}
                   />
                   {appliedCoupon ? (
                     <button onClick={() => { setAppliedCoupon(null); setCouponInput(''); }} className={styles.removeCouponBtn}>Remove</button>
                   ) : (
                     <button onClick={handleApplyCoupon} disabled={isCouponsLoading || !couponInput}>Apply</button>
                   )}
                 </div>
                 {appliedCoupon && <p className={styles.couponSuccess}>Coupon "{appliedCoupon.code}" applied! ({appliedCoupon.percentage}% OFF)</p>}
               </div>

               <div className={styles.paymentSection}>
                 <label>Payment Option</label>
                 <div className={styles.paymentToggle}>
                   <button 
                     className={paymentMode === 'full' ? styles.activeToggle : ''} 
                     onClick={() => setPaymentMode('full')}
                   >
                     Full Payment
                   </button>
                   <button 
                     className={paymentMode === '40_percent' ? styles.activeToggle : ''} 
                     onClick={() => setPaymentMode('40_percent')}
                     disabled={!!appliedCoupon}
                   >
                     40% Downpayment
                   </button>
                 </div>
                 {appliedCoupon && <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>* Downpayment is not available with coupons.</p>}
               </div>
               
                {deliveryType === 'pickup' && selectedPickup && (
                  <div style={{ 
                    backgroundColor: '#f9f9f9', 
                    padding: '1rem', 
                    borderRadius: '12px', 
                    marginBottom: '1rem',
                    border: '1px solid #eee'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                       <MapPin size={18} />
                       <strong style={{ fontSize: '0.9rem' }}>{selectedPickup.name}</strong>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#666', lineHeight: '1.4' }}>
                      {selectedPickup.address}<br />
                      <span style={{ fontSize: '0.75rem' }}>({selectedPickup.opening_hours})</span>
                    </p>
                  </div>
                )}

               <div className={styles.summary}>
                 <div className={styles.summaryRow}>
                   <span>Subtotal</span>
                   <span>£{subtotal.toLocaleString()}</span>
                 </div>
                 {appliedCoupon && (
                   <div className={styles.summaryRow} style={{ color: '#22c55e', fontWeight: 600 }}>
                     <span>Discount ({appliedCoupon.percentage}%)</span>
                     <span>−£{discountAmount.toLocaleString()}</span>
                   </div>
                 )}
                 {deliveryType === 'delivery' && selectedZone && (
                   <div className={styles.summaryRow}>
                     <span>Delivery Fee ({selectedZone.name})</span>
                     <span>£{deliveryFee.toLocaleString()}</span>
                   </div>
                 )}
                 {deliveryType === 'pickup' && selectedPickup && (
                   <div className={styles.summaryRow}>
                     <span>Pickup Fee ({selectedPickup.name})</span>
                     <span>£{selectedPickup.price?.toLocaleString() || '0.00'}</span>
                   </div>
                 )}
                 <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                   <span>Total</span>
                   <span>£{total.toLocaleString()}</span>
                 </div>
                 {paymentMode === '40_percent' && (
                    <div className={`${styles.summaryRow} ${styles.dueNowRow}`}>
                      <span>Amount Due Now (40%)</span>
                      <span>£{amountDueNow.toLocaleString()}</span>
                    </div>
                 )}
               </div>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <footer className={styles.footer}>
            {step === 1 && (
              <button className={styles.primaryBtn} onClick={() => setStep(2)}>
                Checkout - £{subtotal.toLocaleString()}
              </button>
            )}
            
            {step === 2 && deliveryType && (
              <button className={styles.primaryBtn} onClick={() => setStep(3)}>
                {deliveryType === 'delivery' ? 'Select Zone' : 'Select Location'}
              </button>
            )}

            {step === 4 && (
              <button 
                className={styles.primaryBtn} 
                disabled={!customerName || isSubmitting}
                onClick={handleSubmitOrder}
              >
                {isSubmitting ? 'Processing...' : `Place Order - £${amountDueNow.toLocaleString()}`}
              </button>
            )}
          </footer>
        )}
      </div>
    </div>
  );
};

export default CartSidebar;
