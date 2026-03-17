import { useTrimesh } from '@react-three/cannon';
import { useMemo } from 'react';
import * as THREE from 'three';

export default function RampTrimesh(props) {
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

        // FIX 1: Center the geometry so physics and visual align perfectly
        geo.center();

        return geo;
    }, []);

    const [vertices, indices] = useMemo(() => {
        const verts = geometry.attributes.position.array;

        let inds;

        if (geometry.index !== null) {
            // ✅ Geometry is indexed — use directly
            inds = geometry.index.array;
        } else {
            // ✅ Geometry is NON-indexed (ExtrudeGeometry case)
            // Every 3 vertices already form a triangle
            // Generate indices manually: [0,1,2, 3,4,5, 6,7,8 ...]
            inds = Array.from({ length: verts.length / 3 }, (_, i) => i);
        };

        return [verts, inds];
    }, [geometry]);

    // FIX 2: Only set position on the physics body (useTrimesh ref)
    // Do NOT set position on the mesh separately — it causes double offset
    const [ref] = useTrimesh(() => ({
        mass: 0,
        position: props.position, // Adjusted Y so ramp sits on ground
        rotation: props.rotation, // Rotate to face the right direction
        scale: props.scale,
        args: [vertices, indices],
    }));

    // FIX 3: mesh gets ref directly — no extra position prop
    return (
        <mesh ref={ref} receiveShadow castShadow>
            <primitive object={geometry} />
            <meshStandardMaterial color="#e67e22" roughness={0.7} />
        </mesh>
    );
};