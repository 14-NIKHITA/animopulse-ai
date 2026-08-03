import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  Heart, 
  Syringe, 
  FileText, 
  Bot, 
  AlertTriangle, 
  Edit3, 
  ArrowLeft,
  Calendar,
  Shield,
  Activity
} from 'lucide-react';

export default function PetDetails({ onOpenAddRecord, onOpenLogVaccine }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pets, activePet, activePetId, setActivePetId, vaccinations, medicalRecords, aiConversations, updatePet } = useApp();

  // Find target pet or fall back to active pet
  const targetPet = pets.find(p => String(p.id) === String(id)) || activePet || pets[0];
  const [activeTab, setActiveTab] = useState('Overview');
  const [isEditing, setIsEditing] = useState(false);

  const [editForm, setEditForm] = useState({
    name: targetPet?.name || '',
    weight: targetPet?.weight || '',
    allergies: targetPet?.allergies || '',
    medications: targetPet?.medications || '',
    medical_conditions: targetPet?.medical_conditions || '',
    notes: targetPet?.notes || ''
  });

  if (!targetPet) {
    return <div style={{ padding: '2rem' }}>Pet profile not found.</div>;
  }

  const petVaccines = vaccinations.filter(v => String(v.pet_id) === String(targetPet.id));
  const petRecords = medicalRecords.filter(m => String(m.pet_id) === String(targetPet.id));
  const petChats = aiConversations.filter(c => String(c.pet_id) === String(targetPet.id));

  const handleSaveEdit = (e) => {
    e.preventDefault();
    updatePet(targetPet.id, editForm);
    setIsEditing(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Navigation */}
      <button 
        onClick={() => navigate('/pets')}
        className="btn btn-outline btn-sm"
        style={{ width: 'fit-content' }}
      >
        <ArrowLeft size={16} /> Back to My Pets
      </button>

      {/* Pet Header Profile Card */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            <img 
              src={targetPet.image_url} 
              alt={targetPet.name} 
              style={{ width: '90px', height: '90px', borderRadius: '16px', objectFit: 'cover' }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h2 style={{ fontSize: '1.8rem' }}>{targetPet.name}</h2>
                <span className="badge badge-teal">{targetPet.animal_type}</span>
              </div>
              <p style={{ color: 'var(--slate-600)', fontSize: '0.95rem' }}>
                {targetPet.breed} • {targetPet.gender} • {targetPet.weight} kg
              </p>
              <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginTop: '4px' }}>
                Microchip ID: <strong>{targetPet.microchip_number || 'N/A'}</strong> • DOB: {targetPet.date_of_birth || 'N/A'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {String(targetPet.id) !== String(activePetId) && (
              <button 
                onClick={() => setActivePetId(targetPet.id)}
                className="btn btn-primary"
              >
                Set as Active Focus
              </button>
            )}

            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="btn btn-outline"
            >
              <Edit3 size={16} />
              <span>{isEditing ? 'Cancel Edit' : 'Edit Health Passport'}</span>
            </button>
          </div>
        </div>

        {/* Inline Edit Form */}
        {isEditing && (
          <form onSubmit={handleSaveEdit} style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--slate-200)' }}>
            <h4 style={{ marginBottom: '1rem' }}>Edit Health Details</h4>
            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">Weight (kg)</label>
                <input 
                  type="number" 
                  step="0.1"
                  className="form-control"
                  value={editForm.weight}
                  onChange={e => setEditForm({ ...editForm, weight: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Allergies</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={editForm.allergies}
                  onChange={e => setEditForm({ ...editForm, allergies: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Active Medications</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={editForm.medications}
                  onChange={e => setEditForm({ ...editForm, medications: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Medical Conditions</label>
              <input 
                type="text" 
                className="form-control"
                value={editForm.medical_conditions}
                onChange={e => setEditForm({ ...editForm, medical_conditions: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-primary btn-sm">Save Changes</button>
            </div>
          </form>
        )}
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--slate-200)' }}>
        {['Overview', 'Vaccinations', 'Medical Reports', 'AI Conversations'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.75rem 1.25rem',
              fontWeight: '700',
              fontSize: '0.95rem',
              background: 'none',
              color: activeTab === tab ? 'var(--teal-600)' : 'var(--slate-600)',
              borderBottom: activeTab === tab ? '3px solid var(--teal-600)' : 'none'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content: Overview */}
      {activeTab === 'Overview' && (
        <div className="grid-2">
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={18} color="var(--teal-600)" />
              <span>Critical Health Attributes</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--slate-50)', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--slate-400)', display: 'block' }}>KNOWN ALLERGIES</span>
                <strong style={{ fontSize: '1rem', color: targetPet.allergies !== 'None' ? 'var(--red-600)' : 'inherit' }}>
                  {targetPet.allergies || 'None recorded'}
                </strong>
              </div>

              <div style={{ padding: '0.75rem', backgroundColor: 'var(--slate-50)', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--slate-400)', display: 'block' }}>ACTIVE MEDICATIONS</span>
                <strong style={{ fontSize: '1rem' }}>{targetPet.medications || 'None'}</strong>
              </div>

              <div style={{ padding: '0.75rem', backgroundColor: 'var(--slate-50)', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--slate-400)', display: 'block' }}>MEDICAL CONDITIONS</span>
                <strong style={{ fontSize: '1rem' }}>{targetPet.medical_conditions || 'None'}</strong>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Veterinary Notes</h3>
            <p style={{ color: 'var(--slate-700)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              {targetPet.notes || 'No general notes entered for this pet profile.'}
            </p>
          </div>
        </div>
      )}

      {/* Tab Content: Vaccinations */}
      {activeTab === 'Vaccinations' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>Vaccination Log ({petVaccines.length})</h3>
            <button onClick={onOpenLogVaccine} className="btn btn-primary btn-sm">
              Log Vaccination
            </button>
          </div>

          {petVaccines.length === 0 ? (
            <p style={{ color: 'var(--slate-600)' }}>No vaccinations logged for {targetPet.name}.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {petVaccines.map(v => (
                <div key={v.id} style={{ padding: '0.85rem', border: '1px solid var(--slate-200)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <strong>{v.vaccine_name}</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--slate-600)' }}>
                      Next Due: {v.next_due_date} • Vet: {v.veterinarian_name}
                    </div>
                  </div>
                  <span className={`badge ${v.status === 'Overdue' ? 'badge-red' : v.status === 'Due Soon' ? 'badge-amber' : 'badge-green'}`}>
                    {v.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Medical Reports */}
      {activeTab === 'Medical Reports' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>Medical Documents ({petRecords.length})</h3>
            <button onClick={onOpenAddRecord} className="btn btn-primary btn-sm">
              Upload Report
            </button>
          </div>

          {petRecords.length === 0 ? (
            <p style={{ color: 'var(--slate-600)' }}>No medical documents uploaded for {targetPet.name}.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {petRecords.map(r => (
                <div key={r.id} style={{ padding: '0.85rem', border: '1px solid var(--slate-200)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>{r.title}</strong>
                    <span className="badge badge-blue">{r.category}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginTop: '0.35rem' }}>
                    {r.ai_summary}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: AI Conversations */}
      {activeTab === 'AI Conversations' && (
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>AI Health Assistant History ({petChats.length})</h3>
          {petChats.length === 0 ? (
            <p style={{ color: 'var(--slate-600)' }}>No previous AI consultations for {targetPet.name}.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {petChats.map(c => (
                <div key={c.id} style={{ padding: '0.85rem', backgroundColor: 'var(--slate-50)', borderRadius: '8px' }}>
                  <strong>{c.title}</strong>
                  <div style={{ fontSize: '0.8rem', color: 'var(--slate-600)', marginTop: '4px' }}>
                    {c.messages?.length || 0} Messages • {new Date(c.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
