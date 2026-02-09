'use client'

import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useRef } from 'react';

export default function FollowCamera({
    targetRef,
    distance = 8,
    height = 3,
    lerp = 0.08,
}) {
    const { camera } = useThree()

    const idealOffset = useRef(new THREE.Vector3())
    const idealLookAt = useRef(new THREE.Vector3())

    useFrame(() => {
        if (!targetRef.current) return

        // --- Vehicle world transform ---
        const position = new THREE.Vector3()
        targetRef.current.getWorldPosition(position)

        const quaternion = new THREE.Quaternion()
        targetRef.current.getWorldQuaternion(quaternion)

        // --- Camera offset (behind vehicle) ---
        idealOffset.current.set(0, height, distance)
        idealOffset.current.applyQuaternion(quaternion)
        idealOffset.current.add(position)

        // --- Look-at point ---
        idealLookAt.current.set(0, 1.5, -5)
        idealLookAt.current.applyQuaternion(quaternion)
        idealLookAt.current.add(position)

        // --- Smooth camera ---
        camera.position.lerp(idealOffset.current, lerp)
        camera.lookAt(idealLookAt.current)
    })

    return null;
};