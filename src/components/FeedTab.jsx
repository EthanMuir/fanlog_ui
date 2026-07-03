import React, { useState } from 'react';
import { MOCK_FEED, TEAMS } from '../data/mockData';
import { Heart, MessageSquare, ExternalLink, Play } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FeedTab({ onJoinChat }) {
  const [feed, setFeed] = useState(MOCK_FEED);
  const [selectedTeamFilter, setSelectedTeamFilter] = useState('all');

  // Toggle like handler for feed cards
  const handleLike = (id) => {
    setFeed(prev => prev.map(item => {
      if (item.id === id) {
        const isLiked = item.userLiked;
        return {
          ...item,
          userLiked: !isLiked,
          likes: isLiked ? (item.likes || 1) - 1 : (item.likes || 0) + 1
        };
      }
      return item;
    }));
  };

  // Filter feed items based on selected team chip
  const filteredFeed = selectedTeamFilter === 'all'
    ? feed
    : feed.filter(item => item.teamId === selectedTeamFilter);

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-8 pt-2 bg-[#F8FAFC]">
      {/* Header section */}
      <div className="mb-4 mt-2">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Your Feed</span>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-none mt-1">Matchday Updates</h2>
      </div>

      {/* Horizontal scrolling Team Filters */}
      <div className="flex flex-row flex-nowrap items-center gap-2 overflow-x-auto whitespace-nowrap pb-3 select-none flex-shrink-0 w-full custom-scrollbar scrolling-touch">
        <button
          type="button"
          onClick={() => setSelectedTeamFilter('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex-shrink-0 ${
            selectedTeamFilter === 'all'
              ? 'bg-slate-950 text-white shadow-sm'
              : 'bg-white text-slate-500 border border-slate-100 hover:border-slate-200'
          }`}
        >
          All Teams
        </button>
        {Object.keys(TEAMS).map((key) => {
          const t = TEAMS[key];
          const isActive = selectedTeamFilter === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedTeamFilter(key)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all flex-shrink-0 ${
                isActive
                  ? 'text-white border-transparent'
                  : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200'
              }`}
              style={isActive ? { backgroundColor: t.color } : {}}
            >
              <img src={t.logo} alt="" className="w-4 h-4 object-contain filter drop-shadow-sm" />
              <span>{t.shortName}</span>
            </button>
          );
        })}
      </div>

      {filteredFeed.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 shadow-sm mt-2 px-6">
          <p className="text-sm font-medium text-slate-400">No recent updates for this team.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFeed.map((item) => {
            const team = TEAMS[item.teamId];
            const teamColor = team ? team.color : '#000000';

            // Content type: LIVE SCORE
            if (item.type === 'live-score') {
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative"
                  style={{ borderLeft: `4px solid ${teamColor}` }}
                >
                  {/* Header info */}
                  <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-slate-50">
                    <div className="flex items-center gap-2">
                      <img src={team.logo} alt={team.name} className="w-5 h-5 object-contain" />
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">{team.shortName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-red-50 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600 live-pulse"></span>
                      <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">LIVE</span>
                    </div>
                  </div>

                  {/* Score section */}
                  <div className="px-5 py-4">
                    <div className="flex items-center justify-between gap-4">
                      {/* Favorite Team */}
                      <div className="flex flex-col items-center flex-1">
                        <img src={team.logo} alt={team.name} className="w-11 h-11 object-contain mb-1.5 filter drop-shadow-sm" />
                        <span className="text-xs font-semibold text-slate-900 text-center line-clamp-1">{team.shortName}</span>
                      </div>

                      {/* Scores */}
                      <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center gap-4 text-3xl font-extrabold text-slate-900 tracking-tight">
                          <span>{item.score.team}</span>
                          <span className="text-slate-350 text-xl font-normal">:</span>
                          <span>{item.score.opponent}</span>
                        </div>
                        <span className="text-[11px] font-medium text-slate-400 mt-1">{item.liveStatus}</span>
                      </div>

                      {/* Opponent */}
                      <div className="flex flex-col items-center flex-1">
                        <img src={item.opponent.logo} alt={item.opponent.name} className="w-11 h-11 object-contain mb-1.5 filter drop-shadow-sm" />
                        <span className="text-xs font-semibold text-slate-900 text-center line-clamp-1">{item.opponent.shortName}</span>
                      </div>
                    </div>

                    {/* Highlights or commentary */}
                    <div className="mt-4 p-3 bg-slate-50/65 rounded-xl border border-slate-100/50">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Latest Event</span>
                      <p className="text-xs font-medium text-slate-700 leading-normal">{item.recentPlay}</p>
                    </div>

                    {/* Join Chat Button */}
                    <button 
                      type="button"
                      onClick={() => onJoinChat(item.id)}
                      className="flex items-center justify-center gap-1.5 w-full mt-3 py-2.5 px-4 rounded-xl text-xs font-extrabold text-white transition-all hover:opacity-90 active:scale-[0.98] shadow-sm select-none animate-pulse"
                      style={{ backgroundColor: teamColor }}
                    >
                      <MessageSquare size={13} fill="none" strokeWidth={3} /> Join Live Match Chat
                    </button>
                  </div>
                </motion.div>
              );
            }

            // Content type: GAME RECAP
            if (item.type === 'game-recap') {
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 }}
                  className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
                  style={{ borderLeft: `4px solid ${teamColor}` }}
                >
                  {/* Header */}
                  <div className="px-5 pt-4 pb-2.5 flex items-center justify-between border-b border-slate-50">
                    <div className="flex items-center gap-2">
                      <img src={team.logo} alt={team.name} className="w-5 h-5 object-contain" />
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{team.league} • Game Recap</span>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">{item.timestamp}</span>
                  </div>

                  {/* Body */}
                  <div className="px-5 py-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex -space-x-2">
                        <img src={team.logo} alt={team.name} className="w-7 h-7 object-contain bg-white rounded-full p-0.5 border border-slate-100" />
                        <img src={item.opponent.logo} alt={item.opponent.name} className="w-7 h-7 object-contain bg-white rounded-full p-0.5 border border-slate-100" />
                      </div>
                      <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-full">{item.resultText}</span>
                    </div>

                    <h3 className="text-sm font-extrabold text-slate-900 leading-snug tracking-tight mb-2">
                      {item.headline}
                    </h3>

                    <p className="text-xs font-normal text-slate-600 leading-relaxed mb-4">
                      {item.summary}
                    </p>

                    {/* Micro-table stats chart */}
                    <div className="space-y-2 border-t border-b border-slate-50 py-3 mb-3">
                      <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                        <span>{team.shortName}</span>
                        <span>Stats Comparison</span>
                        <span>{item.opponent.shortName}</span>
                      </div>

                      {item.stats.map((stat, idx) => {
                        const total = stat.team + stat.opponent;
                        const teamPct = total > 0 ? (stat.team / total) * 100 : 50;
                        return (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-xs font-medium text-slate-700 px-1">
                              <span>{stat.team}</span>
                              <span className="text-[10px] text-slate-400 uppercase tracking-normal">{stat.label}</span>
                              <span>{stat.opponent}</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full flex overflow-hidden">
                              <div className="h-full rounded-l-full" style={{ width: `${teamPct}%`, backgroundColor: teamColor }} />
                              <div className="h-full rounded-r-full bg-slate-300" style={{ width: `${100 - teamPct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-medium">
                      <span className="flex items-center gap-1">
                        Source: <strong className="text-slate-600">{item.source}</strong>
                      </span>
                      <button className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors">
                        <Play size={11} fill="currentColor" /> Watch Highlights
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            }

            // Content type: NEWS
            if (item.type === 'news') {
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
                  style={{ borderLeft: `4px solid ${teamColor}` }}
                >
                  <div className="px-5 pt-4 pb-2.5 flex items-center justify-between border-b border-slate-50">
                    <div className="flex items-center gap-2">
                      <img src={team.logo} alt={team.name} className="w-5 h-5 object-contain" />
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{team.league} • Trending News</span>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">{item.timestamp}</span>
                  </div>

                  <div className="px-5 py-4">
                    <h3 className="text-sm font-extrabold text-slate-900 leading-snug tracking-tight mb-1.5">
                      {item.headline}
                    </h3>
                    <p className="text-xs font-normal text-slate-600 leading-relaxed line-clamp-2">
                      {item.preview}
                    </p>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        via {item.source}
                      </span>

                      <div className="flex items-center gap-4">
                        {/* Interactive Heart */}
                        <button 
                          onClick={() => handleLike(item.id)}
                          className={`flex items-center gap-1.5 transition-all text-xs font-medium ${item.userLiked ? 'text-red-500 scale-105' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                          <Heart size={14} fill={item.userLiked ? 'currentColor' : 'none'} strokeWidth={2} />
                          <span>{item.likes}</span>
                        </button>

                        {/* Comments icon */}
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                          <MessageSquare size={14} strokeWidth={2} />
                          <span>{item.comments}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            }

            // Content type: BASIC SCORE
            if (item.type === 'score') {
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.15 }}
                  className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
                  style={{ borderLeft: `4px solid ${teamColor}` }}
                >
                  <div className="px-5 pt-4 pb-2.5 flex items-center justify-between border-b border-slate-50">
                    <div className="flex items-center gap-2">
                      <img src={team.logo} alt={team.name} className="w-5 h-5 object-contain" />
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{team.league} • Match Outcome</span>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">{item.timestamp}</span>
                  </div>

                  <div className="px-5 py-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex -space-x-1.5">
                        <img src={team.logo} alt={team.name} className="w-6 h-6 object-contain bg-white rounded-full p-0.5 border border-slate-100" />
                        <img src={item.opponent.logo} alt={item.opponent.name} className="w-6 h-6 object-contain bg-white rounded-full p-0.5 border border-slate-100" />
                      </div>
                      <span className="text-xs font-extrabold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-full">{item.resultText}</span>
                    </div>

                    <h3 className="text-xs font-bold text-slate-850 leading-relaxed mb-3">
                      {item.headline}
                    </h3>

                    <div className="flex justify-between items-center text-[10px] text-slate-450 border-t border-slate-50 pt-2.5">
                      <span>Source: {item.source}</span>
                      <button className="flex items-center gap-0.5 text-blue-600 hover:text-blue-800 font-bold uppercase tracking-wider">
                        Match Center <ExternalLink size={10} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            }

            return null;
          })}
        </div>
      )}
    </div>
  );
}
