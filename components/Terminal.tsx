
import React, { useState, useRef } from 'react';
import { Plane, Scan, Info } from 'lucide-react';
import { parseBoardingPass, generateChannelId } from '../services/bcbpParser';
import { PassengerProfile } from '../types';

interface TerminalProps {
  onAuthorized: (profile: PassengerProfile) => void;
}

const Terminal: React.FC<TerminalProps> = ({ onAuthorized }) => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // For Demo: Simulated IATA code
  const DEMO_BCBP = "M1ALDERSON/ELLIOT EABC123 LHRJFKBA 0123 123Y012A0001 100";

  const handleScan = async () => {
    setScanning(true);
    setError(null);
    
    // Simulate camera start
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      }
    } catch (e) {
      console.warn("Camera failed, using fallback demo.");
    }

    // Artificial delay for high-fidelity feel
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
        setError("Invalid IATA manifest signature.");
      }
      setScanning(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-[#0A0A0A] text-[#E5E5E5]">
      <div className="w-full max-w-md space-y-12">
        <header className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 border border-white/10 rounded-full mb-4 bg-white/5">
            <Plane className="w-8 h-8 text-white/80" />
          </div>
          <h1 className="text-4xl font-light tracking-widest uppercase mono">Cabin Mesh</h1>
          <p className="text-white/40 text-sm tracking-widest uppercase mono">In-Flight Social Sovereignty</p>
        </header>

        <main className="space-y-6">
          <div 
            onClick={!scanning ? handleScan : undefined}
            className={`
              relative overflow-hidden cursor-pointer
              border border-white/10 p-12 rounded-sm
              flex flex-col items-center justify-center space-y-4
              transition-all duration-500 hover:bg-white/5 hover:border-white/30
              ${scanning ? 'opacity-50' : 'opacity-100'}
            `}
          >
            {scanning && (
              <div className="absolute inset-0 bg-white/5 animate-pulse flex items-center justify-center">
                 <div className="w-full h-[1px] bg-emerald-500/50 absolute animate-[scan_2s_infinite]" />
              </div>
            )}
            <Scan className={`w-12 h-12 ${scanning ? 'animate-pulse text-emerald-500' : 'text-white/60'}`} />
            <span className="mono text-xs tracking-tighter uppercase">
              {scanning ? 'Authenticating Manifest...' : 'Scan Boarding Pass'}
            </span>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-sm text-red-500 text-[10px] mono uppercase text-center">
              {error}
            </div>
          )}

          <div className="flex items-start space-x-3 p-4 bg-white/5 border border-white/5 rounded-sm">
            <Info className="w-4 h-4 text-white/30 shrink-0 mt-0.5" />
            <p className="text-[10px] text-white/40 leading-relaxed mono uppercase">
              Notice: All communications are encrypted and decentralized. No central server logs are maintained. Your identity is tethered to your seat manifest.
            </p>
          </div>
        </main>

        <footer className="text-center pt-8">
          <p className="text-[8px] text-white/20 mono tracking-[0.2em] uppercase">
            Protocol: Bitchat V2.05-Draft • Xeneva Labs
          </p>
        </footer>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          50% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default Terminal;
