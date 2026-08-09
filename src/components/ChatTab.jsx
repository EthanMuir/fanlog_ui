import React, { useState, useEffect, useRef } from 'react';
import { MOCK_CHATS, TEAMS } from '../data/mockData';
import { MessageCircle, Users, ArrowLeft, Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatTab({ activeRoomId, setActiveRoomId }) {
  const [rooms, setRooms] = useState(MOCK_CHATS);
  const [newMessageText, setNewMessageText] = useState('');
  
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Get currently active room object
  const activeRoom = rooms.find(r => r.id === activeRoomId);
  const activeTeam = activeRoom ? TEAMS[activeRoom.teamId] : null;

  // Scroll to bottom of chat when messages change — use the container's scrollTop
  // to avoid bubbling up and shifting the parent page
  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  };

  useEffect(() => {
    if (activeRoomId) {
      // Small delay lets the DOM settle after AnimatePresence renders the overlay
      setTimeout(scrollToBottom, 50);
    }
  }, [activeRoomId, rooms]);

  // Handle sending a mock message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessageText.trim() || !activeRoomId) return;

    const userMsg = {
      sender: 'You',
      avatar: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="20" fill="#6366f1"/><text x="20" y="26" font-family="system-ui" font-size="16" font-weight="700" fill="white" text-anchor="middle">Y</text></svg>')}`,
      text: newMessageText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isUser: true
    };

    // Append user message
    setRooms(prev => prev.map(room => {
      if (room.id === activeRoomId) {
        return {
          ...room,
          messages: [...room.messages, userMsg],
          lastMessage: {
            sender: 'You',
            text: newMessageText,
            timestamp: 'Just now'
          }
        };
      }
      return room;
    }));

    const sentText = newMessageText;
    setNewMessageText('');

    // Trigger mock auto-reply after 1.5 seconds for extra polish
    setTimeout(() => {
      const responseNames = ['PuckMaster', 'RaptorsRise', 'BillsMafiaChief', 'FC_Gooner', 'JaysSupporter'];
      const responses = [
        'Agreed! What a play that was!',
        'No way, that was clearly a penalty!',
        'Let\'s gooooo! This game is insane!',
        'I am literally on the edge of my seat right now.',
        'Wait, did you guys see the replay? Incredible.',
        'This team is giving me grey hairs, but I love them.'
      ];

      const randomName = responseNames[Math.floor(Math.random() * responseNames.length)];
      const randomText = responses[Math.floor(Math.random() * responses.length)];

      const initials = ['P', 'R', 'B', 'F', 'J'];
      const colors = ['#ef4444','#f59e0b','#10b981','#3b82f6','#8b5cf6'];
      const colorIdx = Math.floor(Math.random() * colors.length);
      const initial = initials[Math.floor(Math.random() * initials.length)];
      const randomAvatarSvg = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="20" fill="${colors[colorIdx]}"/><text x="20" y="26" font-family="system-ui" font-size="16" font-weight="700" fill="white" text-anchor="middle">${initial}</text></svg>`)}`;
      const botMsg = {
        sender: randomName,
        avatar: randomAvatarSvg,
        text: randomText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isUser: false
      };

      setRooms(prev => prev.map(room => {
        if (room.id === activeRoomId) {
          return {
            ...room,
            messages: [...room.messages, botMsg],
            lastMessage: {
              sender: randomName,
              text: randomText,
              timestamp: 'Just now'
            }
          };
        }
        return room;
      }));
    }, 1500);
  };

  const handleOpenRoom = (roomId) => {
    setActiveRoomId(roomId);
    // Mark room as read
    setRooms(prev => prev.map(room => {
      if (room.id === roomId) {
        return { ...room, unread: false };
      }
      return room;
    }));
  };

  return (
    <div className="flex-1 w-full h-full flex flex-col bg-[#F8FAFC] relative overflow-hidden">
      
      {/* Tab Screen Header */}
      <div className="px-5 pt-4 pb-3 bg-white border-b border-slate-100 flex-shrink-0">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Live Chat</span>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-none mt-1 flex items-center gap-1.5">
          Fan Rooms <Sparkles size={18} className="text-amber-500 fill-amber-500/25" />
        </h2>
      </div>

      {/* Rooms List */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-4">
        
        {/* LIVE RECOMMENDED ROOM */}
        {rooms.filter(r => r.isLive).map(room => {
          const team = TEAMS[room.teamId];
          return (
            <motion.div
              key={room.id}
              onClick={() => handleOpenRoom(room.id)}
              whileTap={{ scale: 0.98 }}
              className="bg-white rounded-2xl p-4 border-[1.5px] border-red-200 cursor-pointer shadow-sm relative overflow-hidden transition-all duration-200 hover:border-red-300"
            >
              {/* Subtle background glow */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-xl pointer-events-none" />

              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-50 p-1 border border-slate-100 flex items-center justify-center">
                    <img src={team.logo} alt={team.name} className="w-6 h-6 object-contain" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 leading-tight">{room.name}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600 live-pulse"></span>
                      <span className="text-[10px] font-bold text-red-600 tracking-wider uppercase">LIVE MATCH</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-red-50 text-red-600 px-2 py-0.5 rounded-full text-[10px] font-bold">
                  <Users size={11} />
                  <span>{room.memberCount}</span>
                </div>
              </div>

              {/* Message preview */}
              <div className="mt-3 text-[11px] bg-red-50/20 p-2.5 rounded-xl border border-red-50">
                <span className="font-extrabold text-red-900">{room.lastMessage.sender}: </span>
                <span className="text-slate-600 font-medium italic">"{room.lastMessage.text}"</span>
                <span className="text-slate-400 text-[9px] font-bold block mt-1">{room.lastMessage.timestamp}</span>
              </div>
            </motion.div>
          );
        })}

        {/* GENERAL PINNED ROOMS */}
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 px-1">Pinned Fandoms</span>
          <div className="space-y-2.5">
            {rooms.filter(r => !r.isLive).map(room => {
              const team = TEAMS[room.teamId];
              return (
                <motion.div
                  key={room.id}
                  onClick={() => handleOpenRoom(room.id)}
                  whileTap={{ scale: 0.99 }}
                  className="bg-white rounded-xl p-3.5 border border-slate-100 cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.01)] hover:border-slate-200 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center p-1.5 border border-slate-100 flex-shrink-0">
                      <img src={team.logo} alt={team.name} className="w-6 h-6 object-contain" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 tracking-tight leading-snug">{room.name}</h4>
                      <p className="text-[11px] text-slate-450 mt-0.5 truncate leading-tight font-medium">
                        <strong className="text-slate-700 font-semibold">{room.lastMessage.sender}</strong>: {room.lastMessage.text}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-3">
                    <span className="text-[9px] text-slate-400 font-medium whitespace-nowrap">{room.lastMessage.timestamp}</span>
                    {room.unread ? (
                      <span className="w-2 h-2 rounded-full bg-[#005AC0]" />
                    ) : (
                      <span className="text-[9px] font-medium text-slate-400 flex items-center gap-0.5">
                        <Users size={9} /> {room.memberCount}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CHAT WINDOW SLIDE-UP OVERLAY */}
      <AnimatePresence>
        {activeRoomId && activeRoom && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="absolute inset-0 bg-white z-[110] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div 
              className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-slate-100 flex-shrink-0 text-white select-none"
              style={{ backgroundColor: activeTeam.color }}
            >
              <button 
                onClick={() => setActiveRoomId(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 active:scale-95 transition-all"
              >
                <ArrowLeft size={16} strokeWidth={2.5} />
              </button>

              <div className="flex flex-col items-center min-w-0 px-2 flex-1">
                <h3 className="text-xs font-extrabold truncate text-center leading-tight tracking-tight w-full">
                  {activeRoom.name}
                </h3>
                <div className="flex items-center gap-1 mt-0.5 text-[10px] text-white/80 font-medium">
                  {activeRoom.isLive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  )}
                  <span>{activeRoom.isLive ? 'Match Chat' : 'General Chat'} • {activeRoom.memberCount} online</span>
                </div>
              </div>

              {/* Logo in top right */}
              <div className="w-8 h-8 rounded-full bg-white/15 p-1 flex items-center justify-center">
                <img src={activeTeam.logo} alt={activeTeam.name} className="w-6 h-6 object-contain" />
              </div>
            </div>

            {/* Message Thread */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3 bg-slate-50">
              <div className="text-center py-2 select-none">
                <span className="bg-slate-200/60 text-slate-500 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                  Fandom Room Started
                </span>
              </div>

              {activeRoom.messages.map((msg, index) => {
                return (
                  <div 
                    key={index}
                    className={`flex items-start gap-2.5 ${msg.isUser ? 'flex-row-reverse' : ''}`}
                  >
                    {!msg.isUser && (
                      <img 
                        src={msg.avatar || `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="20" fill="#94a3b8"/><text x="20" y="26" font-family="system-ui" font-size="16" font-weight="700" fill="white" text-anchor="middle">?</text></svg>')}`} 
                        alt={msg.sender} 
                        className="w-7 h-7 rounded-full object-cover border border-slate-200 flex-shrink-0 mt-0.5" 
                      />
                    )}
                    <div className="flex flex-col max-w-[70%]">
                      {!msg.isUser && (
                        <span className="text-[10px] font-extrabold mb-0.5 ml-1" style={{ color: activeTeam.color }}>
                          {msg.sender}
                        </span>
                      )}
                      <div 
                        className={`rounded-2xl px-3.5 py-2 text-xs font-normal shadow-[0_1px_2px_rgba(0,0,0,0.02)] leading-relaxed ${
                          msg.isUser 
                            ? 'text-white rounded-tr-none' 
                            : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                        }`}
                        style={msg.isUser ? { backgroundColor: activeTeam.color } : {}}
                      >
                        {msg.text}
                      </div>
                      <span className={`text-[9px] text-slate-400 mt-1 select-none ${msg.isUser ? 'text-right mr-1' : 'ml-1'}`}>
                        {msg.time}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Keyboard input bar */}
            <form 
              onSubmit={handleSendMessage}
              className="p-3 bg-white border-t border-slate-100 flex items-center gap-2 flex-shrink-0"
            >
              <input 
                type="text"
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                placeholder="Say something to the room..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-xs focus:outline-none focus:border-slate-300 font-medium"
              />
              <button 
                type="submit"
                disabled={!newMessageText.trim()}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white transition-all disabled:opacity-40"
                style={{ backgroundColor: activeTeam.color }}
              >
                <Send size={14} strokeWidth={2.5} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
