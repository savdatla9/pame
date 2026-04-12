import { useHeightfield } from '@react-three/cannon';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Tree, Plant, Grass } from './Foliage';

export default function Heightfield({
  position = [0, 0, 0],
  rotation = [-Math.PI / 2, 0, 0],
  elementSize = 1,
  size = 32, // NxN grid
  color = '#8B4513',
  roughness = 0.8,
  metalness = 0.1,
  worldKey = 'normal',
  ...props
}) {
  const heights = useMemo(() => {
    // ... existing logic ...
    const data = [];
    for (let i = 0; i < size; i++) {
      const row = [];
      for (let j = 0; j < size; j++) {
        // Generate hills using sine waves
        const x = (i / size) * Math.PI * 2;
        const z = (j / size) * Math.PI * 2;
        
        let h = Math.sin(x) * Math.cos(z) * 2.5 + Math.cos(x * 1.5) * 1.5;
        
        // Flatten the borders so we can drive onto it easily
        const edgeDistX = Math.min(i, size - 1 - i) / size;
        const edgeDistZ = Math.min(j, size - 1 - j) / size;
        
        // falloff factor pushes height to 0 near the edges (edgeDist < 0.1)
        const falloff = Math.min(1, Math.min(edgeDistX, edgeDistZ) * 6);
        
        // Ensure the height doesn't go below 0 so it aligns with the plane floor
        row.push(Math.max(0, h * falloff));
      }
      data.push(row);
    }
    return data;
  }, [size]);

  const [ref] = useHeightfield(() => ({
    args: [
      heights,
      {
        elementSize,
      },
    ],
    position,
    rotation,
    ...props,
  }), useRef(null));

  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const vertices = [];
    const indices = [];

    // Create vertices matching Cannon's 2D grid
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        // Cannon Heightfield spreads over X and Y of its local frame
        vertices.push(i * elementSize, j * elementSize, heights[i][j]);
      }
    }

    // Create triangles for indices
    for (let i = 0; i < size - 1; i++) {
      for (let j = 0; j < size - 1; j++) {
        const a = i * size + j;
        const b = a + 1;
        const c = (i + 1) * size + j;
        const d = c + 1;

        // Two triangles forming a quad, fixed winding order for correct smooth normals
        indices.push(a, c, b);
        indices.push(c, d, b);
      };
    };

    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geom.setIndex(indices);
    geom.computeVertexNormals();
    return geom;
  }, [heights, size, elementSize]);

  const foliage = useMemo(() => {
    const list = [];
    // Pseudo-random helper
    const random = (s) => {
      const x = Math.sin(s) * 10000;
      return x - Math.floor(x);
    };

    const density = size > 40 ? 4 : 2; 

    for (let i = 2; i < size - 2; i += density) {
      for (let j = 2; j < size - 2; j += density) {
        const height = heights[i][j];
        if (height > 0.8) { 
          const seed = i * 1337 + j * 999;
          const rnd = random(seed);
          const variationX = (random(seed + 1) - 0.5) * 0.5;
          const variationY = (random(seed + 2) - 0.5) * 0.5;
          
          const posX = i * elementSize + variationX;
          const posY = j * elementSize + variationY;
          
          if (rnd > 0.82) {
            list.push({ type: 'tree', pos: [posX, posY, height], key: `t-${i}-${j}` });
          } else if (rnd > 0.6) {
            list.push({ type: 'plant', pos: [posX, posY, height], key: `p-${i}-${j}` });
          } else if (rnd > 0.3) {
            list.push({ type: 'grass', pos: [posX, posY, height], key: `g-${i}-${j}` });
          }
        }
      }
    }
    return list;
  }, [heights, size, elementSize]);

  return (
    <group>
      {/* Visual Terrain Mesh */}
      <mesh ref={ref} receiveShadow castShadow>
        <primitive object={geometry} attach="geometry" />
        <meshStandardMaterial 
          color={color} 
          roughness={roughness} 
          metalness={metalness} 
          side={THREE.DoubleSide} 
        />
        
        {/* Nested Foliage (Non-collidable) inherits terrain rotation */}
        {foliage.filter(f => f.type !== 'tree').map((f) => {
          const Comp = f.type === 'plant' ? Plant : Grass;
          return (
            <Comp 
              key={f.key} 
              theme={worldKey} 
              position={f.pos} 
              rotation={[Math.PI / 2, 0, 0]} 
              scale={0.5 + Math.random() * 0.5} 
            />
          );
        })}
      </mesh>

      {/* External Collidable Trees - Calculated into World Space */}
      {foliage.filter(f => f.type === 'tree').map((f) => {
        /* 
           Correct transform: Local (lx, ly, lz) -> World (lx + px, lz + py + 1, -ly + pz)
           - Local X rotates to World X
           - Local Y rotates to negative World Z (due to -90deg X rotation)
           - Local Z (height) rotates to World Y
           - Trunk is 2 units high, lift by 1 to seat base on ground.
        */
        return (
          <Tree 
            key={f.key} 
            theme={worldKey} 
            position={[
              f.pos[0] + position[0], 
              f.pos[2] + position[1] + 1, 
              -f.pos[1] + position[2]
            ]} 
            rotation={[0, 0, 0]} 
            scale={0.6 + Math.random() * 0.4} 
          />
        );
      })}
    </group>
  );
};