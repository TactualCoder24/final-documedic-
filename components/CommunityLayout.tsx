import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ThemeToggle from './ui/ThemeToggle';
import Button from './ui/Button';
import { LogOut, HeartPulse } from './icons/Icons';
import Logo from './icons/Logo';

const CommunityLayout: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-secondary/30 dark:bg-background">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-4">
            <NavLink to="/dashboard" className="flex items-center gap-2">
              <Logo className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold font-heading hidden sm:inline">DocuMedic</span>
            </NavLink>
          </div>
          <div className="flex-1 max-w-xl px-4">
            {/* Future search bar could go here */}
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />
             <Button variant="outline" asChild className="hidden sm:flex">
                <NavLink to="/dashboard">
                    <HeartPulse className="mr-2 h-4 w-4" />
                    Dashboard
                </NavLink>
            </Button>
            <div className="group relative">
                <button aria-label="User menu">
                    <img src={user?.photoURL || `https://i.pravatar.cc/150?u=${user?.uid}`} alt="User" className="w-9 h-9 rounded-full" />
                </button>
                 <div className="absolute top-full right-0 mt-2 w-48 bg-card border border-border rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-10">
                    <div className="p-2">
                        <p className="font-semibold text-sm px-2 py-1 truncate">{user?.displayName}</p>
                        <p className="text-xs text-muted-foreground px-2 truncate">{user?.email}</p>
                        <div className="my-1 h-px bg-border" />
                        <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive" onClick={handleSignOut}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default CommunityLayout;