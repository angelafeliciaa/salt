"use client";

import React, { useRef } from "react";
import { useFrame, extend } from "@react-three/fiber";
import { Sphere, shaderMaterial } from "@react-three/drei";
import * as THREE from "three";

// Import the shader code directly since TypeScript can't import GLSL files
const noiseShader = `
vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
  return mod289(((x * 34.0) + 1.0) * x);
}

vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}

float noise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  // First corner
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  // Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  //  x0 = x0 - 0. + 0.0 * C
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1. + 3.0 * C.xxx;

  // Permutations
  i = mod289(i);
  vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  // Gradients
  // ( N*N points uniformly over a square, mapped onto an octahedron.)
  float n_ = 1.0 / 7.0; // N=7
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,N*N)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);    // mod(j,N)

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  //Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  // Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`;

// Create a custom shader material for the Sun
const SunShaderMaterial = shaderMaterial(
  {
    time: 0,
    emissiveIntensity: 2.0,
  },
  // Vertex Shader
  `
  varying vec2 vUv;
  varying vec3 vPosition;

  void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,
  // Fragment Shader
  `
  uniform float time;
  uniform float emissiveIntensity;
  varying vec2 vUv;
  varying vec3 vPosition;

  ${noiseShader}

  void main() {
    // Create a moving noise pattern
    float noiseScale = 1.5;
    float noiseValue = noise(vPosition * noiseScale + time * 0.1);
    
    // Create color variations based on noise
    vec3 baseColor = vec3(1.0, 0.8, 0.0);
    vec3 hotColor = vec3(1.0, 0.4, 0.0);
    vec3 color = mix(baseColor, hotColor, noiseValue * 0.7 + 0.3);
    
    // Add intensity variation
    float intensity = (noiseValue * 0.5 + 0.9) * emissiveIntensity;
    
    gl_FragColor = vec4(color * intensity, 1.0);
  }
  `
);

// Register the custom shader material
extend({ SunShaderMaterial });

// Create additional sun components
const SunAtmosphere = ({ scale = 1.05, intensity = 0.3 }) => {
  return (
    <Sphere args={[0.4 * scale, 32, 32]} position={[0, 0, 0]}>
      {/* @ts-expect-error r3f intrinsic */}
      <meshBasicMaterial 
        color="#ff8a00" 
        transparent 
        opacity={intensity} 
        side={THREE.BackSide} 
      />
    </Sphere>
  );
};

const SunGlow = ({ scale = 1.2, intensity = 0.15 }) => {
  const glowRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (glowRef.current) {
      // Make the glow slowly pulse
      const t = clock.getElapsedTime();
      glowRef.current.scale.set(
        1.0 + Math.sin(t * 0.5) * 0.05,
        1.0 + Math.sin(t * 0.5) * 0.05,
        1.0 + Math.sin(t * 0.5) * 0.05
      );
    }
  });

  return (
    // @ts-expect-error r3f intrinsic
    <mesh ref={glowRef}>
      {/* @ts-expect-error r3f intrinsic */}
      <sphereGeometry args={[0.4 * scale, 32, 32]} />
      {/* @ts-expect-error r3f intrinsic */}
      <meshBasicMaterial 
        color="#ffcf37" 
        transparent 
        opacity={intensity}
        side={THREE.BackSide}
        blending={THREE.AdditiveBlending}
      />
      {/* @ts-expect-error r3f intrinsic */}
    </mesh>
  );
};interface EnhancedSunProps {
  radius?: number;
  position?: [number, number, number];
  intensity?: number;
}

export function EnhancedSun({
  radius = 0.4,
  position = [0, 0, 0],
  intensity = 3
}: EnhancedSunProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const [hovered, setHovered] = React.useState(false);
  
  // Update shader uniforms on each frame
  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = clock.getElapsedTime();
      materialRef.current.uniforms.emissiveIntensity.value = hovered ? intensity * 1.5 : intensity;
    }
  });

  return (
    // @ts-expect-error r3f intrinsic
    <group 
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Main sun sphere with animated shader */}
      <Sphere args={[radius, 64, 32]}>
        {/* @ts-expect-error custom material */}
        <sunShaderMaterial ref={materialRef} emissiveIntensity={intensity} />
      </Sphere>
      
      {/* Inner atmosphere layer */}
      <SunAtmosphere scale={1.05} intensity={0.3} />
      
      {/* Outer glow layer */}
      <SunGlow scale={1.25} intensity={0.15} />
      
      {/* Bright light source */}
      {/* @ts-expect-error r3f intrinsic */}
      <pointLight 
        intensity={intensity * 20} 
        distance={15}
        color="#fffbeb"
        castShadow
      />
      {/* @ts-expect-error r3f intrinsic */}
    </group>
  );
}

export default EnhancedSun;