import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { notificationService } from '../../services/notificationService';
import { useToast } from '../../context/ToastContext';
import { Bell, CheckCheck, Calendar, Star, Sparkles, Clock } from 'lucide-react';

const Notifications = () => {
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data.results || data || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      showToast('All notifications marked as read.', 'success');
      loadNotifications();
    } catch (err) {
      showToast('Failed to mark notifications as read.', 'error');
    }
  };

  const handleMarkSingleRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      loadNotifications();
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  const getNotificationIcon = (type) => {
    if (type.startsWith('BOOKING_')) return <Calendar size={18} color="var(--primary-600)" />;
    if (type === 'REVIEW_RECEIVED') return <Star size={18} color="#f59e0b" />;
    return <Sparkles size={18} color="var(--primary-600)" />;
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '780px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            Notifications
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
            Real-time updates regarding your  service bookings, appointments, and reviews
          </p>
        </div>

        {notifications.some((n) => !n.is_read) && (
          <button onClick={handleMarkAllRead} className="btn btn-secondary btn-sm">
            <CheckCheck size={16} /> Mark All as Read
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>Loading notifications...</p>
        </div>
      ) : notifications.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.is_read && handleMarkSingleRead(n.id)}
              className="card"
              style={{
                padding: '1.25rem',
                backgroundColor: n.is_read ? '#ffffff' : '#f8fafc',
                borderLeft: n.is_read ? '1px solid var(--border-color)' : '4px solid var(--primary-600)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                cursor: n.is_read ? 'default' : 'pointer',
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--primary-50)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {getNotificationIcon(n.notification_type)}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                    {n.title}
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', marginTop: '0.25rem' }}>
                  {n.message}
                </p>

                {n.booking && (
                  <Link
                    to="/my-bookings"
                    style={{
                      display: 'inline-block',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: 'var(--primary-600)',
                      marginTop: '0.5rem',
                    }}
                  >
                    View in My Bookings →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Bell size={36} color="var(--slate-300)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '0.25rem' }}>
            No notifications yet
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            When you receive booking requests or status updates, they will appear here.
          </p>
        </div>
      )}
    </div>
  );
};

export default Notifications;
