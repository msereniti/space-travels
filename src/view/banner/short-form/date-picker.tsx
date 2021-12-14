import { DatePicker, message } from 'antd';
import dayjs from 'dayjs';
import { action, observable, runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import moment from 'moment';
import React from 'react';

import { getFlights } from '../../../api';
import { Flight } from '../../../definitions';
import { store } from '../../../store';

const flightDatePickerStore = observable({
  isLoading: false,
  availableDates: {},
} as {
  isLoading: boolean;
  availableDates: Record<number, Flight>;
});

const makeDateKey = (date: any) => dayjs(date).startOf('day').valueOf();

export const FlightDatePicker: React.FC = observer(() => {
  const isLoading = flightDatePickerStore.isLoading;
  const destination = store.pickedPlanet;
  const value = store.departureDate
    ? moment(store.departureDate as any)
    : undefined;

  const startOfMonth = dayjs((value as any) || Date.now())
    .startOf('month')
    .valueOf();

  const loadAvailableDates = React.useCallback(async () => {
    runInAction(() => {
      flightDatePickerStore.availableDates = {};
      flightDatePickerStore.isLoading = true;
    });
    try {
      const { flightsTo } = await getFlights(
        destination!,
        startOfMonth - 1000 * 60 * 60 * 24 * 10,
        startOfMonth + 1000 * 60 * 60 * 24 * (30 + 10)
      );

      runInAction(() => {
        for (const flight of flightsTo) {
          const dateKey = makeDateKey(flight.actualDepartureTime);

          flightDatePickerStore.availableDates[dateKey] = flight;
        }
      });
    } catch (error) {
      if (error instanceof Error) {
        message.error(error);
      }
    }

    runInAction(() => {
      flightDatePickerStore.isLoading = false;
    });
  }, [destination, startOfMonth]);
  const handleChange = React.useCallback(
    action((date: any) => {
      store.departureDate = date.valueOf();
      store.flight = flightDatePickerStore.availableDates[makeDateKey(date)];
      loadAvailableDates();
    }),
    [loadAvailableDates]
  );

  return (
    <DatePicker
      className="short-form-date-picker"
      placeholder={'Flight date'}
      size="large"
      allowClear={false}
      disabledDate={(date: any) => {
        if (isLoading) return true;
        const dateKey = date.startOf('day').valueOf();

        return !flightDatePickerStore.availableDates[dateKey];
      }}
      onOpenChange={(open) => open && loadAvailableDates()}
      value={value}
      onChange={handleChange}
    />
  );
});
