import React from 'react';
import { useStore } from 'store';
import { Button } from 'components/base';
import AlertContainer from 'components/common/AlertContainer';

export default {
  title: 'Components/Alerts',
  component: AlertContainer,
  parameters: { centered: true },
};

export const Default = () => {
  const store = useStore();
  const handleClick = () => {
    store.appView.notify(
      'This is a sample message to be displayed inside of a toast alert',
      'Sample Alert Title',
    );
  };

  return (
    <>
      <Button onClick={handleClick}>Show Alert</Button>
      <AlertContainer />
    </>
  );
};
