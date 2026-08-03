import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { classifyAndGuideEmergency } from '../lib/gemini';
import { 
  AlertTriangle, 
  PhoneCall, 
  MapPin, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Activity,
  Heart,
  Volume2,
  Clock,
  History,
  Loader2
} from 'lucide-react';

const EMERGENCY_CATEGORIES = [
  'Bleeding',
  'Choking',
  'Poisoning',
  'Hit by vehicle',
  'Heatstroke',
  'Burns',
  'Seizures',
  'Breathing difficulty',
  'Fracture',
  'Wound',
  'Unconscious animal',
  'Unknown emergency'
];

export default function EmergencyFirstAid() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { pets, emergencySessions, emergencyLoading, addEmergencySession } = useApp();

  // Independent Emergency Triage State (Does NOT default to active dashboard pet)
  const [selectedPetId, setSelectedPetId] = useState(''); // Empty string = Not Specified / Stray
  const [animalType, setAnimalType] = useState('Dog');
  const [isStray, setIsStray] = useState(false);
  const [emergencyType, setEmergencyType] = useState('Bleeding');
  const [userDescription, setUserDescription] = useState('');
  
  // Structured Emergency Triage Questions
  const [triageAnswers, setTriageAnswers] = useState({
    is_conscious: 'Yes',
    is_breathing: 'Yes, normal',
    severe_bleeding: false,
    hit_by_vehicle: false,
    poisoning_suspected: false,
    seizures: false,
    unable_to_stand: 'Yes, normal'
  });

  const [guidanceResult, setGuidanceResult] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [cprTimerActive, setCprTimerActive] = useState(false);
  const [cprCount, setCprCount] = useState(0);

  const handleEvaluateTriage = async (e) => {
    e.preventDefault();
    setIsEvaluating(true);

    try {
      // 1. Evaluate urgency & emergency guidance (independent workflow, no RAG or Health Assistant reuse)
      const result = await classifyAndGuideEmergency({
        animalType,
        isStray,
        emergencyType,
        userDescription,
        triageAnswers,
        userId: user?.id || 'anonymous',
        petId: selectedPetId || null
      });

      setGuidanceResult(result);

      // 2. Save emergency session into public.emergency_sessions table in Supabase
      await addEmergencySession({
        petId: selectedPetId || null,
        animalType,
        emergencyType,
        userDescription,
        triageAnswers,
        urgencyLevel: result.urgencyLevel,
        aiGuidance: result
      });
    } catch (err) {
      console.error('[Emergency Triage Evaluation Error]', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const toggleCprMetronome = () => {
    if (!cprTimerActive) {
      setCprTimerActive(true);
      const interval = setInterval(() => {
        setCprCount(prev => prev + 1);
      }, 600); // ~100 bpm CPR compressions
      window.cprInterval = interval;
    } else {
      setCprTimerActive(false);
      clearInterval(window.cprInterval);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* High Visibility Emergency Header */}
      <div style={{
        backgroundColor: 'var(--red-600)',
        color: '#ffffff',
        padding: '1.5rem',
        borderRadius: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#ffffff', color: 'var(--red-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={30} />
          </div>
          <div>
            <h2 style={{ color: '#ffffff', fontSize: '1.5rem' }}>Emergency Animal Triage & First Aid</h2>
            <p style={{ color: '#FEE2E2', fontSize: '0.9rem' }}>
              Independent first-aid triage guidance for injured pets or rescued stray animals.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <a href="tel:15559117387" className="btn" style={{ backgroundColor: '#ffffff', color: 'var(--red-600)', fontWeight: '800' }}>
            <PhoneCall size={18} />
            <span>Call ER Hospital (24/7)</span>
          </a>
          <button onClick={() => navigate('/nearby-rescues')} className="btn" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#ffffff' }}>
            <MapPin size={18} />
            <span>Nearby Rescues</span>
          </button>
        </div>
      </div>

      <div className="grid-2">
        {/* Left Column: Triage Intake Questionnaire */}
        <div className="card">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={20} color="var(--red-600)" />
            <span>Step-by-Step Triage Intake</span>
          </h3>

          <form onSubmit={handleEvaluateTriage}>
            {/* Optional Pet Link Dropdown */}
            <div className="form-group">
              <label className="form-label">Associate with Pet (Optional)</label>
              <select className="form-control" value={selectedPetId} onChange={e => setSelectedPetId(e.target.value)}>
                <option value="">None / Stray / Emergency Rescue</option>
                {pets.map(p => (
                  <option key={p.id} value={p.id}>🐾 {p.name} ({p.animal_type})</option>
                ))}
              </select>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Animal Type *</label>
                <select className="form-control" value={animalType} onChange={e => setAnimalType(e.target.value)}>
                  <option value="Dog">Dog</option>
                  <option value="Cat">Cat</option>
                  <option value="Bird">Bird</option>
                  <option value="Wildlife">Wildlife</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Pet or Stray? *</label>
                <select className="form-control" value={isStray ? 'stray' : 'pet'} onChange={e => setIsStray(e.target.value === 'stray')}>
                  <option value="pet">Owned Pet</option>
                  <option value="stray">Stray / Rescue Animal</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Primary Emergency Category *</label>
              <select className="form-control" value={emergencyType} onChange={e => setEmergencyType(e.target.value)}>
                {EMERGENCY_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Step-by-step Triage Questionnaire */}
            <div style={{ backgroundColor: 'var(--slate-50)', padding: '1rem', borderRadius: '10px', marginBottom: '1.25rem', border: '1px solid var(--slate-200)' }}>
              <label className="form-label" style={{ marginBottom: '0.75rem', fontWeight: '700', color: 'var(--navy-900)' }}>
                Vital Status Triage Checklist:
              </label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
                <div className="grid-2">
                  <div>
                    <label className="form-label">Is animal conscious?</label>
                    <select className="form-control" value={triageAnswers.is_conscious} onChange={e => setTriageAnswers({ ...triageAnswers, is_conscious: e.target.value })}>
                      <option value="Yes">Yes (Alert / Conscious)</option>
                      <option value="No">No (Unconscious)</option>
                      <option value="Unsure">Unsure / Lethargic</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Is animal breathing?</label>
                    <select className="form-control" value={triageAnswers.is_breathing} onChange={e => setTriageAnswers({ ...triageAnswers, is_breathing: e.target.value })}>
                      <option value="Yes, normal">Yes (Normal)</option>
                      <option value="Difficulty">Breathing with difficulty / Gasping</option>
                      <option value="Not breathing">Not breathing</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '0.5rem' }}>
                  <label className="form-label">Walking Ability</label>
                  <select className="form-control" value={triageAnswers.unable_to_stand} onChange={e => setTriageAnswers({ ...triageAnswers, unable_to_stand: e.target.value })}>
                    <option value="Yes, normal">Yes (Normal gait)</option>
                    <option value="Limping">Limping / Favoring leg</option>
                    <option value="Unable to stand">Unable to stand or walk</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem', paddingTop: '0.5rem', borderTop: '1px solid var(--slate-200)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="checkbox" checked={triageAnswers.severe_bleeding} onChange={e => setTriageAnswers({ ...triageAnswers, severe_bleeding: e.target.checked })} />
                    <span>Severe Bleeding</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="checkbox" checked={triageAnswers.hit_by_vehicle} onChange={e => setTriageAnswers({ ...triageAnswers, hit_by_vehicle: e.target.checked })} />
                    <span>Hit by Vehicle</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="checkbox" checked={triageAnswers.poisoning_suspected} onChange={e => setTriageAnswers({ ...triageAnswers, poisoning_suspected: e.target.checked })} />
                    <span>Poisoning Suspected</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="checkbox" checked={triageAnswers.seizures} onChange={e => setTriageAnswers({ ...triageAnswers, seizures: e.target.checked })} />
                    <span>Active Seizures</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Additional Emergency Notes</label>
              <textarea 
                className="form-control" 
                rows="2" 
                placeholder="Describe visible wounds, swelling, symptoms..."
                value={userDescription}
                onChange={e => setUserDescription(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-danger" style={{ width: '100%', padding: '0.75rem' }} disabled={isEvaluating}>
              {isEvaluating ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Evaluating Triage Urgency...</span>
                </>
              ) : (
                <>
                  <ShieldAlert size={20} />
                  <span>Evaluate Urgency & Get First Aid</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Emergency Output & CPR Metronome */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {guidanceResult ? (
            <div className="card" style={{ borderLeft: `6px solid ${
              guidanceResult.urgencyLevel === 'Critical' ? 'var(--red-600)' :
              guidanceResult.urgencyLevel === 'High' ? 'var(--amber-600)' : 'var(--teal-600)'
            }` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.25rem' }}>Independent Triage Guidance</h3>
                <span className={`badge ${
                  guidanceResult.urgencyLevel === 'Critical' ? 'badge-red' :
                  guidanceResult.urgencyLevel === 'High' ? 'badge-amber' :
                  guidanceResult.urgencyLevel === 'Moderate' ? 'badge-teal' : 'badge-green'
                }`} style={{ fontSize: '0.9rem' }}>
                  Urgency: {guidanceResult.urgencyLevel}
                </span>
              </div>

              {/* Immediate First-Aid Steps */}
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.95rem', color: 'var(--green-600)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={16} /> Immediate First-Aid Steps:
                </h4>
                <ol style={{ paddingLeft: '1.25rem', fontSize: '0.9rem', color: 'var(--navy-900)' }}>
                  {guidanceResult.immediateSteps.map((step, idx) => (
                    <li key={idx} style={{ marginBottom: '0.35rem' }}>{step}</li>
                  ))}
                </ol>
              </div>

              {/* Critical Things to Avoid */}
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.95rem', color: 'var(--red-600)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <XCircle size={16} /> Critical Things to Avoid:
                </h4>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.9rem', color: 'var(--slate-700)' }}>
                  {guidanceResult.actionsToAvoid.map((avoid, idx) => (
                    <li key={idx} style={{ marginBottom: '0.35rem' }}>{avoid}</li>
                  ))}
                </ul>
              </div>

              {/* Emergency ER Warning Signs */}
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.95rem', color: 'var(--amber-600)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={16} /> Signs Requiring Immediate ER Care:
                </h4>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.9rem', color: 'var(--slate-700)' }}>
                  {guidanceResult.warningSigns.map((sign, idx) => (
                    <li key={idx} style={{ marginBottom: '0.35rem' }}>{sign}</li>
                  ))}
                </ul>
              </div>

              {/* Safety Disclaimer */}
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--red-100)', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--red-600)' }}>
                🚨 {guidanceResult.medicalDisclaimer}
              </div>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
              <ShieldAlert size={48} color="var(--slate-400)" style={{ marginBottom: '0.75rem' }} />
              <h3>Fill Triage Questionnaire Above</h3>
              <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem' }}>
                Complete the emergency assessment form on the left to evaluate urgency and receive step-by-step first aid guidance.
              </p>
            </div>
          )}

          {/* CPR Compression Metronome */}
          <div className="card" style={{ backgroundColor: 'var(--navy-900)', color: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h4 style={{ color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Heart size={20} color="var(--red-500)" /> CPR Compression Metronome (100 BPM)
              </h4>
              <span className="badge badge-teal">{cprCount} Beats</span>
            </div>

            <p style={{ fontSize: '0.825rem', color: '#94A3B8', marginBottom: '1rem' }}>
              Target rhythm: 100-120 compressions per minute for cardiac resuscitation.
            </p>

            <button 
              onClick={toggleCprMetronome}
              className={`btn ${cprTimerActive ? 'btn-danger' : 'btn-primary'}`}
              style={{ width: '100%' }}
            >
              <Volume2 size={18} />
              <span>{cprTimerActive ? 'Stop Metronome' : 'Start CPR Rhythm Metronome'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Emergency Session History Table */}
      <div className="card">
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <History size={20} color="var(--teal-600)" />
          <span>Emergency Triage History Logs ({emergencySessions.length})</span>
        </h3>

        {emergencyLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <Loader2 size={24} className="animate-spin" color="var(--teal-600)" />
            <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginTop: '0.5rem' }}>Loading emergency logs from Supabase...</p>
          </div>
        ) : emergencySessions.length === 0 ? (
          <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem' }}>No emergency triage sessions logged yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {emergencySessions.map(session => (
              <div 
                key={session.id}
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid var(--slate-200)',
                  backgroundColor: 'var(--slate-50)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <strong style={{ fontSize: '0.95rem' }}>{session.emergency_type} ({session.animal_type})</strong>
                    <span className={`badge ${
                      session.urgency_level === 'Critical' ? 'badge-red' :
                      session.urgency_level === 'High' ? 'badge-amber' :
                      session.urgency_level === 'Moderate' ? 'badge-teal' : 'badge-green'
                    }`}>
                      {session.urgency_level}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--slate-600)', marginTop: '2px' }}>
                    Logged on {new Date(session.created_at).toLocaleString()} • {session.user_description || 'No notes'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
