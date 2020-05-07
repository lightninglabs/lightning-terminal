import React from 'react';
import { styled } from 'components/theme';

const Styled = {
  Wrapper: styled.div`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  `,
  ErrorMessage: styled.div`
    padding: 10px;
    color: red;
  `,
};

interface Props {
  swapError?: Error;
}

const SwapProcessingStep: React.FC<Props> = ({ swapError }) => {
  const { Wrapper, ErrorMessage } = Styled;
  return (
    <Wrapper>
      <span style={{ textAlign: 'center' }}>
        Swap Processing. Please wait...
        <br />
        ** show loader here **
      </span>
      {swapError && <ErrorMessage>{swapError.message}</ErrorMessage>}
    </Wrapper>
  );
};

export default SwapProcessingStep;
