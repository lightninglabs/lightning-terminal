import React from 'react';
import { Route, Switch } from 'react-router';
import { observer } from 'mobx-react-lite';
import { styled } from 'components/theme';
import BalanceSettings from './BalanceSettings';
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
        <Route path="/settings" exact component={GeneralSettings} />
        <Route path="/settings/unit" component={UnitSettings} />
        <Route path="/settings/balance" component={BalanceSettings} />
      </Switch>
    </Wrapper>
  );
};

export default observer(SettingsPage);
