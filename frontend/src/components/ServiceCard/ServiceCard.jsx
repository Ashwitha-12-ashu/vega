import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ServiceIconBox } from '../../utils/serviceIcons';
import './ServiceCard.css';

export const ServiceCard = ({
  category,
  onSelect,
  active = false,
  variant = 'default',
  index = 0,
}) => {
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const [transformStyle, setTransformStyle] = useState('');
  const [spotlightPos, setSpotlightPos] = useState({ x: '50%', y: '50%' });

  const name = category?.name || 'Service';
  const slug = category?.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const handleClick = (e) => {
    e.preventDefault();
    if (onSelect) {
      onSelect(category);
    } else {
      navigate(`/nearby?category=${encodeURIComponent(slug)}`);
    }
  };

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Very subtle micro-tilt (max 1.5 degrees) for ultra-premium feel
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -1.5;
    const rotateY = ((x - centerX) / centerX) * 1.5;

    setSpotlightPos({ x: `${x}px`, y: `${y}px` });
    setTransformStyle(
      `perspective(600px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-5px) scale(1.03)`
    );
  };


  const handleMouseLeave = () => {
    setTransformStyle('');
    setSpotlightPos({ x: '50%', y: '50%' });
  };

  return (
    <article
      ref={cardRef}
      className={`vega-service-card ${variant} ${active ? 'active' : ''}`}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        '--card-index': index,
        '--mouse-x': spotlightPos.x,
        '--mouse-y': spotlightPos.y,
        ...(transformStyle ? { transform: transformStyle } : {}),
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick(e);
        }
      }}
      aria-label={`Explore ${name} services`}
    >
      {/* Dynamic Cursor Spotlight Effect */}
      <div className="card-spotlight-overlay" aria-hidden="true" />

      {/* Centered Logo-style Icon Box */}
      <div className="service-card-icon-header">
        <ServiceIconBox name={name} slug={slug} size={26} />
      </div>

      {/* Centered Service Name */}
      <div className="service-card-body">
        <h3 className="service-card-name">{name}</h3>
      </div>
    </article>
  );
};

export default ServiceCard;

