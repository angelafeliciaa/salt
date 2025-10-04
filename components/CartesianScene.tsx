"use client";

import React, { PropsWithChildren, ReactNode, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, GizmoHelper, GizmoViewport, Grid, Sphere, Line, Environment } from "@react-three/drei";
import * as THREE from "three";

type Vec3 = [number, number, number];

export type CartesianSceneProps = {
  gridSize?: number;
  gridDivisions?: number;
  showAxes?: boolean;
  showGrids?: boolean;
  background?: string;
  cameraPosition?: Vec3;
  /**
   * Optional content to render at the origin. By default a small sphere is rendered.
   */
  originNode?: ReactNode;
} & PropsWithChildren;

/**
 * A reusable 3D Cartesian space built with React Three Fiber.
 * - Axes helper at the origin
 * - Grid helpers on XY, XZ, and YZ planes
 * - Orbit controls for easy navigation
 * - Ambient/directional lighting
 * - Slots children so you can easily pop objects at any [x,y,z]
 */
export function CartesianScene({
  gridSize = 300,
  gridDivisions = 30,
  showAxes = true,
  showGrids = true,
  background = "#0a0a0a",
  cameraPosition = [200, 150, 200],
  originNode,
  children,
}: CartesianSceneProps) {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Canvas camera={{ position: cameraPosition, fov: 45, far: 10000 }} style={{ background }}>

        {/* IBL lighting */}
        {/* <Environment preset="city" /> */}

        {/* Axes at origin using typed Line from drei */}
        {showAxes && (
          <>
            <Line points={[[-gridSize / 2, 0, 0], [gridSize / 2, 0, 0]]} color="#ef4444" lineWidth={2} />
            <Line points={[[0, -gridSize / 2, 0], [0, gridSize / 2, 0]]} color="#10b981" lineWidth={2} />
            <Line points={[[0, 0, -gridSize / 2], [0, 0, gridSize / 2]]} color="#3b82f6" lineWidth={2} />
          </>
        )}

        {/* Grids on the three major planes using drei's Grid (GPU-accelerated) */}
        {showGrids && (
          <>
            {/* XZ */}
            <Grid
              args={[gridSize, gridDivisions]}
              sectionColor="#1f2937"
              cellColor="#374151"
              infiniteGrid={false}
              fadeDistance={0}
              position={[0, 0, 0]}
            />
            {/* XY */}
            <Grid
              args={[gridSize, gridDivisions]}
              sectionColor="#1f2937"
              cellColor="#374151"
              infiniteGrid={false}
              fadeDistance={0}
              rotation={[Math.PI / 2, 0, 0]}
              position={[0, 0, 0]}
            />
            {/* YZ */}
            <Grid
              args={[gridSize, gridDivisions]}
              sectionColor="#1f2937"
              cellColor="#374151"
              infiniteGrid={false}
              fadeDistance={0}
              rotation={[0, 0, Math.PI / 2]}
              position={[0, 0, 0]}
            />
          </>
        )}

  {/* Origin marker (center ball) */}
        {originNode ?? <CenterSphere />}

        {/* User content */}
        {children}

        {/* Camera controls & gizmo */}
        <OrbitControls makeDefault enableDamping dampingFactor={0.08} />
        <GizmoHelper alignment="bottom-right" margin={[80, 80] as any}>
          <GizmoViewport axisColors={["#ef4444", "#10b981", "#3b82f6"]} labelColor="white" />
        </GizmoHelper>
      </Canvas>
    </div>
  );
}

/** Small glowing sphere at the origin */
export function CenterSphere({ radius = 0.4 }: { radius?: number }) {
  const material = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#fdba74", emissive: new THREE.Color("#fb923c"), emissiveIntensity: 0.6 }),
    []
  );
  return (
    <Sphere args={[radius, 32, 32]} position={[0, 0, 0]} material={material} />
  );
}

/**
 * Simple helper to pop a small marker at any [x,y,z]
 */
export function Marker({ position, color = "#e5e7eb", size = 0.12 }: { position: Vec3; color?: string; size?: number }) {
  const material = useMemo(() => new THREE.MeshStandardMaterial({ color }), [color]);
  return <Sphere args={[size, 16, 16]} position={position} material={material} />;
}

/**
 * Generic body primitive for future planets/asteroids.
 * Pass geometry/material as children or use the default sphere.
 */
export function Body({ position, children }: { position: Vec3; children?: ReactNode }) {
  return (
    <group position={position}>{children ?? <CenterSphere radius={0.2} />}</group>
  );
}

export default CartesianScene;
