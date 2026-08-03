import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  FileText, 
  Upload, 
  Trash2, 
  Eye, 
  Sparkles, 
  Filter, 
  Search,
  Calendar,
  Building,
  Loader2,
  FolderOpen,
  ExternalLink
} from 'lucide-react';

export default function MedicalRecords({ onOpenAddRecord }) {
  const { medicalRecords, medicalRecordsLoading, deleteMedicalRecord, pets } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewRecord, setPreviewRecord] = useState(null);

  const filteredRecords = medicalRecords.filter(r => {
    const matchesCategory = selectedCategory === 'All' || r.category === selectedCategory;
    const matchesQuery = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         r.veterinarian_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         r.hospital_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem' }}>Medical Record Vault ({medicalRecords.length})</h2>
          <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem' }}>
            Store prescriptions, lab reports, and X-rays. Extracted text is indexed into pgvector for Gemini RAG queries.
          </p>
        </div>

        <button onClick={onOpenAddRecord} className="btn btn-primary">
          <Upload size={18} />
          <span>Upload Medical Report</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="card" style={{ padding: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '220px', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--slate-50)', padding: '0.4rem 0.85rem', borderRadius: '8px', border: '1px solid var(--slate-300)' }}>
          <Search size={18} color="var(--slate-400)" />
          <input 
            type="text" 
            placeholder="Search report title, vet name, or hospital..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ border: 'none', background: 'none', width: '100%', outline: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} color="var(--slate-600)" />
          <select 
            className="form-control"
            style={{ padding: '0.4rem 0.85rem' }}
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Prescription">Prescription</option>
            <option value="Blood report">Blood report</option>
            <option value="Vaccination certificate">Vaccination certificate</option>
            <option value="X-ray">X-ray</option>
            <option value="Scan">Scan</option>
            <option value="General checkup">General checkup</option>
            <option value="Surgery record">Surgery record</option>
            <option value="Discharge summary">Discharge summary</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {medicalRecordsLoading ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Loader2 size={32} className="animate-spin" color="var(--teal-600)" style={{ marginBottom: '0.5rem' }} />
          <p style={{ color: 'var(--slate-600)' }}>Loading medical reports from Supabase Storage & Database...</p>
        </div>
      ) : filteredRecords.length === 0 ? (
        /* Empty State */
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <FolderOpen size={48} color="var(--slate-400)" style={{ marginBottom: '0.75rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Medical Records Found</h3>
          <p style={{ color: 'var(--slate-600)', maxWidth: '450px', margin: '0 auto 1.5rem auto', fontSize: '0.95rem' }}>
            {selectedCategory !== 'All' ? `No reports matching category "${selectedCategory}".` : 'You have not uploaded any medical records yet.'}
          </p>
          <button onClick={onOpenAddRecord} className="btn btn-primary">
            <Upload size={18} />
            <span>Upload Your First Report</span>
          </button>
        </div>
      ) : (
        /* Document Grid */
        <div className="grid-2">
          {filteredRecords.map(record => {
            const petObj = pets.find(p => String(p.id) === String(record.pet_id));
            const status = record.processing_status || 'Completed';

            return (
              <div key={record.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '1.15rem' }}>{record.title}</h3>
                      <span className="badge badge-teal">{record.category}</span>
                      <span className={`badge ${
                        status === 'Ready for Embeddings' || status === 'Completed' ? 'badge-green' :
                        status === 'Chunking' ? 'badge-blue' :
                        status === 'Extracting' || status === 'Pending' || status === 'Processing' ? 'badge-amber' :
                        'badge-red'
                      }`}>
                        RAG: {status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginTop: '4px' }}>
                      Patient: <strong>{petObj?.name || 'Pet'}</strong> ({petObj?.animal_type} {petObj?.breed ? `• ${petObj.breed}` : ''})
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <button 
                      onClick={() => setPreviewRecord(record)}
                      className="btn btn-outline btn-sm"
                      title="Preview Document & Extracted Text"
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete medical report "${record.title}"?`)) {
                          deleteMedicalRecord(record.id);
                        }
                      }}
                      className="btn btn-outline btn-sm"
                      style={{ color: 'var(--red-600)' }}
                      title="Delete Record"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div style={{ fontSize: '0.825rem', color: 'var(--slate-600)', display: 'flex', gap: '1.25rem', borderTop: '1px solid var(--slate-100)', borderBottom: '1px solid var(--slate-100)', padding: '0.5rem 0' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={14} /> {record.record_date}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Building size={14} /> {record.hospital_name || 'Clinic N/A'}
                  </span>
                </div>

                {/* AI Summary Box */}
                <div style={{
                  backgroundColor: 'var(--sky-100)',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #BAE6FD'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: '700', color: 'var(--sky-500)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    <Sparkles size={14} /> AI Report Summary
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--navy-900)' }}>
                    {record.ai_summary || 'Document uploaded. Ready for RAG embedding indexing.'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Document Preview Modal */}
      {previewRecord && (
        <div className="modal-overlay" onClick={() => setPreviewRecord(null)}>
          <div className="modal-container" style={{ maxWidth: '650px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={20} color="var(--teal-600)" />
                <h3 style={{ fontSize: '1.15rem' }}>{previewRecord.title}</h3>
              </div>
              <button onClick={() => setPreviewRecord(null)} className="btn btn-outline btn-sm">Close</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span className="badge badge-teal">{previewRecord.category}</span>
                <span className="badge badge-blue">{previewRecord.record_date}</span>
                {previewRecord.file_url && (
                  <a 
                    href={previewRecord.file_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-outline btn-sm"
                    style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <span>Open File in Supabase Storage</span>
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>

              <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>AI Summary:</h4>
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--sky-100)', borderRadius: '8px', marginBottom: '1.25rem' }}>
                {previewRecord.ai_summary}
              </div>

              <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>Extracted Report Text (Prepared for RAG Indexing):</h4>
              <pre style={{
                backgroundColor: 'var(--navy-900)',
                color: '#38BDF8',
                padding: '1rem',
                borderRadius: '8px',
                fontSize: '0.825rem',
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
                maxHeight: '260px',
                overflowY: 'auto'
              }}>
                {previewRecord.extracted_text || 'No extracted text available.'}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
