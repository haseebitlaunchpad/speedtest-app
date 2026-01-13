import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Parse size from query param, default to 10MB chunks if not specified
  // But usually we just stream until client aborts
  
  const stream = new ReadableStream({
    start(controller) {
      // Create a 1MB chunk of random data
      const chunkSize = 1024 * 1024;
      const buffer = new Uint8Array(chunkSize);
      for (let i = 0; i < chunkSize; i++) {
        buffer[i] = Math.floor(Math.random() * 256);
      }

      // Enqueue chunks indefinitely until canceled
      // For a speed test, we want to saturate the link.
      // We'll queue up to a certain amount? Or just keep pushing?
      // Browsers handle backpressure.
      
      function push() {
        // Enqueue 1MB
        controller.enqueue(buffer);
        // Continue
        // We might want to limit total size to avoid abuse, e.g. 100MB per request limit
        // checking controller.desiredSize might be good
      }
      
      // Basic loop to push data
      // We rely on the client to close the connection or a timeout
      const fastPush = setInterval(() => {
         try {
             controller.enqueue(buffer);
         } catch (e) {
             clearInterval(fastPush);
         }
      }, 0); // As fast as possible
      
      // Safety timeout 15s
      setTimeout(() => {
          clearInterval(fastPush);
          try { controller.close(); } catch(e){}
      }, 15000);
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    },
  });
}
