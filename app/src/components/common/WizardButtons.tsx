import React from 'react';
import styled from '@emotion/styled';
import { usePrefixedTranslation } from 'hooks';
import { Button } from 'components/base';

const Styled = {
  Wrapper: styled.div`
    display: flex;
    justify-content: flex-end;
  `,
  ExtraContent: styled.div`
    flex: 1;
  `,
};

interface Props {
  onCancel: () => void;
  onNext: () => void;
  nextLabel?: string;
  extra?: React.ReactNode;
}

const WizardButtons: React.FC<Props> = ({ onCancel, onNext, nextLabel, extra }) => {
  const { l } = usePrefixedTranslation('cmps.common.WizardButtons');

  const { Wrapper, ExtraContent } = Styled;
  return (
    <Wrapper>
      <ExtraContent>{extra}</ExtraContent>
      <Button ghost borderless onClick={onCancel}>
        {l('common.cancel')}
      </Button>
      <Button primary ghost onClick={onNext}>
        {nextLabel || l('common.next')}
      </Button>
    </Wrapper>
  );
};

export default WizardButtons;
