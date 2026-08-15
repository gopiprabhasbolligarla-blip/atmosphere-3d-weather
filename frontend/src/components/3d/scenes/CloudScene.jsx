import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';

function SingleCloud({ position, scale, opacity = 0.8, isDay = true, speed = 1.0 }) {
  const groupRef = useRef();

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.position.x += delta * 0.3 * speed;
      if (groupRef.current.position.x > 25) {
        groupRef.current.position.x = -25;
      }
    }
  });

  const cloudColor = isDay ? '#f8fafc' : '#334155';

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Low-poly 8-segment sphere puffs for ultra-smooth performance */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1.5, 8, 8]} />
        <meshBasicMaterial color={cloudColor} transparent opacity={opacity} />
      </mesh>
      <mesh position={[1.1, 0.2, -0.2]}>
        <sphereGeometry args={[1.1, 8, 8]} />
        <meshBasicMaterial color={cloudColor} transparent opacity={opacity} />
      </mesh>
      <mesh position={[-1.0, 0.1, 0.1]}>
        <sphereGeometry args={[1.0, 8, 8]} />
        <meshBasicMaterial color={cloudColor} transparent opacity={opacity} />
      </mesh>
    </group>
  );
}

export const CloudScene = ({ cloudCount = 8, opacity = 0.75, isDay = true, windSpeed = 10 }) => {
  const clouds = useMemo(() => {
    const list = [];
    // Cap maximum clouds to 12 for high FPS
    const count = Math.min(cloudCount, 12);
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 36;
      const y = Math.random() * 6 + 2;
      const z = (Math.random() - 0.5) * 10 - 5;
      const scale = Math.random() * 0.7 + 0.6;
      const speed = (windSpeed / 15) * (0.8 + Math.random() * 0.4);
      list.push({ id: i, position: [x, y, z], scale, speed });
    }
    return list;
  }, [cloudCount, windSpeed]);

  return (
    <group>
      {clouds.map((cloud) => (
        <SingleCloud
          key={cloud.id}
          position={cloud.position}
          scale={cloud.scale}
          opacity={opacity}
          isDay={isDay}
          speed={cloud.speed}
        />
      ))}
    </group>
  );
};
