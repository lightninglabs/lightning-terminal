import React from 'react';
import { observer } from 'mobx-react-lite';
import { useActions, useStore } from 'store';
import { Background } from 'components/common/base';
import { Menu } from 'components/common/icons';
import { styled } from 'components/theme';
import Sidebar from './Sidebar';

interface CollapsedProps {
  collapsed: boolean;
}

const Styled = {
  Container: styled.div`
    position: relative;
    min-height: 100vh;
    width: 1440px;
    margin: 0 auto;
  `,
  MenuIcon: styled(Menu)`
    position: absolute;
    top: 20px;
    left: 20px;
    z-index: 1;
    cursor: pointer;
  `,
  Aside: styled.aside<CollapsedProps>`
    position: fixed;
    top: 0;
    height: 100vh;
    background-color: ${props => props.theme.colors.darkBlue};
    overflow: hidden;

    /* change sidebar dimensions based on collapsed toggle */
    width: ${props => (props.collapsed ? '0' : '285px')};
    padding: ${props => (props.collapsed ? '0' : '15px')};
    transition: all 0.2s;

    /* set a width on the child to improve the collapse animation */
    & > div {
      width: 255px;
    }
  `,
  Content: styled.div<CollapsedProps>`
    margin-left: ${props => (props.collapsed ? '0' : '285px')};
    padding: 15px;
    transition: all 0.2s;
  `,
};

const Layout: React.FC = ({ children }) => {
  const { sidebarCollapsed } = useStore();
  const { app } = useActions();

  const { Container, MenuIcon, Aside, Content } = Styled;
  return (
    <Background>
      <Container>
        <MenuIcon title="menu" onClick={app.toggleSidebar} />
        <Aside collapsed={sidebarCollapsed}>
          <Sidebar />
        </Aside>
        <Content collapsed={sidebarCollapsed}>
          <div className="container">{children}</div>
        </Content>
      </Container>
    </Background>
  );
};

export default observer(Layout);
