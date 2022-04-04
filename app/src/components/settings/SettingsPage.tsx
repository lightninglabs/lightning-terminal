import React from 'react';
import { Route, Switch } from 'react-router';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { PUBLIC_URL } from '../../config';
import BalanceSettings from './BalanceSettings';
import ExplorerSettings from './ExplorerSettings';
import GeneralSettings from './GeneralSettings';
import UnitSettings from './UnitSettings';

const Styled = {
  Wrapper: styled.div`
    padding: 40px 0;
  `,
};

const SettingsPage: React.FC = () => {
  const { Wrapper } = Styled;

  return (
    <Wrapper>
      <Switch>
        <Route path={`${PUBLIC_URL}/settings`} exact component={GeneralSettings} />
        <Route path={`${PUBLIC_URL}/settings/unit`} component={UnitSettings} />
        <Route path={`${PUBLIC_URL}/settings/balance`} component={BalanceSettings} />
        <Route path={`${PUBLIC_URL}/settings/explorers`} component={ExplorerSettings} />
      </Switch>
    </Wrapper>
  );
};

export default observer(SettingsPage);
