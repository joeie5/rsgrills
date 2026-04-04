'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Save, Phone, MapPin, Clock, Mail, Info } from 'lucide-react';

export default function AdminContact() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('site_settings')
      .select('*')
      .limit(1)
      .single();
    
    if (data) setSettings(data);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { id, updated_at, ...cleanData } = settings;

    const { error } = await supabase
      .from('site_settings')
      .update(cleanData)
      .match({ id: id });

    if (error) {
      alert('Error saving contact info: ' + error.message);
    } else {
      alert('Contact information updated successfully!');
    }
    setSaving(false);
  };

  if (loading) return <div>Loading settings...</div>;

  return (
    <div>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Contact Information</h1>
        <p style={{ color: '#666' }}>Update the details your customers use to reach you.</p>
      </header>

      <div style={{ maxWidth: '800px' }}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Info size={20} /> Official Contact Details
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                  <input 
                    type="text" 
                    value={settings.phone_number} 
                    onChange={e => setSettings({ ...settings, phone_number: e.target.value })} 
                    style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid #ddd' }} 
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Support Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                  <input 
                    type="email" 
                    value={settings.footer_email} 
                    onChange={e => setSettings({ ...settings, footer_email: e.target.value })} 
                    style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid #ddd' }} 
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Office Address</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                  <input 
                    type="text" 
                    value={settings.location_text} 
                    onChange={e => setSettings({ ...settings, location_text: e.target.value })} 
                    style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid #ddd' }} 
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Working Hours</label>
                <div style={{ position: 'relative' }}>
                  <Clock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                  <input 
                    type="text" 
                    value={settings.working_hours} 
                    onChange={e => setSettings({ ...settings, working_hours: e.target.value })} 
                    style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid #ddd' }} 
                  />
                </div>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={saving}
            style={{ 
              backgroundColor: 'var(--primary)', 
              color: 'white', 
              padding: '1rem', 
              borderRadius: '12px', 
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              cursor: saving ? 'not-allowed' : 'pointer',
              border: 'none'
            }}
          >
            <Save size={20} />
            {saving ? 'Saving...' : 'Update Contact Information'}
          </button>
        </form>
      </div>
    </div>
  );
}
