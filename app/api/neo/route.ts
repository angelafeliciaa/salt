import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

export async function GET(request: NextRequest) {
  console.log('Reading asteroid data from CSV file');
  
  try {
    // Get parameters
    const { searchParams } = new URL(request.url);
    // Define the path to the CSV file
    const csvFilePath = path.join(process.cwd(), 'app', 'api', 'neo', 'selected_asteroids.csv');
    
    // Read the CSV file
    const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
    
    // Parse the CSV data
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_quotes: true,
      relax_column_count: true
    });
    
    // Take only the first 100 records
    const limitedRecords = records.slice(0, 100);
    
    console.log(`Read ${limitedRecords.length} asteroid records from CSV file`);
    
    // Transform CSV data to match our expected format
    let allNeos: any[] = [];
    let errorOccurred = false;
    
    try {
      allNeos = limitedRecords.map((record: any) => {
        // Determine if asteroid is potentially hazardous
        // In the CSV, "pha" column has Y for potentially hazardous
        const isPotentiallyHazardous = record.pha === 'Y';
        
        // Parse diameter value (could be empty in CSV)
        const diameterValue = parseFloat(record.diameter) || 0;
        
        // Calculate a range for diameter (±15% of value as an approximation)
        const minDiameter = diameterValue * 0.85;
        const maxDiameter = diameterValue * 1.15;
        
        // Convert AU to kilometers - 1 AU = 149,597,870.7 kilometers
        const moidKm = (parseFloat(record.moid || '0') * 149597870.7).toFixed(0);
        
        // Get orbital period data from 'per' (days) and 'per_y' (years) columns
        const orbitalPeriodDays = parseFloat(record.per) || 0;
        const orbitalPeriodYears = parseFloat(record.per_y) || 0;
        
        return {
          id: record.spkid,
          name: record.name ? record.name : record.full_name.trim(),
          estimated_diameter: {
            kilometers: {
              estimated_diameter_min: minDiameter,
              estimated_diameter_max: maxDiameter
            }
          },
          is_potentially_hazardous_asteroid: isPotentiallyHazardous,
          close_approach_data: [
            {
              // Use orbital period instead of close approach date
              orbital_period: {
                days: orbitalPeriodDays.toFixed(1),
                years: orbitalPeriodYears.toFixed(2)
              },
              relative_velocity: {
                kilometers_per_second: (parseFloat(record.q) * 30).toFixed(2), // Approximating velocity based on q
                kilometers_per_hour: (parseFloat(record.q) * 108000).toFixed(2)
              },
              miss_distance: {
                astronomical: record.moid || '0',
                kilometers: moidKm
              },
              orbiting_body: 'Earth'
            }
          ],
          orbital_data: {
            orbit_id: record.orbit_id || 'Unknown',
            orbit_determination_date: record.epoch_cal || 'Unknown',
            first_observation_date: record.first_obs || 'Unknown',
            last_observation_date: record.last_obs || 'Unknown',
            data_arc_in_days: record.data_arc || 0,
            orbit_class: {
              orbit_class_type: record.class || 'Unknown'
            }
          }
        };
      });
    } catch (err) {
      console.error('Error processing CSV data:', err);
      errorOccurred = true;
    }
    
    if (allNeos.length === 0) {
      if (errorOccurred) {
        return NextResponse.json({ error: 'Error reading asteroid data from CSV' }, { status: 500 });
      } else {
        return NextResponse.json({ error: 'No asteroid data available in CSV' }, { status: 404 });
      }
    }
    
    console.log(`Processed ${allNeos.length} total asteroids from CSV file`);
    
    // Apply filtering only if explicitly requested
    let filteredNeos = allNeos;

    // Process the data to extract only the information we need (same structure as before)
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
        // Include orbital period instead of date
        orbitalPeriod: {
          days: approach.orbital_period?.days || '0',
          years: approach.orbital_period?.years || '0',
        },
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
    }));
    
    console.log(`Returning ${processedNeos.length} asteroids from CSV data`);
    return NextResponse.json({
      asteroids: processedNeos,
      metadata: {
        totalCount: allNeos.length,
        hazardousCount: filteredNeos.length,
        source: 'CSV file (first 100 records)'
      }
    });
    
  } catch (error) {
    console.error('Error processing CSV data:', error);
    return NextResponse.json({ error: 'Failed to process asteroid data from CSV' }, { status: 500 });
  }
}