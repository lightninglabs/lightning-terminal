import React, { useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { usePrefixedTranslation } from 'hooks';
import { BLOCKS_PER_DAY } from 'util/constants';

interface Props {
  blocks: number;
}

const BlockTime: React.FC<Props> = ({ blocks }) => {
  const { l } = usePrefixedTranslation('cmps.common.BlockTime');

  const time = useMemo(() => {
    if (blocks <= 0) return '';

    const days = Math.round(blocks / BLOCKS_PER_DAY);
    const weeks = Math.floor(days / 7);
    if (days <= 1) {
      const hours = Math.floor(blocks / 6);
      return `~${hours} ${l('common.hours', { count: hours })}`;
    } else if (days < 14 || days % 30 === 0) {
      return `~${days} ${l('common.days', { count: days })}`;
    } else if (weeks < 8) {
      return `~${weeks} ${l('common.weeks', { count: weeks })}`;
    }
    const months = weeks / 4.3;

    return `~${months.toFixed(1)} ${l('common.months', { count: months })}`;
  }, [blocks]);

  return <>{time}</>;
};

export default observer(BlockTime);
