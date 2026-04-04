'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, Edit, Save, X, Briefcase, Image as ImageIcon } from 'lucide-react';

export default function AdminServices() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: '', description: '', image_url: '', display_order: 0 });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (data) setServices(data);
    setLoading(false);
  };

  const handleToggleAdd = () => {
    setIsAdding(!isAdding);
    setEditingId(null);
    setFormData({ title: '', description: '', image_url: '', display_order: 0 });
  };

  const handleEdit = (service: any) => {
    setEditingId(service.id);
    setIsAdding(false);
    setFormData({ 
      title: service.title, 
      description: service.description || '', 
      image_url: service.image_url || '', 
      display_order: service.display_order || 0 
    });
  };

  const handleSave = async () => {
    if (!formData.title) return alert('Title is required');

    if (editingId) {
      const { error } = await supabase
        .from('services')
        .update(formData)
        .eq('id', editingId);
      if (error) alert(error.message);
    } else {
      const { error } = await supabase
        .from('services')
        .insert([formData]);
      if (error) alert(error.message);
    }

    setEditingId(null);
    setIsAdding(false);
    fetchServices();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (error) alert(error.message);
    fetchServices();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `service-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(fileName);

      setFormData({ ...formData, image_url: publicUrl });
    } catch (error: any) {
      alert('Error uploading image: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div>Loading services...</div>;

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Manage Services</h1>
          <p style={{ color: '#666' }}>Showcase what your catering brand offers.</p>
        </div>
        <button 
          onClick={handleToggleAdd}
          style={{ 
            backgroundColor: 'var(--primary)', 
            color: 'white', 
            padding: '0.75rem 1.5rem', 
            borderRadius: '12px', 
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          {isAdding ? <X size={20} /> : <Plus size={20} />}
          {isAdding ? 'Cancel' : 'Add New Service'}
        </button>
      </header>

      {(isAdding || editingId) && (
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>
            {editingId ? 'Edit Service' : 'New Service'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Service Title</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={e => setFormData({ ...formData, title: e.target.value })} 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} 
                  placeholder="e.g. Wedding Catering"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Description</label>
                <textarea 
                  value={formData.description} 
                  onChange={e => setFormData({ ...formData, description: e.target.value })} 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', minHeight: '100px' }} 
                  placeholder="Tell clients about this service..."
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Display Order</label>
                <input 
                  type="number" 
                  value={formData.display_order} 
                  onChange={e => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })} 
                  style={{ width: '100px', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} 
                />
              </div>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Service Image</label>
              <div style={{ 
                border: '2px dashed #ddd', 
                borderRadius: '12px', 
                padding: '1rem', 
                textAlign: 'center',
                backgroundColor: '#f9f9f9',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem'
              }}>
                {formData.image_url ? (
                  <img src={formData.image_url} alt="Preview" style={{ maxWidth: '100%', maxHeight: '180px', borderRadius: '8px', objectFit: 'cover' }} />
                ) : (
                  <ImageIcon size={48} color="#ccc" />
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  id="service-image-upload" 
                  style={{ display: 'none' }} 
                />
                <label 
                  htmlFor="service-image-upload" 
                  style={{ 
                    cursor: uploading ? 'not-allowed' : 'pointer', 
                    color: 'var(--primary)', 
                    fontWeight: 600 
                  }}
                >
                  {uploading ? 'Uploading...' : 'Choose Image'}
                </label>
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
            <button 
              onClick={handleSave}
              style={{ backgroundColor: '#121212', color: 'white', padding: '0.75rem 2rem', borderRadius: '12px', fontWeight: 600, border: 'none', cursor: 'pointer' }}
            >
              <Save size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
              Save Service
            </button>
            <button 
              onClick={handleToggleAdd}
              style={{ backgroundColor: '#eee', color: '#666', padding: '0.75rem 2rem', borderRadius: '12px', fontWeight: 600, border: 'none', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
        {services.map(service => (
          <div key={service.id} style={{ backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', position: 'relative' }}>
            {service.image_url && (
              <img src={service.image_url} alt={service.title} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
            )}
            <div style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{service.title}</h3>
              <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem', height: '4.5em', overflow: 'hidden' }}>
                {service.description}
              </p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={() => handleEdit(service)}
                  style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                >
                  <Edit size={16} /> Edit
                </button>
                <button 
                  onClick={() => handleDelete(service.id)}
                  style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: '1px solid #ff4444', color: '#ff4444', backgroundColor: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
            <div style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: 'rgba(255,255,255,0.9)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
              Order: {service.display_order}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
