import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './components/shared/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { ErrorBoundary } from './components/shared/ErrorBoundary';

const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const TransactionsPage = React.lazy(() => import('./pages/TransactionsPage'));
const AddTransactionPage = React.lazy(() => import('./pages/AddTransactionPage'));
const StatsPage = React.lazy(() => import('./pages/StatsPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <ToastProvider>
          <BrowserRouter>
            <React.Suspense
              fallback={
                <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                  <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                </div>
              }
            >
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route element={<ProtectedRoute />}>
                  <Route element={<AppLayout />}>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/historial" element={<TransactionsPage />} />
                    <Route path="/agregar" element={<AddTransactionPage />} />
                    <Route path="/estadisticas" element={<StatsPage />} />
                    <Route path="/perfil" element={<ProfilePage />} />
                  </Route>
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </React.Suspense>
          </BrowserRouter>
        </ToastProvider>
      </AppProvider>
    </ErrorBoundary>
  );
}
