import './shuttle.css';

import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Spin } from 'antd';
import { action, reaction } from 'mobx';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { Color, TextureLoader } from 'three';

import { store } from '../../store';
import { easeInOut } from '../utils';

const SeatMesh: React.FC<{
  size: number;
  seatId: number;
  seatsPicking: boolean;
}> = observer(({ size, seatId, seatsPicking }) => {
  const seatSchema = useLoader(TextureLoader, `/textures/seat-schema.svg`);
  const highlited = store.highlightedSeat === seatId;
  const occupied = store.occupied.includes(seatId);
  const owned = store.owned.includes(seatId);

  const overideColor = React.useMemo(() => {
    if (occupied) {
      return [0.812, 0.0745, 0.133];
    } else if (owned) {
      return [0.45, 0.8196, 0.2392];
    }
  }, [seatId, occupied, owned]);

  const onHoverTranslate = size / 3;
  const transitionDuration = 100;
  const targetHeight = highlited ? onHoverTranslate : 1;
  const targetScale = highlited ? 1.5 : 1;
  const targetColor =
    overideColor || (highlited ? [0.07, 0.353, 1] : [1, 1, 1]);

  const transitionStartTime = React.useRef(Date.now());
  const transitionStartHeight = React.useRef(targetHeight);
  const transitionStartScale = React.useRef(targetScale);
  const transitionStartColor = React.useRef(targetColor);

  const groupRef =
    React.useRef<any /* Fiber typing are pease of little shrinky shit */>(null);
  const materialRef =
    React.useRef<any /* Fiber typing are pease of little shrinky shit */>(null);

  const prepareForTransition = React.useCallback(() => {
    transitionStartTime.current = Date.now();
    transitionStartHeight.current = targetHeight;
    transitionStartScale.current = targetScale;
    transitionStartColor.current = targetColor;
  }, [targetHeight, targetScale, targetColor]);

  React.useEffect(
    () => reaction(() => store.highlightedSeat, prepareForTransition),
    [prepareForTransition]
  );
  const handlePointerOver = React.useCallback(
    action(() => seatsPicking && (store.highlightedSeat = seatId)),
    [seatId, seatsPicking]
  );

  useFrame(() => {
    if (!groupRef.current) return;
    if (!materialRef.current) return;

    if (groupRef.current.position.z !== targetHeight) {
      const progress = easeInOut(
        (Date.now() - transitionStartTime.current) / transitionDuration
      );

      if (progress >= 1) {
        groupRef.current.position.set(0, 0, targetHeight);
      } else {
        groupRef.current.position.set(
          0,
          0,
          transitionStartHeight.current +
            (targetHeight - transitionStartHeight.current) * progress
        );
      }
    }

    if (groupRef.current.scale.z !== targetScale) {
      const progress = easeInOut(
        (Date.now() - transitionStartTime.current) / transitionDuration
      );

      if (progress >= 1) {
        groupRef.current.scale.set(targetScale, targetScale, targetScale);
      } else {
        const currentScale =
          transitionStartScale.current +
          (targetScale - transitionStartScale.current) * progress;

        groupRef.current.scale.set(currentScale, currentScale, currentScale);
      }
    }

    const currentColor = [
      materialRef.current.color.r,
      materialRef.current.color.g,
      materialRef.current.color.b,
    ];

    if (targetColor.some((color, index) => color !== currentColor[index])) {
      const progress = easeInOut(
        (Date.now() - transitionStartTime.current) / transitionDuration
      );

      if (progress >= 1) {
        materialRef.current.color.set(new Color(...targetColor));
      } else {
        materialRef.current.color.set(
          new Color(
            transitionStartColor.current[0] +
              (targetColor[0] - transitionStartColor.current[0]) * progress,
            transitionStartColor.current[1] +
              (targetColor[1] - transitionStartColor.current[1]) * progress,
            transitionStartColor.current[2] +
              (targetColor[2] - transitionStartColor.current[2]) * progress
          )
        );
      }
    }
  });

  return (
    <group onPointerOver={handlePointerOver}>
      <group visible={false} position={[0, 0, onHoverTranslate]}>
        <mesh>
          <planeGeometry args={[size / 2, size]} />
        </mesh>
      </group>
      <group visible={false} position={[0, 0, 0]}>
        <mesh>
          <planeGeometry args={[size / 2, size]} />
        </mesh>
      </group>
      <group position={[0, 0, 0]} ref={groupRef}>
        <mesh>
          <planeGeometry args={[size / 2, size]} />
          <meshBasicMaterial
            map={seatSchema}
            transparent={true}
            ref={materialRef}
          />
        </mesh>
      </group>
    </group>
  );
});

const ShuttleMesh: React.FC<{ size: number; seatsPicking: boolean }> = ({
  size,
  seatsPicking,
}) => {
  const scale = 1;
  const shuttleSchema = useLoader(
    TextureLoader,
    `/textures/shuttle-schema.svg`
  );
  const width = size;
  const height = width / (1370 / 1989);

  const swingRef =
    React.useRef<any /* Fiber typing are pease of little shrinky shit */>(null);

  useFrame(() => {
    if (!swingRef.current) return;
    const durations = [10000, 12000, 15000];
    const offset = [0, 0, 0];
    const rotationPart = [0.1, 0.1, 0.1];
    const rotationSteps = durations.map(
      (duration, index) => ((Date.now() + offset[index]) % duration) / duration
    );
    const rotationDirection = durations.map((duration, index) =>
      Math.floor((Date.now() + offset[index]) / duration) % 2 === 0 ? 1 : -1
    );

    swingRef.current.rotation.set(
      ...rotationSteps.map(
        (rotationStep, index) =>
          rotationDirection[index] *
          Math.atan(1 - 2 * rotationStep) *
          rotationPart[index]
      )
    );
  });

  const seatsCount = 12;
  const seatsInRow = 2;
  const seatSize = height / 12;
  const seatsYOffset = seatSize * 2;
  const seatsYDiff = seatSize * 1.2;
  const seatsXDiff = seatSize * 1;

  return (
    <>
      <group
        position={[0, 0, -size]}
        scale={[scale, scale, scale]}
        rotation={[
          (Math.PI / 180) * -45,
          (Math.PI / 180) * 0,
          (Math.PI / 180) * -50,
        ]}
      >
        <group ref={swingRef}>
          <mesh>
            <planeGeometry args={[width, height]} />
            <meshBasicMaterial map={shuttleSchema} transparent={true} />
          </mesh>
          {Array(seatsCount / seatsInRow)
            .fill(0)
            .map((_, rowIndex) => (
              <group
                key={rowIndex}
                position={[0, seatsYOffset - seatsYDiff * rowIndex, 0]}
              >
                {Array(seatsInRow)
                  .fill(0)
                  .map((_, inRowIndex) => (
                    <group
                      position={[
                        (-(seatsInRow - 1) * seatsXDiff) / 2 +
                          seatsXDiff * inRowIndex,
                        0,
                        0,
                      ]}
                      key={inRowIndex}
                    >
                      <SeatMesh
                        seatsPicking={seatsPicking}
                        size={seatSize}
                        seatId={rowIndex * seatsInRow + inRowIndex}
                      />
                    </group>
                  ))}
              </group>
            ))}
        </group>
      </group>
    </>
  );
};

const ShuttleCanvas: React.FC<{ size: number; seatsPicking: boolean }> = ({
  size,
  seatsPicking,
}) => {
  return (
    <Canvas orthographic={true}>
      <ambientLight intensity={0.2} />
      <ShuttleMesh size={size * 0.6} seatsPicking={seatsPicking} />
    </Canvas>
  );
};

export const Shuttle: React.FC<{ size: number; seatsPicking: boolean }> =
  observer(({ size, seatsPicking }) => {
    return (
      <React.Suspense fallback={<Spin />}>
        <div
          style={{
            height: size,
            width: size,
            cursor: store.highlightedSeat !== null ? 'pointer' : 'default',
          }}
        >
          <ShuttleCanvas size={size} seatsPicking={seatsPicking} />
        </div>
      </React.Suspense>
    );
  });
