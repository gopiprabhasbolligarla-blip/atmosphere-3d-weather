import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export const CameraParallax = ({ factor = 0.5 }) => {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouse.current.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.targetY = -(e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((_, delta) => {
    // Lerp mouse position for smooth fluid motion
    mouse.current.x += (mouse.current.targetX - mouse.current.x) * delta * 2;
    mouse.current.y += (mouse.current.targetY - mouse.current.y) * delta * 2;

    camera.position.x = mouse.current.x * factor * 1.5;
    camera.position.y = mouse.current.y * factor * 1.0;
    camera.lookAt(0, 0, -10);
  });

  return null;
};
