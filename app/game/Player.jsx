import { useSphere } from '@react-three/cannon';
import { useFrame } from '@react-three/fiber';

import { useControls } from './Controls';
import Character from './Character';

export default function Player() {
    const { 
        left, right, 
        jump, joyX,
    } = useControls()

    const [ref, api] = useSphere(() => ({
        mass: 1,
        position: [0, 2, 0],
        args: [0.5],
        fixedRotation: true,
    }));

    useFrame(() => {
        let x = 0
        if (left) x -= 1
        if (right) x += 1
        x += joyX

        api.velocity.set(x * 5, jump ? 6 : 0, -6)
    });

    return (
        <group ref={ref}>
            {/* physics invisible */}
            <mesh visible={false}>
                <sphereGeometry args={[0.5]} />
            </mesh>

            {/* visual animated character */}
            <Character />
        </group>
    );
};