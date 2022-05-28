import React, { Suspense } from 'react';
import { unstable_HistoryRouter as HistoryRouter, Route, Routes } from 'react-router-dom';
import Loading from 'components/common/Loading';
import { Layout } from 'components/layout';
import { PUBLIC_URL } from 'config';
import { useStore } from 'store';

const LazyAuthPage = React.lazy(() => import('components/auth/AuthPage'));
const LazyLoopPage = React.lazy(() => import('components/loop/LoopPage'));
const LazyHistoryPage = React.lazy(() => import('components/history/HistoryPage'));
const LazyPoolPage = React.lazy(() => import('components/pool/PoolPage'));
const LazySettingsPage = React.lazy(() => import('components/settings/SettingsPage'));
const LazyConnectPage = React.lazy(() => import('components/connect/ConnectPage'));

const AppRoutes: React.FC = () => {
  const { router } = useStore();
  return (
    <Routes>
      <Route path="/" element={<LazyAuthPage />} />
      <Route>
        <Route
          path="loop"
          element={
            <Layout>
              <LazyLoopPage />
            </Layout>
          }
        />
        <Route
          path="history"
          element={
            <Layout>
              <LazyHistoryPage />
            </Layout>
          }
        />
        <Route
          path="pool"
          element={
            <Layout>
              <LazyPoolPage />
            </Layout>
          }
        />
        <Route
          path="settings/*"
          element={
            <Layout>
              <LazySettingsPage />
            </Layout>
          }
        />
        <Route
          path="connect"
          element={
            <Layout>
              <LazyConnectPage />
            </Layout>
          }
        />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
