import React from 'react';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import styles from './Header.module.css';

interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
  settings?: any;
}

const Header = ({ cartCount, onCartClick, settings }: HeaderProps) => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logoGroup}>
          <div className={styles.logoCircle}>
             {settings?.logo_url ? (
               <img 
                 src={settings.logo_url} 
                 alt={settings.hero_title || 'Logo'} 
                 style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }} 
               />
             ) : (
               <span className={styles.logoPlaceholder}>{settings?.logo_text || 'K'}</span>
             )}
          </div>
          <div className={styles.brandInfo}>
            <h1 className={styles.brandName}>{settings?.hero_title || "RSGrills"}</h1>
            <p className={styles.tagline}>{settings?.hero_subtitle || ""}</p>
          </div>
        </Link>

        {/* Navigation Menu */}
        <nav className={styles.navMenu}>
          <Link href="/" className={styles.navLink}>HOME</Link>
          <Link href="/services" className={styles.navLink}>SERVICES</Link>
          <Link href="/media" className={styles.navLink}>MEDIA</Link>
          <Link href="/contact" className={styles.navLink}>CONTACT</Link>
        </nav>
        
        <button 
          className={styles.cartBtn} 
          aria-label="View Cart"
          onClick={onCartClick}
          type="button"
        >
          <ShoppingBag size={24} />
          {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
        </button>
      </div>
    </header>
  );
};

export default Header;
