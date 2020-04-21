import React from 'react';
import usePrefixedTranslation from 'hooks/usePrefixedTranslation';
import { PageTitle } from 'components/common/text';

const LoopPage: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.loop.LoopPage');

  return (
    <>
      <PageTitle>{l('pageTitle')}</PageTitle>
    </>
  );
};

export default LoopPage;
