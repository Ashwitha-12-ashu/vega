import React from 'react';
import {
  Sparkles,
  Scissors,
  Wrench,
  Zap,
  Paintbrush,
  SprayCan,
  Hammer,
  Car,
  Bike,
  BookOpen,
  Dumbbell,
  Heart,
  Laptop,
  Smartphone,
  Camera,
  Video,
  Calendar,
  Utensils,
  Shirt,
  Bug,
  Leaf,
  Truck,
  Building,
  Flower,
  Package,
  Layers,
  Grid2X2,
  Fan,
  Snowflake,
  Home,
  Droplets,
  MoreHorizontal,
} from 'lucide-react';

/**
 * Service Category Visual Design System
 * Provides curated logo-style vector icons and harmonious pastel color themes.
 * NO realistic photos — clean, modern, professional marketplace iconography.
 */

const CATEGORY_THEMES = {
  // Primary / Popular Services
  cleaning: {
    icon: SprayCan,
    bg: '#ecfdf5',
    color: '#059669',
    border: '#a7f3d0',
    hoverBg: '#d1fae5',
  },
  'hair-styling': {
    icon: Scissors,
    bg: '#f5f3ff',
    color: '#7c3aed',
    border: '#ddd6fe',
    hoverBg: '#ede9fe',
  },
  'makeup-beauty': {
    icon: Sparkles,
    bg: '#fdf2f8',
    color: '#db2777',
    border: '#fbcfe8',
    hoverBg: '#fce7f3',
  },
  'mehendi-henna-art': {
    icon: Flower,
    bg: '#fffbeb',
    color: '#d97706',
    border: '#fde68a',
    hoverBg: '#fef3c7',
  },
  'agriculture-farming': {
    icon: Leaf,
    bg: '#f0fdf4',
    color: '#16a34a',
    border: '#bbf7d0',
    hoverBg: '#dcfce7',
  },
  'facial-skincare': {
    icon: Sparkles,
    bg: '#fff1f2',
    color: '#e11d48',
    border: '#fecdd3',
    hoverBg: '#ffe4e6',
  },

  // Home Repairs & Maintenance
  electrical: {
    icon: Zap,
    bg: '#fefce8',
    color: '#ca8a04',
    border: '#fef08a',
    hoverBg: '#fef9c3',
  },
  electrician: {
    icon: Zap,
    bg: '#fefce8',
    color: '#ca8a04',
    border: '#fef08a',
    hoverBg: '#fef9c3',
  },
  plumbing: {
    icon: Wrench,
    bg: '#eff6ff',
    color: '#2563eb',
    border: '#bfdbfe',
    hoverBg: '#dbeafe',
  },
  plumber: {
    icon: Wrench,
    bg: '#eff6ff',
    color: '#2563eb',
    border: '#bfdbfe',
    hoverBg: '#dbeafe',
  },
  painting: {
    icon: Paintbrush,
    bg: '#faf5ff',
    color: '#9333ea',
    border: '#e9d5ff',
    hoverBg: '#f3e8ff',
  },
  carpentry: {
    icon: Hammer,
    bg: '#fff7ed',
    color: '#ea580c',
    border: '#fed7aa',
    hoverBg: '#ffedd5',
  },
  'ac-appliance-repair': {
    icon: Snowflake,
    bg: '#f0fdfa',
    color: '#0d9488',
    border: '#99f6e4',
    hoverBg: '#ccfbf1',
  },
  'pest-control': {
    icon: Bug,
    bg: '#fef2f2',
    color: '#dc2626',
    border: '#fecaca',
    hoverBg: '#fee2e2',
  },
  gardening: {
    icon: Leaf,
    bg: '#f0fdf4',
    color: '#15803d',
    border: '#bbf7d0',
    hoverBg: '#dcfce7',
  },
  'interior-design': {
    icon: Home,
    bg: '#f8fafc',
    color: '#475569',
    border: '#e2e8f0',
    hoverBg: '#f1f5f9',
  },
  'plaster-masonry': {
    icon: Building,
    bg: '#f8fafc',
    color: '#64748b',
    border: '#cbd5e1',
    hoverBg: '#f1f5f9',
  },
  laundry: {
    icon: Shirt,
    bg: '#ecfeff',
    color: '#0891b2',
    border: '#a5f3fc',
    hoverBg: '#cffafe',
  },

  // Vehicles & Logistics
  'car-repair': {
    icon: Car,
    bg: '#fef2f2',
    color: '#e11d48',
    border: '#fecdd3',
    hoverBg: '#ffe4e6',
  },
  'bike-repair': {
    icon: Bike,
    bg: '#f1f5f9',
    color: '#475569',
    border: '#cbd5e1',
    hoverBg: '#e2e8f0',
  },
  'home-shifting': {
    icon: Truck,
    bg: '#eff6ff',
    color: '#1d4ed8',
    border: '#bfdbfe',
    hoverBg: '#dbeafe',
  },
  'delivery-services': {
    icon: Package,
    bg: '#f0f9ff',
    color: '#0284c7',
    border: '#bae6fd',
    hoverBg: '#e0f2fe',
  },

  // Professional, Tech & Tutoring
  'computer-it-services': {
    icon: Laptop,
    bg: '#eff6ff',
    color: '#3b82f6',
    border: '#bfdbfe',
    hoverBg: '#dbeafe',
  },
  'mobile-repair': {
    icon: Smartphone,
    bg: '#f5f3ff',
    color: '#6d28d9',
    border: '#ddd6fe',
    hoverBg: '#ede9fe',
  },
  photography: {
    icon: Camera,
    bg: '#f0fdf4',
    color: '#16a34a',
    border: '#bbf7d0',
    hoverBg: '#dcfce7',
  },
  'photography-videography': {
    icon: Video,
    bg: '#fdf4ff',
    color: '#c026d3',
    border: '#f5d0fe',
    hoverBg: '#fae8ff',
  },
  'home-tutor': {
    icon: BookOpen,
    bg: '#eef2ff',
    color: '#4f46e5',
    border: '#c7d2fe',
    hoverBg: '#e0e7ff',
  },

  // Events & Cooking
  'event-planning': {
    icon: Calendar,
    bg: '#fdf2f8',
    color: '#be185d',
    border: '#fbcfe8',
    hoverBg: '#fce7f3',
  },
  catering: {
    icon: Utensils,
    bg: '#fff7ed',
    color: '#c2410c',
    border: '#fed7aa',
    hoverBg: '#ffedd5',
  },
  'home-cooking-chef': {
    icon: Utensils,
    bg: '#fffbeb',
    color: '#b45309',
    border: '#fde68a',
    hoverBg: '#fef3c7',
  },
  tailoring: {
    icon: Scissors,
    bg: '#fdf4ff',
    color: '#a21caf',
    border: '#f5d0fe',
    hoverBg: '#fae8ff',
  },
  'beauty-spa': {
    icon: Flower,
    bg: '#fdf2f8',
    color: '#be185d',
    border: '#fbcfe8',
    hoverBg: '#fce7f3',
  },
  'massage-wellness': {
    icon: Heart,
    bg: '#f0fdfa',
    color: '#0f766e',
    border: '#99f6e4',
    hoverBg: '#ccfbf1',
  },
  'fitness-trainer': {
    icon: Dumbbell,
    bg: '#fff7ed',
    color: '#ea580c',
    border: '#fed7aa',
    hoverBg: '#ffedd5',
  },
  'yoga-trainer': {
    icon: Heart,
    bg: '#ecfdf5',
    color: '#047857',
    border: '#a7f3d0',
    hoverBg: '#d1fae5',
  },
  'pet-care': {
    icon: Heart,
    bg: '#fffbeb',
    color: '#d97706',
    border: '#fde68a',
    hoverBg: '#fef3c7',
  },

  // Other Services Entry / Category
  'other-services': {
    icon: Grid2X2,
    bg: 'linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%)',
    color: '#4f46e5',
    border: '#c7d2fe',
    hoverBg: 'linear-gradient(135deg, #e0e7ff 0%, #ede9fe 100%)',
  },
};

const DEFAULT_THEME = {
  icon: Layers,
  bg: '#f8fafc',
  color: '#4f46e5',
  border: '#e2e8f0',
  hoverBg: '#f1f5f9',
};

/**
 * Returns theme info { icon: Component, bg, color, border, hoverBg } for a service name or slug.
 */
export function getServiceTheme(name = '', slug = '') {
  const normalize = (str) =>
    (str || '')
      .toLowerCase()
      .replace(/&/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const slugKey = normalize(slug);
  if (slugKey && CATEGORY_THEMES[slugKey]) {
    return CATEGORY_THEMES[slugKey];
  }

  const nameKey = normalize(name);
  if (nameKey && CATEGORY_THEMES[nameKey]) {
    return CATEGORY_THEMES[nameKey];
  }

  // Keyword match
  const combined = `${slugKey}-${nameKey}`;
  for (const [key, theme] of Object.entries(CATEGORY_THEMES)) {
    if (combined.includes(key)) {
      return theme;
    }
  }

  return DEFAULT_THEME;
}

/**
 * Component to render a clean, logo-style service icon inside a modern pill/box.
 */
export const ServiceIconBox = ({
  name = '',
  slug = '',
  size = 24,
  className = '',
  style = {},
}) => {
  const theme = getServiceTheme(name, slug);
  const IconComponent = theme.icon;

  return (
    <div
      className={`service-icon-box ${className}`}
      style={{
        background: theme.bg,
        color: theme.color,
        borderColor: theme.border,
        ...style,
      }}
    >
      <IconComponent size={size} strokeWidth={2.2} />
    </div>
  );
};

export default getServiceTheme;
