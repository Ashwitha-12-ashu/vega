import React from 'react';
import { Link } from 'react-router-dom';
import RatingStars from './RatingStars';
import { MapPin, Briefcase, CalendarCheck, ShieldCheck } from 'lucide-react';

const ProviderCard = ({ provider, onBookNow }) => {
  const activeTalent = provider.active_talent;
  const avatarUrl = provider.avatar || provider.profile_photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(provider.provider_name || 'Provider')}&background=0284c7&color=fff&size=100`;

  return (
    <div
      className="card card-clickable"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid rgba(226, 232, 240, 0.9)',
        boxShadow: 'var(--shadow-sm)',
        padding: '1.5rem',
        background: '#ffffff',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative',
      }}
    >
      {/* Header: Avatar, Name, Online Status */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div style={{ position: 'relative' }}>
            <img
              src={avatarUrl}
              alt={provider.provider_name}
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid #ffffff',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.08)',
                backgroundColor: '#f1f5f9',
              }}
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(provider.provider_name || 'Provider')}&background=0284c7&color=fff&size=100`;
              }}
            />
            <span
              className={`status-dot ${provider.is_online ? 'online pulse-beacon' : 'offline'}`}
              style={{
                position: 'absolute',
                bottom: '1px',
                right: '1px',
                border: '2px solid #ffffff',
              }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--slate-900)', letterSpacing: '-0.01em' }}>
                {provider.provider_name}
              </h4>
              <ShieldCheck size={16} color="var(--primary-600)" title="Verified Provider" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '3px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: provider.is_online ? '#15803d' : 'var(--text-muted)' }}>
                {provider.is_online ? 'Available Now' : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* Distance Badge */}
        {provider.distance_km !== undefined && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              backgroundColor: 'var(--primary-50)',
              color: 'var(--primary-700)',
              padding: '0.3rem 0.625rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              fontWeight: 800,
              border: '1px solid var(--primary-200)',
              whiteSpace: 'nowrap',
            }}
          >
            <MapPin size={13} />
            {provider.distance_km} km
          </div>
        )}
      </div>

      {/* Active Service Offering */}
      {activeTalent ? (
        <div
          style={{
            backgroundColor: 'var(--slate-50)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem',
            marginBottom: '1.25rem',
            border: '1px solid var(--slate-100)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {activeTalent.category?.name || 'Local Service'}
            </span>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--slate-900)' }}>
              ₹{activeTalent.price_per_hour}/hr
            </span>
          </div>

          <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--slate-900)', marginBottom: '0.25rem' }}>
            {activeTalent.title}
          </p>
          <p
            style={{
              fontSize: '0.8125rem',
              color: 'var(--text-muted)',
              lineHeight: 1.45,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {activeTalent.description}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.625rem', fontSize: '0.75rem', color: 'var(--slate-600)' }}>
            <Briefcase size={13} />
            <span>{activeTalent.experience_years} years experience</span>
          </div>
        </div>
      ) : (
        <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem', background: 'var(--slate-50)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
          No active talent currently listed
        </div>
      )}

      {/* Rating & Reviews */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <RatingStars
          rating={provider.average_rating}
          totalReviews={provider.total_reviews}
          size={15}
        />

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link
            to={`/providers/${provider.provider_id || provider.id}`}
            className="btn btn-secondary btn-sm"
          >
            Details
          </Link>
          <button
            onClick={() => onBookNow && onBookNow(provider)}
            disabled={!provider.is_online || !activeTalent}
            className="btn btn-primary btn-sm"
          >
            <CalendarCheck size={14} />
            Book
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProviderCard;
