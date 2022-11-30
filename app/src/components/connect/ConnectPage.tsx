import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { Display, DisplayLarge } from 'components/base';
import AddSession from './AddSession';
import SessionList from './SessionList';

const Styled = {
  Wrapper: styled.section`
    padding-top: 120px;
  `,
  Description: styled.div`
    margin-bottom: 32px;
  `,
};

const ConnectPage: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.connect.ConnectPage');
  const { sessionStore } = useStore();

  useEffect(() => {
    sessionStore.fetchSessions();
  }, []);

  const { Wrapper, Description } = Styled;
  return (
    <Wrapper>
      <Display semiBold space={16}>
        {l('pageTitle')}
      </Display>
      <Description>{l('description')}</Description>
      <AddSession primary />
      <SessionList />
    </Wrapper>
  );
};

export default observer(ConnectPage);
