import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Get NASA API key from environment variables
  const NASA_API_KEY = process.env.NASA_API_KEY || 'DEMO_KEY';
  
  // Log that we're using the environment variable (remove in production)
  console.log(`Using NASA API Key: ${NASA_API_KEY.substring(0, 4)}... (from environment)`);
  
  try {
    // Get the date range for NEOs (defaulting to 2025)
    const { searchParams } = new URL(request.url);
    const startDate = '2025-01-01';
    const endDate = '2025-01-07'; // Max 7 days per request
    
    console.log(`Fetching NEO data: ${`https://api.nasa.gov/neo/rest/v1/feed?start_date=${startDate}&end_date=${endDate}&api_key=${NASA_API_KEY}`}`);
    // Fetch data from NASA API
    const response = await fetch(
      `https://api.nasa.gov/neo/rest/v1/feed?start_date=${startDate}&end_date=${endDate}&api_key=${NASA_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`NASA API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract and flatten the NEOs by date into a single array
    const neos = Object.values(data.near_earth_objects).flat();
    
    // Process the data to extract only the information we need
    const processedNeos = neos.map((neo: any) => ({
      id: neo.id,
      name: neo.name,
      diameter: {
        min: neo.estimated_diameter.kilometers.estimated_diameter_min,
        max: neo.estimated_diameter.kilometers.estimated_diameter_max,
        avg: (neo.estimated_diameter.kilometers.estimated_diameter_min + neo.estimated_diameter.kilometers.estimated_diameter_max) / 2
      },
      isPotentiallyHazardous: neo.is_potentially_hazardous_asteroid,
      closeApproachData: neo.close_approach_data.map((approach: any) => ({
        date: approach.close_approach_date,
        velocity: {
          kmPerSecond: approach.relative_velocity.kilometers_per_second,
          kmPerHour: approach.relative_velocity.kilometers_per_hour,
        },
        missDistance: {
          astronomical: approach.miss_distance.astronomical,
          kilometers: approach.miss_distance.kilometers,
        },
        orbitingBody: approach.orbiting_body
      })),
      orbitData: {
        orbitId: neo.orbital_data?.orbit_id,
        orbitDeterminationDate: neo.orbital_data?.orbit_determination_date,
        firstObservation: neo.orbital_data?.first_observation_date,
        lastObservation: neo.orbital_data?.last_observation_date,
        dataArcInDays: neo.orbital_data?.data_arc_in_days,
        orbitClass: neo.orbital_data?.orbit_class?.orbit_class_type,
      }
    }));
    
    return NextResponse.json(processedNeos);
    
  } catch (error) {
    console.error('Error fetching NEO data:', error);
    return NextResponse.json({ error: 'Failed to fetch NEO data' }, { status: 500 });
  }
}