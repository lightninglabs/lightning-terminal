import React from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { AlertTriangle, Button, UserPlus } from 'components/base';
import LoaderLines from 'components/common/LoaderLines';

const Styled = {
  Loading: styled.div`
    min-height: 200px;
    display: flex;
    justify-content: center;
    align-items: center;
  `,
  Content: styled.div`
    font-size: ${props => props.theme.sizes.xs};
    text-align: center;
  `,
  UserIcon: styled(UserPlus)`
    width: 64px;
    height: 64px;
  `,
  Title: styled.div`
    margin: 20px;
    font-size: ${props => props.theme.sizes.s};
    font-weight: bold;
  `,
  Message: styled.div`
    margin: 20px;
  `,
  ChannelNotice: styled.div`
    display: flex;
    margin: 20px 0;
    color: ${props => props.theme.colors.gold};

    > svg {
      width: 70px;
      height: 66px;
    }

    > span {
      margin-left: 5px;
      text-align: left;
    }
  `,
  Actions: styled.div`
    margin: 30px auto;
  `,
};

const NoAccount: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.pool.account.NoAccount');
  const { accountSectionView, accountStore } = useStore();

  const { Loading, Content, UserIcon, Title, Message, ChannelNotice, Actions } = Styled;
  if (!accountStore.loaded) {
    return (
      <Loading>
        <LoaderLines />
      </Loading>
    );
  }
  return (
    <>
      <Content>
        <div>
          <UserIcon />
        </div>
        <Title>{l('welcome')}</Title>
        {!accountSectionView.hasChannels ? (
          <ChannelNotice>
            <AlertTriangle size="large" />
            <span>{l('channelNotice')}</span>
          </ChannelNotice>
        ) : (
          <Message>{l('message')}</Message>
        )}
        <Actions>
          <Button
            primary
            ghost
            disabled={!accountSectionView.hasChannels}
            onClick={accountSectionView.showFundNew}
          >
            {l('createAccount')}
          </Button>
        </Actions>
      </Content>
    </>
  );
};

export default observer(NoAccount);
