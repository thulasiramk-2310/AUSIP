import { useState } from 'react';
import Layout from './layout/Layout';
import Dashboard from './pages/Dashboard';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');

  return (
    <Layout activePage={activePage} onNavigate={setActivePage}>
      {activePage === 'dashboard' && <Dashboard />}
      {activePage === 'ask-ai' && <Dashboard />}
      {activePage !== 'dashboard' && activePage !== 'ask-ai' && (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="w-16 h-16 bg-[#1E293B] rounded-2xl flex items-center justify-center">
            <svg className="w-8 h-8 text-[#94A3B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.3-3.06a2.25 2.25 0 010-3.89l5.3-3.06a2.25 2.25 0 012.16 0l5.3 3.06a2.25 2.25 0 010 3.89l-5.3 3.06a2.25 2.25 0 01-2.16 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white">
            {activePage.charAt(0).toUpperCase() + activePage.slice(1).replace('-', ' ')}
          </h2>
          <p className="text-sm text-[#94A3B8]">This section is coming soon.</p>
        </div>
      )}
    </Layout>
  );
}
