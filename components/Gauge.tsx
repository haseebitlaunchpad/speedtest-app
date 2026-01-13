"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface GaugeProps {
  value: number;
  status: "idle" | "ping" | "download" | "upload" | "completed";
  progress: number; // 0 to 100
}

export default function Gauge({ value, status, progress }: GaugeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // smooth the value for display
  const smoothValue = useSpring(value, { stiffness: 50, damping: 15 });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    return smoothValue.on("change", (latest) => {
      setDisplayValue(latest);
    });
  }, [smoothValue]);

  useEffect(() => {
    smoothValue.set(value);
  }, [value, smoothValue]);

  // Canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) / 2 - 20;

      ctx.clearRect(0, 0, width, height);

      // Draw background arc
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, Math.PI * 0.8, Math.PI * 2.2);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 15;
      ctx.lineCap = "round";
      ctx.stroke();

      // Draw progress arc
      // Map progress 0-100 to angle
      // Start: 0.8 PI, End: 2.2 PI -> Total 1.4 PI
      // But for speed reading, we might want the arc to represent speed (0 to MAX) or just test progress?
      // Usually gauge represents current speed. Let's make the arc represent speed relative to a "max" or logarithmic scale.
      // For now, let's make a "scanner" effect or fill based on something. 
      // Let's use `progress` for the test completion ring, and a separate needle or glow for current speed?
      // Actually, typical speedtests show the speed as the needle.
      
      // Let's assume Max speed is dynamic or fixed (e.g. 100, 1000). 
      // Visualizing Logarithmic scale is better for speed tests.
      const logValue = Math.log10(displayValue + 1); // 0 -> 0, 10 -> 1, 100 -> 2, 1000 -> 3
      const maxLog = 4; // 10000 Mbps
      const fillRatio = Math.min(logValue / maxLog, 1);
      
      const startAngle = Math.PI * 0.8;
      const totalAngle = Math.PI * 1.4;
      const endAngle = startAngle + totalAngle * fillRatio;

      // Gradient for speed
      const gradient = ctx.createLinearGradient(0, height, width, 0);
      gradient.addColorStop(0, "#00f3ff"); // Cyan
      gradient.addColorStop(1, "#bc13fe"); // Purple

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 15;
      ctx.lineCap = "round";
      ctx.stroke();
      
      // Glow effect
      ctx.shadowBlur = 20;
      ctx.shadowColor = "#00f3ff";
      ctx.stroke();
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [displayValue, status]); // Re-run if displayValue changes (or run in loop and read ref/state)

  // Actually, dependency on `displayValue` in `useEffect` will re-trigger effect. 
  // Better to use a valid animation loop that reads a ref, OR just rely on React re-renders if 60fps is not critical, 
  // but for canvas, `requestAnimationFrame` is best. 
  // To avoid effect re-creation, we can use a ref for the value.
  
  return (
    <div className="relative flex flex-col items-center justify-center">
      <canvas 
        ref={canvasRef} 
        width={400} 
        height={400} 
        className="w-[300px] h-[300px] sm:w-[400px] sm:h-[400px]"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="text-5xl sm:text-7xl font-bold tracking-tighter text-white tabular-nums drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
          {displayValue.toFixed(1)}
        </div>
        <div className="text-xl text-gray-400 mt-2">Mbps</div>
        <div className="text-sm text-neon-cyan mt-6 uppercase tracking-widest">{status === 'idle' ? 'Start Test' : status}</div>
      </div>
    </div>
  );
}
