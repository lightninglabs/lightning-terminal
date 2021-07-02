import React from 'react';
import { ReactourStepContentArgs } from 'reactour';
import styled from '@emotion/styled';
import { usePrefixedTranslation } from 'hooks';
import { Button, HeaderThree } from 'components/base';

const Styled = {
  Wrapper: styled.div`
    color: ${props => props.theme.colors.darkBlue};
    padding-top: 15px;
  `,
  Footer: styled.div`
    text-align: right;
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

interface Props extends ReactourStepContentArgs {
  i18nKey?: string;
  header?: string;
  showNext?: boolean;
}

const TextStep: React.FC<Props> = ({
  step,
  goTo,
  header,
  i18nKey,
  showNext = true,
  children,
}) => {
  const { l } = usePrefixedTranslation('cmps.tour.TextStep');

  let content = children;
  if (i18nKey) {
    // split multiple lines of text into paragraphs
    const text = l(i18nKey) as string;
    content = text
      .split('\n')
      .map((line, i) => <p key={i} dangerouslySetInnerHTML={{ __html: line }} />);
  }

  const { Wrapper, Footer, SmallButton } = Styled;
  return (
    <Wrapper>
      {header && <HeaderThree>{header}</HeaderThree>}
      {content}
      {showNext && (
        <Footer>
          <SmallButton onClick={() => goTo(step)}>{l('next')}</SmallButton>
        </Footer>
      )}
    </Wrapper>
  );
};

/**
 * Returns a function which creates a Reactour step using the additional parameters
 * @param i18nKey the key to lookup the i18n string
 * @param showNext indicates if the Next button should be displayed
 */
export const createTextStep = (i18nKey: string, showNext = true) => {
  const createFunc = (p: ReactourStepContentArgs) => (
    <TextStep i18nKey={i18nKey} showNext={showNext} {...p} />
  );

  return createFunc;
};

export default TextStep;
