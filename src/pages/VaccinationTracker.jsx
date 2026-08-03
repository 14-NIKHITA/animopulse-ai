import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Syringe, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Trash2, 
  Calendar,
  Loader2,
  FolderOpen
} from 'lucide-react';

export default function VaccinationTracker({ onOpenLogVaccine }) {
  const { vaccinations, vaccinationsLoading, toggleVaccineCompleted, deleteVaccination, pets } = useApp();
  const [activeTab, setActiveTab] = useState('All');

  const filteredVaccines = vaccinations.filter(v => {
    if (activeTab === 'All') return true;
    return v.status === activeTab;
  });

  const overdueCount = vaccinations.filter(v => v.status === 'Overdue').length;
  const dueSoonCount = vaccinations.filter(v => v.status === 'Due Soon').length;
  const upcomingCount = vaccinations.filter(v => v.status === 'Upcoming').length;
  const completedCount = vaccinations.filter(v => v.status === 'Completed').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem' }}>Vaccination Tracker & Schedule</h2>
          <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem' }}>
            Track Rabies, DHPP, FVRCP, and Bordetella boosters with automated countdown alerts.
          </p>
        </div>

        <button onClick={onOpenLogVaccine} className="btn btn-primary">
          <Plus size={18} />
          <span>Log New Vaccination</span>
        </button>
      </div>

      {/* Overview Stat Badges */}
      <div className="grid-4">
        <div 
          onClick={() => setActiveTab('Overdue')}
          className="card stat-widget" 
          style={{ cursor: 'pointer', border: activeTab === 'Overdue' ? '2px solid var(--red-500)' : '1px solid var(--slate-200)' }}
        >
          <div className="stat-icon-wrapper stat-icon-red"><AlertCircle size={26} /></div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--slate-600)' }}>Overdue</span>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--red-600)' }}>{overdueCount}</h3>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('Due Soon')}
          className="card stat-widget" 
          style={{ cursor: 'pointer', border: activeTab === 'Due Soon' ? '2px solid var(--amber-500)' : '1px solid var(--slate-200)' }}
        >
          <div className="stat-icon-wrapper stat-icon-amber"><Clock size={26} /></div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--slate-600)' }}>Due Soon (30 Days)</span>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--amber-600)' }}>{dueSoonCount}</h3>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('Upcoming')}
          className="card stat-widget" 
          style={{ cursor: 'pointer', border: activeTab === 'Upcoming' ? '2px solid var(--sky-500)' : '1px solid var(--slate-200)' }}
        >
          <div className="stat-icon-wrapper stat-icon-blue"><Calendar size={26} /></div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--slate-600)' }}>Upcoming</span>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--sky-500)' }}>{upcomingCount}</h3>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('Completed')}
          className="card stat-widget" 
          style={{ cursor: 'pointer', border: activeTab === 'Completed' ? '2px solid var(--green-500)' : '1px solid var(--slate-200)' }}
        >
          <div className="stat-icon-wrapper stat-icon-teal"><CheckCircle2 size={26} /></div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--slate-600)' }}>Completed</span>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--green-600)' }}>{completedCount}</h3>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--slate-200)' }}>
        {['All', 'Overdue', 'Due Soon', 'Upcoming', 'Completed'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.65rem 1.25rem',
              fontWeight: '700',
              fontSize: '0.9rem',
              background: 'none',
              color: activeTab === tab ? 'var(--teal-600)' : 'var(--slate-600)',
              borderBottom: activeTab === tab ? '3px solid var(--teal-600)' : 'none'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {vaccinationsLoading ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Loader2 size={32} className="animate-spin" color="var(--teal-600)" style={{ marginBottom: '0.5rem' }} />
          <p style={{ color: 'var(--slate-600)' }}>Loading vaccination schedule from Supabase...</p>
        </div>
      ) : filteredVaccines.length === 0 ? (
        /* Empty State */
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <FolderOpen size={48} color="var(--slate-400)" style={{ marginBottom: '0.75rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Vaccination Records</h3>
          <p style={{ color: 'var(--slate-600)', maxWidth: '450px', margin: '0 auto 1.5rem auto', fontSize: '0.95rem' }}>
            {activeTab !== 'All' ? `No records categorized under "${activeTab}".` : 'You have not logged any vaccinations yet.'}
          </p>
          <button onClick={onOpenLogVaccine} className="btn btn-primary">
            <Plus size={18} />
            <span>Log Your First Vaccination</span>
          </button>
        </div>
      ) : (
        /* Vaccination List Cards */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredVaccines.map(vac => {
            const petObj = pets.find(p => String(p.id) === String(vac.pet_id));
            const isOverdue = vac.status === 'Overdue';

            return (
              <div 
                key={vac.id} 
                className="card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  backgroundColor: isOverdue ? 'var(--red-100)' : '#ffffff',
                  border: isOverdue ? '1px solid #FECACA' : '1px solid var(--slate-200)'
                }}
              >
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <img 
                    src={petObj?.image_url || 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=300&q=80'} 
                    alt={petObj?.name} 
                    style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <h3 style={{ fontSize: '1.1rem' }}>{vac.vaccine_name}</h3>
                      <span className={`badge ${
                        vac.status === 'Overdue' ? 'badge-red' :
                        vac.status === 'Due Soon' ? 'badge-amber' :
                        vac.status === 'Completed' ? 'badge-green' : 'badge-blue'
                      }`}>
                        {vac.status}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginTop: '2px' }}>
                      Patient: <strong>{petObj?.name || 'Pet'}</strong> ({petObj?.animal_type} {petObj?.breed ? `• ${petObj.breed}` : ''}) {vac.veterinarian_name ? `• Vet: ${vac.veterinarian_name}` : ''}
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '2px' }}>
                      Last Given: {vac.last_vaccination_date || 'N/A'} • Next Due: <strong style={{ color: isOverdue ? 'var(--red-600)' : 'inherit' }}>{vac.next_due_date}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button 
                    onClick={() => toggleVaccineCompleted(vac.id)}
                    className={`btn ${vac.status === 'Completed' ? 'btn-outline' : 'btn-primary'} btn-sm`}
                  >
                    <CheckCircle2 size={16} />
                    <span>{vac.status === 'Completed' ? 'Mark Pending' : 'Mark Completed'}</span>
                  </button>

                  <button 
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete "${vac.vaccine_name}"?`)) {
                        deleteVaccination(vac.id);
                      }
                    }}
                    className="btn btn-outline btn-sm"
                    style={{ color: 'var(--red-600)' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
