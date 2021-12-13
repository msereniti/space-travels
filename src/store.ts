import { observable } from 'mobx';

import { Flight, KnownPlanet, Passenger } from './definitions';

export const store = observable({
  pickedPlanet: 'mars',
  pickedSeats: [],
  submittingShortForm: false,
  phoneNumber: '',
  passengersCount: 1,
  departureDate: undefined,
  shuttle: undefined,
  highlightedSeat: null,
  occupied: [],
  owned: [],
  passengers: [],
  flight: undefined,
} as {
  pickedPlanet?: KnownPlanet;
  pickedSeats: number[];
  submittingShortForm: boolean;
  phoneNumber: string;
  passengersCount: number;
  departureDate?: number;
  shuttle?: {
    shuttleName: string;
    shuttleCode: string;
    shuttleModel: string;
    shuttleRange: number;
    seats: string[];
  };
  highlightedSeat: number | null;
  occupied: number[];
  owned: number[];
  passengers: Passenger[];
  flight?: Flight;
});
