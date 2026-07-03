import React, { useState, useEffect } from 'react';

export default function IPhoneFrame({ children }) {
  const [time, setTime] = useState('');
  const [isIframe, setIsIframe] = useState(false);

  // Clock to show current real time in status bar
  useEffect(() => {
    setIsIframe(window.self !== window.top);

    const updateClock = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      setTime(`${hours}:${minutes}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  if (isIframe) {
    return (
      <div className="w-full h-screen bg-white overflow-hidden relative flex flex-col select-none">
        {/* iOS Status Bar */}
        <div className="w-full h-[47px] px-6 pt-[14px] flex items-center justify-between z-[90] bg-white/95 backdrop-blur text-black font-semibold text-[13px] tracking-wide pointer-events-none select-none">
          {/* Clock */}
          <span className="font-semibold tracking-tight">{time || '9:41'}</span>
          
          {/* Status Icons */}
          <div className="flex items-center gap-1.5">
            {/* Cellular Signal Strength */}
            <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="currentColor">
              <rect x="2" y="16" width="3" height="4" rx="0.5" />
              <rect x="7" y="12" width="3" height="8" rx="0.5" />
              <rect x="12" y="8" width="3" height="12" rx="0.5" />
              <rect x="17" y="4" width="3" height="16" rx="0.5" />
            </svg>

            {/* Wifi Icon */}
            <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h.01" />
              <path d="M5 12.859a10 10 0 0 1 14 0" />
              <path d="M8.5 16.29a5 5 0 0 1 7 0" />
            </svg>

            {/* Battery */}
            <div className="flex items-center">
              <div className="w-[20px] h-[10px] rounded-[3px] border border-black/80 p-[1px] flex items-center">
                <div className="h-full w-[85%] rounded-[1.5px] bg-black" />
              </div>
              <div className="w-[1.5px] h-[4px] rounded-r-[1px] bg-black/80" />
            </div>
          </div>
        </div>

        {/* Render App Internals */}
        <div className="flex-1 w-full overflow-hidden flex flex-col bg-white relative">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans select-none">
      {/* Decorative premium background blur effects */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />

      {/* Title / Brand Header outside the iPhone */}
      <div className="mb-4 text-center z-10">
        <h1 className="text-white text-2xl font-bold tracking-tight">FanLog</h1>
        <p className="text-slate-404 text-xs mt-1 font-medium">Early Sample UI Build • iPhone 15 Mockup</p>
      </div>

      {/* iPhone Bezel */}
      <div className="relative w-[390px] h-[844px] rounded-[52px] bg-slate-900 p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] border-[1px] border-slate-800 ring-[6px] ring-slate-800 ring-offset-4 ring-offset-slate-950 flex flex-col overflow-hidden">
        
        {/* Dynamic Island (Notch) */}
        <div className="absolute top-[16px] left-1/2 -translate-x-1/2 w-[110px] h-[30px] bg-black rounded-full z-[100] flex items-center justify-end px-3 ring-[1px] ring-slate-800/50 shadow-inner">
          {/* Camera lens highlight */}
          <div className="w-[10px] h-[10px] rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center opacity-80 mr-1">
            <div className="w-[3px] h-[3px] rounded-full bg-blue-950" />
          </div>
          {/* Sensor indicator */}
          <div className="w-[4px] h-[4px] rounded-full bg-[#0a0a0a]" />
        </div>

        {/* Screen Content Container */}
        <div className="w-full h-full rounded-[39px] bg-white overflow-hidden relative flex flex-col shadow-inner select-none z-10">
          
          {/* iOS Status Bar */}
          <div className="w-full h-[47px] px-6 pt-[14px] flex items-center justify-between z-[90] bg-white/95 backdrop-blur text-black font-semibold text-[13px] tracking-wide pointer-events-none select-none rounded-t-[39px]">
            {/* Clock */}
            <span className="font-semibold tracking-tight">{time || '9:41'}</span>
            
            {/* Status Icons */}
            <div className="flex items-center gap-1.5">
              {/* Cellular Signal Strength */}
              <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="currentColor">
                <rect x="2" y="16" width="3" height="4" rx="0.5" />
                <rect x="7" y="12" width="3" height="8" rx="0.5" />
                <rect x="12" y="8" width="3" height="12" rx="0.5" />
                <rect x="17" y="4" width="3" height="16" rx="0.5" />
              </svg>

              {/* Wifi Icon */}
              <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h.01" />
                <path d="M5 12.859a10 10 0 0 1 14 0" />
                <path d="M8.5 16.29a5 5 0 0 1 7 0" />
              </svg>

              {/* Battery */}
              <div className="flex items-center">
                <div className="w-[20px] h-[10px] rounded-[3px] border border-black/80 p-[1px] flex items-center">
                  <div className="h-full w-[85%] rounded-[1.5px] bg-black" />
                </div>
                <div className="w-[1.5px] h-[4px] rounded-r-[1px] bg-black/80" />
              </div>
            </div>
          </div>

          {/* Render App Internals */}
          <div className="flex-1 w-full overflow-hidden flex flex-col bg-white relative rounded-b-[39px]">
            {children}
          </div>


          {/* iOS Home Indicator Bar */}
          <div className="absolute bottom-[8px] left-1/2 -translate-x-1/2 w-[130px] h-[5px] bg-black/45 rounded-full z-[100] pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
