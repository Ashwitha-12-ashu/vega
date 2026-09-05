import React from 'react';
import StatusBadge from './StatusBadge';
import { Calendar, Clock, MapPin, DollarSign, User, Check, X, Play, CheckCheck, MessageSquare } from 'lucide-react';

const BookingCard = ({
  booking,
  isProviderView = false,
  onStatusChange,
  onOpenReview,
  onViewDetails,
}) => {
  const isPending = booking.status === 'PENDING';
  const isAccepted = booking.status === 'ACCEPTED';
  const isInProgress = booking.status === 'IN_PROGRESS';
  const isCompleted = booking.status === 'COMPLETED';

  const otherPersonName = isProviderView ? booking.customer_name : booking.provider_name;
  const otherPersonPhone = isProviderView ? booking.customer_phone : booking.provider_phone;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Header: Service Title, Category & Status */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary-600)' }}>
            {booking.category?.name || 'Service'} • #{booking.id}
          </span>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--slate-900)' }}>
            {booking.talent?.title || 'Service Booking'}
          </h3>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      {/* Details Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.75rem',
          backgroundColor: 'var(--slate-50)',
          padding: '0.875rem',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.875rem',
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
          <DollarSign size={16} color="var(--primary-600)" />
          <span>Fee: <strong>${booking.price}</strong></span>
        </div>
      </div>

      {/* Address & Notes */}
      <div style={{ fontSize: '0.875rem', color: 'var(--slate-600)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.375rem' }}>
          <MapPin size={16} color="var(--slate-400)" style={{ marginTop: '2px', flexShrink: 0 }} />
          <span>{booking.location_address}</span>
        </div>
        {booking.notes && (
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontStyle: 'italic', marginLeft: '1.5rem' }}>
            Note: "{booking.notes}"
          </p>
        )}
      </div>

      {/* Review summary if already reviewed */}
      {booking.has_review && booking.review && (
        <div
          style={{
            backgroundColor: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem',
            fontSize: '0.8125rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 700, color: '#92400e' }}>
            <span>Review Rating: {booking.review.rating} ★</span>
          </div>
          <p style={{ color: '#78350f', marginTop: '0.25rem' }}>
            "{booking.review.comment}"
          </p>
        </div>
      )}

      {/* State Transitions Action Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '0.625rem',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '0.875rem',
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
              <Check size={15} /> Accept Booking
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
              onClick={() => onStatusChange(booking.id, 'IN_PROGRESS')}
              className="btn btn-success btn-sm"
            >
              <Play size={15} /> Start Service
            </button>
          </>
        )}

        {isProviderView && isInProgress && (
          <button
            onClick={() => onStatusChange(booking.id, 'COMPLETED')}
            className="btn btn-success btn-sm"
          >
            <CheckCheck size={16} /> Mark Completed
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

        {!isProviderView && isCompleted && !booking.has_review && (
          <button
            onClick={() => onOpenReview(booking)}
            className="btn btn-primary btn-sm"
          >
            <MessageSquare size={15} /> Leave a Review
          </button>
        )}
      </div>
    </div>
  );
};

export default BookingCard;
