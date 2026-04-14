'use client';

import React, { useState, useEffect } from 'react';
import Hero from '@/components/Hero/Hero';
import CategoryBar from '@/components/CategoryBar/CategoryBar';
import ProductCard from '@/components/ProductCard/ProductCard';
import SiteLayout, { useCart } from '@/components/SiteLayout/SiteLayout';
import { supabase } from '@/lib/supabase';
import styles from '@/app/page.module.css';

function HomeContent() {
  const [categories, setCategories] = useState<string[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const { siteSettings, addToCart } = useCart();

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      const [catsRes, prodsRes] = await Promise.all([
        supabase.from('categories').select('*').order('display_order', { ascending: true }),
        supabase.from('products').select('*, categories(name)')
      ]);

      if (catsRes.data) {
        const catNames = catsRes.data.map(c => c.name);
        setCategories(['All', ...catNames]);
      }
      if (prodsRes.data) setProducts(prodsRes.data);
    } catch (err) {
      console.error('Home data fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => {
    if (activeCategory === 'All') return true;
    return p.categories?.name === activeCategory;
  });

  return (
    <>
      <Hero settings={siteSettings} />
      
      <div className={styles.stickyBar}>
        <CategoryBar 
          categories={categories} 
          activeCategory={activeCategory} 
          onCategoryChange={setActiveCategory} 
        />
      </div>

      <div className="container">
        <section className={styles.menuSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Our Menu</h2>
            <p className={styles.sectionSubtitle}>Discover our mouth-watering offerings</p>
          </div>

          {loading ? (
            <div className={styles.noResults}>
               <p>Loading products...</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {filteredProducts.map(product => (
                <ProductCard 
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  category={product.categories?.name || ''}
                  price={product.price}
                  size={product.size}
                  images={product.image_urls || []}
                  isCombo={product.is_combo}
                  comboOptions={product.combo_options}
                  onAdd={(id, qty, comboSelections) => addToCart(product, qty, comboSelections)}
                />
              ))}
            </div>
          )}

          {!loading && filteredProducts.length === 0 && (
            <div className={styles.noResults}>
               <p>No products found in this category.</p>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

export default function Storefront() {
  return (
    <SiteLayout>
      <HomeContent />
    </SiteLayout>
  );
}
