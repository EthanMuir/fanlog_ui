import React, { useState, useEffect } from 'react';
import { MOCK_PROFILE, TEAMS } from '../data/mockData';
import { Trophy, Clock, Calendar } from 'lucide-react';
import { motion, animate } from 'framer-motion';

export default function ProfileTab({ loggedGames }) {
  const { user, fandomIndex, stats } = MOCK_PROFILE;

  // Animation progress state for the concentric arc bars
  const [animProgress, setAnimProgress] = useState(0);

  useEffect(() => {
    // Animate progress smoothly on mount
    const controls = animate(0, 1, {
      duration: 1.5,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setAnimProgress(latest)
    });
    return () => controls.stop();
  }, []);

  // Recalculating totals based on dynamic logs state
  const totalGames = stats.gamesWatched + (loggedGames.length - 3); // Adjust offset from baseline
  const totalHours = stats.hoursWatched + (loggedGames.length - 3) * 2; // Estimate 2 hours per logged game
  const loggedThisMonth = stats.gamesLoggedThisMonth + (loggedGames.length - 3);

  // Deriving active favorite team details
  const topTeamId = fandomIndex[0].teamId;
  const topTeam = TEAMS[topTeamId];

  // Concentric arc layout parameters
  const radii = [130, 108, 86, 64, 42]; // Radii for all 5 favorite teams
  const cx = 150;
  const cy = 160;

  // Unified FanLog score is the average of the active fandom index scores
  const averageScore = Math.round(
    fandomIndex.reduce((sum, item) => sum + item.score, 0) / fandomIndex.length
  );

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-8 pt-2 bg-[#F8FAFC]">
      
      {/* Compact Profile Header */}
      <div className="flex items-center gap-3 mt-3 mb-4 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm select-none">
        <img 
          src={user.avatar} 
          alt={user.name} 
          className="w-12 h-12 rounded-full object-cover border border-slate-200 bg-slate-50 flex-shrink-0" 
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <h2 className="text-sm font-extrabold text-slate-900 tracking-tight leading-tight truncate">
              {user.name}
            </h2>
          </div>
          <span className="text-[10px] font-semibold text-slate-400 block mt-0.5">{user.handle}</span>
        </div>
        
        {/* Compact favorite team indicator chips (fixed invalid Tailwind w-5.5 sizing) */}
        <div className="flex items-center -space-x-1.5 ml-2 flex-shrink-0">
          {user.favorites.map((favId) => {
            const team = TEAMS[favId];
            return (
              <img 
                key={favId}
                src={team.logo} 
                alt="" 
                title={team.name}
                className="w-5 h-5 object-contain bg-white rounded-full p-0.5 border border-slate-100" 
              />
            );
          })}
        </div>
      </div>

      {/* SPORTS IDENTITY CARD FROM LANDING PAGE */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm mb-5 relative flex flex-col items-center">
        
        {/* Card Top Branding Header */}
        <div className="w-full flex items-center justify-between border-b border-slate-50 pb-2 mb-2 select-none">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-900 animate-pulse" />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">FANLOG PROFILE</span>
          </div>
          <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wide leading-none`} style={{ color: topTeam.color, backgroundColor: `${topTeam.color}18` }}>
            {topTeam.shortName} Elite Fan
          </span>
        </div>

        {/* Dynamic Concentric Dial Chart */}
        <div className="relative w-full max-w-[260px] aspect-[300/180] flex justify-center mt-1 select-none border-b border-slate-50 pb-4">
          <svg viewBox="0 0 300 180" className="w-full h-full block">
            {/* Loop through each favorite team's score in the index */}
            {fandomIndex.map((item, idx) => {
              const team = TEAMS[item.teamId];
              const r = radii[idx];
              const C = 2 * Math.PI * r;
              const halfC = Math.PI * r;

              // Calculate active stroke length (L) using animation progress coefficient
              const currentScore = item.score * animProgress;
              const L = (currentScore / 100) * halfC;

              // Determine coordinates at the tip/end of the arc
              const angle = Math.PI * (1 - currentScore / 100);
              const badgeX = cx + r * Math.cos(angle);
              const badgeY = cy - r * Math.sin(angle);

              return (
                <g key={item.teamId}>
                  {/* Semicircular Backing Track */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={r}
                    fill="none"
                    stroke="rgba(15, 23, 42, 0.03)"
                    strokeWidth="8"
                    strokeDasharray={`${halfC} ${C}`}
                    transform={`rotate(180, ${cx}, ${cy})`}
                    strokeLinecap="round"
                  />

                  {/* Filled Arc Segment */}
                  {item.score > 0 && (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={r}
                      fill="none"
                      stroke={team.color}
                      strokeWidth="8"
                      strokeDasharray={`${L} ${C - L}`}
                      transform={`rotate(180, ${cx}, ${cy})`}
                      strokeLinecap="round"
                    />
                  )}

                  {/* Circular White Badge Background + Logo at end of arc */}
                  {item.score > 0 && animProgress > 0.05 && (
                    <g>
                      <circle
                        cx={badgeX}
                        cy={badgeY}
                        r="9.5"
                        fill="#ffffff"
                        stroke={team.color}
                        strokeWidth="1.5"
                        style={{ filter: 'drop-shadow(0px 1.5px 3px rgba(0,0,0,0.15))' }}
                      />
                      <image
                        x={badgeX - 6.5}
                        y={badgeY - 6.5}
                        width="13"
                        height="13"
                        href={team.logo}
                      />
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Centralized Core FanLog Score display */}
          <div className="absolute left-1/2 bottom-[14px] -translate-x-1/2 text-center pointer-events-none select-none">
            <motion.span 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-black tracking-tighter text-slate-900 leading-none block font-mono"
            >
              {Math.round(averageScore * animProgress)}
            </motion.span>
            <span className="text-[7.5px] font-bold text-slate-400 tracking-wider uppercase block mt-0.5">
              FANLOG SCORE
            </span>
          </div>
        </div>

        {/* Clean, spacious vertical legend list (replaces the crowded grid and metadata blocks) */}
        <div className="w-full space-y-2.5 pt-4 select-none">
          {fandomIndex.map((item) => {
            const team = TEAMS[item.teamId];
            return (
              <div key={item.teamId} className="flex items-center justify-between text-xs">
                {/* Team Info */}
                <div className="flex items-center gap-2 min-w-0">
                  <img src={team.logo} alt="" className="w-5 h-5 object-contain flex-shrink-0" />
                  <span className="font-extrabold text-slate-800 truncate text-[11px]">{team.name}</span>
                </div>
                {/* Visual Progress Bar & Score value */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-300" 
                      style={{ width: `${item.score * animProgress}%`, backgroundColor: team.color }} 
                    />
                  </div>
                  <span className="font-black text-slate-950 w-5 text-right text-[11px] font-mono leading-none">
                    {Math.round(item.score * animProgress)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        
      </div>

      {/* Statistics Grid */}
      <div className="mb-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 px-1 select-none">Statistics</span>
        <div className="grid grid-cols-2 gap-3 select-none">
          
          {/* Tile 1: Games Watched */}
          <div className="bg-white border border-slate-100 rounded-xl p-3.5 shadow-sm flex flex-col justify-between">
            <Trophy size={16} className="text-slate-400 mb-2" />
            <div>
              <span className="text-lg font-black text-slate-900 tracking-tight leading-none block">{totalGames}</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mt-1 block">Games Watched</span>
            </div>
          </div>

          {/* Tile 2: Hours Watched */}
          <div className="bg-white border border-slate-100 rounded-xl p-3.5 shadow-sm flex flex-col justify-between">
            <Clock size={16} className="text-slate-400 mb-2" />
            <div>
              <span className="text-lg font-black text-slate-900 tracking-tight leading-none block">{totalHours}h</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mt-1 block">Total Hours</span>
            </div>
          </div>

          {/* Tile 3: Logs This Month */}
          <div className="bg-white border border-slate-100 rounded-xl p-3.5 shadow-sm flex flex-col justify-between">
            <Calendar size={16} className="text-slate-400 mb-2" />
            <div>
              <span className="text-lg font-black text-slate-900 tracking-tight leading-none block">{loggedThisMonth}</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mt-1 block">Logged This Month</span>
            </div>
          </div>

          {/* Tile 4: Favorite Team */}
          <div className="bg-white border border-slate-100 rounded-xl p-3.5 shadow-sm flex flex-col justify-between">
            <div className="w-5 h-5 rounded-full bg-slate-50 flex items-center justify-center p-0.5 border border-slate-100 mb-2">
              <img src={topTeam.logo} alt="" className="w-3.5 h-3.5 object-contain" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-slate-900 tracking-tight leading-none truncate block">{topTeam.shortName}</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mt-1 block">Fandom Leader</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
