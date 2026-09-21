import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { talentService } from '../../services/talentService';
import { locationService } from '../../services/locationService';
import { useLocation } from '../../context/LocationContext';
import ProviderCard from '../../components/ProviderCard';
import { ProviderSkeleton } from '../../components/SkeletonLoader';
import {
  Search,
  Sparkles,
  Zap,
  Wrench,
  Scissors,
  Hammer,
  Paintbrush,
  Car,
  ChevronRight,
  MapPin,
  LocateFixed,
  ArrowRight,
  ShieldCheck,
  Star,
  Users
} from 'lucide-react';
import './ServiceDetails.css';

// Fallback category visual metadata
const categoryVisuals = {
  electrician: { icon: Zap, bg: '#fef3c7', color: '#d97706', desc: 'Wiring, fixtures, switches, tripping repairs & appliance setup' },
  plumber: { icon: Wrench, bg: '#dbeafe', color: '#2563eb', desc: 'Leakage, pipeline repair, tap fitting, geyser & drainage' },
  cleaning: { icon: Sparkles, bg: '#f3e8ff', color: '#9333ea', desc: 'Deep home cleaning, bathroom disinfection & sofa sanitization' },
  salon: { icon: Scissors, bg: '#fce7f3', color: '#db2777', desc: 'Hair styling, bridal mehendi, facials & grooming at home' },
  carpenter: { icon: Hammer, bg: '#ffedd5', color: '#ea580c', desc: 'Furniture repair, modular woodwork, door locks & hinges' },
  painter: { icon: Paintbrush, bg: '#dcfce7', color: '#16a34a', desc: 'Interior & exterior painting, waterproofing & wall putty' },
  'car-repair': { icon: Car, bg: '#fee2e2', color: '#dc2626', desc: 'Vehicle breakdown assistance, battery jump-start & servicing' },
};

const ServiceDetails = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { coordinates, radius, requestBrowserLocation, isDetecting } = useLocation();

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [providers, setProviders] = useState([]);
  const [diagnostics, setDiagnostics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Load Categories on mount
  useEffect(() => {
    talentService
      .getCategories()
      .then((data) => {
        const list = Array.isArray(data) ? data : data.results || [];
        setCategories(list);
      })
      .catch((err) => console.error('Failed to load service categories:', err))
      .finally(() => setCategoriesLoading(false));
  }, []);

  // Sync with URL params
  useEffect(() => {
    const cat = searchParams.get('category') || '';
    const query = searchParams.get('search') || '';
    setSelectedCategory(cat);
    setSearchQuery(query);
  }, [searchParams]);

  // Fetch Providers whenever filters or coordinates change
  const loadProviders = async () => {
    setLoading(true);
    try {
      const queryParams = {
        radius: radius || 15,
        category: selectedCategory,
        search: searchQuery,
      };

      if (coordinates?.lat && coordinates?.lng) {
        queryParams.lat = coordinates.lat;
        queryParams.lng = coordinates.lng;
      }

      const data = await locationService.getNearbyProviders(queryParams);
      setProviders(data.results || []);
      setDiagnostics(data.diagnostics || null);
    } catch (err) {
      console.error('Failed to load providers:', err);
      setProviders([]);
      setDiagnostics(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProviders();
  }, [selectedCategory, searchQuery, coordinates?.lat, coordinates?.lng, radius]);

  const handleCategoryClick = (category) => {
    const slug = category.slug || category.name.toLowerCase();
    const newCategory = selectedCategory === slug ? '' : slug;
    setSelectedCategory(newCategory);
    setSearchParams(newCategory ? { category: newCategory } : {});

    // Scroll smoothly to results
    const resultsElem = document.getElementById('providers-results-section');
    if (resultsElem) {
      resultsElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    setSearchParams(trimmed ? { search: trimmed } : {});
    
    // Scroll smoothly to results
    const resultsElem = document.getElementById('providers-results-section');
    if (resultsElem) {
      resultsElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleBookNow = (provider) => {
    const providerId = provider.provider_id || provider.id;
    if (provider.active_talent) {
      navigate(`/book/${provider.active_talent.id}`, { state: { provider } });
    } else {
      navigate(`/providers/${providerId}`);
    }
  };

  const getVisual = (catName, catSlug) => {
    const key = (catSlug || catName || '').toLowerCase().replace(/\s+/g, '-');
    return (
      categoryVisuals[key] || {
        icon: Sparkles,
        bg: '#eef2ff',
        color: '#4f46e5',
        desc: 'Professional verified local home services',
      }
    );
  };

  const renderEmptyState = () => {
    const reason = diagnostics?.empty_reason;

    if (reason === 'NO_LOCATION' || (!coordinates?.lat && !loading)) {
      return (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', borderRadius: 'var(--radius-xl)', backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <MapPin size={28} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#14532d', marginBottom: '0.5rem' }}>
            Enable Location to View Nearby Providers
          </h3>
          <p style={{ color: '#166534', fontSize: '0.9rem', maxWidth: '500px', margin: '0 auto 1.25rem' }}>
            VEGA uses your current device GPS coordinates to calculate real-time distance and match you with active professionals.
          </p>
          <button onClick={requestBrowserLocation} disabled={isDetecting} className="btn btn-primary">
            <LocateFixed size={16} className={isDetecting ? 'spin-animation' : ''} />
            {isDetecting ? 'Detecting GPS...' : 'Enable GPS Location'}
          </button>
        </div>
      );
    }

    if (reason === 'NO_PROVIDERS_FOR_SERVICE') {
      return (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <Search size={26} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '0.5rem' }}>
            No Providers Found for "{selectedCategory || searchQuery}"
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto 1.25rem' }}>
            There are currently no registered professionals for this service in your area.
          </p>
          <button onClick={() => { setSelectedCategory(''); setSearchQuery(''); setSearchParams({}); }} className="btn btn-primary btn-sm">
            View All Available Services
          </button>
        </div>
      );
    }

    if (reason === 'NO_ACTIVE_PROVIDERS') {
      return (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', borderRadius: 'var(--radius-xl)', backgroundColor: '#fffbeb', borderColor: '#fef3c7' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <span style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#92400e', marginBottom: '0.5rem' }}>
            Providers Exist but are Currently Offline
          </h3>
          <p style={{ color: '#b45309', fontSize: '0.9rem', maxWidth: '500px', margin: '0 auto 1.25rem' }}>
            We found {diagnostics?.total_matching_service || 1} registered provider(s) for this service, but none are currently online to accept immediate bookings.
          </p>
          <button onClick={() => { setSelectedCategory(''); setSearchParams({}); }} className="btn btn-primary btn-sm">
            Explore Other Active Services
          </button>
        </div>
      );
    }

    return (
      <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', borderRadius: 'var(--radius-xl)' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '0.5rem' }}>
          No professionals currently available
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
          Try selecting a different category or clearing your search filters.
        </p>
        <button onClick={() => { setSelectedCategory(''); setSearchQuery(''); setSearchParams({}); }} className="btn btn-primary btn-sm">
          Reset All Filters
        </button>
      </div>
    );
  };

  return (
    <div className="services-page">
      {/* Hero Header */}
      <div className="services-hero-header">
        <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary-600)', letterSpacing: '0.08em', backgroundColor: 'var(--primary-50)', padding: '0.3rem 0.8rem', borderRadius: '9999px', display: 'inline-block', marginBottom: '0.75rem' }}>
          Marketplace Directory
        </span>
        <h1 className="services-hero-title">Browse & Book Local Services</h1>
        <p className="services-hero-subtitle">
          Find verified, background-checked professionals ready to assist you on-demand.
        </p>
      </div>

      {/* Interactive Search Bar */}
      <div className="services-search-container">
        <form onSubmit={handleSearchSubmit} className="services-search-bar">
          <Search size={22} color="var(--primary-600)" style={{ flexShrink: 0 }} />
          <input
            type="text"
            className="services-search-input"
            placeholder="Search for a service or skill (e.g. Mehendi, Electrician, Plumber)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="services-search-btn">
            Find Providers
          </button>
        </form>
      </div>

      {/* Category Cards Grid */}
      <div style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '1.25rem' }}>
          Service Categories
        </h2>

        {categoriesLoading ? (
          <div className="grid-3">
            <div className="skeleton" style={{ height: '160px', borderRadius: 'var(--radius-xl)' }} />
            <div className="skeleton" style={{ height: '160px', borderRadius: 'var(--radius-xl)' }} />
            <div className="skeleton" style={{ height: '160px', borderRadius: 'var(--radius-xl)' }} />
          </div>
        ) : (
          <div className="services-category-grid">
            {categories.map((cat) => {
              const visual = getVisual(cat.name, cat.slug);
              const Icon = visual.icon;
              const isSelected =
                selectedCategory.toLowerCase() === (cat.slug || cat.name).toLowerCase();

              return (
                <div
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat)}
                  className={`service-cat-card ${isSelected ? 'active-cat' : ''}`}
                >
                  <div
                    className="service-cat-icon-wrapper"
                    style={{ backgroundColor: visual.bg, color: visual.color }}
                  >
                    <Icon size={26} />
                  </div>

                  <h3 className="service-cat-name">{cat.name}</h3>
                  <p className="service-cat-desc">{cat.description || visual.desc}</p>

                  <div className="service-cat-footer">
                    <span className="service-cat-count">
                      {cat.talents_count || 1}+ Active Pros
                    </span>
                    <span className="service-cat-action">
                      {isSelected ? 'Viewing Pros' : 'Find Providers'} <ChevronRight size={15} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Available Providers Section */}
      <div id="providers-results-section" style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
        <div className="services-results-header">
          <div>
            <h2 className="services-results-title">
              {selectedCategory
                ? `Available ${selectedCategory.toUpperCase()} Providers`
                : searchQuery
                ? `Search Results for "${searchQuery}"`
                : 'Top Available Providers'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Showing verified active professionals with real-time GPS proximity
            </p>
          </div>

          {(selectedCategory || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('');
                setSearchQuery('');
                setSearchParams({});
              }}
              className="btn btn-outline btn-sm"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Providers Grid */}
        {loading ? (
          <div className="grid-3">
            <ProviderSkeleton />
            <ProviderSkeleton />
            <ProviderSkeleton />
          </div>
        ) : providers.length > 0 ? (
          <div className="grid-3">
            {providers.map((p) => (
              <ProviderCard
                key={p.provider_id || p.id}
                provider={p}
                onBookNow={handleBookNow}
              />
            ))}
          </div>
        ) : (
          renderEmptyState()
        )}
      </div>
    </div>
  );
};

export default ServiceDetails;
