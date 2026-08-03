import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  History, 
  Bot, 
  FileText, 
  AlertTriangle, 
  Syringe, 
  Filter,
  Calendar,
  MessageSquare
} from 'lucide-react';

export default function HistoryPage() {
  const { pets, aiConversations, medicalRecords, emergencySessions, vaccinations } = useApp();
  const [selectedPetId, setSelectedPetId] = useState('All');
  const [activeCategory, setActiveCategory] = useState('All');

  // Filter lists by selected pet
  const filteredChats = aiConversations.filter(c => selectedPetId === 'All' || String(c.pet_id) === String(selectedPetId));
  const filteredRecords = medicalRecords.filter(m => selectedPetId === 'All' || String(m.pet_id) === String(selectedPetId));
  const filteredEmergencies = emergencySessions.filter(e => selectedPetId === 'All' || String(e.pet_id) === String(selectedPetId));
  const filteredVaccines = vaccinations.filter(v => selectedPetId === 'All' || String(v.pet_id) === String(selectedPetId));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem' }}>Activity & Consultation History</h2>
          <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem' }}>
            Unified audit trail of AI health chats, uploaded medical reports, emergency triage logs, and vaccinations.
          </p>
        </div>

        {/* Pet Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} color="var(--slate-600)" />
          <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Filter by Pet:</span>
          <select 
            className="form-control"
            style={{ padding: '0.4rem 0.85rem' }}
            value={selectedPetId}
            onChange={e => setSelectedPetId(e.target.value)}
          >
            <option value="All">All Pets</option>
            {pets.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.animal_type})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--slate-200)' }}>
        {['All', 'AI Consultations', 'Medical Records', 'Emergency Triage', 'Vaccinations'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveCategory(tab)}
            style={{
              padding: '0.65rem 1.25rem',
              fontWeight: '700',
              fontSize: '0.9rem',
              background: 'none',
              color: activeCategory === tab ? 'var(--teal-600)' : 'var(--slate-600)',
              borderBottom: activeCategory === tab ? '3px solid var(--teal-600)' : 'none'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* History Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* AI Consultations Section */}
        {(activeCategory === 'All' || activeCategory === 'AI Consultations') && (
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bot size={20} color="var(--teal-600)" /> AI Health Assistant Conversations ({filteredChats.length})
            </h3>
            {filteredChats.map(chat => {
              const petObj = pets.find(p => String(p.id) === String(chat.pet_id));
              return (
                <div key={chat.id} style={{ padding: '0.85rem', backgroundColor: 'var(--slate-50)', borderRadius: '8px', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong>{chat.title}</strong>
                    <span className="badge badge-purple">{petObj?.name || 'Pet'}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--slate-600)', marginTop: '4px' }}>
                    {chat.messages?.length || 0} Messages logged
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Emergency Sessions Section */}
        {(activeCategory === 'All' || activeCategory === 'Emergency Triage') && (
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={20} color="var(--red-600)" /> Emergency First Aid Triage Sessions ({filteredEmergencies.length})
            </h3>
            {filteredEmergencies.map(emg => (
              <div key={emg.id} style={{ padding: '0.85rem', backgroundColor: 'var(--red-100)', borderRadius: '8px', marginBottom: '0.5rem', borderLeft: '4px solid var(--red-600)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{emg.emergency_type} ({emg.animal_type})</strong>
                  <span className="badge badge-red">{emg.urgency_level} Urgency</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--slate-700)', marginTop: '4px' }}>
                  {emg.user_description || 'First aid emergency triage initiated.'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
