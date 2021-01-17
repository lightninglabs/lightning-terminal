import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from 'store';
import { Section } from 'components/base';
import { styled } from 'components/theme';
import BatchChart from './batches/BatchChart';
import BatchControls from './batches/BatchControls';
import BatchList from './batches/BatchList';
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
  const { batchesView } = useStore();

  const { Section } = Styled;
  return (
    <Section>
      <BatchStats />
      <BatchControls />
      {batchesView.viewMode === 'chart' ? <BatchChart /> : <BatchList />}
    </Section>
  );
};

export default observer(BatchSection);
