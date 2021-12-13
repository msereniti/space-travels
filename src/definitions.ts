export type KnownPlanet = 'mars' | 'moon' | 'titan';

export const planetsList: KnownPlanet[] = ['moon', 'mars', 'titan'];

export const planetTitle: Record<string, string> = {
  mars: 'Mars',
  moon: 'Moon',
  titan: 'Titan',
};

export type Passenger = {
  firstName: string;
  lastName: string;
  passportCode: string;
};

export type Flight = {
  flightCode: string;
  spacePortCodeFrom: string;
  actualDepartureTime: string;
  price: number;
};

export const routes = {
  root: '/',
  purchase: '/purchase/:flightCode/:passengersCount/:action?',
  order: '/order/:bookingCode',
};
