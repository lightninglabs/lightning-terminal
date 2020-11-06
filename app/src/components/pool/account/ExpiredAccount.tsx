import React from 'react';
import { observer } from 'mobx-react-lite';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { AlertTriangle, Button, HeaderFour } from 'components/base';
import { styled } from 'components/theme';

const Styled = {
  Content: styled.div`
    font-size: ${props => props.theme.sizes.xs};
    text-align: center;

    > div {
      margin: 20px 0;
    }
  `,
  Alert: styled(AlertTriangle)`
    color: ${props => props.theme.colors.pink};
    width: 64px;
    height: 64px;
  `,
  Title: styled.div`
    font-size: ${props => props.theme.sizes.s};
    font-weight: bold;
  `,
  Actions: styled.div`
    margin: 30px auto;
  `,
};

const ExpiredAccount: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.pool.account.ExpiredAccount');
  const { accountSectionView } = useStore();

  const { Content, Alert, Title, Actions } = Styled;
  return (
    <>
      <HeaderFour>{l('account')}</HeaderFour>
      <Content>
        <div>
          <Alert />
        </div>
        <Title>{l('title')}</Title>
        <div>{l('message')}</div>
        <Actions>
          <Button onClick={accountSectionView.showCloseAccount}>
            {l('closeAccount')}
          </Button>
        </Actions>
      </Content>
    </>
  );
};

export default observer(ExpiredAccount);
