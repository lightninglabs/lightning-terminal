import React from 'react';
import { observer } from 'mobx-react-lite';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { Button, UserPlus } from 'components/base';
import { styled } from 'components/theme';

const Styled = {
  Content: styled.div`
    font-size: ${props => props.theme.sizes.xs};
    text-align: center;

    > div {
      margin: 20px;
    }
  `,
  UserIcon: styled(UserPlus)`
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

const NoAccount: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.pool.account.NoAccount');
  const { accountSectionView } = useStore();

  const { Content, UserIcon, Title, Actions } = Styled;
  return (
    <>
      <Content>
        <div>
          <UserIcon />
        </div>
        <Title>{l('welcome')}</Title>
        <div>{l('message')}</div>
        <Actions>
          <Button primary ghost onClick={accountSectionView.showFundNew}>
            {l('createAccount')}
          </Button>
        </Actions>
      </Content>
    </>
  );
};

export default observer(NoAccount);
