"use client";

import { useSpeedTest } from "@/hooks/useSpeedTest";
import Gauge from "@/components/Gauge";
import AdUnit from "@/components/AdUnit";
import { Play, RotateCcw, Globe, User, Server, Wifi } from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
  const { status, speed, progress, results, startTest } = useSpeedTest();
  
  // Extract results for display, defaulting to null if not available
  const { ping, jitter, download, upload } = results;

  const [clientInfo, setClientInfo] = useState<{ ip: string; isp: string; location: string } | null>(null);

  useEffect(() => {
    // Fetch Client IP and ISP info
    // We use a free IP API for the ISP name since we can't easily resolve it locally without a DB
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        setClientInfo({
          ip: data.ip,
          isp: data.org || data.asn,
          location: `${data.city}, ${data.country_name}`
        });
      })
      .catch(() => {
         // Fallback if adblocker blocks ipapi
         fetch('/api/whoami').then(res => res.json()).then(data => {
             setClientInfo({ ip: data.ip, isp: "Unknown ISP", location: "Unknown Location" });
         });
      });
  }, []);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-24 relative overflow-hidden">
      
      {/* Background Elements */}
      <div className="absolute w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] -top-20 -left-20 animate-pulse" />
      <div className="absolute w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] -bottom-20 -right-20 animate-pulse" />

      {/* Header */}
      <div className="z-10 w-full max-w-6xl items-center justify-between font-mono text-sm flex mb-8">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-lg flex items-center justify-center font-bold text-white text-lg">S</div>
           <span className="text-xl font-bold tracking-wider text-white">SPEEDTEST<span className="text-neon-cyan">PRO</span></span>
        </div>
      </div>

      <div className="z-10 w-full max-w-6xl flex flex-col md:flex-row gap-12 items-center md:items-start justify-center">
        
        {/* Left Panel: Connections Info (Desktop) */}
        <div className="hidden md:flex flex-col gap-8 w-64 pt-10">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 text-gray-400 mb-1">
                    <div className="p-2 rounded-full border border-gray-700"><Wifi size={16} /></div>
                    <span className="uppercase tracking-widest text-xs font-bold">Connections</span>
                </div>
                <div className="text-lg font-bold text-white pl-12">Multi</div>
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 text-gray-400 mb-1">
                    <div className="p-2 rounded-full border border-gray-700"><Globe size={16} /></div>
                     <span className="uppercase tracking-widest text-xs font-bold">Server</span>
                </div>
                <div className="pl-12">
                    <div className="text-lg font-bold text-neon-cyan truncate">Optimal Server</div>
                    <div className="text-sm text-gray-500">Auto-Selected</div>
               </div>
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 text-gray-400 mb-1">
                    <div className="p-2 rounded-full border border-gray-700"><User size={16} /></div>
                     <span className="uppercase tracking-widest text-xs font-bold">Provider</span>
                </div>
                <div className="pl-12">
                    <div className="text-lg font-bold text-white truncate">{clientInfo?.isp || "..."}</div>
                    <div className="text-sm text-gray-500">{clientInfo?.ip || "Loading..."}</div>
                    <div className="text-xs text-gray-600 mt-1">{clientInfo?.location}</div>
                </div>
            </div>
        </div>

        {/* Center: Gauge & Stats */}
        <div className="flex flex-col items-center flex-1">
             {/* Main Gauge Area */}
            <div className="flex flex-col items-center justify-center w-full gap-8">
                
                <Gauge value={speed} status={status} progress={progress} />
                
                {/* Controls */}
                <div className="mt-8">
                {(status === 'idle' || status === 'completed') && (
                    <button 
                    onClick={startTest}
                    className="group relative px-12 py-4 bg-transparent overflow-hidden rounded-full transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                    <div className="absolute inset-0 border border-neon-cyan rounded-full box-neon opacity-100 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 bg-neon-cyan/10 rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity" />
                    <div className="relative flex items-center gap-3 text-neon-cyan font-bold text-xl tracking-widest">
                        {status === 'completed' ? <RotateCcw size={24} /> : <Play size={24} />}
                        {status === 'completed' ? "RESTART" : "GO"}
                    </div>
                    </button>
                )}
                </div>

                {/* Info Block for Mobile (Visible only on small screens) */}
                <div className="md:hidden flex flex-col gap-4 w-full bg-white/5 p-4 rounded-xl text-center">
                    <div>
                        <div className="text-xs text-gray-500 uppercase">Provider</div>
                        <div className="text-white font-bold">{clientInfo?.isp || "Loading..."}</div>
                        <div className="text-xs text-gray-500">{clientInfo?.ip}</div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mt-8 bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
                <StatBox label="PING" value={ping} unit="ms" />
                <StatBox label="JITTER" value={jitter} unit="ms" />
                <StatBox label="DOWNLOAD" value={download} unit="Mbps" highlightColor="text-neon-cyan" />
                <StatBox label="UPLOAD" value={upload} unit="Mbps" highlightColor="text-neon-purple" />
                </div>

            </div>
        </div>

        {/* Right Panel: Placeholder for balance or Ads */}
        <AdUnit className="hidden xl:flex w-64 h-[400px]" slotId="SIDEBAR_SLOT_ID" />

      </div>

      {/* Footer / Ads Space */}
      <AdUnit className="mt-20 w-full max-w-5xl h-32" slotId="FOOTER_SLOT_ID" />
    </main>
  );
}

function StatBox({ label, value, unit, highlightColor = "text-white" }: { label: string, value: number | null, unit: string, highlightColor?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-black/20">
      <div className="text-xs text-gray-400 mb-1 tracking-wider">{label}</div>
      <div className={`text-2xl sm:text-3xl font-bold tabular-nums ${value !== null ? highlightColor : 'text-gray-600'}`}>
        {value !== null ? value.toFixed(value % 1 === 0 ? 0 : 1) : '-'}
      </div>
      <div className="text-xs text-gray-500">{unit}</div>
    </div>
  )
}
