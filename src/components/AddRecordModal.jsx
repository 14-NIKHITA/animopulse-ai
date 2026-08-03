import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { extractTextFromFile } from '../lib/rag';
import { X, FileText, Upload, Sparkles, Loader2, AlertCircle } from 'lucide-react';

const CATEGORIES = [
  'Prescription',
  'Blood report',
  'Vaccination certificate',
  'X-ray',
  'Scan',
  'General checkup',
  'Surgery record',
  'Discharge summary',
  'Other'
];

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export default function AddRecordModal({ isOpen, onClose }) {
  const { pets, activePetId, addMedicalRecord } = useApp();
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    pet_id: activePetId || (pets[0]?.id || ''),
    title: '',
    category: 'General checkup',
    veterinarian_name: '',
    hospital_name: '',
    record_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    if (pets.length > 0 && !formData.pet_id) {
      setFormData(prev => ({ ...prev, pet_id: activePetId || pets[0].id }));
    }
  }, [pets, activePetId]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    setFileError('');
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      const fileExt = selected.name.split('.').pop()?.toLowerCase();

      if (!validTypes.includes(selected.type) && !['pdf', 'jpg', 'jpeg', 'png'].includes(fileExt)) {
        setFileError('Invalid file type! Only PDF, JPG, JPEG, and PNG files are supported.');
        setFile(null);
        return;
      }

      if (selected.size > MAX_FILE_SIZE_BYTES) {
        setFileError('File size exceeds the 10MB limit! Please select a smaller document.');
        setFile(null);
        return;
      }

      setFile(selected);
      if (!formData.title) {
        setFormData(prev => ({ ...prev, title: selected.name.replace(/\.[^/.]+$/, "") }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.category || !formData.pet_id) return;

    setIsProcessing(true);

    try {
      // Prepare RAG extracted text placeholder
      const extractedText = file 
        ? await extractTextFromFile(file, formData.category, formData.title)
        : `Document "${formData.title}" (${formData.category}) recorded for pet profile.`;

      const aiSummary = `Document "${formData.title}" (${formData.category}) processed and ready for AI Health Assistant search. Clinical notes: ${formData.notes || 'No specific notes recorded.'}`;

      await addMedicalRecord({
        ...formData,
        extracted_text: extractedText,
        ai_summary: aiSummary
      }, file);

      setFormData({
        pet_id: activePetId || (pets[0]?.id || ''),
        title: '',
        category: 'General checkup',
        veterinarian_name: '',
        hospital_name: '',
        record_date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      setFile(null);
      setFileError('');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ padding: '0.4rem', borderRadius: '8px', backgroundColor: '#EFF6FF', color: 'var(--blue-600)' }}>
              <FileText size={20} />
            </div>
            <h3 style={{ fontSize: '1.15rem' }}>Upload Medical Record</h3>
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
                <span>Please add a pet profile first before uploading medical reports.</span>
              </div>
            ) : (
              <div className="grid-2">
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
                        🐾 {p.name} ({p.animal_type})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Record Category *</label>
                  <select 
                    className="form-control"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Report Title *</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="e.g. Dermatology & Allergy Panel" 
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            {/* File Drop Area */}
            <div className="form-group">
              <label className="form-label">Upload Document (PDF, JPG, PNG)</label>
              <div style={{
                border: fileError ? '2px dashed var(--red-500)' : '2px dashed var(--slate-300)',
                borderRadius: '10px',
                padding: '1.5rem',
                textAlign: 'center',
                backgroundColor: 'var(--slate-50)',
                position: 'relative'
              }}>
                <Upload size={32} color="var(--slate-400)" style={{ marginBottom: '0.5rem' }} />
                <p style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--navy-900)' }}>
                  {file ? `Selected: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)` : 'Click to browse or select report file'}
                </p>
                <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                  Allowed: PDF, JPG, JPEG, PNG (Max 10MB)
                </span>
                <input 
                  type="file" 
                  accept=".pdf,.png,.jpg,.jpeg" 
                  onChange={handleFileChange}
                  style={{ display: 'block', width: '100%', height: '100%', opacity: 0, marginTop: '-4rem', cursor: 'pointer' }}
                />
              </div>
              {fileError && (
                <div style={{ fontSize: '0.8rem', color: 'var(--red-600)', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <AlertCircle size={14} />
                  <span>{fileError}</span>
                </div>
              )}
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
                <label className="form-label">Hospital / Clinic</label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="e.g. Metro Pet Healthcare"
                  value={formData.hospital_name}
                  onChange={e => setFormData({ ...formData, hospital_name: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Record Date</label>
              <input 
                type="date" 
                className="form-control"
                value={formData.record_date}
                onChange={e => setFormData({ ...formData, record_date: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Veterinary Notes & Observations</label>
              <textarea 
                className="form-control" 
                rows="3"
                placeholder="Enter clinical findings or diagnosis details..."
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <div style={{
              padding: '0.75rem',
              backgroundColor: 'var(--sky-100)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '0.8rem',
              color: 'var(--sky-500)'
            }}>
              <Sparkles size={16} />
              <span>RAG Engine will automatically prepare text chunks for Gemini AI similarity search.</span>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={isProcessing}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isProcessing || pets.length === 0 || !!fileError}>
              {isProcessing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Uploading to Supabase Storage...</span>
                </>
              ) : (
                <span>Upload & Index Record</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
