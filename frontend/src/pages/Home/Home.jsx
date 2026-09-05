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

const professionals = [
  {
    id: 1,
    name: "Arun Electricals",
    profession: "Electrician",
    rating: 4.9,
    reviews: 128,
    price: "₹300",
    distance: "1.2 km",
    image:
      "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: 2,
    name: "Vijay Home Care",
    profession: "Home Maintenance",
    rating: 4.8,
    reviews: 96,
    price: "₹350",
    distance: "1.8 km",
    image:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: 3,
    name: "Fresh & Clean",
    profession: "Home Cleaning",
    rating: 4.7,
    reviews: 84,
    price: "₹250",
    distance: "2.1 km",
    image:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=700&q=85",
  },
];

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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationMessage, setLocationMessage] = useState(
    "Showing professionals near your current location"
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

  useEffect(() => {
    if (!coordinates?.lat || !coordinates?.lng) {
      setProviders([]);
      return;
    }

    fetchProviders();
  }, [
    coordinates?.lat,
    coordinates?.lng,
    radius,
    selectedCategory,
  ]);

  const fetchProviders = async () => {
    if (!coordinates?.lat || !coordinates?.lng) {
      return;
    }

    setLoading(true);

    try {
      const data = await locationService.getNearbyProviders({
        lat: coordinates.lat,
        lng: coordinates.lng,
        radius: radius,
        category: selectedCategory,
        search: searchQuery,
      });

      const results = data?.results || data || [];

      setProviders(Array.isArray(results) ? results : []);
    } catch (error) {
      console.error("Failed to fetch providers:", error);
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

  /* --------------------------------
     LOCATION
  -------------------------------- */

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage("Location is not supported by your browser.");
      return;
    }

    setLocationLoading(true);
    setLocationMessage("Detecting your location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setLocationMessage("Your location has been detected.");

        /*
         * LocationContext is responsible for storing
         * the actual coordinates.
         *
         * If your existing LocationContext already
         * listens to browser geolocation, refreshing
         * will cause the nearby providers to update.
         */

        try {
          if (locationContext?.setCoordinates) {
            locationContext.setCoordinates({
              lat,
              lng,
            });
          }
        } catch (error) {
          console.log("Location context update skipped.");
        }

        setLocationLoading(false);
      },
      () => {
        setLocationMessage(
          "Unable to detect your location. Please allow location access."
        );

        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  };

  /* --------------------------------
     SEARCH
  -------------------------------- */

  const handleSearch = async (event) => {
    event.preventDefault();

    if (!searchQuery.trim()) {
      fetchProviders();
      return;
    }

    await fetchProviders();
  };

  /* --------------------------------
     CATEGORY
  -------------------------------- */

  const handleCategory = (categoryName) => {
    const newCategory =
      selectedCategory === categoryName ? "" : categoryName;

    setSelectedCategory(newCategory);
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

  const displayProviders =
    providers.length > 0 ? providers.slice(0, 6) : professionals;

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

          ) : (

            <div className="professional-grid">

              {displayProviders.map((provider, index) => {

                const providerName =
                  provider?.provider_name ||
                  provider?.name ||
                  provider?.user?.full_name ||
                  provider?.user?.username ||
                  professionals[index % professionals.length].name;

                const profession =
                  provider?.title ||
                  provider?.profession ||
                  provider?.category?.name ||
                  professionals[index % professionals.length].profession;

                const rating =
                  provider?.provider_rating ||
                  provider?.rating ||
                  professionals[index % professionals.length].rating;

                const reviews =
                  provider?.provider_reviews_count ||
                  provider?.reviews ||
                  professionals[index % professionals.length].reviews;

                const price =
                  provider?.price_per_hour
                    ? `₹${provider.price_per_hour}`
                    : professionals[index % professionals.length].price;

                const distance =
                  provider?.distance
                    ? `${provider.distance} km`
                    : professionals[index % professionals.length].distance;

                const image =
                  provider?.provider_avatar ||
                  provider?.avatar ||
                  professionals[index % professionals.length].image;

                const isOnline =
                  provider?.provider_is_online ??
                  provider?.is_online ??
                  true;

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
                      />

                      <span className="online-badge">
                        <span></span>
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
                            / visit
                          </span>

                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            handleBook(provider)
                          }
                        >
                          View profile
                        </button>

                      </div>

                    </div>

                  </article>

                );
              })}

            </div>

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