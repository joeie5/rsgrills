import React from 'react';
import { Plus } from 'lucide-react';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  id: string;
  name: string;
  category: string;
  price: number;
  size: string;
  images: string[];
  onAdd: (id: string, quantity: number) => void;
}

const ProductCard = ({ id, name, category, price, size, images, onAdd }: ProductCardProps) => {
  const [quantity, setQuantity] = React.useState(1);
  const [isAdded, setIsAdded] = React.useState(false);

  const increment = () => setQuantity(prev => prev + 1);
  const decrement = () => setQuantity(prev => Math.max(1, prev - 1));

  const handleAdd = () => {
    onAdd(id, quantity);
    setQuantity(1); // Reset quantity after adding
    
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

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
          <span className={styles.price}>£{price.toLocaleString()}</span>
          <div className={styles.quantityContainer}>
            <div className={styles.qtySelector}>
              <button onClick={decrement} className={styles.qtyBtn} type="button">−</button>
              <span className={styles.qtyValue}>{quantity}</span>
              <button onClick={increment} className={styles.qtyBtn} type="button">+</button>
            </div>
            <button 
              className={`${styles.addBtn} ${isAdded ? styles.addedBtn : ''}`}
              onClick={handleAdd}
              aria-label={`Add ${name} to cart`}
              type="button"
              disabled={isAdded}
            >
              {isAdded ? 'Added ✓' : 'Add'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
