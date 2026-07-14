import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Clock, User, Phone, Check, X, Settings, ListPlus, Trash2, Save, RefreshCw } from 'lucide-react';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function DoctorDashboard({ user, showToast, onUpdateUser }) {
  const [activeTab, setActiveTab] = useState('schedule'); // 'schedule' or 'settings'
  const [appointments, setAppointments] = useState([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  // Settings State: List of availability rules
  const [availability, setAvailability] = useState(user?.availability || []);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    setLoadingSchedule(true);
    try {
      const res = await axios.get('/api/appointments/doctor');
      setAppointments(res.data);
    } catch (err) {
      console.error('Error fetching doctor schedule:', err);
      showToast('Failed to load schedule', 'error');
    } finally {
      setLoadingSchedule(false);
    }
  };

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      await axios.put(`/api/appointments/${appointmentId}/status`, { status: newStatus });
      showToast(`Appointment status updated to: ${newStatus}`, 'success');
      fetchSchedule(); // Refresh schedule
    } catch (err) {
      console.error(err);
      showToast('Failed to update status', 'error');
    }
  };

  // Add weekday slot availability in local state
  const handleAddDay = () => {
    // Find first day of week not already configured in settings
    const configuredDays = availability.map(a => a.day);
    const firstUnconfiguredDay = WEEKDAYS.find(day => !configuredDays.includes(day));
    
    if (!firstUnconfiguredDay) {
      showToast('All 7 days have already been configured.', 'error');
      return;
    }

    setAvailability([
      ...availability,
      { day: firstUnconfiguredDay, startTime: '09:00', endTime: '17:00', slotDuration: 30 }
    ]);
  };

  const handleRemoveDay = (index) => {
    setAvailability(availability.filter((_, i) => i !== index));
  };

  const handleFieldChange = (index, field, value) => {
    const updated = [...availability];
    updated[index][field] = field === 'slotDuration' ? Number(value) : value;
    setAvailability(updated);
  };

  const handleSaveSettings = async () => {
    // Basic validation
    for (let rule of availability) {
      if (!rule.startTime || !rule.endTime) {
        showToast('Please enter both Start Time and End Time for working days', 'error');
        return;
      }
      if (rule.startTime >= rule.endTime) {
        showToast(`Start time must be before end time on ${rule.day}`, 'error');
        return;
      }
    }

    try {
      const res = await axios.put('/api/doctors/availability', { availability });
      showToast('Working hours updated successfully', 'success');
      
      // Update local storage and app state
      const updatedUser = { ...user, availability: res.data.availability };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      onUpdateUser(updatedUser);
    } catch (err) {
      console.error(err);
      showToast('Failed to update working hours', 'error');
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-grow w-full">
      <div className="md:flex md:items-center md:justify-between mb-8 border-b border-slate-200 pb-5">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl leading-none">
            Welcome, Dr. {user?.name}
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 capitalize">
            {user?.specialty} Portal • {user?.city}
          </p>
        </div>

        {/* Dashboard Mode Tabs */}
        <div className="mt-4 flex md:ml-4 md:mt-0 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'schedule'
                ? 'bg-white text-brand-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>My Schedule</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'settings'
                ? 'bg-white text-brand-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>Availability Limits</span>
          </button>
        </div>
      </div>

      {/* Mode View */}
      {activeTab === 'schedule' ? (
        <div className="glass-panel rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900">Patient Appointment Schedule</h2>
            <button 
              onClick={fetchSchedule}
              className="text-xs font-bold text-brand-600 hover:text-brand-500 flex items-center space-x-1"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refresh Schedule</span>
            </button>
          </div>

          {loadingSchedule ? (
            <div className="py-20 text-center text-slate-400 text-sm">Loading appointments schedule...</div>
          ) : appointments.length === 0 ? (
            <div className="py-20 text-center rounded-3xl border border-dashed border-slate-200 text-slate-400 text-sm">
              No appointments booked yet on your calendar.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Patient</th>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {appointments.map((app) => (
                    <tr key={app._id} className="hover:bg-slate-50/55 transition-colors">
                      {/* Patient details */}
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 flex-shrink-0">
                            <User className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{app.patientId?.name}</div>
                            <div className="text-xs text-slate-400 font-medium">{app.patientId?.email}</div>
                            <div className="text-[11px] text-slate-500 flex items-center mt-0.5">
                              <Phone className="h-3 w-3 mr-1 text-slate-400" />
                              <span>{app.patientId?.phone}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Date details */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 flex items-center">
                            <Calendar className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                            {app.date}
                          </span>
                          <span className="text-xs text-slate-500 flex items-center mt-1">
                            <Clock className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                            {app.timeSlot}
                          </span>
                        </div>
                      </td>

                      {/* Badge status */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${
                          app.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700' :
                          app.status === 'Cancelled' ? 'bg-red-50 text-red-700' :
                          app.status === 'Completed' ? 'bg-blue-50 text-blue-700' :
                          'bg-amber-50 text-amber-700'
                        }`}>
                          {app.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {app.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(app._id, 'Confirmed')}
                                className="inline-flex h-8 items-center space-x-1 rounded-lg bg-emerald-600 px-3 text-xs font-bold text-white hover:bg-emerald-500 transition-colors shadow-sm"
                              >
                                <Check className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Confirm</span>
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(app._id, 'Cancelled')}
                                className="inline-flex h-8 items-center space-x-1 rounded-lg border border-red-200 bg-white px-3 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <X className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Cancel</span>
                              </button>
                            </>
                          )}
                          {app.status === 'Confirmed' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(app._id, 'Completed')}
                                className="inline-flex h-8 items-center space-x-1 rounded-lg bg-blue-600 px-3 text-xs font-bold text-white hover:bg-blue-500 transition-colors shadow-sm"
                              >
                                <Check className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Complete</span>
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(app._id, 'Cancelled')}
                                className="inline-flex h-8 items-center space-x-1 rounded-lg border border-red-200 bg-white px-3 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <X className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Cancel</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Settings panel availability limits */
        <div className="glass-panel rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Adjust Weekly Availability Limits</h2>
              <p className="text-xs text-slate-500">Configure your standard working hours. Patients can only book time slots within these boundaries.</p>
            </div>
            <button
              onClick={handleAddDay}
              className="inline-flex items-center space-x-1 text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 px-3.5 py-2 rounded-xl transition-colors"
            >
              <ListPlus className="h-4 w-4" />
              <span>Add Day Limit</span>
            </button>
          </div>

          {availability.length === 0 ? (
            <div className="py-12 text-center rounded-2xl border border-dashed border-slate-200 text-slate-400 text-sm">
              No availability limits configured. Click "Add Day Limit" to define your working schedule.
            </div>
          ) : (
            <div className="space-y-4">
              {availability.map((avail, index) => (
                <div key={index} className="flex flex-wrap items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-white/50 shadow-sm">
                  
                  {/* Day Picker */}
                  <div className="flex-1 min-w-[140px]">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Day of Week</label>
                    <select
                      value={avail.day}
                      onChange={(e) => handleFieldChange(index, 'day', e.target.value)}
                      className="w-full mt-1 rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs outline-none focus:border-brand-500 focus:bg-white transition-all appearance-none font-semibold"
                    >
                      {WEEKDAYS.map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>

                  {/* Start time */}
                  <div className="w-[110px]">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Start Time</label>
                    <input
                      type="time"
                      value={avail.startTime}
                      onChange={(e) => handleFieldChange(index, 'startTime', e.target.value)}
                      className="w-full mt-1 rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs outline-none focus:border-brand-500 focus:bg-white transition-all font-semibold"
                    />
                  </div>

                  {/* End time */}
                  <div className="w-[110px]">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">End Time</label>
                    <input
                      type="time"
                      value={avail.endTime}
                      onChange={(e) => handleFieldChange(index, 'endTime', e.target.value)}
                      className="w-full mt-1 rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs outline-none focus:border-brand-500 focus:bg-white transition-all font-semibold"
                    />
                  </div>

                  {/* Slot duration */}
                  <div className="w-[110px]">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Slot (Mins)</label>
                    <select
                      value={avail.slotDuration}
                      onChange={(e) => handleFieldChange(index, 'slotDuration', e.target.value)}
                      className="w-full mt-1 rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs outline-none focus:border-brand-500 focus:bg-white transition-all font-semibold"
                    >
                      <option value="15">15 min</option>
                      <option value="20">20 min</option>
                      <option value="30">30 min</option>
                      <option value="45">45 min</option>
                      <option value="60">60 min</option>
                    </select>
                  </div>

                  {/* Action delete */}
                  <div className="self-end pb-1.5">
                    <button
                      type="button"
                      onClick={() => handleRemoveDay(index)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-100 hover:bg-red-50 text-red-500 hover:text-red-600 transition-colors"
                      title="Remove Day"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>

                </div>
              ))}
              
              <div className="flex items-center space-x-3 mt-6 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  className="inline-flex items-center space-x-2 rounded-2xl bg-brand-600 hover:bg-brand-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-500/10 hover:shadow-brand-500/25 transition-all"
                >
                  <Save className="h-4.5 w-4.5" />
                  <span>Save Availability Limits</span>
                </button>
              </div>

            </div>
          )}
        </div>
      )}
    </main>
  );
}
