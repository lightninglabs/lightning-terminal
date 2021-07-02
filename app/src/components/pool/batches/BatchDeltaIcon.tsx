import React, { ReactNode } from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { BatchDelta } from 'store/models/batch';
import { ArrowDownCircle, ArrowUpCircle, Dot } from 'components/base';

const Styled = {
  Wrapper: styled.span``,
  Positive: styled(ArrowUpCircle)`
    color: ${props => props.theme.colors.green};
  `,
  Neutral: styled(Dot)`
    color: ${props => props.theme.colors.gray};
  `,
  Negative: styled(ArrowDownCircle)`
    color: ${props => props.theme.colors.pink};
  `,
};

interface Props {
  delta: BatchDelta;
}

const BatchDeltaIcon: React.FC<Props> = ({ delta }) => {
  const { Wrapper, Positive, Neutral, Negative } = Styled;

  const cmps: Record<BatchDelta, ReactNode> = {
    positive: <Positive />,
    neutral: <Neutral />,
    negative: <Negative />,
  };

  return <Wrapper>{cmps[delta]}</Wrapper>;
};

export default observer(BatchDeltaIcon);
