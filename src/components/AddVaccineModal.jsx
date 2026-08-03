import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Syringe, Loader2, AlertCircle } from 'lucide-react';

export default function AddVaccineModal({ isOpen, onClose }) {
  const { pets, activePetId, addVaccination } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    pet_id: activePetId || (pets[0]?.id || ''),
    vaccine_name: '',
    last_vaccination_date: new Date().toISOString().split('T')[0],
    next_due_date: '',
    veterinarian_name: '',
    hospital_name: '',
    notes: ''
  });

  useEffect(() => {
    if (pets.length > 0 && !formData.pet_id) {
      setFormData(prev => ({ ...prev, pet_id: activePetId || pets[0].id }));
    }
  }, [pets, activePetId]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.vaccine_name || !formData.next_due_date || !formData.pet_id) return;

    setIsSubmitting(true);
    try {
      await addVaccination(formData);
      setFormData({
        pet_id: activePetId || (pets[0]?.id || ''),
        vaccine_name: '',
        last_vaccination_date: new Date().toISOString().split('T')[0],
        next_due_date: '',
        veterinarian_name: '',
        hospital_name: '',
        notes: ''
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
            <div style={{ padding: '0.4rem', borderRadius: '8px', backgroundColor: '#FEF3C7', color: 'var(--amber-600)' }}>
              <Syringe size={20} />
            </div>
            <h3 style={{ fontSize: '1.15rem' }}>Log Vaccination Entry</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--slate-400)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {pets.length === 0 ? (
              <div style={{
                padding: '1rem',
                backgroundColor: 'var(--amber-100)',
                color: 'var(--amber-600)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem',
                fontSize: '0.9rem'
              }}>
                <AlertCircle size={18} />
                <span>Please add a pet profile first before logging a vaccination.</span>
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">Select Pet *</label>
                <select 
                  className="form-control"
                  value={formData.pet_id}
                  onChange={e => setFormData({ ...formData, pet_id: e.target.value })}
                  required
                >
                  {pets.map(p => (
                    <option key={p.id} value={p.id}>
                      🐾 {p.name} ({p.animal_type} - {p.breed || 'Mix'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Vaccine Name *</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="e.g. Rabies Booster, DHPP, FVRCP" 
                required
                value={formData.vaccine_name}
                onChange={e => setFormData({ ...formData, vaccine_name: e.target.value })}
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Last Vaccination Date</label>
                <input 
                  type="date" 
                  className="form-control"
                  value={formData.last_vaccination_date}
                  onChange={e => setFormData({ ...formData, last_vaccination_date: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Next Due Date *</label>
                <input 
                  type="date" 
                  className="form-control"
                  required
                  value={formData.next_due_date}
                  onChange={e => setFormData({ ...formData, next_due_date: e.target.value })}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                  Status (Overdue, Due Soon, Upcoming) auto-calculated based on due date.
                </span>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Veterinarian Name</label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="e.g. Dr. Sarah Jenkins"
                  value={formData.veterinarian_name}
                  onChange={e => setFormData({ ...formData, veterinarian_name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Clinic / Hospital</label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="e.g. Metro Pet Healthcare Center"
                  value={formData.hospital_name}
                  onChange={e => setFormData({ ...formData, hospital_name: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea 
                className="form-control" 
                rows="2"
                placeholder="e.g. Batch #90812, administered in right shoulder."
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={isSubmitting}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting || pets.length === 0}>
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving to Supabase...</span>
                </>
              ) : (
                <span>Save Vaccination</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
