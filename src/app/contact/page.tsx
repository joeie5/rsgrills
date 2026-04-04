'use client';

import React from 'react';
import SiteLayout, { useCart } from '@/components/SiteLayout/SiteLayout';
import { Phone, Mail, MapPin, Clock, MessageCircle, Send } from 'lucide-react';
import styles from '@/app/page.module.css';

function ContactContent() {
  const { siteSettings } = useCart();

  const handleWhatsApp = () => {
    const phone = siteSettings?.phone_number || '';
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=Hi, I would like to inquire about your catering services.`, '_blank');
  };

  return (
    <div className="container" style={{ padding: '4rem 1rem' }}>
      <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>Get in Touch</h1>
        <p style={{ color: '#666', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem' }}>
          Have a question or ready to book your next event? We'd love to hear from you.
        </p>
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
        gap: '4rem',
        alignItems: 'start'
      }}>
        {/* Contact Info Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Our Details</h2>
          <p style={{ color: '#666', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            We're available for consultations and bookings during our official working hours.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <ContactInfoCard 
              icon={<Phone color="var(--primary)" />} 
              title="Call Us" 
              value={siteSettings?.phone_number || 'Not provided'} 
              subtitle="Give us a call anytime"
              href={`tel:${siteSettings?.phone_number || ''}`}
            />
            <ContactInfoCard 
              icon={<Mail color="var(--primary)" />} 
              title="Email Us" 
              value={siteSettings?.footer_email || 'Not provided'} 
              subtitle="We respond within 24 hours"
              href={`mailto:${siteSettings?.footer_email || ''}`}
            />
            <ContactInfoCard 
              icon={<MapPin color="var(--primary)" />} 
              title="Visit Us" 
              value={siteSettings?.location_text || 'Not provided'} 
              subtitle="Our main office location"
            />
            <ContactInfoCard 
              icon={<Clock color="var(--primary)" />} 
              title="Working Hours" 
              value={siteSettings?.working_hours || 'Not provided'} 
              subtitle="When we're open"
            />
          </div>
        </div>

        {/* Contact Action Card */}
        <div style={{ 
          backgroundColor: '#121212', 
          color: 'white', 
          padding: '3rem', 
          borderRadius: '32px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem'
        }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '20px', 
            backgroundColor: 'rgba(255,255,255,0.1)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <MessageCircle size={32} color="var(--primary)" />
          </div>
          
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>Instant Inquiry</h2>
            <p style={{ color: '#aaa', lineHeight: 1.6 }}>
              The fastest way to get a quote is to message us directly on WhatsApp. Click the button below to start a conversation.
            </p>
          </div>

          <button 
            onClick={handleWhatsApp}
            style={{ 
              backgroundColor: 'var(--primary)', 
              color: 'white', 
              padding: '1.25rem', 
              borderRadius: '16px', 
              fontWeight: 800, 
              fontSize: '1.1rem',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '1rem',
              border: 'none',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Send size={24} />
            Message on WhatsApp
          </button>

          <p style={{ fontSize: '0.85rem', color: '#666', textAlign: 'center' }}>
            We'll get back to you as soon as possible with a personalized quote for your event.
          </p>
        </div>
      </div>
    </div>
  );
}

function ContactInfoCard({ icon, title, value, subtitle, href }: any) {
  const content = (
     <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', padding: '1rem', borderRadius: '16px', transition: 'background 0.2s', backgroundColor: '#f9f9f9' }}>
        <div style={{ 
          width: '52px', 
          height: '52px', 
          borderRadius: '12px', 
          backgroundColor: 'white', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
        }}>
          {icon}
        </div>
        <div>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#888', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</h3>
          <p style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#121212' }}>{value}</p>
          {subtitle && <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.2rem' }}>{subtitle}</p>}
        </div>
    </div>
  );

  if (href) return <a href={href} style={{ textDecoration: 'none' }}>{content}</a>;
  return content;
}

export default function ContactPage() {
  return (
    <SiteLayout>
      <ContactContent />
    </SiteLayout>
  );
}
