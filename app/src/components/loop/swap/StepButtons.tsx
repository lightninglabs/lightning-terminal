import React from 'react';
import styled from '@emotion/styled';
import { Button } from 'components/common/base';

const Styled = {
  Wrapper: styled.div`
    text-align: right;
  `,
};

interface Props {
  onCancel: () => void;
  onNext: () => void;
}

const StepButtons: React.FC<Props> = ({ onCancel, onNext }) => {
  const { Wrapper } = Styled;
  return (
    <Wrapper>
      <Button ghost borderless onClick={onCancel}>
        Cancel
      </Button>
      <Button primary onClick={onNext}>
        Next
      </Button>
    </Wrapper>
  );
};

export default StepButtons;
