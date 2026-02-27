import { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
}

export default function Layout({ children, activePage, onNavigate }: LayoutProps) {
  return (
    <div className="min-h-screen bg-dark-bg">
      <Sidebar activePage={activePage} onNavigate={onNavigate} />
      <div className="ml-[260px]">
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
