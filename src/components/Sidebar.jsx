import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  Heart, 
  FileText, 
  Syringe, 
  Bot, 
  AlertTriangle, 
  MapPin, 
  History, 
  Settings,
  ChevronRight,
  Shield
} from 'lucide-react';

export default function Sidebar() {
  const { activePet, pets } = useApp();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Pets', path: '/pets', icon: Heart, badge: pets.length },
    { name: 'Medical Records', path: '/medical-records', icon: FileText },
    { name: 'Vaccination Tracker', path: '/vaccinations', icon: Syringe },
    { name: 'AI Health Assistant', path: '/ai-assistant', icon: Bot },
    { name: 'Emergency First Aid', path: '/emergency', icon: AlertTriangle, isEmergency: true },
    { name: 'Nearby Rescue Services', path: '/nearby-rescues', icon: MapPin },
    { name: 'History', path: '/history', icon: History },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          backgroundColor: '#0D9488',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Shield size={22} color="#ffffff" />
        </div>
        <span>AnimoPulse</span>
      </div>

      {activePet && (
        <div style={{
          padding: '0.85rem 1.25rem',
          margin: '0.75rem 0.75rem 0.25rem 0.75rem',
          backgroundColor: 'rgba(255, 255, 255, 0.06)',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <img 
            src={activePet.image_url} 
            alt={activePet.name} 
            style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Active Patient
            </div>
            <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#ffffff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {activePet.name}
            </div>
          </div>
        </div>
      )}

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `nav-item ${item.isEmergency ? 'emergency-nav' : ''} ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={20} />
              <span style={{ flex: 1 }}>{item.name}</span>
              {item.badge !== undefined && (
                <span style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.18)',
                  color: '#ffffff',
                  padding: '2px 7px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: '700'
                }}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div style={{
        padding: '1rem 1.25rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        fontSize: '0.75rem',
        color: '#64748B',
        textAlign: 'center'
      }}>
        AnimoPulse AI Platform v1.0.0
      </div>
    </aside>
  );
}
