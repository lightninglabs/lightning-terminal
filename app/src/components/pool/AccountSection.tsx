import React from 'react';
import { observer } from 'mobx-react-lite';
import { HeaderFour } from 'components/base';
import { styled } from 'components/theme';

const Styled = {
  Wrapper: styled.section`
    flex: 1;
    min-height: 300px;
    padding: 15px;
    margin: 15px 0;
    background-color: ${props => props.theme.colors.overlay};
    border-radius: 4px;
  `,
};

const AccountSection: React.FC = () => {
  const { Wrapper } = Styled;
  return (
    <Wrapper>
      <HeaderFour>TODO: Account</HeaderFour>
    </Wrapper>
  );
};

export default observer(AccountSection);
