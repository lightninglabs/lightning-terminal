import React from 'react';
import { observer } from 'mobx-react-lite';
import { Global, Theme } from '@emotion/react';
import styled from '@emotion/styled';
import { Background } from 'components/base';
import Sidebar from './Sidebar';

const SIDEBAR_WIDTH = '220px';

const GlobalStyles = (theme: Theme) => `
  .rc-select-dropdown {
    padding-top: 6px;
    background-color: transparent;

    & > div {
      color: ${theme.colors.offWhite};
      background-color: ${theme.colors.lightBlue};
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      overflow: hidden;
    }
  }

  .rc-select-item {
    color: ${theme.colors.offWhite};
    font-family: 'Inter', sans-serif;
    font-weight: 500;
    font-size: ${theme.sizes.xs};
    line-height: 20px;
    padding: 10px 14px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);

    &:last-of-type {
      border-bottom: none;
    }

    &:hover {
      color: ${theme.colors.white};
      background-color: rgba(255, 255, 255, 0.06);
      cursor: pointer;
    }

    & > .rc-select-item-option-state {
      top: 10px;
      right: 10px;
    }
  }

  .ReactCollapse--collapse {
    transition: height 300ms ease;
  }
`;

const Styled = {
  Container: styled.div`
    display: flex;
    height: 100%;
    width: 100%;
  `,
  Aside: styled.aside`
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    width: ${SIDEBAR_WIDTH};
    z-index: 10;
    background-color: ${props => props.theme.colors.darkBlue};
    border-right: 1px solid rgba(255, 255, 255, 0.06);
    display: flex;
    flex-direction: column;
  `,
  Content: styled.div`
    flex: 1;
    height: 100%;
    margin-left: ${SIDEBAR_WIDTH};
    overflow: auto;
  `,
  Main: styled.div`
    height: 100%;
    padding: 0;
  `,
};

export const Layout: React.FC = ({ children }) => {
  const { Container, Aside, Content, Main } = Styled;
  return (
    <Background>
      <Container>
        <Aside>
          <Sidebar />
        </Aside>
        <Content>
          <Main>{children}</Main>
        </Content>
      </Container>
      <Global styles={GlobalStyles} />
    </Background>
  );
};

export default observer(Layout);
