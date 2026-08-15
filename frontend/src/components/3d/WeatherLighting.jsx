import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const WeatherLighting = ({ isDay, sunColor, ambientColor, sunIntensity, hasLightning }) => {
  const lightningLightRef = useRef();
  const nextFlashTime = useRef(0);

  useFrame(({ clock }) => {
    if (hasLightning && lightningLightRef.current) {
      const elapsed = clock.getElapsedTime();
      if (elapsed > nextFlashTime.current) {
        lightningLightRef.current.intensity = Math.random() > 0.4 ? 10 : 5;
        nextFlashTime.current = elapsed + 2.0 + Math.random() * 4;
      } else {
        lightningLightRef.current.intensity = THREE.MathUtils.lerp(
          lightningLightRef.current.intensity,
          0,
          0.15
        );
      }
    }
  });

  return (
    <>
      <ambientLight color={ambientColor || (isDay ? '#ffffff' : '#1e293b')} intensity={isDay ? 0.75 : 0.3} />

      {/* Main Solar / Lunar Light without expensive shadow mapping */}
      <directionalLight
        position={isDay ? [12, 18, 10] : [-10, 15, -8]}
        intensity={sunIntensity}
        color={sunColor || (isDay ? '#ffb703' : '#94a3b8')}
      />

      <hemisphereLight
        skyColor={isDay ? '#93c5fd' : '#0f172a'}
        groundColor={isDay ? '#1e3a8a' : '#020617'}
        intensity={0.35}
      />

      {hasLightning && (
        <pointLight
          ref={lightningLightRef}
          position={[0, 10, -5]}
          color="#e0e7ff"
          intensity={0}
          distance={35}
        />
      )}
    </>
  );
};
