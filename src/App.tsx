import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import { AppLayout } from './components/layout/AppLayout';
import { ScrollToTop } from './components/shared/ScrollToTop';
import { ProtectedRoute } from './components/shared/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AddTransactionPage from './pages/AddTransactionPage';
import TransactionsPage from './pages/TransactionsPage';
import StatsPage from './pages/StatsPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ToastProvider>
        <AppProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/agregar" element={<AddTransactionPage />} />
                <Route path="/historial" element={<TransactionsPage />} />
                <Route path="/estadisticas" element={<StatsPage />} />
                <Route path="/perfil" element={<ProfilePage />} />
              </Route>
            </Route>
          </Routes>
        </AppProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
