import dayjs from 'dayjs';

import { KnownPlanet, Shuttle } from './definitions';

const publicAccessToken =
  'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhYWFhIiwicm9sZXMiOltdLCJpYXQiOjE2Mzc3NjU3MjUsImV4cCI6MjYzNzc2NjMyNX0.bYnZNH2ecWA7IEXPBo3XLA_GHnF9yFEsKLawURfXY-k';
const baseUrl = 'https://space-travel-app.ru';

const apiCall = (method: 'post' | 'get', path: string, data?: object) =>
  fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      accept: 'application/json',
      Authorization: `Bearer ${publicAccessToken}`,
    },
    body: data ? JSON.stringify(data) : undefined,
  }).then((response) => response.json());

export const getSpacePort = async (spacePortCode: string) => {
  const response = await apiCall('get', `/space-port/${spacePortCode}`);

  return response as {
    planetName: string;
    spacePortCode: string;
    spacePortName: string;
  };
};

export const getFlights = async (
  destination: KnownPlanet,
  from: number,
  to: number
) => {
  const fromFormatted = dayjs(from).format('YYYY-MM-DD');
  const toFormatted = dayjs(to).format('YYYY-MM-DD');
  const response = await apiCall(
    'get',
    `/flight?from=earth&to=${destination}&type=Planet&when=${fromFormatted}&date-range-to=${toFormatted}
  `
  );

  return response as {
    flightsTo: {
      flightCode: string;
      spacePortCodeTo: string;
      spacePortCodeFrom: string;
      actualDepartureTime: string;
      actualArrivalTime: string;
      scheduleDepartureTime: string;
      scheduleArrivalTime: string;
      flightStatus: string;
      shuttleCode: string;
      price: number;
    }[];
  };
};

export const getFlight = async (flightCode: string) => {
  const response = await apiCall('get', `/flight/${flightCode}`);

  return response as {
    flightCode: string;
    spacePortCodeTo: string;
    spacePortCodeFrom: string;
    actualDepartureTime: string;
    actualArrivalTime: string;
    scheduleDepartureTime: string;
    scheduleArrivalTime: string;
    flightStatus: string;
    shuttleCode: string;
    price: number;
    busySeats: string[];
  };
};

export const getShuttle = async (shuttleCode: string) => {
  const response = await apiCall(
    'get',
    `/shuttle/${shuttleCode}?withSeats=true`
  );

  return response as Shuttle;
};

export const getBooking = async (bookingCode: string) => {
  const response = await apiCall('get', `/booking/${bookingCode}`);

  return response as {
    bookingCode: string;
    paymentCode: string;
    bookingStatus: string;
    amountPassengers: number;
    flightCodes: string[];
    passengers: [
      {
        firstName: string;
        lastName: string;
        passportCode: string;
      }
    ];
    phoneNumber: string;
  };
};

export const bookAFlight = async (params: {
  phoneNumber: string;
  passengers: {
    firstName: string;
    lastName: string;
    passportCode: string;
  }[];
  flights: [string];
  seats: string[];
}) => {
  const response = await apiCall('post', `/booking`, params);

  return response as {
    bookingCode: string;
  };
};
