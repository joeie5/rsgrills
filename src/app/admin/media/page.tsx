'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, Image as ImageIcon, X, Upload } from 'lucide-react';

export default function AdminMedia() {
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ image_url: '', caption: '', display_order: 0 });

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('media_gallery')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (data) setMedia(data);
    setLoading(false);
  };

  const handleToggleAdd = () => {
    setIsAdding(!isAdding);
    setFormData({ image_url: '', caption: '', display_order: 0 });
  };

  const handleSave = async () => {
    if (!formData.image_url) return alert('Image is required');

    const { error } = await supabase
      .from('media_gallery')
      .insert([formData]);
    
    if (error) {
      alert(error.message);
    } else {
      setIsAdding(false);
      fetchMedia();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    const { error } = await supabase.from('media_gallery').delete().eq('id', id);
    if (error) alert(error.message);
    fetchMedia();
  };

  const processImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1600;
          const MAX_HEIGHT = 1600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Canvas conversion failed'));
          }, 'image/jpeg', 0.85);
        };
        img.onerror = () => reject(new Error('Image load failed'));
      };
      reader.onerror = () => reject(new Error('File read failed'));
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      const filesArray = Array.from(files);
      
      for (let i = 0; i < filesArray.length; i++) {
        const file = filesArray[i];
        setUploadStatus(`Processing ${i + 1} of ${filesArray.length}...`);
        
        // Optimize image before upload
        const optimizedBlob = await processImage(file);
        
        const fileExt = 'jpg'; 
        const fileName = `gallery-${Date.now()}-${i}.${fileExt}`;
        
        setUploadStatus(`Uploading ${i + 1} of ${filesArray.length}...`);
        
        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(fileName, optimizedBlob, {
            contentType: 'image/jpeg',
            upsert: true
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(fileName);

        // Auto-insert into Media Gallery table for bulk convenience
        const { error: insertError } = await supabase
          .from('media_gallery')
          .insert([{
            image_url: publicUrl,
            caption: '', // Default to empty caption for bulk
            display_order: media.length + i + 1
          }]);
          
        if (insertError) throw insertError;
      }
      
      setUploadStatus('All images uploaded successfully!');
      setTimeout(() => setUploadStatus(''), 2000);
      fetchMedia();
    } catch (error: any) {
      alert('Error during bulk upload: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div>Loading media...</div>;

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Media Gallery</h1>
          <p style={{ color: '#666' }}>Manage images for your catering portfolio.</p>
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
          {isAdding ? 'Cancel' : 'Add New Image'}
        </button>
      </header>

      {isAdding && (
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Upload New Image</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Caption (Optional)</label>
                <input 
                  type="text" 
                  value={formData.caption} 
                  onChange={e => setFormData({ ...formData, caption: e.target.value })} 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} 
                  placeholder="e.g. Wedding Setup at Lagos Island"
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
              <button 
                onClick={handleSave}
                style={{ backgroundColor: '#121212', color: 'white', padding: '1rem', borderRadius: '12px', fontWeight: 600, border: 'none', cursor: 'pointer', marginTop: '1rem' }}
              >
                <Plus size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                Add to Gallery
              </button>
            </div>
            
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
                <img src={formData.image_url} alt="Preview" style={{ maxWidth: '100%', maxHeight: '250px', borderRadius: '8px', objectFit: 'cover' }} />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                  <ImageIcon size={48} color="#ccc" />
                  <p style={{ color: '#888' }}>Upload multiple high-quality images at once.</p>
                </div>
              )}
              <input 
                type="file" 
                accept="image/*" 
                multiple
                onChange={handleImageUpload} 
                id="gallery-image-upload" 
                style={{ display: 'none' }} 
              />
              <label 
                htmlFor="gallery-image-upload" 
                style={{ 
                  cursor: uploading ? 'not-allowed' : 'pointer', 
                  backgroundColor: '#eee',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  fontWeight: 600 
                }}
              >
                {uploading ? uploadStatus || 'Uploading...' : 'Bulk Choose Files'}
              </label>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
        {media.map(item => (
          <div key={item.id} style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
            <img src={item.image_url} alt={item.caption} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' }} />
            {item.caption && (
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.7)', color: 'white', padding: '0.75rem', fontSize: '0.85rem' }}>
                {item.caption}
              </div>
            )}
            <button 
              onClick={() => handleDelete(item.id)}
              style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'rgba(255,255,255,0.9)', color: '#ff4444', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}
            >
              <Trash2 size={18} />
            </button>
            <div style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: 'rgba(18,18,18,0.8)', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>
              #{item.display_order}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
