import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Clock, 
  Calendar, 
  PhoneCall, 
  CheckCircle2, 
  X, 
  Volume2, 
  AlertCircle,
  ExternalLink,
  Users,
  Globe
} from 'lucide-react';
import { getSocket } from '../services/socket';
import { playTelephoneRing, playMessageTone, playConnectedChime } from '../services/audioService';

export default function AppointmentNotificationManager({ 
  currentUser, 
  appointments = [], 
  onStartCall 
}) {
  const [toastNotification, setToastNotification] = useState(null);
  const [tenMinuteAlert, setTenMinuteAlert] = useState(null);
  const [liveStartModal, setLiveStartModal] = useState(null);
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());

  // Listen for real-time socket events
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    // Handle new appointment created event
    const handleNewAppointment = (apt) => {
      playMessageTone();
      setToastNotification({
        id: `toast-${Date.now()}`,
        title: 'New 3-Party Appointment Confirmed',
        message: `${apt.mainClientName || 'Client'} scheduled a ${apt.language || 'Language'} session with ${apt.interpreter?.name || 'Assigned Interpreter'}.`,
        date: apt.date || 'Today',
        time: apt.time || 'Immediate',
        apt
      });

      // Auto dismiss toast after 8 seconds
      setTimeout(() => {
        setToastNotification(null);
      }, 8000);
    };

    socket.on('new-appointment-created', handleNewAppointment);

    return () => {
      socket.off('new-appointment-created', handleNewAppointment);
    };
  }, []);

  // Interval timer checking for 10-minute alerts & on-time start
  useEffect(() => {
    const checkScheduleTimes = () => {
      if (!Array.isArray(appointments) || appointments.length === 0) return;

      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const todayStr = now.toISOString().split('T')[0];

      appointments.forEach((apt) => {
        if (!apt.id || dismissedAlerts.has(apt.id)) return;

        // If today matches appointment date or if it is scheduled
        const isToday = apt.date === todayStr || !apt.date || apt.date.includes('2026-09-04');

        if (isToday && apt.time) {
          // Parse time string e.g. "06:00 PM" or "11:30 AM"
          const timeParts = apt.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
          if (timeParts) {
            let hour = parseInt(timeParts[1]);
            const minute = parseInt(timeParts[2]);
            const ampm = timeParts[3].toUpperCase();

            if (ampm === 'PM' && hour < 12) hour += 12;
            if (ampm === 'AM' && hour === 12) hour = 0;

            const aptTotalMinutes = hour * 60 + minute;
            const nowTotalMinutes = currentHours * 60 + currentMinutes;
            const diffMinutes = aptTotalMinutes - nowTotalMinutes;

            // Trigger 10-Minute Alert if within 10 minutes (0 to 10 mins before start)
            if (diffMinutes > 0 && diffMinutes <= 10 && (!tenMinuteAlert || tenMinuteAlert.apt.id !== apt.id)) {
              playMessageTone();
              setTenMinuteAlert({
                minutesRemaining: diffMinutes,
                apt
              });
            }

            // Trigger Live Start Modal if it is start time (0 to 30 mins after start)
            if (diffMinutes <= 0 && diffMinutes >= -30 && (!liveStartModal || liveStartModal.apt.id !== apt.id)) {
              playTelephoneRing();
              setLiveStartModal({
                apt
              });
            }
          }
        }
      });
    };

    const interval = setInterval(checkScheduleTimes, 15000);
    checkScheduleTimes(); // Run immediately

    return () => clearInterval(interval);
  }, [appointments, dismissedAlerts, tenMinuteAlert, liveStartModal]);

  const handleEnterCall = (apt) => {
    playConnectedChime();
    setLiveStartModal(null);
    setTenMinuteAlert(null);
    onStartCall({
      roomId: apt.roomId || `room-${Date.now().toString(36).slice(-6)}`,
      role: currentUser?.role === 'interpreter' ? 'interpreter' : 'host',
      participantName: currentUser?.name || apt.mainClientName || 'Main Client',
      targetLanguage: apt.language || 'Urdu',
      specialty: apt.specialty || 'General / Customer Support',
      patientName: apt.guestName || 'Guest Client',
      hostName: apt.mainClientName || 'Main Client',
      interpreter: apt.interpreter,
      interpreterName: apt.interpreter?.name || 'Certified Interpreter',
      callType: apt.callType || 'audio'
    });
  };

  return (
    <>
      {/* 1. TOAST NOTIFICATION: Instant Multi-Party Alert when Booked */}
      {toastNotification && (
        <div className="fixed top-20 right-4 z-50 max-w-md w-full glass-panel p-4 rounded-2xl border-2 border-emerald-500/80 bg-slate-950/95 text-white shadow-2xl animate-fade-in flex items-start justify-between gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
            <Bell className="w-5 h-5 animate-bounce" />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{toastNotification.title}</span>
            </div>
            <p className="text-xs text-slate-200 font-medium leading-relaxed">
              {toastNotification.message}
            </p>
            <p className="text-[10px] text-slate-400">
              📅 {toastNotification.date} at {toastNotification.time}
            </p>
          </div>
          <button 
            onClick={() => setToastNotification(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. 10-MINUTE-BEFORE REMINDER ALERT BANNER */}
      {tenMinuteAlert && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 max-w-2xl w-full px-4">
          <div className="glass-panel p-4 rounded-2xl bg-amber-950/90 border-2 border-amber-500 text-white shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-bounce">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/30 text-amber-300 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6 animate-spin" style={{ animationDuration: '6s' }} />
              </div>
              <div className="space-y-0.5 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-black uppercase tracking-wider text-amber-300">
                  <span>⏰ 10-Minute Appointment Reminder</span>
                </div>
                <p className="text-xs text-slate-200">
                  Your 3-Party session with <strong>{tenMinuteAlert.apt.interpreter?.name || 'Certified Interpreter'}</strong> starts in ~{tenMinuteAlert.minutesRemaining} minutes!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleEnterCall(tenMinuteAlert.apt)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Join Waiting Room</span>
              </button>
              <button
                onClick={() => {
                  setDismissedAlerts(prev => new Set([...prev, tenMinuteAlert.apt.id]));
                  setTenMinuteAlert(null);
                }}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. ON-TIME LIVE START CONFERENCE CALL MODAL */}
      {liveStartModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-lg w-full glass-panel p-6 sm:p-8 rounded-3xl border-2 border-emerald-500 shadow-2xl space-y-6 text-white text-center relative overflow-hidden animate-scale-up">
            
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center mx-auto shadow-2xl ring-8 ring-emerald-500/20">
              <PhoneCall className="w-10 h-10 animate-bounce" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-400">
                🚀 Appointment Time Reached
              </span>
              <h3 className="text-2xl font-extrabold">Start 3-Party Conference Call</h3>
              <p className="text-xs text-slate-300">
                The scheduled session for <strong>{liveStartModal.apt.language}</strong> is ready for all 3 participants to enter now.
              </p>
            </div>

            {/* Session Card */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Main Client (Payer):</span>
                <span className="font-bold text-white">{liveStartModal.apt.mainClientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Certified Interpreter:</span>
                <span className="font-bold text-emerald-400">{liveStartModal.apt.interpreter?.name || 'Assigned Interpreter'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Guest Client:</span>
                <span className="font-bold text-amber-300">{liveStartModal.apt.guestName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Language & Modality:</span>
                <span className="font-bold text-white">English ⟷ {liveStartModal.apt.language} ({liveStartModal.apt.callType || 'audio'})</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  setDismissedAlerts(prev => new Set([...prev, liveStartModal.apt.id]));
                  setLiveStartModal(null);
                }}
                className="py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                Dismiss
              </button>

              <button
                onClick={() => handleEnterCall(liveStartModal.apt)}
                className="py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-xs shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-4 h-4 animate-pulse" />
                <span>Enter 3-Party Room</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
