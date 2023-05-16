import React from 'react';
import styled from '@emotion/styled';
import NodeStatus from 'components/NodeStatus';
import NavMenu from './NavMenu';

const Styled = {
  Wrapper: styled.div`
    padding-top: 120px;
  `,
};

const Sidebar: React.FC = () => {
  const { Wrapper } = Styled;

  return (
    <Wrapper>
      <NodeStatus />
      <NavMenu />
    </Wrapper>
  );
};
export default Sidebar;
