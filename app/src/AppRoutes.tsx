import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Layout } from 'components/layout';

const LazyWelcomePage = React.lazy(() => import('components/auth/WelcomePage'));
const LazyAuthPage = React.lazy(() => import('components/auth/AuthPage'));
const LazyConnectNodePage = React.lazy(() => import('components/auth/ConnectNodePage'));
const LazyGetNodePage = React.lazy(() => import('components/auth/GetNodePage'));
const LazyExploreNetworkPage = React.lazy(
  () => import('components/auth/ExploreNetworkPage'),
);
const LazyLoopPage = React.lazy(() => import('components/loop/LoopPage'));
const LazyHomePage = React.lazy(() => import('components/home/HomePage'));
const LazyHistoryPage = React.lazy(() => import('components/history/HistoryPage'));
const LazyPoolPage = React.lazy(() => import('components/pool/PoolPage'));
const LazySettingsPage = React.lazy(() => import('components/settings/SettingsPage'));
const LazyConnectPage = React.lazy(() => import('components/connect/ConnectPage'));
const LazyCustomSessionPage = React.lazy(
  () => import('components/connect/CustomSessionPage'),
);

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LazyWelcomePage />} />
      <Route path="auth" element={<LazyAuthPage />} />
      <Route path="connect-node" element={<LazyConnectNodePage />} />
      <Route path="get-node" element={<LazyGetNodePage />} />
      <Route path="explore-network" element={<LazyExploreNetworkPage />} />
      <Route>
        <Route
          path="home"
          element={
            <Layout>
              <LazyHomePage />
            </Layout>
          }
        />
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
        <Route
          path="connect/custom"
          element={
            <Layout>
              <LazyCustomSessionPage />
            </Layout>
          }
        />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
