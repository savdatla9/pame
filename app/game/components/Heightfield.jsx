import { useHeightfield } from '@react-three/cannon';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

export default function Heightfield({
  position = [0, 0, 0],
  rotation = [-Math.PI / 2, 0, 0],
  elementSize = 1,
  size = 32, // NxN grid
  color = '#8B4513',
  ...props
}) {
  const heights = useMemo(() => {
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

  return (
    <mesh ref={ref} receiveShadow castShadow>
      <primitive object={geometry} attach="geometry" />
      <meshStandardMaterial color={color} side={THREE.DoubleSide} />
    </mesh>
  );
};