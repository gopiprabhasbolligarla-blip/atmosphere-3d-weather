import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';

export const SnowScene = ({ density = 300 }) => {
  const pointsRef = useRef();
  // Cap particle count to 350 max
  const count = Math.min(density, 350);

  const [positions, fallSpeeds, initialX] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const initX = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 35;
      pos[i * 3] = x;
      pos[i * 3 + 1] = Math.random() * 25 - 5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 15 - 5;

      initX[i] = x;
      speeds[i] = Math.random() * 0.06 + 0.03;
    }

    return [pos, speeds, initX];
  }, [count]);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes.position;
    const posArr = posAttr.array;
    const time = clock.getElapsedTime();

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      posArr[idx + 1] -= fallSpeeds[i];
      posArr[idx] = initialX[i] + Math.sin(time * 1.5 + i) * 0.25;

      if (posArr[idx + 1] < -10) {
        posArr[idx + 1] = 20;
        posArr[idx] = (Math.random() - 0.5) * 35;
        initialX[i] = posArr[idx];
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
        color="#ffffff"
        size={0.4}
        transparent
        opacity={0.8}
        depthWrite={false}
      />
    </points>
  );
};
