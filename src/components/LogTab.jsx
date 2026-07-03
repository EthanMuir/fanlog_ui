import React, { useState } from 'react';
import { TEAMS } from '../data/mockData';
import { Star, CheckCircle2, ChevronDown, Check, ClipboardList, PlusCircle, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LogTab({ pendingGames, loggedGames, onLogGame }) {
  const [subTab, setSubTab] = useState('to-log'); // 'to-log' or 'logged'
  const [selectedGame, setSelectedGame] = useState(null); // Game currently being logged

  // Log Form specific states (for the slide-up sheet)
  const [rating, setRating] = useState(0);
  const [selectedPeriods, setSelectedPeriods] = useState([]);
  const [notes, setNotes] = useState('');
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);

  const team = selectedGame ? TEAMS[selectedGame.teamId] : null;
  const teamColor = team ? team.color : '#000000';

  // Toggle period chip selection
  const handlePeriodToggle = (period) => {
    setSelectedPeriods(prev => {
      if (prev.includes(period)) {
        return prev.filter(p => p !== period);
      } else {
        return [...prev, period];
      }
    });
  };

  // Select all periods helper
  const handleSelectAllPeriods = () => {
    if (selectedPeriods.length === team.periodOptions.length) {
      setSelectedPeriods([]);
    } else {
      setSelectedPeriods([...team.periodOptions]);
    }
  };

  // Submit handler
  const handleSaveLog = (e) => {
    e.preventDefault();
    if (!rating || !selectedGame) return;

    onLogGame(selectedGame.id, rating, notes, selectedPeriods);

    // Trigger visual success overlay
    setShowSuccessOverlay(true);

    // Auto dismiss after 2 seconds, clear local form states, close slide-up sheet
    setTimeout(() => {
      setShowSuccessOverlay(false);
      setSelectedGame(null);
      setRating(0);
      setSelectedPeriods([]);
      setNotes('');
      // Auto redirect to Logged sub-tab to see the history
      setSubTab('logged');
    }, 2000);
  };

  return (
    <div className="flex-1 w-full h-full flex flex-col bg-[#F8FAFC] relative overflow-hidden">
      
      {/* Page Header */}
      <div className="px-5 pt-4 pb-1 bg-white border-b border-slate-50 flex-shrink-0">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Fandom Journal</span>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-none mt-1">Log Center</h2>

        {/* Sub Navigation Tabs */}
        <div className="flex border-t border-slate-100 mt-4">
          <button
            type="button"
            onClick={() => setSubTab('to-log')}
            className={`flex-1 py-3 text-xs font-extrabold text-center border-b-2 transition-all relative ${
              subTab === 'to-log' 
                ? 'border-slate-900 text-slate-900' 
                : 'border-transparent text-slate-400'
            }`}
          >
            To Log ({pendingGames.length})
            {pendingGames.length > 0 && subTab !== 'to-log' && (
              <span className="absolute top-2 right-6 w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setSubTab('logged')}
            className={`flex-1 py-3 text-xs font-extrabold text-center border-b-2 transition-all ${
              subTab === 'logged' 
                ? 'border-slate-900 text-slate-900' 
                : 'border-transparent text-slate-400'
            }`}
          >
            Logged ({loggedGames.length})
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-5">
        
        {/* SUB TAB: TO LOG */}
        {subTab === 'to-log' && (
          <div className="space-y-3.5">
            {pendingGames.length === 0 ? (
              <div className="text-center py-14 bg-white rounded-2xl border border-slate-100 shadow-sm px-6">
                <CheckCircle2 size={38} className="text-emerald-500 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-800">All caught up!</h3>
                <p className="text-xs text-slate-400 font-medium mt-1">
                  You logged all recent games played by your favorite teams.
                </p>
              </div>
            ) : (
              pendingGames.map((game) => {
                const team = TEAMS[game.teamId];
                return (
                  <motion.div
                    key={game.id}
                    layoutId={`game-${game.id}`}
                    className="bg-white rounded-xl p-4 border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.01)] hover:border-slate-200 transition-colors flex items-center justify-between cursor-pointer"
                    onClick={() => {
                      setSelectedGame(game);
                      setSelectedPeriods([...team.periodOptions]); // Default select all periods
                    }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center p-1.5 flex-shrink-0">
                        <img src={team.logo} alt="" className="w-7 h-7 object-contain" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                            {team.league}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">{game.date}</span>
                        </div>
                        <h4 className="text-xs font-extrabold text-slate-900 tracking-tight leading-tight mt-1">
                          {team.shortName} vs {game.opponent.shortName}
                        </h4>
                        <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                          {game.scoreText}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="px-3.5 py-2 rounded-lg text-[10px] font-extrabold text-white flex items-center gap-1 flex-shrink-0"
                      style={{ backgroundColor: team.color }}
                    >
                      <PlusCircle size={12} /> Log
                    </button>
                  </motion.div>
                );
              })
            )}
          </div>
        )}

        {/* SUB TAB: LOGGED HISTORY */}
        {subTab === 'logged' && (
          <div className="space-y-3.5">
            {loggedGames.length === 0 ? (
              <div className="text-center py-14 bg-white rounded-2xl border border-slate-100 shadow-sm px-6">
                <ClipboardList size={38} className="text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-800">No logs yet</h3>
                <p className="text-xs text-slate-400 font-medium mt-1">
                  Log your first game to record stars and analysis!
                </p>
              </div>
            ) : (
              loggedGames.map((log) => {
                const team = TEAMS[log.teamId];
                return (
                  <motion.div 
                    key={log.id} 
                    layoutId={`logged-${log.id}`}
                    className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm"
                  >
                    {/* Log Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center p-0.5">
                          <img src={team.logo} alt="" className="w-4 h-4 object-contain" />
                        </div>
                        <span className="text-xs font-bold text-slate-850 leading-none">
                          {team.shortName} vs {log.opponentName.split(' ').pop()}
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400">{log.date}</span>
                    </div>

                    {/* Rating & periods info */}
                    <div className="flex items-center gap-3 mb-2.5">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star 
                            key={s} 
                            size={10} 
                            fill={s <= log.rating ? team.color : 'none'} 
                            color={s <= log.rating ? team.color : '#E2E8F0'} 
                          />
                        ))}
                      </div>
                      <span className="w-1 h-1 rounded-full bg-slate-200" />
                      <span className="text-[9px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-full">
                        {log.timeSpent === team.periodOptions.join(', ') ? 'Full Game' : log.timeSpent}
                      </span>
                    </div>

                    {/* Commentary */}
                    {log.notes && (
                      <p className="text-xs font-normal text-slate-600 leading-relaxed bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                        {log.notes}
                      </p>
                    )}
                  </motion.div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* FORM MODAL SLIDE-UP SHEET */}
      <AnimatePresence>
        {selectedGame && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="absolute inset-0 bg-white z-[110] flex flex-col overflow-hidden"
          >
            {/* Modal Header */}
            <div 
              className="px-4 py-4 flex items-center justify-between text-white flex-shrink-0 select-none"
              style={{ backgroundColor: teamColor }}
            >
              <button 
                type="button"
                onClick={() => setSelectedGame(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 active:scale-95 transition-all"
              >
                <ArrowLeft size={16} strokeWidth={2.5} />
              </button>

              <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest leading-none">Journal Review</span>
                <h3 className="text-xs font-extrabold mt-1 tracking-tight leading-none">
                  {team.shortName} vs {selectedGame.opponent.shortName}
                </h3>
              </div>

              {/* Logo in top right */}
              <div className="w-8 h-8 rounded-full bg-white/15 p-1 flex items-center justify-center">
                <img src={team.logo} alt="" className="w-6 h-6 object-contain" />
              </div>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveLog} className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-4 bg-slate-50">
              
              {/* Locked Game Summary Card */}
              <div className="bg-white border border-slate-100 rounded-xl p-3.5 shadow-sm flex items-center justify-between select-none">
                <div className="flex items-center gap-2">
                  <img src={team.logo} alt="" className="w-8 h-8 object-contain" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 leading-tight">Match Played</h4>
                    <span className="text-[10px] font-medium text-slate-400 mt-0.5 block">{selectedGame.scoreText}</span>
                  </div>
                </div>
                <div className="flex -space-x-1.5">
                  <img src={team.logo} alt="" className="w-5 h-5 object-contain bg-white rounded-full p-0.5 border border-slate-100" />
                  <img src={selectedGame.opponent.logo} alt="" className="w-5 h-5 object-contain bg-white rounded-full p-0.5 border border-slate-100" />
                </div>
              </div>

              {/* Game Rating stars */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider pl-1">Match Rating</label>
                <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex items-center justify-center gap-2.5">
                  {[1, 2, 3, 4, 5].map((val) => {
                    const isFilled = val <= rating;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setRating(val)}
                        className="p-1 focus:outline-none transition-transform hover:scale-110 active:scale-95"
                      >
                        <Star
                          size={30}
                          strokeWidth={2}
                          className="transition-colors"
                          fill={isFilled ? teamColor : 'none'}
                          color={isFilled ? teamColor : '#CBD5E1'}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic period chip selector */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                    {team.periodLabel}
                  </label>
                  <button
                    type="button"
                    onClick={handleSelectAllPeriods}
                    className="text-[10px] font-extrabold hover:text-slate-900 transition-colors uppercase tracking-wider"
                    style={{ color: teamColor }}
                  >
                    {selectedPeriods.length === team.periodOptions.length ? 'Clear All' : 'Select All'}
                  </button>
                </div>

                <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                  <div className="grid grid-cols-4 gap-2">
                    {team.periodOptions.map((period) => {
                      const isActive = selectedPeriods.includes(period);
                      return (
                        <button
                          key={period}
                          type="button"
                          onClick={() => handlePeriodToggle(period)}
                          className="py-2.5 rounded-lg border text-xs font-bold text-center transition-all focus:outline-none select-none"
                          style={{
                            borderColor: isActive ? teamColor : '#F1F5F9',
                            backgroundColor: isActive ? `${teamColor}12` : '#F8FAFC',
                            color: isActive ? teamColor : '#475569'
                          }}
                        >
                          {period}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider pl-1">Review Comments</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Enter notes, highlight plays, thoughts on the game, etc..."
                  className="w-full bg-white border border-slate-100 focus:border-slate-350 shadow-sm rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-0 transition-colors resize-none leading-relaxed"
                />
              </div>

              {/* Submit Action */}
              <button
                type="submit"
                disabled={!rating}
                className="w-full py-3.5 rounded-xl font-bold text-xs text-white shadow-sm flex items-center justify-center transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none mt-2"
                style={{ backgroundColor: teamColor }}
              >
                Log Game Review
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FULL SCREEN CONFIRMATION OVERLAY */}
      <AnimatePresence>
        {showSuccessOverlay && selectedGame && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/95 backdrop-blur z-[120] flex flex-col items-center justify-center px-6"
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: 'spring', damping: 15, stiffness: 200 }}
              className="flex flex-col items-center text-center space-y-4"
            >
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
                style={{ backgroundColor: `${teamColor}15` }}
              >
                <CheckCircle2 size={44} style={{ color: teamColor }} strokeWidth={2.2} />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Review Saved!</h3>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                  Your entry for {team.shortName} vs {selectedGame.opponent.shortName} is now in your logs history.
                </p>
              </div>

              {/* Small details */}
              <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3.5 w-64 text-left space-y-1.5 mt-2 select-none">
                <div className="flex items-center gap-1.5">
                  <img src={team.logo} alt="" className="w-4 h-4 object-contain" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{team.shortName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-800">Rating Given</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: rating }).map((_, i) => (
                      <Star key={i} size={10} fill={teamColor} color={teamColor} />
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center text-[10px] font-medium text-slate-500">
                  <span>Sections Watched</span>
                  <span className="font-semibold text-slate-700">
                    {selectedPeriods.length === team.periodOptions.length ? 'Full Game' : selectedPeriods.join(', ') || 'None'}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
