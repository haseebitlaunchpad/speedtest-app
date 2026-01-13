"use client";

import React, { useEffect } from 'react';

interface AdUnitProps {
  slotId?: string; // Optional: specific slot ID from AdSense
  format?: 'auto' | 'fluid' | 'rectangle';
  className?: string;
}

export default function AdUnit({ slotId, format = 'auto', className = "" }: AdUnitProps) {
  useEffect(() => {
    // This pushes the ad to Google's queue when the component mounts
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error("AdSense error", err);
    }
  }, []);

  // REPLACE THIS WITH YOUR REAL PUBLISHER ID (e.g., ca-pub-1234567890)
  // You can find this in your Google AdSense account.
  const PUBLISHER_ID = "ca-pub-XXXXXXXXXXXXXXX"; 

  // If you don't have a specific slotId yet, this placeholder just shows a box.
  // Once you get your code, uncomment the <ins> block below and remove the placeholder div.

  return (
    <div className={`overflow-hidden rounded-xl border border-dashed border-white/10 bg-black/20 flex items-center justify-center text-gray-600 ${className}`}>
        
        {/* --- PASTE YOUR AD CODE BELOW THIS LINE --- */}
        
        <div className="text-center p-4">
            <p className="text-xs uppercase tracking-widest mb-2 font-bold">Ad Space</p>
            <p className="text-[10px] text-gray-500">
                Put your AdSense code in <br/> 
                <code>components/AdUnit.tsx</code>
            </p>
        </div>

        {/* Example AdSense Code (Uncomment and fill in details): */}
        {/* 
        <ins className="adsbygoogle"
             style={{ display: 'block', width: '100%', height: '100%' }}
             data-ad-client={PUBLISHER_ID}
             data-ad-slot={slotId || "1234567890"}
             data-ad-format={format}
             data-full-width-responsive="true"></ins> 
        */}

    </div>
  );
}
