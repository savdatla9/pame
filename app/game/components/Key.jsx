import { useSphere } from '@react-three/cannon';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

export default function KeyItem({ position = [0, 1, 0], onCollect }) {
  const innerGroupRef = useRef(null);
  const isCollected = useRef(false);

  // Physics sphere trigger
  const [ref] = useSphere(() => ({
    args: [1.5], // Radius of the trigger
    isTrigger: true,
    position,
    onCollide: (e) => {
      // If collided with vehicle
      if (e.body?.userData?.type === 'vehicle' && !isCollected.current) {
        isCollected.current = true;
        setTimeout(() => {
          if (onCollect) onCollect();
        }, 600);
      }
    }
  }), useRef(null));

  // Animate the Key floating and spinning
  useFrame((state, delta) => {
    if (innerGroupRef.current) {
      if (isCollected.current) {
        // Collect animation: spin rapidly, fly up, and shrink
        innerGroupRef.current.rotation.y += delta * 20;
        innerGroupRef.current.position.y += delta * 8;
        
        const scale = innerGroupRef.current.scale.x;
        if (scale > 0) {
          const newScale = Math.max(0, scale - delta * 1.8);
          innerGroupRef.current.scale.set(newScale, newScale, newScale);
        }
      } else {
        innerGroupRef.current.rotation.y += delta;
        innerGroupRef.current.rotation.x += delta * 0.5;
        innerGroupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.2; // Hover effect
      }
    }
  });

  return (
    <group ref={ref}>
      <group ref={innerGroupRef}>
        <mesh>
          <octahedronGeometry args={[0.5, 0]} />
          <meshStandardMaterial 
            color="gold" 
            emissive="orange" 
            emissiveIntensity={1} 
            metalness={1} 
            roughness={0.2} 
          />
        </mesh>
        
        {/* Outer Glow */}
        <mesh>
          <sphereGeometry args={[0.8, 16, 16]} />
          <meshBasicMaterial 
            color="yellow" 
            transparent 
            opacity={0.2} 
            side={THREE.BackSide} 
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        
        <pointLight color="yellow" intensity={1} distance={10} />
      </group>
    </group>
  );
};