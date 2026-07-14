import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import PatientDashboard from './components/PatientDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import AuthModal from './components/AuthModal';
import axios from 'axios';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authRole, setAuthRole] = useState('patient'); // 'patient' or 'doctor'
  const [currentView, setView] = useState('home'); // 'home', 'patient-dashboard', 'doctor-dashboard'
  
  // Toast notifications state
  const [toast, setToast] = useState(null);

  useEffect(() => {
    // Load authenticated user and apply token on start
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      
      // Redirect to correct dashboard automatically
      if (parsedUser.role === 'patient') {
        setView('patient-dashboard');
      } else if (parsedUser.role === 'doctor') {
        setView('doctor-dashboard');
      }
    }
  }, []);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    // Dismiss toast after 4 seconds
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    showToast(`Signed in successfully as Dr. ${userData.name || userData.email}`, 'success');
    if (userData.role === 'patient') {
      setView('patient-dashboard');
    } else if (userData.role === 'doctor') {
      setView('doctor-dashboard');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    
    setUser(null);
    setView('home');
    showToast('Logged out successfully', 'info');
  };

  const openAuth = (role) => {
    setAuthRole(role);
    setIsAuthOpen(true);
  };

  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans">
      
      {/* Global Navbar */}
      <Navbar 
        user={user} 
        onAuthClick={openAuth} 
        onLogout={handleLogout} 
        currentView={currentView}
        setView={setView}
      />

      {/* Main View Router */}
      {currentView === 'home' && (
        <Hero onAuthClick={openAuth} user={user} setView={setView} />
      )}

      {currentView === 'patient-dashboard' && user?.role === 'patient' && (
        <PatientDashboard user={user} showToast={showToast} />
      )}

      {currentView === 'doctor-dashboard' && user?.role === 'doctor' && (
        <DoctorDashboard 
          user={user} 
          showToast={showToast} 
          onUpdateUser={handleUpdateUser} 
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 flex-shrink-0">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs text-slate-400 sm:px-6 lg:px-8">
          &copy; {new Date().getFullYear()} MedLink Inc. Localized Healthcare directory and appointment manager. All rights reserved.
        </div>
      </footer>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialRole={authRole}
        onSuccess={handleAuthSuccess}
      />

      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-fade-in flex items-center space-x-3 rounded-2xl bg-white p-4 shadow-xl border border-slate-100 max-w-md">
          {toast.type === 'success' && (
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle className="h-5 w-5" />
            </div>
          )}
          {toast.type === 'error' && (
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <AlertCircle className="h-5 w-5" />
            </div>
          )}
          {toast.type === 'info' && (
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Info className="h-5 w-5" />
            </div>
          )}
          <span className="text-xs font-semibold text-slate-700">{toast.message}</span>
        </div>
      )}

    </div>
  );
}
