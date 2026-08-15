import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

export const ClearScene = ({ isDay = true }) => {
  const sunRef = useRef();
  const coronaRef = useRef();

  useFrame((_, delta) => {
    if (sunRef.current) {
      sunRef.current.rotation.y += delta * 0.1;
    }
    if (coronaRef.current) {
      coronaRef.current.rotation.z -= delta * 0.05;
    }
  });

  if (!isDay) return null;

  return (
    <group position={[6, 7, -12]}>
      {/* Sun Core */}
      <mesh ref={sunRef}>
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshBasicMaterial color="#fbbf24" />
      </mesh>

      {/* Sun Inner Glow Aura */}
      <mesh>
        <sphereGeometry args={[3.2, 32, 32]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.35} />
      </mesh>

      {/* Solar Rays / Corona Disk */}
      <mesh ref={coronaRef}>
        <ringGeometry args={[3.2, 5.5, 32]} />
        <meshBasicMaterial color="#fde047" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>

      {/* Outer Soft Atmosphere Glow */}
      <mesh>
        <sphereGeometry args={[4.8, 32, 32]} />
        <meshBasicMaterial color="#fef08a" transparent opacity={0.12} />
      </mesh>
    </group>
  );
};
