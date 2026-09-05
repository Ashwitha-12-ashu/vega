import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { useToast } from '../../context/ToastContext';
import { User, Phone, Mail, FileText, MapPin, Sparkles, Check, ToggleLeft, ToggleRight, Radio } from 'lucide-react';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user, isProvider, enableProviderMode, updateProfile } = useAuth();
  const { coordinates, setManualLocation } = useLocation();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    bio: '',
    avatar: '',
  });

  const [locationForm, setLocationForm] = useState({
    city: '',
    address: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isTogglingProvider, setIsTogglingProvider] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone_number: user.profile?.phone_number || '',
        bio: user.profile?.bio || '',
        avatar: user.profile?.avatar || '',
      });
    }
  }, [user]);

  useEffect(() => {
    if (coordinates) {
      setLocationForm({
        city: coordinates.city || '',
        address: coordinates.address || '',
      });
    }
  }, [coordinates]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile(formData);
      if (locationForm.city || locationForm.address) {
        await setManualLocation({
          lat: coordinates.lat,
          lng: coordinates.lng,
          city: locationForm.city,
          address: locationForm.address,
        });
      }
    } catch (err) {
      showToast('Failed to update profile.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleProviderToggle = async () => {
    setIsTogglingProvider(true);
    try {
      await enableProviderMode(!isProvider);
    } catch (err) {
      showToast('Failed to toggle provider mode.', 'error');
    } finally {
      setIsTogglingProvider(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '800px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--slate-900)' }}>
          Profile & Account Settings
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
          Manage your personal information and service provider preferences
        </p>
      </div>

      {/* Provider Mode Switch Card */}
      <div
        className="card"
        style={{
          padding: '1.75rem',
          backgroundColor: isProvider ? '#f0fdf4' : '#ffffff',
          borderColor: isProvider ? '#bbf7d0' : 'var(--border-color)',
          marginBottom: '2rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: isProvider ? '#dcfce7' : 'var(--slate-100)',
                color: isProvider ? '#15803d' : 'var(--slate-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Radio size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                Do you want to become a service provider?
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', marginTop: '2px' }}>
                {isProvider
                  ? 'Provider features are active on this account. You can offer services and manage talents.'
                  : 'Turn this on to add talents, set prices, and accept booking requests from local customers.'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={handleProviderToggle}
              disabled={isTogglingProvider}
              className={`btn ${isProvider ? 'btn-success' : 'btn-outline'}`}
            >
              {isProvider ? 'Provider Mode Active' : 'Enable Provider Mode'}
            </button>
          </div>
        </div>

        {isProvider && (
          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #bbf7d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.8125rem', color: '#166534', fontWeight: 600 }}>
              Status: {user?.profile?.is_online ? '● ONLINE' : '○ OFFLINE'} • {user?.profile?.total_reviews || 0} Reviews
            </span>
            <Link to="/my-talents" className="btn btn-primary btn-sm">
              <Sparkles size={15} /> Manage My Talents & Services
            </Link>
          </div>
        )}
      </div>

      {/* Edit Profile Form */}
      <form onSubmit={handleSaveProfile} className="card" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '1.5rem' }}>
          Personal Information
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">First Name</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Last Name</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="+1 (555) 000-0000"
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">About / Bio</label>
          <textarea
            rows={3}
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Tell customers about yourself and your professional background..."
            className="form-textarea"
          />
        </div>

        {/* Location Preferences */}
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-900)', marginTop: '1.5rem', marginBottom: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
          Service Location
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">City</label>
            <input
              type="text"
              value={locationForm.city}
              onChange={(e) => setLocationForm({ ...locationForm, city: e.target.value })}
              className="form-input"
              placeholder="e.g. Bangalore"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Address / Area</label>
            <input
              type="text"
              value={locationForm.address}
              onChange={(e) => setLocationForm({ ...locationForm, address: e.target.value })}
              className="form-input"
              placeholder="Street name or neighborhood"
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button type="submit" disabled={isSaving} className="btn btn-primary">
            <Check size={16} />
            {isSaving ? 'Saving Changes...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
