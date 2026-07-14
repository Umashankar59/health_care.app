import React from 'react';
import { ShieldAlert, LogOut, User, Activity, Calendar } from 'lucide-react';

export default function Navbar({ user, onAuthClick, onLogout, currentView, setView }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <div 
          className="flex cursor-pointer items-center space-x-2 transition-transform active:scale-95"
          onClick={() => setView('home')}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white shadow-md shadow-brand-500/20">
            <Activity className="h-6 w-6 animate-pulse" />
          </div>
          <span className="font-sans text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Med<span className="text-brand-500">Link</span>
          </span>
        </div>

        {/* Navigation Tabs based on Role */}
        {user && (
          <nav className="hidden md:flex items-center space-x-1">
            {user.role === 'patient' ? (
              <>
                <button
                  onClick={() => setView('patient-dashboard')}
                  className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentView === 'patient-dashboard'
                      ? 'bg-brand-50 text-brand-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Calendar className="h-4 w-4" />
                  <span>Dashboard & Search</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setView('doctor-dashboard')}
                  className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentView === 'doctor-dashboard'
                      ? 'bg-brand-50 text-brand-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Calendar className="h-4 w-4" />
                  <span>Doctor Dashboard</span>
                </button>
              </>
            )}
          </nav>
        )}

        {/* User Controls */}
        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-3">
              {/* Profile details */}
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-sm font-semibold text-slate-800">{user.name}</span>
                <span className="text-xs text-slate-500 capitalize px-2 py-0.5 bg-slate-100 rounded-full w-fit self-end font-medium">
                  {user.role}
                </span>
              </div>
              
              {/* Profile Avatar / Logo */}
              <div 
                onClick={() => setView(user.role === 'patient' ? 'patient-dashboard' : 'doctor-dashboard')}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-slate-100 text-slate-600 ring-2 ring-slate-200/50 hover:bg-brand-50 hover:text-brand-600 hover:ring-brand-200 transition-all"
              >
                <User className="h-5 w-5" />
              </div>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                title="Log Out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onAuthClick('patient')}
                className="text-sm font-semibold text-slate-700 hover:text-brand-600 px-3 py-2 rounded-lg transition-colors"
              >
                Patient Portal
              </button>
              <button
                onClick={() => onAuthClick('doctor')}
                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Doctor Portal
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
