'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { LayoutDashboard, ShoppingCart, Package, Map, MapPin, LogOut, Ticket, Settings, Image as ImageIcon, Briefcase } from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        router.push('/admin/login');
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === 'SIGNED_OUT' || (event === 'INITIAL_SESSION' && !session)) {
        router.push('/admin/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/admin/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  // If on Login page, don't show the sidebar wrapper
  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Admin Sidebar */}
      <aside style={{ 
        width: '260px', 
        backgroundColor: '#121212', 
        color: 'white', 
        padding: '2rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        position: 'fixed',
        height: '100vh'
      }}>
        <div style={{ padding: '0 1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>Admin Panel</h2>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <NavLink href="/admin/dashboard" icon={<LayoutDashboard size={20} />} label="Overview" />
          <NavLink href="/admin/hero" icon={<LayoutDashboard size={20} />} label="Site Branding" />
          <NavLink href="/admin/services" icon={<Briefcase size={20} />} label="Services" />
          <NavLink href="/admin/media" icon={<ImageIcon size={20} />} label="Media Gallery" />
          <NavLink href="/admin/products" icon={<Package size={20} />} label="Products" />
          <NavLink href="/admin/categories" icon={<Package size={20} />} label="Categories" />
          <NavLink href="/admin/pickup" icon={<MapPin size={20} />} label="Pickup Locations" />
          <NavLink href="/admin/orders" icon={<ShoppingCart size={20} />} label="Orders" />
          <NavLink href="/admin/coupons" icon={<Ticket size={20} />} label="Coupons" />
          <NavLink href="/admin/contact" icon={<Settings size={20} />} label="Contact Details" />
        </nav>

        <button 
          onClick={handleSignOut}
          style={{ 
            marginTop: 'auto', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem', 
            padding: '1rem',
            color: '#ff4444',
            fontWeight: 600,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            width: '100%',
            textAlign: 'left',
            borderRadius: '8px',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 68, 68, 0.1)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </aside>

      {/* Main Admin Content */}
      <main style={{ marginLeft: '260px', flex: 1, padding: '2rem' }}>
        {children}
      </main>
    </div>
  );
}

function NavLink({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) {
  return (
    <Link 
      href={href} 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.75rem', 
        padding: '0.75rem 1rem', 
        borderRadius: '8px',
        color: '#ccc',
        transition: 'all 0.2s',
        fontSize: '0.95rem'
      }}
    >
      {icon}
      {label}
    </Link>
  );
}
