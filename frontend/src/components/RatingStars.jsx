import React from 'react';
import { Star } from 'lucide-react';

const RatingStars = ({ rating = 0, totalReviews = 0, interactive = false, onRatingChange, size = 16 }) => {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
      <div style={{ display: 'flex', gap: '2px' }}>
        {stars.map((star) => {
          const isFilled = star <= Math.round(rating);
          return (
            <button
              key={star}
              type={interactive ? 'button' : undefined}
              onClick={() => interactive && onRatingChange && onRatingChange(star)}
              disabled={!interactive}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: interactive ? 'pointer' : 'default',
                color: isFilled ? '#f59e0b' : '#cbd5e1',
                display: 'inline-flex',
                alignItems: 'center',
                transition: 'transform 0.1s',
              }}
              onMouseEnter={(e) => interactive && (e.currentTarget.style.transform = 'scale(1.2)')}
              onMouseLeave={(e) => interactive && (e.currentTarget.style.transform = 'scale(1.0)')}
            >
              <Star
                size={size}
                fill={isFilled ? '#f59e0b' : 'none'}
                strokeWidth={isFilled ? 0 : 1.5}
              />
            </button>
          );
        })}
      </div>
      {rating > 0 && (
        <span style={{ fontSize: `${size * 0.85}px`, fontWeight: 700, color: 'var(--slate-800)', marginLeft: '0.25rem' }}>
          {Number(rating).toFixed(1)}
        </span>
      )}
      {totalReviews > 0 && (
        <span style={{ fontSize: `${size * 0.75}px`, color: 'var(--text-muted)' }}>
          ({totalReviews})
        </span>
      )}
    </div>
  );
};

export default RatingStars;
