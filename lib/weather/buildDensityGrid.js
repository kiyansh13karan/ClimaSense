export function buildDensityGrid(center, weather, layerType, radiusKm = 10, zoom = 10) {
  // 1. Determine number of points based on zoom and radius (200-400)
  const basePoints = 200;
  const zoomFactor = Math.max(0, zoom - 10) * 20;
  const numPoints = Math.min(400, basePoints + zoomFactor);

  const points = [];
  
  // 2. Extract weather data for biasing
  const windDir = weather?.windDirection ?? 0;
  const windSpeed = weather?.windSpeed ?? 0;

  const rain = weather?.rainfall ?? 0;
  const temp = weather?.temperature ?? 20;
  
  // Convert wind direction to radians for vector math
  // Wind direction is where wind comes FROM, so we want the direction it blows TO (+180 deg)
  const windAngleRad = ((windDir + 180) % 360) * (Math.PI / 180);
  
  // Wind bias strength (0 to 1 based on speed)
  const windBiasStrength = Math.min(1, windSpeed / 50);

  // 3. Determine base intensity for the selected layer
  let baseIntensity = 0;
  switch (layerType) {

    case 'rainfall':
      baseIntensity = Math.min(1, rain / 50); // 50mm/h is extreme
      break;
    case 'flood':
      // Flood risk combines rain and a base risk assumption
      baseIntensity = Math.min(1, (rain / 30) * 0.8 + 0.2); 
      break;
    case 'heat':
      baseIntensity = Math.max(0, Math.min(1, (temp - 25) / 20)); // Scales from 25C to 45C
      break;
    case 'composite':
    default:
      const rainScore = Math.min(1, rain / 50);
      const tempScore = Math.max(0, Math.min(1, (temp - 25) / 20));
      baseIntensity = Math.max(rainScore, tempScore);
      break;
  }

  // If there's barely any intensity, we still generate a very light ambient map
  if (baseIntensity < 0.1) baseIntensity = 0.1;

  // Approx conversion from km to degrees (very rough, fine for small viz)
  const latRadian = center.lat * (Math.PI / 180);
  const kmPerLat = 111.32;
  const kmPerLng = 40075 * Math.cos(latRadian) / 360;

  // Procedural clustering centers (to avoid perfect radial spread)
  const clusters = [
    { offsetLat: 0, offsetLng: 0, weight: 1.0 }, // Main center
    { offsetLat: (Math.random() - 0.5) * 0.5, offsetLng: (Math.random() - 0.5) * 0.5, weight: 0.8 },
    { offsetLat: (Math.random() - 0.5) * 0.8, offsetLng: (Math.random() - 0.5) * 0.8, weight: 0.6 },
  ];

  for (let i = 0; i < numPoints; i++) {
    // Select a cluster
    const cluster = clusters[Math.floor(Math.random() * clusters.length)];

    // Gaussian-like random distribution (Box-Muller)
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    
    // Spread based on radius
    let spreadKm = (z0 / 3) * radiusKm; // 99% within radiusKm
    
    // Random angle
    const angle = Math.random() * 2 * Math.PI;

    // Apply wind directional bias
    // Shift the center of the distribution downwind
    const windShiftKm = windBiasStrength * radiusKm * 0.4 * Math.random();
    const windShiftLat = Math.cos(windAngleRad) * windShiftKm;
    const windShiftLng = Math.sin(windAngleRad) * windShiftKm;

    // Additional terrain bias based on layer type
    let terrainShiftLat = 0;
    let terrainShiftLng = 0;
    
    if (layerType === 'flood' || layerType === 'rainfall') {
      // Tend to accumulate in "valleys" - simulate by shifting points slightly downwards (south) or towards a procedural basin
      terrainShiftLat = -Math.abs(z0) * radiusKm * 0.1; 
    }

    // Calculate final offsets in km
    const dLatKm = (Math.cos(angle) * spreadKm) + windShiftLat + terrainShiftLat + (cluster.offsetLat * radiusKm);
    const dLngKm = (Math.sin(angle) * spreadKm) + windShiftLng + terrainShiftLng + (cluster.offsetLng * radiusKm);

    // Convert to degrees
    const dLat = dLatKm / kmPerLat;
    const dLng = dLngKm / kmPerLng;

    const pointLat = center.lat + dLat;
    const pointLng = center.lng + dLng;

    // Distance from true center (0 to 1)
    const normalizedDist = Math.min(1, Math.sqrt(dLatKm * dLatKm + dLngKm * dLngKm) / (radiusKm * 1.5));
    
    // Gaussian falloff for intensity
    const falloff = Math.exp(-Math.pow(normalizedDist * 2.5, 2));
    
    // Noise variation (0.8 to 1.2)
    const noise = 0.8 + Math.random() * 0.4;
    
    const intensity = baseIntensity * cluster.weight * falloff * noise;

    // Only add points with meaningful intensity
    if (intensity > 0.05) {
      points.push([pointLat, pointLng, intensity]);
    }
  }

  return points;
}
