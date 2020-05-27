import React from 'react';
import { useStore } from 'store';
import AlertContainer from 'components/common/AlertContainer';
import { Button } from 'components/common/base';

export default {
  title: 'Components/Alerts',
  component: AlertContainer,
  parameters: { centered: true },
};

export const Default = () => {
  const store = useStore();
  const handleClick = () => {
    store.uiStore.notify(
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
