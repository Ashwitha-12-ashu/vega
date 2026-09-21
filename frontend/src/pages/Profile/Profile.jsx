import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { useToast } from '../../context/ToastContext';
import { talentService } from '../../services/talentService';
import { Link } from 'react-router-dom';
import {
  User,
  Phone,
  Mail,
  FileText,
  MapPin,
  Sparkles,
  Check,
  X,
  Radio,
  Camera,
  Trash2,
  Upload,
  Activity,
  AlertCircle,
  Briefcase,
  Clock,
  Star,
  ShieldCheck,
  Edit3,
  Navigation,
  ChevronRight,
  Sliders,
  DollarSign,
  Info
} from 'lucide-react';
import './Profile.css';

const Profile = () => {
  const {
    user,
    isProvider,
    isOnline,
    enableProviderMode,
    goOnline,
    goOffline,
    updateProfile,
    removeProfilePhoto,
    refreshUser
  } = useAuth();

  const {
    coordinates,
    isDetecting,
    locationError,
    requestBrowserLocation,
    setManualLocation
  } = useLocation();

  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  // Edit states for sections
  const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [isEditingTalent, setIsEditingTalent] = useState(false);

  // Personal Info Form State
  const [personalForm, setPersonalForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    bio: '',
  });
  const [personalErrors, setPersonalErrors] = useState({});

  // Location Form State
  const [locationForm, setLocationForm] = useState({
    city: '',
    address: '',
  });

  // Photo State
  const [selectedPhotoFile, setSelectedPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // Provider / Talent State
  const [talents, setTalents] = useState([]);
  const [activeTalent, setActiveTalent] = useState(null);
  const [categories, setCategories] = useState([]);
  const [talentForm, setTalentForm] = useState({
    category_id: '',
    title: '',
    description: '',
    price_per_hour: '',
    experience_years: '1',
    availability_notes: '',
  });
  const [talentErrors, setTalentErrors] = useState({});

  // Loading States
  const [isSavingPersonal, setIsSavingPersonal] = useState(false);
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);
  const [isSavingLocation, setIsSavingLocation] = useState(false);
  const [isSavingTalent, setIsSavingTalent] = useState(false);
  const [isTogglingProvider, setIsTogglingProvider] = useState(false);
  const [isTogglingOnline, setIsTogglingOnline] = useState(false);

  // Initialize data on load / user change
  useEffect(() => {
    if (user) {
      setPersonalForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone_number: user.profile?.phone_number || '',
        bio: user.profile?.bio || '',
      });
      setPhotoPreview(user.profile?.profile_photo || user.profile?.avatar || null);
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

  // Load talents and categories if provider
  const loadProviderTalents = async () => {
    if (!isProvider) return;
    try {
      const [talentData, catData] = await Promise.all([
        talentService.getMyTalents(),
        talentService.getCategories(),
      ]);
      const talentList = Array.isArray(talentData) ? talentData : talentData.results || [];
      setTalents(talentList);
      const active = talentList.find((t) => t.is_active) || talentList[0] || null;
      setActiveTalent(active);

      const catList = Array.isArray(catData) ? catData : catData.results || [];
      setCategories(catList);

      if (active) {
        setTalentForm({
          category_id: active.category?.id || active.category_id || (catList[0]?.id || ''),
          title: active.title || '',
          description: active.description || '',
          price_per_hour: active.price_per_hour || '',
          experience_years: String(active.experience_years || 1),
          availability_notes: active.availability_notes || '',
        });
      } else if (catList.length > 0) {
        setTalentForm((prev) => ({ ...prev, category_id: catList[0].id }));
      }
    } catch (err) {
      console.warn('Failed to load talents or categories in profile:', err);
    }
  };

  useEffect(() => {
    loadProviderTalents();
  }, [isProvider]);

  /* -------------------------------------------------------------
     1. Photo Handling
     ------------------------------------------------------------- */
  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showToast('Please select a valid image (JPG, PNG, or WEBP).', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size exceeds 5MB limit.', 'error');
      return;
    }

    setSelectedPhotoFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPhotoPreview(objectUrl);
  };

  const handleSaveSelectedPhoto = async () => {
    if (!selectedPhotoFile) return;
    setIsSavingPhoto(true);
    try {
      const data = new FormData();
      data.append('profile_photo', selectedPhotoFile);
      await updateProfile(data);
      setSelectedPhotoFile(null);
      showToast('Profile photo updated successfully!', 'success');
    } catch (err) {
      showToast('Failed to upload photo.', 'error');
    } finally {
      setIsSavingPhoto(false);
    }
  };

  const handleCancelPhotoPreview = () => {
    setSelectedPhotoFile(null);
    setPhotoPreview(user?.profile?.profile_photo || user?.profile?.avatar || null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemovePhoto = async () => {
    if (!window.confirm('Are you sure you want to remove your profile photo?')) return;
    setIsSavingPhoto(true);
    try {
      await removeProfilePhoto();
      setSelectedPhotoFile(null);
      setPhotoPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      showToast('Failed to remove photo.', 'error');
    } finally {
      setIsSavingPhoto(false);
    }
  };

  /* -------------------------------------------------------------
     2. Personal Information Handling
     ------------------------------------------------------------- */
  const validatePersonalForm = () => {
    const errors = {};
    if (!personalForm.first_name.trim()) {
      errors.first_name = 'First name is required.';
    }
    if (!personalForm.last_name.trim()) {
      errors.last_name = 'Last name is required.';
    }
    if (!personalForm.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(personalForm.email)) {
      errors.email = 'Please enter a valid email address.';
    }
    setPersonalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSavePersonalInfo = async (e) => {
    e.preventDefault();
    if (!validatePersonalForm()) return;

    setIsSavingPersonal(true);
    try {
      await updateProfile({
        first_name: personalForm.first_name.trim(),
        last_name: personalForm.last_name.trim(),
        email: personalForm.email.trim(),
        phone_number: personalForm.phone_number.trim(),
        bio: personalForm.bio.trim(),
      });
      setIsEditingPersonalInfo(false);
      setPersonalErrors({});
    } catch (err) {
      const respErrors = err.response?.data;
      if (respErrors && typeof respErrors === 'object') {
        setPersonalErrors(respErrors);
      }
      showToast('Failed to update personal information.', 'error');
    } finally {
      setIsSavingPersonal(false);
    }
  };

  const handleCancelPersonalInfo = () => {
    if (user) {
      setPersonalForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone_number: user.profile?.phone_number || '',
        bio: user.profile?.bio || '',
      });
    }
    setPersonalErrors({});
    setIsEditingPersonalInfo(false);
  };

  /* -------------------------------------------------------------
     3. Location Handling
     ------------------------------------------------------------- */
  const handleSaveManualLocation = async (e) => {
    e.preventDefault();
    setIsSavingLocation(true);
    try {
      await setManualLocation({
        lat: coordinates?.lat || 0.0,
        lng: coordinates?.lng || 0.0,
        city: locationForm.city || 'Custom Location',
        address: locationForm.address || '',
      });
      setIsEditingLocation(false);
    } catch (err) {
      showToast('Failed to save location.', 'error');
    } finally {
      setIsSavingLocation(false);
    }
  };

  /* -------------------------------------------------------------
     4. Provider Service / Talent Handling
     ------------------------------------------------------------- */
  const validateTalentForm = () => {
    const errors = {};
    if (!talentForm.title.trim()) {
      errors.title = 'Service title is required.';
    }
    if (!talentForm.category_id) {
      errors.category_id = 'Please select a service category.';
    }
    if (!talentForm.price_per_hour || isNaN(Number(talentForm.price_per_hour)) || Number(talentForm.price_per_hour) <= 0) {
      errors.price_per_hour = 'Please specify a valid hourly rate in ₹.';
    }
    setTalentErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveTalent = async (e) => {
    e.preventDefault();
    if (!validateTalentForm()) return;

    setIsSavingTalent(true);
    try {
      const payload = {
        category_id: parseInt(talentForm.category_id, 10),
        title: talentForm.title.trim(),
        description: talentForm.description.trim(),
        price_per_hour: parseFloat(talentForm.price_per_hour),
        experience_years: parseInt(talentForm.experience_years, 10) || 1,
        availability_notes: talentForm.availability_notes.trim(),
      };

      if (activeTalent) {
        await talentService.updateTalent(activeTalent.id, payload);
        showToast('Service details updated successfully!', 'success');
      } else {
        await talentService.createTalent(payload);
        showToast('New service profile created!', 'success');
      }

      await loadProviderTalents();
      setIsEditingTalent(false);
      setTalentErrors({});
    } catch (err) {
      const respErrors = err.response?.data;
      if (respErrors && typeof respErrors === 'object') {
        setTalentErrors(respErrors);
      }
      showToast('Failed to save service details.', 'error');
    } finally {
      setIsSavingTalent(false);
    }
  };

  const handleCancelTalentEdit = () => {
    if (activeTalent) {
      setTalentForm({
        category_id: activeTalent.category?.id || activeTalent.category_id || '',
        title: activeTalent.title || '',
        description: activeTalent.description || '',
        price_per_hour: activeTalent.price_per_hour || '',
        experience_years: String(activeTalent.experience_years || 1),
        availability_notes: activeTalent.availability_notes || '',
      });
    }
    setTalentErrors({});
    setIsEditingTalent(false);
  };

  const handleToggleProvider = async () => {
    setIsTogglingProvider(true);
    try {
      await enableProviderMode(!isProvider);
    } catch (err) {
      showToast('Failed to toggle provider mode.', 'error');
    } finally {
      setIsTogglingProvider(false);
    }
  };

  const handleToggleOnline = async () => {
    setIsTogglingOnline(true);
    try {
      if (isOnline) {
        await goOffline();
      } else {
        await goOnline();
      }
    } catch (err) {
      // Toast already shown in AuthContext
    } finally {
      setIsTogglingOnline(false);
    }
  };

  // Helper avatar display
  const userInitials = (
    (user?.first_name ? user.first_name[0] : '') +
    (user?.last_name ? user.last_name[0] : user?.username ? user.username[0] : 'U')
  ).toUpperCase() || 'U';

  const userDisplayName = user?.first_name || user?.last_name
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
    : user?.username || 'Vega Member';

  const hasCustomPhoto = Boolean(user?.profile?.profile_photo || user?.profile?.avatar);

  return (
    <div className="profile-page">
      {/* Hidden File Input for Photo Selection */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handlePhotoSelect}
        style={{ display: 'none' }}
      />

      {/* Header / Title */}
      <div className="profile-header-container">
        <h1 className="profile-title">Profile & Account Settings</h1>
        <p className="profile-subtitle">
          Manage your personal details, profile photo, service location, and provider status
        </p>
      </div>

      {/* =========================================================
          SECTION 1: PROFILE HEADER BANNER
          ========================================================= */}
      <div className="profile-card profile-banner-card">
        <div className="profile-banner-left">
          {/* Avatar with Camera Action */}
          <div className="profile-avatar-wrapper">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt={userDisplayName}
                className="profile-avatar-img"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <div className="profile-avatar-initials">{userInitials}</div>
            )}
            <button
              type="button"
              className="profile-avatar-edit-badge"
              onClick={() => fileInputRef.current?.click()}
              title="Change profile photo"
            >
              <Camera size={15} />
            </button>
          </div>

          {/* User Details */}
          <div className="profile-banner-info">
            <h2 className="profile-banner-name">{userDisplayName}</h2>
            <div className="profile-banner-meta">
              <span>@{user?.username}</span>
              <span>•</span>
              <span>{user?.email}</span>
            </div>

            <div className="profile-banner-badges">
              <span className={`role-badge ${isProvider ? 'role-badge-provider' : 'role-badge-customer'}`}>
                {isProvider ? <ShieldCheck size={13} /> : <User size={13} />}
                {isProvider ? 'Verified Service Provider' : 'Customer Account'}
              </span>

              {isProvider && (
                <span className={`status-pill ${isOnline ? 'status-pill-online' : 'status-pill-offline'}`}>
                  <span
                    className="status-dot-indicator"
                    style={{ backgroundColor: isOnline ? '#22c55e' : '#94a3b8' }}
                  />
                  {isOnline ? 'Active & Discoverable' : 'Offline'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Edit Profile Action */}
        <div>
          <button
            type="button"
            onClick={() => setIsEditingPersonalInfo(!isEditingPersonalInfo)}
            className={`btn ${isEditingPersonalInfo ? 'btn-secondary' : 'btn-outline'}`}
          >
            <Edit3 size={15} />
            {isEditingPersonalInfo ? 'Cancel Editing' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {/* =========================================================
          SECTION 2: PROFILE PHOTO MANAGEMENT (COMPACT)
          ========================================================= */}
      <div className="profile-card">
        <div className="profile-card-header">
          <div className="profile-card-title-group">
            <div className="profile-card-icon-box">
              <Camera size={20} />
            </div>
            <div>
              <h3 className="profile-card-title">Profile Photo</h3>
              <p className="profile-card-subtitle">
                A clear face photo helps clients and providers recognize and trust you.
              </p>
            </div>
          </div>
        </div>

        <div className="photo-manager-layout">
          <div className="photo-preview-box">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Photo preview"
                className="profile-avatar-img"
                style={{ width: '84px', height: '84px' }}
              />
            ) : (
              <div
                className="profile-avatar-initials"
                style={{ width: '84px', height: '84px', fontSize: '1.8rem' }}
              >
                {userInitials}
              </div>
            )}
          </div>

          <div className="photo-actions-group">
            <div className="photo-btn-row">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-outline btn-sm"
              >
                <Upload size={14} />
                {hasCustomPhoto ? 'Change Photo' : 'Upload Photo'}
              </button>

              {selectedPhotoFile && (
                <>
                  <button
                    type="button"
                    onClick={handleSaveSelectedPhoto}
                    disabled={isSavingPhoto}
                    className="btn btn-primary btn-sm"
                  >
                    <Check size={14} />
                    {isSavingPhoto ? 'Uploading...' : 'Save Photo'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelPhotoPreview}
                    disabled={isSavingPhoto}
                    className="btn btn-secondary btn-sm"
                  >
                    <X size={14} />
                    Cancel
                  </button>
                </>
              )}

              {hasCustomPhoto && !selectedPhotoFile && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  disabled={isSavingPhoto}
                  className="btn btn-outline btn-sm"
                  style={{ color: 'var(--danger-500)', borderColor: '#fca5a5' }}
                >
                  <Trash2 size={14} />
                  Remove Photo
                </button>
              )}
            </div>

            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Supported formats: JPG, PNG, or WEBP. Maximum file size: 5MB.
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================
          SECTION 3: PERSONAL INFORMATION (VIEW & EDIT MODE)
          ========================================================= */}
      <div className="profile-card">
        <div className="profile-card-header">
          <div className="profile-card-title-group">
            <div className="profile-card-icon-box">
              <User size={20} />
            </div>
            <div>
              <h3 className="profile-card-title">Personal Information</h3>
              <p className="profile-card-subtitle">
                Your legal name, contact details, and account credentials
              </p>
            </div>
          </div>

          {!isEditingPersonalInfo && (
            <button
              type="button"
              onClick={() => setIsEditingPersonalInfo(true)}
              className="btn btn-outline btn-sm"
            >
              <Edit3 size={14} /> Edit Details
            </button>
          )}
        </div>

        {isEditingPersonalInfo ? (
          /* EDIT PERSONAL INFO FORM */
          <form onSubmit={handleSavePersonalInfo}>
            <div className="edit-form-grid">
              <div className="form-group">
                <label className="form-label">
                  First Name <span style={{ color: 'var(--danger-500)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={personalForm.first_name}
                  onChange={(e) => setPersonalForm({ ...personalForm, first_name: e.target.value })}
                  className="form-input"
                  placeholder="e.g. Priya"
                  required
                />
                {personalErrors.first_name && (
                  <span className="form-error">{personalErrors.first_name}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Last Name <span style={{ color: 'var(--danger-500)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={personalForm.last_name}
                  onChange={(e) => setPersonalForm({ ...personalForm, last_name: e.target.value })}
                  className="form-input"
                  placeholder="e.g. Sharma"
                  required
                />
                {personalErrors.last_name && (
                  <span className="form-error">{personalErrors.last_name}</span>
                )}
              </div>
            </div>

            <div className="edit-form-grid" style={{ marginTop: '0.5rem' }}>
              <div className="form-group">
                <label className="form-label">
                  Email Address <span style={{ color: 'var(--danger-500)' }}>*</span>
                </label>
                <input
                  type="email"
                  value={personalForm.email}
                  onChange={(e) => setPersonalForm({ ...personalForm, email: e.target.value })}
                  className="form-input"
                  placeholder="e.g. priya@example.com"
                  required
                />
                {personalErrors.email && (
                  <span className="form-error">{personalErrors.email}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  value={personalForm.phone_number}
                  onChange={(e) => setPersonalForm({ ...personalForm, phone_number: e.target.value })}
                  className="form-input"
                  placeholder="+91 98765 43210"
                />
                {personalErrors.phone_number && (
                  <span className="form-error">{personalErrors.phone_number}</span>
                )}
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '0.5rem' }}>
              <label className="form-label">About / Bio</label>
              <textarea
                rows={3}
                value={personalForm.bio}
                onChange={(e) => setPersonalForm({ ...personalForm, bio: e.target.value })}
                className="form-textarea"
                placeholder="Share a short bio or background about yourself..."
              />
              {personalErrors.bio && <span className="form-error">{personalErrors.bio}</span>}
            </div>

            <div className="form-actions-row">
              <button
                type="button"
                onClick={handleCancelPersonalInfo}
                disabled={isSavingPersonal}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingPersonal}
                className="btn btn-primary"
                style={{ minWidth: '140px' }}
              >
                <Check size={16} />
                {isSavingPersonal ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          /* READ-ONLY PERSONAL INFO VIEW */
          <div>
            <div className="info-display-grid">
              <div className="info-item">
                <User size={18} className="info-item-icon" />
                <div className="info-item-content">
                  <span className="info-item-label">Full Name</span>
                  <span className="info-item-value">{userDisplayName}</span>
                </div>
              </div>

              <div className="info-item">
                <Mail size={18} className="info-item-icon" />
                <div className="info-item-content">
                  <span className="info-item-label">Email Address</span>
                  <span className="info-item-value">{user?.email || '—'}</span>
                </div>
              </div>

              <div className="info-item">
                <Phone size={18} className="info-item-icon" />
                <div className="info-item-content">
                  <span className="info-item-label">Phone Number</span>
                  <span className="info-item-value">
                    {user?.profile?.phone_number || 'Not provided'}
                  </span>
                </div>
              </div>

              <div className="info-item">
                <MapPin size={18} className="info-item-icon" />
                <div className="info-item-content">
                  <span className="info-item-label">Saved Location</span>
                  <span className="info-item-value">
                    {coordinates?.city || 'Location not set'} {coordinates?.address ? `(${coordinates.address})` : ''}
                  </span>
                </div>
              </div>
            </div>

            {user?.profile?.bio && (
              <div className="info-bio-card">
                <span className="info-item-label">About / Bio</span>
                <p style={{ color: 'var(--slate-800)', fontSize: '0.9375rem', marginTop: '0.35rem', lineHeight: 1.6 }}>
                  {user.profile.bio}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* =========================================================
          SECTION 4: SERVICE & GPS LOCATION
          ========================================================= */}
      <div className="profile-card">
        <div className="profile-card-header">
          <div className="profile-card-title-group">
            <div className="profile-card-icon-box">
              <MapPin size={20} />
            </div>
            <div>
              <h3 className="profile-card-title">Saved Location & GPS</h3>
              <p className="profile-card-subtitle">
                Accurate coordinates are required for calculating distances and matching nearby providers
              </p>
            </div>
          </div>
        </div>

        <div className="location-display-row">
          <div className="location-text-group">
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-100)',
                color: 'var(--primary-700)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Navigation size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <strong style={{ fontSize: '1rem', color: 'var(--slate-900)' }}>
                  {coordinates?.city || 'Location not set'}
                </strong>
                {coordinates?.address && (
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    • {coordinates.address}
                  </span>
                )}
              </div>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                Coordinates: {coordinates?.lat ? `${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}` : 'GPS not synchronized yet'}
              </span>
            </div>
          </div>

          <div className="location-actions-group">
            <button
              type="button"
              onClick={requestBrowserLocation}
              disabled={isDetecting}
              className="btn btn-primary btn-sm"
            >
              <Navigation size={14} className={isDetecting ? 'spin-animation' : ''} />
              {isDetecting ? 'Detecting GPS...' : 'Update via GPS'}
            </button>

            <button
              type="button"
              onClick={() => setIsEditingLocation(!isEditingLocation)}
              className="btn btn-outline btn-sm"
            >
              {isEditingLocation ? 'Cancel' : 'Edit Manually'}
            </button>
          </div>
        </div>

        {locationError && (
          <div className="location-alert-box location-alert-warning">
            <AlertCircle size={18} />
            <span>{locationError}</span>
          </div>
        )}

        {isEditingLocation && (
          <form
            onSubmit={handleSaveManualLocation}
            style={{
              marginTop: '1.25rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--border-color)',
            }}
          >
            <div className="edit-form-grid">
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  value={locationForm.city}
                  onChange={(e) => setLocationForm({ ...locationForm, city: e.target.value })}
                  className="form-input"
                  placeholder="e.g. Your City"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Address / Landmark</label>
                <input
                  type="text"
                  value={locationForm.address}
                  onChange={(e) => setLocationForm({ ...locationForm, address: e.target.value })}
                  className="form-input"
                  placeholder="e.g. Kurnool Road, Gandhi Nagar"
                />
              </div>
            </div>

            <div className="form-actions-row">
              <button
                type="button"
                onClick={() => setIsEditingLocation(false)}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingLocation}
                className="btn btn-primary btn-sm"
              >
                <Check size={14} />
                {isSavingLocation ? 'Saving...' : 'Save Location'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* =========================================================
          SECTION 5: PROVIDER PROFILE DASHBOARD
          ========================================================= */}
      {isProvider ? (
        <div className="profile-card provider-dashboard-card">
          <div className="profile-card-header">
            <div className="profile-card-title-group">
              <div className="profile-card-icon-box" style={{ backgroundColor: '#dcfce7', color: '#15803d' }}>
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="profile-card-title" style={{ color: '#14532d' }}>
                  Provider Service Profile
                </h3>
                <p className="profile-card-subtitle" style={{ color: '#166534' }}>
                  Your public marketplace offering, pricing, and live availability
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleToggleOnline}
                disabled={isTogglingOnline}
                className={`btn btn-sm ${isOnline ? 'btn-danger' : 'btn-success'}`}
              >
                <Activity size={14} />
                {isOnline ? 'Go Offline' : 'Go Online'}
              </button>

              <button
                type="button"
                onClick={handleToggleProvider}
                disabled={isTogglingProvider}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.75rem' }}
              >
                Disable Provider Mode
              </button>
            </div>
          </div>

          {/* Service Details Card / Edit Mode */}
          {isEditingTalent ? (
            <form onSubmit={handleSaveTalent} className="provider-talent-details">
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '1.25rem' }}>
                {activeTalent ? 'Edit Active Service Offering' : 'Create Your Service Offering'}
              </h4>

              <div className="edit-form-grid">
                <div className="form-group">
                  <label className="form-label">
                    Service Category <span style={{ color: 'var(--danger-500)' }}>*</span>
                  </label>
                  <select
                    value={talentForm.category_id}
                    onChange={(e) => setTalentForm({ ...talentForm, category_id: e.target.value })}
                    className="form-select"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {talentErrors.category_id && <span className="form-error">{talentErrors.category_id}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Service Title <span style={{ color: 'var(--danger-500)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={talentForm.title}
                    onChange={(e) => setTalentForm({ ...talentForm, title: e.target.value })}
                    className="form-input"
                    placeholder="e.g. Master Bridal Mehendi Artist"
                    required
                  />
                  {talentErrors.title && <span className="form-error">{talentErrors.title}</span>}
                </div>
              </div>

              <div className="edit-form-grid" style={{ marginTop: '0.5rem' }}>
                <div className="form-group">
                  <label className="form-label">
                    Hourly Rate (₹ INR) <span style={{ color: 'var(--danger-500)' }}>*</span>
                  </label>
                  <input
                    type="number"
                    step="50"
                    min="100"
                    value={talentForm.price_per_hour}
                    onChange={(e) => setTalentForm({ ...talentForm, price_per_hour: e.target.value })}
                    className="form-input"
                    placeholder="e.g. 500"
                    required
                  />
                  {talentErrors.price_per_hour && <span className="form-error">{talentErrors.price_per_hour}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Years of Experience</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={talentForm.experience_years}
                    onChange={(e) => setTalentForm({ ...talentForm, experience_years: e.target.value })}
                    className="form-input"
                    placeholder="e.g. 5"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '0.5rem' }}>
                <label className="form-label">Service Description</label>
                <textarea
                  rows={3}
                  value={talentForm.description}
                  onChange={(e) => setTalentForm({ ...talentForm, description: e.target.value })}
                  className="form-textarea"
                  placeholder="Describe your expertise, equipment, and what clients can expect..."
                />
              </div>

              <div className="form-group" style={{ marginTop: '0.5rem' }}>
                <label className="form-label">Availability Notes</label>
                <input
                  type="text"
                  value={talentForm.availability_notes}
                  onChange={(e) => setTalentForm({ ...talentForm, availability_notes: e.target.value })}
                  className="form-input"
                  placeholder="e.g. Available Mon - Sat, 9 AM - 7 PM"
                />
              </div>

              <div className="form-actions-row">
                <button
                  type="button"
                  onClick={handleCancelTalentEdit}
                  disabled={isSavingTalent}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingTalent}
                  className="btn btn-primary"
                  style={{ minWidth: '150px' }}
                >
                  <Check size={16} />
                  {isSavingTalent ? 'Saving Service...' : 'Save Service Details'}
                </button>
              </div>
            </form>
          ) : activeTalent ? (
            <div className="provider-talent-details">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      color: 'var(--primary-600)',
                      letterSpacing: '0.05em',
                      backgroundColor: 'var(--primary-50)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                    }}
                  >
                    {activeTalent.category?.name || 'General Service'}
                  </span>
                  <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '6px' }}>
                    {activeTalent.title}
                  </h4>
                  <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem', marginTop: '0.35rem', lineHeight: 1.6 }}>
                    {activeTalent.description || 'No description provided.'}
                  </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--primary-700)' }}>
                    ₹{activeTalent.price_per_hour}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>
                    per hour
                  </span>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="talent-metric-grid">
                <div className="talent-metric-item">
                  <div className="talent-metric-icon">
                    <Briefcase size={16} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Experience</span>
                    <strong>{activeTalent.experience_years} years</strong>
                  </div>
                </div>

                <div className="talent-metric-item">
                  <div className="talent-metric-icon" style={{ color: '#d97706', backgroundColor: '#fef3c7' }}>
                    <Star size={16} fill="currentColor" />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Rating & Reviews</span>
                    <strong>
                      {Number(user?.profile?.average_rating || 0).toFixed(1)} ★ ({user?.profile?.total_reviews || 0} reviews)
                    </strong>
                  </div>
                </div>

                <div className="talent-metric-item">
                  <div className="talent-metric-icon">
                    <Clock size={16} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Availability</span>
                    <strong style={{ fontSize: '0.8125rem' }}>
                      {activeTalent.availability_notes || 'Standard Weekday Hours'}
                    </strong>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', flexWrap: 'wrap', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsEditingTalent(true)}
                  className="btn btn-outline btn-sm"
                >
                  <Edit3 size={14} /> Edit Service Details
                </button>

                <Link to="/my-talents" className="btn btn-primary btn-sm">
                  <Sparkles size={14} /> Manage All Talents ({talents.length})
                </Link>
              </div>
            </div>
          ) : (
            <div className="provider-talent-details" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
              <p style={{ color: 'var(--slate-600)', marginBottom: '1.25rem' }}>
                You have not created a service offering yet. Set up your skill and pricing to accept local bookings.
              </p>
              <button
                type="button"
                onClick={() => setIsEditingTalent(true)}
                className="btn btn-primary"
              >
                <Sparkles size={16} /> Create Service Offering
              </button>
            </div>
          )}
        </div>
      ) : (
        /* BECOME A PROVIDER PROMO CARD */
        <div className="profile-card" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--primary-100)',
                  color: 'var(--primary-700)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Radio size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                  Offer Services on VEGA
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Join verified professionals, set your own hourly pricing, and get booked directly.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleProvider}
              disabled={isTogglingProvider}
              className="btn btn-primary"
            >
              <Sparkles size={16} /> Enable Provider Mode
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
