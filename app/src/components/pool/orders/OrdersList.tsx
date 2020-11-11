import React from 'react';
import { observer } from 'mobx-react-lite';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { Order } from 'store/models';
import SortableHeader from 'components/common/SortableHeader';
import Unit from 'components/common/Unit';
import { Table, TableCell, TableHeader, TableRow } from './OrderTable';

const OrdersList: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.pool.orders.OrdersList');
  const { orderStore, settingsStore } = useStore();

  return (
    <Table>
      <thead>
        <tr>
          <TableHeader>
            <SortableHeader<Order>
              field="type"
              sort={settingsStore.orderSort}
              onSort={settingsStore.setOrderSort}
            >
              {l('type')}
            </SortableHeader>
          </TableHeader>
          <TableHeader right>
            <SortableHeader<Order>
              field="amount"
              sort={settingsStore.orderSort}
              onSort={settingsStore.setOrderSort}
            >
              {l('amount')}
            </SortableHeader>
          </TableHeader>
          <TableHeader right>
            <SortableHeader<Order>
              field="stateLabel"
              sort={settingsStore.orderSort}
              onSort={settingsStore.setOrderSort}
            >
              {l('status')}
            </SortableHeader>
          </TableHeader>
          <TableHeader right>
            <SortableHeader<Order>
              field="creationTimestamp"
              sort={settingsStore.orderSort}
              onSort={settingsStore.setOrderSort}
            >
              {l('created')}
            </SortableHeader>
          </TableHeader>
        </tr>
      </thead>
      <tbody>
        {orderStore.accountOrders.map(order => (
          <TableRow key={order.nonce} selectable>
            <TableCell>{order.type}</TableCell>
            <TableCell right>
              <Unit sats={order.amount} suffix={false} />
            </TableCell>
            <TableCell right>{order.stateLabel}</TableCell>
            <TableCell right>{order.createdOnLabel}</TableCell>
          </TableRow>
        ))}
      </tbody>
    </Table>
  );
};

export default observer(OrdersList);
