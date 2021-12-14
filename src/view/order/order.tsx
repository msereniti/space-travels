import './order.css';

import { Button, Descriptions, Result, Spin } from 'antd';
import dayjs from 'dayjs';
import { observer } from 'mobx-react-lite';
import React from 'react';
import QRCode from 'react-qr-code';
import { useReactToPrint } from 'react-to-print';
import { useAsyncResource } from 'use-async-resource';
import { useRoute } from 'wouter';

import { getBooking, getFlight, getShuttle, getSpacePort } from '../../api';
import { Passenger, planetTitle, routes, Shuttle } from '../../definitions';
import { SeatName } from '../seat-picker/seat-name';
import { capitalize } from '../utils';

export const Ticket: React.FC<{
  passenger: Passenger;
  ticketId: string;
  seatId: number;
  phoneNumber: string;
  departureDate: string;
  departurePort: string;
  spaceship: Shuttle;
  destination: string;
}> = observer(
  ({
    passenger,
    seatId,
    phoneNumber,
    departureDate,
    departurePort,
    spaceship,
    destination,
  }) => {
    const ref = React.useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({
      content: () => ref.current,
    });

    return (
      <div className="ticket" ref={ref}>
        <div className="ticket-header">
          <div className="ticket-header-main">
            <QRCode size={100} className="ticket-qr" value={location.href} />
            <h2>Space travel Ticket</h2>
          </div>
          <Button onClick={handlePrint} className="ticket-header-extra">
            Print
          </Button>
        </div>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Destionation">
            {planetTitle[destination] || destination}
          </Descriptions.Item>
          <Descriptions.Item label="Spaceship">
            {spaceship.shuttleName}
          </Descriptions.Item>
          <Descriptions.Item label="Departure time">
            {dayjs(departureDate).format('YYYY-MM-DD HH:mm')}
          </Descriptions.Item>
          <Descriptions.Item label="Departure port">
            {departurePort}
          </Descriptions.Item>
          <Descriptions.Item label="Payer contact phone">
            {phoneNumber}
          </Descriptions.Item>
          <Descriptions.Item label="Seat name">
            <SeatName seatId={seatId} />
          </Descriptions.Item>
          <Descriptions.Item label="Passenger">
            {passenger.firstName} {passenger.lastName}
          </Descriptions.Item>
          <Descriptions.Item label="Identity document">
            {passenger.passportCode}
          </Descriptions.Item>
          <Descriptions.Item label="Operator">
            <a href={location.origin}>{location.origin}</a>
            {' | '}
            <a href={`mailto:info@${location.host}`}>info@{location.host}</a>
          </Descriptions.Item>
        </Descriptions>
      </div>
    );
  }
);

const TicketsList: React.FC = observer(() => {
  const [routeMatch, routeParams] = useRoute<{ bookingCode: string }>(
    routes.order
  );

  if (!routeMatch) {
    return <>Invalid route</>;
  }

  const [bookingReader] = useAsyncResource(getBooking, routeParams.bookingCode);
  const booking = bookingReader();

  const [flightReader] = useAsyncResource(getFlight, booking?.flightCodes[0]);
  const flight = flightReader();
  const [shuttleReader] = useAsyncResource(getShuttle, flight.shuttleCode);
  const shuttle = shuttleReader();
  const [destinationSpacePortReader] = useAsyncResource(
    getSpacePort,
    flight.spacePortCodeTo
  );
  const destinationSpacePort = destinationSpacePortReader();
  const [departureSpacePortReader] = useAsyncResource(
    getSpacePort,
    flight.spacePortCodeFrom
  );
  const departureSpacePort = departureSpacePortReader();

  return (
    <>
      {booking.bookingStatus === 'NOT_PAID' && (
        <Result
          status="success"
          title="Flight booked"
          subTitle="Out manager will contact you process payment"
        />
      )}
      <div className="tickets-list">
        {booking.passengers.map((passenger, index) => (
          <Ticket
            key={passenger.passportCode}
            passenger={passenger}
            ticketId={booking.paymentCode}
            seatId={index}
            phoneNumber={booking.phoneNumber}
            departureDate={'0'}
            spaceship={shuttle}
            departurePort={`${capitalize(destinationSpacePort.planetName)} / ${
              destinationSpacePort.spacePortName
            }`}
            destination={`${capitalize(departureSpacePort.planetName)} / ${
              departureSpacePort.spacePortName
            }`}
          />
        ))}
      </div>
    </>
  );
});

export const Order: React.FC = observer(() => {
  return (
    <React.Suspense fallback={<Spin />}>
      <TicketsList />
    </React.Suspense>
  );
});
