
import React, { useState } from 'react';
import { Plane, Scan, ShieldCheck, Ticket } from 'lucide-react';
import { parseBoardingPass, generateChannelId } from '../services/bcbpParser';
import { PassengerProfile } from '../types';

interface TerminalProps {
  onAuthorized: (profile: PassengerProfile) => void;
}

const Terminal: React.FC<TerminalProps> = ({ onAuthorized }) => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const DEMO_BCBP = "M1ALDERSON/ELLIOT EABC123 LHRJFKBA 0123 123Y012A0001 100";

  const handleScan = async () => {
    setScanning(true);
    setError(null);
    
    setTimeout(async () => {
      const parsed = parseBoardingPass(DEMO_BCBP);
      if (parsed) {
        const channelId = await generateChannelId(parsed.flightNumber, parsed.date);
        onAuthorized({
          seat: parsed.seat,
          flight: parsed.flightNumber,
          date: parsed.date,
          channelId
        });
      } else {
        setError("We couldn't read that boarding pass. Please try again.");
      }
      setScanning(false);
    }, 1800);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-slate-800">
      <div className="w-full max-w-md space-y-10 text-center">
        <header className="space-y-3">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-600 rounded-[32px] shadow-xl shadow-blue-200 mb-2 transform rotate-12">
            <Plane className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-blue-900 heading">PlaneDating</h1>
          <p className="text-blue-600/70 font-medium uppercase tracking-widest text-xs">Connected Cabin Community</p>
        </header>

        <main className="space-y-8">
          <button 
            onClick={!scanning ? handleScan : undefined}
            className={`
              relative w-full overflow-hidden transition-all duration-300
              bg-white border-2 border-blue-50 p-10 rounded-[40px] shadow-lg shadow-blue-100/50
              flex flex-col items-center justify-center space-y-4 group
              ${scanning ? 'opacity-80 scale-95' : 'hover:border-blue-200 hover:shadow-xl hover:-translate-y-1'}
            `}
          >
            <div className={`
              w-20 h-20 rounded-full flex items-center justify-center transition-colors
              ${scanning ? 'bg-blue-50 text-blue-600' : 'bg-blue-600 text-white group-hover:bg-blue-700'}
            `}>
              {scanning ? <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /> : <Scan className="w-8 h-8" />}
            </div>
            
            <div className="space-y-1">
              <span className="block text-lg font-bold text-slate-800">
                {scanning ? 'Verifying Flight...' : 'Unlock Cabin Chat'}
              </span>
              <span className="text-sm text-slate-400 font-medium">Scan your boarding pass to join</span>
            </div>
          </button>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          <div className="flex items-center justify-center space-x-8 opacity-40">
            <div className="flex flex-col items-center space-y-1">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase">Private</span>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <Ticket className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase">Verified</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Terminal;
