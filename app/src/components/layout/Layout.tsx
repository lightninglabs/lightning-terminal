import React from 'react';
import styled from '@emotion/styled/macro';
import Sidebar from './Sidebar';

const Styled = {
  Background: styled.div`
    min-height: 100vh;
    background-color: #252f4a;
  `,
  Container: styled.div`
    min-height: 100vh;
    width: 1440px;
    margin: 0 auto;
  `,
  Aside: styled.aside`
    position: fixed;
    top: 0;
    height: 100vh;
    background-color: #212133;
    width: 285px;
    padding: 15px;
  `,
  Content: styled.div`
    margin-left: 285px;
    padding: 15px;
  `,
};

const Layout: React.FC = ({ children }) => {
  const { Background, Container, Aside, Content } = Styled;
  return (
    <Background>
      <Container>
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
