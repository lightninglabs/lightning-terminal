import React from 'react';
import { ReactourStepContentArgs } from 'reactour';
import { observer } from 'mobx-react-lite';
import { usePrefixedTranslation } from 'hooks';
import StatusDot from 'components/common/StatusDot';
import TextStep from './TextStep';

const ChannelListStep: React.FC<ReactourStepContentArgs> = props => {
  const { l } = usePrefixedTranslation('cmps.tour.ChannelListStep');

  return (
    <TextStep {...props}>
      <p>{l('desc')}</p>
      <p>{l('traffic')}</p>
      <table>
        <tbody>
          {['error', 'warn', 'success'].map(s => (
            <tr key={s}>
              <td>
                <StatusDot status={s as any} />
              </td>
              <td>{l(s)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </TextStep>
  );
};

export default observer(ChannelListStep);
