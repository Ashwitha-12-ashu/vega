import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarCheck,
  ChevronRight,
  CircleDollarSign,
  Grid2X2,
  MapPin,
  Paintbrush,
  Search,
  ShieldCheck,
  Snowflake,
  Sparkles,
  SprayCan,
  Star,
  Zap,
  Home as HomeIcon,
  Compass,
  CheckCircle2,
  Clock,
  ThumbsUp,
} from 'lucide-react';

import { useLocation } from '../../context/LocationContext';
import './Landing.css';

const services = [
  { name: 'Electrician', slug: 'electrician', icon: Zap, tone: 'gold', count: '120+ Pros' },
  { name: 'Plumber', slug: 'plumber', icon: '💧', tone: 'blue', count: '95+ Pros' },
  { name: 'Painter', slug: 'painter', icon: Paintbrush, tone: 'coral', count: '60+ Pros' },
  { name: 'Carpenter', slug: 'carpenter', icon: '🔨', tone: 'orange', count: '80+ Pros' },
  { name: 'AC Repair', slug: 'ac-repair', icon: Snowflake, tone: 'sky', count: '110+ Pros' },
  { name: 'Cleaning', slug: 'cleaning', icon: SprayCan, tone: 'mint', count: '140+ Pros' },
];

const additionalServices = [
  { name: 'Appliance Repair', slug: 'appliance-repair', icon: '🔧', tone: 'orange', count: '50+ Pros' },
  { name: 'Beauty & Grooming', slug: 'beauty-at-home', icon: '✂️', tone: 'coral', count: '75+ Pros' },
  { name: 'Pest Control', slug: 'pest-control', icon: '🛡️', tone: 'mint', count: '40+ Pros' },
  { name: 'Deep Home Cleaning', slug: 'home-cleaning', icon: '🧹', tone: 'blue', count: '90+ Pros' },
];

const assurances = [
  [
    BadgeCheck,
    'Verified Professionals',
    'Every provider undergoes rigorous background verification and identity checks.',
    'icon-box-1',
  ],
  [
    CircleDollarSign,
    'Transparent Pricing',
    'Fixed upfront rates with zero hidden charges or surprise commissions.',
    'icon-box-2',
  ],
  [
    CalendarCheck,
    'Instant Booking',
    'Schedule immediate same-day service or reserve future slots in seconds.',
    'icon-box-3',
  ],
  [
    ShieldCheck,
    'Live GPS Tracking',
    'Track your professional’s arrival in real-time right to your doorstep.',
    'icon-box-4',
  ],
  [
    Star,
    'Verified Reviews',
    'Read honest, authentic reviews and ratings from actual local neighbors.',
    'icon-box-5',
  ],
];

const steps = [
  ['01', 'Choose a Service', 'Browse through curated home and local service categories.'],
  ['02', 'Select Verified Pro', 'Compare nearby active providers by distance, price, and ratings.'],
  ['03', 'Schedule & Book', 'Pick your preferred time slot and confirm booking instantly.'],
  ['04', 'Relax & Track', 'Service completed with satisfaction guarantee & real-time updates.'],
];

function ServiceIcon({ icon: Icon }) {
  if (typeof Icon === 'string') {
    return <span style={{ fontSize: '26px', lineHeight: 1 }}>{Icon}</span>;
  }
  return <Icon size={26} strokeWidth={2.2} />;
}

export default function Landing() {
  const navigate = useNavigate();
  const { coordinates } = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAdditionalServices, setShowAdditionalServices] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const city =
    coordinates?.city ||
    coordinates?.address ||
    'your area';

  const handleSearch = (event) => {
    event.preventDefault();
    const query = searchQuery.trim();
    navigate(
      query
        ? `/nearby?search=${encodeURIComponent(query)}`
        : '/nearby'
    );
  };

  const handleQuickTagClick = (tag) => {
    setSearchQuery(tag);
    navigate(`/nearby?search=${encodeURIComponent(tag)}`);
  };

  return (
    <main className="landing-page">
      {/* Ambient background orbs */}
      <div className="hero-ambient-orb orb-1" />
      <div className="hero-ambient-orb orb-2" />

      {/* ================= 1. NAVBAR ================= */}
      <header className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="landing-container nav-inner">
          {/* Corner-Rounded Brand Heading Capsule */}
          <Link to="/" className="brand" title="VEGA Smart Services">
            <img className="brand-logo" src="/vega-logo.png" alt="VEGA Logo" />
            <div>
              <span className="brand-title">VEGA</span>
              <span className="brand-subtitle">Smart Local Services</span>
            </div>
          </Link>

          {/* Corner-Rounded Desktop Navigation with Hover Pill Highlight */}
          <nav className="landing-nav-list" aria-label="Primary navigation">
            <Link className="landing-nav-item active" to="/">
              <HomeIcon size={15} />
              <span>Home</span>
            </Link>

            <Link className="landing-nav-item" to="/explore">
              <Compass size={15} />
              <span>Services</span>
            </Link>

            <a className="landing-nav-item" href="#how-it-works">
              <Sparkles size={15} />
              <span>How it Works</span>
            </a>

            <a className="landing-nav-item" href="#why-vega">
              <ShieldCheck size={15} />
              <span>Why VEGA</span>
            </a>

            <Link className="landing-nav-item" to="/become-provider">
              <BriefcaseBusiness size={15} />
              <span>For Pros</span>
            </Link>
          </nav>

          {/* Nav Login Button */}
          <Link to="/login" className="nav-login">
            <span>Login / Sign Up</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </header>

      {/* ================= 2. HERO ================= */}
      <section className="hero">
        <div className="landing-container hero-grid">
          <div className="hero-copy">
            {/* Live Pulsing Eyebrow */}
            <div className="eyebrow">
              <span className="eyebrow-beacon" />
              <span>500+ Verified Service Experts Active Now</span>
            </div>

            <h1>
              Find Trusted Local <br />
              Services <span className="highlight-text">Near You</span>
            </h1>

            <p className="hero-description">
              VEGA instantly connects you with background-verified local service professionals.
              Book, track in real time, and pay securely in one place.
            </p>

            {/* Interactive Search Bar */}
            <form className="hero-search-card" onSubmit={handleSearch}>
              <Search size={22} className="search-icon" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search electrician, plumber, cleaner..."
                aria-label="Search for services"
              />
              <button type="submit">
                <span>Find Pros</span>
                <ArrowRight size={17} />
              </button>
            </form>

            {/* Quick Tag Suggestions */}
            <div className="quick-tags">
              <span className="quick-tag-label">Popular:</span>
              {['Electrician', 'Plumber', 'AC Repair', 'House Cleaning'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleQuickTagClick(tag)}
                  className="quick-tag-pill"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Meta status info */}
            <div className="hero-meta-row">
              <div className="detect-location-pill">
                <MapPin size={15} />
                <span>
                  {coordinates?.city
                    ? `Showing pros in ${city}`
                    : 'Locating nearby professionals...'}
                </span>
              </div>

              <div className="hero-rating-badge">
                <Star size={15} fill="currentColor" />
                <span>4.9 / 5.0 (12,000+ reviews)</span>
              </div>
            </div>
          </div>

          {/* HERO VISUAL & 3D FLOATING CARDS */}
          <div className="hero-visual-wrapper">
            <div className="hero-blob-backdrop" />

            <img
              className="hero-person-img"
              src="/vega-hero-person.png"
              alt="VEGA local service professional"
            />

            {/* Floating Electrician Card */}
            <div className="floating-card card-top-right">
              <div className="floating-card-icon gold">
                <Zap size={20} />
              </div>
              <div className="floating-card-content">
                <strong>Electricians</strong>
                <span>
                  <span className="star-val">★ 4.9</span> • 120+ Online
                </span>
              </div>
            </div>

            {/* Floating Plumber Card */}
            <div className="floating-card card-mid-left">
              <div className="floating-card-icon blue">
                💧
              </div>
              <div className="floating-card-content">
                <strong>Plumbers</strong>
                <span>
                  <span className="star-val">★ 4.8</span> • 95+ Online
                </span>
              </div>
            </div>

            {/* Floating Cleaners Card */}
            <div className="floating-card card-bottom-right">
              <div className="floating-card-icon mint">
                <SprayCan size={20} />
              </div>
              <div className="floating-card-content">
                <strong>Home Cleaners</strong>
                <span>
                  <span className="star-val">★ 5.0</span> • 140+ Online
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 3. STATS STRIP ================= */}
      <section className="stats-strip">
        <div className="landing-container stats-grid">
          <div className="stat-item">
            <span className="stat-number">500+</span>
            <span className="stat-label">Verified Providers</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">15 Mins</span>
            <span className="stat-label">Average Arrival Time</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">4.9 / 5</span>
            <span className="stat-label">Customer Satisfaction</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">100%</span>
            <span className="stat-label">Service Guarantee</span>
          </div>
        </div>
      </section>

      {/* ================= 4. POPULAR SERVICES ================= */}
      <section className="services-section" id="services">
        <div className="landing-container">
          <div className="section-header-center">
            <span className="section-badge">Our Services</span>
            <h2>Popular Home Services</h2>
            <p>Select a category to view verified, top-rated local professionals nearby</p>
          </div>

          <div className="service-grid-modern">
            {services.map(({ name, slug, icon, tone, count }) => (
              <Link
                key={name}
                to={`/nearby?category=${slug}`}
                className={`service-card-modern tone-${tone}`}
              >
                <div className="service-icon-bubble">
                  <ServiceIcon icon={icon} />
                </div>
                <h3>{name}</h3>
                <span className="service-meta">{count}</span>
                <ChevronRight className="service-card-arrow" size={16} />
              </Link>
            ))}

            {showAdditionalServices &&
              additionalServices.map(({ name, slug, icon, tone, count }) => (
                <Link
                  key={name}
                  to={`/nearby?category=${slug}`}
                  className={`service-card-modern tone-${tone}`}
                >
                  <div className="service-icon-bubble">
                    <ServiceIcon icon={icon} />
                  </div>
                  <h3>{name}</h3>
                  <span className="service-meta">{count}</span>
                  <ChevronRight className="service-card-arrow" size={16} />
                </Link>
              ))}

            <button
              type="button"
              className="service-card-modern tone-lilac"
              onClick={() => setShowAdditionalServices((shown) => !shown)}
              aria-expanded={showAdditionalServices}
            >
              <div className="service-icon-bubble">
                <Grid2X2 size={24} />
              </div>
              <h3>{showAdditionalServices ? 'Show Less' : 'More Services'}</h3>
              <span className="service-meta">
                {showAdditionalServices ? 'Collapse list' : 'View all categories'}
              </span>
              <ChevronRight className="service-card-arrow" size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ================= 5. WHY VEGA ================= */}
      <section className="why-section" id="why-vega">
        <div className="landing-container">
          <div className="why-container-card">
            <div className="why-heading-wrap">
              <span className="section-badge" style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#ffffff' }}>
                Why Choose Us
              </span>
              <h2>Why Thousands Trust VEGA</h2>
              <p>We combine instant local matching, verified talent, and complete booking security.</p>
            </div>

            <div className="assurance-grid-modern">
              {assurances.map(([Icon, title, detail, iconClass]) => (
                <article className="assurance-card-modern" key={title}>
                  <div className={`assurance-icon-box ${iconClass}`}>
                    <Icon size={22} />
                  </div>
                  <h3>{title}</h3>
                  <p>{detail}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= 6. HOW IT WORKS ================= */}
      <section className="how-section" id="how-it-works">
        <div className="landing-container">
          <div className="section-header-center">
            <span className="section-badge">Simple Process</span>
            <h2>How VEGA Works</h2>
            <p>Get expert assistance to your door in 4 easy steps</p>
          </div>

          <div className="steps-timeline-grid">
            {steps.map(([number, title, detail]) => (
              <article className="step-card-modern" key={number}>
                <div className="step-num-pill">{number}</div>
                <h3>{title}</h3>
                <p>{detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 7. PROVIDER CTA ================= */}
      <section className="provider-section">
        <div className="landing-container">
          <div className="provider-banner-card">
            <div className="provider-icon-badge">
              <BriefcaseBusiness size={34} />
            </div>

            <div className="provider-copy-wrap">
              <span className="provider-tag">For Skilled Professionals</span>
              <h2>Grow Your Local Business With VEGA</h2>
              <p>
                Join thousands of verified electricians, plumbers, and technicians getting daily bookings with zero upfront subscription fees.
              </p>
            </div>

            <Link to="/become-provider" className="provider-btn">
              <span>Join as a Provider</span>
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* ================= 8. FOOTER ================= */}
      <footer className="footer-modern" id="contact">
        <div className="landing-container footer-grid-modern">
          <div className="footer-brand-wrap">
            <Link to="/" className="brand" style={{ background: 'transparent', border: 'none', padding: 0 }}>
              <img className="brand-logo" src="/vega-logo.png" alt="VEGA" />
              <div>
                <span className="brand-title" style={{ color: '#ffffff', background: 'none', WebkitTextFillColor: '#ffffff' }}>
                  VEGA
                </span>
                <span className="brand-subtitle" style={{ color: 'var(--primary-400)' }}>
                  Smart Local Services
                </span>
              </div>
            </Link>
            <p>
              The next-generation on-demand local service marketplace connecting customers with verified professionals in real time.
            </p>
          </div>

          <div className="footer-col">
            <h4>Quick Explore</h4>
            <ul>
              <li><Link to="/explore">All Services</Link></li>
              <li><Link to="/nearby">Nearby Pros</Link></li>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#why-vega">Why VEGA</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Popular Services</h4>
            <ul>
              <li><Link to="/nearby?category=electrician">Electricians</Link></li>
              <li><Link to="/nearby?category=plumber">Plumbing</Link></li>
              <li><Link to="/nearby?category=cleaning">Home Cleaning</Link></li>
              <li><Link to="/nearby?category=ac-repair">AC Repair</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Providers</h4>
            <ul>
              <li><Link to="/become-provider">Become a Provider</Link></li>
              <li><Link to="/login">Provider Login</Link></li>
              <li><Link to="/register">Sign Up Free</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Connect</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--slate-400)' }}>
              support@vega.app
            </p>
            <div className="social-pills">
              <span className="social-pill" title="Twitter / X">𝕏</span>
              <span className="social-pill" title="Instagram">📷</span>
              <span className="social-pill" title="LinkedIn">in</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom-strip">
          <div className="landing-container">
            © {new Date().getFullYear()} VEGA Platform Inc. All rights reserved. Made for smart connected communities.
          </div>
        </div>
      </footer>
    </main>
  );
}
