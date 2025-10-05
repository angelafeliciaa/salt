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

def randomize_asteroids(asteroids):
    """
    Randomize asteroids into groups instead of categorizing by size
    """
    # Randomize asteroids instead of sorting by diameter
    randomized_asteroids = asteroids.copy()
    random.shuffle(randomized_asteroids)
    
    total = len(randomized_asteroids)
    
    # Determine randomized categories (no longer based on actual size)
    very_small = randomized_asteroids[:int(total * 0.2)]  # Random 20%
    small = randomized_asteroids[int(total * 0.2):int(total * 0.4)]  # Random 20-40%
    medium = randomized_asteroids[int(total * 0.4):int(total * 0.6)]  # Random 40-60%
    large = randomized_asteroids[int(total * 0.6):int(total * 0.8)]  # Random 60-80%
    extra_large = randomized_asteroids[int(total * 0.8):]  # Random top 20%
    
    return {
        'very_small': very_small,
        'small': small,
        'medium': medium,
        'large': large,
        'extra_large': extra_large
    }

def select_samples(categorized_asteroids, samples_per_category=200):
    """
    Select a random sample of asteroids from each randomized group
    Default is now 200 per group for a total of 1000 asteroids
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
    input_file = "sbdb_query_results.csv"
    output_file = "selected_asteroids.csv"
    api_output_file = "..\\app\\api\\neo\\selected_asteroids.csv"
    
    print("Reading asteroid data...")
    asteroids = read_asteroid_data(input_file)
    print(f"Found {len(asteroids)} asteroids with valid diameter and orbital data")
    
    print("Randomizing asteroids...")
    categorized = randomize_asteroids(asteroids)
    
    # Print statistics for each randomized group
    for category, category_asteroids in categorized.items():
        if category_asteroids:
            min_diameter = min(a['diameter'] for a in category_asteroids)
            max_diameter = max(a['diameter'] for a in category_asteroids)
            # Calculate average kinetic energy for this group
            total_energy = sum(a['energy'] for a in category_asteroids)
            avg_energy = total_energy / len(category_asteroids)
            # Format energy in scientific notation for readability
            avg_energy_sci = f"{avg_energy:.2e}"
            print(f"{category} (randomized): {len(category_asteroids)} asteroids, diameter range: {min_diameter:.2f} - {max_diameter:.2f} km")
            print(f"   Average kinetic energy: {avg_energy_sci} joules")
    
    print("Selecting random sample...")
    samples_per_category = 200  # To get approximately 1000 asteroids (200 from each of 5 randomized groups)
    selected_asteroids = select_samples(categorized, samples_per_category)
    
    print("Statistics for selected sample:")
    # Group selected asteroids by category for energy analysis
    selected_by_category = defaultdict(list)
    for asteroid in selected_asteroids:
        # Determine which category this asteroid belongs to
        for category, category_asteroids in categorized.items():
            if asteroid in category_asteroids:
                selected_by_category[category].append(asteroid)
                break
    
    # Print energy statistics for selected asteroids by randomized group
    for category, asteroids in selected_by_category.items():
        if asteroids:
            total_energy = sum(a['energy'] for a in asteroids)
            avg_energy = total_energy / len(asteroids)
            avg_energy_sci = f"{avg_energy:.2e}"
            print(f"Selected {category} (random): {len(asteroids)} asteroids, avg energy: {avg_energy_sci} joules")
    
    print("Writing selected asteroids to CSV...")
    write_to_csv(selected_asteroids, output_file)
    # Also write to the API directory to ensure the web app uses the new data
    write_to_csv(selected_asteroids, api_output_file)
    # Calculate overall average energy of selected asteroids
    if selected_asteroids:
        total_energy = sum(a['energy'] for a in selected_asteroids)
        overall_avg_energy = total_energy / len(selected_asteroids)
        overall_avg_energy_sci = f"{overall_avg_energy:.2e}"
        print(f"Overall average kinetic energy for all selected asteroids: {overall_avg_energy_sci} joules")
    
    print(f"Successfully wrote {len(selected_asteroids)} asteroids to {output_file}")
    print(f"Also wrote to {api_output_file} for API access")

if __name__ == "__main__":
    main()
