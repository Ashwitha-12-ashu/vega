import React, { useState } from 'react';
import RatingStars from './RatingStars';
import { X, Send } from 'lucide-react';

const ReviewModal = ({ isOpen, onClose, booking, onSubmitReview }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !booking) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please provide feedback for your review.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await onSubmitReview({
        booking_id: booking.id,
        rating,
        comment: comment.trim(),
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            Leave a Review
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-500)' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ backgroundColor: 'var(--slate-50)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Service:</p>
          <p style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{booking.talent?.title}</p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--slate-600)', marginTop: '0.25rem' }}>
            Provider: <strong>{booking.provider_name}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ backgroundColor: 'var(--danger-50)', color: 'var(--danger-600)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <div className="form-group" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ marginBottom: '0.5rem' }}>
              Select Rating
            </label>
            <RatingStars
              rating={rating}
              interactive={true}
              onRatingChange={(newRating) => setRating(newRating)}
              size={32}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Review Commentary</label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How was the service quality, punctuality, and professionalism?"
              className="form-textarea"
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              <Send size={16} />
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
