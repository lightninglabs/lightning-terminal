import React from 'react';
import { observer } from 'mobx-react-lite';
import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';

const pulsing1 = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.35; }
  100% { opacity: 0.35; }
`;

const pulsing2 = keyframes`
  0% { opacity: 0.35; }
  50% { opacity: 1; }
  100% { opacity: 0.35; }
`;

const pulsing3 = keyframes`
  0% { opacity: 0.35; }
  50% { opacity: 0.35; }
  100% { opacity: 1; }
`;

const Styled = {
  Wrapper: styled.div`
    display: inline-flex;
    justify-content: center;
  `,
  Line: styled.div`
    border-top: 3px solid ${props => props.theme.colors.offWhite};
    width: 15px;
    margin: 20px 1px;

    &.line-1 {
      animation: ${pulsing1} 0.8s linear infinite alternate;
    }

    &.line-2 {
      animation: ${pulsing2} 0.8s linear infinite alternate;
    }

    &.line-3 {
      animation: ${pulsing3} 0.8s linear infinite alternate;
    }
  `,
};

interface Props {
  className?: string;
}

const LoaderLines: React.FC<Props> = ({ className }) => {
  const { Wrapper, Line } = Styled;
  return (
    <Wrapper className={className}>
      {[1, 2, 3].map(i => (
        <Line key={i} className={`line line-${i}`}></Line>
      ))}
    </Wrapper>
  );
};

export default observer(LoaderLines);
