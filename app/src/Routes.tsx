import React, { Suspense } from 'react';
import { Route, Router, Switch } from 'react-router';
import { useStore } from 'store';
import Loading from 'components/common/Loading';
import { Layout } from 'components/layout';
import { PUBLIC_URL } from 'config';

const LazyAuthPage = React.lazy(() => import('components/auth/AuthPage'));
const LazyLoopPage = React.lazy(() => import('components/loop/LoopPage'));
const LazyHistoryPage = React.lazy(() => import('components/history/HistoryPage'));
const LazyPoolPage = React.lazy(() => import('components/pool/PoolPage'));
const LazySettingsPage = React.lazy(() => import('components/settings/SettingsPage'));
const LazyConnectPage = React.lazy(() => import('components/connect/ConnectPage'));

const Routes: React.FC = () => {
  const { router } = useStore();
  return (
    <Suspense fallback={<Loading delay={500} />}>
      <Router history={router.history}>
        <Switch>
          <Route path={`${PUBLIC_URL}/`} exact component={LazyAuthPage} />
          <Route>
            <Layout>
              <Switch>
                <Suspense fallback={<Loading delay={500} />}>
                  <Route path={`${PUBLIC_URL}/loop`} component={LazyLoopPage} />
                  <Route path={`${PUBLIC_URL}/history`} component={LazyHistoryPage} />
                  <Route path={`${PUBLIC_URL}/pool`} component={LazyPoolPage} />
                  <Route path={`${PUBLIC_URL}/settings`} component={LazySettingsPage} />
                  <Route path={`${PUBLIC_URL}/connect`} component={LazyConnectPage} />
                </Suspense>
              </Switch>
            </Layout>
          </Route>
        </Switch>
      </Router>
    </Suspense>
  );
};

export default Routes;
