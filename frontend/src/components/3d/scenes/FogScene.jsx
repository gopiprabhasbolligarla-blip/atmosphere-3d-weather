import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export const FogScene = ({ opacity = 0.035, isDay = true }) => {
  const fogRef = useRef();

  useFrame((_, delta) => {
    if (fogRef.current) {
      fogRef.current.rotation.y += delta * 0.02;
    }
  });

  return (
    <group ref={fogRef}>
      <mesh position={[0, 0, -5]}>
        <planeGeometry args={[60, 30]} />
        <meshBasicMaterial
          color={isDay ? '#cbd5e1' : '#1e293b'}
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  );
};
