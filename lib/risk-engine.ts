// ============================================================
// ClimaSense — Trend-Aware Multi-Factor Risk Engine
// Combines multiple atmospheric signals with weighted scoring
// and trend escalation detection
// ============================================================

import type { WeatherSignal, ForecastEntry, RiskAssessment, RiskFactors, RiskLevel, TrendDirection, Alert } from './types';

// ─── Scoring Weights ─────────────────────────────────────────
const WEIGHTS = {
  rainfall: 0.41,
  humidity: 0.13,
  wind: 0.13,
  pressure: 0.18,
  trendEscalation: 0.10,
  visibility: 0.05,
} as const;


// ─── Normalization Helpers ───────────────────────────────────
function normalizeRainfall(mmPerHour: number): number {
  // 0 = no rain, 100 = extreme (>50mm/h)
  if (mmPerHour <= 0) return 0;
  if (mmPerHour >= 50) return 100;
  // Non-linear: light rain scores low, heavy rain scores high
  return Math.min(100, Math.round(Math.pow(mmPerHour / 50, 0.6) * 100));
}

function normalizeHumidity(humidity: number): number {
  // Risk increases above 70%
  if (humidity <= 60) return Math.round(humidity * 0.3);
  if (humidity <= 80) return Math.round(30 + (humidity - 60) * 2.5);
  return Math.min(100, Math.round(80 + (humidity - 80) * 1.5));
}

function normalizeWind(windKmh: number): number {
  // 0 = calm, 100 = hurricane force (>120 km/h)
  if (windKmh <= 20) return Math.round(windKmh * 0.5);
  if (windKmh <= 60) return Math.round(10 + (windKmh - 20) * 1.5);
  if (windKmh <= 100) return Math.round(70 + (windKmh - 60) * 0.75);
  return Math.min(100, Math.round(100));
}

function normalizePressure(hPa: number): number {
  // Low pressure = high risk. Normal ~1013 hPa
  if (hPa >= 1013) return 0;
  if (hPa >= 1000) return Math.round((1013 - hPa) * 4);
  if (hPa >= 990) return Math.round(52 + (1000 - hPa) * 3);
  if (hPa >= 975) return Math.round(82 + (990 - hPa) * 1.2);
  return 100;
}

function normalizeVisibility(km: number): number {
  // Low visibility = higher risk
  if (km >= 15) return 0;
  if (km >= 10) return Math.round((15 - km) * 4);
  if (km >= 5) return Math.round(20 + (10 - km) * 8);
  return Math.min(100, Math.round(60 + (5 - km) * 8));
}

// ─── Trend Escalation Detector ───────────────────────────────
function detectTrendEscalation(forecast: ForecastEntry[]): { score: number; direction: TrendDirection } {
  if (!forecast || forecast.length < 3) return { score: 20, direction: 'stable' };

  const rainfallValues = forecast.slice(0, 6).map(f => f.rainfall);
  const pressureValues = forecast.slice(0, 6).map(f => f.pressure);

  // Calculate linear regression slope for rainfall
  const n = rainfallValues.length;
  const xMean = (n - 1) / 2;
  const yMean = rainfallValues.reduce((a, b) => a + b, 0) / n;
  const slope = rainfallValues.reduce((sum, y, x) => sum + (x - xMean) * (y - yMean), 0) /
    rainfallValues.reduce((sum, _, x) => sum + Math.pow(x - xMean, 2), 0);

  // Pressure trend (falling pressure = worsening)
  const pressureSlope = (pressureValues[pressureValues.length - 1] - pressureValues[0]) / pressureValues.length;

  // Combine signals
  const rainfallEscalation = Math.max(0, slope * 15); // positive slope = rising rain
  const pressureEscalation = Math.max(0, -pressureSlope * 8); // negative slope = falling pressure

  const totalEscalation = Math.min(100, rainfallEscalation + pressureEscalation);

  let direction: TrendDirection = 'stable';
  if (slope > 0.3 || pressureSlope < -0.5) direction = 'rising';
  else if (slope < -0.3 && pressureSlope > 0.2) direction = 'falling';

  return { score: Math.round(totalEscalation), direction };
}

// ─── Risk Level Classifier ───────────────────────────────────
function classifyRiskLevel(score: number): RiskLevel {
  if (score >= 75) return 'critical';
  if (score >= 55) return 'high';
  if (score >= 35) return 'moderate';
  return 'low';
}

// ─── Alert Generator ─────────────────────────────────────────
function generateAlerts(
  weather: WeatherSignal,
  factors: RiskFactors,
  riskLevel: RiskLevel,
  trend: TrendDirection
): Alert[] {
  const alerts: Alert[] = [];
  const now = new Date();

  if (riskLevel === 'critical') {
    alerts.push({
      id: 'alert-flood-critical',
      severity: 'critical',
      title: 'Flash Flood Warning',
      message: 'Dangerous flooding conditions detected. Avoid all flood-prone areas immediately.',
      timestamp: new Date(now.getTime() - 10 * 60000).toISOString(),
      category: 'flood',
    });
  } else if (riskLevel === 'high') {
    alerts.push({
      id: 'alert-flood-high',
      severity: 'warning',
      title: 'Flood Watch Active',
      message: 'Conditions are favorable for flooding. Monitor local emergency services.',
      timestamp: new Date(now.getTime() - 20 * 60000).toISOString(),
      category: 'flood',
    });
  }

  if (weather.pressure < 995) {
    alerts.push({
      id: 'alert-pressure-drop',
      severity: 'warning',
      title: 'Rapid Pressure Drop',
      message: `Barometric pressure at ${weather.pressure} hPa — storm intensification likely in the next 2–4 hours.`,
      timestamp: new Date(now.getTime() - 35 * 60000).toISOString(),
      category: 'pressure',
    });
  }

  if (weather.windSpeed > 50) {
    alerts.push({
      id: 'alert-high-wind',
      severity: weather.windSpeed > 80 ? 'critical' : 'warning',
      title: 'High Wind Advisory',
      message: `Sustained winds of ${weather.windSpeed} km/h with higher gusts. Secure loose objects outdoors.`,
      timestamp: new Date(now.getTime() - 45 * 60000).toISOString(),
      category: 'wind',
    });
  }

  if (weather.visibility < 5) {
    alerts.push({
      id: 'alert-low-visibility',
      severity: 'warning',
      title: 'Low Visibility Warning',
      message: `Visibility reduced to ${weather.visibility} km. Exercise extreme caution while driving.`,
      timestamp: new Date(now.getTime() - 60 * 60000).toISOString(),
      category: 'visibility',
    });
  }

  if (trend === 'rising' && riskLevel !== 'low') {
    alerts.push({
      id: 'alert-worsening-trend',
      severity: 'info',
      title: 'Worsening Trend Detected',
      message: 'Atmospheric conditions are deteriorating. Conditions expected to worsen over the next 3–6 hours.',
      timestamp: new Date(now.getTime() - 90 * 60000).toISOString(),
      category: 'general',
    });
  }


  return alerts;
}

// ─── Weekly Forecast Risk Projection ─────────────────────────
function projectWeeklyRisk(
  currentScore: number,
  forecast: ForecastEntry[],
  trend: TrendDirection
): Array<{ day: string; risk: number }> {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return days.map((day, i) => {
    let projectedRisk = currentScore;

    if (trend === 'rising') {
      projectedRisk = Math.min(100, currentScore + (i - 2) * 4);
    } else if (trend === 'falling') {
      projectedRisk = Math.max(5, currentScore - i * 5);
    } else {
      projectedRisk = currentScore + Math.sin(i * 0.8) * 8;
    }

    // Use actual forecast data if available
    if (forecast[i]) {
      projectedRisk = (projectedRisk + forecast[i].riskScore) / 2;
    }

    return { day, risk: Math.round(Math.max(5, Math.min(100, projectedRisk))) };
  });
}

// ─── Water Level History ─────────────────────────────────────
function generateWaterHistory(
  currentRainfall: number,
  trend: TrendDirection
): Array<{ time: string; level: number; historical: number }> {
  const times = ['12AM', '2AM', '4AM', '6AM', '8AM', '10AM', '12PM', '2PM'];
  const baseLevel = currentRainfall * 0.4 + 0.5;
  const historicalBase = baseLevel * 0.65;

  return times.map((time, i) => {
    const trendFactor = trend === 'rising' ? i * 0.12 : trend === 'falling' ? -i * 0.05 : Math.sin(i) * 0.05;
    return {
      time,
      level: parseFloat(Math.max(0.1, baseLevel + trendFactor + Math.sin(i * 0.5) * 0.08).toFixed(2)),
      historical: parseFloat((historicalBase + i * 0.015).toFixed(2)),
    };
  });
}

// ─── Main Risk Engine ─────────────────────────────────────────
export function computeRisk(
  weather: WeatherSignal,
  forecast: ForecastEntry[]
): RiskAssessment {
  // Score each factor
  const rainfallScore   = normalizeRainfall(weather.rainfall);
  const humidityScore   = normalizeHumidity(weather.humidity);
  const windScore       = normalizeWind(weather.windSpeed);
  const pressureScore   = normalizePressure(weather.pressure);
  const visibilityScore = normalizeVisibility(weather.visibility);

  const { score: trendEscalation, direction: trend } = detectTrendEscalation(forecast);

  const factors: RiskFactors = {
    rainfallScore,
    humidityScore,
    windScore,
    pressureScore,
    trendEscalation,
    visibilityScore,
  };

  // Weighted composite score
  const compositeScore =
    rainfallScore   * WEIGHTS.rainfall +
    humidityScore   * WEIGHTS.humidity +
    windScore       * WEIGHTS.wind +
    pressureScore   * WEIGHTS.pressure +
    trendEscalation * WEIGHTS.trendEscalation +
    visibilityScore * WEIGHTS.visibility;

  const percentage = Math.round(Math.min(100, Math.max(0, compositeScore)));
  const level = classifyRiskLevel(percentage);
  const alerts = generateAlerts(weather, factors, level, trend);
  const weeklyForecast = projectWeeklyRisk(percentage, forecast, trend);
  const trendHistory = generateWaterHistory(weather.rainfall, trend);

  return {
    level,
    percentage,
    trend,
    factors,
    weeklyForecast,
    trendHistory,
    alerts,
  };
}

// ─── Export risk label helpers ────────────────────────────────
export function getRiskLabel(level: RiskLevel): string {
  const labels: Record<RiskLevel, string> = {
    critical: 'Critical Risk',
    high: 'High Risk',
    moderate: 'Moderate Risk',
    low: 'Low Risk',
  };
  return labels[level];
}

export function getRiskColor(level: RiskLevel): string {
  const colors: Record<RiskLevel, string> = {
    critical: 'text-destructive',
    high: 'text-orange-500',
    moderate: 'text-yellow-500',
    low: 'text-green-500',
  };
  return colors[level];
}

export function getRiskBgColor(level: RiskLevel): string {
  const colors: Record<RiskLevel, string> = {
    critical: 'bg-destructive text-destructive-foreground',
    high: 'bg-orange-500 text-white',
    moderate: 'bg-yellow-500 text-white',
    low: 'bg-green-500 text-white',
  };
  return colors[level];
}
