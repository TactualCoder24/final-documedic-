import React, { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ThemeToggle from './ui/ThemeToggle';
import Button from './ui/Button';
import { Menu, X, LogOut } from './icons/Icons';
import Logo from './icons/Logo';
import { motion } from 'framer-motion';
import { navItems } from './navConfig';
import Breadcrumbs from './ui/Breadcrumbs';

const Sidebar: React.FC<{ isOpen: boolean; toggle: () => void }> = ({ isOpen, toggle }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const activeLinkClass = "bg-primary/10 text-primary dark:bg-primary/20";
  const inactiveLinkClass = "text-muted-foreground hover:text-foreground hover:bg-muted/50";

  return (
    <>
      <aside className={`fixed top-0 left-0 z-40 w-64 h-screen bg-card border-r border-border/60 transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-border/60">
           <NavLink to="/dashboard" className="flex items-center gap-2">
            <Logo className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold font-heading">DocuMedic</span>
          </NavLink>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={toggle} aria-label="Close menu">
            <X className="h-6 w-6" />
          </Button>
        </div>
        <div className="flex flex-col h-[calc(100vh-4rem)]">
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                end={path === '/dashboard'}
                className={({ isActive }) => `flex items-center px-3 py-2 text-sm font-semibold rounded-md transition-all ${isActive ? activeLinkClass : inactiveLinkClass}`}
                onClick={() => { if (isOpen) toggle() }}
              >
                <Icon className="mr-3 h-5 w-5" />
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="px-4 py-4 border-t border-border/60">
            <div className="flex items-center gap-3 px-3 py-2">
                <img src={user?.photoURL || "https://i.pravatar.cc/150?u=priya-sharma"} alt="User" className="w-10 h-10 rounded-full" />
                <div>
                    <p className="font-semibold text-sm">{user?.displayName}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
            </div>
            <Button variant="ghost" className="w-full justify-start mt-2 text-muted-foreground hover:text-destructive" onClick={handleSignOut}>
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>
      {isOpen && <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={toggle}></div>}
    </>
  );
};

const Header: React.FC<{ toggleSidebar: () => void }> = ({ toggleSidebar }) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-background/80 backdrop-blur-sm border-b border-border/60 md:justify-end">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleSidebar} aria-label="Open menu">
        <Menu className="h-6 w-6" />
      </Button>
      <div className="flex items-center gap-4">
        <ThemeToggle />
      </div>
    </header>
  );
};

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="min-h-screen bg-secondary/30 dark:bg-background">
      <Sidebar isOpen={sidebarOpen} toggle={toggleSidebar} />
      <div className="md:pl-64">
        <Header toggleSidebar={toggleSidebar} />
        <main className="p-4 sm:p-6 lg:p-8">
            <Breadcrumbs />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
            >
             <Outlet />
            </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Layout;