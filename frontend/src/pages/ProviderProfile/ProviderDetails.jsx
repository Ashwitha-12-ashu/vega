import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { profileService } from '../../services/profileService';
import { reviewService } from '../../services/reviewService';
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
} from 'lucide-react';

const ProviderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        setError('Provider profile not found or unavailable.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading provider profile...</p>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '1rem' }}>
          {error || 'Provider not found'}
        </h2>
        <button onClick={() => navigate(-1)} className="btn btn-secondary">
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    );
  }

  const activeTalent = provider.active_talent;

  const handleBook = () => {
    if (activeTalent) {
      navigate(`/book/${activeTalent.id}`, { state: { provider } });
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '1000px' }}>
      {/* Back Link */}
      <button
        onClick={() => navigate(-1)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.375rem',
          background: 'none',
          border: 'none',
          color: 'var(--slate-600)',
          fontWeight: 600,
          fontSize: '0.875rem',
          cursor: 'pointer',
          marginBottom: '1.5rem',
        }}
      >
        <ArrowLeft size={16} /> Back to Search
      </button>

      {/* Main Profile Header*/}
      <div
        className="card"
        style={{
          padding: '2.5rem',
          borderRadius: 'var(--radius-xl)',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-100)',
                color: 'var(--primary-700)',
                fontSize: '2rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              {provider.full_name ? provider.full_name[0].toUpperCase() : 'P'}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                  {provider.full_name}
                </h1>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    padding: '0.25rem 0.625rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: provider.is_online ? '#dcfce7' : '#f1f5f9',
                    color: provider.is_online ? '#15803d' : '#64748b',
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: provider.is_online ? '#22c55e' : '#94a3b8' }} />
                  {provider.is_online ? 'ONLINE & ACCEPTING BOOKINGS' : 'CURRENTLY OFFLINE'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                <RatingStars rating={provider.average_rating} totalReviews={provider.total_reviews} size={18} />
                {provider.location?.city && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', color: 'var(--slate-600)' }}>
                    <MapPin size={15} color="var(--primary-600)" />
                    {provider.location.city}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Book CTA in Header */}
          {activeTalent && provider.is_online && (
            <button onClick={handleBook} className="btn btn-primary btn-lg" style={{ borderRadius: 'var(--radius-lg)' }}>
              <CalendarCheck size={18} /> Book This Service (${activeTalent.price_per_hour}/hr)
            </button>
          )}
        </div>

        {/* Bio */}
        {provider.bio && (
          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--slate-100)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '0.375rem' }}>
              About the Provider
            </h3>
            <p style={{ color: 'var(--slate-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
              {provider.bio}
            </p>
          </div>
        )}
      </div>

      {/* Active Service Offering */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={20} color="var(--primary-600)" />
          Active Service (Ready to Book)
        </h2>

        {activeTalent ? (
          <div className="card" style={{ padding: '1.75rem', borderLeft: '4px solid var(--primary-600)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary-600)' }}>
                  {activeTalent.category?.name}
                </span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '2px' }}>
                  {activeTalent.title}
                </h3>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                  ${activeTalent.price_per_hour}
                </span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'block' }}>
                  per hour
                </span>
              </div>
            </div>

            <p style={{ color: 'var(--slate-700)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              {activeTalent.description}
            </p>

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.875rem', color: 'var(--slate-600)', borderTop: '1px solid var(--slate-100)', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Briefcase size={16} color="var(--primary-600)" />
                <span><strong>{activeTalent.experience_years} years</strong> experience</span>
              </div>
              {activeTalent.availability_notes && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Clock size={16} color="var(--primary-600)" />
                  <span>{activeTalent.availability_notes}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            This provider currently does not have an active talent selected.
          </div>
        )}
      </div>

      {/* Verified Reviews Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--slate-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageSquare size={20} color="var(--primary-600)" />
            Customer Reviews ({reviews.length})
          </h2>
        </div>

        {reviews.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reviews.map((rev) => (
              <div key={rev.id} className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--slate-200)', color: 'var(--slate-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8125rem' }}>
                      {rev.customer_name ? rev.customer_name[0] : 'C'}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--slate-900)' }}>
                        {rev.customer_name}
                      </p>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Verified Booking • {new Date(rev.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <RatingStars rating={rev.rating} size={15} />
                </div>

                <p style={{ color: 'var(--slate-700)', fontSize: '0.875rem', lineHeight: 1.5, marginTop: '0.5rem' }}>
                  "{rev.comment}"
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No reviews yet for this provider. Be the first to book and share your feedback!
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderDetails;
