import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { profileService } from '../../services/profileService';
import { reviewService } from '../../services/reviewService';
import { useLocation } from '../../context/LocationContext';
import RatingStars from '../../components/RatingStars';
import {

  User,
  MapPin,
  Calendar,
  Briefcase,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  Clock,
  ArrowLeft,
  CalendarCheck,
  CheckCircle2,
  Award,
  Phone,
  Mail,
  Zap
} from 'lucide-react';

const ProviderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { coordinates } = useLocation();

  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; // Radius of Earth in KM
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  const distanceFromCustomer =
    coordinates?.lat && provider?.location?.latitude
      ? calculateDistance(
          coordinates.lat,
          coordinates.lng,
          provider.location.latitude,
          provider.location.longitude
        )
      : null;

  useEffect(() => {
    setLoading(true);
    Promise.all([
      profileService.getPublicProvider(id),
      reviewService.getProviderReviews(id).catch(() => []),
    ])
      .then(([providerData, reviewsData]) => {
        setProvider(providerData);
        setReviews(reviewsData.results || reviewsData || []);
      })
      .catch((err) => {
        console.error('Failed to load provider profile:', err);
        setError('Provider profile not found or currently unavailable.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '3px solid rgba(14, 165, 233, 0.2)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-muted)', marginTop: '1rem', fontWeight: 600 }}>Loading provider profile...</p>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="container" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-800)', marginBottom: '1rem' }}>
          {error || 'Provider not found'}
        </h2>
        <button onClick={() => navigate(-1)} className="btn btn-secondary">
          <ArrowLeft size={16} /> Return to Search
        </button>
      </div>
    );
  }

  const activeTalent = provider.active_talent;
  const avatarUrl = provider.profile_photo || provider.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(provider.full_name || provider.provider_name || 'Provider')}&background=0284c7&color=fff&size=200`;

  const handleBook = () => {
    if (activeTalent) {
      navigate(`/book/${activeTalent.id}`, { state: { provider } });
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '1020px' }}>
      {/* Back Link */}
      <button
        onClick={() => navigate(-1)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'none',
          border: 'none',
          color: 'var(--slate-600)',
          fontWeight: 700,
          fontSize: '0.9rem',
          cursor: 'pointer',
          marginBottom: '1.75rem',
          transition: 'color 0.2s',
        }}
      >
        <ArrowLeft size={18} /> Back to Search Results
      </button>

      {/* Main Profile Header*/}
      <div
        className="card"
        style={{
          padding: '2.5rem',
          borderRadius: 'var(--radius-2xl)',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-md)',
          background: 'linear-gradient(to bottom, #ffffff, #fafafa)',
          border: '1px solid rgba(226, 232, 240, 0.9)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem' }}>
          <div style={{ display: 'flex', gap: '1.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Avatar & Online Dot */}
            <div style={{ position: 'relative' }}>
              <img
                src={avatarUrl}
                alt={provider.full_name || provider.provider_name}
                style={{
                  width: '104px',
                  height: '104px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '4px solid #ffffff',
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.12)',
                  backgroundColor: '#f1f5f9',
                }}
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(provider.full_name || 'Provider')}&background=0284c7&color=fff&size=200`;
                }}
              />
              <span
                className={`status-dot ${provider.is_online ? 'online pulse-beacon' : 'offline'}`}
                style={{
                  position: 'absolute',
                  bottom: '4px',
                  right: '4px',
                  width: '18px',
                  height: '18px',
                  border: '3px solid #ffffff',
                }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--slate-900)', letterSpacing: '-0.02em' }}>
                  {provider.full_name || provider.provider_name}
                </h1>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.3rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    backgroundColor: provider.is_online ? '#dcfce7' : '#f1f5f9',
                    color: provider.is_online ? '#15803d' : '#64748b',
                  }}
                >
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: provider.is_online ? '#22c55e' : '#94a3b8' }} />
                  {provider.is_online ? 'ONLINE & READY' : 'OFFLINE'}
                </span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: '0.3rem 0.65rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: 'var(--primary-50)',
                    color: 'var(--primary-700)',
                    border: '1px solid var(--primary-200)',
                  }}
                >
                  <ShieldCheck size={14} /> Verified Pro
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                <RatingStars rating={provider.average_rating} totalReviews={provider.total_reviews} size={19} />
                
                {provider.location?.city && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.9rem', color: 'var(--slate-600)', fontWeight: 600 }}>
                    <MapPin size={16} color="var(--primary-600)" />
                    {provider.location.city}, AP {provider.location.address ? `(${provider.location.address})` : ''}
                  </span>
                )}

                {distanceFromCustomer && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.875rem', color: 'var(--primary-700)', fontWeight: 700, backgroundColor: 'var(--primary-50)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)' }}>
                    📍 {distanceFromCustomer} km away from you
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Book CTA in Header */}
          {activeTalent && (
            <div style={{ textAlign: 'right' }}>
              <button 
                onClick={handleBook} 
                disabled={!provider.is_online}
                className="btn btn-primary btn-lg" 
                style={{ 
                  borderRadius: 'var(--radius-xl)', 
                  padding: '0.875rem 1.75rem',
                  fontSize: '1rem',
                  boxShadow: '0 6px 16px rgba(2, 132, 199, 0.25)',
                }}
              >
                <CalendarCheck size={19} /> 
                {provider.is_online ? `Book Now (₹${activeTalent.price_per_hour}/hr)` : 'Currently Offline'}
              </button>
            </div>
          )}
        </div>

        {/* Bio */}
        {provider.bio && (
          <div style={{ marginTop: '1.75rem', paddingTop: '1.75rem', borderTop: '1px solid var(--slate-100)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '0.5rem' }}>
              About the Professional
            </h3>
            <p style={{ color: 'var(--slate-700)', fontSize: '0.95rem', lineHeight: 1.65 }}>
              {provider.bio}
            </p>
          </div>
        )}
      </div>

      {/* Grid: Active Service & Highlights */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
        {/* Active Service Offering */}
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={20} color="var(--primary-600)" />
            Active Service Offering
          </h2>

          {activeTalent ? (
            <div className="card" style={{ padding: '2rem', borderLeft: '4px solid var(--primary-600)', borderRadius: 'var(--radius-xl)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary-600)', letterSpacing: '0.05em' }}>
                    {activeTalent.category?.name}
                  </span>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '4px' }}>
                    {activeTalent.title}
                  </h3>
                </div>
                <div style={{ textAlign: 'right', backgroundColor: 'var(--primary-50)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-lg)' }}>
                  <span style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--primary-700)' }}>
                    ₹{activeTalent.price_per_hour}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--primary-600)', display: 'block', fontWeight: 700 }}>
                    per hour
                  </span>
                </div>
              </div>

              <p style={{ color: 'var(--slate-700)', fontSize: '0.95rem', lineHeight: 1.65, marginBottom: '1.5rem' }}>
                {activeTalent.description}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', borderTop: '1px solid var(--slate-100)', paddingTop: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', color: 'var(--slate-700)', fontSize: '0.875rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--slate-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Briefcase size={16} color="var(--primary-600)" />
                  </div>
                  <span><strong>{activeTalent.experience_years} years</strong> experience</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', color: 'var(--slate-700)', fontSize: '0.875rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--slate-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Clock size={16} color="var(--primary-600)" />
                  </div>
                  <span>{activeTalent.availability_notes || 'Quick same-day response in Ongole'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              This provider currently does not have an active talent selected.
            </div>
          )}
        </div>

        {/* VEGA Trust & Service Guarantees */}
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={20} color="var(--primary-600)" />
            VEGA Guarantee
          </h2>

          <div className="card" style={{ padding: '1.75rem', borderRadius: 'var(--radius-xl)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <CheckCircle2 size={18} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--slate-900)' }}>Identity Verified</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>Aadhaar & phone number verified by VEGA local team.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <CheckCircle2 size={18} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--slate-900)' }}>Transparent Ongole Pricing</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>Direct hourly rates in INR with zero hidden markups.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <CheckCircle2 size={18} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--slate-900)' }}>Live Coordinate Tracking</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>Track provider distance and arrival status step-by-step.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Verified Reviews Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--slate-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageSquare size={20} color="var(--primary-600)" />
            Verified Customer Reviews ({reviews.length})
          </h2>
        </div>

        {reviews.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reviews.map((rev) => (
              <div key={rev.id} className="card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-xl)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--primary-100)', color: 'var(--primary-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.875rem' }}>
                      {rev.customer_name ? rev.customer_name[0].toUpperCase() : 'C'}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--slate-900)' }}>
                        {rev.customer_name}
                      </p>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Verified Ongole Client • {new Date(rev.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <RatingStars rating={rev.rating} size={16} />
                </div>

                <p style={{ color: 'var(--slate-700)', fontSize: '0.9rem', lineHeight: 1.6, fontStyle: 'italic' }}>
                  "{rev.comment}"
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="card" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', borderRadius: 'var(--radius-xl)' }}>
            No reviews yet for this provider. Book this service and be the first to share your experience!
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderDetails;
