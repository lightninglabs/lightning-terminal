import React from 'react';
import { ReactourStepContentArgs } from 'reactour';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { usePrefixedTranslation } from 'hooks';
import { Bitcoin, Bolt } from 'components/base';
import TextStep from './TextStep';

const Styled = {
  Legend: styled.p`
    > span {
      display: flex;
      margin-top: 10px;
    }
  `,
  BoltIcon: styled(Bolt)`
    background-color: ${props => props.theme.colors.darkBlue};
    color: ${props => props.theme.colors.white};
    border-radius: 32px;
    margin-right: 10px;
  `,
  BitcoinIcon: styled(Bitcoin)`
    background-color: ${props => props.theme.colors.darkBlue};
    color: ${props => props.theme.colors.white};
    border-radius: 32px;
    margin-right: 10px;
  `,
};

const NodeStatusStep: React.FC<ReactourStepContentArgs> = props => {
  const { l } = usePrefixedTranslation('cmps.tour.NodeStatusStep');

  const { Legend, BoltIcon, BitcoinIcon } = Styled;
  return (
    <TextStep {...props}>
      <p>{l('desc')}</p>
      <Legend>
        <span>
          <BoltIcon title="bolt" size="small" />
          {l('ln')}
        </span>
        <span>
          <BitcoinIcon title="on-chain" size="small" />
          {l('onchain')}
        </span>
      </Legend>
    </TextStep>
  );
};

export default observer(NodeStatusStep);
