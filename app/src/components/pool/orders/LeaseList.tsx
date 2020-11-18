import React from 'react';
import { observer } from 'mobx-react-lite';
import { ChannelStatus } from 'types/state';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { LeaseView } from 'store/views';
import { Scrollable } from 'components/base';
import SortableHeader from 'components/common/SortableHeader';
import Tip from 'components/common/Tip';
import { styled, Theme } from 'components/theme';
import { Table, TableCell, TableHeader, TableRow } from './OrderTable';

/** maps a lease status to the theme color */
const statusToColor = (theme: Theme, status: LeaseView['status']) => {
  switch (status) {
    case ChannelStatus.OPEN:
      return theme.colors.green;
    case ChannelStatus.OPENING:
    case ChannelStatus.CLOSING:
    case ChannelStatus.FORCE_CLOSING:
    case ChannelStatus.WAITING_TO_CLOSE:
      return theme.colors.gold;
    case ChannelStatus.UNKNOWN:
    case 'Closed':
      return theme.colors.pink;
    default:
      return '';
  }
};

const Styled = {
  Scrollable: styled(Scrollable)`
    padding-right: 15px;
  `,
  ChannelStatus: styled.span<{ status: LeaseView['status'] }>`
    color: ${props => statusToColor(props.theme, props.status)};
  `,
  Duration: styled.span<{ exceeded: boolean }>`
    color: ${props => (props.exceeded ? props.theme.colors.pink : 'inherit')};
  `,
};

const LeaseList: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.pool.orders.LeaseList');
  const { orderListView, settingsStore } = useStore();

  const { Scrollable, ChannelStatus, Duration } = Styled;
  return (
    <Scrollable>
      <Table>
        <thead>
          <tr>
            <TableHeader right>
              <SortableHeader<LeaseView>
                field="balances"
                sort={settingsStore.leaseSort}
                onSort={settingsStore.setLeaseSort}
              >
                {l('balances')}
              </SortableHeader>
            </TableHeader>
            <TableHeader right>
              <SortableHeader<LeaseView>
                field="apy"
                sort={settingsStore.leaseSort}
                onSort={settingsStore.setLeaseSort}
              >
                {l('apy')}
              </SortableHeader>
            </TableHeader>
            <TableHeader right>
              <SortableHeader<LeaseView>
                field="premium"
                sort={settingsStore.leaseSort}
                onSort={settingsStore.setLeaseSort}
              >
                {l('premium')}
              </SortableHeader>
            </TableHeader>
            <TableHeader right>
              <SortableHeader<LeaseView>
                field="status"
                sort={settingsStore.leaseSort}
                onSort={settingsStore.setLeaseSort}
              >
                {l('status')}
              </SortableHeader>
            </TableHeader>
            <TableHeader right>
              <SortableHeader<LeaseView>
                field="blocksSoFar"
                sort={settingsStore.leaseSort}
                onSort={settingsStore.setLeaseSort}
              >
                {l('duration')}
              </SortableHeader>
            </TableHeader>
            <TableHeader right>
              <SortableHeader<LeaseView>
                field="alias"
                sort={settingsStore.leaseSort}
                onSort={settingsStore.setLeaseSort}
              >
                {l('alias')}
              </SortableHeader>
            </TableHeader>
          </tr>
        </thead>
        <tbody>
          {orderListView.selectedLeases.map(lease => (
            <TableRow key={lease.channelPoint}>
              <TableCell right>{lease.balances}</TableCell>
              <TableCell right>{lease.apyLabel}</TableCell>
              <TableCell right>{lease.premium}</TableCell>
              <TableCell right>
                <ChannelStatus status={lease.status}>{lease.status}</ChannelStatus>
              </TableCell>
              <TableCell right>
                <Duration exceeded={lease.exceededDuration}>{lease.blocksSoFar}</Duration>{' '}
                / {lease.lease.channelDurationBlocks}
              </TableCell>
              <TableCell right>
                <Tip
                  overlay={lease.lease.channelRemoteNodeKey}
                  capitalize={false}
                  placement="left"
                >
                  <span>{lease.alias}</span>
                </Tip>
              </TableCell>
            </TableRow>
          ))}
        </tbody>
      </Table>
    </Scrollable>
  );
};

export default observer(LeaseList);
