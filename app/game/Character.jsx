import { useAnimations, useFBX } from '@react-three/drei'
import { useEffect, useRef } from 'react'

export default function Character() {
    const ref = useRef();
    const { scene, animations } = useFBX('/models/character.fbx');
    const { actions } = useAnimations(animations, ref);

    useEffect(() => {
        actions?.Run?.play();
    }, [actions]);

    return (
        <primitive
            ref={ref}
            object={scene}
            scale={0.6}
            position={[0, -0.5, 0]}
        />
    );
};