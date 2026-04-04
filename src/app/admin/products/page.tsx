'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Edit, Trash, Package, Search, Image as ImageIcon, Loader2, X } from 'lucide-react';

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    size: '',
    category_id: '',
    image_urls: [] as string[],
    is_available: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: prods, error: pError } = await supabase.from('products').select('*, categories(name)');
    const { data: cats, error: cError } = await supabase.from('categories').select('*');
    
    if (prods) setProducts(prods);
    if (cats) setCategories(cats);
    setLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `product-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      setFormData(prev => ({
        ...prev,
        image_urls: [...prev.image_urls, publicUrl]
      }));
    } catch (error: any) {
      alert('Error uploading image: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (urlToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      image_urls: prev.image_urls.filter(url => url !== urlToRemove)
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanData = {
      name: formData.name,
      price: parseFloat(formData.price as string) || 0,
      size: formData.size,
      category_id: formData.category_id,
      image_urls: formData.image_urls,
      is_available: formData.is_available
    };

    if (editingProduct) {
      const { error } = await supabase.from('products').update(cleanData).match({ id: editingProduct.id });
      if (error) {
        alert('Error updating product: ' + error.message);
      } else {
        fetchData();
      }
    } else {
      const { error } = await supabase.from('products').insert([cleanData]);
      if (error) {
        alert('Error adding product: ' + error.message);
      } else {
        fetchData();
      }
    }
    
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      const { error } = await supabase.from('products').delete().match({ id });
      if (!error) fetchData();
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.categories?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Manage Products</h1>
        <button 
          onClick={() => {
            setEditingProduct(null);
            setFormData({ name: '', price: '', size: '', category_id: categories[0]?.id || '', image_urls: [], is_available: true });
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
          Add Product
        </button>
      </header>

      {/* Search Bar */}
      <div style={{ position: 'relative', marginBottom: '2rem' }}>
         <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
         <input 
           type="text" 
           placeholder="Search products or categories..." 
           value={search}
           onChange={(e) => setSearch(e.target.value)}
           style={{ 
             width: '100%', 
             padding: '0.75rem 1rem 0.75rem 3rem', 
             borderRadius: '12px', 
             border: '1px solid #ddd', 
             fontSize: '1rem' 
           }}
         />
      </div>

      {loading ? (
        <div>Loading products...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
          {filteredProducts.map(product => (
            <div key={product.id} style={{ 
              backgroundColor: 'white', 
              padding: '1.5rem', 
              borderRadius: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ width: '60px', height: '60px', backgroundColor: '#f0f0f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   {product.image_urls?.[0] ? <img src={product.image_urls[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} /> : <Package color="#ccc" />}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{product.name}</h3>
                  <p style={{ fontSize: '0.85rem', color: '#666' }}>{product.categories?.name} • {product.size} • £{product.price.toLocaleString()}</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={() => {
                    setEditingProduct(product);
                    setFormData({ 
                      name: product.name, 
                      price: product.price.toString(), 
                      size: product.size || '', 
                      category_id: product.category_id, 
                      image_urls: product.image_urls || [],
                      is_available: product.is_available ?? true 
                    });
                    setIsModalOpen(true);
                  }}
                  style={{ padding: '0.5rem', color: '#555' }}
                >
                  <Edit size={20} />
                </button>
                <button 
                  onClick={() => handleDelete(product.id)}
                  style={{ padding: '0.5rem', color: '#ff4444' }}
                >
                  <Trash size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'white', width: '100%', maxWidth: '500px', borderRadius: '16px', padding: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label>Product Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label>Price (£)</label>
                  <input required type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} />
                </div>
                <div>
                  <label>Size (e.g. 2 litres)</label>
                  <input required type="text" value={formData.size} onChange={e => setFormData({ ...formData, size: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} />
                </div>
              </div>
              <div>
                <label>Category</label>
                <select required value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}>
                   {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Product Images</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  {formData.image_urls.map((url, i) => (
                    <div key={i} style={{ position: 'relative', width: '80px', height: '80px' }}>
                      <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                      <button 
                        type="button"
                        onClick={() => removeImage(url)}
                        style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ff4444', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <label style={{ 
                    width: '80px', 
                    height: '80px', 
                    border: '2px dashed #ddd', 
                    borderRadius: '8px', 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center', 
                    justifyContent: 'center',
                    cursor: uploading ? 'not-allowed' : 'pointer' ,
                    color: '#888'
                  }}>
                    {uploading ? <Loader2 className="animate-spin" /> : <Plus size={24} />}
                    <span style={{ fontSize: '0.65rem', marginTop: '0.25rem' }}>{uploading ? 'Uploading...' : 'Add Image'}</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} disabled={uploading} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" style={{ flex: 1, backgroundColor: 'var(--primary)', color: 'white', padding: '0.75rem', borderRadius: '8px', fontWeight: 600 }}>Save Product</button>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, backgroundColor: '#eee', padding: '0.75rem', borderRadius: '8px', fontWeight: 600 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
