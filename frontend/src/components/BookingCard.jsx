import React, { useState } from 'react';
import StatusBadge from './StatusBadge';
import {
  Calendar,
  Clock,
  MapPin,
  IndianRupee,
  User,
  Check,
  X,
  Play,
  CheckCheck,
  MessageSquare,
  Navigation,
  LocateFixed,
  Star,
  CheckCircle2,
  AlertCircle,
  Truck
} from 'lucide-react';

const BookingCard = ({
  booking,
  isProviderView = false,
  onStatusChange,
  onUpdateLocation,
  onOpenReview,
  onOpenCustomerReview,
}) => {
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);

  const status = (booking.status || '').toUpperCase();
  const isPending = status === 'PENDING';
  const isAccepted = status === 'ACCEPTED';
  const isOnTheWay = status === 'ON_THE_WAY';
  const isArrived = status === 'ARRIVED';
  const isInProgress = status === 'IN_PROGRESS';
  const isRatingPending = status === 'RATING_PENDING';
  const isCompleted = status === 'COMPLETED';
  const isClosed = status === 'CLOSED';
  const isCancelled = status === 'CANCELLED' || status === 'REJECTED';

  const otherPersonName = isProviderView ? booking.customer_name : booking.provider_name;
  const otherPersonPhone = isProviderView ? booking.customer_phone : booking.provider_phone;
  const otherPersonAvatar = isProviderView 
    ? (booking.customer_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(booking.customer_name || 'Customer')}&background=0284c7&color=fff&size=80`)
    : (booking.provider_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(booking.provider_name || 'Provider')}&background=0284c7&color=fff&size=80`);

  // Progress Stepper stages
  const stages = [
    { key: 'PENDING', label: 'Requested' },
    { key: 'ACCEPTED', label: 'Accepted' },
    { key: 'ON_THE_WAY', label: 'On The Way' },
    { key: 'ARRIVED', label: 'Arrived' },
    { key: 'IN_PROGRESS', label: 'In Progress' },
    { key: 'COMPLETED_STAGE', label: 'Completed' },
    { key: 'CLOSED', label: 'Closed & Reviewed' },
  ];

  const getStageIndex = () => {
    if (isPending) return 0;
    if (isAccepted) return 1;
    if (isOnTheWay) return 2;
    if (isArrived) return 3;
    if (isInProgress) return 4;
    if (isRatingPending || isCompleted) return 5;
    if (isClosed) return 6;
    return -1;
  };

  const currentStageIndex = getStageIndex();

  const handleProviderLocationUpdate = async () => {
    setIsUpdatingLocation(true);
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            await onUpdateLocation(booking.id, {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            });
            setIsUpdatingLocation(false);
          },
          (err) => {
            console.warn('Provider live GPS acquisition failed:', err);
            setIsUpdatingLocation(false);
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      } else {
        if (booking.provider_latitude && booking.provider_longitude) {
          await onUpdateLocation(booking.id, { latitude: booking.provider_latitude, longitude: booking.provider_longitude });
        }
        setIsUpdatingLocation(false);
      }
    } catch (err) {
      setIsUpdatingLocation(false);
    }
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', borderRadius: 'var(--radius-xl)', padding: '1.75rem', border: '1px solid rgba(226, 232, 240, 0.9)' }}>
      {/* Header: Service Title, Category, Status */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img
            src={otherPersonAvatar}
            alt={otherPersonName}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid var(--primary-100)',
              backgroundColor: '#f1f5f9',
            }}
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(otherPersonName || 'User')}&background=0284c7&color=fff&size=80`;
            }}
          />
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary-600)', letterSpacing: '0.05em' }}>
              {booking.category?.name || 'Service'} • Booking #{booking.id}
            </span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '2px' }}>
              {booking.talent?.title || 'Local Service Booking'}
            </h3>
          </div>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      {/* Lifecycle Progress Stepper (if active or completed) */}
      {!isCancelled && (
        <div style={{ padding: '0.875rem 0', borderTop: '1px solid var(--slate-100)', borderBottom: '1px solid var(--slate-100)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', overflowX: 'auto', padding: '0.5rem 0' }}>
            {stages.map((stage, idx) => {
              const isPast = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;

              return (
                <div key={stage.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: '70px', position: 'relative', zIndex: 2 }}>
                  <div
                    style={{
                      width: isCurrent ? '26px' : '20px',
                      height: isCurrent ? '26px' : '20px',
                      borderRadius: '50%',
                      backgroundColor: isCurrent ? 'var(--primary-600)' : isPast ? '#22c55e' : 'var(--slate-200)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      boxShadow: isCurrent ? '0 0 0 4px rgba(2, 132, 199, 0.2)' : 'none',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {isPast ? <Check size={12} strokeWidth={3} /> : idx + 1}
                  </div>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: isCurrent ? 800 : isPast ? 700 : 500,
                      color: isCurrent ? 'var(--primary-700)' : isPast ? 'var(--slate-800)' : 'var(--slate-400)',
                      marginTop: '6px',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Details Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.875rem',
          backgroundColor: 'var(--slate-50)',
          padding: '1rem',
          borderRadius: 'var(--radius-lg)',
          fontSize: '0.875rem',
          border: '1px solid var(--slate-100)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--slate-700)' }}>
          <User size={16} color="var(--primary-600)" />
          <span>
            {isProviderView ? 'Customer' : 'Provider'}: <strong>{otherPersonName}</strong>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--slate-700)' }}>
          <Calendar size={16} color="var(--primary-600)" />
          <span>{booking.scheduled_date}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--slate-700)' }}>
          <Clock size={16} color="var(--primary-600)" />
          <span>{booking.scheduled_time}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--slate-700)' }}>
          <span style={{ fontWeight: 800, color: 'var(--primary-600)' }}>₹</span>
          <span>Price: <strong>₹{booking.price}</strong></span>
        </div>
      </div>

      {/* Address & Live Distance Tracker */}
      <div style={{ fontSize: '0.875rem', color: 'var(--slate-600)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.375rem' }}>
          <MapPin size={16} color="var(--slate-400)" style={{ marginTop: '2px', flexShrink: 0 }} />
          <span>Service Location: <strong>{booking.location_address}</strong></span>
        </div>

        {booking.notes && (
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontStyle: 'italic', marginLeft: '1.5rem', marginTop: '0.25rem' }}>
            Customer note: "{booking.notes}"
          </p>
        )}
      </div>

      {/* LIVE COORDINATE TRACKING SECTION (Active stages: ACCEPTED, ON_THE_WAY, ARRIVED, IN_PROGRESS) */}
      {(isAccepted || isOnTheWay || isArrived || isInProgress) && (
        <div
          style={{
            backgroundColor: isOnTheWay || isArrived ? '#f0fdf4' : 'var(--primary-50)',
            border: `1px solid ${isOnTheWay || isArrived ? '#bbf7d0' : 'var(--primary-200)'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: isOnTheWay || isArrived ? '#dcfce7' : '#e0f2fe',
                  color: isOnTheWay || isArrived ? '#15803d' : 'var(--primary-700)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Navigation size={18} className={isOnTheWay ? 'pulse-beacon' : ''} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                    {isOnTheWay ? 'Provider is En Route' : isArrived ? 'Provider Has Arrived' : isInProgress ? 'Service in Progress' : 'Booking Confirmed'}
                  </h4>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#15803d', backgroundColor: '#dcfce7', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                    Live GPS
                  </span>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--slate-600)', marginTop: '2px' }}>
                  {booking.distance_km !== null && booking.distance_km !== undefined
                    ? `📍 Provider is approx. ${booking.distance_km} km from destination`
                    : '📍 Live provider coordinates tracked'}
                  {booking.provider_location_updated_at && ` (Updated ${new Date(booking.provider_location_updated_at).toLocaleTimeString()})`}
                </p>
              </div>
            </div>

            {/* Provider Live Location Push Control */}
            {isProviderView && (
              <button
                type="button"
                onClick={handleProviderLocationUpdate}
                disabled={isUpdatingLocation}
                className="btn btn-outline btn-sm"
                style={{ backgroundColor: '#ffffff', fontSize: '0.8rem' }}
              >
                <LocateFixed size={14} />
                {isUpdatingLocation ? 'Updating...' : 'Update My Location'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mandatory Rating / Review Prompt for Customer when Rating Pending */}
      {!isProviderView && (isRatingPending || (isCompleted && !booking.customer_reviewed)) && (
        <div
          style={{
            backgroundColor: '#fffbeb',
            border: '2px dashed #f59e0b',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Star size={20} fill="#f59e0b" color="#f59e0b" />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#92400e' }}>
                Service Completed! Please Rate Your Professional
              </h4>
              <p style={{ fontSize: '0.8125rem', color: '#b45309', marginTop: '2px' }}>
                Share your experience to help finalize this service record.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenReview(booking)}
            className="btn btn-primary btn-sm"
            style={{ backgroundColor: '#d97706', borderColor: '#d97706' }}
          >
            <Star size={15} /> Rate & Review Now
          </button>
        </div>
      )}

      {/* Review summary if already reviewed */}
      {(booking.customer_reviewed || booking.has_review) && booking.review && (
        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 'var(--radius-md)',
            padding: '0.875rem 1rem',
            fontSize: '0.85rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 800, color: 'var(--slate-900)' }}>
              <span>Customer Review:</span>
              <span style={{ color: '#d97706' }}>{'★'.repeat(booking.review.rating || 5)} ({booking.review.rating}/5)</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {new Date(booking.review.created_at).toLocaleDateString()}
            </span>
          </div>
          <p style={{ color: 'var(--slate-700)', fontStyle: 'italic' }}>
            "{booking.review.comment}"
          </p>
        </div>
      )}

      {/* Provider Customer Feedback if available */}
      {booking.customer_feedback && (
        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', fontSize: '0.8125rem' }}>
          <span style={{ fontWeight: 700, color: '#166534' }}>Provider Feedback: {booking.customer_feedback.rating}★ — "{booking.customer_feedback.comment}"</span>
        </div>
      )}

      {/* State Transitions Action Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '0.75rem',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '1rem',
          flexWrap: 'wrap',
        }}
      >
        {/* PROVIDER ACTIONS */}
        {isProviderView && isPending && (
          <>
            <button
              onClick={() => onStatusChange(booking.id, 'REJECTED')}
              className="btn btn-secondary btn-sm"
              style={{ color: 'var(--danger-500)' }}
            >
              <X size={15} /> Decline
            </button>
            <button
              onClick={() => onStatusChange(booking.id, 'ACCEPTED')}
              className="btn btn-primary btn-sm"
            >
              <Check size={15} /> Accept Request
            </button>
          </>
        )}

        {isProviderView && isAccepted && (
          <>
            <button
              onClick={() => onStatusChange(booking.id, 'CANCELLED')}
              className="btn btn-secondary btn-sm"
            >
              <X size={15} /> Cancel
            </button>
            <button
              onClick={() => onStatusChange(booking.id, 'ON_THE_WAY')}
              className="btn btn-primary btn-sm"
            >
              <Truck size={15} /> Start Journey (On The Way)
            </button>
          </>
        )}

        {isProviderView && isOnTheWay && (
          <button
            onClick={() => onStatusChange(booking.id, 'ARRIVED')}
            className="btn btn-primary btn-sm"
          >
            <MapPin size={15} /> I Have Arrived at Location
          </button>
        )}

        {isProviderView && isArrived && (
          <button
            onClick={() => onStatusChange(booking.id, 'IN_PROGRESS')}
            className="btn btn-success btn-sm"
          >
            <Play size={15} /> Start Service Work
          </button>
        )}

        {isProviderView && isInProgress && (
          <button
            onClick={() => onStatusChange(booking.id, 'COMPLETED')}
            className="btn btn-success btn-sm"
          >
            <CheckCheck size={16} /> Complete Service Work
          </button>
        )}

        {/* Provider Reviewing Customer (Dual review) */}
        {isProviderView && (isCompleted || isClosed || isRatingPending) && !booking.provider_reviewed && (
          <button
            onClick={() => onOpenCustomerReview && onOpenCustomerReview(booking)}
            className="btn btn-outline btn-sm"
          >
            <Star size={14} /> Rate Customer
          </button>
        )}

        {/* CUSTOMER ACTIONS */}
        {!isProviderView && (isPending || isAccepted) && (
          <button
            onClick={() => onStatusChange(booking.id, 'CANCELLED')}
            className="btn btn-secondary btn-sm"
            style={{ color: 'var(--danger-500)' }}
          >
            <X size={15} /> Cancel Booking
          </button>
        )}

        {!isProviderView && (isRatingPending || isCompleted) && !booking.customer_reviewed && (
          <button
            onClick={() => onOpenReview(booking)}
            className="btn btn-primary btn-sm"
          >
            <MessageSquare size={15} /> Submit Review
          </button>
        )}
      </div>
    </div>
  );
};

export default BookingCard;
