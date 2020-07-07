import React from 'react';
import { observer } from 'mobx-react-lite';
import { usePrefixedTranslation } from 'hooks';
import Loading from 'components/common/Loading';

const SwapProcessingStep: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.loop.swap.SwapProcessingStep');

  return <Loading message={l('loadingMsg')} />;
};

export default observer(SwapProcessingStep);
