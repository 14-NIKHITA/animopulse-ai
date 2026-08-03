import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { 
  Bell, 
  AlertTriangle, 
  User, 
  LogOut, 
  LogIn, 
  ChevronDown 
} from 'lucide-react';

export default function Navbar() {
  const { user, userProfile, signOut } = useAuth();
  const { pets, activePetId, setActivePetId, vaccinations } = useApp();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Calculate overdue vaccinations for notifications badge
  const overdueVaccines = vaccinations.filter(v => v.status === 'Overdue');
  const dueSoonVaccines = vaccinations.filter(v => v.status === 'Due Soon');

  const displayName = userProfile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const avatarUrl = userProfile?.avatar_url || user?.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';

  return (
    <header className="header">
      {/* Left: Pet Selector Dropdown */}
      <div className="header-left">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--slate-600)' }}>Pet:</span>
          <select 
            value={activePetId || ''} 
            onChange={(e) => setActivePetId(e.target.value)}
            className="form-control"
            style={{ width: 'auto', padding: '0.4rem 0.85rem', fontWeight: '700', cursor: 'pointer' }}
          >
            {pets.map(p => (
              <option key={p.id} value={p.id}>
                🐾 {p.name} ({p.breed})
              </option>
            ))}
          </select>
        </div>

        <button 
          onClick={() => navigate('/emergency')}
          className="btn btn-danger btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <AlertTriangle size={16} />
          <span>Emergency Triage</span>
        </button>
      </div>

      {/* Right: Notifications & User Profile */}
      <div className="header-right">
        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              background: 'none',
              padding: '0.5rem',
              borderRadius: '50%',
              position: 'relative',
              color: 'var(--slate-600)'
            }}
          >
            <Bell size={20} />
            {(overdueVaccines.length > 0 || dueSoonVaccines.length > 0) && (
              <span style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '10px',
                height: '10px',
                backgroundColor: 'var(--red-500)',
                borderRadius: '50%',
                border: '2px solid #ffffff'
              }} />
            )}
          </button>

          {showNotifications && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '45px',
              width: '320px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--slate-200)',
              padding: '1rem',
              zIndex: 60
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h4 style={{ fontSize: '0.95rem' }}>Vaccination Reminders</h4>
                <span className="badge badge-amber">{overdueVaccines.length + dueSoonVaccines.length} Alerts</span>
              </div>
              
              {overdueVaccines.length === 0 && dueSoonVaccines.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>All pets are up to date on vaccinations!</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '250px', overflowY: 'auto' }}>
                  {overdueVaccines.map(v => (
                    <div key={v.id} style={{ padding: '0.5rem', backgroundColor: 'var(--red-100)', borderRadius: '6px', fontSize: '0.825rem', color: 'var(--red-600)' }}>
                      🚨 <strong>{v.vaccine_name}</strong> was due on {v.next_due_date}!
                    </div>
                  ))}
                  {dueSoonVaccines.map(v => (
                    <div key={v.id} style={{ padding: '0.5rem', backgroundColor: 'var(--amber-100)', borderRadius: '6px', fontSize: '0.825rem', color: 'var(--amber-600)' }}>
                      ⚠️ <strong>{v.vaccine_name}</strong> due soon on {v.next_due_date}.
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Account Menu */}
        <div style={{ position: 'relative' }}>
          {user ? (
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                background: 'none',
                padding: '0.35rem 0.65rem',
                borderRadius: '8px',
                border: '1px solid var(--slate-200)'
              }}
            >
              <img 
                src={avatarUrl} 
                alt={displayName}
                style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--navy-900)' }}>
                {displayName}
              </span>
              <ChevronDown size={16} color="var(--slate-600)" />
            </button>
          ) : (
            <button 
              onClick={() => navigate('/login')}
              className="btn btn-primary btn-sm"
            >
              <LogIn size={16} />
              <span>Sign In</span>
            </button>
          )}

          {showUserMenu && user && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '48px',
              width: '200px',
              backgroundColor: '#ffffff',
              borderRadius: '10px',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--slate-200)',
              padding: '0.5rem',
              zIndex: 60
            }}>
              <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--slate-100)', fontSize: '0.8rem', color: 'var(--slate-600)' }}>
                Signed in as<br />
                <strong style={{ color: 'var(--navy-900)' }}>{user.email}</strong>
              </div>

              <button 
                onClick={() => { setShowUserMenu(false); navigate('/settings'); }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'none',
                  fontSize: '0.875rem',
                  borderRadius: '6px',
                  color: 'var(--slate-700)'
                }}
              >
                <User size={16} />
                <span>Account Settings</span>
              </button>

              <button 
                onClick={() => { setShowUserMenu(false); signOut(); navigate('/login'); }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'none',
                  fontSize: '0.875rem',
                  borderRadius: '6px',
                  color: 'var(--red-600)'
                }}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
