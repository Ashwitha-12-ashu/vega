import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { talentService } from '../../services/talentService';
import {
  Sparkles,
  Plus,
  Check,
  Power,
  Edit2,
  Trash2,
  AlertTriangle,
  Clock,
  Briefcase,
  X,
  Radio,
} from 'lucide-react';

const MyTalents = () => {
  const { user, isOnline, goOnline, goOffline, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [talents, setTalents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State for Add / Edit Talent
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTalent, setEditingTalent] = useState(null);
  const [formData, setFormData] = useState({
    category_id: '',
    title: '',
    description: '',
    price_per_hour: '',
    experience_years: '2',
    availability_notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [talentsData, catData] = await Promise.all([
        talentService.getMyTalents(),
        talentService.getCategories(),
      ]);
      setTalents(talentsData.results || talentsData || []);
      setCategories(catData.results || catData || []);
    } catch (err) {
      console.error('Failed to load talents:', err);
      showToast('Could not load your talents.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingTalent(null);
    setFormData({
      category_id: categories.length > 0 ? categories[0].id : '',
      title: '',
      description: '',
      price_per_hour: '',
      experience_years: '2',
      availability_notes: '',
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (talent) => {
    setEditingTalent(talent);
    setFormData({
      category_id: talent.category?.id || '',
      title: talent.title,
      description: talent.description,
      price_per_hour: talent.price_per_hour,
      experience_years: String(talent.experience_years),
      availability_notes: talent.availability_notes || '',
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category_id || !formData.title || !formData.price_per_hour) {
      setFormError('Please fill out all required fields.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      if (editingTalent) {
        await talentService.updateTalent(editingTalent.id, formData);
        showToast(`Talent '${formData.title}' updated successfully.`, 'success');
      } else {
        await talentService.createTalent(formData);
        showToast(`New talent '${formData.title}' created!`, 'success');
      }
      setModalOpen(false);
      loadData();
      refreshUser();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.detail || 'Failed to save talent.';
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActivateTalent = async (talentId) => {
    try {
      const res = await talentService.activateTalent(talentId);
      showToast(res.message, 'success');
      loadData();
      refreshUser();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to activate talent.';
      showToast(msg, 'error');
    }
  };

  const handleDeleteTalent = async (talentId) => {
    if (!window.confirm('Are you sure you want to delete this talent offering?')) return;
    try {
      await talentService.deleteTalent(talentId);
      showToast('Talent deleted successfully.', 'info');
      loadData();
      refreshUser();
    } catch (err) {
      showToast('Could not delete talent.', 'error');
    }
  };

  const handleToggleOnline = async () => {
    try {
      if (isOnline) {
        await goOffline();
      } else {
        await goOnline();
      }
      refreshUser();
    } catch (e) {
      // Handled by AuthContext toast
    }
  };

  const activeTalent = talents.find((t) => t.is_active);

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '1000px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            My Talents & Services
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
            Add multiple service offerings. <strong style={{ color: 'var(--primary-700)' }}>Only one talent can be active at a time.</strong>
          </p>
        </div>

        <button onClick={handleOpenAddModal} className="btn btn-primary">
          <Plus size={18} /> Add New Talent
        </button>
      </div>

      {/* Online Status Master Banner */}
      <div
        className="card"
        style={{
          padding: '1.5rem 2rem',
          backgroundColor: isOnline ? '#f0fdf4' : '#f8fafc',
          borderColor: isOnline ? '#bbf7d0' : 'var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: isOnline ? '#dcfce7' : '#e2e8f0',
              color: isOnline ? '#15803d' : '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Power size={22} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                Provider Status: {isOnline ? 'ONLINE' : 'OFFLINE'}
              </h3>
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: isOnline ? '#22c55e' : '#94a3b8',
                }}
              />
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--slate-600)', marginTop: '2px' }}>
              {isOnline
                ? `You are discoverable to nearby customers for '${activeTalent?.title || 'Active Service'}'.`
                : 'Turn ONLINE to start receiving booking requests from nearby customers.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleToggleOnline}
          className={`btn  ${isOnline ? 'btn-danger' : 'btn-success'}`}
        >
          <Power size={16} />
          {isOnline ? 'Go Offline' : 'Go Online Now'}
        </button>
      </div>

      {/* Critical Rule Notification Callout */}
      <div
        style={{
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.25rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.875rem',
          color: '#1e40af',
        }}
      >
        <Sparkles size={20} color="#3b82f6" style={{ flexShrink: 0 }} />
        <span>
          <strong>VEGA Rule:</strong> You can manage multiple talents, but you may have <strong>ONLY ONE active talent at a time</strong>. Activating another service will automatically deactivate your previous one.
        </span>
      </div>

      {/* Talents Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>Loading your talents...</p>
        </div>
      ) : talents.length > 0 ? (
        <div className="grid-2">
          {talents.map((talent) => {
            const isActive = talent.is_active;

            return (
              <div
                key={talent.id}
                className="card"
                style={{
                  border: isActive ? '2px solid var(--primary-600)' : '1px solid var(--border-color)',
                  backgroundColor: isActive ? '#fbfbfe' : '#ffffff',
                  boxShadow: isActive ? '0 4px 14px rgba(99, 102, 241, 0.15)' : 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                }}
              >
                {/* Active Pill */}
                {isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-12px',
                      right: '16px',
                      backgroundColor: 'var(--primary-600)',
                      color: '#ffffff',
                      fontSize: '0.6875rem',
                      fontWeight: 800,
                      padding: '2px 10px',
                      borderRadius: 'var(--radius-full)',
                      letterSpacing: '0.05em',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <Check size={12} /> ACTIVE TALENT
                  </div>
                )}

                {/* Card Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary-600)' }}>
                      {talent.category?.name}
                    </span>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--slate-900)', marginTop: '2px' }}>
                      {talent.title}
                    </h3>
                  </div>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                     ₹{talent.price_per_hour}/hr
                  </span>
                </div>

                <p style={{ color: 'var(--slate-600)', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '1rem', flex: 1 }}>
                  {talent.description}
                </p>

                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8125rem', color: 'var(--slate-600)', marginBottom: '1.25rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Briefcase size={14} color="var(--primary-600)" />
                    {talent.experience_years} years exp
                  </span>
                  {talent.availability_notes && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={14} color="var(--primary-600)" />
                      {talent.availability_notes}
                    </span>
                  )}
                </div>

                {/* Card Actions */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid var(--border-color)',
                    paddingTop: '0.875rem',
                  }}
                >
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleOpenEditModal(talent)}
                      className="btn btn-secondary btn-sm"
                      title="Edit Talent"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteTalent(talent.id)}
                      className="btn btn-secondary btn-sm"
                      style={{ color: 'var(--danger-500)' }}
                      title="Delete Talent"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {isActive ? (
                    <button
                      disabled
                      className="btn btn-sm"
                      style={{
                        backgroundColor: '#dcfce7',
                        color: '#15803d',
                        border: '1px solid #bbf7d0',
                        fontWeight: 700,
                      }}
                    >
                      <Check size={14} /> Active Service
                    </button>
                  ) : (
                    <button
                      onClick={() => handleActivateTalent(talent.id)}
                      className="btn btn-outline btn-sm"
                    >
                      Activate This Talent
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Sparkles size={36} color="var(--primary-600)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            You have not added any talents yet
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginBottom: '1.5rem' }}>
            Add your primary service or skills to become discoverable to customers.
          </p>
          <button onClick={handleOpenAddModal} className="btn btn-primary">
            <Plus size={16} /> Add Your First Talent
          </button>
        </div>
      )}

      {/* Add / Edit Talent Modal */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                {editingTalent ? 'Edit Talent Offering' : 'Add New Talent Offering'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-500)' }}
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div style={{ backgroundColor: 'var(--danger-50)', color: 'var(--danger-600)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label className="form-label">Service Category</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
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
              </div>

              <div className="form-group">
                <label className="form-label">Service Title</label>
                <input
                  type="text"
                  placeholder="e.g. Master Bridal Makeup & Hair Styling"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="form-input"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Price per Hour (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="50.00"
                    value={formData.price_per_hour}
                    onChange={(e) => setFormData({ ...formData, price_per_hour: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Experience (Years)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="3"
                    value={formData.experience_years}
                    onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Detailed Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe your skills, tools, and what is included in the service..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-textarea"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Availability Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Weekdays 9 AM - 6 PM, Emergencies 24/7"
                  value={formData.availability_notes}
                  onChange={(e) => setFormData({ ...formData, availability_notes: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                  {isSubmitting ? 'Saving...' : editingTalent ? 'Update Talent' : 'Create Talent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTalents;
