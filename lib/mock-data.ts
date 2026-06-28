// ============================================================
// ClimaSense — Rich Mock Data System
// Provides realistic, demo-stable data for all locations
// ============================================================

import type { DashboardData, WeatherSignal, ForecastEntry, RiskAssessment, AIInsight, MapData, LocationInfo, Alert } from './types';

// ─── Utility ─────────────────────────────────────────────────
function generateWaterLevelHistory(base: number, variance: number) {
  const times = ['12AM', '2AM', '4AM', '6AM', '8AM', '10AM', '12PM', '2PM', '4PM', '6PM'];
  const historical = base * 0.65;
  return times.map((time, i) => ({
    time,
    level: parseFloat((historical + (i * variance * 0.15) + (Math.sin(i) * 0.1)).toFixed(2)),
    historical: parseFloat((historical + (i * 0.02)).toFixed(2)),
  }));
}

function generateWeeklyRisk(baseRisk: number, trend: 'rising' | 'stable' | 'falling') {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((day, i) => {
    let delta = 0;
    if (trend === 'rising') delta = i * 3.5;
    else if (trend === 'falling') delta = -(i * 2.5);
    else delta = Math.sin(i) * 4;
    return { day, risk: Math.min(100, Math.max(5, Math.round(baseRisk + delta - 12 + i * 2))) };
  });
}

// ─── Location Profiles ───────────────────────────────────────
const LOCATION_PROFILES: Record<string, DashboardData> = {
  houston: {
    location: {
      city: 'Houston',
      region: 'TX',
      country: 'US',
      lat: 29.7604,
      lng: -95.3698,
      timezone: 'America/Chicago',
      localTime: new Date().toLocaleTimeString('en-US', { timeZone: 'America/Chicago' }),
    },
    weather: {
      temperature: 28,
      feelsLike: 33,
      humidity: 78,
      rainfall: 12.4,
      windSpeed: 34,
      windDirection: 195,
      pressure: 992,
      visibility: 6.2,
      cloudCover: 88,
      uvIndex: 3,      
      aqi: 45,
      pm25: 12.5,
      dewPoint: 24,
      description: 'Heavy rain with thunderstorms',
      icon: '11d',
    },
    forecast: generateForecast(28, 'rising', 12.4),
    risk: {
      level: 'critical',
      percentage: 87,
      trend: 'rising',
      factors: {
        rainfallScore: 92,
        humidityScore: 78,
        windScore: 68,
        pressureScore: 85,
        trendEscalation: 90,
        visibilityScore: 62,
      },
      weeklyForecast: generateWeeklyRisk(87, 'rising'),
      trendHistory: generateWaterLevelHistory(6.2, 0.8),
      alerts: [
        {
          id: 'a1',
          severity: 'critical',
          title: 'Flash Flood Warning',
          message: 'Flash flooding is occurring or imminent. Avoid flood-prone areas immediately.',
          timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
          category: 'flood',
        },
        {
          id: 'a2',
          severity: 'warning',
          title: 'Severe Thunderstorm',
          message: 'Severe thunderstorms with damaging winds up to 60 mph expected through midnight.',
          timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
          category: 'wind',
        },
        {
          id: 'a3',
          severity: 'warning',
          title: 'Pressure Drop Detected',
          message: 'Barometric pressure has dropped 8 hPa in the last 3 hours — storm intensification likely.',
          timestamp: new Date(Date.now() - 90 * 60000).toISOString(),
          category: 'pressure',
        },
      ],
    },
    aiInsights: {
      summary: 'Critical flood conditions developing rapidly across Houston metro.',
      explanation: 'A combination of saturated ground from recent rainfall, an active low-pressure system at 992 hPa, and sustained winds of 34 km/h are creating dangerous flood conditions. The 8 hPa pressure drop over the last 3 hours signals continued storm intensification.',
      recommendations: [
        'Avoid all low-lying roads and underpasses — water levels are rising rapidly',
        'Move vehicles to higher ground immediately',
        'Prepare emergency supplies for potential 24–48 hour disruption',
        'Monitor official emergency broadcasts continuously',
      ],
      safetyTips: [
        'Never drive through flooded roadways — 6 inches of water can stall a vehicle',
        'Stay away from storm drains and drainage channels',
        'Keep emergency contacts and evacuation routes ready',
      ],
      outlook: 'Conditions expected to remain critical through tomorrow morning. Gradual improvement forecast after the low-pressure system moves northeast.',
      confidence: 88,
      generatedAt: new Date().toISOString(),
    },
    mapData: {
      center: { lat: 29.7604, lng: -95.3698 },
      zoom: 11,
      markers: [
        { id: 'm1', lat: 29.7604, lng: -95.3698, type: 'flood-alert', label: 'Houston Downtown', severity: 'critical' },
        { id: 'm2', lat: 29.7200, lng: -95.4100, type: 'risk-zone', label: 'Brays Bayou Overflow', severity: 'critical' },
        { id: 'm3', lat: 29.7900, lng: -95.3200, type: 'weather-station', label: 'NWS Station HOU', severity: 'high' },
        { id: 'm4', lat: 29.8100, lng: -95.5000, type: 'safe-zone', label: 'Emergency Shelter', severity: 'low' },
      ],
      riskZones: [
        { id: 'z1', coordinates: [[-95.42, 29.71], [-95.38, 29.71], [-95.38, 29.75], [-95.42, 29.75]], riskLevel: 'critical', label: 'Flood Zone A' },
        { id: 'z2', coordinates: [[-95.35, 29.76], [-95.30, 29.76], [-95.30, 29.80], [-95.35, 29.80]], riskLevel: 'high', label: 'Flood Zone B' },
      ],
    },
    meta: { source: 'mock' as const, cachedAt: new Date().toISOString(), nextRefresh: new Date(Date.now() + 5 * 60000).toISOString(), demoMode: true },
    alerts: [],
  },

  miami: {
    location: {
      city: 'Miami',
      region: 'FL',
      country: 'US',
      lat: 25.7617,
      lng: -80.1918,
      timezone: 'America/New_York',
      localTime: new Date().toLocaleTimeString('en-US', { timeZone: 'America/New_York' }),
    },
    weather: {
      temperature: 31,
      feelsLike: 38,
      humidity: 84,
      rainfall: 7.2,
      windSpeed: 28,
      windDirection: 160,
      pressure: 1001,
      visibility: 7.5,
      cloudCover: 75,
      uvIndex: 6,      
      aqi: 38,
      pm25: 8.2,
      dewPoint: 27,
      description: 'Tropical showers with gusty winds',
      icon: '09d',
    },
    forecast: generateForecast(31, 'rising', 7.2),
    risk: {
      level: 'high',
      percentage: 72,
      trend: 'rising',
      factors: {
        rainfallScore: 72,
        humidityScore: 84,
        windScore: 56,
        pressureScore: 60,
        trendEscalation: 70,
        visibilityScore: 75,
      },
      weeklyForecast: generateWeeklyRisk(72, 'rising'),
      trendHistory: generateWaterLevelHistory(2.1, 0.4),
      alerts: [
        {
          id: 'b1',
          severity: 'warning',
          title: 'Coastal Flood Advisory',
          message: 'Minor coastal flooding expected during high tide cycles over the next 48 hours.',
          timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
          category: 'flood',
        },
        {
          id: 'b2',
          severity: 'info',
          title: 'High Humidity Alert',
          message: 'Humidity levels at 84% — heat index may reach 40°C this afternoon.',
          timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
          category: 'general',
        },
      ],
    },
    aiInsights: {
      summary: 'High flood risk with tropical moisture driving persistent heavy showers.',
      explanation: 'Elevated sea surface temperatures are fueling persistent tropical convection over South Florida. Humidity at 84% combined with 7.2 mm/h rainfall and a rising trend suggests conditions will worsen through the evening hours.',
      recommendations: [
        'Avoid coastal areas and low-lying neighborhoods during high tide',
        'Secure outdoor furniture and loose items before evening storms',
        'Check drainage around your property — blockages increase flood risk significantly',
        'Delay non-essential travel until conditions improve tomorrow',
      ],
      safetyTips: [
        'Stay informed via NWS Miami for tropical weather updates',
        'Keep a 72-hour emergency kit accessible',
        'Know your evacuation zone (A–F) for Miami-Dade County',
      ],
      outlook: 'Tropical moisture pattern persists through the weekend. Slight improvement expected Monday as a dry air mass moves in from the northwest.',
      confidence: 82,
      generatedAt: new Date().toISOString(),
    },
    mapData: {
      center: { lat: 25.7617, lng: -80.1918 },
      zoom: 11,
      markers: [
        { id: 'm1', lat: 25.7617, lng: -80.1918, type: 'flood-alert', label: 'Miami Downtown', severity: 'high' },
        { id: 'm2', lat: 25.7400, lng: -80.2100, type: 'risk-zone', label: 'Brickell Coastal Zone', severity: 'high' },
        { id: 'm3', lat: 25.7900, lng: -80.1600, type: 'weather-station', label: 'NWS Station MIA', severity: 'moderate' },
        { id: 'm4', lat: 25.8200, lng: -80.2400, type: 'safe-zone', label: 'Emergency Shelter', severity: 'low' },
      ],
      riskZones: [
        { id: 'z1', coordinates: [[-80.22, 25.73], [-80.18, 25.73], [-80.18, 25.77], [-80.22, 25.77]], riskLevel: 'high', label: 'Coastal Flood Zone' },
      ],
    },
    meta: { source: 'mock', cachedAt: new Date().toISOString(), nextRefresh: new Date(Date.now() + 5 * 60000).toISOString(), demoMode: true },
    alerts: [],
  },

  'new york': {
    location: {
      city: 'New York',
      region: 'NY',
      country: 'US',
      lat: 40.7128,
      lng: -74.0060,
      timezone: 'America/New_York',
      localTime: new Date().toLocaleTimeString('en-US', { timeZone: 'America/New_York' }),
    },
    weather: {
      temperature: 18,
      feelsLike: 16,
      humidity: 65,
      rainfall: 1.8,
      windSpeed: 18,
      windDirection: 270,
      pressure: 1015,
      visibility: 12.5,
      cloudCover: 45,
      uvIndex: 4,      
      aqi: 65,
      pm25: 22.1,
      dewPoint: 11,
      description: 'Partly cloudy with light showers',
      icon: '10d',
    },
    forecast: generateForecast(18, 'stable', 1.8),
    risk: {
      level: 'moderate',
      percentage: 45,
      trend: 'stable',
      factors: {
        rainfallScore: 45,
        humidityScore: 65,
        windScore: 36,
        pressureScore: 30,
        trendEscalation: 40,
        visibilityScore: 25,
      },
      weeklyForecast: generateWeeklyRisk(45, 'stable'),
      trendHistory: generateWaterLevelHistory(1.8, 0.15),
      alerts: [
        {
          id: 'c1',
          severity: 'info',
          title: 'Urban Flooding Possible',
          message: 'Light to moderate rainfall may cause temporary street flooding in low-lying areas of Lower Manhattan.',
          timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
          category: 'flood',
        },
      ],
    },
    aiInsights: {
      summary: 'Moderate conditions with manageable flood risk across the metro area.',
      explanation: 'A mid-latitude frontal system is bringing light rainfall to the New York metro. Pressure is stable at 1015 hPa and humidity at 65% suggests no significant escalation. The Hudson River is within normal seasonal range.',
      recommendations: [
        'Exercise normal caution in areas prone to street flooding',
        'Allow extra travel time during peak rainfall hours (2–6 PM)',
        'Check subway service alerts — some lines may experience delays',
      ],
      safetyTips: [
        'Carry an umbrella — intermittent showers expected through the day',
        'Avoid parking in known flood-prone streets overnight',
      ],
      outlook: 'Conditions stabilizing over the next 48 hours. A high-pressure system moving in from the west should bring clearing skies by Thursday.',
      confidence: 91,
      generatedAt: new Date().toISOString(),
    },
    mapData: {
      center: { lat: 40.7128, lng: -74.0060 },
      zoom: 11,
      markers: [
        { id: 'm1', lat: 40.7128, lng: -74.0060, type: 'weather-station', label: 'NYC Central Station', severity: 'moderate' },
        { id: 'm2', lat: 40.7000, lng: -74.0200, type: 'risk-zone', label: 'Lower Manhattan', severity: 'moderate' },
        { id: 'm3', lat: 40.7300, lng: -73.9900, type: 'safe-zone', label: 'Emergency Services', severity: 'low' },
      ],
      riskZones: [
        { id: 'z1', coordinates: [[-74.03, 40.69], [-73.97, 40.69], [-73.97, 40.73], [-74.03, 40.73]], riskLevel: 'moderate', label: 'Lower Manhattan Zone' },
      ],
    },
    meta: { source: 'mock', cachedAt: new Date().toISOString(), nextRefresh: new Date(Date.now() + 5 * 60000).toISOString(), demoMode: true },
    alerts: [],
  },

  seattle: {
    location: {
      city: 'Seattle',
      region: 'WA',
      country: 'US',
      lat: 47.6062,
      lng: -122.3321,
      timezone: 'America/Los_Angeles',
      localTime: new Date().toLocaleTimeString('en-US', { timeZone: 'America/Los_Angeles' }),
    },
    weather: {
      temperature: 15,
      feelsLike: 13,
      humidity: 70,
      rainfall: 0.8,
      windSpeed: 14,
      windDirection: 240,
      pressure: 1020,
      visibility: 14.2,
      cloudCover: 60,
      uvIndex: 2,      
      aqi: 28,
      pm25: 5.4,
      dewPoint: 9,
      description: 'Overcast with light drizzle',
      icon: '10d',
    },
    forecast: generateForecast(15, 'falling', 0.8),
    risk: {
      level: 'low',
      percentage: 22,
      trend: 'falling',
      factors: {
        rainfallScore: 22,
        humidityScore: 70,
        windScore: 28,
        pressureScore: 15,
        trendEscalation: 10,
        visibilityScore: 14,
      },
      weeklyForecast: generateWeeklyRisk(22, 'falling'),
      trendHistory: generateWaterLevelHistory(0.9, 0.05),
      alerts: [],
    },
    aiInsights: {
      summary: 'Low risk conditions with typical Pacific Northwest drizzle patterns.',
      explanation: 'Seattle is experiencing its characteristic marine layer with light drizzle. Pressure is high at 1020 hPa and the trend is improving. The Puget Sound region is well within safe parameters with no significant weather systems approaching.',
      recommendations: [
        'Normal daily activities can proceed without weather-related concerns',
        'Light rain gear recommended for outdoor activities',
        'Good conditions for checking and clearing storm drains before the rainy season',
      ],
      safetyTips: [
        'Typical Seattle drizzle — standard precautions apply',
        'Mountain passes may have different conditions — check WSDOT for travel',
      ],
      outlook: 'Improving conditions expected over the next 3 days as a high-pressure ridge builds over the Pacific Northwest. Temperatures may rise to 18–20°C by the weekend.',
      confidence: 94,
      generatedAt: new Date().toISOString(),
    },
    mapData: {
      center: { lat: 47.6062, lng: -122.3321 },
      zoom: 11,
      markers: [
        { id: 'm1', lat: 47.6062, lng: -122.3321, type: 'weather-station', label: 'Seattle Central', severity: 'low' },
        { id: 'm2', lat: 47.5900, lng: -122.3500, type: 'safe-zone', label: 'Clear Zone', severity: 'low' },
      ],
      riskZones: [],
    },
    meta: { source: 'mock', cachedAt: new Date().toISOString(), nextRefresh: new Date(Date.now() + 5 * 60000).toISOString(), demoMode: true },
    alerts: [],
  },

  london: {
    location: {
      city: 'London',
      region: 'England',
      country: 'GB',
      lat: 51.5074,
      lng: -0.1278,
      timezone: 'Europe/London',
      localTime: new Date().toLocaleTimeString('en-GB', { timeZone: 'Europe/London' }),
    },
    weather: {
      temperature: 12,
      feelsLike: 9,
      humidity: 82,
      rainfall: 3.5,
      windSpeed: 22,
      windDirection: 225,
      pressure: 1008,
      visibility: 9.0,
      cloudCover: 90,
      uvIndex: 1,      
      aqi: 55,
      pm25: 15.6,
      dewPoint: 9,
      description: 'Overcast with moderate rain',
      icon: '10d',
    },
    forecast: generateForecast(12, 'stable', 3.5),
    risk: {
      level: 'moderate',
      percentage: 48,
      trend: 'stable',
      factors: {
        rainfallScore: 48,
        humidityScore: 82,
        windScore: 44,
        pressureScore: 42,
        trendEscalation: 35,
        visibilityScore: 30,
      },
      weeklyForecast: generateWeeklyRisk(48, 'stable'),
      trendHistory: generateWaterLevelHistory(1.4, 0.2),
      alerts: [
        {
          id: 'd1',
          severity: 'info',
          title: 'Thames Barrier Advisory',
          message: 'Thames Barrier is monitoring tidal surge conditions. No closure currently required.',
          timestamp: new Date(Date.now() - 180 * 60000).toISOString(),
          category: 'flood',
        },
      ],
    },
    aiInsights: {
      summary: 'Moderate conditions with typical autumn weather patterns across Greater London.',
      explanation: 'A slow-moving Atlantic low is bringing persistent moderate rainfall to London. The Thames is within normal seasonal levels and the Thames Barrier is on monitoring status. Pressure at 1008 hPa is slightly below seasonal average.',
      recommendations: [
        'Allow extra commute time — surface water on roads expected',
        'Check TfL for any service disruptions on the Underground',
        'Riverside areas in Twickenham and Richmond may experience minor flooding',
      ],
      safetyTips: [
        'Waterproof footwear recommended for outdoor activities',
        'Check the Environment Agency flood map for your postcode',
      ],
      outlook: 'The Atlantic low will clear by Thursday, bringing a brief dry spell. Another frontal system is expected to arrive from the west by the weekend.',
      confidence: 87,
      generatedAt: new Date().toISOString(),
    },
    mapData: {
      center: { lat: 51.5074, lng: -0.1278 },
      zoom: 11,
      markers: [
        { id: 'm1', lat: 51.5074, lng: -0.1278, type: 'weather-station', label: 'London Central', severity: 'moderate' },
        { id: 'm2', lat: 51.4900, lng: -0.1500, type: 'risk-zone', label: 'Thames Riverside', severity: 'moderate' },
        { id: 'm3', lat: 51.5200, lng: -0.1000, type: 'safe-zone', label: 'Emergency Services', severity: 'low' },
      ],
      riskZones: [
        { id: 'z1', coordinates: [[-0.16, 51.48], [-0.10, 51.48], [-0.10, 51.52], [-0.16, 51.52]], riskLevel: 'moderate', label: 'Thames Flood Plain' },
      ],
    },
    meta: { source: 'mock', cachedAt: new Date().toISOString(), nextRefresh: new Date(Date.now() + 5 * 60000).toISOString(), demoMode: true },
    alerts: [],
  },
};

// ─── Forecast Generator ──────────────────────────────────────
function generateForecast(baseTemp: number, trend: 'rising' | 'stable' | 'falling', baseRain: number): ForecastEntry[] {
  const hours = ['6AM', '9AM', '12PM', '3PM', '6PM', '9PM', '12AM', '3AM'];
  const icons = ['01d', '02d', '03d', '10d', '11d', '09d', '10n', '03n'];
  const descriptions = ['Clear', 'Partly cloudy', 'Cloudy', 'Light rain', 'Thunderstorm', 'Heavy rain', 'Drizzle', 'Overcast'];

  return hours.map((label, i) => {
    const rainMultiplier = trend === 'rising' ? 1 + i * 0.15 : trend === 'falling' ? 1 - i * 0.08 : 1 + Math.sin(i) * 0.1;
    const rainfall = Math.max(0, parseFloat((baseRain * rainMultiplier).toFixed(1)));
    const riskScore = Math.min(100, Math.max(5, Math.round(
      rainfall * 3.5 + (trend === 'rising' ? i * 4 : trend === 'falling' ? -i * 2 : 0) + 20
    )));

    return {
      time: new Date(Date.now() + i * 3 * 3600000).toISOString(),
      label,
      temperature: Math.round(baseTemp + Math.sin(i * 0.8) * 3),
      rainfall,
      windSpeed: Math.round(15 + i * (trend === 'rising' ? 2 : -0.5) + Math.random() * 5),
      humidity: Math.min(100, Math.round(65 + i * (trend === 'rising' ? 2 : -1))),
      pressure: Math.round(1013 - (trend === 'rising' ? i * 2 : 0) + Math.sin(i) * 3),
      riskScore,
      description: descriptions[i % descriptions.length],
      icon: icons[i % icons.length],
    };
  });
}

// ─── Fuzzy Location Matching ─────────────────────────────────
export function getMockData(location: string): DashboardData {
  const key = location.toLowerCase().trim();

  let profile: DashboardData | undefined;

  // Direct match
  if (LOCATION_PROFILES[key]) {
    profile = LOCATION_PROFILES[key];
  } else {
    // Partial match
    for (const profileKey of Object.keys(LOCATION_PROFILES)) {
      if (key.includes(profileKey) || profileKey.includes(key)) {
        profile = LOCATION_PROFILES[profileKey];
        break;
      }
    }
  }

  if (!profile) {
    // Default to Houston for unknown locations with adapted name
    profile = {
      ...LOCATION_PROFILES['houston'],
      location: {
        ...LOCATION_PROFILES['houston'].location,
        city: location.split(',')[0].trim() || 'Unknown',
        region: location.split(',')[1]?.trim() || 'Unknown',
      },
    };
  }

  return refreshTimestamps(profile);
}

function refreshTimestamps(data: DashboardData): DashboardData {
  const refreshed = {
    ...data,
    location: {
      ...data.location,
      localTime: new Date().toLocaleTimeString('en-US'),
    },
    aiInsights: {
      ...data.aiInsights,
      generatedAt: new Date().toISOString(),
    },
    meta: {
      ...data.meta,
      cachedAt: new Date().toISOString(),
      nextRefresh: new Date(Date.now() + 5 * 60000).toISOString(),
    },
  };
  // Ensure top-level alerts mirrors risk.alerts
  refreshed.alerts = refreshed.risk.alerts;
  return refreshed;
}

export const SUPPORTED_LOCATIONS = Object.keys(LOCATION_PROFILES);
