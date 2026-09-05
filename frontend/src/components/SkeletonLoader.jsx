import React from 'react';

export const ProviderSkeleton = () => (
  <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div className="skeleton" style={{ width: '48px', height: '48px', borderRadius: '50%' }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        <div className="skeleton" style={{ width: '60%', height: '18px' }} />
        <div className="skeleton" style={{ width: '30%', height: '14px' }} />
      </div>
    </div>
    <div className="skeleton" style={{ width: '100%', height: '80px', borderRadius: 'var(--radius-md)' }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div className="skeleton" style={{ width: '80px', height: '16px' }} />
      <div className="skeleton" style={{ width: '70px', height: '32px', borderRadius: 'var(--radius-md)' }} />
    </div>
  </div>
);

export const BookingSkeleton = () => (
  <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <div className="skeleton" style={{ width: '40%', height: '20px' }} />
      <div className="skeleton" style={{ width: '80px', height: '24px', borderRadius: 'var(--radius-full)' }} />
    </div>
    <div className="skeleton" style={{ width: '100%', height: '60px', borderRadius: 'var(--radius-md)' }} />
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
      <div className="skeleton" style={{ width: '90px', height: '36px', borderRadius: 'var(--radius-md)' }} />
    </div>
  </div>
);
