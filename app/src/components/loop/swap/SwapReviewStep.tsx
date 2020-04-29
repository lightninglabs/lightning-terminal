import React from 'react';

interface Props {
  onBack: () => void;
  onNext: () => void;
}

const SwapReviewStep: React.FC<Props> = ({ onBack, onNext }) => {
  return (
    <div>
      Swap Review Step
      <button onClick={onBack}>back</button>
      <button onClick={onNext}>next</button>
    </div>
  );
};

export default SwapReviewStep;
