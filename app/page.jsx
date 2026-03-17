'use client'

import { 
  Physics, useBox, useSphere,
  useCylinder, usePlane, 
} from '@react-three/cannon';
import * as THREE from 'three';
import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';

import RampTrimesh from './game/components/Hill.jsx';
import BlackHole from './game/components/BlackHole.jsx';
import WhiteHole from './game/components/WhiteHole.jsx';
import KeyItem from './game/components/Key.jsx';
import Vehicle from './game/vehicle/index.jsx';
import { BrickLetter } from './game/components/texts.jsx';

// Generate particles just once to optimize memory
const particleCount = 5000;
const particleData = new Array(particleCount).fill().map(() => {
  const x = (Math.random() - 0.5) * 80;
  const z = (Math.random() - 0.5) * 80;
  return {
    position: [
      x,
      (Math.random() - 0.5) * 40, // y
      z
    ],
    // Save the base X and Z so we can oscillate around them
    baseX: x,
    baseZ: z,
    rotation: [
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    ],
    scale: Math.random() * 0.5 + 0.1,
    speed: Math.random() * 0.05 + 0.01,
    // Unique offsets for the sine waves so they don't all wave together
    offset: Math.random() * Math.PI * 2,
    waveSpeed: Math.random() * 0.5 + 0.5
  };
});

function Particles({ currentWorld }) {
  const mesh = useRef();
  const dummy = new THREE.Object3D();
  
  // Clone the initial particle data so we can mutate it
  const particles = useRef(JSON.parse(JSON.stringify(particleData)));

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const isMars = currentWorld.key === 'mars';
    const isIce = currentWorld.key === 'ice';
    
    particles.current.forEach((particle, i) => {
      if (isMars) {
        // Sandstorm on Mars: fast horizontal movement
        particle.position[0] -= (particle.speed + 0.3); // Blow fast to the left
        particle.position[1] = particle.baseX * 0.5 + Math.sin(time * particle.waveSpeed + particle.offset) * 2; // Wavy Y axis
        particle.position[2] = particle.baseZ + Math.cos(time * particle.waveSpeed * 2 + particle.offset) * 2; // Wavy Z axis

        // Wrap around X
        if (particle.position[0] < -40) {
          particle.position[0] = 40;
        }
      } else if (isIce) {
        // Snow on Ice: falling down slowly with slight sway
        particle.position[1] -= (particle.speed + 0.02);
        
        // Slight waving as they fall
        particle.position[0] = particle.baseX + Math.sin(time * particle.waveSpeed * 0.5 + particle.offset) * 1.5;
        particle.position[2] = particle.baseZ + Math.cos(time * particle.waveSpeed * 0.5 + particle.offset) * 1.5;
        
        // Wrap around Y (fall down)
        if (particle.position[1] < -20) {
          particle.position[1] = 20;
        }
      } else {
        // Normal Worlds: slow upward movement
        particle.position[1] += particle.speed;
        
        // Add wave motion to X and Z
        particle.position[0] = particle.baseX + Math.sin(time * particle.waveSpeed + particle.offset) * 2;
        particle.position[2] = particle.baseZ + Math.cos(time * particle.waveSpeed + particle.offset) * 2;
        
        // Wrap around Y
        if (particle.position[1] > 20) {
          particle.position[1] = -20;
        }
      }

      particle.rotation[0] += isMars ? 0.05 : 0.01;
      particle.rotation[1] += isMars ? 0.05 : 0.01;

      dummy.position.set(...particle.position);
      dummy.rotation.set(...particle.rotation);
      dummy.scale.set(particle.scale, particle.scale, particle.scale);
      dummy.updateMatrix();
      
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[null, null, particleCount]}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshBasicMaterial 
        color={currentWorld.key === 'mars' ? '#de6636' : 'white'} 
        transparent 
        opacity={currentWorld.key === 'mars' ? 0.6 : (currentWorld.key === 'ice' ? 0.8 : 0.3)} 
      />
    </instancedMesh>
  );
};

// import TrackCollision from './game/trackcollision.jsx';
// import World from './game/World.jsx';

// export function useRace() {
//   const [lap, setLap] = useState(1);
//   const [checkpoint, setCheckpoint] = useState(0);

//   const onCheckpoint = (id) => {
//     if (id === checkpoint + 1) {
//       setCheckpoint(id);
//     };
//   };

//   const onFinish = () => {
//     if (checkpoint === 2) {
//       setLap((l) => l + 1);
//       setCheckpoint(0);
//     };
//   };

//   return { lap, onCheckpoint, onFinish };
// };

function SphereObstacle({
  position = [0, 1, 0],
  radius = 0.6,
  mass = 0,           // 0 = static, >0 = movable
  color = 'orange',
}) {
  const [ref] = useSphere(
    () => ({
      args: [radius],
      position,
      mass,
      type: mass === 0 ? 'Static' : 'Dynamic',
      material: 'obstacle',
    }), useRef(null)
  );

  return (
    <mesh ref={ref} castShadow receiveShadow>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

function Plane({ color = "SandyBrown", ...props }) {
  const [ref] = usePlane(
    () => ({ material: 'ground', type: 'Static', ...props }),
    useRef(null)
  );

  return (
    <group ref={ref}>
      <mesh receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial color={color} side={2} />
      </mesh>
    </group>
  );
};

function Box({ position = [0, 1, 0], size = [1, 1, 1], color = 'orange', ...props }) {
  const [ref] = useBox(
    () => ({
      mass: 5,
      position,
      args: size,
      ...props,
    }),
    useRef(null)
  );

  return (
    <mesh ref={ref} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
};

function Pillar({ color = 'gray', ...props }) {
  const args = [0.7, 0.7, 5, 16]

  const [ref] = useCylinder(
    () => ({
      args,
      mass: 10,
      ...props,
    }),
    useRef(null)
  );

  return (
    <mesh ref={ref} castShadow receiveShadow>
      <cylinderGeometry args={args} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

const style = {
  color: 'white',
  fontSize: '1.2em',
  left: 50,
  position: 'absolute',
  top: 20,
};

const WORLDS = [
  {
    key: 'normal',
    fog: '#87CEEB',
    bg: '#87CEEB',
    ambientLight: 0.3,
    dirLight1: { color: '#ffffff', intensity: 1.5 },
    dirLight2: { color: '#4477ff', intensity: 0.5 },
    hemiLight: { sky: '#ffffff', ground: '#444444' },
    pointLight: { color: '#ff6b6b', intensity: 0.8 },
    ground: 'SandyBrown',
  },
  {
    key: 'neon',
    fog: '#0a0a1a',
    bg: '#0a0a1a',
    ambientLight: 0.05,
    dirLight1: { color: '#aa88ff', intensity: 0.5 },
    dirLight2: { color: '#ff4400', intensity: 1.5 },
    hemiLight: { sky: '#4400aa', ground: '#111111' },
    pointLight: { color: '#ff0055', intensity: 2.0 },
    ground: '#220033',
  },
  {
    key: 'mars',
    fog: '#b04a25',
    bg: '#de6636',
    ambientLight: 0.2,
    dirLight1: { color: '#ffccaa', intensity: 1.2 },
    dirLight2: { color: '#883311', intensity: 0.8 },
    hemiLight: { sky: '#ff8855', ground: '#331100' },
    pointLight: { color: '#ffaa00', intensity: 1.5 },
    ground: '#883311',
  },
  {
    key: 'ice',
    fog: '#d0f0ff',
    bg: '#eef8ff',
    ambientLight: 0.4,
    dirLight1: { color: '#ffffff', intensity: 1.2 },
    dirLight2: { color: '#88ccff', intensity: 1.0 },
    hemiLight: { sky: '#ffffff', ground: '#aaddff' },
    pointLight: { color: '#00ccff', intensity: 1.0 },
    ground: '#aaccbb',
  }
];

const VehicleScene = () => {
  const [worldIndex, setWorldIndex] = useState(0);
  const [hasKey, setHasKey] = useState(false);

  const getRandomPosition = (y) => [
    (Math.random() - 0.5) * 40,
    y,
    (Math.random() - 0.5) * 40
  ];

  const [keyPosition, setKeyPosition] = useState([0, 1.5, -8]);
  const [blackHolePosition, setBlackHolePosition] = useState([15, 2, -10]);
  const [whiteHolePosition, setWhiteHolePosition] = useState([-15, 2, 10]);

  const randomizePositions = () => {
    setKeyPosition(getRandomPosition(1.5));
    setBlackHolePosition(getRandomPosition(2));
    setWhiteHolePosition(getRandomPosition(2));
  };

  useEffect(() => {
    randomizePositions();
  }, []);

  const currentWorld = WORLDS[worldIndex];
  
  const onEnterBlackHole = () => {
    setWorldIndex((prev) => (prev + 1) % WORLDS.length);
    setHasKey(false);
    randomizePositions();
  };
  
  const onEnterWhiteHole = () => {
    setWorldIndex((prev) => (prev - 1 + WORLDS.length) % WORLDS.length);
    setHasKey(false);
    randomizePositions();
  };

  return (
    <>
      <Canvas 
        camera={{ fov: 50, position: [0, 7.5, 15] }} 
        shadows style={{ height: '100vh' }}
        gl={{ 
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2
        }}
      >
        <fog attach="fog" args={[currentWorld.fog, 10, 100]} />

        <color attach="background" args={[currentWorld.bg]} />

        <ambientLight intensity={currentWorld.ambientLight} />

        <directionalLight
          position={[10, 15, 5]}
          intensity={currentWorld.dirLight1.intensity}
          color={currentWorld.dirLight1.color}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-far={50}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
          shadow-bias={-0.0001}
        />

        <directionalLight
          position={[-5, 10, -5]}
          intensity={currentWorld.dirLight2.intensity}
          color={currentWorld.dirLight2.color}
        />

        <hemisphereLight
          skyColor={currentWorld.hemiLight.sky}
          groundColor={currentWorld.hemiLight.ground}
          intensity={0.5}
        />

        <pointLight 
          position={[0, 5, -10]} 
          intensity={currentWorld.pointLight.intensity} 
          color={currentWorld.pointLight.color} 
        />

        <ContactShadows
          position={[0, 0.01, 0]}
          opacity={0.5}
          scale={1000}
          blur={2}
          far={10}
          resolution={256}
          color="#000000"
        />

        <Particles currentWorld={currentWorld} />

        <Physics
          broadphase="SAP"
          defaultContactMaterial={{
            contactEquationRelaxation: 10,
            friction: 1e-3,
          }}
          allowSleep
        >
          <Plane 
            rotation={[-Math.PI / 2, 0, 0]} 
            userData={{ id: 'floor' }} 
            color={currentWorld.ground} 
          />
          
          {!hasKey && (
            <KeyItem position={keyPosition} onCollect={() => setHasKey(true)} />
          )}

          {hasKey && (
            <>
              <BlackHole position={blackHolePosition} onEnter={onEnterBlackHole} />
              {currentWorld.key !== 'normal' && (
                <WhiteHole position={whiteHolePosition} onEnter={onEnterWhiteHole} />
              )}
            </>
          )}

          <Vehicle
            position={[0.5, 2, 0]}
            rotation={[0, 0, 0]}
            angularVelocity={[0, 0.5, 0]}
          />

          {currentWorld.key === 'normal' && (
            <>
              <Box position={[3, 1, 2]} color='forestgreen' />
              <Box position={[-2, 1, 2]} color="red" />
              <Box position={[-3, 1, -2]} color="aqua" />
              {/* Stack of boxes */}
              <Box position={[5, 1, 0]} />
              <Box position={[5, 2.2, 0]} color="#00bfff" />
              <Box position={[5, 3.4, 0]} />
              {/* Static spheres (track barriers) */}
              <SphereObstacle position={[8, 0.6, -6]} color='lightcyan' />
              <SphereObstacle position={[-8, 0.6, -6]} color='skyblue' />
              <SphereObstacle position={[12, 0.6, 4]} color='skyblue' />
              <SphereObstacle position={[-12, 0.6, 4]} color='lightcyan' />
              {/*  Hill */}
              <RampTrimesh position={[0, 1.5, 15]} rotation={[0, Math.PI / 2, 0]} scale={[0.75, 0.75, 0.75]} />
              <RampTrimesh position={[0, 1.5, 10]} rotation={[0, -Math.PI / 2, 0]} scale={[0.75, 0.75, 0.75]} />
            </>
          )}

          {currentWorld.key === 'neon' && (
            <>
              <Pillar position={[-5, 2.5, 2]} color="#aa00ff" />
              <Pillar position={[0, 2.5, 2]} color="#ff00aa" />
              <Pillar position={[5, 2.5, 2]} color="#aa00ff" />
              <SphereObstacle position={[8, 0.6, -6]} color='#ff22aa' />
              <SphereObstacle position={[-8, 0.6, -6]} color='#aa22ff' />
              <SphereObstacle position={[12, 0.6, 4]} color='#22ffff' />
              <SphereObstacle position={[-12, 0.6, 4]} color='#ff22aa' />
              <Box position={[3, 1, 2]} color='#ff00aa' />
              <Box position={[-2, 1, 2]} color="#aa00ff" />
              <Box position={[-3, 1, -2]} color="#22ffff" />
            </>
          )}

          {currentWorld.key === 'mars' && (
            <>
              <Box position={[3, 1, 2]} color='#ff5533' />
              <Pillar position={[-3, 2.5, 4]} color="#cc2211" />
              <Pillar position={[3, 2.5, -4]} color="#cc2211" />
              <SphereObstacle position={[6, 1.2, 6]} radius={1.2} color='#883311' />
              <SphereObstacle position={[-6, 1.2, -6]} radius={1.2} color='#cc5533' />
              {/*  Hill */}
              <RampTrimesh position={[10, 1.5, 0]} rotation={[0, Math.PI, 0]} scale={[0.75, 0.75, 0.75]} />
            </>
          )}

          {currentWorld.key === 'ice' && (
            <>
              <Pillar position={[-5, 2.5, -5]} color="#ffffff" />
              <Pillar position={[5, 2.5, 5]} color="#aaddff" />
              <SphereObstacle position={[8, 0.6, -6]} color='#bbddff' />
              <SphereObstacle position={[-8, 0.6, -6]} color='#ffffff' />
              <Box position={[3, 1, 2]} color='#aaddff' />
              <Box position={[-2, 1, 2]} color="#ffffff" />
              <RampTrimesh position={[0, 1.5, 20]} rotation={[0, Math.PI / 2, 0]} scale={[1, 1, 1]} />
            </>
          )}

          {/*  Name Logo*/}
          <BrickLetter text="S" position={[-1.5, 0.5, -4]} />
          <BrickLetter text="A" position={[-0.35, 0.5, -4]} />
          <BrickLetter text="V" position={[0.75, 0.5, -4]} /> 
          <BrickLetter text="D" position={[2, 0.5, -4]} />
        </Physics>

        <OrbitControls />
      </Canvas>

      <div style={style}>
        <pre>
          * WASD to drive, space to brake
          {'\n'}r to reset
        </pre>
      </div>
    </>
  );
};

export default VehicleScene;