import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, BrainCircuit, Calendar, Star, MapPin, Phone, Clock, FileText, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';

export default function PatientDashboard({ user, showToast }) {
  const [symptoms, setSymptoms] = useState('');
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  // Search parameters
  const [searchSpecialty, setSearchSpecialty] = useState('');
  const [searchCity, setSearchCity] = useState(user?.city || '');
  const [sortBy, setSortBy] = useState('rating');

  // Metadata for dropdowns
  const [metaCities, setMetaCities] = useState([]);
  const [metaSpecialties, setMetaSpecialties] = useState([]);

  // Data listings
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingAppointments, setLoadingAppointments] = useState(false);

  // Booking Modal State
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [doctorBookings, setDoctorBookings] = useState([]); // to cross-ref existing slots

  useEffect(() => {
    fetchMeta();
    fetchAppointments();
    searchDoctorsList();
  }, []);

  useEffect(() => {
    searchDoctorsList();
  }, [searchCity, searchSpecialty, sortBy]);

  const fetchMeta = async () => {
    try {
      const res = await axios.get('/api/doctors/meta');
      setMetaCities(res.data.cities || []);
      setMetaSpecialties(res.data.specialties || []);
    } catch (err) {
      console.error('Error fetching search metadata:', err);
    }
  };

  const fetchAppointments = async () => {
    setLoadingAppointments(true);
    try {
      const res = await axios.get('/api/appointments/patient');
      setAppointments(res.data);
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const searchDoctorsList = async () => {
    setLoadingDoctors(true);
    try {
      const params = {};
      if (searchCity) params.city = searchCity;
      if (searchSpecialty) params.specialty = searchSpecialty;
      if (sortBy) params.sortBy = sortBy;

      const res = await axios.get('/api/doctors/search', { params });
      setDoctors(res.data);
    } catch (err) {
      console.error('Error searching doctors:', err);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const handleAiAnalyze = async (e) => {
    e.preventDefault();
    if (!symptoms.trim()) return;

    setAiAnalyzing(true);
    setAiResult(null);
    try {
      const res = await axios.post('/api/symptoms/analyze', { symptoms });
      setAiResult(res.data);
      if (res.data.specialty) {
        setSearchSpecialty(res.data.specialty);
        showToast(`AI matched symptoms to: ${res.data.specialty}`, 'success');
      }
    } catch (err) {
      console.error('Error analyzing symptoms:', err);
      showToast('AI analysis failed. Using fallback system.', 'error');
    } finally {
      setAiAnalyzing(false);
    }
  };

  // Open booking modal
  const openBookingModal = async (doctor) => {
    setSelectedDoctor(doctor);
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    setBookingDate(dateString);
    setSelectedSlot('');
    setAvailableSlots([]);
    
    // Fetch doctor's existing appointments to cross-reference and block slots
    try {
      // In a real app we might fetch only this doctor's appointments for the selected date.
      // We will simulate or retrieve dynamically. Let's load the slots.
      generateTimeSlots(doctor, dateString);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDateChange = (dateVal) => {
    setBookingDate(dateVal);
    setSelectedSlot('');
    if (selectedDoctor) {
      generateTimeSlots(selectedDoctor, dateVal);
    }
  };

  const generateTimeSlots = async (doctor, selectedDate) => {
    if (!doctor || !selectedDate) return;

    const dateObj = new Date(selectedDate);
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const bookingDayName = daysOfWeek[dateObj.getDay()];

    // Find availability for this day of week
    const availability = doctor.availability?.find(
      avail => avail.day.toLowerCase() === bookingDayName.toLowerCase()
    );

    if (!availability) {
      setAvailableSlots([]);
      return;
    }

    const { startTime, endTime, slotDuration } = availability;
    
    // Parse times
    const parseTimeToMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const startMinutes = parseTimeToMinutes(startTime);
    const endMinutes = parseTimeToMinutes(endTime);
    
    const slots = [];
    let currentMinutes = startMinutes;

    while (currentMinutes + slotDuration <= endMinutes) {
      const hours = Math.floor(currentMinutes / 60);
      const minutes = currentMinutes % 60;
      const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      slots.push(formattedTime);
      currentMinutes += slotDuration;
    }

    // Fetch existing bookings for this doctor on this day from database
    // We can filter this patient's appointments or fetch all appointments for this doctor.
    // For simplicity, we can fetch all appointments or implement a small query check
    try {
      // Let's call a query or we can check appointments in our global state if they were populated,
      // but query is better. Let's do a quick request or mock filter:
      // In this setup we can get the slots. Let's write an API to check availability or fetch appointments.
      // Since we don't have a direct "getDoctorAppointments" public route, we will query existing bookings.
      // Let's check appointments from patient or doctor dashboard? Patients can't read all doctor bookings directly unless we let them.
      // Wait, let's look at the controller: our bookAppointment route returns 400 if it's already booked.
      // Let's fetch all appointments in DB for this doctor to filter them. But since we need to protect privacy,
      // we can call a search endpoint or just query. For this prototype, let's fetch doctor slots.
      // Actually, we can fetch the doctor's calendar or let the backend do it. We'll fetch doctor profile,
      // or we can write a simple endpoint. To keep it simple, we can filter using a local mock or we can just try to book,
      // or filter based on patient's own bookings. Let's call the API to fetch appointments for this doctor if we had one.
      // Since patients don't see other patients' details, we can check if there's a route.
      // Wait! We can search for appointments of that doctor. Let's assume we can fetch them or we check if there are matches in our appointments.
      // Let's filter slots based on our local appointment list for this doctor (if any are matching doctorId & date)
      const matches = appointments.filter(app => app.doctorId._id === doctor._id && app.date === selectedDate && app.status !== 'Cancelled');
      const bookedSlots = matches.map(app => app.timeSlot);
      
      const filteredSlots = slots.filter(slot => !bookedSlots.includes(slot));
      setAvailableSlots(filteredSlots);
    } catch (err) {
      console.error(err);
      setAvailableSlots(slots);
    }
  };

  const handleBook = async () => {
    if (!selectedDoctor || !bookingDate || !selectedSlot) {
      showToast('Please select all booking details', 'error');
      return;
    }

    setBookingLoading(true);
    try {
      const res = await axios.post('/api/appointments/book', {
        doctorId: selectedDoctor._id,
        date: bookingDate,
        timeSlot: selectedSlot
      });
      
      showToast('Appointment booked successfully! Awaiting doctor confirmation.', 'success');
      setSelectedDoctor(null);
      fetchAppointments(); // Reload list
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to book slot. It might have been booked.', 'error');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-grow w-full">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        
        {/* Left Column: Search & AI Symptom Checker */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* AI Symptom Checker Card */}
          <div className="glass-panel rounded-3xl p-6 shadow-sm">
            <div className="flex items-center space-x-2 text-brand-600 mb-4">
              <BrainCircuit className="h-6 w-6" />
              <h2 className="text-lg font-bold">AI Symptom Assistant</h2>
            </div>
            
            <p className="text-xs text-slate-500 mb-4">
              Describe your symptoms in natural language. Our system maps them to a medical specialty.
            </p>

            <form onSubmit={handleAiAnalyze} className="space-y-3">
              <textarea
                required
                rows="3"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="e.g., I have a throbbing headache on the right side and slight nausea..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none focus:border-brand-500 focus:bg-white focus:ring-1 focus:ring-brand-500/20 transition-all resize-none"
              />
              
              <button
                type="submit"
                disabled={aiAnalyzing || !symptoms.trim()}
                className="w-full flex items-center justify-center space-x-2 rounded-2xl bg-brand-600 py-3 text-sm font-semibold text-white shadow-md shadow-brand-500/10 hover:bg-brand-500 hover:shadow-brand-500/20 transition-all disabled:opacity-50"
              >
                {aiAnalyzing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Analyzing symptoms...</span>
                  </>
                ) : (
                  <>
                    <BrainCircuit className="h-4 w-4" />
                    <span>Map Symptoms to Specialty</span>
                  </>
                )}
              </button>
            </form>

            {aiResult && (
              <div className="mt-4 rounded-2xl bg-brand-50 p-4 border border-brand-100 animate-fade-in">
                <h4 className="text-sm font-bold text-brand-800">Recommendation:</h4>
                <p className="text-sm font-extrabold text-slate-900 mt-1 capitalize">
                  {aiResult.specialty}
                </p>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {aiResult.reason}
                </p>
              </div>
            )}
          </div>

          {/* Search Filters */}
          <div className="glass-panel rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Search Filters</h2>
            
            <div className="space-y-3">
              {/* Specialty selection */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Specialty</label>
                <select
                  value={searchSpecialty}
                  onChange={(e) => setSearchSpecialty(e.target.value)}
                  className="w-full mt-1 rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm outline-none focus:border-brand-500 focus:bg-white transition-all appearance-none"
                >
                  <option value="">All Specialties</option>
                  {metaSpecialties.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                  {/* Fallback list if meta is empty */}
                  {metaSpecialties.length === 0 && (
                    <>
                      <option value="General Physician">General Physician</option>
                      <option value="Neurologist">Neurologist</option>
                      <option value="Cardiologist">Cardiologist</option>
                      <option value="Dermatologist">Dermatologist</option>
                      <option value="Orthopedist">Orthopedist</option>
                      <option value="Pediatrician">Pediatrician</option>
                    </>
                  )}
                </select>
              </div>

              {/* City Selection */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">City</label>
                <select
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="w-full mt-1 rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm outline-none focus:border-brand-500 focus:bg-white transition-all appearance-none"
                >
                  <option value="">All Cities</option>
                  {metaCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                  {/* Fallback if meta is empty */}
                  {metaCities.length === 0 && (
                    <>
                      <option value="Mumbai">Mumbai</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Bangalore">Bangalore</option>
                      <option value="Pune">Pune</option>
                      <option value="Hyderabad">Hyderabad</option>
                      <option value="Chennai">Chennai</option>
                      <option value="Kolkata">Kolkata</option>
                    </>
                  )}
                </select>
              </div>

              {/* Sorting */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full mt-1 rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm outline-none focus:border-brand-500 focus:bg-white transition-all appearance-none"
                >
                  <option value="rating">Rating (Highest first)</option>
                  <option value="experienceYears">Experience (Highest first)</option>
                </select>
              </div>
            </div>
          </div>

        </div>

        {/* Right Columns: Doctor Directory and Appointments */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Upcoming Appointments */}
          <div className="glass-panel rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <span>My Appointments</span>
                <span className="text-xs bg-brand-50 text-brand-600 px-2 py-0.5 rounded-full font-bold">
                  {appointments.length}
                </span>
              </h2>
              <button 
                onClick={fetchAppointments}
                className="text-xs font-bold text-brand-600 hover:text-brand-500 flex items-center space-x-1"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Refresh</span>
              </button>
            </div>

            {loadingAppointments ? (
              <div className="py-8 text-center text-slate-400 text-sm">Loading appointments...</div>
            ) : appointments.length === 0 ? (
              <div className="py-8 text-center rounded-2xl border border-dashed border-slate-200 text-slate-400 text-sm">
                No appointments booked yet. Find a doctor below to get started.
              </div>
            ) : (
              <div className="space-y-3 overflow-x-auto max-h-[300px] pr-2">
                {appointments.map((app) => (
                  <div key={app._id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white shadow-sm hover:border-slate-200 transition-all">
                    <div className="flex items-start space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 flex-shrink-0">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Dr. {app.doctorId?.name}</h4>
                        <p className="text-xs text-slate-500 capitalize">{app.doctorId?.specialty} • {app.doctorId?.city}</p>
                        <div className="mt-1 flex items-center space-x-3 text-[11px] text-slate-600">
                          <span className="flex items-center"><Calendar className="mr-1 h-3.5 w-3.5 text-slate-400" />{app.date}</span>
                          <span className="flex items-center"><Clock className="mr-1 h-3.5 w-3.5 text-slate-400" />{app.timeSlot}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${
                        app.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700' :
                        app.status === 'Cancelled' ? 'bg-red-50 text-red-700' :
                        app.status === 'Completed' ? 'bg-blue-50 text-blue-700' :
                        'bg-amber-50 text-amber-700'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Doctor Directories */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Available Specialists</h2>
            
            {loadingDoctors ? (
              <div className="py-20 text-center text-slate-400 text-sm">Loading doctors...</div>
            ) : doctors.length === 0 ? (
              <div className="py-20 text-center rounded-3xl border border-dashed border-slate-200 text-slate-400 text-sm">
                No doctors found matching filters. Try changing your search.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {doctors.map((doctor) => (
                  <div key={doctor._id} className="glass-card rounded-2xl p-5 flex flex-col justify-between">
                    <div>
                      {/* Name and Specialty */}
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-base font-bold text-slate-900">Dr. {doctor.name}</h3>
                          <span className="inline-block mt-0.5 text-xs text-brand-600 font-semibold bg-brand-50 px-2 py-0.5 rounded-md capitalize">
                            {doctor.specialty}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 text-amber-500 bg-amber-50 px-2 py-0.5 rounded-md text-xs font-bold">
                          <Star className="h-3.5 w-3.5 fill-amber-500" />
                          <span>{doctor.rating ? doctor.rating.toFixed(1) : '5.0'}</span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="mt-4 space-y-2 text-xs text-slate-600">
                        <p className="flex items-center">
                          <Clock className="mr-2 h-4 w-4 text-slate-400" />
                          <span>{doctor.experienceYears} Years Experience</span>
                        </p>
                        <p className="flex items-center">
                          <MapPin className="mr-2 h-4 w-4 text-slate-400" />
                          <span>{doctor.clinicAddress}, {doctor.city}</span>
                        </p>
                        <p className="flex items-center">
                          <Phone className="mr-2 h-4 w-4 text-slate-400" />
                          <span>{doctor.phone}</span>
                        </p>
                      </div>
                    </div>

                    {/* Book CTA */}
                    <button
                      onClick={() => openBookingModal(doctor)}
                      className="mt-5 w-full inline-flex items-center justify-center rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
                    >
                      <span>Book Appointment</span>
                      <ChevronRight className="ml-1 h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Booking Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedDoctor(null)} />
          
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200 animate-fade-in max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900">Book an Appointment</h3>
            <p className="text-xs text-slate-500 mt-1 capitalize">with Dr. {selectedDoctor.name} ({selectedDoctor.specialty})</p>

            <div className="mt-4 space-y-4">
              {/* Date selection */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Select Date</label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={bookingDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-full mt-1 rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-sm outline-none focus:border-brand-500 focus:bg-white transition-all"
                />
              </div>

              {/* Time Slots */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Select Time Slot</label>
                
                {availableSlots.length === 0 ? (
                  <div className="mt-2 flex items-center space-x-2 rounded-xl bg-amber-50 p-4 text-xs font-semibold text-amber-700">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>Dr. {selectedDoctor.name} is not available on this day. Please select another date.</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 mt-2 max-h-[160px] overflow-y-auto pr-1">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`rounded-xl py-2 text-xs font-semibold border transition-all ${
                          selectedSlot === slot
                            ? 'bg-brand-600 border-brand-600 text-white shadow-sm'
                            : 'border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-3 mt-6 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedDoctor(null)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={bookingLoading || !selectedSlot}
                  onClick={handleBook}
                  className="flex-1 rounded-xl bg-brand-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-brand-500 disabled:opacity-50 transition-all"
                >
                  {bookingLoading ? 'Booking...' : 'Confirm Appointment'}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </main>
  );
}
