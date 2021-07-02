import React from 'react';
import { ReactourStepContentArgs } from 'reactour';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import confirmJson from 'assets/animations/confirm.json';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { Button, HeaderThree } from 'components/base';
import Animation from 'components/common/Animation';
import TextStep from './TextStep';

const Styled = {
  Centered: styled.div`
    text-align: center;
  `,
  ConfirmAnimation: styled(Animation)`
    width: 200px;
    height: 200px;
    margin: auto;
  `,
  SmallButton: styled(Button)`
    font-size: ${props => props.theme.sizes.xs};
    min-width: auto;
    height: 34px;

    &:hover {
      color: ${props => props.theme.colors.offWhite};
      background-color: ${props => props.theme.colors.darkBlue};
    }
  `,
};

const SuccessStep: React.FC<ReactourStepContentArgs> = props => {
  const { l } = usePrefixedTranslation('cmps.tour.SuccessStep');
  const { appView } = useStore();

  const { Centered, ConfirmAnimation, SmallButton } = Styled;
  return (
    <TextStep showNext={false} {...props}>
      <ConfirmAnimation animationData={confirmJson} />
      <Centered>
        <HeaderThree>{l('header')}</HeaderThree>
        <p>{l('complete')}</p>
        <p>
          <SmallButton onClick={appView.closeTour}>{l('close')}</SmallButton>
        </p>
      </Centered>
    </TextStep>
  );
};

export default observer(SuccessStep);
