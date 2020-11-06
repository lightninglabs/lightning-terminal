import React from 'react';
import { observer } from 'mobx-react-lite';
import { Section } from 'components/base';
import { styled } from 'components/theme';
import FundNewAccountForm from './account/FundNewAccountForm';

const Styled = {
  Section: styled(Section)`
    min-height: 325px;
  `,
};

const AccountSection: React.FC = () => {
  const { Section } = Styled;
  return (
    <Section>
      <FundNewAccountForm />
    </Section>
  );
};

export default observer(AccountSection);
