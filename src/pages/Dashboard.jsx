import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { 
  Heart, 
  Syringe, 
  FileText, 
  Bot, 
  AlertTriangle, 
  Plus, 
  Upload, 
  MessageSquare, 
  ArrowRight,
  Shield,
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function Dashboard({ onOpenAddPet, onOpenAddRecord, onOpenLogVaccine }) {
  const { user, userProfile } = useAuth();
  const { pets, vaccinations, medicalRecords, aiConversations, activePet } = useApp();
  const navigate = useNavigate();

  const userName = userProfile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Pet Owner';

  const overdueVaccines = (vaccinations || []).filter(v => v.status === 'Overdue');
  const dueSoonVaccines = (vaccinations || []).filter(v => v.status === 'Due Soon');
  const upcomingVaccines = (vaccinations || []).filter(v => v.status === 'Upcoming');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Welcome Banner & Emergency Action Bar */}
      <div style={{
        backgroundColor: 'var(--navy-900)',
        color: '#ffffff',
        borderRadius: '16px',
        padding: '1.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <Shield size={20} color="var(--teal-400)" />
            <span style={{ fontSize: '0.85rem', color: 'var(--teal-400)', fontWeight: '700', textTransform: 'uppercase' }}>
              AnimoPulse Health Command
            </span>
          </div>
          <h2 style={{ color: '#ffffff', fontSize: '1.6rem' }}>
            Hello, {userName}! Managing {(pets || []).length} Registered {(pets || []).length === 1 ? 'Pet' : 'Pets'}
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            {activePet ? (
              <>Active focus: <strong>{activePet.name}</strong> ({activePet.breed || activePet.animal_type}{activePet.weight ? `, ${activePet.weight}kg` : ''})</>
            ) : (
              <>No active pet selected. Click 'Add Pet' to create your first pet profile.</>
            )}
          </p>
        </div>

        {/* Quick Action Shortcuts */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button 
            onClick={onOpenAddPet}
            className="btn btn-primary"
          >
            <Plus size={18} />
            <span>Add Pet</span>
          </button>

          <button 
            onClick={onOpenAddRecord}
            className="btn btn-navy"
            style={{ border: '1px solid rgba(255, 255, 255, 0.2)' }}
          >
            <Upload size={18} />
            <span>Upload Report</span>
          </button>

          <button 
            onClick={() => navigate('/emergency')}
            className="btn btn-danger"
          >
            <AlertTriangle size={18} />
            <span>Emergency Help</span>
          </button>
        </div>
      </div>

      {/* Critical Overdue Vaccination Alert Banner (If Any) */}
      {(overdueVaccines || []).length > 0 && (
        <div style={{
          backgroundColor: 'var(--red-100)',
          border: '1px solid #FECACA',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: 'var(--red-600)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertCircle size={24} />
            <div>
              <strong style={{ fontSize: '0.95rem' }}>
                Vaccination Alert: {(overdueVaccines || []).length} Overdue Vaccine(s) Detected!
              </strong>
              <p style={{ fontSize: '0.85rem', color: '#991B1B' }}>
                {(() => {
                  const petObj = (pets || []).find(p => String(p.id) === String(overdueVaccines[0]?.pet_id));
                  return `${overdueVaccines[0]?.vaccine_name} for ${petObj?.name || 'Pet'} was due on ${overdueVaccines[0]?.next_due_date}.`;
                })()}
              </p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/vaccinations')}
            className="btn btn-danger btn-sm"
          >
            View Tracker
          </button>
        </div>
      )}

      {/* Overview Stat Widgets Grid */}
      <div className="grid-4">
        {/* Total Pets Widget */}
        <div className="card stat-widget" style={{ cursor: 'pointer' }} onClick={() => navigate('/pets')}>
          <div className="stat-icon-wrapper stat-icon-blue">
            <Heart size={26} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--slate-600)', fontWeight: '600' }}>Total Pets</span>
            <h3 style={{ fontSize: '1.6rem', marginTop: '2px' }}>{(pets || []).length}</h3>
          </div>
        </div>

        {/* Upcoming & Overdue Vaccinations Widget */}
        <div className="card stat-widget" style={{ cursor: 'pointer' }} onClick={() => navigate('/vaccinations')}>
          <div className="stat-icon-wrapper stat-icon-amber">
            <Syringe size={26} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--slate-600)', fontWeight: '600' }}>Vaccine Alerts</span>
            <h3 style={{ fontSize: '1.6rem', marginTop: '2px' }}>
              {(overdueVaccines || []).length + (dueSoonVaccines || []).length}
            </h3>
          </div>
        </div>

        {/* Medical Reports Count Widget */}
        <div className="card stat-widget" style={{ cursor: 'pointer' }} onClick={() => navigate('/medical-records')}>
          <div className="stat-icon-wrapper stat-icon-teal">
            <FileText size={26} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--slate-600)', fontWeight: '600' }}>Medical Reports</span>
            <h3 style={{ fontSize: '1.6rem', marginTop: '2px' }}>{(medicalRecords || []).length}</h3>
          </div>
        </div>

        {/* Recent AI Chats Widget */}
        <div className="card stat-widget" style={{ cursor: 'pointer' }} onClick={() => navigate('/ai-assistant')}>
          <div className="stat-icon-wrapper stat-icon-blue">
            <Bot size={26} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--slate-600)', fontWeight: '600' }}>AI Consultations</span>
            <h3 style={{ fontSize: '1.6rem', marginTop: '2px' }}>{(aiConversations || []).length}</h3>
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid-2">
        {/* Left: Upcoming Vaccinations Widget */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Syringe size={20} color="var(--amber-600)" />
              <span>Vaccination Schedule</span>
            </h3>
            <button onClick={onOpenLogVaccine} className="btn btn-outline btn-sm">
              <Plus size={14} /> Log Vaccine
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(vaccinations || []).length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--slate-500)', fontSize: '0.9rem' }}>
                No vaccination records logged yet. Click 'Log Vaccine' to add your first entry.
              </div>
            ) : (
              (vaccinations || []).slice(0, 4).map(v => {
                const petObj = (pets || []).find(p => String(p.id) === String(v.pet_id));
                return (
                  <div 
                    key={v.id}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: '10px',
                      border: '1px solid var(--slate-200)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: v.status === 'Overdue' ? 'var(--red-100)' : '#ffffff'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>
                        {v.vaccine_name} ({petObj?.name || 'Pet'})
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--slate-600)' }}>
                        Next Due: {v.next_due_date} {v.hospital_name ? `• ${v.hospital_name}` : ''}
                      </div>
                    </div>

                    <span className={`badge ${
                      v.status === 'Overdue' ? 'badge-red' :
                      v.status === 'Due Soon' ? 'badge-amber' :
                      v.status === 'Completed' ? 'badge-green' : 'badge-blue'
                    }`}>
                      {v.status}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: AI Health Assistant Quick Launcher */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bot size={20} color="var(--teal-600)" />
              <span>Ask AI Health Assistant</span>
            </h3>
            <span className="badge badge-purple">RAG Grounded</span>
          </div>

          <p style={{ fontSize: '0.9rem', color: 'var(--slate-600)' }}>
            Ask questions about <strong>{activePet?.name}</strong> using profile data & uploaded medical reports.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button 
              onClick={() => navigate(`/ai-assistant?prompt=What+allergy+is+mentioned+in+${encodeURIComponent(activePet?.name || 'pet')}+medical+report`)}
              className="btn btn-outline"
              style={{ textAlign: 'left', justifyContent: 'flex-start', fontSize: '0.85rem' }}
            >
              💬 "What allergy is mentioned in {activePet?.name || 'pet'}'s medical report?"
            </button>
            <button 
              onClick={() => navigate(`/ai-assistant?prompt=When+is+${encodeURIComponent(activePet?.name || 'pet')}+rabies+vaccination+due`)}
              className="btn btn-outline"
              style={{ textAlign: 'left', justifyContent: 'flex-start', fontSize: '0.85rem' }}
            >
              💬 "When is {activePet?.name || 'pet'}'s rabies vaccination due?"
            </button>
            <button 
              onClick={() => navigate('/ai-assistant?prompt=Summarize+the+latest+blood+panel')}
              className="btn btn-outline"
              style={{ textAlign: 'left', justifyContent: 'flex-start', fontSize: '0.85rem' }}
            >
              💬 "Summarize latest blood report & lab findings"
            </button>
          </div>

          <button 
            onClick={() => navigate('/ai-assistant')}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            <MessageSquare size={18} />
            <span>Open AI Chat Engine</span>
          </button>
        </div>
      </div>
    </div>
  );
}
