import React, { ReactNode } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from 'store';
import { Section } from 'components/base';
import {
  AccountSummary,
  CloseAccountConfirm,
  CloseAccountForm,
  ExpiredAccount,
  FundAccountConfirm,
  FundAccountForm,
  FundNewAccountConfirm,
  FundNewAccountForm,
  NoAccount,
  RenewAccountConfirm,
  RenewAccountForm,
} from './account';

const AccountSection: React.FC = () => {
  const { accountSectionView } = useStore();

  let view: ReactNode;
  switch (accountSectionView.visibleSection) {
    case 'none':
      view = <NoAccount />;
      break;
    case 'summary':
      view = <AccountSummary />;
      break;
    case 'fund-new':
      view = <FundNewAccountForm />;
      break;
    case 'fund-new-confirm':
      view = <FundNewAccountConfirm />;
      break;
    case 'fund':
      view = <FundAccountForm />;
      break;
    case 'fund-confirm':
      view = <FundAccountConfirm />;
      break;
    case 'expired':
      view = <ExpiredAccount />;
      break;
    case 'close':
      view = <CloseAccountForm />;
      break;
    case 'close-confirm':
      view = <CloseAccountConfirm />;
      break;
    case 'renew':
      view = <RenewAccountForm />;
      break;
    case 'renew-confirm':
      view = <RenewAccountConfirm />;
      break;
  }

  return <Section>{view}</Section>;
};

export default observer(AccountSection);
