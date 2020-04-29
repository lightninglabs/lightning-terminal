import React from 'react';

interface Props {
  onNext: () => void;
}

const SwapReviewStep: React.FC<Props> = ({ onNext }) => {
  return (
    <div>
      Swap Review Step
      <button onClick={onNext}>next</button>
    </div>
  );
};

export default SwapReviewStep;
