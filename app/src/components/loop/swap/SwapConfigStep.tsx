import React from 'react';

interface Props {
  onBack: () => void;
  onNext: () => void;
}

const SwapConfigStep: React.FC<Props> = ({ onBack, onNext }) => {
  return (
    <div>
      Swap Config Step
      <button onClick={onBack}>back</button>
      <button onClick={onNext}>next</button>
    </div>
  );
};

export default SwapConfigStep;
