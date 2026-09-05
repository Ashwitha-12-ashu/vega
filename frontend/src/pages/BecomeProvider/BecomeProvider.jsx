import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Sparkles, CheckCircle2, ShieldCheck, DollarSign, ArrowRight, Radio } from 'lucide-react';

const BecomeProvider = () => {
  const { user, isProvider, enableProviderMode } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleEnable = async () => {
    setLoading(true);
    try {
      await enableProviderMode(true);
      navigate('/my-talents');
    } catch (err) {
      showToast('Could not enable provider mode.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '3.5rem 1.5rem', maxWidth: '840px' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <Radio size={28} />
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--slate-900)' }}>
          Offer Your Talents on VEGA
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginTop: '0.5rem', maxWidth: '580px', margin: '0.5rem auto 0' }}>
          Turn your skills into income. Connect with customers looking for verified local service providers in your neighborhood.
        </p>
      </div>

      <div className="card" style={{ padding: '2.5rem', marginBottom: '2.5rem', boxShadow: 'var(--shadow-md)' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--slate-900)' }}>
          How Provider Mode Works:
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary-100)', color: 'var(--primary-700)', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              1
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                Add Multiple Talents
              </h3>
              <p style={{ color: 'var(--slate-600)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                You can list multiple skills under your account (e.g. Photography, Makeup, and Hair Styling) with tailored pricing and descriptions.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary-100)', color: 'var(--primary-700)', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              2
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                Active Single Talent Rule
              </h3>
              <p style={{ color: 'var(--slate-600)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                To give customers full commitment, you activate the exact talent you want to offer right now. Switching talent is instant.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary-100)', color: 'var(--primary-700)', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              3
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                Toggle ONLINE & Get Bookings
              </h3>
              <p style={{ color: 'var(--slate-600)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                Whenever you are available, toggle ONLINE. Customers searching nearby will find your profile, view distance, and request bookings.
              </p>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
          {isProvider ? (
            <button onClick={() => navigate('/my-talents')} className="btn btn-primary btn-lg">
              <Sparkles size={18} /> Manage My Talents
            </button>
          ) : (
            <button onClick={handleEnable} disabled={loading} className="btn btn-primary btn-lg">
              <Radio size={18} /> {loading ? 'Activating...' : 'Enable Provider Mode Now'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BecomeProvider;
