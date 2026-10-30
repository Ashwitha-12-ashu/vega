/**
 * VEGA Unified Service Images & Visual Assets
 * High-quality, professional, service-specific thumbnail images.
 * Optimized with modern CDN parameters for fast loading and crisp retina rendering.
 */

const DEFAULT_SERVICE_IMAGE = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=500&q=80';

export const SERVICE_IMAGES = {
  // Beauty, Hair & Grooming
  'hair-styling': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=500&q=80',
  'haircut': 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=500&q=80',
  'salon': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=500&q=80',
  'makeup-beauty': 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=500&q=80',
  'facial-skincare': 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=500&q=80',
  'facial': 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=500&q=80',
  'mehendi-henna-art': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=500&q=80',
  'mehendi': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=500&q=80',
  'beauty-spa': 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=500&q=80',
  'massage-wellness': 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=500&q=80',
  'yoga-trainer': 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=500&q=80',
  'fitness-trainer': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=500&q=80',

  // Home Repairs & Maintenance
  'electrical': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=500&q=80',
  'electrician': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=500&q=80',
  'plumbing': 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=500&q=80',
  'plumber': 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=500&q=80',
  'cleaning': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=500&q=80',
  'deep-home-cleaning': 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=500&q=80',
  'painting': 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=500&q=80',
  'painter': 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=500&q=80',
  'carpentry': 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=500&q=80',
  'carpenter': 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=500&q=80',
  'ac-appliance-repair': 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=500&q=80',
  'ac-repair': 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=500&q=80',
  'pest-control': 'https://images.unsplash.com/photo-1632922267756-9b71242b1592?auto=format&fit=crop&w=500&q=80',
  'gardening': 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=500&q=80',
  'interior-design': 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=500&q=80',
  'plaster-masonry': 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=500&q=80',
  'laundry': 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=500&q=80',

  // Vehicles & Transportation
  'car-repair': 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=500&q=80',
  'bike-repair': 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=500&q=80',
  'home-shifting': 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=500&q=80',
  'delivery-services': 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=500&q=80',

  // Tech & Professional
  'computer-it-services': 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=500&q=80',
  'mobile-repair': 'https://images.unsplash.com/photo-1588515724527-074a7a56616c?auto=format&fit=crop&w=500&q=80',
  'photography': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=500&q=80',
  'photography-videography': 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=500&q=80',
  'home-tutor': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=500&q=80',

  // Lifestyle & Events
  'event-planning': 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=500&q=80',
  'catering': 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=500&q=80',
  'home-cooking-chef': 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=500&q=80',
  'tailoring': 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=500&q=80',
  'pet-care': 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=500&q=80',

  // Agriculture & Farming
  'agriculture-farming': 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=500&q=80',
  'agriculture': 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=500&q=80',

  // Other Services
  'other-services': 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=500&q=80',
  'other': 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=500&q=80',
};

/**
 * Returns a high quality service image for a given category name or slug.
 */
export function getServiceImage(name = '', slug = '') {
  const normalize = (str) =>
    (str || '')
      .toLowerCase()
      .replace(/&/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const slugKey = normalize(slug);
  if (slugKey && SERVICE_IMAGES[slugKey]) {
    return SERVICE_IMAGES[slugKey];
  }

  const nameKey = normalize(name);
  if (nameKey && SERVICE_IMAGES[nameKey]) {
    return SERVICE_IMAGES[nameKey];
  }

  // Keyword lookup
  const combined = `${slugKey}-${nameKey}`;
  for (const [key, url] of Object.entries(SERVICE_IMAGES)) {
    if (combined.includes(key) || key.includes(nameKey)) {
      return url;
    }
  }

  return DEFAULT_SERVICE_IMAGE;
}

export default getServiceImage;
