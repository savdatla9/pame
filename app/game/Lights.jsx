import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

export default function Lights() {
  const light = useRef();

  useFrame((state) => {
    const { camera } = state;

    // Move light to match camera position with an offset
    light.current.position.copy(camera.position);
    light.current.position.x += 5;
    light.current.position.y += 10;
    light.current.position.z += 5;

    // Make light look at near the camera focus point (approximate vehicle position)
    light.current.target.position.copy(camera.position);
    light.current.target.position.y -= 10; // Look down
    light.current.target.updateMatrixWorld();
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        ref={light}
        castShadow
        position={[5, 10, 5]}
        intensity={2.5}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={1}
        shadow-camera-far={50}
        shadow-camera-top={20}
        shadow-camera-right={20}
        shadow-camera-bottom={-20}
        shadow-camera-left={-20}
      />
    </>
  );
}
