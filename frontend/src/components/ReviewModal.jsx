import React, { useState } from 'react';
import RatingStars from './RatingStars';
import { X, Send, Star, User, ShieldCheck } from 'lucide-react';

const ReviewModal = ({ isOpen, onClose, booking, onSubmitReview, isProviderReview = false }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !booking) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please provide written feedback for your rating.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await onSubmitReview({
        booking_id: booking.id,
        rating,
        comment: comment.trim(),
        is_provider_review: isProviderReview,
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.detail || 'Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const targetName = isProviderReview ? booking.customer_name : booking.provider_name;
  const roleTitle = isProviderReview ? 'Customer' : 'Professional Provider';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', borderRadius: 'var(--radius-2xl)', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--slate-900)' }}>
              {isProviderReview ? 'Rate Customer' : 'Rate & Review Service'}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {isProviderReview ? 'Share feedback about the client interaction' : 'Your honest feedback helps the Ongole community'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ backgroundColor: 'var(--slate-50)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem', border: '1px solid var(--slate-100)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase' }}>
                {booking.category?.name || 'Local Service'} • Booking #{booking.id}
              </p>
              <p style={{ fontWeight: 800, color: 'var(--slate-900)', fontSize: '1.05rem', marginTop: '2px' }}>
                {booking.talent?.title || 'Service Booking'}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>{roleTitle}</span>
              <span style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{targetName}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              {error}
            </div>
          )}

          <div className="form-group" style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <label className="form-label" style={{ marginBottom: '0.75rem', fontSize: '0.9rem', fontWeight: 700 }}>
              Overall Experience Rating
            </label>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
              <RatingStars
                rating={rating}
                interactive={true}
                onRatingChange={(newRating) => setRating(newRating)}
                size={34}
              />
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-700)', display: 'block', marginTop: '0.5rem' }}>
              {rating === 5 ? '⭐⭐⭐⭐⭐ Exceptional (5/5)' : rating === 4 ? '⭐⭐⭐⭐ Good (4/5)' : rating === 3 ? '⭐⭐⭐ Average (3/5)' : rating === 2 ? '⭐⭐ Below Average (2/5)' : '⭐ Poor (1/5)'}
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Written Feedback & Comments</label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={isProviderReview ? "How was the customer's communication, location clarity, and payment?" : "How was the service quality, punctuality, and work satisfaction?"}
              className="form-textarea"
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.75rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ minWidth: '150px' }}>
              <Send size={16} />
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
