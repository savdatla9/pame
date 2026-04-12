import React, { useRef } from 'react';
import * as THREE from 'three';
import { useCylinder } from '@react-three/cannon';

export function Tree({ theme, position, rotation, ...props }) {
  const isNeon = theme === 'neon';
  const isIce = theme === 'ice';
  const isMars = theme === 'mars';

  const trunkColor = isNeon ? '#111' : (isMars ? '#5d2906' : (isIce ? '#3a4a5a' : '#4d2926'));
  const leafColor = isNeon ? '#1E90FF' : (isMars ? '#cc5533' : (isIce ? '#ffffff' : '#2d4c1e'));
  
  const [ref] = useCylinder(() => ({
    mass: 0,
    type: 'Static',
    position,
    rotation,
    args: [0.2, 0.3, 2, 6],
    ...props,
  }), useRef(null));

  return (
    <group ref={ref}>
      {/* Trunk - Offset by 1 because Cannon cylinders are centered */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.3, 2, 6]} />
        <meshStandardMaterial color={trunkColor} roughness={0.9} />
      </mesh>
      
      {!isMars ? (
        <>
          {/* Foliage (Sphere Cluster) - Re-aligned to new center */}
          <mesh position={[0, 1.8, 0]} castShadow>
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial 
              color={leafColor} 
              roughness={0.8} 
              emissive={isNeon ? '#1E90FF' : '#000'}
              emissiveIntensity={isNeon ? 2 : 0}
            />
          </mesh>
          <mesh position={[0.4, 2.4, 0.2]} castShadow>
            <sphereGeometry args={[0.6, 12, 12]} />
            <meshStandardMaterial 
              color={leafColor} 
              roughness={0.8}
              emissive={isNeon ? '#1E90FF' : '#000'}
              emissiveIntensity={isNeon ? 1.5 : 0}
            />
          </mesh>
          <mesh position={[-0.3, 2.2, -0.3]} castShadow>
            <sphereGeometry args={[0.7, 12, 12]} />
            <meshStandardMaterial 
              color={leafColor} 
              roughness={0.8}
              emissive={isNeon ? '#1E90FF' : '#000'}
              emissiveIntensity={isNeon ? 1.5 : 0}
            />
          </mesh>
        </>
      ) : (
        <>
          {/* Bare Branches for Mars */}
          <mesh position={[0.4, 0.6, 0]} rotation={[0, 0, 0.8]} castShadow>
            <cylinderGeometry args={[0.05, 0.08, 1.2, 4]} />
            <meshStandardMaterial color={trunkColor} roughness={0.9} />
          </mesh>
          <mesh position={[-0.3, 1.2, 0.2]} rotation={[0.5, 0, -0.7]} castShadow>
            <cylinderGeometry args={[0.04, 0.06, 1, 4]} />
            <meshStandardMaterial color={trunkColor} roughness={0.9} />
          </mesh>
        </>
      )}
    </group>
  );
}

export function Plant({ theme, ...props }) {
  const isNeon = theme === 'neon';
  const isMars = theme === 'mars';
  const color = isNeon ? '#ff00aa' : (isMars ? '#883311' : '#4a7c44');

  return (
    <group {...props}>
      {[0, 1, 2].map((i) => (
        <mesh 
          key={i} 
          rotation={[0, (i * Math.PI * 2) / 3, 0.3]} 
          position={[0, 0.2, 0]}
        >
          <sphereGeometry args={[0.3, 4, 8]} scale={[1, 0.2, 0.5]} />
          <meshStandardMaterial 
            color={color} 
            emissive={isNeon ? color : '#000'} 
            emissiveIntensity={isNeon ? 2 : 0} 
          />
        </mesh>
      ))}
    </group>
  );
}

export function Grass({ theme, ...props }) {
  const isNeon = theme === 'neon';
  const color = isNeon ? '#00ffff' : (theme === 'mars' ? '#aa6644' : (theme === 'ice' ? '#d0f0ff' : '#567d46'));

  return (
    <group {...props}>
      <mesh position={[0, 0.1, 0]}>
        <planeGeometry args={[0.2, 0.4]} />
        <meshStandardMaterial 
          color={color} 
          side={THREE.DoubleSide} 
          alphaTest={0.5}
          emissive={isNeon ? color : '#000'}
          emissiveIntensity={isNeon ? 1 : 0}
        />
      </mesh>
    </group>
  );
}
