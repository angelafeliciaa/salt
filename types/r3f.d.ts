// Properly extend JSX IntrinsicElements with React Three Fiber's elements
import type { ThreeElements } from "@react-three/fiber";
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {
      // Explicit fallbacks for common elements used in this project
      mesh: any;
      group: any;
      ambientLight: any;
      directionalLight: any;
      pointLight: any;
      axesHelper: any;
      gridHelper: any;
      sphereGeometry: any;
      ringGeometry: any;
      meshStandardMaterial: any;
      meshBasicMaterial: any;
    }
  }
}
export {};
