import { useConvexPolyhedron } from '@react-three/cannon';
import { useMemo } from 'react';
import * as THREE from 'three';

export default function RampTrimesh({ position, rotation, scale = [1, 1, 1], color }) {
    const scaleArr = Array.isArray(scale) ? scale : [scale, scale, scale];
    const sx = scaleArr[0];
    const sy = scaleArr[1];
    const sz = scaleArr[2];

    const geometry = useMemo(() => {
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(5, 0);
        shape.lineTo(5, 3);
        shape.lineTo(0, 0);

        const geo = new THREE.ExtrudeGeometry(shape, {
            depth: 4,
            bevelEnabled: false,
        });

        // Center the geometry so physics and visual align perfectly, then bake scale directly
        geo.center();
        geo.scale(sx, sy, sz);

        return geo;
    }, [sx, sy, sz]);

    // Trimesh does not correctly collide with all Cannon bodies (such as other blocks or RaycastVehicles sometimes). 
    // Using a properly triangulated ConvexPolyhedron instead forms a completely solid and flawless rock collision hull.
    const [ref] = useConvexPolyhedron(() => {
        // Provide the same shape vertices but explicitly defined with scaling
        const vertices = [
            [-2.5 * sx, -1.5 * sy, -2 * sz], // 0: front-bottom-left
            [ 2.5 * sx, -1.5 * sy, -2 * sz], // 1: front-bottom-right
            [ 2.5 * sx,  1.5 * sy, -2 * sz], // 2: front-top-right
            [-2.5 * sx, -1.5 * sy,  2 * sz], // 3: back-bottom-left
            [ 2.5 * sx, -1.5 * sy,  2 * sz], // 4: back-bottom-right
            [ 2.5 * sx,  1.5 * sy,  2 * sz], // 5: back-top-right
        ];

        // Faces must be perfectly CCW, pointing outward, forming a completely sealed convex hull.
        const faces = [
            [0, 2, 1],       // Front triangle
            [3, 4, 5],       // Back triangle
            [0, 1, 4],       // Bottom rect T1
            [0, 4, 3],       // Bottom rect T2
            [1, 2, 5],       // Right rect T1
            [1, 5, 4],       // Right rect T2
            [0, 3, 5],       // Slope rect T1
            [0, 5, 2],       // Slope rect T2
        ];

        return {
            type: 'Static',
            mass: 0,
            position,
            rotation,
            // DO NOT pass `scale` here. Cannon doesn't use scale for ConvexPolyhedra, we baked it in instead.
            args: [vertices, faces],
        };
    });

    return (
        <mesh ref={ref} receiveShadow castShadow>
            <primitive object={geometry} />
            <meshStandardMaterial color={color || "#7a7a7a"} roughness={0.9} />
        </mesh>
    );
};