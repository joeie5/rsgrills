'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Edit, Trash, List } from 'lucide-react';

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    display_order: 0
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (data) setCategories(data);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      const { error } = await supabase
        .from('categories')
        .update(formData)
      if (error) {
        alert('Error updating category: ' + error.message);
      } else {
        fetchCategories();
      }
    } else {
      const { error } = await supabase
        .from('categories')
        .insert([formData]);
      if (error) {
        alert('Error adding category: ' + error.message);
      } else {
        fetchCategories();
      }
    }
    
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deleting this category will affect products assigned to it. Proceed?')) {
      const { error } = await supabase.from('categories').delete().match({ id });
      if (!error) fetchCategories();
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
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Manage Categories</h1>
        <button 
          onClick={() => {
            setEditingCategory(null);
            setFormData({ name: '', display_order: categories.length });
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
          Add Category
        </button>
      </header>

      {loading ? (
        <div>Loading categories...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
          {categories.map(category => (
            <div key={category.id} style={{ 
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
                   <List size={20} color="#666" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{category.name}</h3>
                  <p style={{ fontSize: '0.85rem', color: '#888' }}>Display Order: {category.display_order}</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={() => {
                    setEditingCategory(category);
                    setFormData({ name: category.name, display_order: category.display_order });
                    setIsModalOpen(true);
                  }}
                  style={{ padding: '0.5rem', color: '#555' }}
                >
                  <Edit size={20} />
                </button>
                <button 
                  onClick={() => handleDelete(category.id)}
                  style={{ padding: '0.5rem', color: '#ff4444' }}
                >
                  <Trash size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Category Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'white', width: '100%', maxWidth: '400px', borderRadius: '16px', padding: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Category Name</label>
                <input 
                  required 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })} 
                  placeholder="e.g. Rice Dishes"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Display Order</label>
                <input 
                  required 
                  type="number" 
                  value={formData.display_order} 
                  onChange={e => setFormData({ ...formData, display_order: parseInt(e.target.value) })} 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} 
                />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" style={{ flex: 1, backgroundColor: 'var(--primary)', color: 'white', padding: '0.75rem', borderRadius: '8px', fontWeight: 600 }}>Save</button>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, backgroundColor: '#eee', padding: '0.75rem', borderRadius: '8px', fontWeight: 600 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
