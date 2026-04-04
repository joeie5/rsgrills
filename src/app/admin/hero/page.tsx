'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Save, Layout, Clock, MapPin, Phone, Type, Info, Megaphone, Image as ImageIcon } from 'lucide-react';

export default function AdminHeroSettings() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
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

    // Sanitize: remove metadata fields that shouldn't be manually updated
    const { id, updated_at, ...cleanData } = settings;

    const { error } = await supabase
      .from('site_settings')
      .update(cleanData)
      .match({ id: id });

    if (error) {
      alert('Error saving settings: ' + error.message);
    } else {
      alert('Settings saved successfully!');
    }
    setSaving(false);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('branding')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('branding')
        .getPublicUrl(filePath);

      setSettings({ ...settings, logo_url: publicUrl });
    } catch (error: any) {
      alert('Error uploading logo: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div>Loading settings...</div>;

  return (
    <div>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Site Branding & Hero</h1>
        <p style={{ color: '#666' }}>Manage the first impression your customers see.</p>
      </header>

      <div style={{ maxWidth: '800px' }}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layout size={20} /> Main Hero Content
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Hero Title (Your Brand Name)</label>
                <input 
                  type="text" 
                  value={settings.hero_title} 
                  onChange={e => setSettings({ ...settings, hero_title: e.target.value })} 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Hero Subtitle (Tagline)</label>
                <input 
                  type="text" 
                  value={settings.hero_subtitle} 
                  onChange={e => setSettings({ ...settings, hero_subtitle: e.target.value })} 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} 
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Logo Text (Initial)</label>
                  <input 
                    type="text" 
                    maxLength={1}
                    value={settings.logo_text} 
                    onChange={e => setSettings({ ...settings, logo_text: e.target.value })} 
                    style={{ width: '60px', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', textAlign: 'center', fontSize: '1.25rem', fontWeight: 'bold' }} 
                  />
                  <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.5rem' }}>Used if no logo image is provided.</p>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Logo Image</label>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ 
                      width: '60px', 
                      height: '60px', 
                      borderRadius: '8px', 
                      border: '1px solid #ddd', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      backgroundColor: '#f9f9f9',
                      overflow: 'hidden'
                    }}>
                      {settings.logo_url ? (
                        <img src={settings.logo_url} alt="Logo Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      ) : (
                        <ImageIcon size={24} color="#ccc" />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleLogoUpload}
                        disabled={uploading}
                        style={{ display: 'none' }}
                        id="logo-upload"
                      />
                      <label 
                        htmlFor="logo-upload"
                        style={{ 
                          display: 'inline-block',
                          padding: '0.5rem 1rem',
                          backgroundColor: '#f0f0f0',
                          borderRadius: '6px',
                          cursor: uploading ? 'not-allowed' : 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: 600
                        }}
                      >
                        {uploading ? 'Uploading...' : 'Upload Logo'}
                      </label>
                      <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.4rem' }}>
                        Recommended: Transparent PNG (200x200px)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={20} /> Contact & Hours
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Opening Hours</label>
                <input 
                  type="text" 
                  value={settings.working_hours} 
                  onChange={e => setSettings({ ...settings, working_hours: e.target.value })} 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Location Text</label>
                <input 
                  type="text" 
                  value={settings.location_text} 
                  onChange={e => setSettings({ ...settings, location_text: e.target.value })} 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Phone Number</label>
                <input 
                  type="text" 
                  value={settings.phone_number} 
                  onChange={e => setSettings({ ...settings, phone_number: e.target.value })} 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} 
                />
              </div>
            </div>
          </div>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Megaphone size={20} /> Top Announcement Bar
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <label style={{ fontWeight: 600 }}>Show Top Bar</label>
                <input 
                  type="checkbox" 
                  checked={settings.is_top_bar_visible} 
                  onChange={e => setSettings({ ...settings, is_top_bar_visible: e.target.checked })}
                  style={{ width: '20px', height: '20px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Announcement Text</label>
                <input 
                  type="text" 
                  value={settings.top_bar_text || ''} 
                  onChange={e => setSettings({ ...settings, top_bar_text: e.target.value })} 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} 
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Background Color</label>
                  <input 
                    type="color" 
                    value={settings.top_bar_bg_color || '#121212'} 
                    onChange={e => setSettings({ ...settings, top_bar_bg_color: e.target.value })} 
                    style={{ width: '100%', height: '40px', padding: '2px', cursor: 'pointer' }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Text Color</label>
                  <input 
                    type="color" 
                    value={settings.top_bar_text_color || '#FFFFFF'} 
                    onChange={e => setSettings({ ...settings, top_bar_text_color: e.target.value })} 
                    style={{ width: '100%', height: '40px', padding: '2px', cursor: 'pointer' }} 
                  />
                </div>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Info size={20} /> Footer Information
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Footer Brand Name</label>
                <input 
                  type="text" 
                  value={settings.footer_brand_name || ''} 
                  onChange={e => setSettings({ ...settings, footer_brand_name: e.target.value })} 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} 
                  placeholder="e.g. RSGrills Catering"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Support Email</label>
                <input 
                  type="email" 
                  value={settings.footer_email || ''} 
                  onChange={e => setSettings({ ...settings, footer_email: e.target.value })} 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} 
                  placeholder="e.g. support@rsgrills.com"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Copyright Text</label>
                <input 
                  type="text" 
                  value={settings.footer_copyright || ''} 
                  onChange={e => setSettings({ ...settings, footer_copyright: e.target.value })} 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} 
                  placeholder="© 2026 RSGrills Catering"
                />
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
              cursor: saving ? 'not-allowed' : 'pointer'
            }}
          >
            <Save size={20} />
            {saving ? 'Saving Changes...' : 'Save Site Settings'}
          </button>
        </form>
      </div>
    </div>
  );
}
