// ============================================================
// ClimaSense — Core Type Definitions
// ============================================================

export type RiskLevel = 'critical' | 'high' | 'moderate' | 'low';
export type TrendDirection = 'rising' | 'stable' | 'falling';

// ─── Raw Weather Signal ──────────────────────────────────────
export interface WeatherSignal {
  temperature: number;       // °C
  feelsLike: number;         // °C
  humidity: number;          // %
  rainfall: number;          // mm/h
  windSpeed: number;         // km/h
  windDirection: number;     // degrees
  pressure: number;          // hPa
  visibility: number;        // km
  cloudCover: number;        // %
  uvIndex: number;
  aqi: number;               // Air Quality Index
  pm25: number;              // PM2.5 level
  dewPoint: number;          // °C
  description: string;
  icon: string;
}

// ─── Forecast Entry ──────────────────────────────────────────
export interface ForecastEntry {
  time: string;              // ISO string
  label: string;             // "Mon", "2PM", etc.
  temperature: number;
  rainfall: number;
  windSpeed: number;
  humidity: number;
  pressure: number;
  riskScore: number;         // 0–100
  description: string;
  icon: string;
}

// ─── Risk Engine Output ──────────────────────────────────────
export interface RiskFactors {
  rainfallScore: number;
  humidityScore: number;
  windScore: number;
  pressureScore: number;
  trendEscalation: number;
  visibilityScore: number;
}

export interface RiskAssessment {
  level: RiskLevel;
  percentage: number;        // 0–100
  trend: TrendDirection;
  factors: RiskFactors;
  weeklyForecast: Array<{ day: string; risk: number }>;
  trendHistory: Array<{ time: string; level: number; historical: number }>;
  alerts: Alert[];
}

// ─── Alert ───────────────────────────────────────────────────
export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface Alert {
  id: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  timestamp: string;
  category: 'flood' | 'wind' | 'rain' | 'visibility' | 'pressure' | 'general';
}

// ─── AI Insights ─────────────────────────────────────────────
export interface AIInsight {
  summary: string;
  explanation: string;
  recommendations: string[];
  safetyTips: string[];
  outlook: string;
  confidence: number;        // 0–100
  generatedAt: string;
}

// ─── Map Data ────────────────────────────────────────────────
export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  type: 'risk-zone' | 'flood-alert' | 'weather-station' | 'safe-zone';
  label: string;
  severity?: RiskLevel;
  data?: Record<string, unknown>;
}

export interface MapData {
  center: { lat: number; lng: number };
  zoom: number;
  markers: MapMarker[];
  riskZones: Array<{
    id: string;
    coordinates: Array<[number, number]>;
    riskLevel: RiskLevel;
    label: string;
  }>;
}

// ─── Location ────────────────────────────────────────────────
export interface LocationInfo {
  city: string;
  locality?: string;        // neighbourhood / suburb / district
  region: string;
  country: string;
  lat: number;
  lng: number;
  timezone: string;
  localTime: string;
  displayName?: string;     // "Parel, Mumbai, Maharashtra, India"
}

// ─── Geolocation ─────────────────────────────────────────────
export type GeolocationStatus =
  | 'idle'
  | 'requesting'
  | 'granted'
  | 'denied'
  | 'unavailable'
  | 'error';

export interface GeolocationState {
  status: GeolocationStatus;
  coords: { lat: number; lng: number } | null;
  city: string | null;
  error: string | null;
}

// ─── Unified Dashboard Response ──────────────────────────────
export interface DashboardData {
  location: LocationInfo;
  weather: WeatherSignal;
  forecast: ForecastEntry[];
  risk: RiskAssessment;
  alerts?: Alert[];
  aiInsights: AIInsight;
  mapData: MapData;
  meta: {
    source: 'live' | 'mock' | 'cached';
    cachedAt: string;
    nextRefresh: string;
    demoMode: boolean;
  };
}

// ─── API Response Wrapper ────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}
