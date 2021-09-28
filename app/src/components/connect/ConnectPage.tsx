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
  Info: styled.div`
    margin: 100px 60px;
    color: ${props => props.theme.colors.gray};
    text-align: center;
    font-size: ${props => props.theme.sizes.s};
  `,
};

const ConnectPage: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.connect.ConnectPage');

  const { Wrapper, Description, Info } = Styled;
  return (
    <Wrapper>
      <PageHeader title={l('pageTitle')} />
      <Description>{l('description')}</Description>
      <AddSession />
      <SessionList />
      <Info>{l('info')}</Info>
    </Wrapper>
  );
};

export default observer(ConnectPage);
