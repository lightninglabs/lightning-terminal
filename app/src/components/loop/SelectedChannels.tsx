import React from 'react';
import styled from '@emotion/styled';
import { usePrefixedTranslation } from 'hooks';
import { Pill } from 'components/base';

const Styled = {
  Wrapper: styled.span`
    /* display: flex;
    justify-content: center; */
  `,
};

interface Props {
  count: number;
  className?: string;
}

const SelectedChannels: React.FC<Props> = ({ count, className }) => {
  const { l } = usePrefixedTranslation('cmps.loop.SelectedChannels');

  const label =
    count === 0
      ? l('useAnyChannel')
      : count === 1
      ? l('channelSelected')
      : l('channelsSelected');

  const { Wrapper } = Styled;
  return (
    <Wrapper className={className}>
      {count > 0 && <Pill>{count}</Pill>}
      <span>{label}</span>
    </Wrapper>
  );
};

export default SelectedChannels;
