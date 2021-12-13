import { Button, Descriptions, message } from 'antd';
import dayjs from 'dayjs';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useLocation, useRoute } from 'wouter';

import { bookAFlight } from '../../api';
import { routes } from '../../definitions';
import { store } from '../../store';
import { formatPrice, makePurchaseUrl } from '../utils';
import { SeatName } from './seat-name';

export const OrderConfirmer: React.FC = observer(() => {
  const [isBooking, setIsBooking] = React.useState(false);
  const [, navigateTo] = useLocation();
  const [routeMatch, routeParams] = useRoute<{
    flightCode: string;
  }>(routes.purchase);

  if (!routeMatch) {
    return <>Invalid route</>;
  }

  React.useEffect(() => {
    if (!store.phoneNumber || store.passengers.length === 0) {
      navigateTo(makePurchaseUrl([routeMatch, routeParams], { action: '' }));
    }
  }, [routeMatch, routeParams, store.phoneNumber, store.passengers.length]);

  const handleConfirm = React.useCallback(async () => {
    if (!store.phoneNumber) return;
    if (!store.passengers) return;
    setIsBooking(true);
    try {
      const { bookingCode } = await bookAFlight({
        phoneNumber: store.phoneNumber,
        passengers: store.passengers,
        flights: [routeParams!.flightCode],
      });

      navigateTo(`/order/${bookingCode}`);
    } catch (error) {
      if (error instanceof Error) {
        message.error(error);
      }
    }
    setIsBooking(false);
  }, []);

  return (
    <div className="order-view">
      <h3>Confirm your order</h3>
      <Descriptions bordered column={1}>
        <Descriptions.Item label="Spaceship">
          {store.shuttle?.shuttleName}
        </Descriptions.Item>
        <Descriptions.Item label="Departure date">
          {dayjs(store.departureDate).format('YYYY-MM-DD')}
        </Descriptions.Item>
        <Descriptions.Item label="Booked seats">
          {store.owned.length}
        </Descriptions.Item>
        <Descriptions.Item label="Payer contact phone">
          {store.phoneNumber}
        </Descriptions.Item>
        <Descriptions.Item label="Spaceport">
          {store.flight?.spacePortCodeFrom}
        </Descriptions.Item>
        <Descriptions.Item label="Departue">
          {dayjs(store.flight?.actualDepartureTime).format('YYYY-MM-DD HH:mm')}
        </Descriptions.Item>
        <Descriptions.Item label="Prece per seat">
          {store.flight && formatPrice(store.flight.price)}
        </Descriptions.Item>
        <Descriptions.Item label="Total price">
          <strong>
            {store.flight &&
              formatPrice(store.flight.price * store.passengers.length)}
          </strong>
        </Descriptions.Item>
      </Descriptions>
      <br />
      <br />
      <Descriptions title="Passengers data" column={3} layout="vertical">
        {store.passengers.map((passenger, index) => (
          <React.Fragment key={passenger.passportCode}>
            <Descriptions.Item label="Name">
              {passenger.firstName}
              {passenger.lastName}
            </Descriptions.Item>
            <Descriptions.Item label="ID">
              {passenger.passportCode}
            </Descriptions.Item>
            <Descriptions.Item label="Seat">
              <SeatName seatId={store.owned[index]} />
            </Descriptions.Item>
          </React.Fragment>
        ))}
      </Descriptions>
      <br />
      <br />
      <div className="order-confirmer-footer">
        <Button type="primary" onClick={handleConfirm} loading={isBooking}>
          Confirm
        </Button>
      </div>
    </div>
  );
});
