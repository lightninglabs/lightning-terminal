import React from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { usePrefixedTranslation } from 'hooks';
import { ArrowLeft } from 'components/base';
import Tip from 'components/common/Tip';

const Styled = {
  Wrapper: styled.section<{ sidebar?: boolean }>`
    display: flex;
    min-height: 360px;
    padding: 30px;
    background-color: ${props => props.theme.colors.darkBlue};
    border-radius: 35px;
    box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.5);
    margin-left: ${props => (props.sidebar ? '0' : '40px')};
  `,
  Nav: styled.div`
    width: 36px;
  `,
  Content: styled.div`
    flex-grow: 1;
    display: flex;
    align-items: stretch;
    flex-direction: row;
  `,
};

interface Props {
  sidebar?: boolean;
  onBackClick?: () => void;
}

const Wizard: React.FC<Props> = ({ sidebar, onBackClick, children }) => {
  const { l } = usePrefixedTranslation('cmps.common.Wizard');

  const { Wrapper, Nav, Content } = Styled;
  return (
    <Wrapper sidebar={sidebar}>
      <Nav>
        <Tip overlay={l('backTip')}>
          <ArrowLeft onClick={onBackClick} />
        </Tip>
      </Nav>
      <Content>{children}</Content>
    </Wrapper>
  );
};

export default observer(Wizard);
