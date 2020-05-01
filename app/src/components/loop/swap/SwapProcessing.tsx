import React, { useEffect } from 'react';
import { styled } from 'components/theme';

const Styled = {
  Wrapper: styled.div`
    flex-grow: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  `,
};

interface Props {
  onFinish: () => void;
}

const SwapProcessingStep: React.FC<Props> = ({ onFinish }) => {
  useEffect(() => {
    setTimeout(() => {
      // wait for 3 secs then finish
      onFinish();
    }, 3000);
  }, [onFinish]);

  const { Wrapper } = Styled;
  return (
    <Wrapper>
      <span style={{ textAlign: 'center' }}>
        Swap Processing. Please wait...
        <br />
        ** show loader here **
      </span>
    </Wrapper>
  );
};

export default SwapProcessingStep;
