import { Button, Descriptions, Select } from 'antd';
import dayjs from 'dayjs';
import { action, runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useLocation, useRoute } from 'wouter';

import { routes } from '../../definitions';
import { store } from '../../store';
import { formatPrice, makePurchaseUrl, toggleSeatOwnership } from '../utils';
import { SeatName, seatsNames } from './seat-name';

export const SeatsSelect: React.FC = observer(() => {
  const pickedSeatId = store.highlightedSeat;
  const picked = pickedSeatId !== null;
  const owned = store.owned.includes(pickedSeatId!);
  const occupied = store.occupied.includes(pickedSeatId!);

  const handleToggleSeatClick = React.useCallback(
    action(() => {
      if (store.highlightedSeat !== null) {
        toggleSeatOwnership(store.highlightedSeat);
        store.highlightedSeat = null;
      }
    }),
    []
  );
  const [, navigateTo] = useLocation();
  const currentRoute = useRoute(routes.purchase);
  const handleGoToForm = React.useCallback(
    action(() => {
      store.highlightedSeat = null;
      navigateTo(makePurchaseUrl(currentRoute, { action: 'passengers' }));
    }),
    [makePurchaseUrl]
  );

  const primaryAction =
    (!picked || owned || occupied) &&
    store.owned.length >= store.passengersCount
      ? 'continue'
      : 'add';

  return (
    <div className="seat-picker-seats-confirmer">
      <h4>
        <Descriptions column={1} bordered>
          <Descriptions.Item label="Spaceport">
            {store.flight?.spacePortCodeFrom}
          </Descriptions.Item>
          <Descriptions.Item label="Departue">
            {dayjs(store.flight?.actualDepartureTime).format(
              'YYYY-MM-DD HH:mm'
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Prece per seat">
            {store.flight && formatPrice(store.flight.price)}
          </Descriptions.Item>
        </Descriptions>
      </h4>
      <div className="seat-picker-seats-confirmer-row">
        <Select
          className="seat-picker-seats-confirmer-select"
          value={store.highlightedSeat ?? undefined}
          onChange={(seatId) =>
            runInAction(() => (store.highlightedSeat = seatId))
          }
          placeholder="No seat selected"
          options={seatsNames.map((_seatName, seatId) => ({
            value: seatId,
            label: <SeatName seatId={seatId} />,
            disabled: store.occupied.includes(seatId),
          }))}
        />
        <Button
          onClick={handleToggleSeatClick}
          disabled={!picked || occupied}
          type={primaryAction === 'add' ? 'primary' : 'default'}
        >
          {owned ? 'Release' : 'Book'} seat
        </Button>
      </div>
      <Button
        onClick={handleGoToForm}
        disabled={store.owned.length === 0}
        type={primaryAction === 'continue' ? 'primary' : 'default'}
      >
        Continue with {store.owned.length} seat
        {store.owned.length > 1 ? 's' : ''}
      </Button>
    </div>
  );
});
