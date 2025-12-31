
import React, { useState, useEffect, useRef } from 'react';
import { Send, Wifi, Map, Settings, Users, ArrowLeft } from 'lucide-react';
import { PassengerProfile, MessageRecord, PacketType } from '../types';
import { BitchatProtocol } from '../services/bitchatProtocol';
import { GoogleGenAI } from "@google/genai";

interface CabinProps {
  profile: PassengerProfile;
  onExit: () => void;
}

const Cabin: React.FC<CabinProps> = ({ profile, onExit }) => {
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [meshNodes, setMeshNodes] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Simulate incoming messages from other "passengers" using Gemini to make it feel alive
  useEffect(() => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const simulateArrival = async () => {
      // Periodic check for new "nodes"
      setMeshNodes(prev => Math.min(prev + Math.floor(Math.random() * 2), 48));

      // Occasionally generate a message
      if (Math.random() > 0.7) {
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `You are a passenger in seat ${Math.floor(Math.random() * 30 + 1)}${['A', 'B', 'C', 'D', 'E', 'F'][Math.floor(Math.random() * 6)]}. 
          You are using a decentralized mesh chat called PlaneDating during a flight. 
          Send a short, stealth-luxury style message to the cabin chat (under 15 words). 
          Topics: coffee quality, arrival time, turbulence, or networking. No emojis.`,
        });

        const text = response.text || "Connection stable.";
        const seats = ["04F", "12B", "21C", "09A", "18E"];
        const randomSeat = seats[Math.floor(Math.random() * seats.length)];

        const packet = BitchatProtocol.constructPacket(PacketType.TEXT, 3, text, randomSeat);
        
        setMessages(prev => [...prev, {
          id: packet.packetId,
          sender: packet.senderSeat,
          text: packet.payload,
          timestamp: Date.now(),
          isSelf: false
        }]);
      }
    };

    const interval = setInterval(simulateArrival, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const chunks = BitchatProtocol.fragmentMessage(inputValue);
    chunks.forEach(chunk => {
      const packet = BitchatProtocol.constructPacket(PacketType.TEXT, 3, chunk, profile.seat);
      
      setMessages(prev => [...prev, {
        id: packet.packetId,
        sender: profile.seat,
        text: packet.payload,
        timestamp: Date.now(),
        isSelf: true
      }]);
    });

    setInputValue('');
  };

  const getAvatarColor = (seat: string) => {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
    const index = seat.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="flex flex-col h-screen bg-[#0A0A0A] text-[#E5E5E5] font-light tracking-tight">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur-md z-10">
        <div className="flex items-center space-x-4">
          <button onClick={onExit} className="p-2 -ml-2 text-white/40 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="mono text-xs uppercase tracking-[0.2em] text-white/80">Flight {profile.flight}</h2>
            <div className="flex items-center space-x-2 text-[10px] mono text-white/30 uppercase">
              <span className="text-emerald-500/80">● Online</span>
              <span>•</span>
              <span>Channel: {profile.channelId.substring(0, 8)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex flex-col items-end">
            <div className="flex items-center space-x-1.5">
              <span className="mono text-[10px] text-white/60">{meshNodes}</span>
              <Wifi className={`w-4 h-4 ${meshNodes > 5 ? 'text-emerald-500' : 'text-amber-500'}`} />
            </div>
            <span className="text-[8px] mono text-white/20 uppercase">Mesh Strength</span>
          </div>
          <button className="p-2 text-white/40 hover:text-white"><Settings className="w-4 h-4" /></button>
        </div>
      </header>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-20 space-y-4">
            <Users className="w-12 h-12 stroke-1" />
            <p className="mono text-[10px] uppercase tracking-widest text-center">
              Scanning cabin for active nodes...<br/>
              Established secure hop: BLE-MESH-01
            </p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.isSelf ? 'items-end' : 'items-start'}`}>
            <div className="flex items-center space-x-2 mb-1.5 px-1">
              {!msg.isSelf && (
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: getAvatarColor(msg.sender) }}
                />
              )}
              <span className="mono text-[10px] text-white/30 font-bold">[{msg.sender}]</span>
              <span className="mono text-[8px] text-white/10 uppercase">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className={`
              max-w-[85%] px-4 py-3 rounded-sm border
              ${msg.isSelf 
                ? 'bg-white/5 border-white/10 text-white/90 rounded-tr-none' 
                : 'bg-transparent border-white/5 text-white/60 rounded-tl-none'}
            `}>
              <p className="text-sm leading-relaxed mono break-words">{msg.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <footer className="p-6 border-t border-white/5 bg-[#0A0A0A]">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Transmit to cabin mesh..."
            className="w-full bg-white/5 border border-white/10 rounded-sm py-4 pl-5 pr-14 text-sm mono focus:outline-none focus:border-white/30 placeholder:text-white/10 transition-all"
          />
          <button 
            onClick={handleSendMessage}
            className="absolute right-4 p-2 text-white/30 hover:text-white transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-3 flex justify-between px-1">
          <div className="flex items-center space-x-4 text-[9px] mono text-white/20 uppercase tracking-tighter">
            <span className="flex items-center"><Map className="w-3 h-3 mr-1" /> LHR -> JFK</span>
            <span>Est. Arrival: 04:22 UTC</span>
          </div>
          <span className="text-[9px] mono text-white/20 uppercase">Packet Size: {new Blob([inputValue]).size}B</span>
        </div>
      </footer>
    </div>
  );
};

export default Cabin;
