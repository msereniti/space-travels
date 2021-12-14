import './seat-picker.css';

import { observer } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import { Transition } from 'react-transition-group';
import { useAsyncResource } from 'use-async-resource';
import { useRoute } from 'wouter';

import { getFlight, getShuttle } from '../../api';
import { KnownPlanet, planetTitle, routes } from '../../definitions';
import { store } from '../../store';
import { Shuttle } from '../shuttle/shuttle';
import { formatPrice, useWindowSize } from '../utils';
import { OrderConfirmer } from './order-confirmation';
import { PassengersDataForm } from './passengers-data-form';
import { SeatName } from './seat-name';
import { SeatsSelect } from './seats-select';

const ShuttleHint: React.FC = observer(() => {
  const pickedSeat = store.highlightedSeat;

  if (pickedSeat !== null) {
    if (store.occupied.includes(pickedSeat)) {
      return (
        <>
          Seat <SeatName seatId={pickedSeat} /> is taken by another passenger
        </>
      );
    }

    return (
      <>
        Seat <SeatName seatId={pickedSeat} /> for
        {store.flight && formatPrice(store.flight.price)}
      </>
    );
  }

  if (store.owned.length > 0) {
    return (
      <>
        {store.owned.length} seat
        {store.owned.length > 1 ? 's' : ''} picked
      </>
    );
  }

  return (
    <>
      Let's pick a life support block for you flight.
      <br />
      One block per person.
    </>
  );
});

export const SeatPicker: React.FC = observer(() => {
  const windowSize = useWindowSize();
  const orientation =
    windowSize.width > windowSize.height ? 'horizontal' : 'vertical';
  const [routeMatch, routeParams] = useRoute<{
    flightCode: string;
    destination: KnownPlanet;
    action: 'passengers' | 'confirmation' | 'confirmed';
  }>(routes.purchase);

  if (!routeMatch) {
    return <>Invalid route</>;
  }

  const [flightReader] = useAsyncResource(getFlight, routeParams!.flightCode);
  const flight = flightReader();
  const [shuttleReader] = useAsyncResource(getShuttle, flight.shuttleCode);
  const shuttle = shuttleReader();

  useEffect(() => {
    if (!store.shuttle) {
      store.shuttle = shuttle;
    }
    if (!store.flight) {
      store.flight = flight;
    }
    if (store.shuttle && store.flight && store.occupied.length === 0) {
      store.occupied = flight.busySeats.map((seatName) =>
        store.shuttle!.seats.indexOf(seatName)
      );
    }
  }, [flight, store.flight, shuttle, store.shuttle]);

  const { destination, action } = routeParams!;

  return (
    <div className={`seat-picker seat-picker-${orientation}`}>
      <div className="seat-picker-shuttle">
        <div
          className="seat-picker-shuttle-overlay"
          style={
            orientation === 'vertical' ? { position: 'relative' } : undefined
          }
        >
          <h1 className="seat-picker-shuttle-name">
            Spaceship {store.shuttle?.shuttleName} to {planetTitle[destination]}
          </h1>
          <h3 className="seat-picker-shuttle-hint">
            <ShuttleHint />
          </h3>
        </div>
        <Shuttle
          seatsPicking={!action}
          size={
            orientation === 'horizontal'
              ? Math.min(windowSize.height, windowSize.width * 0.6)
              : windowSize.width
          }
        />
      </div>
      <div className="seat-picker-picking-form-scroll-wrapper">
        <div className="seat-picker-picking-form">
          {!action && <SeatsSelect />}
          {action === 'passengers' && <PassengersDataForm />}
          {action === 'confirmation' && <OrderConfirmer />}
        </div>
      </div>
    </div>
  );
});
