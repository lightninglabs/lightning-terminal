import React, { useEffect } from 'react';

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

  return <div>Swap Processing Step</div>;
};

export default SwapProcessingStep;
