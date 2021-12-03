import React from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import nodeConnectSvg from 'assets/images/lightning-node-connect.svg';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { Copy } from 'components/base';
import AddSession from './AddSession';
import PurpleButton from './PurpleButton';
import SessionList from './SessionList';

const Styled = {
  Wrapper: styled.section`
    padding-top: 80px;
  `,
  DisplayLarge: styled.div`
    font-family: ${props => props.theme.fonts.open.semiBold};
    font-size: 32px;
    line-height: 40px;
    margin-top: 32px;
    margin-bottom: 16px;
  `,
  Description: styled.div`
    margin-bottom: 32px;
  `,
  Divider: styled.div`
    max-width: 640px;
    border: 1px solid #384770;
    margin: 32px 0;
  `,
};

const ConnectPage: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.connect.ConnectPage');
  const { sessionStore } = useStore();

  const { Wrapper, DisplayLarge, Description, Divider } = Styled;
  return !sessionStore.hasMultiple ? (
    <Wrapper>
      <img src={nodeConnectSvg} alt={l('pageTitle')} />
      <DisplayLarge>{l('pageTitle')}</DisplayLarge>
      <Description>
        {l('description1')}
        <br />
        {l('description2')}
      </Description>
      <PurpleButton onClick={sessionStore.copyFirstPhrase}>
        <Copy />
        {l('copyPhraseLabel')}
      </PurpleButton>
      <Divider />
      <Description>{l('addlDesc')}</Description>
      <AddSession />
    </Wrapper>
  ) : (
    <Wrapper>
      <DisplayLarge>{l('pageTitle')}</DisplayLarge>
      <Description>{l('description1')}</Description>
      <AddSession primary />
      <SessionList />
    </Wrapper>
  );
};

export default observer(ConnectPage);
