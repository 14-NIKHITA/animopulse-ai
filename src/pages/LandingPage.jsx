import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  Shield, 
  Heart, 
  Bot, 
  AlertTriangle, 
  FileText, 
  Syringe, 
  MapPin, 
  ArrowRight,
  Sparkles,
  Activity
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { loginDemoUser } = useApp();

  const handleGetStarted = () => {
    loginDemoUser();
    navigate('/dashboard');
  };

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <header style={{
        height: '75px',
        borderBottom: '1px solid var(--slate-200)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        backgroundColor: '#ffffff'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: 'var(--teal-600)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Shield size={24} color="#ffffff" />
          </div>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: '800', color: 'var(--navy-900)' }}>
            AnimoPulse
          </span>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={() => navigate('/emergency')}
            className="btn btn-danger btn-sm"
          >
            <AlertTriangle size={16} />
            <span>Emergency Help</span>
          </button>

          <button 
            onClick={() => navigate('/login')}
            className="btn btn-outline btn-sm"
          >
            Sign In
          </button>

          <button 
            onClick={handleGetStarted}
            className="btn btn-primary btn-sm"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        padding: '4.5rem 2rem',
        background: 'linear-gradient(180deg, #F0FDF4 0%, #FFFFFF 100%)',
        textAlign: 'center',
        borderBottom: '1px solid var(--slate-200)'
      }}>
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          <div className="badge badge-teal" style={{ marginBottom: '1.25rem', padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
            <Sparkles size={14} /> AI-Powered Pet Healthcare & Animal Rescue Platform
          </div>

          <h1 style={{
            fontSize: '3.2rem',
            lineHeight: 1.15,
            color: 'var(--navy-900)',
            marginBottom: '1.25rem',
            letterSpacing: '-0.02em'
          }}>
            Complete Pet Health Intelligence & <span style={{ color: 'var(--teal-600)' }}>Emergency First Aid</span>
          </h1>

          <p style={{
            fontSize: '1.2rem',
            color: 'var(--slate-600)',
            marginBottom: '2.5rem',
            lineHeight: 1.6
          }}>
            Manage medical records, track vaccination due dates with smart reminders, consult our RAG-grounded AI assistant on pet health, and access instant step-by-step first-aid guidance for injured pets or stray animals.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <button 
              onClick={handleGetStarted}
              className="btn btn-primary"
              style={{ padding: '0.85rem 2rem', fontSize: '1.1rem' }}
            >
              <span>Get Started Free</span>
              <ArrowRight size={20} />
            </button>

            <button 
              onClick={() => navigate('/emergency')}
              className="btn btn-danger"
              style={{ padding: '0.85rem 2rem', fontSize: '1.1rem' }}
            >
              <AlertTriangle size={20} />
              <span>Emergency First Aid</span>
            </button>
          </div>
        </div>
      </section>

      {/* Core Benefit Features */}
      <section style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Everything Your Pet Needs in One Secure Vault</h2>
          <p style={{ color: 'var(--slate-600)' }}>Designed for pet owners, animal caretakers, and emergency rescuers.</p>
        </div>

        <div className="grid-3">
          <div className="card" style={{ padding: '1.75rem' }}>
            <div className="stat-icon-wrapper stat-icon-blue" style={{ marginBottom: '1rem' }}>
              <Heart size={26} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Pet Health Profiles</h3>
            <p style={{ color: 'var(--slate-600)', fontSize: '0.95rem' }}>
              Store complete medical details including breed, age, weight, allergies, active medications, and microchip IDs in one accessible location.
            </p>
          </div>

          <div className="card" style={{ padding: '1.75rem' }}>
            <div className="stat-icon-wrapper stat-icon-amber" style={{ marginBottom: '1rem' }}>
              <Syringe size={26} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Vaccination Reminders</h3>
            <p style={{ color: 'var(--slate-600)', fontSize: '0.95rem' }}>
              Automatic due date calculations (Overdue, Due Soon, Upcoming) to ensure your pet never misses a critical Rabies or DHPP booster.
            </p>
          </div>

          <div className="card" style={{ padding: '1.75rem' }}>
            <div className="stat-icon-wrapper stat-icon-teal" style={{ marginBottom: '1rem' }}>
              <FileText size={26} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Medical Record Vault</h3>
            <p style={{ color: 'var(--slate-600)', fontSize: '0.95rem' }}>
              Upload lab bloodwork, prescriptions, and X-rays. Automated text extraction indexes every report for intelligent AI retrieval.
            </p>
          </div>

          <div className="card" style={{ padding: '1.75rem' }}>
            <div className="stat-icon-wrapper stat-icon-blue" style={{ marginBottom: '1rem' }}>
              <Bot size={26} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>RAG AI Health Assistant</h3>
            <p style={{ color: 'var(--slate-600)', fontSize: '0.95rem' }}>
              Ask questions directly grounded in your pet's uploaded medical records and profile. Powered by Google Gemini API & Vector Search.
            </p>
          </div>

          <div className="card" style={{ padding: '1.75rem' }}>
            <div className="stat-icon-wrapper stat-icon-red" style={{ marginBottom: '1rem' }}>
              <AlertTriangle size={26} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Emergency Triage</h3>
            <p style={{ color: 'var(--slate-600)', fontSize: '0.95rem' }}>
              Instant triage classification (Low, Moderate, High, Critical) with safe step-by-step first aid guides for injured pets or strays.
            </p>
          </div>

          <div className="card" style={{ padding: '1.75rem' }}>
            <div className="stat-icon-wrapper stat-icon-teal" style={{ marginBottom: '1rem' }}>
              <MapPin size={26} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Nearby Rescue Finder</h3>
            <p style={{ color: 'var(--slate-600)', fontSize: '0.95rem' }}>
              Locate 24/7 veterinary emergency hospitals, animal shelters, and wildlife rescue services with direct call and directions links.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        backgroundColor: 'var(--navy-900)',
        color: '#94A3B8',
        padding: '2rem',
        textAlign: 'center',
        fontSize: '0.875rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p>© 2026 AnimoPulse AI Platform. Built for GenAI Workshop Presentation & Demonstration.</p>
          <p style={{ marginTop: '0.35rem', fontSize: '0.8rem', color: '#64748B' }}>
            Medical Disclaimer: AnimoPulse provides informational and first-aid guidance only. Consult a licensed veterinarian for diagnosis.
          </p>
        </div>
      </footer>
    </div>
  );
}
