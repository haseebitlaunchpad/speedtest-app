import { useState, useRef, useCallback } from 'react';

export type TestStatus = "idle" | "ping" | "download" | "upload" | "completed";

interface SpeedTestResult {
  ping: number | null;
  jitter: number | null;
  download: number | null;
  upload: number | null;
}

export function useSpeedTest() {
  const [status, setStatus] = useState<TestStatus>("idle");
  const [speed, setSpeed] = useState(0); // Current speed in Mbps
  const [progress, setProgress] = useState(0); // 0-100
  const [results, setResults] = useState<SpeedTestResult>({
    ping: null,
    jitter: null,
    download: null,
    upload: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const runPingTest = async (): Promise<{ ping: number; jitter: number }> => {
    const pings: number[] = [];
    const iterations = 10;

    for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        await fetch('/api/speedtest/ping', { cache: 'no-store' });
        const end = performance.now();
        pings.push(end - start);
        await new Promise(r => setTimeout(r, 50)); // small delay
    }

    const minPing = Math.min(...pings);
    const avgPing = pings.reduce((a, b) => a + b, 0) / pings.length;
    
    // Jitter: average deviation from the mean (or standard deviation)
    // Simple jitter = average absolute difference from consecutive pings
    let jitterSum = 0;
    for (let i = 0; i < pings.length - 1; i++) {
        jitterSum += Math.abs(pings[i] - pings[i+1]);
    }
    const jitter = jitterSum / (pings.length - 1);

    return { ping: minPing, jitter }; // use min ping as it's closer to pure network latency
  };

  const runDownloadTest = async (): Promise<number> => {
    const duration = 10000; // 10s test
    const concurrency = 4; // 4 concurrent connections
    const startTime = performance.now();
    let totalBytes = 0;
    
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const downloadStream = async () => {
        while (performance.now() - startTime < duration && !signal.aborted) {
            try {
                const response = await fetch('/api/speedtest/download', { signal });
                if (!response.body) break;
                const reader = response.body.getReader();
                while (true) {
                   const { done, value } = await reader.read();
                   if (done || signal.aborted) break;
                   totalBytes += value.length;
                   
                   // Update instant speed roughly
                   const elapsed = (performance.now() - startTime) / 1000;
                   if (elapsed > 0.5) { // wait a bit to stabilize
                       const mbps = (totalBytes * 8) / (elapsed * 1000 * 1000);
                       setSpeed(mbps);
                       setProgress(Math.min((elapsed / (duration / 1000)) * 100, 100));
                   }
                }
            } catch (e) {
                // ignore abort errors
            }
        }
    };

    const workers = Array(concurrency).fill(null).map(() => downloadStream());
    
    // Wait for time or abort
    await new Promise(resolve => setTimeout(resolve, duration));
    abortControllerRef.current.abort(); // Stop all
    
    // Final calculation
    const elapsed = (performance.now() - startTime) / 1000;
    const mbps = (totalBytes * 8) / (elapsed * 1000 * 1000);
    return mbps;
  };

  const runUploadTest = async (): Promise<number> => {
    const duration = 5000; // 5s test (upload usually shorter/harder)
    const concurrency = 3;
    const startTime = performance.now();
    let totalBytes = 0;
    
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    // Create a 1MB random blob to upload repeatedly
    const chunkSize = 1024 * 1024;
    const buffer = new Uint8Array(chunkSize);
    for(let i=0; i<chunkSize; i++) buffer[i] = Math.random() * 256;
    const blob = new Blob([buffer]);

    const uploadLoop = async () => {
        while (performance.now() - startTime < duration && !signal.aborted) {
             try {
                 await fetch('/api/speedtest/upload', {
                     method: 'POST',
                     body: blob,
                     signal
                 });
                 totalBytes += chunkSize;
                 
                  const elapsed = (performance.now() - startTime) / 1000;
                   if (elapsed > 0.5) {
                       const mbps = (totalBytes * 8) / (elapsed * 1000 * 1000);
                       setSpeed(mbps);
                       setProgress(Math.min((elapsed / (duration / 1000)) * 100, 100));
                   }
             } catch (e) {
                 // ignore
             }
        }
    };

    const workers = Array(concurrency).fill(null).map(() => uploadLoop());
    await new Promise(resolve => setTimeout(resolve, duration));
    abortControllerRef.current.abort();

    const elapsed = (performance.now() - startTime) / 1000;
    const mbps = (totalBytes * 8) / (elapsed * 1000 * 1000);
    return mbps;
  };

  const start = useCallback(async () => {
    if (status !== 'idle' && status !== 'completed') return;

    setStatus('ping');
    setResults({ ping: null, jitter: null, download: null, upload: null });
    setSpeed(0);
    setProgress(0);

    try {
        // Ping
        const { ping, jitter } = await runPingTest();
        setResults(prev => ({ ...prev, ping, jitter }));
        
        // Download
        setStatus('download');
        setSpeed(0);
        setProgress(0);
        const downloadSpeed = await runDownloadTest();
        setResults(prev => ({ ...prev, download: downloadSpeed }));

        // Upload
        setStatus('upload');
        setSpeed(0);
        setProgress(0);
        // Small delay
        await new Promise(r => setTimeout(r, 1000));
        const uploadSpeed = await runUploadTest();
        setResults(prev => ({ ...prev, upload: uploadSpeed }));
        
        setStatus('completed');
        setSpeed(0);
        setProgress(100);

    } catch (e) {
        console.error(e);
        setStatus('completed'); // or error
    }
  }, [status]);

  return { status, speed, progress, results, startTest: start };
}
