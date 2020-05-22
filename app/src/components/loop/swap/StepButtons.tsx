import React from 'react';
import styled from '@emotion/styled';
import { usePrefixedTranslation } from 'hooks';
import { Button } from 'components/common/base';

const Styled = {
  Wrapper: styled.div`
    text-align: right;
  `,
};

interface Props {
  confirm?: boolean;
  onCancel: () => void;
  onNext: () => void;
}

const StepButtons: React.FC<Props> = ({ confirm, onCancel, onNext }) => {
  const { l } = usePrefixedTranslation('cmps.loop.swap.StepButtons');

  const { Wrapper } = Styled;
  return (
    <Wrapper>
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
