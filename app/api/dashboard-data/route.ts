// ============================================================
// ClimaSense — Unified Dashboard Orchestration Endpoint
// GET /api/dashboard-data?location=Houston
// GET /api/dashboard-data?lat=29.76&lng=-95.37
//
// Data pipeline:
//   OpenWeather (realtime) + Tomorrow.io (forecast, if key present)
//   → Risk Engine → Llama 3.3 70B via Groq (AI, if key present)
//   → Unified JSON response
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { cache, cacheKeys } from '@/lib/cache';
import { getMockData } from '@/lib/mock-data';
import { computeRisk } from '@/lib/risk-engine';
import { handlePreflight, withCors, sanitizeLocation, validateCoords } from '@/lib/api-security';
import type {
  DashboardData,
  ApiResponse,
  WeatherSignal,
  ForecastEntry,
  LocationInfo,
} from '@/lib/types';

// ─── Keys ────────────────────────────────────────────────────
const OW_KEY       = process.env.OPENWEATHER_API_KEY;
const TOMORROW_KEY = process.env.TOMORROW_API_KEY;
const GROQ_KEY     = process.env.GROQ_API_KEY;
const DEMO_MODE    = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

// ─── Tomorrow.io weather code → human description ────────────
const TOMORROW_CODES: Record<number, string> = {
  1000: 'Clear sky', 1100: 'Mostly clear', 1101: 'Partly cloudy',
  1102: 'Mostly cloudy', 1001: 'Cloudy', 2000: 'Fog', 2100: 'Light fog',
  4000: 'Drizzle', 4001: 'Rain', 4200: 'Light rain', 4201: 'Heavy rain',
  5000: 'Snow', 5001: 'Flurries', 5100: 'Light snow', 5101: 'Heavy snow',
  6000: 'Freezing drizzle', 6001: 'Freezing rain',
  7000: 'Ice pellets', 8000: 'Thunderstorm',
};

function tomorrowCodeToIcon(code: number): string {
  if (code === 1000) return '01d';
  if (code === 1100 || code === 1101) return '02d';
  if (code === 1102 || code === 1001) return '03d';
  if (code === 2000 || code === 2100) return '50d';
  if (code === 4000 || code === 4200) return '09d';
  if (code === 4001 || code === 4201) return '10d';
  if (code === 8000) return '11d';
  if (code >= 5000 && code <= 5101) return '13d';
  return '04d';
}

// ─── OpenWeather: geocode city → coords ──────────────────────
async function owGeocode(
  location: string
): Promise<{ lat: number; lng: number; city: string; region: string; country: string } | null> {
  if (!OW_KEY) return null;
  try {
    const res = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${OW_KEY}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.[0]) return null;
    const { lat, lon, name, state = '', country = '' } = data[0];
    return { lat, lng: lon, city: name, region: state, country };
  } catch { return null; }
}

// ─── OpenWeather: reverse geocode coords → city ──────────────
async function owReverseGeocode(
  lat: number, lng: number
): Promise<{ city: string; region: string; country: string }> {
  if (!OW_KEY) return { city: 'Unknown', region: '', country: '' };
  try {
    const res = await fetch(
      `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lng}&limit=1&appid=${OW_KEY}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return { city: 'Unknown', region: '', country: '' };
    const data = await res.json();
    if (!data?.[0]) return { city: 'Unknown', region: '', country: '' };
    const { name, state = '', country = '' } = data[0];
    return { city: name, region: state, country };
  } catch { return { city: 'Unknown', region: '', country: '' }; }
}

// ─── OpenWeather: realtime weather ───────────────────────────
async function fetchOWRealtime(
  lat: number, lng: number
): Promise<WeatherSignal | null> {
  if (!OW_KEY) return null;
  try {
    const [weatherRes, uvRes, aqiRes] = await Promise.allSettled([
      fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${OW_KEY}&units=metric`,
        { next: { revalidate: 300 } }
      ),
      fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=uv_index`,
        { next: { revalidate: 300 } }
      ),
      fetch(
        `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lng}&appid=${OW_KEY}`,
        { next: { revalidate: 300 } }
      ),
    ]);

    if (weatherRes.status !== 'fulfilled' || !weatherRes.value.ok) return null;
    const w = await weatherRes.value.json();


    let uvIndex = 0;
    if (uvRes.status === 'fulfilled' && uvRes.value.ok) {
      const uvData = await uvRes.value.json();
      uvIndex = Math.round(uvData?.current?.uv_index ?? 0);
    }

    let aqi = 0;
    let pm25 = 0;
    if (aqiRes.status === 'fulfilled' && aqiRes.value.ok) {
      const aqiData = await aqiRes.value.json();
      aqi = aqiData?.list?.[0]?.main?.aqi ?? 0;
      pm25 = aqiData?.list?.[0]?.components?.pm2_5 ?? 0;
    }

    const rainfall = w.rain?.['1h'] ?? w.rain?.['3h'] ?? 0;
    const windSpeedKmh = Math.round((w.wind?.speed ?? 0) * 3.6);
    const humidity = w.main?.humidity ?? 60;
    const temp = w.main?.temp ?? 20;
    const dewPoint = Math.round(temp - ((100 - humidity) / 5));

    return {
      temperature: Math.round(temp),
      feelsLike: Math.round(w.main?.feels_like ?? temp),
      humidity,
      rainfall: parseFloat(rainfall.toFixed(2)),
      windSpeed: windSpeedKmh,
      windDirection: w.wind?.deg ?? 0,
      pressure: w.main?.pressure ?? 1013,
      visibility: parseFloat(((w.visibility ?? 10000) / 1000).toFixed(1)),
      cloudCover: w.clouds?.all ?? 0,
      uvIndex,
      aqi,
      pm25,

      dewPoint,
      description: w.weather?.[0]?.description ?? 'Unknown',
      icon: w.weather?.[0]?.icon ?? '01d',
    };
  } catch { return null; }
}

// ─── OpenWeather: 24-hour forecast (3h intervals → 8 entries) ─
async function fetchOWForecast(
  lat: number, lng: number
): Promise<ForecastEntry[]> {
  if (!OW_KEY) return [];
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${OW_KEY}&units=metric&cnt=8`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return [];
    const data = await res.json();

    return (data.list ?? []).map((item: Record<string, unknown>) => {
      const main = item.main as Record<string, number>;
      const wind = item.wind as Record<string, number>;
      const rain = item.rain as Record<string, number> | undefined;
      const weather = (item.weather as Array<Record<string, string>>)?.[0];
      const dt = item.dt as number;

      const rainfall = rain?.['3h'] ? rain['3h'] / 3 : 0;
      const pressure = main?.pressure ?? 1013;
      const humidity = main?.humidity ?? 60;
      const windSpeed = Math.round((wind?.speed ?? 0) * 3.6);

      const riskScore = Math.min(100, Math.round(
        rainfall * 4 +
        Math.max(0, (1013 - pressure) * 0.5) +
        humidity * 0.15 +
        windSpeed * 0.1
      ));

      return {
        time: new Date(dt * 1000).toISOString(),
        label: new Date(dt * 1000).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
        temperature: Math.round(main?.temp ?? 20),
        rainfall: parseFloat(rainfall.toFixed(2)),
        windSpeed,
        humidity: Math.round(humidity),
        pressure: Math.round(pressure),
        riskScore,
        description: weather?.description ?? 'Unknown',
        icon: weather?.icon ?? '01d',
      };
    });
  } catch { return []; }
}

// ─── Tomorrow.io: hourly forecast (supplement OW if key exists) ─
async function fetchTomorrowForecast(
  lat: number, lng: number
): Promise<ForecastEntry[]> {
  if (!TOMORROW_KEY) return [];

  const fields = [
    'temperature', 'humidity', 'windSpeed',
    'pressureSurfaceLevel', 'precipitationIntensity',
    'precipitationProbability', 'weatherCode',
  ].join(',');

  try {
    const res = await fetch(
      `https://api.tomorrow.io/v4/weather/forecast?location=${lat},${lng}&fields=${fields}&timesteps=1h&units=metric&apikey=${TOMORROW_KEY}`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return [];
    const json = await res.json();
    const hourly: Array<{ time: string; values: Record<string, number> }> =
      json?.timelines?.hourly ?? [];

    return hourly.slice(0, 24).map((item) => {
      const v = item.values;
      const code = v.weatherCode ?? 1000;
      const rainfall = v.precipitationIntensity ?? 0;
      const pressure = v.pressureSurfaceLevel ?? 1013;
      const humidity = v.humidity ?? 60;
      const windSpeed = Math.round((v.windSpeed ?? 0) * 3.6);

      const riskScore = Math.min(100, Math.round(
        rainfall * 4 +
        Math.max(0, (1013 - pressure) * 0.5) +
        humidity * 0.15 +
        windSpeed * 0.1
      ));

      return {
        time: item.time,
        label: new Date(item.time).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
        temperature: Math.round(v.temperature ?? 20),
        rainfall: parseFloat(rainfall.toFixed(2)),
        windSpeed,
        humidity: Math.round(humidity),
        pressure: Math.round(pressure),
        riskScore,
        description: TOMORROW_CODES[code] ?? 'Clear sky',
        icon: tomorrowCodeToIcon(code),
      };
    });
  } catch { return []; }
}

// ─── Llama 3.3 70B via Groq ──────────────────────────────────
async function generateLlamaInsights(
  location: string,
  weather: WeatherSignal,
  riskScore: number,
  riskLevel: string,
  trend: string,
  forecast: ForecastEntry[]
): Promise<{
  summary: string;
  explanation: string;
  recommendations: string[];
  safetyTips: string[];
  outlook: string;
  confidence: number;
} | null> {
  if (!GROQ_KEY) return null;

  // Build a compact forecast summary for the prompt
  const forecastSummary = forecast.slice(0, 6).map(f =>
    `${f.label}: ${f.temperature}°C, ${f.rainfall}mm/h rain, ${f.windSpeed}km/h wind`
  ).join(' | ');

  const prompt = `You are ClimaSense, a premium AI atmospheric intelligence system. Analyze this weather data and generate concise, human-readable insights.

Location: ${location}
Current Conditions:
- Temperature: ${weather.temperature}°C (feels like ${weather.feelsLike}°C)
- Humidity: ${weather.humidity}%
- Rainfall: ${weather.rainfall} mm/h
- Wind: ${weather.windSpeed} km/h
- Pressure: ${weather.pressure} hPa
- Visibility: ${weather.visibility} km
- Cloud Cover: ${weather.cloudCover}%

- Conditions: ${weather.description}

Risk Intelligence:
- Flood Risk Score: ${riskScore}/100
- Risk Level: ${riskLevel}
- Atmospheric Trend: ${trend}

Next 6 Hours: ${forecastSummary || 'No forecast data available'}

Generate location-specific insights that mention ${location} by name.

Respond ONLY with a valid JSON object. No markdown. No code blocks.

{
  "summary": "One sentence, max 15 words, describing current conditions at ${location}",
  "explanation": "2-3 sentences explaining the atmospheric dynamics.",
  "recommendations": ["Actionable checklist step 1", "Actionable checklist step 2", "Actionable checklist step 3", "Actionable checklist step 4", "Actionable checklist step 5"],
  "safetyTips": ["Safety tip 1", "Safety tip 2", "Safety tip 3"],
  "outlook": "1-2 sentences on expected conditions over the next 24-48 hours",
  "confidence": 85
}

Tone: calm, intelligent, premium. Not alarmist. Not robotic. Speak like a trusted meteorologist.`;

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        max_tokens: 700,
        response_format: { type: 'json_object' },
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text: string = data?.choices?.[0]?.message?.content ?? '';
    return JSON.parse(text);
  } catch { return null; }
}

// ─── Build LocationInfo ───────────────────────────────────────
function buildLocationInfo(
  city: string, region: string, country: string,
  lat: number, lng: number
): LocationInfo {
  return {
    city,
    region,
    country,
    lat,
    lng,
    timezone: 'UTC',
    localTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  };
}

// ─── Build MapData ────────────────────────────────────────────
function buildMapData(lat: number, lng: number, city: string, riskLevel: string) {
  const level = riskLevel as 'critical' | 'high' | 'moderate' | 'low';
  type MT = 'risk-zone' | 'flood-alert' | 'weather-station' | 'safe-zone';

  const markers: Array<{ id: string; lat: number; lng: number; type: MT; label: string; severity: typeof level }> = [
    { id: 'main', lat, lng, type: 'weather-station', label: city, severity: level },
  ];

  if (level === 'critical' || level === 'high') {
    markers.push({ id: 'risk-1', lat: lat - 0.025, lng: lng - 0.025, type: 'flood-alert', label: 'Risk Zone', severity: level });
  }
  if (level === 'low' || level === 'moderate') {
    markers.push({ id: 'safe-1', lat: lat + 0.02, lng: lng + 0.02, type: 'safe-zone', label: 'Clear Zone', severity: 'low' });
  }

  const riskZones = level !== 'low' ? [{
    id: 'zone-1',
    coordinates: [
      [lng - 0.06, lat - 0.06], [lng + 0.06, lat - 0.06],
      [lng + 0.06, lat + 0.06], [lng - 0.06, lat + 0.06],
    ] as Array<[number, number]>,
    riskLevel: level,
    label: `${city} Risk Zone`,
  }] : [];

  return { center: { lat, lng }, zoom: 11, markers, riskZones };
}

// ─── CORS Preflight ───────────────────────────────────────────
export async function OPTIONS(request: NextRequest) {
  return handlePreflight(request) ?? new NextResponse(null, { status: 204 });
}

// ─── Main Handler ─────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const locationParam = sanitizeLocation(searchParams.get('location'));
  const coords        = validateCoords(searchParams.get('lat'), searchParams.get('lng'));
  const forceDemo     = searchParams.get('demo') === 'true' || DEMO_MODE;
  const forceRefresh  = searchParams.get('refresh') === 'true';

  // Cache key
  const cacheKey = coords
    ? cacheKeys.dashboard(`coords:${coords.lat.toFixed(2)},${coords.lng.toFixed(2)}`)
    : cacheKeys.dashboard(locationParam);

  // ── Serve from cache ─────────────────────────────────────────
  if (!forceRefresh) {
    const cached = cache.get<DashboardData>(cacheKey);
    if (cached && !cached.isStale) {
      return withCors(NextResponse.json<ApiResponse<DashboardData>>({
        success: true,
        data: { ...cached.data, meta: { ...cached.data.meta, source: 'cached' } },
        timestamp: new Date().toISOString(),
      }), request);
    }
  }

  // ── Demo / no-key fallback ────────────────────────────────────
  if (forceDemo || !OW_KEY) {
    const mockData = getMockData(locationParam);
    cache.set(cacheKey, mockData);
    return withCors(NextResponse.json<ApiResponse<DashboardData>>({
      success: true,
      data: mockData,
      timestamp: new Date().toISOString(),
    }), request);
  }

  // ── Live mode ─────────────────────────────────────────────────
  try {
    let lat: number, lng: number, city: string, region: string, country: string;

    // Resolve coordinates
    if (coords) {
      lat = coords.lat;
      lng = coords.lng;
      const geo = await owReverseGeocode(lat, lng);
      city = geo.city; region = geo.region; country = geo.country;
    } else {
      const geo = await owGeocode(locationParam);
      if (!geo) {
        const mock = getMockData(locationParam);
        cache.set(cacheKey, mock);
        return withCors(NextResponse.json<ApiResponse<DashboardData>>({
          success: true,
          data: { ...mock, meta: { ...mock.meta, source: 'mock' } },
          timestamp: new Date().toISOString(),
        }), request);
      }
      lat = geo.lat; lng = geo.lng;
      city = geo.city; region = geo.region; country = geo.country;
    }

    // Fetch weather + forecast in parallel
    const [weather, owForecast, tomorrowForecast] = await Promise.all([
      fetchOWRealtime(lat, lng),
      fetchOWForecast(lat, lng),
      fetchTomorrowForecast(lat, lng),
    ]);

    if (!weather) {
      const mock = getMockData(city || locationParam);
      cache.set(cacheKey, mock);
      return withCors(NextResponse.json<ApiResponse<DashboardData>>({
        success: true,
        data: { ...mock, meta: { ...mock.meta, source: 'mock' } },
        timestamp: new Date().toISOString(),
      }), request);
    }

    // Prefer Tomorrow.io forecast (richer hourly data), fall back to OW
    const forecast: ForecastEntry[] = tomorrowForecast.length > 0 ? tomorrowForecast : owForecast;

    // Risk engine
    const risk = computeRisk(weather, forecast);
    
    // Persist real event timestamps from cache
    const cachedData = cache.get<DashboardData>(cacheKey)?.data;
    if (cachedData?.alerts) {
      const oldAlertsMap = new Map(cachedData.alerts.map(a => [a.id, a.timestamp]));
      risk.alerts = risk.alerts.map(alert => {
        const oldTimestamp = oldAlertsMap.get(alert.id);
        return oldTimestamp ? { ...alert, timestamp: oldTimestamp } : alert;
      });
    }

    // AI insights (non-blocking — falls back to mock insights if Groq unavailable)
    const aiRaw = await generateLlamaInsights(city, weather, risk.percentage, risk.level, risk.trend, forecast);
    const aiInsights = aiRaw
      ? { ...aiRaw, generatedAt: new Date().toISOString() }
      : { ...getMockData(city).aiInsights, generatedAt: new Date().toISOString() };

    const locationInfo = buildLocationInfo(city, region, country, lat, lng);
    const mapData = buildMapData(lat, lng, city, risk.level);

    const dashboardData: DashboardData = {
      location: locationInfo,
      weather,
      forecast,
      risk,
      alerts: risk.alerts,
      aiInsights,
      mapData,
      meta: {
        source: 'live',
        cachedAt: new Date().toISOString(),
        nextRefresh: new Date(Date.now() + 5 * 60_000).toISOString(),
        demoMode: false,
      },
    };

    cache.set(cacheKey, dashboardData);

    return withCors(NextResponse.json<ApiResponse<DashboardData>>({
      success: true,
      data: dashboardData,
      timestamp: new Date().toISOString(),
    }), request);

  } catch {
    const mock = getMockData(locationParam);
    return withCors(NextResponse.json<ApiResponse<DashboardData>>({
      success: true,
      data: { ...mock, meta: { ...mock.meta, source: 'mock' } },
      timestamp: new Date().toISOString(),
    }), request);
  }
}
