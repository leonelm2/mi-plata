import { Outlet } from 'react-router-dom';
import { Sidebar, BottomNav } from './Navigation';
import { ToastContainer } from '../shared/ToastContainer';
import { AddTransactionModal } from '../shared/AddTransactionModal';

export function AppLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col min-h-screen">
        <div className="flex-1 overflow-y-auto pb-24 md:pb-0">
          <Outlet />
        </div>
      </main>
      <BottomNav />
      <ToastContainer />
      <AddTransactionModal />
    </div>
  );
}
