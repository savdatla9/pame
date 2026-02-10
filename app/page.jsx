'use client'

import { 
  Physics, useBox, useSphere,
  useCylinder, usePlane, 
} from '@react-three/cannon';
import * as THREE from 'three';
import { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, ContactShadows } from '@react-three/drei';

import Vehicle from './game/vehicle/index.jsx';
import { PhysicalText } from './game/components/texts.jsx';

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

function Plane(props) {
  const [ref] = usePlane(
    () => ({ material: 'ground', type: 'Static', ...props }),
    useRef(null)
  );

  return (
    <group ref={ref}>
      <mesh receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial color="SandyBrown" side={2} />
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

function Pillar(props) {
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
      <meshNormalMaterial />
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

const VehicleScene = () => {
  // const { lap, onCheckpoint, onFinish } = useRace()

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
        {/* <fog attach="fog" args={['#87CEEB', 10, 75]} /> */}

        <color attach="background" args={['#87CEEB']} />

        <ambientLight intensity={0.3} />

        <directionalLight
          position={[10, 15, 5]}
          intensity={1.5}
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
          intensity={0.5}
          color="#4477ff"
        />

        <hemisphereLight
          skyColor="#ffffff"
          groundColor="#444444"
          intensity={0.5}
        />

        <pointLight 
          position={[0, 5, -10]} 
          intensity={0.8} 
          color="#ff6b6b" 
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

        {/* <spotLight 
          angle={0.75}
          castShadow
          decay={0}
          intensity={Math.PI}
          penumbra={1}
          position={[-2, 10, -5]}
        /> */}

        <Physics
          broadphase="SAP"
          defaultContactMaterial={{
            contactEquationRelaxation: 10,
            friction: 1e-3,
          }}
          allowSleep
        >
          <Plane rotation={[-Math.PI / 2, 0, 0]} userData={{ id: 'floor' }} />

          <Vehicle
            position={[0.5, 2, 0]}
            rotation={[0, 0, 0]}
            angularVelocity={[0, 0.5, 0]}
          />

          <Pillar position={[-5, 2.5, -5]} userData={{ id: 'pillar-1' }} />
          <Pillar position={[0, 2.5, -5]} userData={{ id: 'pillar-2' }} />
          <Pillar position={[5, 2.5, -5]} userData={{ id: 'pillar-3' }} />

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

          {/* <PhysicsText
            text="S A V D"
            position={[0, 0, 4]}
            size={1.5}
            mass={0}
            color="cadetblue"
          /> */}
          <PhysicalText text="S" position={[-1.8, 1, 4]} />
          <PhysicalText text="A" position={[-0.35, 1, 4]} />
          <PhysicalText text="V" position={[0.75, 1, 4]} /> 
          <PhysicalText text="D" position={[2.25, 1, 4]} />

          {/* <PhysicalText text="A" position={[0.75, 0.8, 4]} />
          <PhysicalText text="K" position={[2.2, 0.8, 4]} />
          <PhysicalText text="H" position={[3.3, 0.8, 4]} />
          <PhysicalText text="I" position={[4.15, 0.8, 4]} />
          <PhysicalText text="L" position={[4.85, 0.8, 4]} /> */}

          {/* <PhysicalText text="V" position={[0, 1.25, 4]} />
          <PhysicalText text="A" position={[-1.8, 1.25, 4]} />
          <PhysicalText text="R" position={[-0.5, 1.25, 4]} />
          <PhysicalText text="M" position={[0, 1.25, 4]} />
          <PhysicalText text="A" position={[-1.8, 1.25, 4]} />

          {/*<PhysicalText text="D" position={[0, 1.25, 4]} />
          <PhysicalText text="A" position={[-1.8, 1.25, 4]} />
          <PhysicalText text="T" position={[-0.5, 1.25, 4]} />
          <PhysicalText text="L" position={[0, 1.25, 4]} />
          <PhysicalText text="A" position={[-1.8, 1.25, 4]} /> */}

          {/* <StaticPhysicalText text="S A V D" position={[-1, 0.5, 4]} /> */}

          {/* Dynamic text (knockable) */}
          {/* <PhysicsText
            text="Varma Datla"
            position={[5.5, 0, 4]}
            size={1.2}
            mass={5}
            color="azure"
          /> */}
        </Physics>

        <Suspense fallback={null}>
          <Environment preset="night" />
        </Suspense>

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