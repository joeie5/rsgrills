'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import CartSidebar from '@/components/CartSidebar/CartSidebar';
import { supabase } from '@/lib/supabase';
import styles from '@/app/page.module.css';

interface CartContextType {
  cartItems: any[];
  addToCart: (product: any, quantity: number) => void;
  updateQuantity: (id: string, delta: number) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  siteSettings: any;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a SiteLayout');
  return context;
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const [siteSettings, setSiteSettings] = useState<any>(null);
  const [zones, setZones] = useState<any[]>([]);
  const [pickupLocations, setPickupLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('rsgrills_cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Error loading cart:', e);
      }
    }
    setIsInitialized(true);
    fetchBaseData();
  }, []);

  const fetchBaseData = async () => {
    try {
      setLoading(true);
      const [ssRes, znRes, plRes] = await Promise.all([
        supabase.from('site_settings').select('*').limit(1).single(),
        supabase.from('delivery_zones').select('*').order('price', { ascending: true }),
        supabase.from('pickup_locations').select('*').order('display_order', { ascending: true })
      ]);

      if (ssRes.data) setSiteSettings(ssRes.data);
      if (znRes.data) setZones(znRes.data);
      if (plRes.data) setPickupLocations(plRes.data);
    } catch (err) {
      console.error('Base data fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('rsgrills_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isInitialized]);

  // Prevent background scrolling when store is closed or cart is open
  useEffect(() => {
    const isLocked = siteSettings?.is_store_open === false || isCartOpen;
    
    if (isLocked) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.style.height = '100vh';
    } else {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
      document.body.style.height = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
      document.body.style.height = 'unset';
    };
  }, [siteSettings?.is_store_open, isCartOpen]);

  const addToCart = (product: any, quantity: number) => {
    if (siteSettings?.is_store_open === false) return;
    
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(prev => 
      prev.map(item => {
        if (item.id === id) {
          const newQty = Math.max(0, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(item => item.quantity > 0)
    );
  };

  if (loading || !siteSettings) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        gap: '2rem'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: '#121212',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"></path>
            <line x1="6" y1="17" x2="18" y2="17"></line>
          </svg>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#121212', margin: 0 }}>Loading Store...</p>
        </div>
      </div>
    );
  }

  return (
    <CartContext.Provider value={{ cartItems, addToCart, updateQuantity, isCartOpen, setIsCartOpen, siteSettings }}>
      <div className={styles.main}>
        {siteSettings?.is_top_bar_visible && (
          <div style={{
            backgroundColor: siteSettings.top_bar_bg_color || '#121212',
            color: siteSettings.top_bar_text_color || '#FFFFFF',
            padding: '0.6rem 1rem',
            textAlign: 'center',
            fontSize: '0.85rem',
            fontWeight: 600,
            position: 'relative',
            zIndex: 1001
          }}>
            {siteSettings.top_bar_text}
          </div>
        )}
        <Header 
          cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)} 
          onCartClick={() => setIsCartOpen(true)} 
          settings={siteSettings}
        />

        <main style={{ minHeight: '80vh' }}>
          {children}
        </main>

        <Footer settings={siteSettings} />

        {siteSettings && siteSettings.is_store_open === false && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '2rem',
            textAlign: 'center'
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '3rem 2rem',
              borderRadius: '24px',
              maxWidth: '450px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                backgroundColor: '#FFF5F5', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                color: '#F56565'
              }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2D3748', marginBottom: '1rem' }}>Store Temporarily Closed</h2>
              <p style={{ color: '#718096', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                We are not taking orders for now. Please check back later or visit our social media for updates.
              </p>
              <div style={{ 
                padding: '1rem', 
                backgroundColor: '#F7FAFC', 
                borderRadius: '12px',
                fontSize: '0.9rem',
                color: '#4A5568',
                fontWeight: 600
              }}>
                Thanks for your patience! 🍱
              </div>
            </div>
          </div>
        )}

        <CartSidebar 
          isOpen={isCartOpen} 
          onClose={() => setIsCartOpen(false)}
          items={cartItems}
          onUpdateQuantity={updateQuantity}
          onRemove={(id) => {
            const item = cartItems.find(i => i.id === id);
            if (item) updateQuantity(id, -item.quantity);
          }}
          onClearCart={() => setCartItems([])}
          deliveryZones={zones}
          pickupLocations={pickupLocations}
        />
      </div>
    </CartContext.Provider>
  );
}
