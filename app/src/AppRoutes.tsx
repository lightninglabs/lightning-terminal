import React, { Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Loading from 'components/common/Loading';
import { Layout } from 'components/layout';
import { PUBLIC_URL } from 'config';

const LazyAuthPage = React.lazy(() => import('components/auth/AuthPage'));
const LazyLoopPage = React.lazy(() => import('components/loop/LoopPage'));
const LazyHistoryPage = React.lazy(() => import('components/history/HistoryPage'));
const LazyPoolPage = React.lazy(() => import('components/pool/PoolPage'));
const LazySettingsPage = React.lazy(() => import('components/settings/SettingsPage'));
const LazyConnectPage = React.lazy(() => import('components/connect/ConnectPage'));

const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<Loading delay={500} />}>
      <BrowserRouter basename={PUBLIC_URL}>
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
            {/* Only the GeneralSettings component needs hamburger menu 
            hence not wrapping entire settings page in <Layout>. */}
            <Route path="settings/*" element={<LazySettingsPage />} />
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
      </BrowserRouter>
    </Suspense>
  );
};

export default AppRoutes;
