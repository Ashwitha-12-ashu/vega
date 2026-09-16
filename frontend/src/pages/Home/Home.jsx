import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  Navigation,
  ChevronRight,
  Star,
  ShieldCheck,
  Clock3,
  Zap,
  Wrench,
  Sparkles,
  Scissors,
  Hammer,
  Car,
  Paintbrush,
  ArrowRight,
  LocateFixed,
  Users,
  CheckCircle2,
} from "lucide-react";

import { useLocation } from "../../context/LocationContext";
import { locationService } from "../../services/locationService";
import { talentService } from "../../services/talentService";

import "./Home.css";


const defaultCategories = [
  {
    name: "Electrician",
    icon: Zap,
    color: "yellow",
  },
  {
    name: "Plumber",
    icon: Wrench,
    color: "blue",
  },
  {
    name: "Cleaning",
    icon: Sparkles,
    color: "purple",
  },
  {
    name: "Salon",
    icon: Scissors,
    color: "pink",
  },
  {
    name: "Carpenter",
    icon: Hammer,
    color: "orange",
  },
  {
    name: "Painter",
    icon: Paintbrush,
    color: "green",
  },
  {
    name: "Car Repair",
    icon: Car,
    color: "red",
  },
];

function Home() {
  const navigate = useNavigate();

  const locationContext = useLocation();

  const coordinates = locationContext?.coordinates || {
    lat: null,
    lng: null,
  };

  const radius = locationContext?.radius || 5;

  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);
  const [diagnostics, setDiagnostics] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationMessage, setLocationMessage] = useState(
    "Showing verified professionals in Ongole, Andhra Pradesh"
  );

  /* --------------------------------
     LOAD CATEGORIES
  -------------------------------- */

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await talentService.getCategories();
        const results = data?.results || data || [];
        setCategories(Array.isArray(results) ? results : []);
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };

    loadCategories();
  }, []);

  /* --------------------------------
     LOAD NEARBY PROVIDERS
  -------------------------------- */

  const fetchProviders = async () => {
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

      const results = data?.results || data || [];
      setProviders(Array.isArray(results) ? results : []);
      setDiagnostics(data?.diagnostics || null);
    } catch (error) {
      console.error("Failed to fetch providers:", error);
      setProviders([]);
      setDiagnostics(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, [
    coordinates?.lat,
    coordinates?.lng,
    radius,
    selectedCategory,
  ]);

  /* --------------------------------
     LOCATION
  -------------------------------- */

  const handleUseLocation = () => {
    if (locationContext?.requestBrowserLocation) {
      locationContext.requestBrowserLocation();
    }
  };

  /* --------------------------------
     SEARCH
  -------------------------------- */

  const handleSearch = (event) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      navigate(`/nearby?search=${encodeURIComponent(query)}`);
    } else {
      navigate('/nearby');
    }
  };

  /* --------------------------------
     CATEGORY
  -------------------------------- */

  const handleCategory = (categoryName) => {
    if (categoryName) {
      navigate(`/nearby?category=${encodeURIComponent(categoryName)}`);
    } else {
      navigate('/nearby');
    }
  };

  /* --------------------------------
     BOOK
  -------------------------------- */

  const handleBook = (provider) => {
    const providerId =
      provider?.provider_id ||
      provider?.id ||
      provider?.user?.id;

    if (providerId) {
      navigate(`/providers/${providerId}`);
    }
  };

  /* --------------------------------
     DISPLAY DATA
  -------------------------------- */

  const displayCategories =
    categories.length > 0
      ? categories.slice(0, 7).map((category, index) => ({
          id: category.id,
          name: category.name,
          icon:
            defaultCategories[index % defaultCategories.length].icon,
          color:
            defaultCategories[index % defaultCategories.length].color,
        }))
      : defaultCategories;

  const displayProviders = providers;

  const renderEmptyState = () => {
    const reason = diagnostics?.empty_reason;

    if (reason === 'NO_LOCATION' || (!coordinates?.lat && !loading)) {
      return (
        <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', background: '#f0fdf4', borderRadius: '1.25rem', border: '1px solid #bbf7d0', margin: '1rem 0' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <MapPin size={26} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#14532d', marginBottom: '0.5rem' }}>
            Enable Location to Find Nearby Providers
          </h3>
          <p style={{ color: '#166534', fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto 1.25rem' }}>
            VEGA uses your current GPS location to find verified nearby service providers.
          </p>
          <button
            onClick={() => locationContext?.requestBrowserLocation && locationContext.requestBrowserLocation()}
            className="btn btn-primary btn-sm"
          >
            <LocateFixed size={15} /> Enable GPS Location
          </button>
        </div>
      );
    }

    if (reason === 'NO_PROVIDERS_FOR_SERVICE') {
      return (
        <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', background: '#f8fafc', borderRadius: '1.25rem', border: '1px solid #e2e8f0', margin: '1rem 0' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <Search size={26} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
            No Providers Found for "{selectedCategory || searchQuery}"
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto 1.25rem' }}>
            There are currently no registered professionals in Ongole for this service.
          </p>
          <button onClick={() => { setSelectedCategory(''); setSearchQuery(''); }} className="btn btn-primary btn-sm">
            Explore Other Categories
          </button>
        </div>
      );
    }

    if (reason === 'NO_ACTIVE_PROVIDERS') {
      return (
        <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', background: '#fffbeb', borderRadius: '1.25rem', border: '1px solid #fef3c7', margin: '1rem 0' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <span style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#92400e', marginBottom: '0.5rem' }}>
            Providers Exist but are Currently Offline
          </h3>
          <p style={{ color: '#b45309', fontSize: '0.9rem', maxWidth: '500px', margin: '0 auto 1.25rem' }}>
            We have {diagnostics?.total_matching_service || 1} registered provider(s) for this service in Ongole, but none are currently online.
          </p>
          <button onClick={() => setSelectedCategory('')} className="btn btn-primary btn-sm">
            View Available Services
          </button>
        </div>
      );
    }

    if (reason === 'OUTSIDE_RADIUS') {
      return (
        <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', background: '#f0fdf4', borderRadius: '1.25rem', border: '1px solid #bbf7d0', margin: '1rem 0' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <MapPin size={26} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#166534', marginBottom: '0.5rem' }}>
            Providers are Outside Your Radius
          </h3>
          <p style={{ color: '#15803d', fontSize: '0.9rem', maxWidth: '500px', margin: '0 auto 1.25rem' }}>
            {diagnostics?.active_matching_service || diagnostics?.total_matching_service} provider(s) found in Ongole/Prakasam district, but beyond {radius} km.
          </p>
          <button onClick={() => navigate('/nearby')} className="btn btn-primary btn-sm">
            Open Discovery & Expand Radius
          </button>
        </div>
      );
    }

    return (
      <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', background: '#f8fafc', borderRadius: '1.25rem', border: '1px solid #e2e8f0', margin: '1rem 0' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
          No professionals currently available
        </h3>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
          Try clearing filters or checking nearby areas around Ongole.
        </p>
        <button onClick={() => { setSelectedCategory(''); setSearchQuery(''); }} className="btn btn-primary btn-sm">
          Reset Filters
        </button>
      </div>
    );
  };

  return (
    <main className="vega-home">

      {/* ================================
          HERO
      ================================= */}

      <section className="home-hero">

        <div className="hero-background-glow glow-one"></div>
        <div className="hero-background-glow glow-two"></div>

        <div className="home-container hero-grid">

          {/* LEFT */}

          <div className="hero-content">

            <div className="hero-trust-badge">
              <ShieldCheck size={16} />
              <span>Trusted Local Services</span>
            </div>

            <h1>
              What service
              <br />
              do you need
              <span> today?</span>
            </h1>

            <p className="hero-description">
              Find trusted professionals around you, compare ratings
              and prices, and book a service in just a few taps.
            </p>

            {/* SEARCH */}

            <form
              className="hero-search"
              onSubmit={handleSearch}
            >
              <Search size={20} />

              <input
                type="text"
                placeholder="Search for a service or professional..."
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(event.target.value)
                }
              />

              <button type="submit">
                Search
              </button>
            </form>

            {/* LOCATION */}

            <div className="location-status">

              <div className="location-status-left">
                <div className="location-icon">
                  <MapPin size={17} />
                </div>

                <div>
                  <strong>
                    {locationMessage}
                  </strong>

                  <span>
                    {coordinates?.lat
                      ? "Nearby services are being personalized for you"
                      : "Allow location access to discover nearby professionals"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleUseLocation}
                disabled={locationLoading}
                className="location-button"
              >
                <LocateFixed size={16} />

                {locationLoading
                  ? "Detecting..."
                  : "Use my location"}
              </button>

            </div>

            {/* QUICK STATS */}

            <div className="hero-stats">

              <div>
                <strong>500+</strong>
                <span>Professionals</span>
              </div>

              <div>
                <strong>4.8★</strong>
                <span>Average rating</span>
              </div>

              <div>
                <strong>24/7</strong>
                <span>Availability</span>
              </div>

            </div>

          </div>

          {/* RIGHT */}

          <div className="hero-visual">

            <div className="hero-image-card">

              <img
                src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1000&q=90"
                alt="VEGA professional"
              />

              <div className="hero-image-overlay"></div>

              <div className="floating-card rating-card">
                <div className="floating-icon star-icon">
                  <Star size={18} fill="currentColor" />
                </div>

                <div>
                  <strong>4.9 / 5</strong>
                  <span>Customer rating</span>
                </div>
              </div>

              <div className="floating-card verified-card">
                <div className="floating-icon verified-icon">
                  <CheckCircle2 size={18} />
                </div>

                <div>
                  <strong>Verified Pros</strong>
                  <span>Trusted professionals</span>
                </div>
              </div>

            </div>

            <div className="hero-circle circle-one"></div>
            <div className="hero-circle circle-two"></div>

          </div>

        </div>

      </section>

      {/* ================================
          CATEGORIES
      ================================= */}

      <section className="categories-section">

        <div className="home-container">

          <div className="section-heading">

            <div>
              <span className="section-eyebrow">
                EXPLORE SERVICES
              </span>

              <h2>
                What can we help you with?
              </h2>
            </div>

            <button
              type="button"
              onClick={() => navigate("/services")}
              className="view-all-button"
            >
              View all
              <ArrowRight size={16} />
            </button>

          </div>

          <div className="category-grid">

            {displayCategories.map((category, index) => {

              const Icon =
                category.icon ||
                defaultCategories[
                  index % defaultCategories.length
                ].icon;

              const color =
                category.color ||
                defaultCategories[
                  index % defaultCategories.length
                ].color;

              const active =
                selectedCategory === category.name;

              return (
                <button
                  type="button"
                  key={category.id || category.name}
                  className={`service-category ${color} ${
                    active ? "active" : ""
                  }`}
                  onClick={() =>
                    handleCategory(category.name)
                  }
                >

                  <div className="category-icon">
                    <Icon size={23} />
                  </div>

                  <span>{category.name}</span>

                  <ChevronRight
                    className="category-arrow"
                    size={16}
                  />

                </button>
              );
            })}

          </div>

        </div>

      </section>

      {/* ================================
          NEARBY PROFESSIONALS
      ================================= */}

      <section className="professionals-section">

        <div className="home-container">

          <div className="section-heading">

            <div>

              <span className="section-eyebrow">
                NEAR YOU
              </span>

              <h2>
                Top professionals nearby
              </h2>

              <p>
                Reliable people ready to help you today.
              </p>

            </div>

            <button
              type="button"
              onClick={() => navigate("/nearby")}
              className="view-all-button"
            >
              See all
              <ArrowRight size={16} />
            </button>

          </div>

          {loading ? (

            <div className="professionals-loading">

              <div className="loading-spinner"></div>

              <p>
                Finding trusted professionals near you...
              </p>

            </div>

          ) : displayProviders.length > 0 ? (

            <div className="professional-grid">

              {displayProviders.map((provider, index) => {

                const providerName =
                  provider?.provider_name ||
                  provider?.user?.full_name ||
                  provider?.user?.username ||
                  "Verified Provider";

                const profession =
                  provider?.active_talent?.title ||
                  provider?.title ||
                  provider?.active_talent?.category?.name ||
                  provider?.category?.name ||
                  "Local Service";

                const rating =
                  provider?.average_rating ||
                  provider?.provider_rating ||
                  5.0;

                const reviews =
                  provider?.total_reviews ??
                  provider?.provider_reviews_count ??
                  0;

                const price =
                  provider?.active_talent?.price_per_hour
                    ? `₹${provider.active_talent.price_per_hour}`
                    : provider?.price_per_hour
                    ? `₹${provider.price_per_hour}`
                    : "₹300";

                const distance =
                  provider?.distance_km !== undefined
                    ? `${provider.distance_km} km`
                    : provider?.distance
                    ? `${provider.distance} km`
                    : "Near you";

                const image =
                  provider?.profile_photo ||
                  provider?.avatar ||
                  provider?.provider_avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(providerName)}&background=0284c7&color=fff&size=120`;

                const isOnline = Boolean(
                  provider?.provider_is_online ??
                  provider?.is_online ??
                  false
                );

                return (

                  <article
                    className="professional-card"
                    key={
                      provider?.id ||
                      provider?.provider_id ||
                      index
                    }
                  >

                    <div className="professional-image">

                      <img
                        src={image}
                        alt={providerName}
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(providerName)}&background=0284c7&color=fff&size=120`;
                        }}
                      />

                      <span className={`online-badge ${isOnline ? 'online' : 'offline'}`}>
                        <span style={{ backgroundColor: isOnline ? '#22c55e' : '#94a3b8' }}></span>
                        {isOnline ? "Available" : "Offline"}
                      </span>

                    </div>

                    <div className="professional-body">

                      <div className="professional-title-row">

                        <div>

                          <h3>
                            {providerName}
                          </h3>

                          <span className="professional-job">
                            {profession}
                          </span>

                        </div>

                        <div className="rating">
                          <Star
                            size={14}
                            fill="currentColor"
                          />

                          <strong>
                            {Number(rating).toFixed(1)}
                          </strong>
                        </div>

                      </div>

                      <div className="professional-meta">

                        <span>
                          <MapPin size={14} />
                          {distance}
                        </span>

                        <span>
                          <Users size={14} />
                          {reviews} reviews
                        </span>

                      </div>

                      <div className="professional-footer">

                        <div className="professional-price">

                          <strong>
                            {price}
                          </strong>

                          <span>
                            / hr
                          </span>

                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            handleBook(provider)
                          }
                        >
                          View Profile
                        </button>

                      </div>

                    </div>

                  </article>

                );
              })}

            </div>

          ) : (
            renderEmptyState()
          )}

        </div>

      </section>

      {/* ================================
          WHY VEGA
      ================================= */}

      <section className="why-vega">

        <div className="home-container">

          <div className="why-vega-card">

            <div className="why-vega-content">

              <span className="section-eyebrow light">
                WHY VEGA?
              </span>

              <h2>
                Local help,
                <br />
                made simple.
              </h2>

              <p>
                From a quick repair to regular home maintenance,
                VEGA makes finding reliable professionals simple,
                transparent and convenient.
              </p>

              <button
                type="button"
                onClick={() => navigate("/services")}
                className="why-button"
              >
                Explore services
                <ArrowRight size={17} />
              </button>

            </div>

            <div className="why-features">

              <div className="why-feature">

                <div>
                  <ShieldCheck size={22} />
                </div>

                <strong>
                  Verified professionals
                </strong>

                <span>
                  Find trusted service providers.
                </span>

              </div>

              <div className="why-feature">

                <div>
                  <Star size={22} />
                </div>

                <strong>
                  Honest ratings
                </strong>

                <span>
                  Compare real customer reviews.
                </span>

              </div>

              <div className="why-feature">

                <div>
                  <Clock3 size={22} />
                </div>

                <strong>
                  Easy booking
                </strong>

                <span>
                  Book your service in a few taps.
                </span>

              </div>

              <div className="why-feature">

                <div>
                  <Navigation size={22} />
                </div>

                <strong>
                  Nearby services
                </strong>

                <span>
                  Discover professionals around you.
                </span>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ================================
          HOW VEGA WORKS
      ================================= */}

      <section className="how-section">

        <div className="home-container">

          <div className="section-heading centered">

            <span className="section-eyebrow">
              SIMPLE PROCESS
            </span>

            <h2>
              How VEGA works
            </h2>

            <p>
              Getting reliable local help takes just a few steps.
            </p>

          </div>

          <div className="steps-grid">

            <div className="step-card">

              <div className="step-number">
                01
              </div>

              <Search size={25} />

              <h3>
                Search
              </h3>

              <p>
                Search for the service you need.
              </p>

            </div>

            <div className="step-card">

              <div className="step-number">
                02
              </div>

              <Users size={25} />

              <h3>
                Compare
              </h3>

              <p>
                Compare professionals, prices and ratings.
              </p>

            </div>

            <div className="step-card">

              <div className="step-number">
                03
              </div>

              <Clock3 size={25} />

              <h3>
                Book
              </h3>

              <p>
                Choose a convenient time and book.
              </p>

            </div>

            <div className="step-card">

              <div className="step-number">
                04
              </div>

              <CheckCircle2 size={25} />

              <h3>
                Relax
              </h3>

              <p>
                Your trusted professional takes care of the rest.
              </p>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}

export default Home;