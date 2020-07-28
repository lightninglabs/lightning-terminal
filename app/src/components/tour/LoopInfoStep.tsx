import React from 'react';
import { ReactourStepContentArgs } from 'reactour';
import { observer } from 'mobx-react-lite';
import { usePrefixedTranslation } from 'hooks';
import TextStep from './TextStep';

const LoopInfoStep: React.FC<ReactourStepContentArgs> = props => {
  const { l } = usePrefixedTranslation('cmps.tour.LoopInfoStep');

  return (
    <TextStep {...props}>
      <p>
        <strong>{l('new')}</strong>
      </p>
      <p>{l('desc')}</p>
      <p>
        {l('learn1')}{' '}
        <a
          href="https://lightning.engineering/loop"
          target="_blank"
          rel="noopener noreferrer"
        >
          {l('learn2')}
        </a>{' '}
        {l('learn3')}
      </p>
    </TextStep>
  );
};

export default observer(LoopInfoStep);
