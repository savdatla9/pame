'use client'

import { 
  Physics, useBox, useSphere,
  useCylinder, usePlane, 
} from '@react-three/cannon';
// import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { Suspense, useRef } from 'react';
import { Environment, OrbitControls, ContactShadows } from '@react-three/drei';

import Vehicle from './game/vehicle/index.jsx';
import PhysicsText from './game/components/texts.jsx';
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
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="SandyBrown" side={2} />
      </mesh>

      <ContactShadows opacity={1} scale={10} blur={1} far={10} resolution={1024} color="#000000" />
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
      <Canvas camera={{ fov: 50, position: [0, 5, 15] }} shadows style={{ height: '100vh' }}>
        {/* <fog attach="fog" args={['skyblue', 10, 75]} /> */}

        <color attach="background" args={['sandybrown']} />

        <ambientLight intensity={1} />

        <directionalLight 
          castShadow
          intensity={0.8}
          position={[5, 10, 7.5]}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={5}
          shadow-camera-far={5000}
          shadow-camera-left={-100}
          shadow-camera-right={100}
          shadow-camera-top={100}
          shadow-camera-bottom={-100}
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