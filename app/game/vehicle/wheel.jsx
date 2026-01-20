import { useCompoundBody } from '@react-three/cannon';
import { useGLTF } from '@react-three/drei';
import { forwardRef } from 'react';

const Wheel = forwardRef(function Wheel(
  { leftSide = false, radius = 0.7, ...props },
  ref
) {
    const {
        materials: { Chrom, Rubber, Steel },
        nodes,
    } = useGLTF('/models/wheel.glb')

    useCompoundBody(
        () => ({
            collisionFilterGroup: 0,
            mass: 1,
            material: 'wheel',
            type: 'Kinematic',
            shapes: [
                {
                type: 'Cylinder',
                args: [radius, radius, 0.5, 16],
                rotation: [0, 0, -Math.PI / 2],
                },
            ],
            ...props,
        }),
        ref
    )

    return (
        <group ref={ref}>
            <group rotation={[0, 0, ((leftSide ? 1 : -1) * Math.PI) / 2]}>
                <mesh geometry={nodes.wheel_1.geometry} material={Rubber} />
                <mesh geometry={nodes.wheel_2.geometry} material={Steel} />
                <mesh geometry={nodes.wheel_3.geometry} material={Chrom} />
            </group>
        </group>
    )
});

export default Wheel;

useGLTF.preload('/models/wheel.glb');