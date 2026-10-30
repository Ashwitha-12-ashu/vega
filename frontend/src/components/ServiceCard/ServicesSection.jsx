import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid2X2,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ServiceCard } from './ServiceCard';
import { talentService } from '../../services/talentService';
import './ServiceCard.css';

// Default popular categories preferred in the first 5 slots if present in backend data
const POPULAR_PRIMARY_KEYWORDS = [
  'cleaning',
  'hair',
  'mehendi',
  'beauty',
  'agriculture',
  'makeup',
  'facial',
  'plumbing',
  'electrical',
];

export const ServicesSection = ({
  title = 'Our Services',
  subtitle = 'Discover verified professionals in your neighborhood',
  onSelectCategory,
  showTitle = true,
  className = '',
}) => {
  const navigate = useNavigate();
  const moreServicesRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOtherServicesExpanded, setIsOtherServicesExpanded] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // Load all categories from API
  useEffect(() => {
    let isMounted = true;
    talentService
      .getCategories()
      .then((data) => {
        if (!isMounted) return;
        const list = Array.isArray(data) ? data : data?.results || [];
        setCategories(list);
      })
      .catch((err) => {
        console.error('Failed to load categories for ServicesSection:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Partition categories into:
  // 1. Initial 5 Primary Services
  // 2. Remaining Services (for the "Other Services" expanded view)
  const { primaryServices, remainingServices } = useMemo(() => {
    if (categories.length === 0) {
      return { primaryServices: [], remainingServices: [] };
    }

    // Filter out "Other Services" entry from the category list so it doesn't duplicate
    const nonOtherCategories = categories.filter((cat) => {
      const slug = (cat.slug || cat.name || '').toLowerCase();
      return !slug.includes('other-service') && !slug.includes('other service');
    });

    // Pick top 5 popular categories
    const primary = [];
    const remaining = [];

    // Attempt to match popular keywords first
    const pool = [...nonOtherCategories];
    POPULAR_PRIMARY_KEYWORDS.forEach((keyword) => {
      if (primary.length < 5) {
        const foundIndex = pool.findIndex((c) =>
          (c.slug || c.name || '').toLowerCase().includes(keyword)
        );
        if (foundIndex !== -1) {
          primary.push(pool[foundIndex]);
          pool.splice(foundIndex, 1);
        }
      }
    });

    // If less than 5 matched, fill from the rest
    while (primary.length < 5 && pool.length > 0) {
      primary.push(pool.shift());
    }

    // All remaining categories
    remaining.push(...pool);

    return { primaryServices: primary, remainingServices: remaining };
  }, [categories]);

  // Filter remaining services based on search query (case-insensitive)
  const filteredRemainingServices = useMemo(() => {
    const q = searchFilter.trim().toLowerCase();
    if (!q) return remainingServices;

    return remainingServices.filter((cat) => {
      const name = (cat.name || '').toLowerCase();
      const slug = (cat.slug || '').toLowerCase();
      return name.includes(q) || slug.includes(q);
    });
  }, [remainingServices, searchFilter]);

  const handleSelect = (category) => {
    if (onSelectCategory) {
      onSelectCategory(category);
    } else {
      const slug = category.slug || category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      navigate(`/nearby?category=${encodeURIComponent(slug)}`);
    }
  };

  const handleToggleOtherServices = () => {
    setIsOtherServicesExpanded((prev) => {
      const next = !prev;
      if (next) {
        // Smoothly scroll to more services section after a tick if supported
        setTimeout(() => {
          if (typeof moreServicesRef.current?.scrollIntoView === 'function') {
            moreServicesRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 100);
      } else {
        setSearchFilter('');
      }
      return next;
    });
  };

  return (
    <section className={`vega-services-section-wrapper ${className}`} id="services">
      {showTitle && (
        <div className="vega-services-header">
          <div className="services-header-text">
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
        </div>
      )}

      {loading ? (
        <div className="vega-services-grid initial-grid">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="skeleton"
              style={{ height: '180px', borderRadius: 'var(--radius-xl)' }}
            />
          ))}
        </div>
      ) : (
        <>
          {/* =========================================================
              INITIAL 6-CARD GRID: 5 Primary Services + 1 "Other Services" Card
              ========================================================= */}
          <div className="vega-services-grid initial-grid" role="region" aria-label="Popular services grid">
            {/* 1 to 5: Primary Services */}
            {primaryServices.map((category) => (
              <ServiceCard
                key={category.id || category.name}
                category={category}
                onSelect={handleSelect}
              />
            ))}

            {/* 6th Card: "Other Services" Entry Point */}
            <article
              className={`vega-service-card other-services-card ${isOtherServicesExpanded ? 'expanded' : ''}`}
              onClick={handleToggleOtherServices}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleToggleOtherServices();
                }
              }}
              aria-expanded={isOtherServicesExpanded}
              aria-label={isOtherServicesExpanded ? 'Hide other services' : 'Explore all other services'}
            >
              <div className="service-card-icon-header">
                <div className="service-icon-box other-services-icon-box">
                  <Grid2X2 size={26} strokeWidth={2.2} />
                </div>
              </div>

              <div className="service-card-body">
                <h3 className="service-card-name">Other Services</h3>
                <span className="other-services-pill">
                  {isOtherServicesExpanded ? 'Show Less' : `+${remainingServices.length} More`}
                </span>
              </div>
            </article>
          </div>


          {/* =========================================================
              MORE SERVICES EXPANDED SECTION (Visible ONLY after clicking Other Services)
              ========================================================= */}
          {isOtherServicesExpanded && (
            <div
              ref={moreServicesRef}
              className="more-services-expanded-panel"
              id="more-services-panel"
              role="region"
              aria-label="More service categories"
            >
              {/* Header with Search and Close/Collapse Toggle */}
              <div className="more-services-header">
                <div className="more-services-title-wrap">
                  <div className="more-services-badge">
                    <Sparkles size={13} />
                    <span>MORE CATEGORIES</span>
                  </div>
                  <h3>All Other Services</h3>
                  <p>Browse or search all remaining verified local service categories</p>
                </div>

                <div className="more-services-actions">
                  {/* Search inside other services */}
                  <div className="services-search-inline">
                    <Search size={16} className="services-search-icon" />
                    <input
                      type="text"
                      placeholder="Search other services (e.g. Facial, Plumbing, Cooking)..."
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      className="services-search-input"
                      aria-label="Search other services"
                      autoFocus
                    />
                    {searchFilter && (
                      <button
                        type="button"
                        onClick={() => setSearchFilter('')}
                        className="services-search-clear"
                        title="Clear search"
                        aria-label="Clear search input"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Collapse button */}
                  <button
                    type="button"
                    onClick={handleToggleOtherServices}
                    className="btn btn-secondary btn-sm collapse-btn"
                    title="Collapse more services"
                  >
                    <span>Show Less</span>
                    <ChevronUp size={14} />
                  </button>
                </div>
              </div>

              {/* Grid of Remaining Services */}
              <div className="vega-services-grid remaining-grid">
                {filteredRemainingServices.map((category) => (
                  <ServiceCard
                    key={category.id || category.name}
                    category={category}
                    onSelect={handleSelect}
                  />
                ))}

                {/* Zero-Match State */}
                {searchFilter.trim() && filteredRemainingServices.length === 0 && (
                  <div className="services-no-match-card">
                    <div className="no-match-icon">
                      <Search size={22} />
                    </div>
                    <h4>No matching services found</h4>
                    <p>No other services match "{searchFilter}". Try another keyword or explore the main categories.</p>
                    <button
                      type="button"
                      onClick={() => setSearchFilter('')}
                      className="btn btn-outline btn-sm"
                    >
                      Clear Filter
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default ServicesSection;
