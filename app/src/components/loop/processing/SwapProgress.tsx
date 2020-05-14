import React from 'react';
import { observer } from 'mobx-react-lite';
import { SwapState, SwapType } from 'types/generated/loop_pb';
import { Swap } from 'store/models';
import { styled } from 'components/theme';

const { LOOP_IN, LOOP_OUT } = SwapType;
const {
  INITIATED,
  PREIMAGE_REVEALED,
  HTLC_PUBLISHED,
  SUCCESS,
  INVOICE_SETTLED,
} = SwapState;

// the order of steps for each of the swap types. used to calculate
// the percentage of progress made based on the current swap state
const progressSteps: Record<number, number[]> = {
  [LOOP_IN]: [INITIATED, HTLC_PUBLISHED, INVOICE_SETTLED, SUCCESS],
  [LOOP_OUT]: [INITIATED, PREIMAGE_REVEALED, SUCCESS],
};

const Styled = {
  Wrapper: styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
  `,
  Track: styled.div`
    height: 3px;
    background-color: #464d62;
    border: 1px solid #5a6276;
    border-radius: 2px;
  `,
  Fill: styled.div<{ state: number; pct: number }>`
    height: 1px;
    width: ${props => props.pct}%;
    background-color: ${props =>
      props.state === SUCCESS ? props.theme.colors.green : props.theme.colors.orange};
    transition: all 1s;
  `,
};

interface Props {
  swap: Swap;
}

const SwapProgress: React.FC<Props> = ({ swap }) => {
  const steps = progressSteps[swap.type];
  const pct = Math.floor(((steps.indexOf(swap.state) + 1) / steps.length) * 100);

  const { Wrapper, Track, Fill } = Styled;
  return (
    <Wrapper>
      <Track>
        <Fill state={swap.state} pct={pct} title={swap.stateLabel} />
      </Track>
    </Wrapper>
  );
};

export default observer(SwapProgress);
