'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import SiteLayout from '@/components/SiteLayout/SiteLayout';
import styles from '@/app/page.module.css';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

function MediaContent() {
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === 'Escape') setSelectedIndex(null);
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex]);

  const handleNext = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % media.length);
  };

  const handlePrev = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex - 1 + media.length) % media.length);
  };

  useEffect(() => {
    async function fetchMedia() {
      const { data } = await supabase
        .from('media_gallery')
        .select('*')
        .order('display_order', { ascending: true });
      if (data) setMedia(data);
      setLoading(false);
    }
    fetchMedia();
  }, []);

  return (
    <div className="container" style={{ padding: '4rem 1rem' }}>
      <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>Our Gallery</h1>
        <p style={{ color: '#666', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem' }}>
          A visual journey through some of our favorite catering setups and culinary creations.
        </p>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <p>Loading our gallery...</p>
        </div>
      ) : (
        <>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '1.5rem',
            paddingBottom: '4rem'
          }}>
            {media.map((item, index) => (
              <div 
                key={item.id} 
                onClick={() => setSelectedIndex(index)}
                style={{ 
                  position: 'relative', 
                  borderRadius: '24px', 
                  overflow: 'hidden',
                  aspectRatio: '1/1',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  backgroundColor: '#f5f5f5',
                  cursor: 'pointer'
                }}
              >
                <img 
                  src={item.image_url} 
                  alt={item.caption || 'Gallery Image'} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />
                <div style={{ 
                  position: 'absolute', 
                  inset: 0, 
                  background: 'rgba(0,0,0,0)',
                  transition: 'background 0.3s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.1)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0)'}
                />
                {item.caption && (
                  <div style={{ 
                    position: 'absolute', 
                    bottom: 0, 
                    left: 0, 
                    right: 0, 
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                    color: 'white',
                    padding: '2rem 1.5rem 1rem',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    opacity: 0,
                    transition: 'opacity 0.3s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseOut={(e) => e.currentTarget.style.opacity = '0'}
                  >
                    {item.caption}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Lightbox Viewer */}
          {selectedIndex !== null && (
            <div 
              onClick={() => setSelectedIndex(null)}
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)', // Sophisticated light overlay
                zIndex: 10000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(30px)', // High-end frost effect
                WebkitBackdropFilter: 'blur(30px)',
                cursor: 'pointer',
                animation: 'fadeIn 0.3s ease-out'
              }}
            >
              {/* Animation Styles */}
              <style dangerouslySetInnerHTML={{ __html: `
                @keyframes fadeIn {
                  from { opacity: 0; }
                  to { opacity: 1; }
                }
                @keyframes scaleUp {
                  from { transform: scale(0.95); opacity: 0; }
                  to { transform: scale(1); opacity: 1; }
                }
              `}} />

              {/* Main Modal Container */}
              <div 
                onClick={(e) => e.stopPropagation()}
                style={{ 
                  width: '90%',
                  maxWidth: '850px', 
                  maxHeight: '85vh', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  animation: 'scaleUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  position: 'relative',
                  cursor: 'default',
                  padding: '20px',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '32px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 50px 100px -20px rgba(0, 0, 0, 0.5)',
                }}
              >
                {/* Close Button (Top Right of Modal) */}
                <button 
                  onClick={() => setSelectedIndex(null)}
                  style={{ 
                    position: 'absolute',
                    top: '-15px',
                    right: '-15px',
                    color: 'white', 
                    background: '#121212', 
                    border: '1px solid rgba(255,255,255,0.2)', 
                    borderRadius: '50%',
                    padding: '8px',
                    cursor: 'pointer', 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 10px 15px rgba(0,0,0,0.3)',
                    zIndex: 10002
                  }}
                >
                  <X size={20} />
                </button>

                {/* Navigation Controls (Flanking the image within the modal or just outside) */}
                <button 
                  onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                  style={{ 
                    position: 'absolute', 
                    left: '-30px', 
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'white', 
                    background: 'rgba(255,255,255,0.1)', 
                    border: '1px solid rgba(255,255,255,0.2)', 
                    borderRadius: '50%', 
                    padding: '12px', 
                    cursor: 'pointer', 
                    transition: 'all 0.2s',
                    zIndex: 10001,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                >
                  <ChevronLeft size={24} />
                </button>

                <button 
                  onClick={(e) => { e.stopPropagation(); handleNext(); }}
                  style={{ 
                    position: 'absolute', 
                    right: '-30px', 
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'white', 
                    background: 'rgba(255,255,255,0.1)', 
                    border: '1px solid rgba(255,255,255,0.2)', 
                    borderRadius: '50%', 
                    padding: '12px', 
                    cursor: 'pointer', 
                    transition: 'all 0.2s',
                    zIndex: 10001,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                >
                  <ChevronRight size={24} />
                </button>

                {/* Sub-container for the image itself to control dimensions */}
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <img 
                    src={media[selectedIndex].image_url} 
                    alt={media[selectedIndex].caption}
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '65vh', 
                      objectFit: 'contain', 
                      borderRadius: '20px', 
                    }} 
                  />
                  
                  {/* Minimalist Caption Bar */}
                  {media[selectedIndex].caption && (
                    <div style={{
                      marginTop: '1.5rem',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      backdropFilter: 'blur(5px)',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      maxWidth: '90%',
                    }}>
                      <p style={{ color: 'white', fontSize: '0.95rem', fontWeight: 600, textAlign: 'center', margin: 0, letterSpacing: '0.02em' }}>
                        {media[selectedIndex].caption}
                      </p>
                    </div>
                  )}
                  
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontWeight: 700, marginTop: '1rem', letterSpacing: '0.1em' }}>
                    {selectedIndex + 1} / {media.length}
                  </p>
                </div>
              </div>
            </div>
          )}

          {media.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: '#f9f9f9', borderRadius: '24px' }}>
              <p style={{ color: '#888' }}>Our gallery is coming soon. Please check back later!</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function MediaPage() {
  return (
    <SiteLayout>
      <MediaContent />
    </SiteLayout>
  );
}
