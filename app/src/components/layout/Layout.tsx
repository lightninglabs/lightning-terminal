import React from 'react';
import { observer } from 'mobx-react-lite';
import { Global, Theme } from '@emotion/react';
import styled from '@emotion/styled';
import { useStore } from 'store';
import { Background, Menu } from 'components/base';
import Sidebar from './Sidebar';

interface CollapsedProps {
  collapsed: boolean;
  fullWidth?: boolean;
}

const GlobalStyles = (theme: Theme) => `
  .rc-select-dropdown {
    padding-top: 10px;
    background-color: transparent;

    & > div {
      color: ${theme.colors.offWhite};
      background-color: ${theme.colors.lightBlue};
      border-width: 0;
      border-radius: 8px;
      box-shadow: 0px 16px 16px rgba(0, 0, 0, 0.15);
      overflow: hidden;
    }
  }

  .rc-select-item {
    color: ${theme.colors.white};
    font-family: ${theme.fonts.open.regular};
    font-weight: 600;
    font-size: ${theme.sizes.s};
    line-height: 24px;
    padding: 16px;
    border-bottom: 1px solid ${theme.colors.paleBlue};

    &:last-of-type {
      border-bottom: none;
    }

    &:hover {
      color: ${theme.colors.white};
      background-color: ${theme.colors.blue};
      cursor: pointer;
    }

    & > .rc-select-item-option-state {
        top: 16px;
        right: 12px;
      }
  }

  .ReactCollapse--collapse {
    transition: height 500ms;
  }
`;

const Styled = {
  Container: styled.div<{ fullWidth: boolean }>`
    position: relative;
    height: 100%;
    max-width: ${props => (props.fullWidth ? '100%' : '1440px')};
    width: ${props => (props.fullWidth ? '100%' : '100%')};
    margin: 0 auto;
  `,
  Hamburger: styled.span<CollapsedProps>`
    display: inline-block;
    position: ${props => (props.collapsed ? 'absolute' : 'fixed')};
    top: 35px;
    margin-left: 10px;
    z-index: 2;
    padding: 4px;

    &:hover {
      color: ${props => props.theme.colors.blue};
      background-color: ${props => props.theme.colors.offWhite};
      border-radius: 24px;
      cursor: pointer;
    }
  `,
  Aside: styled.aside<CollapsedProps>`
    position: fixed;
    top: 0;
    height: 100%;
    z-index: 1;
    background-color: ${props => props.theme.colors.darkBlue};
    overflow: hidden;

    /* change sidebar dimensions based on collapsed toggle */
    width: ${props => (props.collapsed ? '0' : '285px')};
    padding: ${props => (props.collapsed ? '0' : '0 15px')};
    transition: all 0.2s;

    /* set a width on the child to improve the collapse animation */
    & > div {
      width: 255px;
    }
  `,
  Content: styled.div<CollapsedProps>`
    height: 100%;
    margin-left: ${props => (props.collapsed || props.fullWidth ? '0' : '285px')};
    padding: ${props => (props.fullWidth ? '0' : '0 15px')};
    transition: ${props => (props.fullWidth ? '0' : 'all 0.2s')};

    @media (max-width: 1200px) {
      margin-left: 0;
    }
  `,
  Fluid: styled.div`
    height: 100%;
  `,
};

export const Layout: React.FC = ({ children }) => {
  const { settingsStore, appView } = useStore();

  const { Container, Hamburger, Aside, Content, Fluid } = Styled;
  return (
    <Background>
      <Container fullWidth={appView.fullWidth}>
        <Hamburger
          collapsed={!settingsStore.sidebarVisible}
          onClick={settingsStore.toggleSidebar}
        >
          <Menu size="large" />
        </Hamburger>
        <Aside collapsed={!settingsStore.sidebarVisible}>
          <Sidebar />
        </Aside>
        <Content collapsed={!settingsStore.sidebarVisible} fullWidth={appView.fullWidth}>
          <Fluid className="container-fluid">{children}</Fluid>
        </Content>
      </Container>
      <Global styles={GlobalStyles} />
    </Background>
  );
};

export default observer(Layout);
