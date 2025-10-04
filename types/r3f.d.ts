// Properly extend JSX IntrinsicElements with React Three Fiber's elements
import type { ThreeElements } from "@react-three/fiber";
declare module "react" {
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
      dodecahedronGeometry: any;
      meshStandardMaterial: any;
      meshBasicMaterial: any;
      meshPhongMaterial: any;
      instancedMesh: any;
      points: any;
      sunShaderMaterial: any;
      customShaderMaterial: any;
    }
  }
}

// Allow importing GLSL as strings
declare module "*.glsl" {
  const content: string;
  export default content;
}

export {};

// Allow importing image assets and getting a URL string
declare module "*.jpg" {
  const src: string;
  export default src;
}
declare module "*.jpeg" {
  const src: string;
  export default src;
}
declare module "*.png" {
  const src: string;
  export default src;
}
