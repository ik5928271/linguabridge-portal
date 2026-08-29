import React, { useState } from 'react';
import { Calendar, Clock, Globe, ShieldCheck, X, Check } from 'lucide-react';
import { LANGUAGES, SPECIALTIES } from '../data/mockData';

export default function ScheduleModal({ isOpen, onClose, onSaveAppointment }) {
  if (!isOpen) return null;

  const [hostName, setHostName] = useState('Dr. Sarah Jenkins, MD');
  const [patientName, setPatientName] = useState('Maria Gomez');
  const [language, setLanguage] = useState('Spanish');
  const [specialty, setSpecialty] = useState('Medical / Healthcare');
  const [date, setDate] = useState('2026-08-30');
  const [time, setTime] = useState('10:00 AM');
  const [duration, setDuration] = useState('45');
  const [notes, setNotes] = useState('Follow-up cardiology consultation and pacemaker telemetry check.');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveAppointment({
      id: `apt-${Date.now()}`,
      roomId: `room-apt-${Date.now().toString(36).slice(-4)}`,
      hostName,
      patientName,
      language,
      specialty,
      date,
      time,
      durationMinutes: parseInt(duration),
      status: 'confirmed',
      interpreterName: 'Auto-Matched Certified Interpreter',
      notes
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="max-w-lg w-full glass-panel p-6 sm:p-8 rounded-3xl border border-slate-700 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <span>Schedule 3-Way Interpretation</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Pre-book a certified interpreter for upcoming appointments
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Host & Patient */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">English Host / Provider</label>
              <input
                type="text"
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white focus:outline-none"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Client / Patient Name</label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Language & Specialty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white focus:outline-none bg-slate-900"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.name}>
                    {l.flag} {l.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Specialty</label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white focus:outline-none bg-slate-900"
              >
                {SPECIALTIES.map((s) => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date, Time, Duration */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white focus:outline-none"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Time</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g. 10:00 AM"
                className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white focus:outline-none"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Duration (min)</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white focus:outline-none bg-slate-900"
              >
                <option value="15">15 mins</option>
                <option value="30">30 mins</option>
                <option value="45">45 mins</option>
                <option value="60">60 mins</option>
                <option value="90">90 mins</option>
              </select>
            </div>
          </div>

          {/* Clinical / Case Notes */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Session Notes & Instructions</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Provide context for the interpreter..."
              className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white focus:outline-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Confirm Booking</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
