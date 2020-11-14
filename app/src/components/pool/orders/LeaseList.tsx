import React from 'react';
import { observer } from 'mobx-react-lite';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { LeaseView } from 'store/views';
import SortableHeader from 'components/common/SortableHeader';
import { Table, TableCell, TableHeader, TableRow } from './OrderTable';

const LeaseList: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.pool.orders.LeaseList');
  const { orderListView, settingsStore } = useStore();

  return (
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
            <TableCell right>{lease.alias}</TableCell>
          </TableRow>
        ))}
      </tbody>
    </Table>
  );
};

export default observer(LeaseList);
