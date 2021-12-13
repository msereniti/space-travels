import { Button, Result } from 'antd';
import { Link } from 'wouter';
import React from 'react';

export const Page404: React.FC = () => {
  return (
    <Result
      status="error"
      title="Page not found"
      extra={[
        <Link href="/">
          <Button type="primary">Go to main page</Button>
        </Link>,
      ]}
    />
  );
};
