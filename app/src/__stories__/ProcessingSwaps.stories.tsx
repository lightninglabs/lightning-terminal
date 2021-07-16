import React, { useEffect } from 'react';
import { observable } from 'mobx';
import * as LOOP from 'types/generated/loop_pb';
import Big from 'big.js';
import { loopListSwaps } from 'util/tests/sampleData';
import { useStore } from 'store';
import { Swap } from 'store/models';
import ProcessingSwaps from 'components/loop/processing/ProcessingSwaps';

const { LOOP_IN, LOOP_OUT } = LOOP.SwapType;
const {
  INITIATED,
  PREIMAGE_REVEALED,
  HTLC_PUBLISHED,
  SUCCESS,
  INVOICE_SETTLED,
  FAILED,
} = LOOP.SwapState;

export default {
  title: 'Components/Processing Swaps',
  component: ProcessingSwaps,
  parameters: { contained: true },
  decorators: [
    (StoryFn: any) => (
      <div style={{ padding: 100 }}>
        <StoryFn />
      </div>
    ),
  ],
};

// the multiple variations of swap types and states
const swapProps = [
  [LOOP_IN, INITIATED],
  [LOOP_IN, HTLC_PUBLISHED],
  [LOOP_IN, INVOICE_SETTLED],
  [LOOP_IN, SUCCESS],
  [LOOP_IN, FAILED],
  [LOOP_OUT, INITIATED],
  [LOOP_OUT, PREIMAGE_REVEALED],
  [LOOP_OUT, SUCCESS],
  [LOOP_OUT, FAILED],
];
// const mockSwap = loopListSwaps.swapsList[0];
const mockSwap = (type: number, state: number, id?: string) => {
  const swap = new Swap(loopListSwaps.swapsList[0]);
  swap.id = `${id || ''}${swap.id}`;
  swap.type = type;
  swap.state = state;
  swap.lastUpdateTime = Big(Date.now() * 1000 * 1000);
  return swap;
};
// create a list of swaps to use for stories
const createSwaps = () => {
  return [...Array(9)]
    .map((_, i) => mockSwap(swapProps[i][0], swapProps[i][1], `${i}`))
    .reduce((map, swap) => {
      map.set(swap.id, swap);
      return map;
    }, observable.map());
};

let timer: NodeJS.Timeout;
const delay = (timeout: number) =>
  new Promise(resolve => (timer = setTimeout(resolve, timeout)));

export const AllSwapStates = () => {
  const store = useStore();
  store.swapStore.swaps = createSwaps();
  return <ProcessingSwaps />;
};

export const LoopInProgress = () => {
  const store = useStore();
  const swap = mockSwap(LOOP_IN, INITIATED);
  store.swapStore.swaps = observable.map({ [swap.id]: swap });

  useEffect(() => {
    const startTransitions = async () => {
      await delay(2000);
      swap.state = HTLC_PUBLISHED;
      await delay(2000);
      swap.state = INVOICE_SETTLED;
      await delay(2000);
      swap.state = SUCCESS;
      await delay(2000);
      swap.initiationTime = Big(0);
    };

    startTransitions();
    return () => clearTimeout(timer);
  }, []);

  return <ProcessingSwaps />;
};

export const LoopOutProgress = () => {
  const store = useStore();
  const swap = mockSwap(LOOP_OUT, INITIATED);
  store.swapStore.swaps = observable.map({ [swap.id]: swap });

  useEffect(() => {
    const startTransitions = async () => {
      await delay(2000);
      swap.state = PREIMAGE_REVEALED;
      await delay(2000);
      swap.state = SUCCESS;
      await delay(2000);
      swap.initiationTime = Big(0);
    };

    startTransitions();
    return () => clearTimeout(timer);
  }, []);

  return <ProcessingSwaps />;
};

export const Complete = () => {
  return <ProcessingSwaps />;
};
