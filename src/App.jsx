import React, { lazy, Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { Routes, Navigate, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedLayout from './components/ProtectedLayout';

// Lazy-loaded pages
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Sessions = lazy(() => import('./pages/Sessions'));
const Pricing = lazy(() => import('./pages/Pricing'));
const MeetingRoom = lazy(() => import('./pages/MeetingRoom'));

// Small centered fallback — only fills its own container, not the page
const PageLoader = () => (
  <div className="flex items-center justify-center py-24 w-full">
    <div className="w-8 h-8 border-2 border-slate-300 border-t-primary rounded-full animate-spin" />
  </div>
);

const withSuspense = (Component) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

const App = () => {
  return (
    <div>
      <Toaster />
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login/*"
          element={withSuspense(() => (
            <Login mode="login" />
          ))}
        />
        <Route
          path="/register/*"
          element={withSuspense(() => (
            <Login mode="register" />
          ))}
        />

        {/* Private Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<ProtectedLayout />}>
            <Route
              path="/dashboard"
              element={
                <Suspense fallback={<PageLoader />}>
                  <Dashboard />
                </Suspense>
              }
            />
            <Route
              path="/sessions"
              element={
                <Suspense fallback={<PageLoader />}>
                  <Sessions />
                </Suspense>
              }
            />
            <Route
              path="/pricing"
              element={
                <Suspense fallback={<PageLoader />}>
                  <Pricing />
                </Suspense>
              }
            />
          </Route>
          <Route
            path="/meeting/:meetingId"
            element={
              <Suspense fallback={<PageLoader />}>
                <MeetingRoom />
              </Suspense>
            }
          />
        </Route>

        {/* Other Routes */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
};

export default App;
