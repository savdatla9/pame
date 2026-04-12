'use client'

import { 
  Physics, useBox, useSphere,
  useCylinder, usePlane, 
} from '@react-three/cannon';
import * as THREE from 'three';
import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Loader, MeshDistortMaterial } from '@react-three/drei';
import { Suspense } from 'react';

import RampTrimesh from './game/components/Hill.jsx';
import Heightfield from './game/components/Heightfield.jsx';
import BlackHole from './game/components/BlackHole.jsx';
import WhiteHole from './game/components/WhiteHole.jsx';
import KeyItem from './game/components/Key.jsx';
import Vehicle from './game/vehicle/index.jsx';
import { BrickLetter } from './game/components/texts.jsx';
import Compass from './game/components/Compass.jsx';

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
    
    const isNeon = currentWorld.key === 'neon';
    
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
      } else if (isNeon) {
        // Rain on Neon: falling down very fast
        particle.position[1] -= (particle.speed * 10 + 0.5);
        
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
      
      if (isNeon) {
        dummy.scale.set(particle.scale * 0.2, particle.scale * 4, particle.scale * 0.2);
      } else {
        dummy.scale.set(particle.scale, particle.scale, particle.scale);
      }
      
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

function LightningEffect({ active }) {
  const lightRef = useRef();

  useFrame(() => {
    if (!active || !lightRef.current) return;
    
    // Simulate lightning flash: occasionally very bright, otherwise rapidly decaying
    if (Math.random() > 0.985) {
      lightRef.current.intensity = 5 + Math.random() * 15;
    } else {
      lightRef.current.intensity = THREE.MathUtils.lerp(lightRef.current.intensity, 0, 0.15);
    }
  });

  return active ? (
    <directionalLight ref={lightRef} position={[0, 20, 0]} color="#1E90FF" intensity={0} castShadow />
  ) : null;
}

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

function Plane({ color = "SandyBrown", roughness = 0.8, metalness = 0.1, grid = false, worldKey, ...props }) {
  const [ref] = usePlane(
    () => ({ material: 'ground', type: 'Static', ...props }),
    useRef(null)
  );

  const isIce = worldKey === 'ice';
  const isNeon = worldKey === 'neon';

  return (
    <group ref={ref}>
      {/* Main Surface */}
      <mesh receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[1000, 1000]} />
        {isIce ? (
          <meshPhysicalMaterial 
            color={color} 
            roughness={0.02} 
            metalness={0.8} 
            transmission={0.5} 
            thickness={1.5}
            reflectivity={1}
            clearcoat={1}
            side={THREE.DoubleSide} 
          />
        ) : (
          <meshStandardMaterial 
            color={color} 
            roughness={roughness} 
            metalness={metalness} 
            side={THREE.DoubleSide} 
          />
        )}
      </mesh>

      {/* Neon Flowing Water Overlay with Wave Effect */}
      {isNeon && (
        <group position={[0, 0, 0.1]}>
          <mesh receiveShadow>
            <planeGeometry args={[1000, 1000, 64, 64]} />
            <MeshDistortMaterial 
              color="#001133" 
              transparent 
              opacity={0.6} 
              emissive="#0044ff" 
              emissiveIntensity={0.5}
              distort={0.4} 
              speed={2} 
            />
          </mesh>
        </group>
      )}

      {/* Main World Grid */}
      {grid && !isNeon && (
        <gridHelper 
          args={[1000, 100, '#1E90FF', '#050510']} 
          rotation={[Math.PI / 2, 0, 0]} 
          position={[0, 0, 0.05]} 
        />
      )}
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
    ground: '#C2B280', // Desert/Sand color
    heightfieldColor: '#228B22', // Forest Green
    roughness: 0.8,
    metalness: 0.1,
  },
  {
    key: 'neon',
    fog: '#0a0a1a',
    bg: '#0a0a1a',
    ambientLight: 0.05,
    dirLight1: { color: '#1E90FF', intensity: 1.0 },
    dirLight2: { color: '#ff4400', intensity: 1.5 },
    hemiLight: { sky: '#1E90FF', ground: '#111111' },
    pointLight: { color: '#1E90FF', intensity: 2.5 },
    ground: '#050510',
    heightfieldColor: '#1E90FF',
    roughness: 0.2,
    metalness: 0.8,
    grid: true,
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
    heightfieldColor: '#cc5533',
    roughness: 0.9,
    metalness: 0.0,
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
    ground: '#e0f7ff',
    heightfieldColor: '#ffffff',
    roughness: 0.05,
    metalness: 0.95,
  }
];

const VehicleScene = () => {
  const [worldIndex, setWorldIndex] = useState(0);
  const [hasKey, setHasKey] = useState(false);

  const isInsideHeightfield = (x, z, worldKey) => {
    const padding = 5;
    if (worldKey === 'normal') {
      return x > -20 - padding && x < 28 + padding && z > -28 - padding && z < 20 + padding;
    }
    if (worldKey === 'mars') {
      return x > -20 - padding && x < 76 + padding && z > -76 - padding && z < 20 + padding;
    }
    if (worldKey === 'ice') {
      return x > -20 - padding && x < 0 + padding && z > 0 - padding && z < 20 + padding;
    }
    return false;
  };

  const getRandomPosition = (y, worldKey) => {
    let x, z;
    let attempts = 0;
    do {
      x = (Math.random() - 0.5) * 90;
      z = (Math.random() - 0.5) * 90;
      attempts++;
    } while (isInsideHeightfield(x, z, worldKey) && attempts < 100);
    return [x, y, z];
  };

  const [keyPosition, setKeyPosition] = useState([0, 1.5, -8]);
  const [blackHolePosition, setBlackHolePosition] = useState([15, 2, -10]);
  const [whiteHolePosition, setWhiteHolePosition] = useState([-15, 2, 10]);

  const getDistance = (p1, p2) => Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[2] - p2[2], 2));

  const randomizePositions = (targetWorldIndex = worldIndex) => {
    const targetWorldKey = WORLDS[targetWorldIndex].key;
    const minD = 12;
    const newKey = getRandomPosition(1.5, targetWorldKey);
    
    let newBlack;
    do {
      newBlack = getRandomPosition(2, targetWorldKey);
    } while (getDistance(newKey, newBlack) < minD);
    
    let newWhite;
    do {
      newWhite = getRandomPosition(2, targetWorldKey);
    } while (getDistance(newKey, newWhite) < minD || getDistance(newBlack, newWhite) < minD);

    setKeyPosition(newKey);
    setBlackHolePosition(newBlack);
    setWhiteHolePosition(newWhite);
  };

  useEffect(() => {
    randomizePositions();
  }, []);

  const [showInstructions, setShowInstructions] = useState(false);
  const [teleporting, setTeleporting] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'h' || e.key === 'H') {
        setShowInstructions((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const currentWorld = WORLDS[worldIndex];
  
  const onEnterBlackHole = () => {
    if (teleporting || !hasKey) return;
    setTeleporting({ type: 'black', position: blackHolePosition });
  };
  
  const onEnterWhiteHole = () => {
    if (teleporting || !hasKey) return;
    setTeleporting({ type: 'white', position: whiteHolePosition });
  };

  const handleTeleportDone = () => {
    let nextWorld = worldIndex;
    if (teleporting?.type === 'black') {
      nextWorld = (worldIndex + 1) % WORLDS.length;
    } else if (teleporting?.type === 'white') {
      nextWorld = (worldIndex - 1 + WORLDS.length) % WORLDS.length;
    }
    setWorldIndex(nextWorld);
    setHasKey(false);
    randomizePositions(nextWorld);
    setTeleporting(null);
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
        
        <LightningEffect active={currentWorld.key === 'neon'} />

        <Suspense fallback={null}>
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
            roughness={currentWorld.roughness}
            metalness={currentWorld.metalness}
            grid={currentWorld.grid}
            worldKey={currentWorld.key}
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
            teleporting={teleporting}
            onTeleportDone={handleTeleportDone}
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
              <RampTrimesh 
                position={[3.5, 1.1, 15]} 
                rotation={[0, Math.PI / 2, 0]} 
                scale={[0.75, 0.75, 0.75]} 
                color={currentWorld.ground}
                roughness={currentWorld.roughness}
              />
              <RampTrimesh 
                position={[3.5, 1.1, 10]} 
                rotation={[0, -Math.PI / 2, 0]} 
                scale={[0.75, 0.75, 0.75]} 
                color={currentWorld.ground}
                roughness={currentWorld.roughness}
              />
              {/* Heightfield Terrain */}
              <Heightfield 
                position={[-20, -0.2, 20]} 
                size={32} 
                elementSize={1.5} 
                color={currentWorld.heightfieldColor} 
                roughness={currentWorld.roughness}
                metalness={currentWorld.metalness}
                worldKey={currentWorld.key}
              />
            </>
          )}

          {currentWorld.key === 'neon' && (
            <>
              <Pillar position={[-5, 2.5, 2]} color="#aa00ff" />
              <Pillar position={[0, 2.5, 2]} color="#ff00aa" />
              <Pillar position={[5, 2.5, 2]} color="#aa00ff" />
              {/* Static spheres (track barriers) */}
              <SphereObstacle position={[8, 0.6, -6]} color='#ff22aa' />
              <SphereObstacle position={[-8, 0.6, -6]} color='#aa22ff' />
              <SphereObstacle position={[12, 0.6, 4]} color='#22ffff' />
              <SphereObstacle position={[-12, 0.6, 4]} color='#ff22aa' />
              {/* Stack of boxes */}
              <Box position={[3, 1, 2]} color='#ff00aa' />
              <Box position={[-2, 1, 2]} color="#aa00ff" />
              <Box position={[-3, 1, -2]} color="#22ffff" />
              {/*  Hill */}
              <RampTrimesh 
                position={[0, 1.1, 18]} 
                rotation={[0, Math.PI / 2, 0]} 
                scale={[0.75, 0.75, 0.75]} 
                color="#220033"
                roughness={0.2}
              />
            </>
          )}

          {currentWorld.key === 'mars' && (
            <>
              <Pillar position={[-3, 2.5, 4]} color="#cc2211" />
              <Pillar position={[3, 2.5, -4]} color="#cc2211" />
              {/* Stack of boxes */}
              <Box position={[3, 1, 2]} color='#ff5533' />
              {/* Static spheres (track barriers) */}
              <SphereObstacle position={[6, 1.2, 6]} radius={1.2} color='#883311' />
              <SphereObstacle position={[-6, 1.2, -6]} radius={1.2} color='#cc5533' />
              {/*  Hill */}
              <RampTrimesh 
                position={[10, 1.1, 0]} 
                rotation={[0, Math.PI, 0]} 
                scale={[0.75, 0.75, 0.75]} 
                color={currentWorld.ground}
                roughness={currentWorld.roughness}
              />
              {/* Heightfield Terrain */}
              <Heightfield 
                position={[-20, -0.2, 20]} 
                size={64} 
                elementSize={1.5} 
                color={currentWorld.heightfieldColor} 
                roughness={currentWorld.roughness}
                metalness={currentWorld.metalness}
                worldKey={currentWorld.key}
              />
            </>
          )}

          {currentWorld.key === 'ice' && (
            <>
              <Pillar position={[-5, 2.5, -5]} color="#ffffff" />
              <Pillar position={[5, 2.5, 5]} color="#aaddff" />
              {/* Static spheres (track barriers) */}
              <SphereObstacle position={[8, 0.6, -6]} color='#bbddff' />
              <SphereObstacle position={[-8, 0.6, -6]} color='#ffffff' />
              {/* Stack of boxes */}
              <Box position={[3, 1, 2]} color='#aaddff' />
              <Box position={[-2, 1, 2]} color="#ffffff" />
              {/*  Hill */}
              <RampTrimesh 
                position={[0, 1.1, 20]} 
                rotation={[0, Math.PI / 2, 0]} 
                scale={[1, 1, 1]} 
                color={currentWorld.ground}
                roughness={currentWorld.roughness}
              />
              {/* Heightfield Terrain */}
              <Heightfield 
                position={[-20, -0.2, 20]} 
                size={32} 
                elementSize={2.5} 
                color={currentWorld.heightfieldColor} 
                roughness={currentWorld.roughness}
                metalness={currentWorld.metalness}
                worldKey={currentWorld.key}
              />
            </>
          )}

          {currentWorld.key==='normal' && <>
            {/*  Name Logo*/}
            <BrickLetter text="S" position={[-1.5, 0.5, -4]} />
            <BrickLetter text="A" position={[-0.35, 0.5, -4]} />
            <BrickLetter text="V" position={[0.75, 0.5, -4]} /> 
            <BrickLetter text="D" position={[2, 0.5, -4]} />
          </>}
        </Physics>
        </Suspense>

        <OrbitControls />
      </Canvas>

      <Loader 
        containerStyles={{
          backgroundColor: '#0a0a1a',
          zIndex: 9999
        }}
        innerStyles={{
          width: '300px'
        }}
        barStyles={{
          backgroundColor: '#1E90FF',
          height: '10px'
        }}
        dataStyles={{
          color: '#1E90FF',
          fontSize: '20px',
          fontWeight: 'bold',
          fontFamily: 'sans-serif',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          marginTop: '15px'
        }}
        dataInterpolation={(p) => `Loading Game... ${p.toFixed(0)}%`}
      />

      <div style={style}>
        <pre>
          * WASD to drive, space to brake
          {'\n'}r to reset
          {'\n'}h for instructions
        </pre>
      </div>

      <Compass 
        keyPos={keyPosition} 
        blackHolePos={blackHolePosition} 
        whiteHolePos={currentWorld.key !== 'normal' ? whiteHolePosition : null} 
        hasKey={hasKey} 
      />

      {showInstructions && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          color: 'white',
          padding: '30px',
          borderRadius: '15px',
          maxWidth: '500px',
          textAlign: 'center',
          fontFamily: 'sans-serif',
          zIndex: 1000,
          boxShadow: '0 0 20px rgba(0,0,0,0.5)'
        }}>
          <h2 style={{ marginTop: 0, color: '#1E90FF', textTransform: 'uppercase', letterSpacing: '2px', fontSize: 25 }}>Game Instructions</h2>
          
          <div style={{ textAlign: 'left', marginBottom: '20px' }}>
            <h3 style={{ color: '#ffaa00', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🎮 Controls
            </h3>
            <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.8', fontSize: '1.1em' }}>
              <li><strong>W / ↑</strong> : Accelerate</li>
              <li><strong>S / ↓</strong> : Reverse</li>
              <li><strong>A / ←</strong> : Steer Left</li>
              <li><strong>D / →</strong> : Steer Right</li>
              <li><strong>Space</strong> : Brake</li>
              <li><strong>R</strong> : Reset Position</li>
              <li><strong>H</strong> : Toggle this menu</li>
            </ul>
          </div>

          <div style={{ textAlign: 'left' }}>
            <h3 style={{ color: '#00ccff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🎯 Objective
            </h3>
            <p style={{ margin: 0, lineHeight: '1.6', fontSize: '1.1em' }}>
              Explore different worlds! Find the hidden <strong style={{ color: '#ffaa00' }}>Key</strong> to unlock interdimensional portals. 
              Drive into the <strong style={{ color: '#aa00ff' }}>Black Hole</strong> to travel forward, or the <strong style={{ color: 'grey' }}>White Hole</strong> to return to the previous world.
            </p>
          </div>

          <button 
            onClick={() => setShowInstructions(false)}
            style={{
              marginTop: '30px',
              padding: '12px 30px',
              background: '#1E90FF',
              border: 'none',
              color: 'white',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1.1em',
              fontWeight: 'bold',
              transition: 'background 0.2s',
              boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
            }}
            onMouseOver={(e) => e.target.style.background = '#0073e6'}
            onMouseOut={(e) => e.target.style.background = '#1E90FF'}
          >
            LET'S PLAY
          </button>
        </div>
      )}
    </>
  );
};

export default VehicleScene;