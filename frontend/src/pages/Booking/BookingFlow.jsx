import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { useToast } from '../../context/ToastContext';
import { talentService } from '../../services/talentService';
import { bookingService } from '../../services/bookingService';
import {
  Calendar,
  Clock,
  MapPin,
  FileText,
  DollarSign,
  ArrowLeft,
  CheckCircle,
  Shield,
} from 'lucide-react';

const BookingFlow = () => {
  const { talentId } = useParams();
  const navigate = useNavigate();
  const routerLoc = useRouterLocation();
  const { user, isAuthenticated } = useAuth();
  const { coordinates } = useLocation();
  const { showToast } = useToast();

  const [talent, setTalent] = useState(null);
  const [loadingTalent, setLoadingTalent] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [scheduledDate, setScheduledDate] = useState(tomorrow);
  const [scheduledTime, setScheduledTime] = useState('10:00');
  const [locationAddress, setLocationAddress] = useState(coordinates.address || `${coordinates.city}, Near City Center`);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: routerLoc } });
      return;
    }

    talentService
      .getTalent(talentId)
      .then((data) => {
        setTalent(data);
        if (data.user === user?.id) {
          setError('You cannot book your own service offering.');
        }
      })
      .catch((err) => {
        console.error('Failed to load talent:', err);
        setError('The requested service could not be loaded.');
      })
      .finally(() => setLoadingTalent(false));
  }, [talentId, isAuthenticated, user?.id]);

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!locationAddress.trim()) {
      setError('Please provide a service location address.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await bookingService.createBooking({
        talent_id: parseInt(talentId, 10),
        location_address: locationAddress.trim(),
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime + ':00',
        notes: notes.trim(),
      });

      showToast('Booking request submitted successfully! Provider has been notified.', 'success');
      navigate('/my-bookings');
    } catch (err) {
      console.error('Booking creation error:', err);
      const msg = err.response?.data?.error || 'Failed to create booking. Provider may be offline.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingTalent) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading service booking...</p>
      </div>
    );
  }

  if (!talent) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>{error || 'Service not found'}</h2>
        <button onClick={() => navigate('/explore')} className="btn btn-secondary">
          <ArrowLeft size={16} /> Return to Explore
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '880px' }}>
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
        <ArrowLeft size={16} /> Back
      </button>

      <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '0.5rem' }}>
        Book Service Appointment
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginBottom: '2rem' }}>
        Provide your booking schedule and address to confirm request.
      </p>

      {error && (
        <div
          style={{
            backgroundColor: 'var(--danger-50)',
            color: 'var(--danger-600)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            fontWeight: 600,
            fontSize: '0.875rem',
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem',
        }}
      >
        {/* Booking Form */}
        <form onSubmit={handleSubmitBooking} className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '1.5rem' }}>
            Appointment Details
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">
                <Calendar size={15} style={{ display: 'inline', marginRight: '4px' }} />
                Date
              </label>
              <input
                type="date"
                min={tomorrow}
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Clock size={15} style={{ display: 'inline', marginRight: '4px' }} />
                Time
              </label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <MapPin size={15} style={{ display: 'inline', marginRight: '4px' }} />
              Service Address
            </label>
            <input
              type="text"
              placeholder="e.g. 104 Park Avenue, Flat 3B"
              value={locationAddress}
              onChange={(e) => setLocationAddress(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <FileText size={15} style={{ display: 'inline', marginRight: '4px' }} />
              Special Notes / Instructions
            </label>
            <textarea
              rows={3}
              placeholder="Describe any specific requirements or directions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="form-textarea"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || talent.user === user?.id}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.875rem', marginTop: '1rem' }}
          >
            {isSubmitting ? 'Submitting Request...' : `Confirm & Request Booking ($${talent.price_per_hour})`}
          </button>
        </form>

        {/* Service & Price Summary Card */}
        <div>
          <div className="card" style={{ padding: '2rem', backgroundColor: '#ffffff' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '1.25rem' }}>
              Service Summary
            </h3>

            <div style={{ marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary-600)' }}>
                {talent.category?.name}
              </span>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '2px' }}>
                {talent.title}
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Provided by: <strong>{talent.provider_name}</strong>
              </p>
            </div>

            <div
              style={{
                borderTop: '1px solid var(--border-color)',
                borderBottom: '1px solid var(--border-color)',
                padding: '1rem 0',
                marginBottom: '1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1rem',
                fontWeight: 700,
              }}
            >
              <span>Service Fee:</span>
              <span style={{ color: 'var(--primary-700)', fontSize: '1.25rem' }}>
                ${talent.price_per_hour}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8125rem', color: 'var(--slate-600)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={16} color="#10b981" />
                <span>Pay directly upon completed service</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={16} color="var(--primary-600)" />
                <span>Verified local talent & honest reviews</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingFlow;
