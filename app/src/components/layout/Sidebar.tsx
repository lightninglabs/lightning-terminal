import React from 'react';
import NodeStatus from 'components/NodeStatus';
import { styled } from 'components/theme';
import NavMenu from './NavMenu';

const Styled = {
  Wrapper: styled.div`
    padding-top: 95px;
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
