import React from 'react';
import { observer } from 'mobx-react-lite';
import { Column, Row, Section } from 'components/base';
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
  Row: styled(Row)`
    flex: 1;
  `,
  Column: styled(Column)`
    &:first-of-type {
      border-right: 1px solid ${props => props.theme.colors.blue};
    }
  `,
};

const DetailsSection: React.FC = () => {
  const { Section, Row, Column } = Styled;
  return (
    <Section>
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

export default observer(DetailsSection);
