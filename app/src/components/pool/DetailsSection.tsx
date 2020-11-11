import React from 'react';
import { observer } from 'mobx-react-lite';
import { HeaderFour, Section } from 'components/base';
import { styled } from 'components/theme';
import OrdersList from './orders/OrdersList';

const Styled = {
  Section: styled(Section)`
    height: 400px;
  `,
};

const DetailsSection: React.FC = () => {
  const { Section } = Styled;
  return (
    <Section>
      <HeaderFour>Orders</HeaderFour>
      <OrdersList />
    </Section>
  );
};

export default observer(DetailsSection);
