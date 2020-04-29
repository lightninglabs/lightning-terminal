import React, { useEffect } from 'react';

interface Props {
  onBack: () => void;
  onFinish: () => void;
}

const SwapProcessingStep: React.FC<Props> = ({ onBack, onFinish }) => {
  useEffect(() => {
    setTimeout(() => {
      // wait for 3 secs then finish
      onFinish();
    }, 3000);
  }, [onFinish]);

  return (
    <div>
      Swap Processing Step
      <button onClick={onBack}>back</button>
    </div>
  );
};

export default SwapProcessingStep;
