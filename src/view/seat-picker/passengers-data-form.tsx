import { Button, Card, Form, Input } from 'antd';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useLocation, useRoute } from 'wouter';

import { routes } from '../../definitions';
import { store } from '../../store';
import { makePurchaseUrl } from '../utils';
import { SeatName } from './seat-name';

export const PassengersDataForm: React.FC = observer(() => {
  const initialValues = React.useMemo(() => {
    const { passengers } = store;
    const { phoneNumber } = store;

    runInAction(() => {
      if (passengers.length > store.owned.length) {
        passengers.length = store.owned.length;
      }
      if (store.owned.length > passengers.length) {
        passengers.push(
          ...Array(store.owned.length - passengers.length)
            .fill(0)
            .map(() => ({
              firstName: '',
              lastName: '',
              passportCode: '',
            }))
        );
      }
    });

    return { passengers, phoneNumber };
  }, [store.passengers, store.owned.length]);

  const currentRoute = useRoute(routes.purchase);
  const [, navigateTo] = useLocation();
  const handleCancel = React.useCallback(
    () => navigateTo(makePurchaseUrl(currentRoute, { action: '' })),
    [currentRoute]
  );
  const handleGoToConfirmation = React.useCallback(
    () => navigateTo(makePurchaseUrl(currentRoute, { action: 'confirmation' })),
    [currentRoute]
  );

  React.useEffect(() => {
    if (store.passengers.length === 0) {
      handleCancel();
    }
  }, [store.passengers.length, handleCancel]);

  return (
    <>
      <Form
        initialValues={initialValues}
        className="passengers-data-form"
        layout="vertical"
        onValuesChange={(_, { passengers, phoneNumber }) =>
          runInAction(() => {
            store.passengers = passengers;
            store.phoneNumber = phoneNumber;
          })
        }
        onFinish={handleGoToConfirmation}
        requiredMark="optional"
      >
        <Form.Item
          name="phoneNumber"
          label="Payer contact phone"
          validateTrigger={['onChange', 'onBlur']}
          className="passengers-data-form-item"
          rules={[
            {
              required: true,
              whitespace: true,
              message: "That's required field.",
            },
          ]}
        >
          <Input placeholder="x (xxx) xxx-xx-xx" />
        </Form.Item>
        <Form.List name="passengers">
          {(fields, _operations, { errors }) => (
            <>
              {fields.map((field, index) => (
                <Card
                  title={
                    <>
                      Passenger {index + 1} on seat{' '}
                      <SeatName seatId={store.owned[index]} />
                    </>
                  }
                >
                  <Form.Item required={false} key={field.key}>
                    <Form.Item
                      {...field}
                      name={[field.name, 'firstName']}
                      validateTrigger={['onChange', 'onBlur']}
                      className="passengers-data-form-item"
                      rules={[
                        {
                          required: true,
                          whitespace: true,
                          message: "That's required field.",
                        },
                      ]}
                    >
                      <Input placeholder="First name" />
                    </Form.Item>
                    <Form.Item
                      {...field}
                      name={[field.name, 'lastName']}
                      validateTrigger={['onChange', 'onBlur']}
                      className="passengers-data-form-item"
                      rules={[
                        {
                          required: true,
                          whitespace: true,
                          message: "That's required field.",
                        },
                      ]}
                    >
                      <Input placeholder="Last name" />
                    </Form.Item>
                    <Form.Item
                      {...field}
                      name={[field.name, 'passportCode']}
                      validateTrigger={['onChange', 'onBlur']}
                      className="passengers-data-form-item"
                      rules={[
                        {
                          required: true,
                          whitespace: true,
                          message: "That's required field.",
                        },
                      ]}
                    >
                      <Input placeholder="Identity document" />
                    </Form.Item>
                  </Form.Item>
                </Card>
              ))}
              <Form.Item>
                <Form.ErrorList errors={errors} />
              </Form.Item>
            </>
          )}
        </Form.List>
        <Form.Item className="passengers-form-footer">
          <Button onClick={handleCancel}>Back</Button>
          <Button type="primary" htmlType="submit">
            Go to confirmation
          </Button>
        </Form.Item>
      </Form>
    </>
  );
});
