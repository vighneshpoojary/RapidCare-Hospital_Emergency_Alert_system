import { useState } from 'react';
import LandingPage from './components/LandingPage';
import PatientAuth from './components/PatientAuth';
import HospitalAuth from './components/HospitalAuth';
import PatientDashboard from './components/PatientDashboard';
import HospitalDashboard from './components/HospitalDashboard';
import type { Patient, Hospital } from './types/database';

type View = 'landing' | 'patient-auth' | 'hospital-auth' | 'patient-dashboard' | 'hospital-dashboard';

function App() {
  const [currentView, setCurrentView] = useState<View>('landing');
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
  const [currentHospital, setCurrentHospital] = useState<Hospital | null>(null);

  const handlePatientLogin = (patient: Patient) => {
    setCurrentPatient(patient);
    setCurrentView('patient-dashboard');
  };

  const handleHospitalLogin = (hospital: Hospital) => {
    setCurrentHospital(hospital);
    setCurrentView('hospital-dashboard');
  };

  const handleLogout = () => {
    setCurrentPatient(null);
    setCurrentHospital(null);
    setCurrentView('landing');
  };

  return (
    <>
      {currentView === 'landing' && (
        <LandingPage
          onPatientClick={() => setCurrentView('patient-auth')}
          onHospitalClick={() => setCurrentView('hospital-auth')}
        />
      )}

      {currentView === 'patient-auth' && (
        <PatientAuth
          onBack={() => setCurrentView('landing')}
          onLogin={handlePatientLogin}
        />
      )}

      {currentView === 'hospital-auth' && (
        <HospitalAuth
          onBack={() => setCurrentView('landing')}
          onLogin={handleHospitalLogin}
        />
      )}

      {currentView === 'patient-dashboard' && currentPatient && (
        <PatientDashboard
          patient={currentPatient}
          onLogout={handleLogout}
        />
      )}

      {currentView === 'hospital-dashboard' && currentHospital && (
        <HospitalDashboard
          hospital={currentHospital}
          onLogout={handleLogout}
        />
      )}
    </>
  );
}

export default App;
