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
  confirm?: boolean;
  onCancel: () => void;
  onNext: () => void;
  extra?: React.ReactNode;
}

const StepButtons: React.FC<Props> = ({ confirm, onCancel, onNext, extra }) => {
  const { l } = usePrefixedTranslation('cmps.loop.swap.StepButtons');

  const { Wrapper, ExtraContent } = Styled;
  return (
    <Wrapper>
      <ExtraContent>{extra}</ExtraContent>
      <Button ghost borderless onClick={onCancel}>
        {l('cancel')}
      </Button>
      <Button primary ghost onClick={onNext}>
        {confirm ? l('confirm') : l('next')}
      </Button>
    </Wrapper>
  );
};

export default StepButtons;
