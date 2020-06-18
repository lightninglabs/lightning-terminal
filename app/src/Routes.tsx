import React from 'react';
import { Route, Router, Switch } from 'react-router';
import { useStore } from 'store';
import AuthPage from 'components/auth/AuthPage';
import HistoryPage from 'components/history/HistoryPage';
import { Layout } from 'components/layout';
import LoopPage from 'components/loop/LoopPage';
import SettingsPage from 'components/settings/SettingsPage';

const Routes: React.FC = () => {
  const { router } = useStore();

  return (
    <Router history={router.history}>
      <Switch>
        <Route path="/" exact component={AuthPage} />
        <Route>
          <Layout>
            <Switch>
              <Route path="/loop" component={LoopPage} />
              <Route path="/history" component={HistoryPage} />
              <Route path="/settings" component={SettingsPage} />
            </Switch>
          </Layout>
        </Route>
      </Switch>
    </Router>
  );
};

export default Routes;
