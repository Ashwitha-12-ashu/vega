import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Shield, MapPin, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: '#090d16',
        color: 'var(--slate-300)',
        padding: '4.5rem 0 2rem',
        marginTop: 'auto',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '3rem',
            marginBottom: '3.5rem',
          }}
        >
          {/* Brand Col */}
          <div>
            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1rem',
                textDecoration: 'none',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)',
                }}
              >
                <Sparkles size={18} />
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  letterSpacing: '-0.02em',
                }}
              >
                VEGA
              </span>
            </Link>
            <p style={{ fontSize: '0.875rem', color: 'var(--slate-400)', lineHeight: 1.6, maxWidth: '280px' }}>
              The Smart Local Service Platform. Connecting you with trusted, verified nearby professionals in real-time.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.875rem', marginBottom: '1.25rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Discover
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.875rem' }}>
              <li><Link to="/explore" style={{ color: 'var(--slate-400)' }}>Explore Categories</Link></li>
              <li><Link to="/nearby" style={{ color: 'var(--slate-400)' }}>Nearby Service Providers</Link></li>
              <li><Link to="/become-provider" style={{ color: 'var(--slate-400)' }}>Become a Provider</Link></li>
            </ul>
          </div>

          {/* Popular Services */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.875rem', marginBottom: '1.25rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Services
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.875rem' }}>
              <li><Link to="/nearby?category=electrician" style={{ color: 'var(--slate-400)' }}>Electricians & Wiring</Link></li>
              <li><Link to="/nearby?category=plumber" style={{ color: 'var(--slate-400)' }}>Plumbing & Drainage</Link></li>
              <li><Link to="/nearby?category=cleaning" style={{ color: 'var(--slate-400)' }}>Deep Cleaning</Link></li>
              <li><Link to="/nearby?category=ac-repair" style={{ color: 'var(--slate-400)' }}>AC & Appliance Repair</Link></li>
            </ul>
          </div>

          {/* Trust & Safety */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.875rem', marginBottom: '1.25rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Trust & Security
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', fontSize: '0.8125rem', color: 'var(--slate-400)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={16} color="#10b981" />
                <span>100% Background Verified Pros</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={16} color="#6366f1" />
                <span>Real-Time GPS Proximity Match</span>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            paddingTop: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.8125rem',
            color: 'var(--slate-500)',
          }}
        >
          <p>© {new Date().getFullYear()} VEGA Platform Inc. All rights reserved.</p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            Built with <Heart size={14} color="#ef4444" fill="#ef4444" /> for connected local communities.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
