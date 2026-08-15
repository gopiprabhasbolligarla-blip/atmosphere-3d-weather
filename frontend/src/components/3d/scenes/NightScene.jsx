import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

export const NightScene = ({ isDay = false }) => {
  const moonRef = useRef();

  useFrame((_, delta) => {
    if (moonRef.current) {
      moonRef.current.rotation.y += delta * 0.03;
    }
  });

  if (isDay) return null;

  return (
    <>
      {/* Optimized Starfield Box (800 count) */}
      <Stars radius={60} depth={40} count={800} factor={3} saturation={0} fade speed={1} />

      {/* 3D Moon Group */}
      <group position={[-6, 6, -14]} ref={moonRef}>
        <mesh>
          <sphereGeometry args={[2.2, 16, 16]} />
          <meshStandardMaterial
            color="#e2e8f0"
            roughness={0.8}
            metalness={0.1}
            emissive="#94a3b8"
            emissiveIntensity={0.2}
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[2.7, 16, 16]} />
          <meshBasicMaterial color="#cbd5e1" transparent opacity={0.18} side={THREE.BackSide} />
        </mesh>
      </group>
    </>
  );
};
