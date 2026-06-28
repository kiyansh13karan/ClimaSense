import { NextRequest, NextResponse } from 'next/server';
import { handlePreflight, withCors, sanitizeMessage } from '@/lib/api-security';
import type { DashboardData } from '@/lib/types';

const GROQ_KEY = process.env.GROQ_API_KEY;

// ─── CORS Preflight ──────────────────────────────────────────
export async function OPTIONS(request: NextRequest) {
  return handlePreflight(request) ?? new NextResponse(null, { status: 204 });
}

export async function POST(req: NextRequest) {
  if (!GROQ_KEY) {
    return withCors(
      NextResponse.json({ error: 'AI service unavailable' }, { status: 503 }),
      req
    );
  }

  try {
    const body = await req.json();
    const message = sanitizeMessage(body?.message);

    if (!message) {
      return withCors(
        NextResponse.json({ error: 'Message is required' }, { status: 400 }),
        req
      );
    }

    // Extract only the safe fields we need from context — never trust raw client objects
    const ctx = body?.context as DashboardData | undefined;
    let contextBlock = '';
    if (ctx?.weather && ctx?.location) {
      contextBlock = `\n\nREALTIME CONTEXT:
Location: ${String(ctx.location.city ?? '').slice(0, 60)}, ${String(ctx.location.region ?? '').slice(0, 40)}
Temperature: ${Number(ctx.weather.temperature) || 0}°C (Feels like ${Number(ctx.weather.feelsLike) || 0}°C)
Conditions: ${String(ctx.weather.description ?? '').slice(0, 80)}
Humidity: ${Number(ctx.weather.humidity) || 0}%
Wind: ${Number(ctx.weather.windSpeed) || 0} km/h
Rainfall: ${Number(ctx.weather.rainfall) || 0} mm/h
Flood Risk: ${String(ctx.risk?.level ?? 'unknown').slice(0, 20).toUpperCase()} (${Number(ctx.risk?.percentage) || 0}%)
Trend: ${String(ctx.risk?.trend ?? 'stable').slice(0, 20)}

Use this realtime data to ground your answers in reality. Provide precise, location-specific insights.`;
    }

    const systemPrompt = `You are AtmosChat, an elite realtime atmospheric intelligence assistant for the ClimaSense platform.
Your ONLY purpose is to answer questions about weather, atmospheric conditions, flood risks, and localized travel safety.
If the user asks about anything unrelated to weather, environment, or the ClimaSense dashboard, politely decline and steer them back to atmospheric conditions.
Maintain a premium, calm, intelligent, and conversational tone. Act as a highly specialized meteorologist.
Keep responses concise—no long essays. Use short, readable paragraphs or bullet points.${contextBlock}`;

    const payload = {
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.5,
      max_tokens: 350,
      stream: true,
    };

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      // Never forward raw upstream error details to client
      return withCors(
        NextResponse.json({ error: 'AI service temporarily unavailable' }, { status: 502 }),
        req
      );
    }

    // Return the readable stream directly to the client
    const streamResponse = new NextResponse(res.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
    return withCors(streamResponse, req);

  } catch (error: unknown) {
    console.error('Chat API Error:', error instanceof Error ? error.message : 'unknown');
    return withCors(
      NextResponse.json({ error: 'Internal Server Error' }, { status: 500 }),
      req
    );
  }
}
