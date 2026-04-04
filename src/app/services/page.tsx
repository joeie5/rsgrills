'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import SiteLayout, { useCart } from '@/components/SiteLayout/SiteLayout';
import styles from '@/app/page.module.css';
import { MessageCircle, Send } from 'lucide-react';

function ServicesContent() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { siteSettings } = useCart();

  const handleWhatsApp = (serviceTitle: string) => {
    const phone = siteSettings?.phone_number || '';
    const cleanPhone = phone.replace(/\D/g, '');
    const message = encodeURIComponent(`Hi, I'm interested in the ${serviceTitle} service.`);
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  useEffect(() => {
    async function fetchServices() {
      const { data } = await supabase
        .from('services')
        .select('*')
        .order('display_order', { ascending: true });
      if (data) setServices(data);
      setLoading(false);
    }
    fetchServices();
  }, []);

  return (
    <div className="container" style={{ padding: '4rem 1rem' }}>
      <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>Our Services</h1>
        <p style={{ color: '#666', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem' }}>
          From intimate gatherings to grand celebrations, we provide exceptional catering tailored to your unique needs.
        </p>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <p>Loading our services...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6rem' }}>
          {services.map((service, index) => (
            <div key={service.id} style={{ 
              display: 'flex', 
              flexDirection: index % 2 === 0 ? 'row' : 'row-reverse',
              gap: '4rem',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              <div style={{ flex: '1 1 400px' }}>
                {service.image_url ? (
                  <img src={service.image_url} alt={service.title} style={{ width: '100%', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }} />
                ) : (
                  <div style={{ width: '100%', height: '300px', backgroundColor: '#f5f5f5', borderRadius: '24px' }}></div>
                )}
              </div>
              <div style={{ flex: '1 1 400px' }}>
                <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '1.5rem', color: '#121212' }}>{service.title}</h2>
                <p style={{ color: '#555', fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '2.5rem' }}>
                  {service.description}
                </p>
                <div style={{ 
                  marginTop: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                  alignItems: 'flex-start'
                }}>
                   <button 
                    onClick={() => handleWhatsApp(service.title)}
                    style={{ 
                      backgroundColor: 'var(--primary)', 
                      color: 'white', 
                      padding: '0.85rem 1.6rem', 
                      borderRadius: '12px', 
                      fontWeight: 700, 
                      fontSize: '0.95rem',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '0.75rem',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <MessageCircle size={20} />
                    Inquire on WhatsApp
                  </button>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '0.85rem', color: '#888' }}>
                    Available for custom quotes & event bookings.
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {services.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: '#f9f9f9', borderRadius: '24px' }}>
              <p style={{ color: '#888' }}>Our service lineup is coming soon. Please check back later!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ServicesPage() {
  return (
    <SiteLayout>
      <ServicesContent />
    </SiteLayout>
  );
}
