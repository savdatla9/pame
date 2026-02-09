'use client'

import { useGLTF } from '@react-three/drei';
import { useTrimesh, useBox } from '@react-three/cannon';
import { useMemo } from 'react';

function Wall({ position, size }) {
    const [ref] = useBox(() => ({
        args: size,
        position,
        type: 'Static',
    }));

    return <mesh ref={ref} />
};

function Checkpoint({ id, position, onHit }) {
    const [ref] = useBox(() => ({
        args: [2, 2, 1],
        position,
        type: 'Static',
        isTrigger: true,
        onCollideBegin: (e) => {
            if (e.body?.userData?.type === 'vehicle') {
                onHit(id)
            }
        },
    }));

    return (
        <mesh ref={ref}>
            <boxGeometry args={[2, 2, 1]} />
            <meshBasicMaterial transparent opacity={0} />
        </mesh>
    );
};

function FinishLine({ position, onFinish }) {
    const [ref] = useBox(() => ({
        args: [3, 2, 1],
        position,
        type: 'Static',
        isTrigger: true,
        onCollideBegin: (e) => {
            if (e.body?.userData?.type === 'vehicle') {
                onFinish()
            }
        },
    }));

    return (
        <mesh ref={ref}>
            <boxGeometry args={[3, 2, 1]} />
            <meshBasicMaterial transparent opacity={0} />
        </mesh>
    );
};

export default function World({ onCheckpoint, onFinish, ...props }) {
    const { scene, nodes } = useGLTF('/models/race_track.glb')

    /* ---------------- ROAD COLLISION (Trimesh) ---------------- */
    const roadGeo = nodes.Road?.geometry || nodes.Track?.geometry;

    const [roadRef] = useTrimesh(
        () => ({
        args: roadGeo
                ? [
                    roadGeo.attributes.position.array,
                    roadGeo.index.array,
                ]
                : undefined,
            type: 'Static',
            material: 'ground',
        }), undefined
    );

    /* ---------------- WALL COLLISION (BOXES) ---------------- */
    const walls = useMemo(
        () => [
            { position: [0, 1, -10], size: [20, 2, 1] },
            { position: [0, 1, 10], size: [20, 2, 1] },
        ], []
    );

    /* ---------------- CHECKPOINTS ---------------- */
    const checkpoints = useMemo(
        () => [
            { id: 0, position: [0, 1, 0] },     // Start
            { id: 1, position: [10, 1, -5] },
            { id: 2, position: [-10, 1, 5] },
        ], []
    );

    return (
        <group {...props}>
            {/* Visual Track */}
            <primitive object={scene} />

            {/* Road Collider */}
            {roadGeo && <group ref={roadRef} />}

            {/* Walls */}
            {walls.map((w, i) => (
                <Wall key={i} {...w} />
            ))}

            {/* Checkpoints */}
            {checkpoints.map((c) => (
                <Checkpoint
                    key={c.id}
                    id={c.id}
                    position={c.position}
                    onHit={onCheckpoint}
                />
            ))}

            {/* Finish Line */}
            <FinishLine position={[0, 1, 2]} onFinish={onFinish} />
        </group>
    );
};