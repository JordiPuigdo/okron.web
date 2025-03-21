'use client';

import React, { useEffect, useState } from 'react';
import { useSessionStore } from 'app/stores/globalStore';
import Loader from 'components/Loader/loader';
import Link from 'next/link';

import Header from './Header';
import SideNav from './SideNav';

export default function MainLayout({
  children,
  hideHeader = false,
}: {
  children: React.ReactNode;
  hideHeader?: boolean;
}) {
  const { isMenuOpen, setIsMenuOpen } = useSessionStore(state => state);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsMenuOpen(false);
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return loading ? (
    <Loader />
  ) : (
    <div className="relative flex flex-col h-screen">
      <div className="flex flex-1 overflow-hidden">
        <div
          className={`fixed mt-2 top-0 left-0 h-full bg-white text-white transition-all duration-400 ease-in-out z-50 pt-6 ${
            isMenuOpen ? 'pl-3 w-60' : !hideHeader && !isMenuOpen && 'w-16'
          }`}
        >
          {!hideHeader && <SideNav />}
        </div>

        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
          <div className={`fixed top-0 w-full z-50  ${isMenuOpen ? '' : ''}`}>
            {!hideHeader && <Header />}
          </div>
          <main className="flex-1 w-full bg-okron-background">
            <div className={`mr-12 h-full ${isMenuOpen ? 'ml-60' : 'ml-16'}`}>
              {children}
            </div>
          </main>
        </div>
      </div>
      {!hideHeader && (
        <footer
          className={`${isMenuOpen ? 'ml-60' : 'ml-16'} bg-okron-background`}
        >
          <div className="flex max-w-screen-xl2 md:p-4 2xl:p-4 border-t-2 border-gray-200 text-gray-600 mx-6">
            <div className="w-full">
              <p>Copyright © 2024 Okron AI Business</p>
            </div>
            <div className="w-full text-end">
              <Link href="https://www.okron.io/" className="text-blue-800">
                Okron
              </Link>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
