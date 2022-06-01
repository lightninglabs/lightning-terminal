import React from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { Button, HeaderFour, SummaryItem } from 'components/base';
import Tip from 'components/common/Tip';
import Unit from 'components/common/Unit';

const Styled = {
  Summary: styled.div`
    margin: 20px 0 30px;
  `,
  SummaryActions: styled(SummaryItem)`
    margin: 30px auto;
  `,
};

const CloseAccountConfirm: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.pool.account.CloseAccountForm');

  const { closeAccountView } = useStore();

  const { Summary, SummaryActions } = Styled;
  return (
    <>
      <HeaderFour>{l('closeAccount')}</HeaderFour>
      <Summary>
        <SummaryItem strong>
          <span>{l('accountBalance')}</span>
          <Unit sats={closeAccountView.accountBalance} />
        </SummaryItem>
        <SummaryItem>
          <span>{l('destination')}</span>
          <span>
            {closeAccountView.destination ? (
              <Tip
                overlay={closeAccountView.destination}
                capitalize={false}
                placement="right"
              >
                <span>{closeAccountView.destinationEllipsed}</span>
              </Tip>
            ) : (
              l('lndWallet')
            )}
          </span>
        </SummaryItem>
        <SummaryItem>
          <span>{l('satsPerVbyteLabel')}</span>
          <span>{closeAccountView.satsPerVbyte} sats/vByte</span>
        </SummaryItem>
        <SummaryActions>
          <Button ghost borderless onClick={closeAccountView.cancel}>
            {l('common.cancel')}
          </Button>
          <Button
            danger
            ghost
            disabled={!closeAccountView.isValid || closeAccountView.loading}
            onClick={closeAccountView.closeAccount}
          >
            {l('common.confirm')}
          </Button>
        </SummaryActions>
      </Summary>
    </>
  );
};

export default observer(CloseAccountConfirm);
