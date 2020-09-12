import React from 'react';
import { observer } from 'mobx-react-lite';
import { HeaderFour } from 'components/base';
import { styled } from 'components/theme';

const Styled = {
  Wrapper: styled.section`
    flex: 4;
    padding: 15px;
    margin: 15px 0;
    background-color: ${props => props.theme.colors.overlay};
    border-radius: 4px;
  `,
};

const OrderForm: React.FC = () => {
  const { Wrapper } = Styled;
  return (
    <Wrapper>
      <HeaderFour>TODO: Order Form</HeaderFour>
    </Wrapper>
  );
};

export default observer(OrderForm);
