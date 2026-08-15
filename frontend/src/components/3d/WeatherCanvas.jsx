import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useWeather } from '../../context/WeatherContext';
import { CameraParallax } from './CameraParallax';
import { WeatherLighting } from './WeatherLighting';
import { ClearScene } from './scenes/ClearScene';
import { NightScene } from './scenes/NightScene';
import { CloudScene } from './scenes/CloudScene';
import { RainScene } from './scenes/RainScene';
import { SnowScene } from './scenes/SnowScene';
import { FogScene } from './scenes/FogScene';
import { ErrorScene } from './scenes/ErrorScene';

function BackgroundSky({ skyBottom }) {
  return (
    <mesh position={[0, 0, -30]}>
      <planeGeometry args={[120, 80]} />
      <meshBasicMaterial color={skyBottom || '#090d16'} />
    </mesh>
  );
}

export const WeatherCanvas = () => {
  const { currentSceneConfig, weatherData, error, isTransitioning } = useWeather();
  const scene = currentSceneConfig.scene;
  const windSpeed = weatherData?.current?.windSpeed || 12;

  return (
    <div
      className={`fixed inset-0 pointer-events-none transition-opacity duration-500 ease-in-out ${
        isTransitioning ? 'opacity-40' : 'opacity-100'
      }`}
      style={{ zIndex: 0 }}
    >
      <Canvas
        dpr={[1, 1.25]} // Cap DPI to 1.25 max for silky 60+ FPS performance
        camera={{ position: [0, 0, 10], fov: 60 }}
        gl={{
          antialias: false, // Disable antialiasing for maximum GPU efficiency
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
      >
        <Suspense fallback={null}>
          <BackgroundSky skyBottom={scene.skyBottom} />
          <CameraParallax factor={0.4} />

          {error ? (
            <ErrorScene />
          ) : (
            <>
              <WeatherLighting
                isDay={scene.isDay}
                sunColor={scene.sunColor}
                ambientColor={scene.ambientColor}
                sunIntensity={scene.sunIntensity}
                hasLightning={scene.hasLightning}
              />

              <ClearScene isDay={scene.isDay} />
              <NightScene isDay={scene.isDay} />

              {scene.cloudCount > 0 && (
                <CloudScene
                  cloudCount={scene.cloudCount}
                  opacity={scene.cloudOpacity}
                  isDay={scene.isDay}
                  windSpeed={windSpeed}
                />
              )}

              {scene.precipType === 'rain' && (
                <RainScene
                  density={scene.precipDensity}
                  speed={scene.precipSpeed}
                  windSpeed={windSpeed}
                />
              )}

              {scene.precipType === 'snow' && (
                <SnowScene density={scene.precipDensity} />
              )}

              {scene.fogDensity > 0 && <FogScene isDay={scene.isDay} />}
            </>
          )}
        </Suspense>
      </Canvas>

      {/* Atmospheric Radial Gradient Overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 30%, transparent 40%, rgba(9, 13, 22, 0.65) 100%)`,
        }}
      />
    </div>
  );
};
