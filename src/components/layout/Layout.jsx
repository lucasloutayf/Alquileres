import React from 'react';
import Header from './Header';

const Layout = ({ children, user, theme, toggleTheme }) => {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground antialiased selection:bg-primary/20 selection:text-primary">
      {/* Skip link para accesibilidad */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-emerald-600 focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
      >
        Saltar al contenido principal
      </a>
      
      <Header user={user} theme={theme} toggleTheme={toggleTheme} />
      
      <main 
        id="main-content" 
        className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8"
        tabIndex={-1}
      >
        {children}
      </main>

      {/* Background decorative elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>
    </div>
  );
};

export default Layout;
