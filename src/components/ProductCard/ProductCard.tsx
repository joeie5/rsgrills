import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus } from 'lucide-react';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  id: string;
  name: string;
  category: string;
  price: number;
  size: string;
  images: string[];
  isCombo?: boolean;
  comboOptions?: any[];
  onAdd: (id: string, quantity: number, comboSelections?: any) => void;
}

const ProductCard = ({ id, name, category, price, size, images, isCombo, comboOptions, onAdd }: ProductCardProps) => {
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const increment = () => setQuantity(prev => prev + 1);
  const decrement = () => setQuantity(prev => Math.max(1, prev - 1));

  const [showComboModal, setShowComboModal] = useState(false);
  const [comboSelections, setComboSelections] = useState<any>({});

  const handleAddClick = () => {
    if (isCombo) {
      setShowComboModal(true);
    } else {
      executeAdd();
    }
  };

  const executeAdd = () => {
    onAdd(id, quantity, isCombo ? comboSelections : undefined);
    setQuantity(1); // Reset quantity after adding
    setShowComboModal(false);
    setComboSelections({});
    
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  const handleSelection = (groupName: string, option: any, maxSelections: number) => {
    setComboSelections((prev: any) => {
      const current = prev[groupName] || [];
      const exists = current.find((o: any) => o.name === option.name);
      
      if (exists) {
        // remove
        return { ...prev, [groupName]: current.filter((o: any) => o.name !== option.name) };
      } else {
        // add if under limit
        if (current.length < maxSelections) {
          return { ...prev, [groupName]: [...current, option] };
        }
        // if at limit, replace the oldest selection
        return { ...prev, [groupName]: [...current.slice(1), option] };
      }
    });
  };

  const isComboValid = () => {
    if (!isCombo || !comboOptions) return true;
    for (const group of comboOptions) {
      // Only enforce 'required' if there are actually options to choose from!
      if (group.required && group.options && group.options.length > 0) {
        const selected = comboSelections[group.group_name] || [];
        if (selected.length === 0) return false;
      }
    }
    return true;
  };

  // Calculate dynamic price based on selections
  const currentPrice = price + Object.values(comboSelections).reduce((acc: number, group: any) => {
    return acc + group.reduce((sum: number, opt: any) => sum + (opt.price || 0), 0);
  }, 0);

  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        {/* Carousel Logic Placeholder */}
        <div className={styles.carousel}>
          {images.length > 0 ? (
             <img src={images[0]} alt={name} className={styles.image} />
          ) : (
            <div className={styles.imagePlaceholder}>
               <span className={styles.placeholderIcon}>🍽️</span>
            </div>
          )}
        </div>
        
        {/* Carousel Indicators */}
        {images.length > 1 && (
           <div className={styles.indicators}>
              {images.map((_, i) => (
                <div key={i} className={`${styles.dot} ${i === 0 ? styles.activeDot : ''}`}></div>
              ))}
           </div>
        )}
      </div>
      
      <div className={styles.content}>
        <p className={styles.category}>{category.toUpperCase()}</p>
        <h3 className={styles.name}>{name}</h3>
        <p className={styles.size}>{size}</p>
        
        <div className={styles.footer}>
          <span className={styles.price}>£{currentPrice.toLocaleString()}</span>
          {isCombo ? (
             <button 
               className={styles.addBtn}
               onClick={handleAddClick}
               type="button"
             >
               View
             </button>
          ) : (
            <div className={styles.quantityContainer}>
              <div className={styles.qtySelector}>
                <button onClick={decrement} className={styles.qtyBtn} type="button">−</button>
                <span className={styles.qtyValue}>{quantity}</span>
                <button onClick={increment} className={styles.qtyBtn} type="button">+</button>
              </div>
              <button 
                className={`${styles.addBtn} ${isAdded ? styles.addedBtn : ''}`}
                onClick={handleAddClick}
                aria-label={`Add ${name} to cart`}
                type="button"
                disabled={isAdded}
              >
                {isAdded ? 'Added ✓' : 'Add'}
              </button>
            </div>
          )}
        </div>
      </div>

      {mounted && showComboModal && createPortal(
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '500px', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
            <div style={{ padding: '1.5rem', backgroundColor: '#f9f9f9', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>{name} Combo</h3>
              <button onClick={() => setShowComboModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1 }}>&times;</button>
            </div>
            
            <div style={{ overflowY: 'auto', padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {comboOptions?.map((group, idx) => {
                const selected = comboSelections[group.group_name] || [];
                return (
                  <div key={idx} style={{ border: '1px solid #eee', borderRadius: '12px', padding: '1rem', backgroundColor: '#fff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{group.group_name}</h4>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {group.options.map((opt: any, optIdx: number) => {
                        const isSelected = selected.find((s: any) => s.name === opt.name);
                        return (
                          <label key={optIdx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', border: `2px solid ${isSelected ? 'var(--primary)' : '#eee'}`, borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: isSelected ? '#FFF5F5' : 'transparent' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <input 
                                type="checkbox" 
                                checked={!!isSelected}
                                onChange={() => handleSelection(group.group_name, opt, group.max_selections)}
                                style={{ accentColor: 'var(--primary)', width: '18px', height: '18px' }}
                              />
                              <span style={{ fontWeight: isSelected ? 700 : 500, fontSize: '0.95rem' }}>{opt.name}</span>
                            </div>
                            {opt.price > 0 && <span style={{ color: '#666', fontSize: '0.9rem', fontWeight: 600 }}>+£{opt.price.toLocaleString()}</span>}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div style={{ padding: '1.5rem', borderTop: '1px solid #eee', backgroundColor: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div style={{ display: 'flex', flexDirection: 'column' }}>
                 <span style={{ fontSize: '0.85rem', color: '#666' }}>Total</span>
                 <strong style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>£{(currentPrice * quantity).toLocaleString()}</strong>
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                 <div className={styles.qtySelector}>
                   <button onClick={decrement} className={styles.qtyBtn} type="button">−</button>
                   <span className={styles.qtyValue}>{quantity}</span>
                   <button onClick={increment} className={styles.qtyBtn} type="button">+</button>
                 </div>
                 <button 
                   onClick={executeAdd} 
                   disabled={!isComboValid() || isAdded}
                   style={{ 
                     backgroundColor: isComboValid() ? 'var(--primary)' : '#ccc', 
                     color: 'white', 
                     padding: '0.75rem 2rem', 
                     borderRadius: '999px', 
                     fontWeight: 700,
                     border: 'none',
                     cursor: isComboValid() ? 'pointer' : 'not-allowed',
                     transition: 'opacity 0.2s'
                   }}
                 >
                   {isAdded ? 'Added ✓' : 'Add to Cart'}
                 </button>
               </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ProductCard;
