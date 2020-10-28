import React from 'react';
import { observer } from 'mobx-react-lite';
import { HeaderFour, Section } from 'components/base';
import { styled } from 'components/theme';

const Styled = {
  Section: styled(Section)`
    height: 400px;
  `,
};

const DetailsSection: React.FC = () => {
  const { Section } = Styled;
  return (
    <Section>
      <HeaderFour>TODO: Order and Batch Details</HeaderFour>
    </Section>
  );
};

export default observer(DetailsSection);
