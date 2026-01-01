
import React, { useState, useEffect, useRef } from 'react';
import { 
  Wifi, Users, ArrowLeft, ShieldAlert, 
  UserEdit, Send, CheckCircle, XCircle, 
  Handshake, Briefcase, Info, MessageCircle,
  MoreVertical, Settings
} from 'lucide-react';
import { 
  PassengerProfile, MessageRecord, PacketType, 
  UserProfile, ManifestNode 
} from '../types';
import { BitchatProtocol } from '../services/bitchatProtocol';

interface CabinProps {
  profile: PassengerProfile;
  onExit: () => void;
}

const Cabin: React.FC<CabinProps> = ({ profile, onExit }) => {
  // --- State ---
  const [myProfile, setMyProfile] = useState<UserProfile>({
    // Use type assertion as passengerName is missing in PassengerProfile type definition but passed in logic
    name: (profile as any).passengerName || 'Anonymous Traveler',
    bio: 'Networking at 35,000 feet.',
    tags: ['Tech', 'Design', 'Strategy'],
    seat: profile.seat
  });
  
  const [nodes, setNodes] = useState<Map<string, ManifestNode>>(new Map());
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [activeChatSeat, setActiveChatSeat] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [inputValue, setInputValue] = useState('');

  // --- Mock Data Initialization (Simulating real heartbeats received) ---
  useEffect(() => {
    const mockNodes = new Map<string, ManifestNode>();
    const names = ["Sarah Chen", "Marcus Vane", "Elena Rodriguez", "Julian Smith"];
    const seats = ["04A", "12C", "21F", "09B"];
    const tagSets = [["Venture", "SaaS", "AI"], ["Legal", "M&A", "Crypto"], ["Design", "UX", "Product"], ["Finance", "FinTech", "NYC"]];

    seats.forEach((seat, i) => {
      mockNodes.set(seat, {
        profile: {
          name: names[i],
          bio: "Looking for connections.",
          tags: tagSets[i],
          seat: seat
        },
        lastSeen: Date.now(),
        handshakeStatus: 'none'
      });
    });
    setNodes(mockNodes);
  }, []);

  // --- Presence & Protocol Monitoring ---
  useEffect(() => {
    const heartbeatInterval = setInterval(() => {
      // Simulate broadcasting own heartbeat
      console.log(`[Bitchat] Outbound Heartbeat: ${profile.seat}`);
    }, 45000);

    const pruningInterval = setInterval(() => {
      const now = Date.now();
      setNodes(prev => {
        // Explicitly type the new Map to help TS inference
        const next = new Map<string, ManifestNode>(prev);
        let changed = false;
        // Use forEach on the Map to maintain proper typing of the node
        next.forEach((node, seat) => {
          if (now - node.lastSeen > 120000) {
            next.delete(seat);
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }, 10000);

    return () => {
      clearInterval(heartbeatInterval);
      clearInterval(pruningInterval);
    };
  }, [profile.seat]);

  // --- Actions ---
  const handleHandshakeRequest = (targetSeat: string) => {
    // 1-byte logic simulation (PacketType.HANDSHAKE_REQ)
    console.log(`[Bitchat] Sending HANDSHAKE_REQ to ${targetSeat}`);
    setNodes(prev => {
      // Explicitly type the new Map to ensure node is inferred correctly as ManifestNode
      const next = new Map<string, ManifestNode>(prev);
      const node = next.get(targetSeat);
      if (node) next.set(targetSeat, { ...node, handshakeStatus: 'pending' });
      return next;
    });

    // Simulate auto-accept for demo if desired, or just wait
    setTimeout(() => {
        setNodes(prev => {
            // Explicitly type the new Map to ensure node is inferred correctly as ManifestNode
            const next = new Map<string, ManifestNode>(prev);
            const node = next.get(targetSeat);
            if (node) next.set(targetSeat, { ...node, handshakeStatus: 'accepted' });
            return next;
        });
    }, 3000);
  };

  const saveProfile = () => {
    setIsEditingProfile(false);
    // In real app, would broadcast updated profile packet here
  };

  const handleSendMessage = () => {
    if (!inputValue.trim() || !activeChatSeat) return;
    setMessages(prev => [...prev, {
      id: Math.random().toString(),
      sender: profile.seat,
      text: inputValue,
      timestamp: Date.now(),
      isSelf: true
    }]);
    setInputValue('');
  };

  // --- Render Helpers ---
  const getMeshStrength = () => {
    const count = nodes.size;
    if (count > 10) return { label: 'Strong', color: 'text-emerald-400' };
    if (count > 3) return { label: 'Stable', color: 'text-blue-400' };
    return { label: 'Weak', color: 'text-amber-400' };
  };

  const strength = getMeshStrength();

  // --- Views ---
  
  if (activeChatSeat) {
    const targetNode = nodes.get(activeChatSeat);
    return (
      <div className="flex flex-col h-screen bg-[#050505] text-slate-100">
        <header className="px-6 py-5 glass border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center space-x-4">
                <button onClick={() => setActiveChatSeat(null)} className="p-2 text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h2 className="text-sm font-bold">{targetNode?.profile.name}</h2>
                    <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Private Mesh Link</span>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-slate-500">Seat {activeChatSeat}</span>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center opacity-20 text-center">
                    <Handshake className="w-12 h-12 mb-4" />
                    <p className="text-xs uppercase tracking-widest font-bold">Handshake Established<br/>Encryption: Bitchat V2-Native</p>
                </div>
            )}
            {messages.map(m => (
                <div key={m.id} className={`flex ${m.isSelf ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${m.isSelf ? 'bg-blue-600 text-white rounded-tr-none' : 'glass rounded-tl-none'}`}>
                        {m.text}
                    </div>
                </div>
            ))}
        </div>

        <footer className="p-6 bg-[#050505] border-t border-white/5">
            <div className="relative flex items-center">
                <input 
                    type="text" 
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..." 
                    className="w-full bg-white/5 border border-white/10 rounded-full py-3.5 pl-6 pr-14 text-sm focus:outline-none focus:border-blue-500/50 transition-all"
                />
                <button onClick={handleSendMessage} className="absolute right-2 p-2 bg-blue-600 rounded-full hover:bg-blue-500 transition-colors">
                    <Send className="w-4 h-4" />
                </button>
            </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#050505] text-slate-100">
      {/* Header */}
      <header className="px-6 py-8 flex items-center justify-between z-20">
        <div>
          <h1 className="text-2xl font-bold heading tracking-tight">Cabin Manifest</h1>
          <div className="flex items-center space-x-3 mt-1">
             <div className="flex items-center space-x-1.5 text-[10px] font-black uppercase tracking-widest">
                <Wifi className={`w-3 h-3 ${strength.color}`} />
                <span className={strength.color}>{strength.label} Mesh</span>
             </div>
             <span className="text-slate-700">•</span>
             <div className="flex items-center space-x-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <Users className="w-3 h-3" />
                <span>{nodes.size + 1} Verified Nodes</span>
             </div>
          </div>
        </div>
        <button 
          onClick={() => setIsEditingProfile(true)}
          className="p-3 glass rounded-2xl hover:bg-white/10 transition-all active:scale-95"
        >
          <Settings className="w-5 h-5 text-slate-400" />
        </button>
      </header>

      {/* Manifest List */}
      <div className="flex-1 overflow-y-auto px-6 pb-24 space-y-4">
        {/* Own Profile Card */}
        <div className="p-5 glass-active rounded-[24px] border border-blue-500/20 glow">
            <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center font-bold text-lg ring-4 ring-blue-500/20">
                    {myProfile.name.charAt(0)}
                </div>
                <div className="flex-1">
                    <div className="flex items-center space-x-2">
                        <span className="text-xs font-black bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full uppercase tracking-tighter">{myProfile.seat}</span>
                        <h3 className="font-bold text-sm text-white">{myProfile.name} (You)</h3>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">{myProfile.bio}</p>
                </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
                {myProfile.tags.map(tag => (
                    <span key={tag} className="text-[9px] font-bold uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md text-slate-300 border border-white/5">
                        {tag}
                    </span>
                ))}
            </div>
        </div>

        <div className="pt-4 pb-2">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Nearby Connections</h4>
        </div>

        {/* Explicitly type the node variable in map to resolve inference issues */}
        {Array.from(nodes.values()).map((node: ManifestNode) => (
          <div 
            key={node.profile.seat}
            onClick={() => node.handshakeStatus === 'accepted' ? setActiveChatSeat(node.profile.seat) : handleHandshakeRequest(node.profile.seat)}
            className={`
              p-5 glass rounded-[24px] transition-all cursor-pointer group
              ${node.handshakeStatus === 'pending' ? 'opacity-70 scale-[0.98]' : 'hover:bg-white/5 hover:border-white/20 active:scale-[0.97]'}
            `}
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full glass border border-white/10 flex items-center justify-center font-bold text-slate-300">
                {node.profile.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-black bg-white/5 text-slate-400 px-2 py-0.5 rounded-full uppercase tracking-tighter">{node.profile.seat}</span>
                    <h3 className="font-bold text-sm text-slate-100">{node.profile.name}</h3>
                  </div>
                  {node.handshakeStatus === 'accepted' ? (
                      <MessageCircle className="w-4 h-4 text-blue-400" />
                  ) : node.handshakeStatus === 'pending' ? (
                      <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                  ) : (
                      <Handshake className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">{node.profile.bio}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {node.profile.tags.map(tag => (
                <span key={tag} className="text-[9px] font-bold uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md text-slate-500 border border-white/5">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Profile Edit Modal */}
      {isEditingProfile && (
        <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg glass rounded-t-[40px] sm:rounded-[40px] p-8 space-y-8 animate-in slide-in-from-bottom duration-300 border-t border-white/10 sm:border">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold heading">Edit Manifest Profile</h3>
                <button onClick={() => setIsEditingProfile(false)} className="p-2 text-slate-400 hover:text-white"><XCircle className="w-6 h-6" /></button>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Public Name</label>
                    <input 
                        type="text" 
                        value={myProfile.name}
                        onChange={e => setMyProfile({...myProfile, name: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-5 text-sm focus:outline-none focus:border-blue-500/50"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Short Bio (Max 50 Char)</label>
                    <input 
                        type="text" 
                        maxLength={50}
                        value={myProfile.bio}
                        onChange={e => setMyProfile({...myProfile, bio: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-5 text-sm focus:outline-none focus:border-blue-500/50"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Professional Tags</label>
                    <div className="flex flex-wrap gap-2">
                        {['Tech', 'Design', 'Legal', 'Venture', 'Health', 'Crypto'].map(tag => (
                            <button
                                key={tag}
                                onClick={() => {
                                    const next = myProfile.tags.includes(tag) 
                                        ? myProfile.tags.filter(t => t !== tag)
                                        : [...myProfile.tags, tag].slice(0, 3);
                                    setMyProfile({...myProfile, tags: next});
                                }}
                                className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${myProfile.tags.includes(tag) ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400 border border-white/5'}`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <button 
                onClick={saveProfile}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-[24px] font-bold text-sm tracking-widest uppercase transition-all shadow-xl shadow-blue-600/20"
            >
                Broadcast Updates
            </button>
          </div>
        </div>
      )}

      {/* Quick Action Navigation Bar */}
      <nav className="fixed bottom-8 left-6 right-6 h-16 glass rounded-full border border-white/10 flex items-center justify-around px-4 z-40">
        <button className="p-3 text-blue-400"><Users className="w-5 h-5" /></button>
        <button className="p-3 text-slate-500 hover:text-white"><MessageCircle className="w-5 h-5" /></button>
        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center -translate-y-4 shadow-xl shadow-blue-600/40 ring-8 ring-[#050505]">
            <Handshake className="w-6 h-6 text-white" />
        </div>
        <button className="p-3 text-slate-500 hover:text-white"><Briefcase className="w-5 h-5" /></button>
        <button className="p-3 text-slate-500 hover:text-white"><Info className="w-5 h-5" /></button>
      </nav>
    </div>
  );
};

export default Cabin;
