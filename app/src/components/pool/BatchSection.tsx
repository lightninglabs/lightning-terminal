import React from 'react';
import { observer } from 'mobx-react-lite';
import { Section } from 'components/base';
import { styled } from 'components/theme';
import BatchChart from './batches/BatchChart';
import BatchD3Chart from './batches/BatchD3Chart';
import BatchesChart from './batches/BatchesChart';
import BatchList from './batches/BatchList';
import BatchStats from './batches/BatchStats';

const Styled = {
  Section: styled(Section)`
    flex: 1;
    flex-direction: column;
    display: flex;
    background-color: transparent;

    > div:last-of-type {
      /* display: none; */
    }
  `,
};

const BatchSection: React.FC = () => {
  const { Section } = Styled;
  return (
    <Section>
      <BatchStats />
      <BatchesChart />
      <BatchD3Chart />
      <BatchChart />
      <BatchList />
    </Section>
  );
};

export default observer(BatchSection);
