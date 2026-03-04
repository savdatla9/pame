"use client"

import { Canvas } from '@react-three/fiber';
import { Physics, useTrimesh, useSphere } from '@react-three/cannon';
import { OrbitControls } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';

function RampTrimesh() {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(5, 0);
    shape.lineTo(5, 3);
    shape.lineTo(0, 0);

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 4,
      bevelEnabled: false,
    });

    // FIX 1: Center the geometry so physics and visual align perfectly
    geo.center();

    return geo;
  }, []);

  const [vertices, indices] = useMemo(() => {
    const verts = geometry.attributes.position.array;

    let inds;

    if (geometry.index !== null) {
      // ✅ Geometry is indexed — use directly
      inds = geometry.index.array;
    } else {
      // ✅ Geometry is NON-indexed (ExtrudeGeometry case)
      // Every 3 vertices already form a triangle
      // Generate indices manually: [0,1,2, 3,4,5, 6,7,8 ...]
      inds = Array.from({ length: verts.length / 3 }, (_, i) => i);
    }

    return [verts, inds];
  }, [geometry]);

  // FIX 2: Only set position on the physics body (useTrimesh ref)
  // Do NOT set position on the mesh separately — it causes double offset
  const [ref] = useTrimesh(() => ({
    mass: 0,
    position: [-8, 1.5, 0], // Adjusted Y so ramp sits on ground
    rotation: [0, Math.PI / 2, 0], // Rotate to face the right direction
    args: [vertices, indices],
  }));

  // FIX 3: mesh gets ref directly — no extra position prop
  return (
    <mesh ref={ref} receiveShadow castShadow>
      <primitive object={geometry} />
      <meshStandardMaterial color="#e67e22" roughness={0.7} />
    </mesh>
  );
}

// Ground
function Ground() {
  const [ref] = useTrimesh(() => {
    const geo = new THREE.PlaneGeometry(30, 30);
    const verts = geo.attributes.position.array;
    const inds = geo.index.array;
    return {
      mass: 0,
      rotation: [-Math.PI / 2, 0, 0],
      args: [verts, inds],
    };
  });

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[30, 30]} />
      <meshStandardMaterial color="#2c3e50" />
    </mesh>
  );
}

// Test ball to verify collision
function Ball({ position }) {
  const [ref] = useSphere(() => ({
    mass: 1,
    position,
    args: [0.4],
    material: { friction: 0.3, restitution: 0.4 },
  }));

  return (
    <mesh ref={ref} castShadow>
      <sphereGeometry args={[0.4, 32, 32]} />
      <meshStandardMaterial color="#e74c3c" />
    </mesh>
  );
}

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas shadows camera={{ position: [10, 8, 12], fov: 60 }}>
        <color attach="background" args={['#1a1a2e']} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 15, 5]} intensity={1.5} castShadow />

        <Physics gravity={[0, -20, 0]}>
          <Ground />
          <RampTrimesh />

          {/* Balls rolling down the ramp */}
          <Ball position={[-8, 6, -1]} />
          <Ball position={[-8, 7, 0]} />
          <Ball position={[-8, 8, 1]} />
        </Physics>

        <OrbitControls target={[-8, 2, 0]} />
      </Canvas>
    </div>
  );
}