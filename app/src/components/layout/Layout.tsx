import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from 'store';
import { Background, Menu } from 'components/base';
import { styled } from 'components/theme';
import Sidebar from './Sidebar';

interface CollapsedProps {
  collapsed: boolean;
}

const Styled = {
  Container: styled.div`
    position: relative;
    min-height: 100vh;
    max-width: 1440px;
    width: 100%;
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
    height: 100vh;
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
    margin-left: ${props => (props.collapsed ? '0' : '285px')};
    padding: 0 15px;
    transition: all 0.2s;

    @media (max-width: 1200px) {
      margin-left: 0;
    }
  `,
};

export const Layout: React.FC = ({ children }) => {
  const { settingsStore } = useStore();

  const { Container, Hamburger, Aside, Content } = Styled;
  return (
    <Background>
      <Container>
        <Hamburger
          collapsed={!settingsStore.sidebarVisible}
          onClick={settingsStore.toggleSidebar}
        >
          <Menu size="large" />
        </Hamburger>
        <Aside collapsed={!settingsStore.sidebarVisible}>
          <Sidebar />
        </Aside>
        <Content collapsed={!settingsStore.sidebarVisible}>
          <div className="container-fluid">{children}</div>
        </Content>
      </Container>
    </Background>
  );
};

export default observer(Layout);
