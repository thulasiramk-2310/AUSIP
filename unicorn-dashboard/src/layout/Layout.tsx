import { useState } from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
    children: React.ReactNode;
    activePage: string;
    onNavigate: (page: string) => void;
}

export default function Layout({ children, activePage, onNavigate }: LayoutProps) {
    return (
        <div className="min-h-screen bg-[#0F172A]">
            <Sidebar activePage={activePage} onNavigate={onNavigate} />
            <main className="lg:ml-[260px] min-h-screen">
                <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
