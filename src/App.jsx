import React, { useState } from 'react';
import IPhoneFrame from './components/IPhoneFrame';
import FeedTab from './components/FeedTab';
import ChatTab from './components/ChatTab';
import LogTab from './components/LogTab';
import ProfileTab from './components/ProfileTab';
import { Newspaper, MessageSquare, PlusCircle, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MOCK_LOGGED_GAMES, MOCK_UNLOGGED_GAMES } from './data/mockData';

export default function App() {
  const [activeTab, setActiveTab] = useState('feed');
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [pendingGames, setPendingGames] = useState(MOCK_UNLOGGED_GAMES);
  const [loggedGames, setLoggedGames] = useState(MOCK_LOGGED_GAMES);

  // Jump from Feed Tab directly to a Chat Room
  const navigateToChatRoom = (roomId) => {
    setActiveTab('chat');
    setActiveRoomId(roomId);
  };

  // Move game from unlogged list to logged list
  const handleLogGame = (gameId, rating, notes, selectedPeriods) => {
    const game = pendingGames.find(g => g.id === gameId);
    if (!game) return;

    const newLog = {
      id: `log-${Date.now()}`,
      teamId: game.teamId,
      opponentName: game.opponent.name,
      opponentLogo: game.opponent.logo,
      rating,
      notes,
      timeSpent: selectedPeriods.length === 0 ? 'None' : selectedPeriods.join(', '),
      date: 'Just now'
    };

    setLoggedGames(prev => [newLog, ...prev]);
    setPendingGames(prev => prev.filter(g => g.id !== gameId));
  };

  // Helper to render the active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'feed':
        return <FeedTab key="feed" onJoinChat={navigateToChatRoom} />;
      case 'chat':
        return <ChatTab key="chat" activeRoomId={activeRoomId} setActiveRoomId={setActiveRoomId} />;
      case 'log':
        return (
          <LogTab 
            key="log" 
            pendingGames={pendingGames} 
            loggedGames={loggedGames} 
            onLogGame={handleLogGame} 
          />
        );
      case 'profile':
        return <ProfileTab key="profile" loggedGames={loggedGames} />;
      default:
        return <FeedTab key="feed" onJoinChat={navigateToChatRoom} />;
    }
  };

  // Bottom navigation items config
  const navItems = [
    { id: 'feed', label: 'Feed', icon: Newspaper },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'log', label: 'Log', icon: PlusCircle },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <IPhoneFrame>
      <div className="flex-1 w-full h-full flex flex-col overflow-hidden bg-white select-none rounded-b-[39px]">
        
        {/* Main Content Area */}
        <div className="flex-1 w-full overflow-hidden flex flex-col relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex-1 w-full h-full flex flex-col overflow-hidden"
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Tab Bar (iOS Native Style with Glassmorphism) */}
        <div className="w-full bg-white/95 backdrop-blur-md border-t border-slate-100 flex items-center justify-around py-2.5 px-4 pb-[22px] flex-shrink-0 z-[100] pointer-events-auto rounded-b-[39px]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="flex flex-col items-center justify-center py-1 flex-1 relative transition-colors focus:outline-none"
              >
                <motion.div
                  whileTap={{ scale: 0.85 }}
                  className={`flex flex-col items-center ${isActive ? 'text-slate-900' : 'text-slate-400'}`}
                >
                  <Icon 
                    size={20} 
                    strokeWidth={isActive ? 2.5 : 2} 
                    className="transition-transform duration-200" 
                  />
                  <span className="text-[10px] font-bold mt-1 tracking-wide">
                    {item.label}
                  </span>
                </motion.div>

                {/* Micro-indicator dot underneath */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabDot"
                    className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-slate-900"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </IPhoneFrame>
  );
}

