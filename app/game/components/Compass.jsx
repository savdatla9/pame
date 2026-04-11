'use client'

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../store';

const COMPASS_SIZE = 180;
const RADAR_RADIUS = COMPASS_SIZE / 2 - 10;

const TargetIcon = ({ type, angle, distance, isVisible }) => {
  if (!isVisible) return null;

  // Calculate position on the radar circle
  const maxVisualDistance = 100;
  const normalizedDistance = Math.min(distance, maxVisualDistance) / maxVisualDistance;
  const r = normalizedDistance * RADAR_RADIUS;
  
  const x = Math.sin(angle) * r;
  const y = -Math.cos(angle) * r;

  const colors = {
    key: '#FFD700',
    blackHole: '#FF4500',
    whiteHole: '#00FFFF'
  };

  const glowColors = {
    key: 'rgba(255, 191, 0, 0.6)',
    blackHole: 'rgba(50, 205, 50, 0.6)',
    whiteHole: 'rgba(0, 255, 255, 0.6)'
  };

  return (
    <div style={{
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
      transition: 'all 0.1s linear',
      zIndex: 2,
    }}>
      <div style={{
        width: '12px',
        height: '12px',
        backgroundColor: colors[type],
        borderRadius: '50%',
        boxShadow: `0 0 10px ${glowColors[type]}, 0 0 20px ${glowColors[type]}`,
        border: '2px solid white',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: '-4px',
          left: '-4px',
          right: '-4px',
          bottom: '-4px',
          border: `1px solid ${colors[type]}`,
          borderRadius: '50%',
          animation: 'pulse 2s infinite',
        }} />
      </div>

      <div style={{
        position: 'absolute',
        top: '15px',
        left: '50%',
        transform: 'translateX(-50%)',
        color: 'white',
        fontSize: '10px',
        fontWeight: 'bold',
        textShadow: '0 0 4px black',
        whiteSpace: 'nowrap',
        fontFamily: 'monospace',
        opacity: 0.8
      }}>
        {Math.round(distance)}m
      </div>
    </div>
  );
};

export default function Compass({ keyPos, blackHolePos, whiteHolePos, hasKey }) {
  const playerPos = useGameStore((state) => state.playerPosition);
  const playerRot = useGameStore((state) => state.playerRotation);

  // Convert quaternion to Y-rotation (Yaw)
  const playerYaw = useMemo(() => {
    if (!playerRot) return 0;
    const q = new THREE.Quaternion(playerRot.x, playerRot.y, playerRot.z, playerRot.w);
    const e = new THREE.Euler().setFromQuaternion(q, 'YXZ');
    return e.y;
  }, [playerRot]);

  const calculateTarget = (targetPos) => {
    if (!targetPos || !playerPos) return { angle: 0, distance: 0 };
    
    const dx = targetPos[0] - playerPos[0];
    const dz = targetPos[2] - playerPos[2];
    
    const distance = Math.sqrt(dx * dx + dz * dz);
    const angle = Math.atan2(dx, -dz); 
    
    return { angle, distance };
  };

  const keyData = useMemo(() => calculateTarget(keyPos), [playerPos, keyPos]);
  const blackHoleData = useMemo(() => calculateTarget(blackHolePos), [playerPos, blackHolePos]);
  const whiteHoleData = useMemo(() => calculateTarget(whiteHolePos), [playerPos, whiteHolePos]);

  return (
    <div id="game-compass" style={{
      position: 'absolute',
      bottom: '30px',
      right: '30px',
      width: `${COMPASS_SIZE}px`,
      height: `${COMPASS_SIZE}px`,
      borderRadius: '50%',
      background: 'rgba(10, 10, 30, 0.4)',
      backdropFilter: 'blur(10px)',
      border: '2px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 0 20px rgba(30, 144, 255, 0.15)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      userSelect: 'none',
      pointerEvents: 'none'
    }}>
      {/* Radar Lines */}
      <div style={{ position: 'absolute', width: '100%', height: '1px', background: 'rgba(255, 255, 255, 0.05)', top: '50%' }} />
      <div style={{ position: 'absolute', height: '100%', width: '1px', background: 'rgba(255, 255, 255, 0.05)', left: '50%' }} />
      
      {/* Concentric Circles */}
      <div style={{ position: 'absolute', width: '66%', height: '66%', border: '1px solid rgba(255, 255, 255, 0.03)', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', width: '33%', height: '33%', border: '1px solid rgba(255, 255, 255, 0.03)', borderRadius: '50%' }} />

      {/* Compass Directions */}
      <div style={{ position: 'absolute', top: '8px', color: 'rgba(255, 255, 255, 0.5)', fontSize: '9px', fontWeight: 'bold' }}>N</div>
      <div style={{ position: 'absolute', bottom: '8px', color: 'rgba(255, 255, 255, 0.5)', fontSize: '9px', fontWeight: 'bold' }}>S</div>
      <div style={{ position: 'absolute', left: '8px', color: 'rgba(255, 255, 255, 0.5)', fontSize: '9px', fontWeight: 'bold' }}>W</div>
      <div style={{ position: 'absolute', right: '8px', color: 'rgba(255, 255, 255, 0.5)', fontSize: '9px', fontWeight: 'bold' }}>E</div>

      {/* Coordinates Readout */}
      <div style={{
        position: 'absolute',
        bottom: '-25px',
        right: '0',
        color: 'white',
        fontSize: '11px',
        fontFamily: 'monospace',
        textShadow: '0 0 5px rgba(0,0,0,0.8)',
        opacity: 0.9,
        background: 'rgba(0,0,0,0.4)',
        padding: '2px 8px',
        borderRadius: '4px',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        POS: {Math.round(playerPos?.[0])}, {Math.round(playerPos?.[2])}
      </div>

      {/* Center Point & Heading Arrow */}
      <div style={{
        position: 'absolute',
        width: '24px',
        height: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: `rotate(${playerYaw || 0}rad)`,
        zIndex: 3
      }}>
        {/* Direction Arrow */}
        <div style={{
          width: '0',
          height: '0',
          borderLeft: '5px solid transparent',
          borderRight: '5px solid transparent',
          borderBottom: '12px solid #1E90FF',
          marginBottom: '5px',
          filter: 'drop-shadow(0 0 5px #1E90FF)'
        }} />
        {/* Core Point */}
        <div style={{
          position: 'absolute',
          width: '6px',
          height: '6px',
          backgroundColor: 'white',
          borderRadius: '50%',
          boxShadow: '0 0 10px #1E90FF',
        }} />
      </div>

      {/* Dynamic Targets */}
      <TargetIcon type="key" angle={keyData.angle} distance={keyData.distance} isVisible={!hasKey} />
      <TargetIcon type="blackHole" angle={blackHoleData.angle} distance={blackHoleData.distance} isVisible={hasKey} />
      {whiteHolePos && (
        <TargetIcon type="whiteHole" angle={whiteHoleData.angle} distance={whiteHoleData.distance} isVisible={hasKey} />
      )}

      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(2.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
