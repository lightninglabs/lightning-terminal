import React from 'react';
import { observer } from 'mobx-react-lite';
import { usePrefixedTranslation } from 'hooks';
import Loading from 'components/common/Loading';
import { styled } from 'components/theme';

const Styled = {
  Wrapper: styled.div`
    flex-grow: 1;
    display: flex;
    justify-content: space-between;
    padding-top: 5px;
  `,
};

const TicketProcessingStep: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.loop.sidecar.TicketProcessingStep');

  const { Wrapper } = Styled;
  return (
    <Wrapper>
      <Loading message={l('loadingMsg')} />
    </Wrapper>
  );
};

export default observer(TicketProcessingStep);
