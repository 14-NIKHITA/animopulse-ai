import { initialRescueServices } from '../data/seedData';

/**
 * Calculates distance between two coordinates in miles (Haversine formula)
 */
export function calculateDistanceMiles(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return '1.0';
  const R = 3958.8; // Radius of Earth in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
}

/**
 * Search nearby rescue services, clinics, and shelters using OpenStreetMap Overpass API.
 * Performs real location-based query when user coordinates are provided.
 */
export async function searchNearbyRescueServices({
  userLat = null,
  userLng = null,
  searchQuery = '',
  typeFilter = 'All'
}) {
  let isFallback = false;
  let liveResults = [];

  if (userLat && userLng) {
    try {
      const bbox = `${userLat - 0.15},${userLng - 0.15},${userLat + 0.15},${userLng + 0.15}`;
      const overpassQuery = `[out:json][timeout:8];
(
  node["amenity"="veterinary"](${bbox});
  way["amenity"="veterinary"](${bbox});
  node["amenity"="animal_shelter"](${bbox});
  way["amenity"="animal_shelter"](${bbox});
);
out center body 15;`;

      const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;
      
      const res = await fetch(overpassUrl, { signal: AbortSignal.timeout(6000) });
      if (res.ok) {
        const data = await res.json();
        if (data.elements && data.elements.length > 0) {
          liveResults = data.elements.map((el, idx) => {
            const lat = el.lat || el.center?.lat;
            const lon = el.lon || el.center?.lon;
            const dist = lat && lon ? calculateDistanceMiles(userLat, userLng, lat, lon) : '0.5';
            
            const isShelter = el.tags?.amenity === 'animal_shelter' || el.tags?.shelter_type;
            const facilityName = el.tags?.name || (isShelter ? 'Local Animal Shelter & Rescue' : 'Veterinary Clinic & Hospital');
            const street = el.tags?.['addr:street'] || el.tags?.['addr:full'] || '';
            const city = el.tags?.['addr:city'] || el.tags?.['addr:suburb'] || 'Local Area';
            const address = street ? `${street}, ${city}` : `${city} Region`;
            const phone = el.tags?.phone || el.tags?.['contact:phone'] || 'Phone unavailable';

            return {
              id: `osm-${el.id || idx}`,
              name: facilityName,
              service_type: isShelter ? 'Animal Shelter' : 'Veterinary Hospital',
              address,
              city,
              latitude: lat,
              longitude: lon,
              phone,
              website: el.tags?.website || el.tags?.['contact:website'] || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(facilityName)}`,
              open_24_hours: el.tags?.opening_hours === '24/7' || el.tags?.emergency === 'yes',
              distance_miles: `${dist} miles`,
              verified: true,
              is_demo: false,
              is_live_osm: true,
              directions_url: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`
            };
          });
        }
      }
    } catch (err) {
      console.info('[Nearby Rescues API] OpenStreetMap Overpass query failed, using fallback demo data.', err);
    }
  }

  // If live results were found from OpenStreetMap, use liveResults. Otherwise fallback to initialRescueServices marked as Demo.
  let services = [];
  if (liveResults.length > 0) {
    services = liveResults;
    isFallback = false;
  } else {
    isFallback = true;
    services = initialRescueServices.map(s => {
      const dist = userLat && userLng ? calculateDistanceMiles(userLat, userLng, s.latitude, s.longitude) : '1.5';
      return {
        ...s,
        is_demo: true,
        distance_miles: `${dist} miles`,
        directions_url: `https://www.google.com/maps/dir/?api=1&destination=${s.latitude},${s.longitude}`
      };
    });
  }

  // Filter by Service Type
  if (typeFilter && typeFilter !== 'All') {
    services = services.filter(s => s.service_type === typeFilter || (typeFilter === '24/7 Emergency' && s.open_24_hours));
  }

  // Filter by Search Query
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    services = services.filter(s => 
      s.name.toLowerCase().includes(q) ||
      s.service_type.toLowerCase().includes(q) ||
      s.address.toLowerCase().includes(q) ||
      s.city.toLowerCase().includes(q)
    );
  }

  return {
    services,
    isFallback,
    totalFound: services.length
  };
}

/**
 * Generates direct Google Maps search link fallback
 */
export function getGoogleMapsFallbackUrl(query = '24/7 veterinary hospital near me') {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
