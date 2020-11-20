import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { Order } from 'store/models';
import { Close, Scrollable } from 'components/base';
import SortableHeader from 'components/common/SortableHeader';
import Tip from 'components/common/Tip';
import Unit from 'components/common/Unit';
import { styled, Theme } from 'components/theme';
import { Table, TableCell, TableHeader, TableRow } from './OrderTable';

/** maps a order status to a theme color */
const statusToColor = (theme: Theme, status: Order['stateLabel']) => {
  switch (status) {
    case 'Partially Filled':
      return theme.colors.gold;
    case 'Filled':
      return theme.colors.green;
    case 'Failed':
    case 'Cancelled':
    case 'Expired':
      return theme.colors.pink;
    default:
      return '';
  }
};

const Styled = {
  OrderStatus: styled.span<{ status: Order['stateLabel'] }>`
    color: ${props => statusToColor(props.theme, props.status)};
  `,
  CloseIcon: styled(Close)`
    width: 18px;
    height: 18px;
    padding: 0;
    color: ${props => props.theme.colors.gray};

    &:hover {
      color: ${props => props.theme.colors.pink};
    }
  `,
  IconCell: styled(TableCell)`
    padding: 2px 0;
  `,
};

const OrderRow: React.FC<{
  order: Order;
  selected: boolean;
  onClick: (nonce: string) => void;
  onCancel: (nonce: string) => void;
}> = observer(({ order, selected, onClick, onCancel }) => {
  const { l } = usePrefixedTranslation('cmps.pool.orders.OrdersList');

  const handleClick = useCallback(() => onClick(order.nonce), [order, onClick]);
  const handleCancel = useCallback(() => onCancel(order.nonce), [order, onCancel]);

  const { OrderStatus, IconCell, CloseIcon } = Styled;
  return (
    <TableRow key={order.nonce} selectable selected={selected} onClick={handleClick}>
      <TableCell>{order.type}</TableCell>
      <TableCell right>
        <Unit sats={order.amount} suffix={false} />
      </TableCell>
      <TableCell right>{order.rateFixed}</TableCell>
      <TableCell>
        <OrderStatus status={order.stateLabel}>{order.stateWithCount}</OrderStatus>
      </TableCell>
      <TableCell right>{order.createdOnLabel}</TableCell>
      <IconCell>
        {order.isPending && (
          <Tip overlay={l('cancelOrder')} placement="right">
            <CloseIcon onClick={handleCancel} />
          </Tip>
        )}
      </IconCell>
    </TableRow>
  );
});

const OrdersList: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.pool.orders.OrdersList');
  const { orderListView, orderStore, settingsStore } = useStore();

  return (
    <Scrollable>
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
                field="rateFixed"
                sort={settingsStore.orderSort}
                onSort={settingsStore.setOrderSort}
              >
                {l('rate')}
              </SortableHeader>
            </TableHeader>
            <TableHeader>
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
            <TableHeader />
          </tr>
        </thead>
        <tbody>
          {orderListView.orders.map(order => (
            <OrderRow
              key={order.nonce}
              order={order}
              selected={order.nonce === orderListView.selectedNonce}
              onClick={orderListView.setChosenNonce}
              onCancel={orderStore.cancelOrder}
            />
          ))}
        </tbody>
      </Table>
    </Scrollable>
  );
};

export default observer(OrdersList);