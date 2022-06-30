import React from 'react';
import { ReactourStepContentArgs } from 'reactour';
import styled from '@emotion/styled';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { Button } from 'components/base';
import TextStep from './TextStep';

const Styled = {
  Note: styled.p`
    font-size: ${props => props.theme.sizes.xs};
    font-style: italic;
    opacity: 0.8;
    margin-bottom: 40px;
  `,
  Footer: styled.div`
    margin-top: 30px;
  `,
  LinkButton: styled(Button)`
    color: ${props => props.theme.colors.gray};
    padding: 0;
    min-width: auto;
    height: auto;
    margin-left: 40px;

    &:hover {
      color: ${props => props.theme.colors.blue};
    }
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

const WelcomeStep: React.FC<ReactourStepContentArgs> = props => {
  const { l } = usePrefixedTranslation('cmps.tour.WelcomeStep');
  const { appView } = useStore();

  const { Note, Footer, LinkButton, SmallButton } = Styled;
  return (
    <TextStep header={l('header')} showNext={false} {...props}>
      <p>{l('desc')}</p>
      <p>{l('tour')}</p>
      <p>
        {l('walkthrough1')}{' '}
        <a
          href="https://docs.lightning.engineering/lightning-network-tools/lightning-terminal"
          target="_blank"
          rel="noopener noreferrer"
        >
          {l('walkthrough2')}
        </a>{' '}
        {l('walkthrough3')}
      </p>
      <Note>{l('note')}</Note>
      <p>{l('question')}</p>
      <Footer>
        <SmallButton onClick={appView.tourGoToNext}>{l('yes')}</SmallButton>
        <LinkButton ghost borderless onClick={appView.closeTour}>
          {l('noThanks')}
        </LinkButton>
      </Footer>
    </TextStep>
  );
};

export default WelcomeStep;
