import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET all active incidents
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching incidents:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST a new incident
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { latitude, longitude, type, description, severity } = body;

    if (!latitude || !longitude || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('incidents')
      .insert([
        { latitude, longitude, type, description, severity }
      ])
      .select();

    if (error) throw error;

    return NextResponse.json(data[0], { status: 201 });
  } catch (error: any) {
    console.error('Error posting incident:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
