'use client'

// import { Canvas, useFrame, useThree } from '@react-three/fiber';
// import { 
//   MeshPortalMaterial,
//   Environment,
//   OrbitControls,
//   PerspectiveCamera,
//   useGLTF,
//   Sky,
//   Text,
//   Float,
//   Sphere,
//   Box,
//   RoundedBox,
//   CameraControls
// } from '@react-three/drei';
// import { useRef, useState, useEffect } from 'react';
// import * as THREE from 'three';

// // Main Ground/Floor
// function MainWorld() {
//   return (
//     <>
//       {/* Floor */}
//       <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
//         <planeGeometry args={[50, 50]} />
//         <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
//       </mesh>

//       {/* Walls to frame the space */}
//       <mesh position={[0, 3, -10]} receiveShadow>
//         <boxGeometry args={[50, 10, 0.5]} />
//         <meshStandardMaterial color="#2c3e50" />
//       </mesh>

//       {/* Ambient objects */}
//       <RoundedBox position={[-8, 0, -5]} args={[1, 2, 1]} receiveShadow castShadow>
//         <meshStandardMaterial color="#34495e" />
//       </RoundedBox>
//       <RoundedBox position={[8, 0, -5]} args={[1, 2, 1]} receiveShadow castShadow>
//         <meshStandardMaterial color="#34495e" />
//       </RoundedBox>
//     </>
//   );
// }

// // PORTAL 1: Fantasy Forest World
// function ForestPortal({ position, onEnter }) {
//   const [hovered, setHovered] = useState(false);

//   return (
//     <group position={position}>
//       {/* Portal Frame */}
//       <mesh 
//         position={[0, 0, -0.05]}
//         onPointerOver={() => setHovered(true)}
//         onPointerOut={() => setHovered(false)}
//       >
//         <boxGeometry args={[4.2, 5.2, 0.3]} />
//         <meshStandardMaterial 
//           color={hovered ? "#2ecc71" : "#27ae60"}
//           emissive="#2ecc71"
//           emissiveIntensity={hovered ? 0.4 : 0.1}
//           metalness={0.8}
//           roughness={0.2}
//         />
//       </mesh>

//       {/* Sign */}
//       <Text
//         position={[0, 3, 0.2]}
//         fontSize={0.4}
//         color="#2ecc71"
//         anchorX="center"
//         anchorY="middle"
//       >
//         FOREST WORLD
//       </Text>

//       {/* Portal Surface */}
//       <mesh onClick={() => onEnter('forest')}>
//         <planeGeometry args={[4, 5]} />
//         <MeshPortalMaterial worldUnits>
//           {/* Forest World */}
//           <color attach="background" args={['#87ceeb']} />
//           <ambientLight intensity={0.5} />
//           <directionalLight position={[10, 10, 5]} intensity={1.5} />
          
//           <Sky sunPosition={[100, 20, 100]} />
          
//           {/* Trees */}
//           {[...Array(20)].map((_, i) => {
//             const angle = (i / 20) * Math.PI * 2;
//             const radius = 3 + Math.random() * 5;
//             return (
//               <Tree
//                 key={i}
//                 position={[
//                   Math.cos(angle) * radius,
//                   -1,
//                   Math.sin(angle) * radius - 3
//                 ]}
//               />
//             );
//           })}

//           {/* Grass floor */}
//           <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, -3]} receiveShadow>
//             <planeGeometry args={[30, 30]} />
//             <meshStandardMaterial color="#2ecc71" roughness={0.9} />
//           </mesh>

//           {/* Floating particles */}
//           <FloatingParticles color="#2ecc71" count={15} />
//         </MeshPortalMaterial>
//       </mesh>
//     </group>
//   );
// }

// // PORTAL 2: Cyber/Neon World
// function CyberPortal({ position, onEnter }) {
//   const [hovered, setHovered] = useState(false);

//   return (
//     <group position={position}>
//       {/* Portal Frame */}
//       <mesh 
//         position={[0, 0, -0.05]}
//         onPointerOver={() => setHovered(true)}
//         onPointerOut={() => setHovered(false)}
//       >
//         <boxGeometry args={[4.2, 5.2, 0.3]} />
//         <meshStandardMaterial 
//           color={hovered ? "#3498db" : "#2980b9"}
//           emissive="#3498db"
//           emissiveIntensity={hovered ? 0.4 : 0.1}
//           metalness={0.9}
//           roughness={0.1}
//         />
//       </mesh>

//       {/* Sign */}
//       <Text
//         position={[0, 3, 0.2]}
//         fontSize={0.4}
//         color="#3498db"
//         anchorX="center"
//         anchorY="middle"
//       >
//         CYBER WORLD
//       </Text>

//       {/* Portal Surface */}
//       <mesh onClick={() => onEnter('cyber')}>
//         <planeGeometry args={[4, 5]} />
//         <MeshPortalMaterial worldUnits>
//           {/* Cyber World */}
//           <color attach="background" args={['#0a0a0a']} />
//           <fog attach="fog" args={['#0a0a0a', 5, 20]} />
          
//           <ambientLight intensity={0.2} />
//           <pointLight position={[0, 5, 0]} intensity={2} color="#00ffff" />
//           <pointLight position={[5, 2, -5]} intensity={2} color="#ff00ff" />
          
//           {/* Grid floor */}
//           <GridFloor />

//           {/* Neon structures */}
//           <NeonTowers />

//           {/* Floating data cubes */}
//           <FloatingCubes />
//         </MeshPortalMaterial>
//       </mesh>
//     </group>
//   );
// }

// // PORTAL 3: Space/Void World
// function SpacePortal({ position, onEnter }) {
//   const [hovered, setHovered] = useState(false);

//   return (
//     <group position={position}>
//       {/* Portal Frame */}
//       <mesh 
//         position={[0, 0, -0.05]}
//         onPointerOver={() => setHovered(true)}
//         onPointerOut={() => setHovered(false)}
//       >
//         <boxGeometry args={[4.2, 5.2, 0.3]} />
//         <meshStandardMaterial 
//           color={hovered ? "#9b59b6" : "#8e44ad"}
//           emissive="#9b59b6"
//           emissiveIntensity={hovered ? 0.4 : 0.1}
//           metalness={0.8}
//           roughness={0.2}
//         />
//       </mesh>

//       {/* Sign */}
//       <Text
//         position={[0, 3, 0.2]}
//         fontSize={0.4}
//         color="#9b59b6"
//         anchorX="center"
//         anchorY="middle"
//       >
//         SPACE WORLD
//       </Text>

//       {/* Portal Surface */}
//       <mesh onClick={() => onEnter('space')}>
//         <planeGeometry args={[4, 5]} />
//         <MeshPortalMaterial worldUnits>
//           {/* Space World */}
//           <color attach="background" args={['#000000']} />
          
//           <ambientLight intensity={0.1} />
//           <pointLight position={[0, 0, 0]} intensity={3} color="#ffffff" />

//           {/* Planets */}
//           <Planet position={[-3, 2, -8]} color="#e74c3c" size={2} />
//           <Planet position={[4, -1, -12]} color="#3498db" size={1.5} />
//           <Planet position={[0, 3, -15]} color="#f39c12" size={3} />

//           {/* Asteroid belt */}
//           <Asteroids />

//           {/* Stars */}
//           <Stars />
//         </MeshPortalMaterial>
//       </mesh>
//     </group>
//   );
// }

// // Tree component for forest
// function Tree({ position }) {
//   return (
//     <group position={position}>
//       {/* Trunk */}
//       <mesh position={[0, 1, 0]} castShadow>
//         <cylinderGeometry args={[0.2, 0.3, 2, 8]} />
//         <meshStandardMaterial color="#8B4513" />
//       </mesh>
//       {/* Leaves */}
//       <mesh position={[0, 2.5, 0]} castShadow>
//         <coneGeometry args={[1, 2, 8]} />
//         <meshStandardMaterial color="#228B22" />
//       </mesh>
//       <mesh position={[0, 3.5, 0]} castShadow>
//         <coneGeometry args={[0.7, 1.5, 8]} />
//         <meshStandardMaterial color="#228B22" />
//       </mesh>
//     </group>
//   );
// }

// // Floating particles
// function FloatingParticles({ color, count }) {
//   const particles = useRef();
  
//   useFrame((state) => {
//     particles.current.children.forEach((particle, i) => {
//       particle.position.y += Math.sin(state.clock.elapsedTime + i) * 0.002;
//     });
//   });

//   return (
//     <group ref={particles}>
//       {[...Array(count)].map((_, i) => (
//         <Float key={i} speed={2 + Math.random() * 2} floatIntensity={2}>
//           <mesh 
//             position={[
//               (Math.random() - 0.5) * 15,
//               Math.random() * 5,
//               (Math.random() - 0.5) * 15 - 3
//             ]}
//           >
//             <sphereGeometry args={[0.05, 8, 8]} />
//             <meshStandardMaterial 
//               color={color} 
//               emissive={color}
//               emissiveIntensity={0.5}
//             />
//           </mesh>
//         </Float>
//       ))}
//     </group>
//   );
// }

// // Grid floor for cyber world
// function GridFloor() {
//   const gridRef = useRef();
  
//   useFrame((state) => {
//     gridRef.current.position.z = (state.clock.elapsedTime * 2) % 2;
//   });

//   return (
//     <group ref={gridRef}>
//       <gridHelper args={[30, 30, '#00ffff', '#ff00ff']} position={[0, -1, -3]} />
//     </group>
//   );
// }

// // Neon towers for cyber world
// function NeonTowers() {
//   return (
//     <group>
//       {[...Array(10)].map((_, i) => {
//         const angle = (i / 10) * Math.PI * 2;
//         const radius = 5;
//         const height = 2 + Math.random() * 4;
//         const color = i % 2 === 0 ? '#00ffff' : '#ff00ff';
        
//         return (
//           <mesh
//             key={i}
//             position={[
//               Math.cos(angle) * radius,
//               height / 2 - 1,
//               Math.sin(angle) * radius - 3
//             ]}
//             castShadow
//           >
//             <boxGeometry args={[0.5, height, 0.5]} />
//             <meshStandardMaterial
//               color={color}
//               emissive={color}
//               emissiveIntensity={0.5}
//               metalness={0.9}
//               roughness={0.1}
//             />
//           </mesh>
//         );
//       })}
//     </group>
//   );
// }

// // Floating cubes for cyber world
// function FloatingCubes() {
//   const groupRef = useRef();
  
//   useFrame((state) => {
//     groupRef.current.rotation.y = state.clock.elapsedTime * 0.2;
//   });

//   return (
//     <group ref={groupRef}>
//       {[...Array(20)].map((_, i) => {
//         const angle = (i / 20) * Math.PI * 2;
//         const radius = 3 + Math.random() * 3;
//         const height = Math.random() * 5;
        
//         return (
//           <Float key={i} speed={2} floatIntensity={1}>
//             <mesh position={[Math.cos(angle) * radius, height, Math.sin(angle) * radius - 3]}>
//               <boxGeometry args={[0.3, 0.3, 0.3]} />
//               <meshStandardMaterial
//                 color="#ffffff"
//                 emissive="#00ffff"
//                 emissiveIntensity={0.3}
//                 wireframe
//               />
//             </mesh>
//           </Float>
//         );
//       })}
//     </group>
//   );
// }

// // Planet component
// function Planet({ position, color, size }) {
//   const planetRef = useRef();
  
//   useFrame((state) => {
//     planetRef.current.rotation.y += 0.005;
//   });

//   return (
//     <mesh ref={planetRef} position={position}>
//       <sphereGeometry args={[size, 32, 32]} />
//       <meshStandardMaterial
//         color={color}
//         emissive={color}
//         emissiveIntensity={0.2}
//         roughness={0.8}
//       />
//     </mesh>
//   );
// }

// // Asteroids
// function Asteroids() {
//   const groupRef = useRef();
  
//   useFrame((state) => {
//     groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
//   });

//   return (
//     <group ref={groupRef}>
//       {[...Array(30)].map((_, i) => {
//         const angle = (i / 30) * Math.PI * 2;
//         const radius = 8 + Math.random() * 4;
        
//         return (
//           <mesh
//             key={i}
//             position={[
//               Math.cos(angle) * radius,
//               (Math.random() - 0.5) * 4,
//               Math.sin(angle) * radius - 10
//             ]}
//             rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}
//           >
//             <dodecahedronGeometry args={[0.1 + Math.random() * 0.3, 0]} />
//             <meshStandardMaterial color="#7f8c8d" roughness={1} />
//           </mesh>
//         );
//       })}
//     </group>
//   );
// }

// // Stars
// function Stars() {
//   const starsRef = useRef();
  
//   useFrame((state) => {
//     starsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
//   });

//   const starPositions = [...Array(200)].map(() => ({
//     x: (Math.random() - 0.5) * 50,
//     y: (Math.random() - 0.5) * 50,
//     z: (Math.random() - 0.5) * 50 - 20,
//   }));

//   return (
//     <group ref={starsRef}>
//       {starPositions.map((pos, i) => (
//         <mesh key={i} position={[pos.x, pos.y, pos.z]}>
//           <sphereGeometry args={[0.05, 4, 4]} />
//           <meshStandardMaterial
//             color="#ffffff"
//             emissive="#ffffff"
//             emissiveIntensity={1}
//           />
//         </mesh>
//       ))}
//     </group>
//   );
// }

// // Main App
// export default function App() {
//   const [currentWorld, setCurrentWorld] = useState('main');

//   const handleEnterPortal = (world) => {
//     console.log(`Entering ${world} world!`);
//     setCurrentWorld(world);
//   };

//   return (
//     <div style={{ width: '100vw', height: '100vh' }}>
//       <Canvas
//         shadows
//         camera={{ position: [0, 2, 8], fov: 60 }}
//       >
//         <color attach="background" args={['#0f0f0f']} />
        
//         {/* Lighting */}
//         <ambientLight intensity={0.3} />
//         <directionalLight
//           position={[10, 10, 5]}
//           intensity={1}
//           castShadow
//           shadow-mapSize={[2048, 2048]}
//         />
//         <pointLight position={[-5, 3, 5]} intensity={0.5} color="#3498db" />
//         <pointLight position={[5, 3, 5]} intensity={0.5} color="#e74c3c" />

//         {/* Main World */}
//         <MainWorld />

//         {/* Three Portals */}
//         <ForestPortal position={[-5, 1.5, -8]} onEnter={handleEnterPortal} />
//         <CyberPortal position={[0, 1.5, -8]} onEnter={handleEnterPortal} />
//         <SpacePortal position={[5, 1.5, -8]} onEnter={handleEnterPortal} />

//         {/* Welcome Text */}
//         <Text
//           position={[0, 4, -7.5]}
//           fontSize={0.5}
//           color="#ffffff"
//           anchorX="center"
//           anchorY="middle"
//         >
//           Choose Your Portal
//         </Text>

//         <OrbitControls 
//           target={[0, 1.5, -8]}
//           maxPolarAngle={Math.PI / 2}
//           minDistance={3}
//           maxDistance={15}
//         />
//       </Canvas>

//       {/* UI Overlay */}
//       <div style={{
//         position: 'absolute',
//         top: '20px',
//         left: '20px',
//         color: 'white',
//         background: 'rgba(0,0,0,0.8)',
//         padding: '20px',
//         borderRadius: '8px',
//         fontFamily: 'monospace',
//         fontSize: '14px',
//         maxWidth: '350px',
//       }}>
//         <div style={{ fontSize: '20px', marginBottom: '15px', fontWeight: 'bold' }}>
//           🌀 Portal Worlds
//         </div>

//         <div style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
//           <div style={{ color: '#2ecc71', fontWeight: 'bold' }}>🌲 Forest World</div>
//           <div style={{ fontSize: '12px', opacity: 0.8 }}>Peaceful nature realm with trees and floating particles</div>
//         </div>

//         <div style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
//           <div style={{ color: '#3498db', fontWeight: 'bold' }}>🤖 Cyber World</div>
//           <div style={{ fontSize: '12px', opacity: 0.8 }}>Neon-lit digital cityscape with grid floor</div>
//         </div>

//         <div style={{ marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
//           <div style={{ color: '#9b59b6', fontWeight: 'bold' }}>🌌 Space World</div>
//           <div style={{ fontSize: '12px', opacity: 0.8 }}>Cosmic void with planets and asteroids</div>
//         </div>

//         <div style={{ fontSize: '12px', opacity: 0.7 }}>
//           💡 <strong>Hover</strong> over portals to highlight<br/>
//           🖱️ <strong>Click</strong> to enter (console logs)<br/>
//           🔄 <strong>Drag</strong> to look around
//         </div>

//         {currentWorld !== 'main' && (
//           <div style={{ 
//             marginTop: '15px', 
//             padding: '10px',
//             background: 'rgba(52, 152, 219, 0.3)',
//             borderRadius: '4px',
//             fontSize: '13px'
//           }}>
//             ✨ Currently viewing: <strong>{currentWorld.toUpperCase()}</strong>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  MeshPortalMaterial,
  Sky, Text,
  Float, useKeyboardControls,
  KeyboardControls, OrbitControls
} from '@react-three/drei';
import { useRef, useState, useEffect } from 'react';
import { Physics, useBox, usePlane } from '@react-three/cannon';
import * as THREE from 'three';

// Drivable Car Component
function DrivableCar({ onPortalEnter }) {
  const [ref, api] = useBox(() => ({
    mass: 150,
    position: [0, 1, 5],
    args: [2, 0.5, 1],
    material: {
      friction: 0.3,
    },
  }));

  const velocity = useRef([0, 0, 0]);
  const position = useRef([0, 1, 5]);

  // Subscribe to velocity and position
  useEffect(() => {
    const unsubscribeVel = api.velocity.subscribe((v) => (velocity.current = v));
    const unsubscribePos = api.position.subscribe((p) => (position.current = p));
    return () => {
      unsubscribeVel();
      unsubscribePos();
    };
  }, [api]);

  // Keyboard controls
  const [, get] = useKeyboardControls();

  useFrame(() => {
    const { forward, backward, left, right, brake } = get();
    
    const speed = 15;
    const turnSpeed = 3;
    const brakeForce = 0.95;

    // Get current velocity
    const [vx, vy, vz] = velocity.current;

    // Movement
    if (forward) {
      api.velocity.set(vx, vy, vz - speed);
    }
    if (backward) {
      api.velocity.set(vx, vy, vz + speed * 0.5);
    }
    if (left) {
      api.velocity.set(vx - turnSpeed, vy, vz);
    }
    if (right) {
      api.velocity.set(vx + turnSpeed, vy, vz);
    }
    if (brake) {
      api.velocity.set(vx * brakeForce, vy, vz * brakeForce);
    }

    // Check portal collision
    const [px, py, pz] = position.current;
    
    // Forest portal at z = -15
    if (pz < -14 && pz > -16 && Math.abs(px + 8) < 2) {
      onPortalEnter('forest');
    }
    // Cyber portal at z = -15
    if (pz < -14 && pz > -16 && Math.abs(px) < 2) {
      onPortalEnter('cyber');
    }
    // Space portal at z = -15
    if (pz < -14 && pz > -16 && Math.abs(px - 8) < 2) {
      onPortalEnter('space');
    }
  });

  return (
    <group ref={ref}>
      {/* Car Body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2, 0.5, 1]} />
        <meshStandardMaterial 
          color="#e74c3c"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Car Roof */}
      <mesh position={[0, 0.4, -0.1]} castShadow>
        <boxGeometry args={[1.2, 0.4, 0.7]} />
        <meshStandardMaterial 
          color="#c0392b"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Wheels */}
      {[
        [-0.8, -0.3, 0.5],
        [-0.8, -0.3, -0.5],
        [0.8, -0.3, 0.5],
        [0.8, -0.3, -0.5],
      ].map((pos, i) => (
        <mesh 
          key={i} 
          position={pos} 
          rotation={[0, 0, Math.PI / 2]} 
          castShadow
        >
          <cylinderGeometry args={[0.25, 0.25, 0.3, 16]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
        </mesh>
      ))}

      {/* Headlights */}
      <pointLight position={[1, 0, -0.7]} intensity={2} distance={10} color="#ffffff" />
      <mesh position={[0.7, 0, -0.6]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial 
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={1}
        />
      </mesh>
      <mesh position={[-0.7, 0, -0.6]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial 
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={1}
        />
      </mesh>
    </group>
  );
};

// Camera that follows the car
function FollowCamera() {
  const { camera } = useThree();
  const [, get] = useKeyboardControls();

  useFrame(() => {
    // Simple follow camera
    camera.position.lerp(
      new THREE.Vector3(0, 5, 10),
      0.05
    );
    camera.lookAt(0, 0, 0);
  });

  return null;
};

// Main World Ground
function MainWorldGround() {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0, 0],
  }));

  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="#2c3e50" roughness={0.8} />
    </mesh>
  );
};

// Forest Portal
function ForestPortal({ position }) {
  const [active, setActive] = useState(false);

  return (
    <group position={position}>
      {/* Portal Frame */}
      <mesh position={[0, 2.5, 0]}>
        <boxGeometry args={[4.5, 5.5, 0.3]} />
        <meshStandardMaterial 
          color={active ? "#27ae60" : "#2ecc71"}
          emissive="#2ecc71"
          emissiveIntensity={active ? 0.6 : 0.2}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Sign */}
      <Text
        position={[0, 5.5, 0.2]}
        fontSize={0.4}
        color="#ffffff"
        anchorX="center"
      >
        FOREST
      </Text>

      {/* Portal */}
      <mesh 
        position={[0, 2.5, 0.15]}
        onPointerOver={() => setActive(true)}
        onPointerOut={() => setActive(false)}
      >
        <planeGeometry args={[4, 5]} />
        <MeshPortalMaterial worldUnits blend={1}>
          <color attach="background" args={['#87ceeb']} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1.5} />
          <Sky sunPosition={[100, 20, 100]} />
          
          {/* Trees */}
          {[...Array(30)].map((_, i) => {
            const angle = (i / 30) * Math.PI * 2;
            const radius = 5 + Math.random() * 10;
            return (
              <Tree
                key={i}
                position={[
                  Math.cos(angle) * radius,
                  0,
                  Math.sin(angle) * radius - 5
                ]}
              />
            );
          })}

          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -5]} receiveShadow>
            <planeGeometry args={[50, 50]} />
            <meshStandardMaterial color="#2ecc71" roughness={0.9} />
          </mesh>
        </MeshPortalMaterial>
      </mesh>
    </group>
  );
};

// Cyber Portal
function CyberPortal({ position }) {
  const [active, setActive] = useState(false);

  return (
    <group position={position}>
      {/* Portal Frame */}
      <mesh position={[0, 2.5, 0]}>
        <boxGeometry args={[4.5, 5.5, 0.3]} />
        <meshStandardMaterial 
          color={active ? "#2980b9" : "#3498db"}
          emissive="#3498db"
          emissiveIntensity={active ? 0.6 : 0.2}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Sign */}
      <Text
        position={[0, 5.5, 0.2]}
        fontSize={0.4}
        color="#ffffff"
        anchorX="center"
      >
        CYBER
      </Text>

      {/* Portal */}
      <mesh 
        position={[0, 2.5, 0.15]}
        onPointerOver={() => setActive(true)}
        onPointerOut={() => setActive(false)}
      >
        <planeGeometry args={[4, 5]} />
        <MeshPortalMaterial worldUnits blend={1}>
          <color attach="background" args={['#0a0a0a']} />
          <fog attach="fog" args={['#0a0a0a', 5, 30]} />
          <ambientLight intensity={0.2} />
          <pointLight position={[0, 5, 0]} intensity={3} color="#00ffff" />
          
          <GridFloor />
          <NeonTowers />
          <FloatingCubes />
        </MeshPortalMaterial>
      </mesh>
    </group>
  );
};

// Space Portal
function SpacePortal({ position }) {
  const [active, setActive] = useState(false);

  return (
    <group position={position}>
      {/* Portal Frame */}
      <mesh position={[0, 2.5, 0]}>
        <boxGeometry args={[4.5, 5.5, 0.3]} />
        <meshStandardMaterial 
          color={active ? "#8e44ad" : "#9b59b6"}
          emissive="#9b59b6"
          emissiveIntensity={active ? 0.6 : 0.2}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Sign */}
      <Text
        position={[0, 5.5, 0.2]}
        fontSize={0.4}
        color="#ffffff"
        anchorX="center"
      >
        SPACE
      </Text>

      {/* Portal */}
      <mesh 
        position={[0, 2.5, 0.15]}
        onPointerOver={() => setActive(true)}
        onPointerOut={() => setActive(false)}
      >
        <planeGeometry args={[4, 5]} />
        <MeshPortalMaterial worldUnits blend={1}>
          <color attach="background" args={['#000000']} />
          <ambientLight intensity={0.1} />
          <pointLight position={[0, 0, 0]} intensity={5} />
          
          <Planet position={[-8, 3, -20]} color="#e74c3c" size={3} />
          <Planet position={[10, -2, -25]} color="#3498db" size={2} />
          <Planet position={[0, 5, -30]} color="#f39c12" size={4} />
          
          <Asteroids />
          <Stars />
        </MeshPortalMaterial>
      </mesh>
    </group>
  );
};

// Supporting components
function Tree({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 1, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.4, 2, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[0, 2.5, 0]} castShadow>
        <coneGeometry args={[1.2, 2.5, 8]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>
    </group>
  );
}

function GridFloor() {
  const gridRef = useRef();
  useFrame((state) => {
    gridRef.current.position.z = (state.clock.elapsedTime * 3) % 2;
  });
  return (
    <group ref={gridRef}>
      <gridHelper args={[50, 50, '#00ffff', '#ff00ff']} position={[0, 0, -5]} />
    </group>
  );
}

function NeonTowers() {
  return (
    <group>
      {[...Array(15)].map((_, i) => {
        const angle = (i / 15) * Math.PI * 2;
        const radius = 8;
        const height = 3 + Math.random() * 6;
        const color = i % 2 === 0 ? '#00ffff' : '#ff00ff';
        
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * radius, height / 2, Math.sin(angle) * radius - 5]}
          >
            <boxGeometry args={[0.5, height, 0.5]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.5}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function FloatingCubes() {
  const groupRef = useRef();
  useFrame((state) => {
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.2;
  });
  return (
    <group ref={groupRef}>
      {[...Array(25)].map((_, i) => (
        <Float key={i} speed={2} floatIntensity={1}>
          <mesh position={[
            (Math.random() - 0.5) * 20,
            Math.random() * 8,
            (Math.random() - 0.5) * 20 - 5
          ]}>
            <boxGeometry args={[0.3, 0.3, 0.3]} />
            <meshStandardMaterial color="#00ffff" wireframe />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

function Planet({ position, color, size }) {
  const ref = useRef();
  useFrame(() => {
    ref.current.rotation.y += 0.003;
  });
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
    </mesh>
  );
}

function Asteroids() {
  const ref = useRef();
  useFrame(() => {
    ref.current.rotation.y += 0.001;
  });
  return (
    <group ref={ref}>
      {[...Array(40)].map((_, i) => {
        const angle = (i / 40) * Math.PI * 2;
        const radius = 12 + Math.random() * 5;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * radius,
              (Math.random() - 0.5) * 6,
              Math.sin(angle) * radius - 15
            ]}
          >
            <dodecahedronGeometry args={[0.2 + Math.random() * 0.4, 0]} />
            <meshStandardMaterial color="#7f8c8d" />
          </mesh>
        );
      })}
    </group>
  );
}

function Stars() {
  return (
    <group>
      {[...Array(300)].map((_, i) => (
        <mesh 
          key={i} 
          position={[
            (Math.random() - 0.5) * 80,
            (Math.random() - 0.5) * 80,
            (Math.random() - 0.5) * 80 - 30
          ]}
        >
          <sphereGeometry args={[0.08, 4, 4]} />
          <meshStandardMaterial emissive="#ffffff" emissiveIntensity={1} />
        </mesh>
      ))}
    </group>
  );
}

// Main Scene
function Scene() {
  const [currentWorld, setCurrentWorld] = useState('main');
  const [portalMessage, setPortalMessage] = useState('');

  const handlePortalEnter = (world) => {
    setCurrentWorld(world);
    setPortalMessage(`🌀 Entered ${world.toUpperCase()} world!`);
    setTimeout(() => setPortalMessage(''), 3000);
  };

  return (
    <>
      <color attach="background" args={['#1a1a1a']} />
      <fog attach="fog" args={['#1a1a1a', 10, 50]} />

      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[20, 20, 10]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />
      <pointLight position={[-10, 5, 10]} intensity={1} color="#3498db" />
      <pointLight position={[10, 5, 10]} intensity={1} color="#e74c3c" />

      <Physics gravity={[0, -30, 0]}>
        <MainWorldGround />
        <DrivableCar onPortalEnter={handlePortalEnter} />
      </Physics>

      {/* Three Portals */}
      <ForestPortal position={[-8, 0, -15]} />
      <CyberPortal position={[0, 0, -15]} />
      <SpacePortal position={[8, 0, -15]} />

      {/* Title */}
      <Text
        position={[0, 6, -14]}
        fontSize={0.8}
        color="#ffffff"
        anchorX="center"
      >
        DRIVE THROUGH THE PORTALS
      </Text>

      {/* <FollowCamera /> */}

      <OrbitControls />

      {/* Portal message */}
      {portalMessage && (
        <Text
          position={[0, 4, 0]}
          fontSize={0.5}
          color="#2ecc71"
          anchorX="center"
        >
          {portalMessage}
        </Text>
      )}
    </>
  );
}

// Keyboard controls map
const keyboardMap = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'right', keys: ['ArrowRight', 'KeyD'] },
  { name: 'brake', keys: ['Space'] },
];

// Main App
export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <KeyboardControls map={keyboardMap}>
        <Canvas
          shadows
          camera={{ position: [0, 5, 10], fov: 60 }}
        >
          <Scene />
        </Canvas>
      </KeyboardControls>

      {/* Controls UI */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        color: 'white',
        background: 'rgba(0,0,0,0.8)',
        padding: '20px 40px',
        borderRadius: '12px',
        fontFamily: 'monospace',
        fontSize: '16px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '20px', marginBottom: '15px', fontWeight: 'bold' }}>
          🚗 CONTROLS
        </div>
        <div style={{ display: 'flex', gap: '30px', justifyContent: 'center' }}>
          <div>
            <div style={{ opacity: 0.7, fontSize: '14px' }}>Drive</div>
            <div style={{ fontWeight: 'bold' }}>W A S D / ↑ ← ↓ →</div>
          </div>
          <div>
            <div style={{ opacity: 0.7, fontSize: '14px' }}>Brake</div>
            <div style={{ fontWeight: 'bold' }}>SPACE</div>
          </div>
        </div>
        <div style={{ marginTop: '15px', fontSize: '14px', opacity: 0.8 }}>
          💡 Drive through a portal to enter another world!
        </div>
      </div>

      {/* World Info */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        color: 'white',
        background: 'rgba(0,0,0,0.8)',
        padding: '15px 20px',
        borderRadius: '8px',
        fontFamily: 'monospace',
        fontSize: '14px',
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>🌀 PORTALS</div>
        <div style={{ color: '#2ecc71' }}>← Left: FOREST</div>
        <div style={{ color: '#3498db' }}>Center: CYBER</div>
        <div style={{ color: '#9b59b6' }}>Right: SPACE →</div>
      </div>
    </div>
  );
}