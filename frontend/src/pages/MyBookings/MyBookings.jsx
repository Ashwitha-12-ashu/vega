import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { bookingService } from '../../services/bookingService';
import { reviewService } from '../../services/reviewService';
import BookingCard from '../../components/BookingCard';
import ReviewModal from '../../components/ReviewModal';
import { BookingSkeleton } from '../../components/SkeletonLoader';
import { Calendar, User, Briefcase, Filter, Sparkles } from 'lucide-react';

const MyBookings = () => {
  const { user, isProvider } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('customer'); // 'customer' or 'provider'
  const [statusFilter, setStatusFilter] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review Modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await bookingService.getBookings({
        role: activeTab,
        status: statusFilter,
      });
      setBookings(data.results || data || []);
    } catch (err) {
      console.error('Failed to load bookings:', err);
      showToast('Could not load bookings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [activeTab, statusFilter]);

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await bookingService.updateBookingStatus(bookingId, newStatus);
      showToast(`Booking updated to ${newStatus}.`, 'success');
      fetchBookings();
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to update booking status.';
      showToast(errorMsg, 'error');
    }
  };

  const handleOpenReview = (booking) => {
    setSelectedBookingForReview(booking);
    setReviewModalOpen(true);
  };

  const handleSubmitReview = async (reviewPayload) => {
    await reviewService.createReview(reviewPayload);
    showToast('Thank you! Your review has been submitted.', 'success');
    fetchBookings();
  };

  const statusOptions = [
    { label: 'All Statuses', value: '' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Accepted', value: 'ACCEPTED' },
    { label: 'In Progress', value: 'IN_PROGRESS' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Cancelled / Rejected', value: 'CANCELLED' },
  ];

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '1000px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--slate-900)' }}>
          My Bookings & Orders
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
          Manage your booked services and received client appointments
        </p>
      </div>

      {/* Role View Tabs (Customer vs Provider) */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '1.5rem',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('customer')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 700,
            color: activeTab === 'customer' ? 'var(--primary-600)' : 'var(--slate-600)',
            borderBottom: activeTab === 'customer' ? '3px solid var(--primary-600)' : '3px solid transparent',
            marginBottom: '-1px',
          }}
        >
          <User size={18} />
          Booked by Me (Customer)
        </button>

        {isProvider && (
          <button
            type="button"
            onClick={() => setActiveTab('provider')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 700,
              color: activeTab === 'provider' ? 'var(--primary-600)' : 'var(--slate-600)',
              borderBottom: activeTab === 'provider' ? '3px solid var(--primary-600)' : '3px solid transparent',
              marginBottom: '-1px',
            }}
          >
            <Briefcase size={18} />
            Received Bookings (Provider)
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
        {statusOptions.map((opt) => {
          const isSelected = statusFilter === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              style={{
                padding: '0.375rem 0.875rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                border: '1px solid',
                cursor: 'pointer',
                backgroundColor: isSelected ? 'var(--slate-900)' : '#ffffff',
                color: isSelected ? '#ffffff' : 'var(--slate-700)',
                borderColor: isSelected ? 'var(--slate-900)' : 'var(--slate-200)',
                whiteSpace: 'nowrap',
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <BookingSkeleton />
          <BookingSkeleton />
        </div>
      ) : bookings.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              isProviderView={activeTab === 'provider'}
              onStatusChange={handleStatusChange}
              onOpenReview={handleOpenReview}
            />
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--slate-100)',
              color: 'var(--slate-400)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
          >
            <Calendar size={28} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '0.25rem' }}>
            No bookings found
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {activeTab === 'customer'
              ? "You haven't booked any service yet."
              : 'You have not received any bookings matching this filter.'}
          </p>
        </div>
      )}

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        booking={selectedBookingForReview}
        onSubmitReview={handleSubmitReview}
      />
    </div>
  );
};

export default MyBookings;
