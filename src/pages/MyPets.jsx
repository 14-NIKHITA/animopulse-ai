import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  Heart, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Filter,
  ArrowRight,
  Loader2,
  FolderOpen
} from 'lucide-react';

export default function MyPets({ onOpenAddPet }) {
  const { pets, petsLoading, activePetId, setActivePetId, deletePet } = useApp();
  const [filterType, setFilterType] = useState('All');
  const navigate = useNavigate();

  const filteredPets = filterType === 'All' 
    ? pets 
    : pets.filter(p => p.animal_type?.toLowerCase().includes(filterType.toLowerCase()));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem' }}>My Pet Profiles ({pets.length})</h2>
          <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem' }}>
            Manage health records, active patient selection, and physical attributes.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {/* Species Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} color="var(--slate-600)" />
            <select 
              className="form-control"
              style={{ padding: '0.4rem 0.85rem' }}
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
            >
              <option value="All">All Species</option>
              <option value="Dog">Dogs</option>
              <option value="Cat">Cats</option>
              <option value="Stray">Rescues / Strays</option>
            </select>
          </div>

          <button onClick={onOpenAddPet} className="btn btn-primary">
            <Plus size={18} />
            <span>Add New Pet</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {petsLoading ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Loader2 size={32} className="animate-spin" color="var(--teal-600)" style={{ marginBottom: '0.5rem' }} />
          <p style={{ color: 'var(--slate-600)' }}>Loading your registered pet profiles from Supabase...</p>
        </div>
      ) : filteredPets.length === 0 ? (
        /* Empty State */
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <FolderOpen size={48} color="var(--slate-400)" style={{ marginBottom: '0.75rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Pet Profiles Found</h3>
          <p style={{ color: 'var(--slate-600)', maxWidth: '450px', margin: '0 auto 1.5rem auto', fontSize: '0.95rem' }}>
            {filterType !== 'All' ? `No pets matching category "${filterType}".` : 'You have not added any pets to your account yet.'}
          </p>
          <button onClick={onOpenAddPet} className="btn btn-primary">
            <Plus size={18} />
            <span>Add Your First Pet Profile</span>
          </button>
        </div>
      ) : (
        /* Pet Cards Grid */
        <div className="grid-3">
          {filteredPets.map(pet => {
            const isActive = String(pet.id) === String(activePetId);

            return (
              <div 
                key={pet.id} 
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  border: isActive ? '2px solid var(--teal-600)' : '1px solid var(--slate-200)',
                  position: 'relative'
                }}
              >
                {/* Active Badge Tag */}
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    backgroundColor: 'var(--teal-600)',
                    color: '#ffffff',
                    padding: '2px 10px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <CheckCircle2 size={12} /> Active Focus
                  </div>
                )}

                {/* Pet Photo & Header */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <img 
                    src={pet.image_url} 
                    alt={pet.name}
                    style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: '14px',
                      objectFit: 'cover',
                      border: '2px solid var(--slate-200)'
                    }}
                  />
                  <div>
                    <h3 style={{ fontSize: '1.25rem' }}>{pet.name}</h3>
                    <span className="badge badge-blue">{pet.animal_type} {pet.breed ? `• ${pet.breed}` : ''}</span>
                    <div style={{ fontSize: '0.8rem', color: 'var(--slate-600)', marginTop: '4px' }}>
                      Microchip: {pet.microchip_number || 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Details Breakdown */}
                <div style={{
                  backgroundColor: 'var(--slate-50)',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  fontSize: '0.85rem',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '0.5rem'
                }}>
                  <div>
                    <span style={{ color: 'var(--slate-400)', display: 'block' }}>Gender / Weight</span>
                    <strong>{pet.gender} {pet.weight ? `• ${pet.weight} kg` : ''}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--slate-400)', display: 'block' }}>Date of Birth</span>
                    <strong>{pet.date_of_birth || 'N/A'}</strong>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ color: 'var(--slate-400)', display: 'block' }}>Allergies</span>
                    <strong style={{ color: pet.allergies !== 'None' ? 'var(--red-600)' : 'inherit' }}>
                      {pet.allergies || 'None listed'}
                    </strong>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.5rem' }}>
                  {!isActive ? (
                    <button 
                      onClick={() => setActivePetId(pet.id)}
                      className="btn btn-outline btn-sm"
                      style={{ flex: 1 }}
                    >
                      Select Active
                    </button>
                  ) : (
                    <button 
                      onClick={() => navigate(`/pets/${pet.id}`)}
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1 }}
                    >
                      View Passport <ArrowRight size={14} />
                    </button>
                  )}

                  <button 
                    onClick={() => navigate(`/pets/${pet.id}`)}
                    className="btn btn-outline btn-sm"
                    title="View Full Profile"
                  >
                    <Edit3 size={16} />
                  </button>

                  <button 
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete ${pet.name}?`)) {
                        deletePet(pet.id);
                      }
                    }}
                    className="btn btn-outline btn-sm"
                    style={{ color: 'var(--red-600)' }}
                    title="Delete Pet"
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
