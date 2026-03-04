import { useBox, useCompoundBody } from '@react-three/cannon';
import { Text3D, Center } from '@react-three/drei';
import { useRef } from 'react';

export function PhysicalText({ text, position }) {
  const textRef = useRef();
  
  // Calculate approximate bounding box size for the text
  // Adjust these based on your font and text length
  const textWidth = text.length * 1.25; // Approximate width per character
  const textHeight = 1.85;
  const textDepth = 1.25;
  
  // Create a physics box body that matches text dimensions
  const [ref] = useCompoundBody(() => ({
    mass: 15, // Heavier = more brick-like
    position: position,
    shapes: [
      {
        type: 'Sphere',
        args: [0.9],
        position: [0, 0, 0],
      }
    ],
    material: {
      friction: 0.8,      // High friction = less sliding
      restitution: 0.05,   // Low bounce = brick-like
    },
    linearDamping: 0.4,   // Air resistance
    angularDamping: 0.4,  // Rotation resistance
  }));

  return (
    <group ref={ref}>
      {/* The actual text geometry (visual only, no physics) */}
      <Center>
        <Text3D
          ref={textRef}
          font="/font/Montserrat Thin_Regular.json" // You need to provide this
          size={2}
          height={0.25}
          curveSegments={18}
          bevelEnabled
          bevelThickness={0.02}
          bevelSize={0.02}
          bevelOffset={0}
          bevelSegments={12}
          castShadow
          receiveShadow
        >
          {text}

          <meshStandardMaterial 
            color="#A0522D" 
            roughness={0.5}
            metalness={0.1}
          />
        </Text3D>
      </Center>
      
      {/* Optional: Visualize the physics bounding box for debugging */}
      {/* <mesh>
        <boxGeometry args={[textWidth, textHeight, textDepth]} />
        <meshBasicMaterial wireframe color="lime" />
      </mesh> */}
    </group>
  );
};

export function StaticPhysicalText({ text, position }) {
  const textRef = useRef();
  
  const textWidth = text.length * 0.6; // Approximate width per character
  const textHeight = 1;
  const textDepth = 0.3;

  const [boxRef, api] = useBox(() => ({
    mass: 0,
    position: position,
    args: [textWidth, textHeight, textDepth], // Box dimensions
    material: {
      friction: 0.1,
      restitution: 0.1, // Bounciness
    },
  }));
  // For static text, you can use the actual geometry
  // This approach uses the text mesh itself for collision
  return (
    <Center ref={boxRef}>
      <Text3D
        ref={textRef}
        font="/font/Boldonse_Regular.json"
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
        <meshStandardMaterial color="#4ecdc4" />
      </Text3D>
    </Center>
  );
};

export function BrickLetter({ text, letter, position, color="#A0522D" }) {
  const content = text || letter;
  const letterWidth = 0.6;
  const letterHeight = 1;
  const letterDepth = 0.3;

  const [ref] = useCompoundBody(() => ({
    mass: 15,
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
      restitution: 0.1, 
    },
    linearDamping: 0.3,
    angularDamping: 0.3,
  }));

  return (
    <group ref={ref}>
      <Center>
        <Text3D
          font="/font/Montserrat Thin_Regular.json"
          size={0.95}
          height={0.2} 
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.02}
          bevelSize={0.02}
          castShadow
          receiveShadow
        >
          {content}

          <meshPhysicalMaterial 
            color={color}
            roughness={0.8}
            metalness={0.2}
          />
        </Text3D>
      </Center>
    </group>
  );
};