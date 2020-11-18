import React from 'react';
import { observer } from 'mobx-react-lite';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { LeaseView } from 'store/views';
import { Scrollable } from 'components/base';
import SortableHeader from 'components/common/SortableHeader';
import Tip from 'components/common/Tip';
import { styled } from 'components/theme';
import { Table, TableCell, TableHeader, TableRow } from './OrderTable';

const Styled = {
  Scrollable: styled(Scrollable)`
    padding-right: 15px;
  `,
};

const LeaseList: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.pool.orders.LeaseList');
  const { orderListView, settingsStore } = useStore();

  const { Scrollable } = Styled;
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
                field="duration"
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
              <TableCell right>{lease.status}</TableCell>
              <TableCell right>{lease.duration}</TableCell>
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
