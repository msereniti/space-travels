import './banner.css';

import { observer } from 'mobx-react-lite';
import React from 'react';

import { store } from '../../store';
import { PlanetPicker } from './planet-picker/planet-picker';
import { ShortForm } from './short-form/short-form';
import { SpaceBackground } from './space-background/space-background';

export const LandingBanner: React.FC = observer(() => {
  return (
    <div className="landing-banner">
      <SpaceBackground acceleration={store.submittingShortForm ? 10 : 0.0001} />
      <PlanetPicker />
      <ShortForm />
    </div>
  );
});
