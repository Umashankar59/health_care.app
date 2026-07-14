import React, { useState } from 'react';
import axios from 'axios';
import { X, Lock, Mail, Phone, MapPin, Award, User, Clock, HeartHandshake } from 'lucide-react';

const defaultAvailability = [
  { day: 'Monday', startTime: '09:00', endTime: '17:00', slotDuration: 30 },
  { day: 'Tuesday', startTime: '09:00', endTime: '17:00', slotDuration: 30 },
  { day: 'Wednesday', startTime: '09:00', endTime: '17:00', slotDuration: 30 },
  { day: 'Thursday', startTime: '09:00', endTime: '17:00', slotDuration: 30 },
  { day: 'Friday', startTime: '09:00', endTime: '17:00', slotDuration: 30 }
];

export default function AuthModal({ isOpen, onClose, initialRole = 'patient', onSuccess }) {
  const [role, setRole] = useState(initialRole); // 'patient' or 'doctor'
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');

  // Doctor-only fields
  const [specialty, setSpecialty] = useState('General Physician');
  const [clinicAddress, setClinicAddress] = useState('');
  const [experienceYears, setExperienceYears] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = `/api/auth/${isLogin ? 'login' : 'register'}/${role}`;
    
    // Construct payload
    let payload = { email, password };
    if (!isLogin) {
      payload = {
        ...payload,
        name,
        city,
        phone,
      };
      if (role === 'doctor') {
        payload.specialty = specialty;
        payload.clinicAddress = clinicAddress;
        payload.experienceYears = Number(experienceYears);
        payload.availability = defaultAvailability;
      }
    }

    try {
      const response = await axios.post(endpoint, payload);
      const data = response.data;
      
      // Store in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        city: data.city,
        specialty: data.specialty,
        experienceYears: data.experienceYears,
        availability: data.availability,
        phone: data.phone,
        clinicAddress: data.clinicAddress
      }));

      // Apply Axios authorization header globally
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      
      setLoading(false);
      onSuccess(data);
      onClose();
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    }
  };

  const handleRoleToggle = (selectedRole) => {
    setRole(selectedRole);
    setError('');
  };

  const handleModeToggle = () => {
    setIsLogin(!isLogin);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200 animate-fade-in max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-6 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <HeartHandshake className="h-6 w-6 text-brand-600" />
            <h2 className="text-xl font-bold text-slate-900">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Container (Scrollable if content overflows) */}
        <div className="overflow-y-auto p-6 flex-grow">
          
          {/* Role Tabs */}
          <div className="mb-6 flex rounded-2xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => handleRoleToggle('patient')}
              className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all ${
                role === 'patient'
                  ? 'bg-white text-brand-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              Patient
            </button>
            <button
              type="button"
              onClick={() => handleRoleToggle('doctor')}
              className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all ${
                role === 'doctor'
                  ? 'bg-white text-brand-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              Medical Doctor
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {error && (
              <div className="rounded-xl bg-red-50 p-4 text-xs font-semibold text-red-600 ring-1 ring-red-200">
                {error}
              </div>
            )}

            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-brand-500 focus:bg-white focus:ring-1 focus:ring-brand-500/20 transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-brand-500 focus:bg-white focus:ring-1 focus:ring-brand-500/20 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-brand-500 focus:bg-white focus:ring-1 focus:ring-brand-500/20 transition-all"
                />
              </div>
            </div>

            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">City</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="Mumbai"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-brand-500 focus:bg-white focus:ring-1 focus:ring-brand-500/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-brand-500 focus:bg-white focus:ring-1 focus:ring-brand-500/20 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {role === 'doctor' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Specialty</label>
                        <div className="relative">
                          <Award className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                          <select
                            value={specialty}
                            onChange={(e) => setSpecialty(e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-brand-500 focus:bg-white focus:ring-1 focus:ring-brand-500/20 transition-all appearance-none"
                          >
                            <option value="General Physician">General Physician</option>
                            <option value="Neurologist">Neurologist</option>
                            <option value="Cardiologist">Cardiologist</option>
                            <option value="Dermatologist">Dermatologist</option>
                            <option value="Orthopedist">Orthopedist</option>
                            <option value="Pediatrician">Pediatrician</option>
                            <option value="Gastroenterologist">Gastroenterologist</option>
                            <option value="Ophthalmologist">Ophthalmologist</option>
                            <option value="Psychiatrist">Psychiatrist</option>
                            <option value="Otolaryngologist">Otolaryngologist</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Experience (Years)</label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                          <input
                            type="number"
                            required
                            min="0"
                            placeholder="8"
                            value={experienceYears}
                            onChange={(e) => setExperienceYears(e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-brand-500 focus:bg-white focus:ring-1 focus:ring-brand-500/20 transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Clinic Address</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          required
                          placeholder="Apollo Clinic, Sector 15, Vashi"
                          value={clinicAddress}
                          onChange={(e) => setClinicAddress(e.target.value)}
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-brand-500 focus:bg-white focus:ring-1 focus:ring-brand-500/20 transition-all"
                        />
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-2">
                      * Registration applies a standard working schedule (Mon-Fri 09:00 - 17:00, 30 min slots) which you can customize anytime in settings.
                    </p>
                  </>
                )}
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-brand-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/10 hover:bg-brand-500 hover:shadow-brand-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none mt-6"
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          {/* Toggle login/signup mode */}
          <div className="mt-6 text-center text-sm text-slate-500 flex-shrink-0">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={handleModeToggle}
              className="font-bold text-brand-600 hover:text-brand-500 outline-none"
            >
              {isLogin ? 'Create one now' : 'Sign in here'}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
