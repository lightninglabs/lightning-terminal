import React from 'react';
import styled from '@emotion/styled';

const Styled = {
  BackSection: styled.div``,
};

interface Props {
  onNext: () => void;
}

const SwapConfigStep: React.FC<Props> = ({ onNext }) => {
  return (
    <>
      <div>
        Swap Config Step
        <button onClick={onNext}>next</button>
      </div>
    </>
  );
};

export default SwapConfigStep;
