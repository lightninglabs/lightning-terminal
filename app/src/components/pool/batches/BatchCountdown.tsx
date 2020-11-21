import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { formatTime } from 'util/formatters';
import LoaderLines from 'components/common/LoaderLines';
import Stat from 'components/common/Stat';
import { styled } from 'components/theme';

const getSecsUntil = (timeSecs: number) => {
  // get the current time in seconds
  const nowSecs = Math.ceil(Date.now() / 1000);
  // calculate the difference, ensuring it doesn't go negative
  return Math.max(0, timeSecs - nowSecs);
};

const Styled = {
  LoaderLines: styled(LoaderLines)`
    .line {
      margin: 10px 1px;
      height: 10px;
    }
  `,
};

interface Props {
  label: string;
  timestamp: number;
  className?: string;
}

const BatchCountdown: React.FC<Props> = ({ label, timestamp, className }) => {
  const [secondsLeft, setSecondsLeft] = useState(getSecsUntil(timestamp));

  useEffect(() => {
    const interval = setInterval(() => {
      // update our state
      setSecondsLeft(getSecsUntil(timestamp));
    }, 1000);

    // cleanup when the effect is disposed
    return () => clearInterval(interval);
  }, [timestamp]); // re-run this effect if the timestamp changes

  const { LoaderLines } = Styled;
  return (
    <Stat
      label={label}
      value={secondsLeft === 0 ? <LoaderLines /> : formatTime(secondsLeft)}
      positive={secondsLeft > 180}
      warn={secondsLeft > 60}
      negative={secondsLeft > 0}
      className={className}
    />
  );
};

export default observer(BatchCountdown);
