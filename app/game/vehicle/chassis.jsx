'use client'

import { useGLTF } from '@react-three/drei';
import { forwardRef } from 'react';

const Chassis = forwardRef(function Chassis(props, ref) {
    const { nodes, materials } = useGLTF('/models/Beetle.glb')

    return (
        <mesh ref={ref} {...props}>
            <group position={[0, -0.6, 0]}>
                <mesh castShadow geometry={nodes.chassis_1.geometry} material={materials['Black paint']} />
                <mesh castShadow geometry={nodes.chassis_2.geometry} material={materials.Rubber} />
                <mesh castShadow geometry={nodes.chassis_3.geometry} material={materials.Paint} />
                <mesh castShadow geometry={nodes.chassis_4.geometry} material={materials.Underbody} />
                <mesh castShadow geometry={nodes.chassis_5.geometry} material={materials.Chrom} />
                <mesh castShadow geometry={nodes.chassis_6.geometry} material={materials['Interior (dark)']} />
                <mesh castShadow geometry={nodes.chassis_7.geometry} material={materials['Interior (light)']} />
                <mesh castShadow geometry={nodes.chassis_8.geometry} material={materials.Reflector} />

                <mesh
                    geometry={nodes.chassis_9.geometry}
                    material={materials.Glass}
                    material-transparent={false}
                    material-color="black"
                />

                <mesh castShadow geometry={nodes.chassis_10.geometry} material={materials.Steel} />
                <mesh castShadow geometry={nodes.chassis_11.geometry} material={materials['Black plastic']} />
                <mesh geometry={nodes.chassis_12.geometry} material={materials.Headlight} />
                <mesh castShadow geometry={nodes.chassis_13.geometry} material={materials['Reverse lights']} />
                <mesh castShadow geometry={nodes.chassis_14.geometry} material={materials['Orange plastic']} />
                <mesh castShadow geometry={nodes.chassis_15.geometry} material={materials['Tail lights']} />
                <mesh castShadow geometry={nodes.chassis_16.geometry} material={materials['License Plate']} />
            </group>
        </mesh>
    );
});

export default Chassis;

useGLTF.preload('/models/Beetle.glb');