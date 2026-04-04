import React from 'react';
import { Clock, MapPin, Phone } from 'lucide-react';
import styles from './Hero.module.css';

const Hero = ({ settings }: { settings?: any }) => {
  const displaySettings = {
    hero_title: settings?.hero_title || "RSGrills Catering Services",
    hero_subtitle: settings?.hero_subtitle || "",
    logo_text: settings?.logo_text || "R",
    working_hours: settings?.working_hours || "",
    location_text: settings?.location_text || "",
    phone_number: settings?.phone_number || ""
  };

  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.logoWrapper}>
          {/* Main Hero Logo */}
          <div className={styles.largeLogo}>
            <span className={styles.logoText}>{displaySettings.logo_text}</span>
          </div>
        </div>
        
        <h2 className={styles.title}>{displaySettings.hero_title}</h2>
        <p className={styles.subtitle}>{displaySettings.hero_subtitle}</p>
        
        <div className={styles.infoGrid}>
          <div className={styles.infoPill}>
            <Clock size={16} className={styles.icon} />
            <span>{displaySettings.working_hours}</span>
          </div>
          <div className={styles.infoPill}>
            <MapPin size={16} className={styles.icon} />
            <span>{displaySettings.location_text}</span>
          </div>
          <a href={`tel:${displaySettings.phone_number.replace(/\s+/g, '')}`} className={styles.infoPill}>
            <Phone size={16} className={styles.icon} />
            <span>{displaySettings.phone_number}</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
