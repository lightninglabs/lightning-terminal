import React from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import GraphVisualization from './GraphVisualization';

const Styled = {
  Wrapper: styled.div`
    height: 100%;
    width: 100%;
  `,
};

const HomePage: React.FC = () => {
  return (
    <Styled.Wrapper>
      <GraphVisualization />
    </Styled.Wrapper>
  );
};

export default observer(HomePage);
