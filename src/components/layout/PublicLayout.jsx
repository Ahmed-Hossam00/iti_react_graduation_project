import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppHeader } from './AppHeader';
import { AppFooter } from './AppFooter';

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <AppHeader />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <AppFooter />
    </div>
  );
}

export default PublicLayout;
