
import React, { useState } from 'react';
import Terminal from './components/Terminal';
import Cabin from './components/Cabin';
import { PassengerProfile } from './types';

const App: React.FC = () => {
  const [profile, setProfile] = useState<PassengerProfile | null>(null);

  const handleAuthorized = (data: PassengerProfile) => {
    setProfile(data);
  };

  const handleExit = () => {
    setProfile(null);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] selection:bg-white/20">
      {!profile ? (
        <Terminal onAuthorized={handleAuthorized} />
      ) : (
        <Cabin profile={profile} onExit={handleExit} />
      )}
    </div>
  );
};

export default App;
