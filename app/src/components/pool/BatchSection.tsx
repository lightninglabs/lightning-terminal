import React from 'react';
import { observer } from 'mobx-react-lite';
import { Section } from 'components/base';
import { styled } from 'components/theme';
import BatchList from './batches/BatchList';

const Styled = {
  Section: styled(Section)`
    flex: 1;
    display: flex;
    background-color: transparent;
  `,
};

const BatchSection: React.FC = () => {
  const { Section } = Styled;
  return (
    <Section>
      <BatchList />
    </Section>
  );
};

export default observer(BatchSection);
