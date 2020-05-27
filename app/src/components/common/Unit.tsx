import React, { useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import Big from 'big.js';
import { formatSats } from 'util/formatters';
import { useStore } from 'store';

interface Props {
  sats: Big;
  suffix?: boolean;
}

const Sats: React.FC<Props> = ({ sats, suffix = true }) => {
  const { settingsStore } = useStore();

  // memoize so that formatSats isn't called too often unnecessarily
  const text = useMemo(() => {
    return formatSats(sats, {
      unit: settingsStore.unit,
      withSuffix: suffix,
      lang: settingsStore.lang,
    });
  }, [sats, suffix, settingsStore.unit, settingsStore.lang]);

  return <>{text}</>;
};

export default observer(Sats);
