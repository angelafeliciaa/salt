import csv
import math
import random
from collections import defaultdict

# Constants
DENSITY = 3000  # kg/m^3 - average density for asteroids
PI = math.pi

def calculate_kinetic_energy(diameter, velocity):
    """
    Calculate kinetic energy (1/2 mv^2) of an asteroid
    diameter: in km
    velocity: in km/s
    Returns energy in joules
    """
    # Convert diameter to meters
    diameter_m = diameter * 1000
    
    # Calculate volume (assuming spherical shape)
    volume = (4/3) * PI * ((diameter_m / 2) ** 3)
    
    # Calculate mass
    mass = DENSITY * volume  # kg
    
    # Convert velocity to m/s
    velocity_ms = velocity * 1000
    
    # Calculate kinetic energy
    energy = 0.5 * mass * (velocity_ms ** 2)  # Joules
    
    return energy

def read_asteroid_data(file_path):
    """
    Read asteroid data from CSV file
    """
    asteroids = []
    
    with open(file_path, 'r') as csvfile:
        reader = csv.DictReader(csvfile)
        
        for row in reader:
            # Check if diameter exists and is not empty
            if row['diameter'] and row['diameter'].strip():
                try:
                    diameter = float(row['diameter'])
                    
                    # Calculate velocity from orbital parameters
                    # We'll use the semi-major axis (a) to estimate orbital velocity
                    # v = sqrt(GM/r) where G*M for the sun is approximately 1.327 × 10^20 m^3/s^2
                    # and r is the distance in meters
                    
                    if row['a'] and row['a'].strip():
                        a = float(row['a'])  # semi-major axis in AU
                        # Convert AU to meters (1 AU = 149,597,870,700 meters)
                        a_m = a * 149597870700
                        
                        # GM for the sun
                        GM = 1.327e20
                        
                        # Calculate velocity (m/s)
                        velocity = math.sqrt(GM / a_m)
                        
                        # Convert velocity to km/s
                        velocity_kms = velocity / 1000
                        
                        # Calculate kinetic energy
                        energy = calculate_kinetic_energy(diameter, velocity_kms)
                        
                        # Add to asteroids list
                        asteroid = {
                            'spkid': row['spkid'],
                            'full_name': row['full_name'],
                            'diameter': diameter,
                            'name': row['name'],
                            'velocity': velocity_kms,
                            'energy': energy
                        }
                        
                        # Add all original columns
                        for key, value in row.items():
                            if key not in asteroid:
                                asteroid[key] = value
                                
                        asteroids.append(asteroid)
                        
                except (ValueError, TypeError) as e:
                    # Skip rows with invalid diameter or semi-major axis
                    continue
    
    return asteroids

def categorize_by_size(asteroids):
    """
    Categorize asteroids by size
    """
    # Sort asteroids by diameter
    sorted_asteroids = sorted(asteroids, key=lambda x: x['diameter'])
    
    total = len(sorted_asteroids)
    
    # Determine size categories
    very_small = sorted_asteroids[:int(total * 0.2)]  # Bottom 20%
    small = sorted_asteroids[int(total * 0.2):int(total * 0.4)]  # 20-40%
    medium = sorted_asteroids[int(total * 0.4):int(total * 0.6)]  # 40-60%
    large = sorted_asteroids[int(total * 0.6):int(total * 0.8)]  # 60-80%
    extra_large = sorted_asteroids[int(total * 0.8):]  # Top 20%
    
    return {
        'very_small': very_small,
        'small': small,
        'medium': medium,
        'large': large,
        'extra_large': extra_large
    }

def select_samples(categorized_asteroids, samples_per_category=200):
    """
    Select a balanced sample of asteroids from each category
    Default is now 200 per category for a total of 1000 asteroids
    """
    selected = []
    
    for category, asteroids in categorized_asteroids.items():
        # Randomly select samples_per_category asteroids from this category
        if len(asteroids) <= samples_per_category:
            selected.extend(asteroids)
        else:
            selected.extend(random.sample(asteroids, samples_per_category))
    
    return selected

def write_to_csv(asteroids, output_file):
    """
    Write asteroid data to CSV file
    """
    if not asteroids:
        print("No asteroids to write")
        return
    
    with open(output_file, 'w', newline='') as csvfile:
        # Use the keys from the first asteroid as fieldnames
        fieldnames = list(asteroids[0].keys())
        
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        
        for asteroid in asteroids:
            writer.writerow(asteroid)

def main():
    input_file = "e:\\Github\\nasa\\utils\\sbdb_query_results.csv"
    output_file = "e:\\Github\\nasa\\utils\\selected_asteroids.csv"
    api_output_file = "e:\\Github\\nasa\\app\\api\\neo\\selected_asteroids.csv"
    
    print("Reading asteroid data...")
    asteroids = read_asteroid_data(input_file)
    print(f"Found {len(asteroids)} asteroids with valid diameter and orbital data")
    
    print("Categorizing asteroids by size...")
    categorized = categorize_by_size(asteroids)
    
    # Print statistics for each category
    for category, category_asteroids in categorized.items():
        if category_asteroids:
            min_diameter = min(a['diameter'] for a in category_asteroids)
            max_diameter = max(a['diameter'] for a in category_asteroids)
            print(f"{category}: {len(category_asteroids)} asteroids, diameter range: {min_diameter:.2f} - {max_diameter:.2f} km")
    
    print("Selecting balanced sample...")
    samples_per_category = 100  # To get 1000 asteroids (100 from each of 10 categories)
    selected_asteroids = select_samples(categorized, samples_per_category)
    
    print("Writing selected asteroids to CSV...")
    write_to_csv(selected_asteroids, output_file)
    # Also write to the API directory to ensure the web app uses the new data
    write_to_csv(selected_asteroids, api_output_file)
    print(f"Successfully wrote {len(selected_asteroids)} asteroids to {output_file}")
    print(f"Also wrote to {api_output_file} for API access")

if __name__ == "__main__":
    main()
