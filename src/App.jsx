import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { Loader2 } from 'lucide-react';

// Components
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import AddPetModal from './components/AddPetModal';
import AddVaccineModal from './components/AddVaccineModal';
import AddRecordModal from './components/AddRecordModal';

// Pages
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import MyPets from './pages/MyPets';
import PetDetails from './pages/PetDetails';
import MedicalRecords from './pages/MedicalRecords';
import VaccinationTracker from './pages/VaccinationTracker';
import AiHealthAssistant from './pages/AiHealthAssistant';
import EmergencyFirstAid from './pages/EmergencyFirstAid';
import NearbyRescueServices from './pages/NearbyRescueServices';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';

/**
 * Route guard component protecting private application views
 */
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--slate-50)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', color: 'var(--teal-600)' }}>
          <Loader2 size={36} className="animate-spin" />
          <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Authenticating AnimoPulse Session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppLayout() {
  const { user, loading } = useAuth();
  const location = useLocation();

  const [isAddPetOpen, setIsAddPetOpen] = useState(false);
  const [isAddVaccineOpen, setIsAddVaccineOpen] = useState(false);
  const [isAddRecordOpen, setIsAddRecordOpen] = useState(false);

  // Public unauthenticated standalone pages
  const isPublicPage = location.pathname === '/' || location.pathname === '/login';

  if (isPublicPage) {
    return (
      <>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthPage />} />
        </Routes>
        <Toast />
      </>
    );
  }

  return (
    <ProtectedRoute>
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <Navbar 
            onOpenAddPet={() => setIsAddPetOpen(true)}
            onOpenAddRecord={() => setIsAddRecordOpen(true)}
            onOpenLogVaccine={() => setIsAddVaccineOpen(true)}
          />

          <main className="page-body">
            <Routes>
              <Route 
                path="/dashboard" 
                element={
                  <Dashboard 
                    onOpenAddPet={() => setIsAddPetOpen(true)}
                    onOpenAddRecord={() => setIsAddRecordOpen(true)}
                    onOpenLogVaccine={() => setIsAddVaccineOpen(true)}
                  />
                } 
              />
              <Route path="/pets" element={<MyPets onOpenAddPet={() => setIsAddPetOpen(true)} />} />
              <Route 
                path="/pets/:id" 
                element={
                  <PetDetails 
                    onOpenAddRecord={() => setIsAddRecordOpen(true)}
                    onOpenLogVaccine={() => setIsAddVaccineOpen(true)}
                  />
                } 
              />
              <Route path="/medical-records" element={<MedicalRecords onOpenAddRecord={() => setIsAddRecordOpen(true)} />} />
              <Route path="/vaccinations" element={<VaccinationTracker onOpenLogVaccine={() => setIsAddVaccineOpen(true)} />} />
              <Route path="/ai-assistant" element={<AiHealthAssistant />} />
              <Route path="/emergency" element={<EmergencyFirstAid />} />
              <Route path="/nearby-rescues" element={<NearbyRescueServices />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>

        {/* Global Modals */}
        <AddPetModal isOpen={isAddPetOpen} onClose={() => setIsAddPetOpen(false)} />
        <AddVaccineModal isOpen={isAddVaccineOpen} onClose={() => setIsAddVaccineOpen(false)} />
        <AddRecordModal isOpen={isAddRecordOpen} onClose={() => setIsAddRecordOpen(false)} />
        
        <Toast />
      </div>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <AppLayout />
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}
