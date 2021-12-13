import './short-form.css';

import Button from 'antd/lib/button';
import InputNumber from 'antd/lib/input-number';
import Tabs from 'antd/lib/tabs';
import { action, runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useLocation, useRoute } from 'wouter';

import {
  KnownPlanet,
  planetsList,
  planetTitle,
  routes,
} from '../../../definitions';
import { store } from '../../../store';
import { formatPrice, makePurchaseUrl } from '../../utils';
import { FlightDatePicker } from './date-picker';

const { TabPane } = Tabs;

export const ShortForm: React.FC = observer(() => {
  const [, navigateTo] = useLocation();
  const currentRoute = useRoute(routes.purchase);
  const handleSubmit = React.useCallback(async () => {
    runInAction(() => (store.submittingShortForm = true));
    await new Promise((resolve) => setTimeout(resolve, 800));
    navigateTo(
      makePurchaseUrl(currentRoute, {
        flightCode: store.flight!.flightCode,
        passengersCount: store.passengersCount,
      })
    );
  }, [currentRoute]);

  return (
    <div className="short-form">
      <h1>Travel to other planets</h1>
      <Tabs
        size="large"
        className="short-form-planets-tabs"
        activeKey={store.pickedPlanet}
        centered={true}
        onTabClick={action(
          (planet) => (store.pickedPlanet = planet as KnownPlanet)
        )}
      >
        {planetsList.map((planet) => (
          <TabPane tab={planetTitle[planet]} key={planet} />
        ))}
      </Tabs>
      <div className="short-form-inputs">
        <FlightDatePicker />
        <InputNumber
          min={1}
          className="short-form-passenger-count-input"
          value={store.passengersCount}
          onChange={(value) =>
            runInAction(() => (store.passengersCount = value))
          }
          formatter={(passengersCount) =>
            String(passengersCount) === '1'
              ? '1 passenger'
              : `${passengersCount} passengers`
          }
          size="large"
        />
        <Button
          className="short-form-submit-button"
          size="large"
          type="primary"
          disabled={!store.departureDate}
          loading={store.submittingShortForm}
          onClick={handleSubmit}
        >
          Book flight{' '}
          {store.flight !== undefined &&
            `from ${formatPrice(store.passengersCount * store.flight.price)}`}
        </Button>
      </div>
    </div>
  );
});
