import React, { Suspense } from 'react';
import { Route, Router, Switch } from 'react-router';
import { useStore } from 'store';
import Loading from 'components/common/Loading';
import { Layout } from 'components/layout';

const LazyAuthPage = React.lazy(() => import('components/auth/AuthPage'));
const LazyLoopPage = React.lazy(() => import('components/loop/LoopPage'));
const LazyHistoryPage = React.lazy(() => import('components/history/HistoryPage'));
const LazySettingsPage = React.lazy(() => import('components/settings/SettingsPage'));

const Routes: React.FC = () => {
  const { router } = useStore();

  return (
    <Suspense fallback={<Loading delay={500} />}>
      <Router history={router.history}>
        <Switch>
          <Route path="/" exact component={LazyAuthPage} />
          <Route>
            <Layout>
              <Switch>
                <Suspense fallback={<Loading delay={500} />}>
                  <Route path="/loop" component={LazyLoopPage} />
                  <Route path="/history" component={LazyHistoryPage} />
                  <Route path="/settings" component={LazySettingsPage} />
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
