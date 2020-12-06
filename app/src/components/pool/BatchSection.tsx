import React from 'react';
import { observer } from 'mobx-react-lite';
import { Section } from 'components/base';
import { styled } from 'components/theme';
import BatchChart from './batches/BatchChart';
import BatchStats from './batches/BatchStats';

const Styled = {
  Section: styled(Section)`
    flex: 1;
    flex-direction: column;
    display: flex;
    background-color: transparent;
  `,
};

const BatchSection: React.FC = () => {
  const { Section } = Styled;
  return (
    <Section>
      <BatchStats />
      <BatchChart />
    </Section>
  );
};

export default observer(BatchSection);
