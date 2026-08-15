import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const RainScene = ({ density = 400, speed = 1.8, windSpeed = 15 }) => {
  const pointsRef = useRef();

  // Cap particle count to 450 max for fast frame rendering
  const count = Math.min(density, 450);

  const [positions, velY, velX] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vY = new Float32Array(count);
    const vX = new Float32Array(count);

    const windAngle = (windSpeed / 50) * 0.25;

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 35;
      pos[i * 3 + 1] = Math.random() * 25 - 5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 15 - 5;

      vX[i] = windAngle;
      vY[i] = -(Math.random() * 0.3 + 0.7) * speed;
    }

    return [pos, vY, vX];
  }, [count, speed, windSpeed]);

  useFrame(() => {
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes.position;
    const posArr = posAttr.array;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      posArr[idx] += velX[i];
      posArr[idx + 1] += velY[i];

      if (posArr[idx + 1] < -10) {
        posArr[idx + 1] = 20;
        posArr[idx] = (Math.random() - 0.5) * 35;
      }
    }

    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#93c5fd"
        size={0.25}
        transparent
        opacity={0.65}
        depthWrite={false}
      />
    </points>
  );
};
