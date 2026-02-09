import { useBox, useRaycastVehicle } from '@react-three/cannon';
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';

import { useControls } from '../controls/use-controls';
import FollowCamera from '../controls/followcamera';
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
}) {
    const wheels = [
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
    ];

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
        const unsub = vehicleApi.sliding.subscribe((v) =>
            console.log('sliding', v)
        );

        return unsub;
    }, [vehicleApi]);

    useFrame(() => {
        const { backward, brake, forward, left, reset, right } = controls.current;

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

        // Reset vehicle
        if (reset) {
            chassisApi.position.set(...position)
            chassisApi.velocity.set(0, 0, 0)
            chassisApi.angularVelocity.set(...angularVelocity)
            chassisApi.rotation.set(...rotation)
        };
    });

    return (
        <group ref={vehicle} position={[0, -0.4, 0]}>
            <Chassis ref={chassisBody} />

            <FollowCamera
                targetRef={chassisBody}
                distance={10}
                height={4}
                lerp={0.1}
            />

            <Wheel ref={wheels[0]} radius={radius} leftSide />
            <Wheel ref={wheels[1]} radius={radius} />
            <Wheel ref={wheels[2]} radius={radius} leftSide />
            <Wheel ref={wheels[3]} radius={radius} />
        </group>

    );
};

export default Vehicle;