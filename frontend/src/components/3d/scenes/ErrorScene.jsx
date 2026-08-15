import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text } from '@react-three/drei';

export const ErrorScene = () => {
  const meshRef = useRef();

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.4;
      meshRef.current.rotation.y += delta * 0.6;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
      <group position={[0, 1, -8]}>
        <mesh ref={meshRef}>
          <boxGeometry args={[3, 3, 3]} />
          <meshStandardMaterial
            color="#ef4444"
            wireframe
            emissive="#b91c1c"
            emissiveIntensity={0.8}
          />
        </mesh>

        <mesh scale={1.4}>
          <sphereGeometry args={[1.5, 16, 16]} />
          <meshBasicMaterial color="#f87171" transparent opacity={0.15} wireframe />
        </mesh>
      </group>
    </Float>
  );
};
