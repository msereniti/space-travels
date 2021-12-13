import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import React from 'react';
import {
  Color,
  DoubleSide,
  LinearFilter,
  TextureLoader,
  Vector3,
  Vector3Tuple,
} from 'three';

import { KnownPlanet } from '../../../definitions';
import { easeInOut } from '../../utils';

// https://www.solarsystemscope.com/textures/

const upperRightCorner = new Vector3(3.85, 3.85, 0);

const Line: React.FC<{
  start: Vector3;
  end: Vector3;
  animated?: boolean;
  animationDuration?: number;
}> = ({ start, end, animated = true, animationDuration = 1500 }) => {
  const ref = React.useRef<THREE.Line>();
  const aniamtionStart = React.useRef(-1);

  React.useLayoutEffect(() => {
    if (!ref.current?.geometry) return;
    if (aniamtionStart.current !== -1) return;
    ref.current.geometry.setFromPoints(
      animated ? [start, start] : [start, end]
    );
  }, [start, end]);
  useFrame(() => {
    if (!animated) return;
    if (!ref.current?.geometry) return;

    if (aniamtionStart.current === -1) {
      aniamtionStart.current = Date.now();
    }

    const progress = (Date.now() - aniamtionStart.current) / animationDuration;

    if (progress >= 1) {
      ref.current.geometry.setFromPoints([start, end]);
    }

    const easedProgress = easeInOut(progress);
    const animatedEnd = new Vector3(
      start.x + (end.x - start.x) * easedProgress,
      start.y + (end.y - start.y) * easedProgress,
      start.z + (end.z - start.z) * easedProgress
    );

    ref.current.geometry.setFromPoints([start, animatedEnd]);
  });

  return (
    <line ref={ref as any}>
      <bufferGeometry />
      <lineBasicMaterial
        color={new Color(255, 255, 255)}
        depthTest={false}
        depthWrite={false}
      />
    </line>
  );
};

type DegreesPerSecond = number;

const PlanetSurface: React.FC<{
  textureName: KnownPlanet;
  baseRotation: Vector3Tuple;
  rotationSpeed: DegreesPerSecond;
  showBase: boolean;
}> = ({
  textureName,
  baseRotation: baseDegreesRotation,
  rotationSpeed,
  showBase,
}) => {
  const groupRef = React.useRef<THREE.Mesh>(null);
  const basePointRef = React.useRef<THREE.Mesh>(null);
  const initBaseWorldPosition = new Vector3();
  const [baseWorldPosition, setBaseWorldPosition] = React.useState(
    initBaseWorldPosition
  );

  const updatePlanetRotation = React.useCallback(() => {
    if (!groupRef.current) return;

    const secondsPassed = Date.now() / 1000;
    const rotationgAngle = (rotationSpeed * secondsPassed) % 360;

    groupRef.current.rotation.y = (rotationgAngle / 180) * Math.PI;
  }, []);

  React.useLayoutEffect(updatePlanetRotation, [updatePlanetRotation]);

  useFrame(() => {
    if (!groupRef.current) return;

    updatePlanetRotation();

    requestAnimationFrame(() => {
      if (basePointRef.current) {
        const vector = new Vector3();

        basePointRef.current.getWorldPosition(vector);
        setBaseWorldPosition(vector);
      }
    });
  });
  const texture = useLoader(TextureLoader, `/textures/${textureName}.jpg`);

  texture.minFilter = LinearFilter;

  const planetInitRotation: Vector3Tuple = [(45 * Math.PI) / 180, 0, 0];
  const baseRotation = baseDegreesRotation.map(
    (degrees) => (degrees * Math.PI) / 180
  ) as Vector3Tuple;

  return (
    <>
      <group
        position={[0, 0, 0]}
        ref={groupRef}
        scale={[1, 0.95, 1]}
        rotation={planetInitRotation}
      >
        <mesh>
          <sphereGeometry args={[3, 96, 32]} />
          <meshStandardMaterial map={texture} roughness={10000} />
        </mesh>

        {showBase && (
          <group rotation={baseRotation}>
            <mesh visible={false}>
              <sphereGeometry args={[3, 8, 8]} />
            </mesh>
            <group position={[0, 0, 3]} ref={basePointRef}>
              <mesh>
                <ringGeometry args={[0, 0.05, 32]} />
                <meshPhongMaterial
                  color={new Color(255, 255, 255)}
                  side={DoubleSide}
                  specular={new Color(255, 255, 255)}
                  shininess={1}
                  depthTest={false}
                  depthWrite={false}
                />
              </mesh>
              <mesh>
                <ringGeometry args={[0.06, 0.1, 32]} />
                <meshPhongMaterial
                  color={new Color(1, 1, 1)}
                  side={DoubleSide}
                  specular={new Color(1, 1, 1)}
                  shininess={0.5}
                  depthTest={false}
                  depthWrite={false}
                />
              </mesh>
            </group>
          </group>
        )}
      </group>
      {showBase && baseWorldPosition !== initBaseWorldPosition && (
        <Line start={baseWorldPosition} end={upperRightCorner} />
      )}
    </>
  );
};

const planetToBaseRotation: { [planet in KnownPlanet]: Vector3Tuple } = {
  mars: [-45, 0, 0],
  moon: [0, 0, 0],
  titan: [0, 0, 0],
};

const planetToRotationSpeed: { [planet in KnownPlanet]: number } = {
  mars: 10,
  moon: 15,
  titan: 30,
};

export const Planet: React.FC<{
  planetName: KnownPlanet;
  showBase: boolean;
  height?: number;
}> = ({ planetName, height = 300, showBase = false }) => {
  return (
    <div style={{ height, width: height }}>
      <Canvas>
        <ambientLight intensity={0.1} />
        <spotLight
          color={new Color(2, 2, 2)}
          position={[2, 2, 4]}
          intensity={0.5}
        />
        <PlanetSurface
          textureName={planetName}
          baseRotation={planetToBaseRotation[planetName]}
          rotationSpeed={planetToRotationSpeed[planetName]}
          showBase={showBase}
        />
      </Canvas>
    </div>
  );
};
