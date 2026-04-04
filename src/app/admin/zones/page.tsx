'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Edit, Trash, MapPin } from 'lucide-react';

export default function AdminZones() {
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    price: '0'
  });

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('delivery_zones')
      .select('*')
      .order('price', { ascending: true });
    
    if (data) setZones(data);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanData = {
      name: formData.name,
      price: parseFloat(formData.price as string) || 0
    };

    if (editingZone) {
      const { error } = await supabase
        .from('delivery_zones')
        .update(cleanData)
        .match({ id: editingZone.id });
      if (error) {
        alert('Error updating zone: ' + error.message);
      } else {
        fetchZones();
      }
    } else {
      const { error } = await supabase
        .from('delivery_zones')
        .insert([cleanData]);
      if (error) {
        alert('Error adding zone: ' + error.message);
      } else {
        fetchZones();
      }
    }
    
    setIsModalOpen(false);
    setEditingZone(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this delivery zone?')) {
      const { error } = await supabase.from('delivery_zones').delete().match({ id });
      if (!error) fetchZones();
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
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Delivery Zones</h1>
        <button 
          onClick={() => {
            setEditingZone(null);
            setFormData({ name: '', price: '0' });
            setIsModalOpen(true);
          }}
          style={{ 
            backgroundColor: 'var(--primary)', 
            color: 'white', 
            padding: '0.75rem 1.5rem', 
            borderRadius: '9999px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 600
          }}
        >
          <Plus size={20} />
          Add Zone
        </button>
      </header>

      {loading ? (
        <div>Loading zones...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
          {zones.map(zone => (
            <div key={zone.id} style={{ 
              backgroundColor: 'white', 
              padding: '1.5rem', 
              borderRadius: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#f0f0f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <MapPin size={20} color="#666" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{zone.name}</h3>
                  <p style={{ fontSize: '1rem', color: 'var(--primary)', fontWeight: 600 }}>£{zone.price.toLocaleString()}</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={() => {
                    setEditingZone(zone);
                    setFormData({ name: zone.name, price: zone.price.toString() });
                    setIsModalOpen(true);
                  }}
                  style={{ padding: '0.5rem', color: '#555' }}
                >
                  <Edit size={20} />
                </button>
                <button 
                  onClick={() => handleDelete(zone.id)}
                  style={{ padding: '0.5rem', color: '#ff4444' }}
                >
                  <Trash size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Zone Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'white', width: '100%', maxWidth: '400px', borderRadius: '16px', padding: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>{editingZone ? 'Edit Zone' : 'Add New Zone'}</h2>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Zone Name (e.g. PE1)</label>
                <input 
                  required 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })} 
                  placeholder="e.g. PE1 City Centre"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Delivery Fee (£)</label>
                <input 
                  required 
                  type="number" 
                  step="0.01"
                  value={formData.price} 
                  onChange={e => setFormData({ ...formData, price: e.target.value })} 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} 
                />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" style={{ flex: 1, backgroundColor: 'var(--primary)', color: 'white', padding: '0.75rem', borderRadius: '8px', fontWeight: 600 }}>Save Zone</button>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, backgroundColor: '#eee', padding: '0.75rem', borderRadius: '8px', fontWeight: 600 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
