import useResizeObserver from '@react-hook/resize-observer';
import { action } from 'mobx';
import React from 'react';
import { useRoute } from 'wouter';

import { routes } from '../definitions';
import { store } from '../store';

export const easeInOut = (x: number) =>
  -(Math.cos(Math.PI * Math.min(x, 1)) - 1) / 2;

export const useWindowSize = () => {
  const getWindowSize = React.useCallback(
    () => ({ width: window.innerWidth, height: window.innerHeight }),
    []
  );
  const initWindowSize = React.useMemo(getWindowSize, [getWindowSize]);
  const [windowSize, setWindowSize] = React.useState(initWindowSize);
  const updateWindowSize = React.useCallback(
    () =>
      setWindowSize((prevWindowSize) => {
        const nextWindowSize = getWindowSize();

        if (
          nextWindowSize.width === prevWindowSize.width &&
          nextWindowSize.height === prevWindowSize.height
        )
          return prevWindowSize;

        return nextWindowSize;
      }),
    [setWindowSize, getWindowSize]
  );

  useResizeObserver(document.body, updateWindowSize);

  return windowSize;
};

export const toggleSeatOwnership = action((seatId: number) => {
  if (store.occupied.includes(seatId)) return;

  if (store.owned.includes(seatId)) {
    store.owned = store.owned.filter((ownedSeat) => ownedSeat !== seatId);
  } else {
    store.owned.push(seatId);
  }
});

export const formatPrice = (price: number) =>
  new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price);

export const makePurchaseUrl = (
  currentRoute: [boolean, object | null],
  providedParams: Partial<{
    flightCode: string;
    passengersCount: number;
    action: string;
  }>
) => {
  const currentParams = currentRoute[0] ? currentRoute[1] : {};

  const params: any = {
    action: '',
    ...currentParams,
    ...providedParams,
  };

  let url = routes.purchase;

  for (const param in params) {
    url = url.replace(new RegExp(`:${param}\\??`), params[param] ?? '');
  }

  return url;
};
