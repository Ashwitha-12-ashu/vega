import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLocation } from '../../context/LocationContext';
import { locationService } from '../../services/locationService';
import { talentService } from '../../services/talentService';
import LocationBanner from '../../components/LocationBanner';
import ProviderCard from '../../components/ProviderCard';
import { ProviderSkeleton } from '../../components/SkeletonLoader';
import { MapPin, Sliders, Search, Star, Layers, Map as MapIcon, Grid } from 'lucide-react';

const NearbyProviders = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { coordinates, radius, setRadius } = useLocation();

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [minRating, setMinRating] = useState(searchParams.get('min_rating') || '');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'

  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    talentService.getCategories().then((data) => setCategories(data.results || data)).catch(() => {});
  }, []);

  const loadProviders = async () => {
    if (!coordinates.lat || !coordinates.lng) return;
    setLoading(true);

    try {
      const data = await locationService.getNearbyProviders({
        lat: coordinates.lat,
        lng: coordinates.lng,
        radius,
        category: selectedCategory,
        search: searchQuery,
        min_rating: minRating,
      });
      setProviders(data.results || []);
    } catch (err) {
      console.error('Error fetching nearby providers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProviders();
  }, [coordinates.lat, coordinates.lng, radius, selectedCategory, minRating]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadProviders();
  };

  const handleBookNow = (provider) => {
    if (provider.active_talent) {
      navigate(`/book/${provider.active_talent.id}`, { state: { provider } });
    } else {
      navigate(`/providers/${provider.provider_id || provider.id}`);
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            Nearby Service Discovery
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
            Showing verified active professionals within {radius} km of your coordinates ({coordinates.lat}, {coordinates.lng})
          </p>
        </div>

        {/* View Mode Toggle */}
        <div style={{ display: 'flex', backgroundColor: 'var(--slate-100)', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
          <button
            onClick={() => setViewMode('grid')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.375rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.8125rem',
              backgroundColor: viewMode === 'grid' ? '#ffffff' : 'transparent',
              color: viewMode === 'grid' ? 'var(--primary-600)' : 'var(--slate-600)',
              boxShadow: viewMode === 'grid' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            <Grid size={15} /> Grid View
          </button>
          <button
            onClick={() => setViewMode('map')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.375rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.8125rem',
              backgroundColor: viewMode === 'map' ? '#ffffff' : 'transparent',
              color: viewMode === 'map' ? 'var(--primary-600)' : 'var(--slate-600)',
              boxShadow: viewMode === 'map' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            <MapIcon size={15} /> Proximity Map
          </button>
        </div>
      </div>

      <LocationBanner showRadiusSelector={true} onSearchTrigger={loadProviders} />

      {/* Filter Toolbar */}
      <div
        className="card"
        style={{
          padding: '1.25rem',
          marginBottom: '2rem',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: 2, minWidth: '240px' }}>
          <input
            type="text"
            placeholder="Search provider, skill or service title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
          />
          <button type="submit" className="btn btn-primary btn-sm">
            <Search size={16} />
          </button>
        </form>

        <div style={{ flex: 1, minWidth: '180px' }}>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="form-select"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ flex: 1, minWidth: '150px' }}>
          <select
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
            className="form-select"
          >
            <option value="">Any Rating</option>
            <option value="4.5">4.5 ★ & Above</option>
            <option value="4.0">4.0 ★ & Above</option>
            <option value="3.0">3.0 ★ & Above</option>
          </select>
        </div>
      </div>

      {/* View Content: Grid or Proximity Map */}
      {viewMode === 'map' ? (
        <div
          className="card"
          style={{
            padding: '2rem',
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-xl)',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--slate-900)' }}>
              Proximity Visualizer (Search Radius: {radius} km)
            </h3>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Center: {coordinates.city} ({coordinates.lat}, {coordinates.lng})
            </span>
          </div>

          {/* Interactive Simulated Radar / Spatial Radar Pin Board */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '420px',
              backgroundColor: '#f8fafc',
              borderRadius: 'var(--radius-lg)',
              border: '2px dashed var(--slate-300)',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Concentric Radius Circles */}
            <div style={{ position: 'absolute', width: '360px', height: '360px', borderRadius: '50%', border: '1px solid var(--primary-200)', opacity: 0.6 }} />
            <div style={{ position: 'absolute', width: '240px', height: '240px', borderRadius: '50%', border: '1px solid var(--primary-200)', opacity: 0.6 }} />
            <div style={{ position: 'absolute', width: '120px', height: '120px', borderRadius: '50%', border: '1px solid var(--primary-300)', opacity: 0.8 }} />

            {/* Customer Center Marker */}
            <div
              style={{
                position: 'relative',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-600)',
                  border: '3px solid #ffffff',
                  boxShadow: '0 0 12px rgba(79, 70, 229, 0.6)',
                }}
              />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-800)', marginTop: '4px', backgroundColor: '#ffffff', padding: '2px 6px', borderRadius: '4px' }}>
                YOU ({coordinates.city})
              </span>
            </div>

            {/* Provider Pins plotted by distance relative to radius */}
            {providers.map((p, index) => {
              const angle = (index * 360) / Math.max(providers.length, 1) + 45;
              const normalizedDist = (p.distance_km / radius) * 150; // max 150px offset
              const rad = (angle * Math.PI) / 180;
              const topOffset = Math.sin(rad) * normalizedDist;
              const leftOffset = Math.cos(rad) * normalizedDist;

              return (
                <div
                  key={p.provider_id || p.id}
                  style={{
                    position: 'absolute',
                    transform: `translate(${leftOffset}px, ${topOffset}px)`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    zIndex: 20,
                  }}
                  onClick={() => handleBookNow(p)}
                  title={`${p.provider_name} - ${p.active_talent?.title} (${p.distance_km} km)`}
                >
                  <div
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#ffffff',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-md)',
                      border: '1px solid var(--primary-300)',
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      color: 'var(--slate-900)',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
                    {p.provider_name} ({p.distance_km} km)
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Provider List Grid */}
      {loading ? (
        <div className="grid-3">
          <ProviderSkeleton />
          <ProviderSkeleton />
          <ProviderSkeleton />
        </div>
      ) : providers.length > 0 ? (
        <div className="grid-3">
          {providers.map((p) => (
            <ProviderCard key={p.provider_id || p.id} provider={p} onBookNow={handleBookNow} />
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '0.5rem' }}>
            No providers found matching your search
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
            Try expanding your search radius or selecting a different service category.
          </p>
        </div>
      )}
    </div>
  );
};

export default NearbyProviders;
