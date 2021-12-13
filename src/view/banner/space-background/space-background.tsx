import './space-background.css';

import useResizeObserver from '@react-hook/resize-observer';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Spin } from 'antd';
import React, { useLayoutEffect } from 'react';
import { TextureLoader, Vector3 } from 'three';

const Particals: React.FC<{
  particalsCount: number;
  width: number;
  height: number;
  acceleration: number;
}> = ({ particalsCount, width, height, acceleration: baseAcceleration }) => {
  const depth = React.useMemo(() => Math.max(width, height), [width, height]);
  const getAcceleration = React.useCallback(
    () => baseAcceleration + Math.random() * baseAcceleration,
    [baseAcceleration]
  );

  const particals = React.useMemo(() => {
    return Array(particalsCount)
      .fill(0)
      .map(() => {
        let x = 0;
        let y = 0;
        const z = Math.random() * 2 * depth - 2 * depth;

        while (Math.sqrt(x ** 2 + y ** 2) < Math.min(width, height) / 64) {
          x = Math.random() * 2 * width - width;
          y = Math.random() * 2 * height - height;
        }

        return {
          position: new Vector3(x, y, z),
          velocity: 0.1,
          acceleration: getAcceleration(),
          id: Math.random().toString(),
        };
      });
  }, [particalsCount, width, height, depth]);

  const geomtryRef = React.useRef<THREE.Line>();
  const texture = useLoader(TextureLoader, `/textures/star.png`);

  useFrame(() => {
    if (!geomtryRef.current) return;

    for (const partical of particals) {
      partical.position.z += partical.velocity;
      partical.velocity += partical.acceleration;

      if (partical.position.z >= depth) {
        partical.position.z = Math.random() * 2 * depth - 2 * depth;
        partical.velocity = 0.1;
        partical.acceleration = getAcceleration();
      }

      if (partical.acceleration < baseAcceleration) {
        partical.acceleration += baseAcceleration / 1000;
      }
      if (partical.acceleration > baseAcceleration * 2) {
        partical.acceleration -= partical.acceleration / 10;
      }
    }

    geomtryRef.current.geometry.setFromPoints(
      particals.map((partical) => partical.position)
    );
  });

  return (
    <points ref={geomtryRef as any}>
      <bufferGeometry />
      <pointsMaterial map={texture} color="white" />
    </points>
  );
};

export const SpaceBackground: React.FC<{ acceleration?: number }> = ({
  acceleration = 0.0001,
}) => {
  const ref = React.useRef<HTMLCanvasElement>(null);
  const [particalsCount, setParticalsCount] = React.useState(0);
  const [width, setWidth] = React.useState(0);
  const [height, setHeight] = React.useState(0);

  const handleSize = React.useCallback(() => {
    if (!ref.current) return;
    setWidth(ref.current.width);
    setHeight(ref.current.height);
    setParticalsCount(ref.current.width * 30);
  }, []);

  useLayoutEffect(handleSize, []);
  useResizeObserver(ref, handleSize);

  return (
    <div className="space-background">
      <React.Suspense fallback={<Spin />}>
        <Canvas ref={ref} className="space-background-canvas">
          <ambientLight intensity={0.1} />
          {particalsCount > 0 && (
            <Particals
              particalsCount={particalsCount}
              width={width}
              height={height}
              acceleration={acceleration}
            ></Particals>
          )}
        </Canvas>
      </React.Suspense>
    </div>
  );
};
