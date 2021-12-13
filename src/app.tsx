import './app.css';
import 'antd/dist/antd.dark.css';

import { notification, Spin } from 'antd';
import React from 'react';
import { render } from 'react-dom';
import { Route, Router, Switch } from 'wouter';

import { routes } from './definitions';
import { LandingBanner } from './view/banner/banner';
import { Order } from './view/order/order';
import { Page404 } from './view/page404/page404';
import { SeatPicker } from './view/seat-picker/seat-picker';

const App: React.FC = () => {
  React.useEffect(() => {
    notification.info({
      message: "That's not real",
      description:
        'You see just short study project, everything fake and nothing real',
    });
  }, []);

  return (
    <Router>
      <React.Suspense fallback={<Spin />}>
        <Switch>
          <Route path={routes.root}>
            <LandingBanner />
          </Route>
          <Route path={routes.purchase}>
            <SeatPicker />
          </Route>
          <Route path={routes.order}>
            <Order />
          </Route>
          <Route>
            <Page404 />
          </Route>
        </Switch>
      </React.Suspense>
    </Router>
  );
};

render(<App />, document.querySelector('#root'));
