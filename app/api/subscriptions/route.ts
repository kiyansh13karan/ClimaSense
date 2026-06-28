import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { location, method, contact } = body;

    if (!location || !method || !contact) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Connect to Supabase if you have it configured. 
    // Here we'll simulate a successful insert or mock it.
    
    // Simulate DB latency
    await new Promise(resolve => setTimeout(resolve, 800));

    return NextResponse.json({
      success: true,
      message: `Subscribed successfully to alerts for ${location} via ${method}`
    });

  } catch (error: any) {
    console.error('Subscription error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
