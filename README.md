# NASA Solar System Visualizer

A 3D interactive visualization of the solar system built with Next.js, React Three Fiber, and Three.js.

## Features

- Interactive 3D Cartesian space with grid and axes
- Realistic representation of the Sun and inner planets (Mercury, Venus, Earth, Mars)
- Accurate orbital mechanics with proper scaling of distances and periods
- Enhanced visual effects:
  - Animated shader-based Sun with realistic glow and surface details
  - Planets with atmospheres and improved textures
  - Dynamic star field background
  - Special effects including particle-based explosions
- Interactive controls for animation speed and labels

## Technical Details

- Next.js for React framework
- React Three Fiber for 3D rendering in React
- Three.js as the underlying 3D engine
- Custom GLSL shaders for special effects

## Future Development

- Integration with NASA's NEO (Near Earth Object) API to visualize asteroids
- Addition of outer planets and moons
- Enhanced textures and visual effects
- Interactive data display for celestial bodies

## Usage

1. Install dependencies:
   ```
   npm install
   ```

2. Run the development server:
   ```
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Controls

- Click and drag to rotate the view
- Scroll to zoom in and out
- Use the slider to adjust animation speed
- Toggle labels on/off
- Double-click anywhere to trigger explosion effects (Easter egg)

## License

MIT License