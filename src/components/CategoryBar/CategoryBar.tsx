import React from 'react';
import styles from './CategoryBar.module.css';

interface CategoryBarProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryBar = ({ categories, activeCategory, onCategoryChange }: CategoryBarProps) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.scrollContainer}>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`${styles.categoryBtn} ${
              activeCategory === category ? styles.active : ''
            }`}
          >
            {category}
          </button>
        ))}
      </div>
      <div className={styles.scrollIndicator}>
          {/* Visual indicator for horizontal scroll */}
          <div className={styles.scrollTrack}></div>
      </div>
    </div>
  );
};

export default CategoryBar;
