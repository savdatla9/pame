'use client'

import { Text3D } from '@react-three/drei'
import { useBox } from '@react-three/cannon'
import { useRef } from 'react'

export default function PhysicsText({
  text = 'START',
  position = [0, 2, 0],
  size = [4, 1, 1],   // Physics box size
  mass = 0,           // 0 = static, >0 = dynamic
  color = '#ffffff',
}) {
  const [ref] = useBox(
    () => ({
      args: size,
      position,
      mass,
      type: mass === 0 ? 'Static' : 'Dynamic',
      material: 'text',
      isTrigger: true,
      collisionFilterGroup: 1,
      collisionFilterMask: -1,
      onCollideBegin: () => console.log('Text Hit')
    }), useRef(null)
  );

  return (
    <group ref={ref}>
      <Text3D
        font="/font/helvetiker_regular.typeface.json"
        size={1.5}
        height={0.5}
        curveSegments={12}
        bevelEnabled
        bevelThickness={0.04}
        bevelSize={0.02}
        bevelSegments={4}
      >
        {text}

        <meshPhysicalMaterial color={color} />
      </Text3D>
    </group>
  );
};