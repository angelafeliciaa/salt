import { useRef } from 'react'
import { useFrame, extend } from '@react-three/fiber'
import { Billboard, shaderMaterial } from '@react-three/drei'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

// Inline GLSL noise to avoid requiring a loader
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
}`

const Sun = () => {

    const CustomShaderMaterial = shaderMaterial(
        { emissiveIntensity: 5.0, time: 0 },
        // Vertex Shader
        `
        varying vec2 vUv;
        varying vec3 vPosition;
        varying vec3 vNormal;

        void main() {
            vUv = uv;
            vPosition = position;
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
        `,
        // Fragment Shader
        `
        uniform float time;
        uniform float emissiveIntensity;
        varying vec2 vUv;
        varying vec3 vPosition;
        varying vec3 vNormal;

        ${noiseShader}

        void main() {
            // Create multiple layers of noise at different scales
            float noiseValue1 = noise(vPosition * 1.0 + time * 0.2);
            float noiseValue2 = noise(vPosition * 1.5 + time * 0.3 + 10.0);
            float noiseValue3 = noise(vPosition * 3.0 + time * 0.1 + 20.0) * 0.5;
            
            // Combine noise layers
            float combinedNoise = noiseValue1 * 0.6 + noiseValue2 * 0.3 + noiseValue3 * 0.1;
            
            // Create edge highlighting based on the view angle
            float edgeFactor = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 1.5);
            
            // Dynamic color based on noise
            vec3 baseColor = mix(
                vec3(1.0, 0.2, 0.0),  // Deep orange/red
                vec3(1.0, 0.5, 0.0),  // Bright orange
                combinedNoise
            );
            
            // Add yellow to hot spots
            baseColor = mix(baseColor, vec3(1.0, 0.9, 0.3), noiseValue3 * noiseValue3 * 0.6);
            
            // Enhance edges
            baseColor = mix(baseColor, vec3(1.0, 0.9, 0.5), edgeFactor * 0.4);
            
            // Calculate final intensity with edge highlighting
            float intensity = (combinedNoise * 0.5 + 0.5) * emissiveIntensity;
            intensity = intensity * (1.0 + edgeFactor * 0.3);

            gl_FragColor = vec4(baseColor * intensity, 1.0);
        }
        `
    )

    extend({ CustomShaderMaterial })

    const shaderRef = useRef<any>(null)

    // References for the glow layers
    const glow1Ref = useRef<THREE.Mesh>(null)
    const glow2Ref = useRef<THREE.Mesh>(null)
    const glow3Ref = useRef<THREE.Mesh>(null)
    
    // Update the time uniform on each frame and animate the glow layers
    useFrame(({ clock }) => {
        // Update shader time
        if (shaderRef.current) {
            shaderRef.current.uniforms.time.value = clock.elapsedTime
        }
        
        // Subtle pulsating animation for glow layers
        const t = clock.getElapsedTime()
        
        if (glow1Ref.current) {
            glow1Ref.current.scale.set(
                1.0 + Math.sin(t * 0.5) * 0.02,
                1.0 + Math.sin(t * 0.5) * 0.02,
                1.0 + Math.sin(t * 0.5) * 0.02
            )
        }
        
        if (glow2Ref.current) {
            glow2Ref.current.scale.set(
                1.0 + Math.sin(t * 0.3) * 0.03,
                1.0 + Math.sin(t * 0.3) * 0.03,
                1.0 + Math.sin(t * 0.3) * 0.03
            )
        }
        
        if (glow3Ref.current) {
            glow3Ref.current.scale.set(
                1.0 + Math.sin(t * 0.2) * 0.04,
                1.0 + Math.sin(t * 0.2) * 0.04,
                1.0 + Math.sin(t * 0.2) * 0.04
            )
        }
    })

    return (
        <group userData={{ type: 'Sun' }}>
            {/* Main sun sphere with custom shader for surface details */}
            <mesh>
                <sphereGeometry args={[15, 32, 32]} />
                <customShaderMaterial ref={shaderRef} emissiveIntensity={8} time={0} />
            </mesh>

            {/* Multi-layered outer glow spheres */}
            {/* First glow layer */}
            <mesh ref={glow1Ref}>
                <sphereGeometry args={[16.5, 32, 32]} />
                <meshBasicMaterial 
                  color="#ff7b00" 
                  transparent={true} 
                  opacity={0.15} 
                  side={THREE.DoubleSide}
                />
            </mesh>
            
            {/* Second glow layer */}
            <mesh ref={glow2Ref}>
                <sphereGeometry args={[18, 32, 32]} />
                <meshBasicMaterial 
                  color="#ff9500" 
                  transparent={true} 
                  opacity={0.1} 
                  side={THREE.DoubleSide}
                />
            </mesh>
            
            {/* Outermost glow layer */}
            <mesh ref={glow3Ref}>
                <sphereGeometry args={[22, 32, 32]} />
                <meshBasicMaterial 
                  color="#ffb700" 
                  transparent={true} 
                  opacity={0.05} 
                  side={THREE.DoubleSide}
                />
            </mesh>
            
            {/* Name label */}
            <Billboard position={[0, 15 * 1.3, 0]}>
              <Text
                fontSize={6 * 0.8}
                color="#ffffff"
                anchorX="center"
                anchorY="bottom"
                outlineWidth={3 * 0.05}
                outlineColor="#00000077"
              >
                Sun
              </Text>
            </Billboard>

            {/* Light sources */}
            <pointLight position={[0, 0, 0]} intensity={80000} color={'rgb(255, 220, 100)'} />
            
            {/* Additional light to enhance the glow effect */}
            <pointLight position={[0, 0, 0]} intensity={20000} color={'rgb(255, 150, 50)'} distance={100} />
        </group>
    )
}

export default Sun