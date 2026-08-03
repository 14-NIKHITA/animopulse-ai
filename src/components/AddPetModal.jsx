import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Heart, Loader2 } from 'lucide-react';

const PET_IMAGE_PRESETS = [
  { label: 'Golden Retriever', url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80' },
  { label: 'Persian Cat', url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80' },
  { label: 'Beagle', url: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=600&q=80' },
  { label: 'French Bulldog', url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80' },
  { label: 'Tabby Cat', url: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=600&q=80' }
];

export default function AddPetModal({ isOpen, onClose }) {
  const { addPet } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    animal_type: 'Dog',
    breed: '',
    date_of_birth: '',
    gender: 'Male',
    weight: '',
    colour: '',
    allergies: '',
    medications: '',
    medical_conditions: '',
    microchip_number: '',
    notes: '',
    image_url: PET_IMAGE_PRESETS[0].url
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      await addPet(formData);
      // Reset form
      setFormData({
        name: '',
        animal_type: 'Dog',
        breed: '',
        date_of_birth: '',
        gender: 'Male',
        weight: '',
        colour: '',
        allergies: '',
        medications: '',
        medical_conditions: '',
        microchip_number: '',
        notes: '',
        image_url: PET_IMAGE_PRESETS[0].url
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ padding: '0.4rem', borderRadius: '8px', backgroundColor: '#F0FDF4', color: 'var(--teal-600)' }}>
              <Heart size={20} />
            </div>
            <h3 style={{ fontSize: '1.15rem' }}>Add New Pet Profile</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--slate-400)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Pet Name *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Bruno" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Animal Type *</label>
                <select 
                  className="form-control"
                  value={formData.animal_type}
                  onChange={e => setFormData({ ...formData, animal_type: e.target.value })}
                >
                  <option value="Dog">Dog</option>
                  <option value="Cat">Cat</option>
                  <option value="Bird">Bird</option>
                  <option value="Stray / Rescue">Stray / Rescue</option>
                  <option value="Exotic / Other">Exotic / Other</option>
                </select>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Breed</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Labrador Retriever"
                  value={formData.breed}
                  onChange={e => setFormData({ ...formData, breed: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input 
                  type="date" 
                  className="form-control"
                  value={formData.date_of_birth}
                  onChange={e => setFormData({ ...formData, date_of_birth: e.target.value })}
                />
              </div>
            </div>

            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select 
                  className="form-control"
                  value={formData.gender}
                  onChange={e => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Weight (kg)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  className="form-control" 
                  placeholder="e.g. 28"
                  value={formData.weight}
                  onChange={e => setFormData({ ...formData, weight: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Colour</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Yellow"
                  value={formData.colour}
                  onChange={e => setFormData({ ...formData, colour: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Known Allergies</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="e.g. Chicken, Dairy, Flea bite sensitivity"
                value={formData.allergies}
                onChange={e => setFormData({ ...formData, allergies: e.target.value })}
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Current Medications</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Apoquel 16mg daily"
                  value={formData.medications}
                  onChange={e => setFormData({ ...formData, medications: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Medical Conditions</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Mild skin irritation"
                  value={formData.medical_conditions}
                  onChange={e => setFormData({ ...formData, medical_conditions: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Microchip Number</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="e.g. 985141002948123"
                value={formData.microchip_number}
                onChange={e => setFormData({ ...formData, microchip_number: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Select Profile Picture Preset</label>
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {PET_IMAGE_PRESETS.map((preset, idx) => (
                  <img 
                    key={idx}
                    src={preset.url} 
                    alt={preset.label} 
                    onClick={() => setFormData({ ...formData, image_url: preset.url })}
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                      cursor: 'pointer',
                      border: formData.image_url === preset.url ? '3px solid var(--teal-600)' : '2px solid transparent'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={isSubmitting}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving to Supabase...</span>
                </>
              ) : (
                <span>Save Pet Profile</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
