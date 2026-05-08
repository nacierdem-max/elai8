import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

interface AppLayoutProps {
  children: React.ReactNode;
  currentPath?: string;
}

export default function AppLayout({ children, currentPath = '/dashboard' }: AppLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f2f2f7' }}>
      <Sidebar currentPath={currentPath} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-5 lg:px-7 xl:px-8 py-5">
          <div className="max-w-screen-2xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}