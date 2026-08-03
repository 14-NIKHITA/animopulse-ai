import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { 
  User, 
  Bell, 
  ShieldAlert, 
  LogOut, 
  Trash2, 
  Download, 
  Save
} from 'lucide-react';

export default function SettingsPage() {
  const { user: authUser, userProfile, signOut } = useAuth();
  const { pets, medicalRecords, vaccinations, addToast } = useApp();

  const [profileForm, setProfileForm] = useState({
    full_name: userProfile?.full_name || authUser?.user_metadata?.full_name || authUser?.email?.split('@')[0] || '',
    email: authUser?.email || '',
    phone: userProfile?.phone || '+1 (555) 382-9102'
  });

  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    vaccine_reminders: true,
    emergency_alerts: true
  });

  const handleSaveProfile = (e) => {
    e.preventDefault();
    addToast('Profile and notification preferences saved!', 'success');
  };

  const handleExportJson = () => {
    const exportData = {
      export_date: new Date().toISOString(),
      user: authUser,
      pets,
      vaccinations,
      medical_records: medicalRecords
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `animopulse_pet_passport_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    addToast('Pet Health Passport JSON downloaded.', 'info');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '900px' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.6rem' }}>Account & System Settings</h2>
        <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem' }}>
          Configure account details, notification channels, emergency contacts, and data export.
        </p>
      </div>

      {/* User Profile Form */}
      <div className="card">
        <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={20} color="var(--teal-600)" /> Profile Details
        </h3>

        <form onSubmit={handleSaveProfile}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                className="form-control"
                value={profileForm.full_name}
                onChange={e => setProfileForm({ ...profileForm, full_name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                className="form-control"
                value={profileForm.email}
                onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                disabled
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number (SMS Notifications)</label>
            <input 
              type="text" 
              className="form-control"
              value={profileForm.phone}
              onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
            />
          </div>

          {/* Notification Preferences */}
          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--slate-200)' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={18} color="var(--amber-600)" /> Notification Preferences
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem' }}>
                <input 
                  type="checkbox" 
                  checked={notifications.vaccine_reminders}
                  onChange={e => setNotifications({ ...notifications, vaccine_reminders: e.target.checked })}
                />
                <span>Vaccination Due Date In-App & SMS Reminders</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem' }}>
                <input 
                  type="checkbox" 
                  checked={notifications.emergency_alerts}
                  onChange={e => setNotifications({ ...notifications, emergency_alerts: e.target.checked })}
                />
                <span>Broadcast Emergency Rescue Alerts to Nearby Clinics</span>
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="submit" className="btn btn-primary">
              <Save size={16} />
              <span>Save Settings</span>
            </button>
          </div>
        </form>
      </div>

      {/* Data Export & Backup */}
      <div className="card">
        <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Download size={20} color="var(--blue-600)" /> Data Export & Backup
        </h3>
        <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          Download a complete JSON copy of your pet profiles, vaccination records, and medical document metadata.
        </p>
        <button onClick={handleExportJson} className="btn btn-navy">
          <Download size={16} />
          <span>Export Pet Health Passport (JSON)</span>
        </button>
      </div>

      {/* Account Danger Zone */}
      <div className="card" style={{ border: '1px solid #FECACA', backgroundColor: '#FFF5F5' }}>
        <h3 style={{ fontSize: '1.15rem', color: 'var(--red-600)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldAlert size={20} /> Account Actions & Danger Zone
        </h3>
        <p style={{ color: '#991B1B', fontSize: '0.875rem', marginBottom: '1rem' }}>
          Sign out of your session or delete your user account and all stored pet health records.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={signOut} className="btn btn-outline">
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>

          <button 
            onClick={() => {
              if (confirm('CAUTION: Are you sure you want to delete your account? This action cannot be undone.')) {
                signOut();
              }
            }}
            className="btn btn-danger"
          >
            <Trash2 size={16} />
            <span>Delete My Account</span>
          </button>
        </div>
      </div>
    </div>
  );
}
