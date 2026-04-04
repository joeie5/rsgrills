'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { LayoutDashboard, ShoppingCart, Package, MapPin, LogOut, Ticket, Settings, Image as ImageIcon, Briefcase, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './AdminLayout.module.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session && !isLoginPage) {
        router.push('/admin/login');
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === 'SIGNED_OUT' || (event === 'INITIAL_SESSION' && !session)) {
        if (!isLoginPage) router.push('/admin/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [router, isLoginPage]);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/admin/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Loading...</div>;

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className={styles.adminWrapper}>
      {/* Mobile Header */}
      <header className={styles.mobileHeader}>
        <button className={styles.menuToggle} onClick={() => setIsSidebarOpen(true)}>
          <Menu size={24} />
        </button>
        <span className={styles.mobileBrand}>RSGrills Admin</span>
        <div style={{ width: 40 }} /> {/* Spacer */}
      </header>

      {/* Overlay for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.overlay} 
            onClick={() => setIsSidebarOpen(false)} 
          />
        )}
      </AnimatePresence>

      {/* Admin Sidebar */}
      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>Admin Panel</h2>
          <button 
            className={styles.menuToggle} 
            onClick={() => setIsSidebarOpen(false)}
            style={{ color: 'white', display: isSidebarOpen ? 'flex' : 'none' }}
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className={styles.navSection}>
          <NavLink href="/admin/dashboard" icon={<LayoutDashboard size={20} />} label="Overview" active={pathname === '/admin/dashboard'} />
          <NavLink href="/admin/hero" icon={<LayoutDashboard size={20} />} label="Site Branding" active={pathname === '/admin/hero'} />
          <NavLink href="/admin/services" icon={<Briefcase size={20} />} label="Services" active={pathname === '/admin/services'} />
          <NavLink href="/admin/media" icon={<ImageIcon size={20} />} label="Media Gallery" active={pathname === '/admin/media'} />
          <NavLink href="/admin/products" icon={<Package size={20} />} label="Products" active={pathname === '/admin/products'} />
          <NavLink href="/admin/categories" icon={<Package size={20} />} label="Categories" active={pathname === '/admin/categories'} />
          <NavLink href="/admin/pickup" icon={<MapPin size={20} />} label="Pickup Locations" active={pathname === '/admin/pickup'} />
          <NavLink href="/admin/orders" icon={<ShoppingCart size={20} />} label="Orders" active={pathname === '/admin/orders'} />
          <NavLink href="/admin/coupons" icon={<Ticket size={20} />} label="Coupons" active={pathname === '/admin/coupons'} />
          <NavLink href="/admin/contact" icon={<Settings size={20} />} label="Contact Details" active={pathname === '/admin/contact'} />
        </nav>

        <button onClick={handleSignOut} className={styles.signOutBtn}>
          <LogOut size={20} />
          Sign Out
        </button>
      </aside>

      {/* Main Admin Content */}
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}

function NavLink({ href, icon, label, active }: { href: string, icon: React.ReactNode, label: string, active: boolean }) {
  return (
    <Link 
      href={href} 
      className={`${styles.navLink} ${active ? styles.activeLink : ''}`}
    >
      {icon}
      {label}
    </Link>
  );
}
