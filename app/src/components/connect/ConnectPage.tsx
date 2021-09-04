import React from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { usePrefixedTranslation } from 'hooks';
import PageHeader from 'components/common/PageHeader';
import AddSession from './AddSession';
import SessionList from './SessionList';

const Styled = {
  Wrapper: styled.section`
    padding: 40px 0;
  `,
  Description: styled.div`
    margin: 60px;
  `,
};

const ConnectPage: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.connect.ConnectPage');

  const { Wrapper, Description } = Styled;
  return (
    <Wrapper>
      <PageHeader title={l('pageTitle')} />
      <Description>{l('description')}</Description>
      <AddSession />
      <SessionList />
    </Wrapper>
  );
};

export default observer(ConnectPage);
