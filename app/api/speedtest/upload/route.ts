import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // We don't need to do anything with the body, just consume it.
  // The request body stream will be consumed implicitly or we can iterate it.
  
  const blob = await request.blob();
  const size = blob.size;

  return NextResponse.json({ received: size, timestamp: Date.now() });
}

