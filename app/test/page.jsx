'use client'

import { Canvas } from '@react-three/fiber';
import { Physics, usePlane, useCompoundBody } from '@react-three/cannon';
import { Text3D, OrbitControls, Center, ContactShadows } from '@react-three/drei';
// import { useRef, useState } from 'react';
// import * as THREE from 'three';

// Ground
function Ground() {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0, 0],
  }));
  
  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[50, 50]} />
      <meshStandardMaterial color="#1a1a1a" />
    </mesh>
  );
}

// METHOD 1: Single Box Physics (Simple, Fast)
// Text falls as ONE solid block
function BrickTextSimple({ text, position, color = "#ff6b6b" }) {
  const textWidth = text.length * 0.6;
  const textHeight = 1;
  const textDepth = 0.3;
  
  const [ref] = useCompoundBody(() => ({
    mass: 5, // Heavier = more brick-like
    position: position,
    shapes: [
      {
        type: 'Box',
        args: [textWidth, textHeight, textDepth],
        position: [0, 0, 0],
      }
    ],
    material: {
      friction: 0.8,      // High friction = less sliding
      restitution: 0.1,   // Low bounce = brick-like
    },
    linearDamping: 0.3,   // Air resistance
    angularDamping: 0.3,  // Rotation resistance
  }));

  return (
    <group ref={ref}>
      <Center>
        <Text3D
          font="/font/helvetiker_regular.typeface.json"
          size={0.5}
          height={0.2}
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.02}
          bevelSize={0.02}
          castShadow
          receiveShadow
        >
          {text}
          <meshStandardMaterial 
            color={color}
            roughness={0.7}
            metalness={0.3}
          />
        </Text3D>
      </Center>
    </group>
  );
}

// METHOD 2: Per-Letter Physics (Each letter is a separate brick)
// More realistic - letters can separate on impact
function BrickTextPerLetter({ text, position, color = "#3498db" }) {
  const letters = text.split('');
  const letterWidth = 0.6;
  const letterHeight = 1;
  const letterDepth = 0.3;
  const spacing = 0.65;

  return (
    <group>
      {letters.map((letter, index) => {
        // Calculate position for each letter
        const xOffset = (index - letters.length / 2) * spacing;
        const letterPos = [
          position[0] + xOffset,
          position[1],
          position[2]
        ];

        return (
          <BrickLetter
            key={index}
            letter={letter}
            position={letterPos}
            color={color}
          />
        );
      })}
    </group>
  );
}

// Individual brick letter
function BrickLetter({ letter, position, color }) {
  const letterWidth = 0.6;
  const letterHeight = 1;
  const letterDepth = 0.3;

  const [ref] = useCompoundBody(() => ({
    mass: 2,
    position: position,
    shapes: [
      {
        type: 'Box',
        args: [letterWidth, letterHeight, letterDepth],
        position: [0, 0, 0],
      }
    ],
    material: {
      friction: 0.8,
      restitution: 0.15, // Slight bounce
    },
    linearDamping: 0.4,
    angularDamping: 0.4,
  }));

  return (
    <group ref={ref}>
      <Center>
        <Text3D
          font="/font/helvetiker_regular.typeface.json"
          size={0.5}
          height={0.2}
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.02}
          bevelSize={0.02}
          castShadow
          receiveShadow
        >
          {letter}
          <meshStandardMaterial 
            color={color}
            roughness={0.8}
            metalness={0.2}
          />
        </Text3D>
      </Center>
    </group>
  );
}

// METHOD 3: Compound Body (Multiple boxes for more accurate collision)
// Best balance of performance and accuracy
function BrickTextCompound({ text, position, color = "#2ecc71" }) {
  const textWidth = text.length * 0.6;
  const textHeight = 1;
  const textDepth = 0.3;
  
  // Create multiple collision boxes for better accuracy
  const [ref] = useCompoundBody(() => ({
    mass: 5,
    position: position,
    shapes: [
      // Main body
      {
        type: 'Box',
        args: [textWidth, textHeight * 0.6, textDepth],
        position: [0, 0, 0],
      },
      // Top part (for letters with ascenders like 'h', 'l')
      {
        type: 'Box',
        args: [textWidth * 0.5, textHeight * 0.4, textDepth],
        position: [0, textHeight * 0.3, 0],
      },
    ],
    material: {
      friction: 0.9,      // Very high friction
      restitution: 0.05,  // Almost no bounce - heavy brick
    },
    linearDamping: 0.5,   // Lots of air resistance
    angularDamping: 0.5,  // Lots of rotation resistance
  }));

  return (
    <group ref={ref}>
      <Center>
        <Text3D
          font="/font/helvetiker_regular.typeface.json"
          size={0.5}
          height={0.2}
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.02}
          bevelSize={0.02}
          castShadow
          receiveShadow
        >
          {text}
          <meshStandardMaterial 
            color={color}
            roughness={0.9}
            metalness={0.1}
          />
        </Text3D>
      </Center>
      
      {/* Optional: Visualize collision shapes */}
      {/* <mesh position={[0, 0, 0]}>
        <boxGeometry args={[textWidth, textHeight * 0.6, textDepth]} />
        <meshBasicMaterial wireframe color="lime" />
      </mesh>
      <mesh position={[0, textHeight * 0.3, 0]}>
        <boxGeometry args={[textWidth * 0.5, textHeight * 0.4, textDepth]} />
        <meshBasicMaterial wireframe color="cyan" />
      </mesh> */}
    </group>
  );
}

// Wall of bricks to stack
function BrickWall() {
  const bricks = [];
  const rows = 3;
  const cols = 4;
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const offset = row % 2 === 0 ? 0 : 0.5;
      bricks.push({
        position: [(col - cols / 2 + offset) * 1.5, row * 1.2 + 0.5, -5],
        text: String.fromCharCode(65 + (row * cols + col) % 26), // A-Z
      });
    }
  }
  
  return (
    <>
      {bricks.map((brick, i) => (
        <BrickTextSimple
          key={i}
          text={brick.text}
          position={brick.position}
          color={`hsl(${i * 30}, 70%, 60%)`}
        />
      ))}
    </>
  );
}

// Wrecking ball to knock text down
function WreckingBall({ position }) {
  const [ref, api] = useCompoundBody(() => ({
    mass: 10,
    position: position,
    shapes: [
      {
        type: 'Sphere',
        args: [1],
        position: [0, 0, 0],
      }
    ],
    material: {
      friction: 0.3,
      restitution: 0.5,
    },
  }));

  // Click to launch
  const handleClick = () => {
    api.velocity.set(-20, 0, 0);
  };

  return (
    <mesh ref={ref} castShadow onClick={handleClick}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial 
        color="#e74c3c"
        roughness={0.3}
        metalness={0.8}
      />
    </mesh>
  );
}

// Main App
export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas
        shadows
        camera={{ position: [12, 8, 12], fov: 50 }}
      >
        <color attach="background" args={['#0f0f0f']} />
        
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 15, 5]}
          intensity={1.5}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-15}
          shadow-camera-right={15}
          shadow-camera-top={15}
          shadow-camera-bottom={-15}
        />
        <pointLight position={[-10, 10, -10]} intensity={0.5} color="#3498db" />

        <Physics gravity={[0, -20, 0]}>
          <Ground />
          
          {/* Contact Shadows */}
          <ContactShadows
            position={[0, 0.01, 0]}
            opacity={0.5}
            scale={50}
            blur={2}
            far={10}
          />

          {/* DEMO 1: Simple brick text (falls as one piece) */}
          <BrickTextSimple 
            text="BRICK" 
            position={[-5, 10, 0]} 
            color="#e74c3c"
          />

          {/* DEMO 2: Per-letter bricks (letters separate) */}
          <BrickTextPerLetter 
            text="FALL" 
            position={[0, 8, 0]} 
            color="#3498db"
          />

          {/* DEMO 3: Compound collision (more accurate) */}
          <BrickTextCompound 
            text="HEAVY" 
            position={[5, 12, 0]} 
            color="#2ecc71"
          />

          {/* Wall of letter bricks */}
          <BrickWall />

          {/* Wrecking ball (click to launch) */}
          <WreckingBall position={[10, 5, -5]} />
        </Physics>

        <OrbitControls 
          target={[0, 3, -2]}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>

      {/* Instructions */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        color: 'white',
        background: 'rgba(0,0,0,0.8)',
        padding: '20px',
        borderRadius: '8px',
        fontFamily: 'monospace',
        fontSize: '14px',
        maxWidth: '400px',
      }}>
        <div style={{ fontSize: '16px', marginBottom: '10px', fontWeight: 'bold' }}>
          ⚠️ Brick Text Physics
        </div>
        <div style={{ marginBottom: '8px' }}>
          <strong>Red "BRICK":</strong> Falls as one solid block
        </div>
        <div style={{ marginBottom: '8px' }}>
          <strong>Blue "FALL":</strong> Each letter is separate
        </div>
        <div style={{ marginBottom: '8px' }}>
          <strong>Green "HEAVY":</strong> Compound collision
        </div>
        <div style={{ marginTop: '15px', fontSize: '12px', opacity: 0.8 }}>
          💡 <strong>Click the red ball</strong> to launch it at the wall!
        </div>
        <div style={{ marginTop: '10px', fontSize: '11px', opacity: 0.6 }}>
          Key settings: high mass, low restitution, high friction
        </div>
      </div>
    </div>
  );
}
