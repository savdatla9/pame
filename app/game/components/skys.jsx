import { useRef } from "react";
import * as THREE from "three";
import { GodRays, Bloom, Vignette, EffectComposer } from "@react-three/postprocessing";
// import { Fog } from "@react-three/drei";

export default function Skys() {
    const sun = useRef(null)

    return (
        <>
            {/* Sun mesh (the "source" for GodRays) */}
            <mesh ref={sun} position={[0, 20, -20]}>
                <sphereGeometry args={[1.2, 64, 64]} />
                <meshPhysicalMaterial
                    emissive={new THREE.Color("#ffffff")}
                    emissiveIntensity={8}
                    color={"yellow"}
                />
            </mesh>

            {/* Simple fog helps sell the rays */}
            <fog attach="fog" args={["#dddddd", 10, 45]} />

            {/* Postprocessing */}
            <EffectComposer multisampling={0}>
                {/* sun MUST be a mesh ref */}
                <GodRays
                    sun={sun}
                    samples={48}
                    density={0.9}
                    decay={0.95}
                    weight={0.7}
                    exposure={0.35}
                    clampMax={1}
                    blur
                />
                
                <Bloom intensity={0.4} luminanceThreshold={0.2} />
                
                <Vignette eskil={false} offset={0.15} darkness={0.85} />
            </EffectComposer>
        </>
    );
};