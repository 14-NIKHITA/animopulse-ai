import React, { useState, useEffect } from 'react';
import { searchNearbyRescueServices, getGoogleMapsFallbackUrl } from '../lib/nearbyRescues';
import { 
  MapPin, 
  PhoneCall, 
  Navigation, 
  Search, 
  Filter, 
  ShieldCheck, 
  ExternalLink,
  Compass,
  Loader2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export default function NearbyRescueServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFallbackData, setIsFallbackData] = useState(false);
  const [typeFilter, setTypeFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [geoStatus, setGeoStatus] = useState('prompt'); // 'prompt' | 'active' | 'denied'

  const loadServices = async (lat = null, lng = null) => {
    setLoading(true);
    const result = await searchNearbyRescueServices({
      userLat: lat,
      userLng: lng,
      searchQuery,
      typeFilter
    });
    setServices(result.services || []);
    setIsFallbackData(result.isFallback);
    setLoading(false);
  };

  const handleUseGeolocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('denied');
      loadServices();
      return;
    }
    setLoading(true);
    setGeoStatus('prompt');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ latitude, longitude });
        setGeoStatus('active');
        loadServices(latitude, longitude);
      },
      (err) => {
        console.warn('[Geolocation Permission Denied or Unavailable]', err);
        setGeoStatus('denied');
        loadServices();
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    handleUseGeolocation();
  }, [typeFilter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h2 style={{ fontSize: '1.6rem' }}>Nearby Rescue & Veterinary Directory</h2>
            {geoStatus === 'active' && !isFallbackData ? (
              <span className="badge badge-green" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={14} /> Live OpenStreetMap GPS Active
              </span>
            ) : (
              <span className="badge badge-amber">Demo Data Mode</span>
            )}
          </div>
          <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem', marginTop: '4px' }}>
            Real location-based search for 24/7 ER hospitals, animal shelters, and wildlife rescues near your GPS coordinates.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={handleUseGeolocation} className="btn btn-primary" disabled={loading}>
            <Compass size={18} />
            <span>{geoStatus === 'active' ? 'Re-scan GPS Location' : 'Allow Location Access'}</span>
          </button>

          <a 
            href={getGoogleMapsFallbackUrl('24/7 veterinary hospital near me')}
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-outline"
          >
            <ExternalLink size={16} />
            <span>Open Google Maps</span>
          </a>
        </div>
      </div>

      {/* Explicit Fallback Alert Banner */}
      {(isFallbackData || geoStatus === 'denied') && (
        <div style={{
          padding: '0.85rem 1.15rem',
          backgroundColor: 'var(--amber-100)',
          color: 'var(--amber-600)',
          borderRadius: '10px',
          border: '1px solid #FDE68A',
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <AlertCircle size={20} flexShrink={0} />
          <div>
            <strong>Fallback Demo Data Displayed</strong>: Live location results could not be fetched from OpenStreetMap (Permission denied or location disabled). Click <strong>"Allow Location Access"</strong> or use <strong>"Open Google Maps"</strong> for live navigation.
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="card" style={{ padding: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '220px', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--slate-50)', padding: '0.4rem 0.85rem', borderRadius: '8px', border: '1px solid var(--slate-300)' }}>
          <Search size={18} color="var(--slate-400)" />
          <input 
            type="text" 
            placeholder="Search facility name, city, or address..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ border: 'none', background: 'none', width: '100%', outline: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} color="var(--slate-600)" />
          <select 
            className="form-control"
            style={{ padding: '0.4rem 0.85rem' }}
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="24/7 Emergency">24/7 Emergency ER</option>
            <option value="Veterinary Hospital">Veterinary Hospitals</option>
            <option value="Animal Shelter">Animal Shelters</option>
            <option value="Rescue NGO">Rescue NGOs</option>
            <option value="Wildlife Rescue">Wildlife Rescue</option>
          </select>
        </div>
      </div>

      {/* Main Directory Layout */}
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem' }}>
          <Loader2 size={36} className="animate-spin" color="var(--teal-600)" style={{ marginBottom: '0.5rem' }} />
          <p style={{ color: 'var(--slate-600)', fontSize: '0.95rem' }}>
            Querying OpenStreetMap Overpass API for nearby veterinary clinics & shelters...
          </p>
        </div>
      ) : services.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem' }}>
          <MapPin size={48} color="var(--slate-400)" style={{ marginBottom: '0.75rem' }} />
          <h3>No Facilities Found</h3>
          <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            No veterinary hospitals or rescue organizations matched your filter criteria in this area.
          </p>
          <a href={getGoogleMapsFallbackUrl()} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            <ExternalLink size={18} />
            <span>Search on Google Maps</span>
          </a>
        </div>
      ) : (
        <div className="grid-2">
          {services.map(svc => (
            <div key={svc.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '1.15rem' }}>{svc.name}</h3>
                    {svc.verified && <ShieldCheck size={18} color="var(--teal-600)" />}
                    {svc.is_demo ? (
                      <span className="badge badge-amber" style={{ fontSize: '0.75rem' }}>DEMO FALLBACK DATA</span>
                    ) : (
                      <span className="badge badge-purple" style={{ fontSize: '0.75rem' }}>LIVE OPENSTREETMAP</span>
                    )}
                  </div>
                  <div style={{ marginTop: '4px' }}>
                    <span className="badge badge-teal">{svc.service_type}</span>
                    {svc.open_24_hours && <span className="badge badge-red" style={{ marginLeft: '0.4rem' }}>24/7 Emergency</span>}
                  </div>
                </div>

                <span className="badge badge-blue" style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                  <MapPin size={12} /> {svc.distance_miles || 'Nearby'}
                </span>
              </div>

              <div style={{ fontSize: '0.875rem', color: 'var(--slate-600)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div><strong>Address:</strong> {svc.address}</div>
                <div>
                  <strong>Phone:</strong>{' '}
                  <a href={`tel:${svc.phone.replace(/\D/g, '')}`} style={{ color: 'var(--teal-600)', fontWeight: '700' }}>
                    {svc.phone}
                  </a>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--slate-100)' }}>
                <a 
                  href={`tel:${svc.phone.replace(/\D/g, '')}`}
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1 }}
                >
                  <PhoneCall size={16} />
                  <span>Call Hospital</span>
                </a>

                <a 
                  href={svc.directions_url || `https://www.google.com/maps/dir/?api=1&destination=${svc.latitude},${svc.longitude}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                  style={{ flex: 1 }}
                >
                  <Navigation size={16} />
                  <span>Get Directions</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
