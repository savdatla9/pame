import { useBox } from '@react-three/cannon';
import { Text3D, Center } from '@react-three/drei';
import { useRef } from 'react';

export function PhysicalText({ text, position }) {
  const textRef = useRef();
  
  // Calculate approximate bounding box size for the text
  // Adjust these based on your font and text length
  const textWidth = text.length * 0.6; // Approximate width per character
  const textHeight = 1.5;
  const textDepth = 0.5;
  
  // Create a physics box body that matches text dimensions
  const [boxRef] = useBox(() => ({
    mass: 1,
    position: position,
    args: [textWidth, textHeight, textDepth], // Box dimensions
    material: {
      friction: 0.8,
      restitution: 0.5, // Bounciness
    },
  }));

  return (
    <group ref={boxRef}>
      {/* The actual text geometry (visual only, no physics) */}
      <Center>
        <Text3D
          ref={textRef}
          font="/font/Montserrat Thin_Regular.json" // You need to provide this
          size={1.5}
          height={0.4}
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.01}
          bevelSize={0.01}
          bevelOffset={0}
          bevelSegments={7.5}
          castShadow
          receiveShadow
        >
          {text}
          <meshStandardMaterial color="#A0522D" />
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

// Main App Component
// export default function App() {
//   return (
//     <div style={{ width: '100vw', height: '100vh' }}>
//       <Canvas
//         shadows
//         camera={{ position: [0, 5, 10], fov: 50 }}
//       >
//         <color attach="background" args={['#1a1a1a']} />
        
//         {/* Lighting */}
//         <ambientLight intensity={0.5} />
//         <directionalLight
//           position={[10, 10, 5]}
//           intensity={1}
//           castShadow
//           shadow-mapSize={[2048, 2048]}
//         />
//         <pointLight position={[-10, 0, -5]} intensity={0.5} />
        
//         {/* Physics World */}
//         <Physics gravity={[0, -9.81, 0]}>
//           <Ground />
          
//           {/* Physical text that will fall and collide */}
//           <PhysicalText text="HELLO" position={[0, 5, 0]} />
//           <PhysicalText text="WORLD" position={[0, 8, 0]} />
          
//           {/* Balls to test collision */}
//           <Ball position={[-2, 10, 0]} />
//           <Ball position={[2, 12, 0]} />
          
//           {/* Static text as a platform */}
//           <StaticPhysicalText text="STATIC" position={[0, 0, 0]} />
//         </Physics>
        
//         <OrbitControls />
//       </Canvas>
//     </div>
//   );
// }