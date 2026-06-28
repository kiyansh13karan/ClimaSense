import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { startLat, startLng } = body;

    if (!startLat || !startLng) {
      return NextResponse.json({ error: 'Missing start coordinates' }, { status: 400 });
    }

    // Simulate finding the nearest "Safe Zone" (Shelter)
    // We add an offset to simulate a location roughly 5-10 miles away in a safer elevation.
    const safeLat = startLat + 0.05;
    const safeLng = startLng + 0.05;

    // Fetch routing data from Open Source Routing Machine (OSRM)
    // URL format: /route/v1/driving/{lng},{lat};{lng},{lat}
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${safeLng},${safeLat}?overview=full&geometries=geojson`;

    const res = await fetch(osrmUrl);
    if (!res.ok) {
      throw new Error('Failed to fetch route from OSRM');
    }

    const data = await res.json();

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error('No route found');
    }

    // Get the route geometry (array of [lng, lat])
    const geometry = data.routes[0].geometry.coordinates;
    const distance = data.routes[0].distance; // in meters
    const duration = data.routes[0].duration; // in seconds

    // Convert GeoJSON [lng, lat] to Leaflet's [lat, lng] format
    const latLngs = geometry.map((coord: number[]) => [coord[1], coord[0]]);

    return NextResponse.json({
      safeZone: { lat: safeLat, lng: safeLng },
      route: latLngs,
      distance: (distance / 1000).toFixed(2) + ' km',
      duration: Math.round(duration / 60) + ' mins'
    });

  } catch (error: any) {
    console.error('Routing error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
