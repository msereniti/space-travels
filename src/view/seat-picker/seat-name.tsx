import React from 'react';

export const seatsNames = [
  'Aidan',
  'Bruna',
  'Carmelo',
  'Daniella',
  'Esteban',
  'Flor',
  'Gerardo',
  'Hedda',
  'Izzy',
  'Jacinta',
  'Lisa',
  'Ophelia',
];

export const SeatName: React.FC<{ seatId: number }> = ({ seatId }) => (
  <>
    {String(seatId + 1).padStart(2, '0')}. <q>{seatsNames[seatId]}</q>
  </>
);
