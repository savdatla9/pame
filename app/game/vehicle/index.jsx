import { useBox, useRaycastVehicle } from '@react-three/cannon';
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

import { useControls } from '../controls/use-controls';
// import FollowCamera from '../controls/followcamera';
import { useGameStore } from '../store';
import Chassis from './chassis';
import Wheel from './wheel';

function Vehicle({
    angularVelocity,
    back = -1.15,
    force = 1500,
    front = 1.3,
    height = -0.04,
    maxBrake = 50,
    position,
    radius = 0.7,
    rotation,
    steer = 0.5,
    width = 1.2,
    teleporting,
    onTeleportDone,
}) {
    const wheels = [
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
    ];

    const timeFlipped = useRef(0);
    const isTeleportDone = useRef(false);
    const upVector = new THREE.Vector3(0, 1, 0);

    const controls = useControls();

    const wheelInfo = {
        axleLocal: [-1, 0, 0], // inverted for asymmetrical wheels
        customSlidingRotationalSpeed: -30,
        dampingCompression: 4.4,
        dampingRelaxation: 10,
        directionLocal: [0, -1, 0],
        frictionSlip: 2,
        maxSuspensionForce: 10000,
        maxSuspensionTravel: 0.3,
        radius,
        suspensionRestLength: 0.3,
        suspensionStiffness: 30,
        useCustomSlidingRotationalSpeed: true,
    };

    const wheelInfo1 = {
        ...wheelInfo,
        chassisConnectionPointLocal: [-width / 2, height, front],
        isFrontWheel: true,
    };

    const wheelInfo2 = {
        ...wheelInfo,
        chassisConnectionPointLocal: [width / 2, height, front],
        isFrontWheel: true,
    };

    const wheelInfo3 = {
        ...wheelInfo,
        chassisConnectionPointLocal: [-width / 2, height, back],
        isFrontWheel: false,
    };

    const wheelInfo4 = {
        ...wheelInfo,
        chassisConnectionPointLocal: [width / 2, height, back],
        isFrontWheel: false,
    };

    const [chassisBody, chassisApi] = useBox(
        () => ({
            allowSleep: false,
            angularVelocity,
            args: [1.7, 1, 4],
            mass: 500,
            userData: { type: 'vehicle' },
            onCollide: (e) => console.log('bonk', e.body?.userData),
            position,
            rotation,
        }), useRef(null)
    );

    const [vehicle, vehicleApi] = useRaycastVehicle(
        () => ({
            chassisBody,
            wheelInfos: [wheelInfo1, wheelInfo2, wheelInfo3, wheelInfo4],
            wheels,
        }),
        useRef(null)
    );

    useEffect(() => {
        // Sync position to the global store
        const unsubPos = chassisApi.position.subscribe((v) => {
            useGameStore.getState().setPlayerPosition(v);
        });
        
        // Sync rotation to the global store
        const unsubRot = chassisApi.quaternion.subscribe((q) => {
            useGameStore.getState().setPlayerRotation({
                x: q[0],
                y: q[1],
                z: q[2],
                w: q[3]
            });
        });

        const unsubSliding = vehicleApi.sliding.subscribe((v) =>
            console.log('sliding', v)
        );

        return () => {
            unsubPos();
            unsubRot();
            unsubSliding();
        };
    }, [chassisApi, vehicleApi]);

    useFrame((state, delta) => {
        const { backward, brake, forward, left, reset, right } = controls.current;

        if (teleporting) {
            isTeleportDone.current = false;
            // Override engine and steering
            for (let e = 2; e < 4; e++) {
                vehicleApi.applyEngineForce(0, e);
                vehicleApi.setBrake(maxBrake, e);
            }
            for (let s = 0; s < 2; s++) {
                vehicleApi.setSteeringValue(0, s);
            }

            const [hx, hy, hz] = teleporting.position;
            const cx = chassisBody.current.position.x;
            const cy = chassisBody.current.position.y;
            const cz = chassisBody.current.position.z;
            
            // Move towards hole, spinning rapidly
            chassisApi.position.set(
                THREE.MathUtils.lerp(cx, hx, 0.05),
                THREE.MathUtils.lerp(cy, hy, 0.05),
                THREE.MathUtils.lerp(cz, hz, 0.05)
            );
            chassisApi.angularVelocity.set(0, 20, 0);
            chassisApi.velocity.set(0, 0, 0);
            
            // Shrink
            if (chassisBody.current.scale.x > 0.05) {
                chassisBody.current.scale.multiplyScalar(0.9);
                wheels.forEach(w => {
                    if (w.current) w.current.scale.multiplyScalar(0.9);
                });
            } else if (!isTeleportDone.current) {
                isTeleportDone.current = true;
                if (onTeleportDone) onTeleportDone();
            }
            return;
        } else if (isTeleportDone.current) {
            // Restore position and properties
            chassisApi.position.set(...position);
            chassisApi.velocity.set(0, 0, 0);
            chassisApi.angularVelocity.set(...angularVelocity);
            chassisApi.rotation.set(...rotation);
            timeFlipped.current = 0;
            
            // Restore scale
            if (chassisBody.current.scale.x !== 1) {
                chassisBody.current.scale.set(1, 1, 1);
                wheels.forEach(w => {
                    if (w.current) w.current.scale.set(1, 1, 1);
                });
            }
            isTeleportDone.current = false;
        }

        // Engine force (rear wheels)
        for (let e = 2; e < 4; e++) {
            vehicleApi.applyEngineForce(
                forward || backward
                ? force * (forward && !backward ? -1 : 1)
                : 0,
                e
            );
        };

        // Steering (front wheels)
        for (let s = 0; s < 2; s++) {
            vehicleApi.setSteeringValue(
                left || right
                ? steer * (left && !right ? 1 : -1)
                : 0,
                s
            );
        };

        // Brake (rear wheels)
        for (let b = 2; b < 4; b++) {
            vehicleApi.setBrake(brake ? maxBrake : 0, b)
        };

        // Reset vehicle manually, if it falls off the map, or if flipped
        const isFallen = chassisBody.current && chassisBody.current.position.y < -180;
        
        let isFlipped = false;
        if (chassisBody.current) {
            // Determine the vehicle's "up" vector in world space
            const currentUp = upVector.clone().applyQuaternion(chassisBody.current.quaternion);
            // Increased threshold to 0.5 (60 degrees of tilt) to catch vehicles stuck on their side
            if (currentUp.y < 0.5) {
                isFlipped = true;
            }
        }
        
        if (isFlipped) {
            timeFlipped.current += delta;
        } else {
            // Decrease the flip timer gradually instead of resetting to 0 instantly,
            // so bounding/jittering while flipped doesn't cancel the reset.
            timeFlipped.current = Math.max(0, timeFlipped.current - delta * 3);
        }
        
        // Trigger reset if flipped for more than 1.2s
        const isStuckFlipped = timeFlipped.current > 1.2; 
        
        if (reset || isFallen) {
            // Reset to origin/spawn
            chassisApi.position.set(...position);
            chassisApi.velocity.set(0, 0, 0);
            chassisApi.angularVelocity.set(...angularVelocity);
            chassisApi.rotation.set(...rotation);
            timeFlipped.current = 0;
        } else if (isStuckFlipped) {
            // Reset upright relative to the current terrain height
            const px = chassisBody.current.position.x;
            const py = chassisBody.current.position.y;
            const pz = chassisBody.current.position.z;
            
            // Drop it slightly from above its current Y coordinate
            chassisApi.position.set(px, py + 1.5, pz);
            chassisApi.velocity.set(0, 0, 0);
            chassisApi.angularVelocity.set(0, 0, 0);
            
            // Keep the horizontal heading (yaw) but flatten pitch and roll
            const euler = new THREE.Euler().setFromQuaternion(chassisBody.current.quaternion, 'YXZ');
            chassisApi.rotation.set(0, euler.y, 0);
            
            timeFlipped.current = 0;
        }
    });

    return (
        <group ref={vehicle} position={[0, -0.4, 0]}>
            <Chassis ref={chassisBody} />

            {/* <FollowCamera
                targetRef={chassisBody}
                distance={10}
                height={4}
                lerp={0.1}
            /> */}

            <Wheel ref={wheels[0]} radius={radius} leftSide />
            <Wheel ref={wheels[1]} radius={radius} />
            <Wheel ref={wheels[2]} radius={radius} leftSide />
            <Wheel ref={wheels[3]} radius={radius} />
        </group>

    );
};

export default Vehicle;