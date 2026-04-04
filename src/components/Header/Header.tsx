import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Header.module.css';

interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
  settings?: any;
}

const Header = ({ cartCount, onCartClick, settings }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

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

        {/* Desktop Navigation Menu */}
        <nav className={styles.navMenu}>
          <Link href="/" className={styles.navLink}>HOME</Link>
          <Link href="/services" className={styles.navLink}>SERVICES</Link>
          <Link href="/media" className={styles.navLink}>MEDIA</Link>
          <Link href="/contact" className={styles.navLink}>CONTACT</Link>
        </nav>
        
        <div className={styles.actions}>
          <button 
            className={styles.cartBtn} 
            aria-label="View Cart"
            onClick={onCartClick}
            type="button"
          >
            <ShoppingBag size={24} />
            {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
          </button>

          <button 
            className={styles.menuToggle} 
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Close Menu" : "Open Menu"}
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
              className={styles.overlay}
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={styles.mobileMenu}
            >
              <nav className={styles.mobileNav}>
                <Link href="/" className={styles.mobileNavLink} onClick={closeMenu}>HOME</Link>
                <Link href="/services" className={styles.mobileNavLink} onClick={closeMenu}>SERVICES</Link>
                <Link href="/media" className={styles.mobileNavLink} onClick={closeMenu}>MEDIA</Link>
                <Link href="/contact" className={styles.mobileNavLink} onClick={closeMenu}>CONTACT</Link>
              </nav>

              <div className={styles.mobileFooter}>
                <p>© {new Date().getFullYear()} RSGrills Catering</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
