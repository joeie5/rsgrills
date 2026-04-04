import React from 'react';
import styles from '@/app/page.module.css';

const Footer = ({ settings }: { settings: any }) => {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footerContent}>
          <div className={styles.footerBrand}>
            <h3>{settings?.footer_brand_name || settings?.hero_title || "RSGrills Catering"}</h3>
            <p>{settings?.footer_copyright || `© ${new Date().getFullYear()} RSGrills Catering. All rights reserved.`}</p>
          </div>
          <div className={styles.footerLinks}>
            <a href={`mailto:${settings?.footer_email || ''}`}>{settings?.footer_email || ''}</a>
            <a href={`tel:${settings?.phone_number || ''}`}>{settings?.phone_number || ''}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
