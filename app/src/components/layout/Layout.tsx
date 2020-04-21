import React from 'react';
import { Background } from 'components/common/base';
import { Menu } from 'components/common/icons';
import { styled } from 'components/theme';
import Sidebar from './Sidebar';

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
  Aside: styled.aside`
    position: fixed;
    top: 0;
    height: 100vh;
    background-color: ${props => props.theme.colors.darkBlue};
    width: 285px;
    padding: 15px;
  `,
  Content: styled.div`
    margin-left: 285px;
    padding: 15px;
  `,
};

const Layout: React.FC = ({ children }) => {
  const { Container, MenuIcon, Aside, Content } = Styled;
  return (
    <Background>
      <Container>
        <MenuIcon />
        <Aside>
          <Sidebar />
        </Aside>
        <Content>
          <div className="container">{children}</div>
        </Content>
      </Container>
    </Background>
  );
};

export default Layout;
