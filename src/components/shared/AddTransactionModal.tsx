import { useApp } from '../../context/AppContext';
import AddTransactionPage from '../../pages/AddTransactionPage';

export function AddTransactionModal() {
  const { isAddModalOpen, setAddModalOpen } = useApp();

  if (!isAddModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-0 sm:p-6 overflow-hidden">
      <div className="w-full h-full sm:h-auto sm:max-h-full max-w-lg bg-slate-50 dark:bg-slate-950 sm:border border-slate-200 dark:border-slate-800 sm:rounded-3xl shadow-2xl animate-slide-up flex flex-col overflow-hidden">
        <div className="overflow-y-auto flex-1 w-full h-full">
          <AddTransactionPage onClose={() => setAddModalOpen(false)} />
        </div>
      </div>
    </div>
  );
}
