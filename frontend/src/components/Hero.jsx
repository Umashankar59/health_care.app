import React from 'react';
import { Search, BrainCircuit, CalendarCheck, ShieldAlert, ArrowRight, UserCheck } from 'lucide-react';

export default function Hero({ onAuthClick, user, setView }) {
  const getStarted = (role) => {
    if (user) {
      if (user.role === 'patient') setView('patient-dashboard');
      if (user.role === 'doctor') setView('doctor-dashboard');
    } else {
      onAuthClick(role);
    }
  };

  return (
    <div className="relative isolate overflow-hidden bg-slate-50 flex-grow">
      {/* Decorative Background Shapes */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-brand-400 to-indigo-500 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72rem]"></div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28 flex flex-col items-center text-center">
        
        {/* Banner Pill */}
        <div className="mb-6 inline-flex items-center space-x-2 rounded-full bg-brand-50 px-3.5 py-1.5 text-sm font-semibold leading-6 text-brand-600 ring-1 ring-inset ring-brand-500/10 animate-fade-in">
          <BrainCircuit className="h-4 w-4" />
          <span>AI-Powered Medical Specialty Router</span>
        </div>

        {/* Hero Title */}
        <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl leading-tight font-sans">
          Find the Right Medical Specialist <br/>
          <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-500 bg-clip-text text-transparent">
            Based on Your Symptoms
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          Describe what you are feeling in plain English, and our AI symptom checker will instantly direct you to the correct specialist. Search, view availability, and book appointments in seconds.
        </p>

        {/* Call to Actions */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
          <button
            onClick={() => getStarted('patient')}
            className="group inline-flex items-center justify-center rounded-2xl bg-brand-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-500 hover:shadow-brand-500/35 transition-all hover:scale-[1.03] active:scale-[0.97]"
          >
            <span>Book an Appointment</span>
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
          <button
            onClick={() => getStarted('doctor')}
            className="inline-flex items-center justify-center rounded-2xl bg-white border border-slate-200 px-6 py-3.5 text-base font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-all hover:scale-[1.03] active:scale-[0.97] shadow-sm"
          >
            <UserCheck className="mr-2 h-5 w-5 text-slate-500" />
            <span>Join as a Specialist Doctor</span>
          </button>
        </div>

        {/* Feature Steps */}
        <div className="mx-auto mt-20 max-w-5xl sm:mt-24 lg:mt-32">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            
            {/* Step 1 */}
            <div className="glass-card flex flex-col items-center rounded-2xl p-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <BrainCircuit className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">1. Explain Symptoms</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Input your symptoms in natural language (e.g. "my knee hurts when bending").
              </p>
            </div>

            {/* Step 2 */}
            <div className="glass-card flex flex-col items-center rounded-2xl p-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">2. Match Specialist</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Our AI maps your symptoms directly to the correct field, like an Orthopedist.
              </p>
            </div>

            {/* Step 3 */}
            <div className="glass-card flex flex-col items-center rounded-2xl p-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CalendarCheck className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">3. Book instantly</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Compare local ratings, read profiles, choose from free slots, and secure your time.
              </p>
            </div>

          </div>
        </div>

      </div>

      <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]" aria-hidden="true">
        <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36rem] -translate-x-1/2 bg-gradient-to-tr from-indigo-300 to-brand-400 opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72rem]"></div>
      </div>
    </div>
  );
}
