"use client"

import { Canvas, useFrame } from '@react-three/fiber';
import { Physics, useTrimesh, useSphere, useBox } from '@react-three/cannon';
import { OrbitControls, useGLTF, Sky } from '@react-three/drei';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

/*
  ╔══════════════════════════════════════════════════════════════╗
  ║                    WHAT IS TRIMESH?                          ║
  ╚══════════════════════════════════════════════════════════════╝
  
  Trimesh = Triangle Mesh
  
  It's a physics body made from TRIANGLES that matches complex 3D shapes.
  
  WHEN TO USE:
  ✅ Complex terrain (hills, valleys, mountains)
  ✅ 3D models as collision surfaces (imported .glb/.gltf files)
  ✅ Curved surfaces (bowls, ramps, pipes)
  ✅ Static environments (buildings, landscapes)
  
  WHEN NOT TO USE:
  ❌ Moving/dynamic objects (use Box, Sphere instead)
  ❌ Simple shapes (use primitive shapes - they're faster)
  
  IMPORTANT: Trimesh is STATIC ONLY (mass: 0)
  It cannot move! It's for environments, not characters.
*/

// ============================================================================
// EXAMPLE 1: BASIC TRIMESH - Simple Terrain
// ============================================================================
function BasicTerrainTrimesh() {
  // Step 1: Create geometry
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(20, 20, 20, 20);
    
    // Step 2: Modify vertices to create hills
    const positions = geo.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      // Create wave pattern (z is "up" before rotation)
      positions[i + 2] = Math.sin(x * 0.3) * Math.cos(y * 0.3) * 2;
    }
    
    geo.computeVertexNormals(); // Important for proper lighting
    return geo;
  }, []);

  // Step 3: Extract vertices and indices for physics
  const [vertices, indices] = useMemo(() => {
    // Vertices = array of x,y,z coordinates
    const verts = geometry.attributes.position.array;
    
    // Indices = array defining which vertices form triangles
    const inds = geometry.index ? geometry.index.array : [];
    
    console.log('Vertices:', verts.length, 'numbers (', verts.length / 3, 'points)');
    console.log('Indices:', inds.length, 'numbers (', inds.length / 3, 'triangles)');
    
    return [verts, inds];
  }, [geometry]);

  // Step 4: Create physics body
  const [ref] = useTrimesh(() => ({
    mass: 0, // MUST be 0 - trimesh is static only!
    position: [0, 0, 0],
    rotation: [-Math.PI / 2, 0, 0], // Rotate to be horizontal
    args: [vertices, indices], // Pass the arrays
  }));

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <primitive object={geometry} />
      <meshStandardMaterial 
        color="#27ae60"
        roughness={0.9}
        wireframe={false} // Set true to see triangles
      />
    </mesh>
  );
}

// ============================================================================
// EXAMPLE 2: BOWL/HALF-PIPE - Curved Surface
// ============================================================================
function BowlTrimesh() {
  const geometry = useMemo(() => {
    // Create a sphere, then remove the top half = bowl
    const geo = new THREE.SphereGeometry(5, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
    return geo;
  }, []);

  const [vertices, indices] = useMemo(() => {
    const verts = geometry.attributes.position.array;
    const inds = geometry.index.array;
    return [verts, inds];
  }, [geometry]);

  const [ref] = useTrimesh(() => ({
    mass: 0,
    position: [15, -5, 0],
    args: [vertices, indices],
  }));

  return (
    <mesh ref={ref} position={[15, -5, 0]} receiveShadow>
      <primitive object={geometry} />
      <meshStandardMaterial 
        color="#3498db"
        roughness={0.3}
        side={THREE.DoubleSide} // Important for bowls!
      />
    </mesh>
  );
}

// ============================================================================
// EXAMPLE 3: LOADED MODEL - GLTF as Collision
// ============================================================================
function ModelTrimesh({ modelPath = "/model.glb" }) {
  // Uncomment when you have a model:
  // const { scene } = useGLTF(modelPath);
  
  // For demo, create a torus knot
  const geometry = useMemo(() => {
    return new THREE.TorusKnotGeometry(2, 0.6, 100, 16);
  }, []);

  const [vertices, indices] = useMemo(() => {
    // For loaded models, you need to find the mesh:
    // let geo = null;
    // scene.traverse((child) => {
    //   if (child.isMesh && !geo) {
    //     geo = child.geometry;
    //   }
    // });
    
    const verts = geometry.attributes.position.array;
    const inds = geometry.index.array;
    return [verts, inds];
  }, [geometry]);

  const [ref] = useTrimesh(() => ({
    mass: 0,
    position: [0, 3, -10],
    args: [vertices, indices],
  }));

  return (
    <mesh ref={ref} position={[0, 3, -10]} receiveShadow castShadow>
      <primitive object={geometry} />
      <meshStandardMaterial color="#9b59b6" metalness={0.8} roughness={0.2} />
    </mesh>
  );
}

// ============================================================================
// EXAMPLE 4: UNDERSTANDING THE DATA
// ============================================================================
function TriangleVisualization() {
  // Super simple: just 1 triangle
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    
    // 3 vertices (each has x, y, z)
    const vertices = new Float32Array([
      -1, 0, 0,  // Vertex 0
       1, 0, 0,  // Vertex 1
       0, 2, 0,  // Vertex 2
    ]);
    
    // Indices tell which vertices form the triangle
    const indices = new Uint16Array([
      0, 1, 2  // Triangle made from vertices 0, 1, 2
    ]);
    
    geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geo.setIndex(new THREE.BufferAttribute(indices, 1));
    geo.computeVertexNormals();
    
    return geo;
  }, []);

  const [vertices, indices] = useMemo(() => {
    const verts = geometry.attributes.position.array;
    const inds = geometry.index.array;
    
    console.log('=== SINGLE TRIANGLE DATA ===');
    console.log('Vertices array:', verts);
    console.log('Indices array:', inds);
    console.log('Triangle connects points:', inds[0], inds[1], inds[2]);
    
    return [verts, inds];
  }, [geometry]);

  const [ref] = useTrimesh(() => ({
    mass: 0,
    position: [-15, 2, 0],
    args: [vertices, indices],
  }));

  return (
    <mesh ref={ref} position={[-15, 2, 0]}>
      <primitive object={geometry} />
      <meshStandardMaterial 
        color="#e74c3c" 
        side={THREE.DoubleSide}
        wireframe={true} // Shows the triangle clearly
      />
    </mesh>
  );
}

// ============================================================================
// TEST OBJECTS - Balls to test collision
// ============================================================================
function TestBall({ position, color = "#ffd93d" }) {
  const [ref] = useSphere(() => ({
    mass: 1,
    position: position,
    args: [0.5],
    material: {
      friction: 0.3,
      restitution: 0.6,
    },
  }));

  return (
    <mesh ref={ref} castShadow>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function TestBox({ position }) {
  const [ref] = useBox(() => ({
    mass: 2,
    position: position,
    args: [1, 1, 1],
    material: {
      friction: 0.5,
      restitution: 0.3,
    },
  }));

  return (
    <mesh ref={ref} castShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#e74c3c" />
    </mesh>
  );
}

// ============================================================================
// MAIN SCENE
// ============================================================================
export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas
        shadows
        camera={{ position: [20, 15, 20], fov: 60 }}
      >
        <color attach="background" args={['#87ceeb']} />
        <fog attach="fog" args={['#87ceeb', 20, 60]} />

        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[20, 30, 10]}
          intensity={1.5}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-30}
          shadow-camera-right={30}
          shadow-camera-top={30}
          shadow-camera-bottom={-30}
        />
        <Sky sunPosition={[100, 20, 100]} />

        <Physics gravity={[0, -20, 0]}>
          {/* All the trimesh examples */}
          <BasicTerrainTrimesh />
          <BowlTrimesh />
          {/* <RampTrimesh /> */}
          <ModelTrimesh />
          <TriangleVisualization />

          {/* Test objects to see collision working */}
          <TestBall position={[0, 10, 0]} color="#ffd93d" />
          <TestBall position={[3, 12, -2]} color="#e74c3c" />
          <TestBall position={[-3, 8, 2]} color="#3498db" />
          
          {/* Boxes for ramp */}
          <TestBox position={[-8, 8, 2]} />
          <TestBox position={[-8, 10, 2]} />
          
          {/* Balls for bowl */}
          <TestBall position={[15, 10, 0]} color="#9b59b6" />
          <TestBall position={[14, 12, 1]} color="#2ecc71" />
        </Physics>

        <OrbitControls target={[0, 2, 0]} />
      </Canvas>

      {/* Educational UI */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        color: 'white',
        background: 'rgba(0,0,0,0.85)',
        padding: '25px',
        borderRadius: '12px',
        fontFamily: 'monospace',
        fontSize: '13px',
        maxWidth: '450px',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        <div style={{ fontSize: '22px', marginBottom: '20px', fontWeight: 'bold', color: '#3498db' }}>
          📐 useTrimesh Guide
        </div>

        <div style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.3)' }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#2ecc71', marginBottom: '8px' }}>
            What is Trimesh?
          </div>
          <div style={{ fontSize: '12px', lineHeight: '1.6', opacity: 0.9 }}>
            Triangle Mesh - physics body made from triangles. Perfect for complex shapes like terrain, ramps, and 3D models.
          </div>
        </div>

        <div style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.3)' }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#e74c3c', marginBottom: '8px' }}>
            ⚠️ CRITICAL RULE
          </div>
          <div style={{ fontSize: '12px', lineHeight: '1.6', opacity: 0.9 }}>
            <strong>mass: 0</strong> - Trimesh is STATIC ONLY!<br/>
            It cannot move. Use for ground, walls, environments.
          </div>
        </div>

        <div style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.3)' }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#f39c12', marginBottom: '8px' }}>
            How It Works
          </div>
          <div style={{ fontSize: '11px', background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '4px', fontFamily: 'monospace' }}>
            {`const [vertices, indices] = useMemo(() => {
              const verts = geometry.attributes.position.array;
              const inds = geometry.index.array;
              return [verts, inds];
            }, [geometry]);

            const [ref] = useTrimesh(() => ({
              mass: 0,
              args: [vertices, indices],
            }));`}
          </div>
        </div>

        <div style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.3)' }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#9b59b6', marginBottom: '8px' }}>
            Examples in Scene
          </div>
          <div style={{ fontSize: '12px', lineHeight: '1.8' }}>
            <div><span style={{ color: '#2ecc71' }}>●</span> Center: Wavy terrain</div>
            <div><span style={{ color: '#3498db' }}>●</span> Right: Bowl/half-pipe</div>
            <div><span style={{ color: '#e67e22' }}>●</span> Left: Ramp</div>
            <div><span style={{ color: '#9b59b6' }}>●</span> Back: Torus knot model</div>
            <div><span style={{ color: '#e74c3c' }}>●</span> Far left: Single triangle</div>
          </div>
        </div>

        <div style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.3)' }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1abc9c', marginBottom: '8px' }}>
            The Data Explained
          </div>
          <div style={{ fontSize: '12px', lineHeight: '1.6', opacity: 0.9 }}>
            <strong>Vertices:</strong> Array of coordinates [x,y,z, x,y,z, ...]<br/>
            <strong>Indices:</strong> Which vertices form triangles [0,1,2, 1,2,3, ...]<br/>
            <br/>
            Example: [0,1,2] means "make triangle from vertex 0, 1, and 2"
          </div>
        </div>

        <div style={{ fontSize: '12px', opacity: 0.7, lineHeight: '1.5' }}>
          <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>✅ USE FOR:</div>
          • Terrain & landscapes<br/>
          • Ramps & curves<br/>
          • 3D model collision<br/>
          • Static environments<br/>
          <br/>
          <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>❌ DON'T USE FOR:</div>
          • Moving objects<br/>
          • Simple shapes (use Box/Sphere)<br/>
          • Dynamic characters
        </div>
      </div>
    </div>
  );
}