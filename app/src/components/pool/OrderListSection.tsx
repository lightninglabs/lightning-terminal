import React from 'react';
import { observer } from 'mobx-react-lite';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { Button, Column, HeaderFour, Row, Section } from 'components/base';
import { styled } from 'components/theme';
import LeaseList from './orders/LeaseList';
import OrdersList from './orders/OrdersList';

const Styled = {
  Section: styled(Section)`
    display: flex;
    flex-direction: column;
    height: 400px;
    overflow: auto;

    // use consistent scrollbars across different platforms
    &::-webkit-scrollbar {
      width: 8px;
      background-color: rgba(0, 0, 0, 0);
      border-radius: 10px;
    }
    &::-webkit-scrollbar:hover {
      background-color: rgba(0, 0, 0, 0.1);
    }
    &::-webkit-scrollbar-thumb:vertical {
      background-color: rgba(0, 0, 0, 0.2);
      border-radius: 10px;
    }
    &::-webkit-scrollbar-thumb:vertical:active {
      background-color: rgba(0, 0, 0, 0.6);
      border-radius: 10px;
    }
  `,
  Header: styled(HeaderFour)`
    color: ${props => props.theme.colors.white};
    padding-bottom: 10px;
    border-bottom: 1px solid ${props => props.theme.colors.blue};
  `,
  Actions: styled.span`
    float: right;
    text-transform: none;
  `,
  FilterButton: styled(Button)<{ active: boolean }>`
    border-radius: 5px;
    margin-left: 5px;

    &:hover {
      text-decoration: none;
      background-color: ${props => props.theme.colors.overlay};
    }

    ${props =>
      props.active &&
      `
      background-color: ${props.theme.colors.overlay};
    `}
  `,
  Row: styled(Row)`
    flex: 1;
  `,
  Column: styled(Column)`
    &:first-of-type {
      border-right: 1px solid ${props => props.theme.colors.blue};
    }
  `,
};

const OrderListSection: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.pool.OrderListSection');
  const { orderListView } = useStore();

  const { Section, Header, Actions, FilterButton, Row, Column } = Styled;
  return (
    <Section>
      <Header>
        {l('orders')}
        <Actions>
          <FilterButton
            ghost
            borderless
            compact
            active={orderListView.filter === 'open'}
            onClick={orderListView.filterByOpen}
          >
            {l('open')}
          </FilterButton>
          <FilterButton
            ghost
            borderless
            compact
            active={orderListView.filter === 'filled'}
            onClick={orderListView.filterByFilled}
          >
            {l('filled')}
          </FilterButton>
          <FilterButton
            ghost
            borderless
            compact
            active={orderListView.filter === ''}
            onClick={orderListView.clearFilter}
          >
            {l('all')}
          </FilterButton>
        </Actions>
      </Header>
      <Row>
        <Column cols={5}>
          <OrdersList />
        </Column>
        <Column>
          <LeaseList />
        </Column>
      </Row>
    </Section>
  );
};

export default observer(OrderListSection);
