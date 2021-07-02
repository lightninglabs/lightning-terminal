import React from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { Section } from 'components/base';
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
  Empty: styled.div`
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    color: ${props => props.theme.colors.gray};
  `,
};

const BatchSection: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.pool.BatchSection');
  const { batchesView } = useStore();

  const { Section, Empty } = Styled;
  return (
    <Section>
      <BatchStats />
      <BatchControls />
      {batchesView.isEmpty ? (
        <Empty>{l('empty')}</Empty>
      ) : batchesView.viewMode === 'chart' ? (
        <BatchChart />
      ) : (
        <BatchList />
      )}
    </Section>
  );
};

export default observer(BatchSection);
