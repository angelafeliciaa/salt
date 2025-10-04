import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Get NASA API key from environment variables
  const NASA_API_KEY = process.env.NASA_API_KEY || 'DEMO_KEY';
  
  // Log that we're using the environment variable (remove in production)
  console.log(`Using NASA API Key: ${NASA_API_KEY.substring(0, 4)}... (from environment)`);
  
  try {
    // Get parameters
    const { searchParams } = new URL(request.url);
    const hazardousOnly = searchParams.get('hazardous_only') !== 'false'; // Default to true
    const maxPages = 10; // Maximum number of pages to fetch
    
    // Collect all asteroids from multiple pages
    let allNeos: any[] = [];
    let errorOccurred = false;
    
    // Fetch multiple pages of data
    for (let page = 0; page < maxPages; page++) {
      try {
        console.log(`Fetching NEO data page ${page}: ${`https://api.nasa.gov/neo/rest/v1/neo/browse?page=${page}&api_key=${NASA_API_KEY}`}`);
        
        // Fetch data from NASA API
        const response = await fetch(
          `https://api.nasa.gov/neo/rest/v1/neo/browse?page=${page}&api_key=${NASA_API_KEY}`
        );
        
        if (!response.ok) {
          console.error(`NASA API responded with status: ${response.status} for page ${page}`);
          errorOccurred = true;
          break;
        }
        
        const data = await response.json();
        
        // Add the current page's NEOs to our collection
        if (data.near_earth_objects && Array.isArray(data.near_earth_objects)) {
          allNeos = [...allNeos, ...data.near_earth_objects];
        } else {
          console.error(`Invalid data format for page ${page}`);
          errorOccurred = true;
          break;
        }
        
        // Check if we've reached the end of the data
        if (!data.page.total_pages || page >= data.page.total_pages - 1) {
          break;
        }
      } catch (err) {
        console.error(`Error fetching page ${page}:`, err);
        errorOccurred = true;
        break;
      }
    }
    
    if (allNeos.length === 0) {
      if (errorOccurred) {
        return NextResponse.json({ error: 'Error fetching asteroid data' }, { status: 500 });
      } else {
        return NextResponse.json({ error: 'No asteroid data available' }, { status: 404 });
      }
    }
    
    console.log(`Fetched ${allNeos.length} total asteroids from NASA API`);
    
    // Apply filtering
    let filteredNeos = allNeos;
    if (hazardousOnly) {
      filteredNeos = allNeos.filter((neo: any) => neo.is_potentially_hazardous_asteroid);
      
      if (filteredNeos.length === 0) {
        return NextResponse.json({ error: 'No potentially hazardous asteroids found' }, { status: 404 });
      }
      
      console.log(`Filtered to ${filteredNeos.length} potentially hazardous asteroids out of ${allNeos.length} total`);
    }
    
      // Process the data to extract only the information we need
    const processedNeos = filteredNeos.map((neo: any) => ({
      id: neo.id,
      name: neo.name,
      diameter: {
        min: neo.estimated_diameter?.kilometers?.estimated_diameter_min || 0,
        max: neo.estimated_diameter?.kilometers?.estimated_diameter_max || 0,
        avg: neo.estimated_diameter?.kilometers ? 
             (neo.estimated_diameter.kilometers.estimated_diameter_min + 
              neo.estimated_diameter.kilometers.estimated_diameter_max) / 2 : 0
      },
      isPotentiallyHazardous: neo.is_potentially_hazardous_asteroid || false,
      closeApproachData: (neo.close_approach_data || []).map((approach: any) => ({
        date: approach.close_approach_date || 'Unknown',
        velocity: {
          kmPerSecond: approach.relative_velocity?.kilometers_per_second || '0',
          kmPerHour: approach.relative_velocity?.kilometers_per_hour || '0',
        },
        missDistance: {
          astronomical: approach.miss_distance?.astronomical || '0',
          kilometers: approach.miss_distance?.kilometers || '0',
        },
        orbitingBody: approach.orbiting_body || 'Unknown'
      })),
      orbitData: {
        orbitId: neo.orbital_data?.orbit_id || 'Unknown',
        orbitDeterminationDate: neo.orbital_data?.orbit_determination_date || 'Unknown',
        firstObservation: neo.orbital_data?.first_observation_date || 'Unknown',
        lastObservation: neo.orbital_data?.last_observation_date || 'Unknown',
        dataArcInDays: neo.orbital_data?.data_arc_in_days || 0,
        orbitClass: neo.orbital_data?.orbit_class?.orbit_class_type || 'Unknown',
      }
    }));    console.log(`Returning ${processedNeos.length} potentially hazardous asteroids`);
    return NextResponse.json({
      asteroids: processedNeos,
      metadata: {
        totalCount: allNeos.length,
        hazardousCount: filteredNeos.length
      }
    });
    
  } catch (error) {
    console.error('Error fetching NEO data:', error);
    return NextResponse.json({ error: 'Failed to fetch NEO data' }, { status: 500 });
  }
}