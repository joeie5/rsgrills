'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Edit, Trash, MapPin } from 'lucide-react';

export default function AdminPickupLocations() {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    opening_hours: 'Mon-Sat: 9am - 7pm',
    price: '0'
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('pickup_locations')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (data) setLocations(data);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanData = {
      name: formData.name,
      address: formData.address,
      opening_hours: formData.opening_hours,
      price: parseFloat(formData.price as string) || 0
    };

    if (editingLocation) {
      const { error } = await supabase
        .from('pickup_locations')
        .update(cleanData)
        .match({ id: editingLocation.id });
      if (error) {
        alert('Error updating location: ' + error.message);
      } else {
        fetchLocations();
      }
    } else {
      const { error } = await supabase
        .from('pickup_locations')
        .insert([cleanData]);
      if (error) {
        alert('Error adding location: ' + error.message);
      } else {
        fetchLocations();
      }
    }
    
    setIsModalOpen(false);
    setEditingLocation(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this pickup location?')) {
      const { error } = await supabase.from('pickup_locations').delete().match({ id });
      if (!error) fetchLocations();
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
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Pickup Locations</h1>
        <button 
          onClick={() => {
            setEditingLocation(null);
            setFormData({ name: '', address: '', opening_hours: 'Mon-Sat: 9am - 7pm', price: '0' });
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
          Add Location
        </button>
      </header>

      {loading ? (
        <div>Loading locations...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
          {locations.map(loc => (
            <div key={loc.id} style={{ 
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
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{loc.name}</h3>
                  <p style={{ fontSize: '0.85rem', color: '#666' }}>{loc.address}</p>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.25rem' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>{loc.opening_hours}</p>
                    <p style={{ fontSize: '0.75rem', color: '#888', fontWeight: 700 }}>Fee: £{loc.price?.toLocaleString() || '0.00'}</p>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={() => {
                    setEditingLocation(loc);
                    setFormData({ 
                      name: loc.name, 
                      address: loc.address, 
                      opening_hours: loc.opening_hours,
                      price: loc.price?.toString() || '0'
                    });
                    setIsModalOpen(true);
                  }}
                  style={{ padding: '0.5rem', color: '#555' }}
                >
                  <Edit size={20} />
                </button>
                <button 
                  onClick={() => handleDelete(loc.id)}
                  style={{ padding: '0.5rem', color: '#ff4444' }}
                >
                  <Trash size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Location Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'white', width: '100%', maxWidth: '450px', borderRadius: '16px', padding: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>{editingLocation ? 'Edit Location' : 'Add New Location'}</h2>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Location Name</label>
                <input 
                  required 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })} 
                  placeholder="e.g. Peterborough City Centre"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Full Address</label>
                <textarea 
                  required 
                  value={formData.address} 
                  onChange={e => setFormData({ ...formData, address: e.target.value })} 
                  placeholder="Street name, postcode, etc."
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', minHeight: '80px', fontFamily: 'inherit' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Opening Hours</label>
                <input 
                  required 
                  type="text" 
                  value={formData.opening_hours} 
                  onChange={e => setFormData({ ...formData, opening_hours: e.target.value })} 
                  placeholder="e.g. Mon-Sat: 9am - 7pm"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Pickup Fee (£)</label>
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
                <button type="submit" style={{ flex: 1, backgroundColor: 'var(--primary)', color: 'white', padding: '0.75rem', borderRadius: '8px', fontWeight: 600 }}>Save Location</button>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, backgroundColor: '#eee', padding: '0.75rem', borderRadius: '8px', fontWeight: 600 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
