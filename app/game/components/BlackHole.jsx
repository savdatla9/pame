import { useSphere } from '@react-three/cannon';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

export default function BlackHole({ position = [0, 1, 0], onEnter }) {
  const diskRef = useRef(null);
  const glowRef = useRef(null);

  // Physics sphere trigger
  const [ref] = useSphere(() => ({
    args: [3], // Radius of the trigger
    isTrigger: true,
    position,
    onCollide: (e) => {
      if (e.body?.userData?.type === 'vehicle') {
        if (onEnter) onEnter();
      }
    }
  }), useRef(null));

  // Animate the accretion disk
  useFrame((state, delta) => {
    if (diskRef.current) {
      diskRef.current.rotation.z -= delta * 3; // Spin the disk
      diskRef.current.rotation.x = Math.PI / 2 + Math.sin(state.clock.elapsedTime) * 0.2; // Wobble
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 4) * 0.05);
    }
  });

  return (
    <group ref={ref}>
      {/* Event Horizon (Pure Black) */}
      <mesh>
        <sphereGeometry args={[2, 32, 32]} />
        <meshBasicMaterial color="black" />
      </mesh>
      
      {/* Accretion Disk (Glowing Orange/Red) */}
      <mesh ref={diskRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3.2, 0.4, 16, 100]} />
        <meshStandardMaterial 
          color="#ff5500" 
          emissive="#ff2200" 
          emissiveIntensity={3} 
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Outer Glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[2.7, 32, 32]} />
        <meshBasicMaterial 
          color="#4400aa" 
          transparent 
          opacity={0.3} 
          side={THREE.BackSide} 
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      <pointLight color="#ff4400" intensity={2} distance={20} />
    </group>
  );
};