import { useState } from 'react';
import Layout from './layout/Layout';
import DashboardAnalytics from './pages/DashboardAnalytics';
import AiChat from './pages/AiChat';
import AlertsPage from './pages/AlertsPage';
import SettingsPage from './pages/SettingsPage';
import ReportsPage from './pages/ReportsPage';
import RankingsPage from './pages/RankingsPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import { AnalysisProvider } from './context/AnalysisContext';
import { AuthProvider, useAuth } from './context/AuthContext';

function AppContent() {
  const [activePage, setActivePage] = useState('dashboard');
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#18181B] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth pages if not authenticated
  if (!isAuthenticated) {
    if (authView === 'login') {
      return <LoginPage onSwitchToSignup={() => setAuthView('signup')} />;
    } else {
      return <SignupPage onSwitchToLogin={() => setAuthView('login')} />;
    }
  }

  // Show main app if authenticated
  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardAnalytics />;
      case 'ask-ai':
        return <AiChat />;
      case 'alerts':
        return <AlertsPage />;
      case 'rankings':
        return <RankingsPage />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardAnalytics />;
    }
  };

  return (
    <Layout activePage={activePage} onNavigate={setActivePage}>
      {renderPage()}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AnalysisProvider>
        <AppContent />
      </AnalysisProvider>
    </AuthProvider>
  );
}
