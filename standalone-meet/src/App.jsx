import React, { useState, useEffect } from 'react';
import JoinLobby from './components/JoinLobby';
import JitsiMeetingRoom from './components/JitsiMeetingRoom';

export default function App() {
  const [meetingConfig, setMeetingConfig] = useState(null);

  useEffect(() => {
    // Parse query params on load
    const params = new URLSearchParams(window.location.search);
    const roomId = params.get('roomId') || params.get('room') || params.get('session');
    const role = params.get('role') || 'client';
    const name = params.get('name') || '';
    const language = params.get('lang') || params.get('language') || 'General';
    const autoJoin = params.get('autojoin') === 'true' || params.get('auto') === '1';

    if (roomId && (autoJoin || name)) {
      setMeetingConfig({
        roomId,
        displayName: name || `${role.toUpperCase()} User`,
        role,
        language
      });
    }
  }, []);

  const handleJoin = (config) => {
    setMeetingConfig(config);
  };

  const handleLeave = () => {
    setMeetingConfig(null);
    // Clear URL params without full page reload
    if (window.history.pushState) {
      const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.pushState({ path: cleanUrl }, '', cleanUrl);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {meetingConfig ? (
        <JitsiMeetingRoom 
          roomId={meetingConfig.roomId}
          displayName={meetingConfig.displayName}
          role={meetingConfig.role}
          language={meetingConfig.language}
          onLeave={handleLeave}
        />
      ) : (
        <JoinLobby onJoin={handleJoin} />
      )}
    </div>
  );
}
