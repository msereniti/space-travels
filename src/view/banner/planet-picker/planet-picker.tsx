import './planet-picker.css';

import { Spin } from 'antd';
import { action } from 'mobx';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { KnownPlanet as KnownPlanet, planetsList } from '../../../definitions';
import { store } from '../../../store';
import { useWindowSize } from '../../utils';
import { Planet } from '../planet/planet';

const maxAngle = (90 / 180) * Math.PI;

const basesName: { [planetName in KnownPlanet]: string } = {
  mars: 'Dora spaceport',
  moon: 'Outpost 725',
  titan: 'Saint Laurent gateway',
};

const planets = [...planetsList].reverse();

export const PlanetPicker: React.FC<{}> = observer(() => {
  const windowSize = useWindowSize();

  const planetSize = React.useMemo(
    () => 200 || Math.max((windowSize.height ?? 0) / 3, 500),
    [windowSize.height]
  );

  const radius = planetSize * planets.length;
  const planetAngleSize = React.useMemo(
    () => 2 * Math.atan((planetSize * 0.8) / (2 * radius)),
    [planetSize, radius]
  );

  const computePlanetPosition = React.useCallback(
    (planetIndex: number) => {
      const angle = (maxAngle / planets.length) * planetIndex;
      const top = -Math.sin(angle + planetAngleSize) * radius;
      const left = Math.cos(angle + planetAngleSize) * radius;

      return { top, left };
    },
    [planets.length, planetAngleSize, radius]
  );
  const firstPlanetPosition = React.useMemo(
    () => computePlanetPosition(0),
    [computePlanetPosition]
  );
  const lastPlanetPosition = React.useMemo(
    () => computePlanetPosition(planets.length - 1),
    [computePlanetPosition, planets.length]
  );

  const rotation = React.useMemo(
    () =>
      maxAngle *
        ((planets.length - 1 - planets.indexOf(store.pickedPlanet || 'mars')) /
          planets.length) +
      planetAngleSize,
    [maxAngle, planets, planetAngleSize, store.pickedPlanet]
  );

  const wheelStyles = React.useMemo(() => {
    const size =
      Math.abs(firstPlanetPosition.top - lastPlanetPosition.top) + planetSize;

    return {
      height: size,
      width: size,
      transform: `rotate(-${rotation.toFixed(2)}rad)`,
      left: windowSize.width / 2,
      top: windowSize.height / 2,
    };
  }, [
    firstPlanetPosition,
    lastPlanetPosition,
    planetSize,
    rotation,
    windowSize,
  ]);

  return (
    <div className="planet-picker">
      <div className="planet-picker-wheel" style={wheelStyles}>
        {planetSize !== 0 &&
          planets.map((planet, index) => {
            const picked = planet === store.pickedPlanet;
            const position = computePlanetPosition(index);
            const { top, left } = {
              top: position.top - lastPlanetPosition.top,
              left: position.left - lastPlanetPosition.left,
            };

            return (
              <React.Suspense fallback={<Spin />}>
                <div
                  className="planet-picker-planet"
                  key={`${planet}_${index}`}
                  style={{
                    top,
                    left,
                    transform: `rotate(${rotation.toFixed(2)}rad) scale(${
                      picked ? 1 : 1
                    })`,
                    opacity: picked ? 1 : 0.5,
                  }}
                  onClick={action(() => (store.pickedPlanet = planet))}
                >
                  {picked && (
                    <div className="planet-picker-planet-base">
                      {basesName[planet]}
                    </div>
                  )}
                  <Planet
                    planetName={planet}
                    showBase={picked}
                    height={planetSize}
                  />
                </div>
              </React.Suspense>
            );
          })}
      </div>
    </div>
  );
});
