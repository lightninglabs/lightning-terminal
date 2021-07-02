import React from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import confirmJson from 'assets/animations/confirm.json';
import { usePrefixedTranslation } from 'hooks';
import { HeaderFour } from 'components/base';
import Animation from 'components/common/Animation';

const Styled = {
  Wrapper: styled.section`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
  `,
  ConfirmAnimation: styled(Animation)`
    width: 200px;
    height: 200px;
  `,
};

const SidecarComplete: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.loop.sidecar.SidecarComplete');

  const { Wrapper, ConfirmAnimation } = Styled;
  return (
    <Wrapper>
      <ConfirmAnimation animationData={confirmJson} />
      <HeaderFour>{l('success')}</HeaderFour>
      <div>{l('notice')}</div>
    </Wrapper>
  );
};

export default observer(SidecarComplete);
