import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  ArrowRight,
  Sparkles,
  Zap,
  Wrench,
  Scissors,
  Hammer,
  Paintbrush,
  Car,
  ChevronRight,
  Layers,
  Leaf,
  Heart,
  Utensils,
  Camera,
  Shirt,
  Smartphone,
  Laptop,
  Bug,
  Truck,
  Building,
  Flower,
  Package,
} from 'lucide-react';
import { talentService } from '../../services/talentService';
import './SearchBar.css';

// Icon mapper for service category slugs/icons
const getCategoryIcon = (iconName, slug) => {
  const key = (slug || iconName || '').toLowerCase();
  if (key.includes('electric') || key.includes('zap')) return <Zap size={18} />;
  if (key.includes('plumb') || key.includes('wrench')) return <Wrench size={18} />;
  if (key.includes('clean') || key.includes('spray') || key.includes('sparkle')) return <Sparkles size={18} />;
  if (key.includes('hair') || key.includes('scissors') || key.includes('salon')) return <Scissors size={18} />;
  if (key.includes('carpen') || key.includes('hammer')) return <Hammer size={18} />;
  if (key.includes('paint')) return <Paintbrush size={18} />;
  if (key.includes('car') || key.includes('bike') || key.includes('auto')) return <Car size={18} />;
  if (key.includes('agri') || key.includes('farm') || key.includes('garden') || key.includes('leaf')) return <Leaf size={18} />;
  if (key.includes('yoga') || key.includes('fitness') || key.includes('massage') || key.includes('health') || key.includes('heart')) return <Heart size={18} />;
  if (key.includes('cook') || key.includes('cater') || key.includes('food') || key.includes('utensil')) return <Utensils size={18} />;
  if (key.includes('photo') || key.includes('video') || key.includes('camera')) return <Camera size={18} />;
  if (key.includes('tailor') || key.includes('laundry') || key.includes('shirt')) return <Shirt size={18} />;
  if (key.includes('mobile') || key.includes('phone')) return <Smartphone size={18} />;
  if (key.includes('comp') || key.includes('laptop') || key.includes('it')) return <Laptop size={18} />;
  if (key.includes('pest') || key.includes('bug')) return <Bug size={18} />;
  if (key.includes('shift') || key.includes('truck') || key.includes('mov')) return <Truck size={18} />;
  if (key.includes('build') || key.includes('mason') || key.includes('plaster')) return <Building size={18} />;
  if (key.includes('mehendi') || key.includes('henna') || key.includes('beauty') || key.includes('spa') || key.includes('facial') || key.includes('flower')) return <Flower size={18} />;
  if (key.includes('deliv') || key.includes('package')) return <Package size={18} />;
  return <Layers size={18} />;
};

/**
 * Highlight matching text case-insensitively
 */
const HighlightMatch = ({ text, query }) => {
  if (!query || !query.trim()) return <span>{text}</span>;

  const trimmed = query.trim();
  const index = text.toLowerCase().indexOf(trimmed.toLowerCase());

  if (index === -1) return <span>{text}</span>;

  const before = text.slice(0, index);
  const match = text.slice(index, index + trimmed.length);
  const after = text.slice(index + trimmed.length);

  return (
    <span>
      {before}
      <span className="vega-search-highlight">{match}</span>
      {after}
    </span>
  );
};

const SearchBar = ({
  value,
  onChange,
  onSearch,
  placeholder = 'Search for a service (e.g. Electrician, Facial, Mehendi, Agriculture)...',
  variant = 'default', // 'hero', 'compact', 'default'
  buttonText = 'Search',
  buttonIcon: ButtonIcon = ArrowRight,
  showButton = true,
  autoNavigate = true,
  className = '',
  id = 'vega-search-input',
}) => {
  const navigate = useNavigate();
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // Internal state if uncontrolled
  const [internalQuery, setInternalQuery] = useState(value || '');
  const [categories, setCategories] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const query = value !== undefined ? value : internalQuery;

  // Load categories from talentService
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
        console.warn('Failed to load categories for SearchBar:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Sync internal state if value prop changes
  useEffect(() => {
    if (value !== undefined) {
      setInternalQuery(value);
    }
  }, [value]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Compute case-insensitive suggestions based on backend database data with relevance sorting
  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const matched = categories.filter((category) => {
      const name = (category.name || '').toLowerCase();
      const slug = (category.slug || '').toLowerCase();
      const desc = (category.description || '').toLowerCase();
      return name.includes(q) || slug.includes(q) || desc.includes(q);
    });

    // Sort by relevance: startsWith first, then word startsWith, then alphabetical
    return matched.sort((a, b) => {
      const aName = (a.name || '').toLowerCase();
      const bName = (b.name || '').toLowerCase();
      const aStarts = aName.startsWith(q);
      const bStarts = bName.startsWith(q);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;

      const aWordStarts = aName.split(/[\s&/]+/).some((w) => w.startsWith(q));
      const bWordStarts = bName.split(/[\s&/]+/).some((w) => w.startsWith(q));
      if (aWordStarts && !bWordStarts) return -1;
      if (!aWordStarts && bWordStarts) return 1;

      return aName.localeCompare(bName);
    });
  }, [categories, query]);

  const handleInputChange = (e) => {
    const newVal = e.target.value;
    if (onChange) {
      onChange(e);
    } else {
      setInternalQuery(newVal);
    }
    setIsOpen(true);
    setActiveIndex(-1);
  };

  const handleClear = () => {
    if (onChange) {
      onChange({ target: { value: '' } });
    } else {
      setInternalQuery('');
    }
    setIsOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const executeSearch = (targetQuery, selectedCategory = null) => {
    setIsOpen(false);
    setActiveIndex(-1);

    const cleanQuery = (targetQuery || '').trim();

    if (onSearch) {
      onSearch(cleanQuery, selectedCategory);
    } else if (autoNavigate) {
      if (selectedCategory) {
        navigate(`/nearby?category=${encodeURIComponent(selectedCategory.slug || selectedCategory.name)}&search=${encodeURIComponent(cleanQuery)}`);
      } else if (cleanQuery) {
        navigate(`/nearby?search=${encodeURIComponent(cleanQuery)}`);
      } else {
        navigate('/nearby');
      }
    }
  };

  const handleSelectSuggestion = (category) => {
    const categoryName = category.name;
    if (onChange) {
      onChange({ target: { value: categoryName } });
    } else {
      setInternalQuery(categoryName);
    }
    executeSearch(categoryName, category);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (activeIndex >= 0 && activeIndex < suggestions.length) {
      handleSelectSuggestion(suggestions[activeIndex]);
    } else {
      executeSearch(query);
    }
  };

  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'ArrowDown') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        e.preventDefault();
        handleSelectSuggestion(suggestions[activeIndex]);
      }
    }
  };

  const hasMatches = suggestions.length > 0;
  const isTyping = query.trim().length > 0;

  return (
    <div
      ref={wrapperRef}
      className={`vega-searchbar-wrapper vega-searchbar-${variant} ${className}`}
    >
      <form
        onSubmit={handleSubmit}
        className="vega-searchbar-form"
        role="search"
      >
        <div className="vega-searchbar-icon">
          <Search size={variant === 'hero' ? 22 : 18} />
        </div>

        <input
          ref={inputRef}
          id={id}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (isTyping) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="vega-searchbar-input"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={isOpen && isTyping}
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="vega-searchbar-clear"
            title="Clear search"
            aria-label="Clear search input"
          >
            <X size={14} />
          </button>
        )}

        {showButton && (
          <button type="submit" className="vega-searchbar-btn">
            {buttonText && <span>{buttonText}</span>}
            {ButtonIcon && <ButtonIcon size={17} />}
          </button>
        )}
      </form>

      {/* Autocomplete Suggestions Dropdown */}
      {isOpen && isTyping && (
        <div className="vega-suggestions-dropdown" role="listbox">
          {hasMatches ? (
            <>
              <div className="vega-suggestions-header">
                <span>Matching Services ({suggestions.length})</span>
                <span>Select to search</span>
              </div>

              <ul className="vega-suggestions-list">
                {suggestions.map((cat, idx) => {
                  const isActive = idx === activeIndex;
                  return (
                    <li
                      key={cat.id}
                      role="option"
                      aria-selected={isActive}
                      className={`vega-suggestion-item ${isActive ? 'active-item' : ''}`}
                      onClick={() => handleSelectSuggestion(cat)}
                      onMouseEnter={() => setActiveIndex(idx)}
                    >
                      <div className="vega-suggestion-left">
                        <div className="vega-suggestion-icon-box">
                          {getCategoryIcon(cat.icon, cat.slug || cat.name)}
                        </div>
                        <div className="vega-suggestion-info">
                          <span className="vega-suggestion-title">
                            <HighlightMatch text={cat.name} query={query} />
                          </span>
                          {cat.description && (
                            <span className="vega-suggestion-sub">
                              {cat.description}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="vega-suggestion-badge">
                        <span>Available</span>
                        <ChevronRight size={13} />
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="vega-suggestions-footer">
                <span>
                  Use <kbd>↑</kbd> <kbd>↓</kbd> to navigate, <kbd>Enter</kbd> to select
                </span>
                <span><kbd>Esc</kbd> to close</span>
              </div>
            </>
          ) : (
            <div className="vega-suggestions-empty">
              <div className="vega-suggestions-empty-title">
                No matching service categories found for "{query}"
              </div>
              <div className="vega-suggestions-empty-desc">
                Press Enter to search for all providers and titles matching "{query}".
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
