'use client'

import { 
  Physics, useCylinder, usePlane, 
  useBox, useHeightfield 
} from '@react-three/cannon';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { Suspense, useRef, useMemo } from 'react';
import { Environment, OrbitControls } from '@react-three/drei';

import Vehicle from './game/vehicle/index.jsx';

function Plane(props) {
  const [ref] = usePlane(
    () => ({ material: 'ground', type: 'Static', ...props }),
    useRef(null)
  );

  return (
    <group ref={ref}>
      <mesh receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="SandyBrown" />
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
  return (
    <>
      <Canvas camera={{ fov: 50, position: [0, 5, 15] }} shadows style={{ height: '100vh' }}>
        <fog attach="fog" args={['skyblue', 10, 50]} />
        
        <color attach="background" args={['skyblue']} />

        <ambientLight intensity={0.1 * Math.PI} />

        <directionalLight
          castShadow
          intensity={0.5 * Math.PI}
          position={[10, 10, 5]}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={0.1}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />

        <Physics
          broadphase="SAP"
          defaultContactMaterial={{
            contactEquationRelaxation: 4,
            friction: 1e-3,
          }}
          allowSleep
        >
          <Plane rotation={[-Math.PI / 2, 0, 0]} userData={{ id: 'floor' }} />

          <Vehicle
            position={[0, 2, 0]}
            rotation={[0, -Math.PI / 4, 0]}
            angularVelocity={[0, 0.5, 0]}
          />

          <Pillar position={[-5, 2.5, -5]} userData={{ id: 'pillar-1' }} />
          <Pillar position={[0, 2.5, -5]} userData={{ id: 'pillar-2' }} />
          <Pillar position={[5, 2.5, -5]} userData={{ id: 'pillar-3' }} />

          <Box position={[2, 1, 2]} color='forestgreen' />
          <Box position={[-2, 1, 2]} color="red" />
          <Box position={[-1, 1, -2]} color="aqua" />

          {/* Stack of boxes */}
          <Box position={[5, 1, 0]} />
          <Box position={[5, 2.2, 0]} color="blue" />
          <Box position={[5, 3.4, 0]} />
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