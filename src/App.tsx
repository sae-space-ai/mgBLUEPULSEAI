import { useState } from 'react';
import { useAppStore } from './store/useAppStore';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Components from './pages/Components';
import Alerts from './pages/Alerts';
import Reports from './pages/Reports';
import SettingsPage from './pages/Settings';
import Login from './pages/Login';
import { cn } from './lib/utils';

function App() {
  const { isAuthenticated, sidebarOpen } = useAppStore();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (!isAuthenticated) {
    return <Login />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'components': return <Components />;
      case 'alerts': return <Alerts />;
      case 'reports': return <Reports />;
      case 'settings': return <SettingsPage />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className={cn(
        'transition-all duration-300 min-h-screen',
        sidebarOpen ? 'ml-64' : 'ml-16'
      )}>
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
