import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { HeartPulse } from '../icons/Icons';
import { navItems } from '../navConfig';

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const currentNavItem = navItems.find(item => item.path === location.pathname);

  // Don't render breadcrumbs if the path doesn't match a main nav item
  if (!currentNavItem) {
    return null;
  }

  return (
    <nav aria-label="breadcrumb" className="mb-6 animate-fade-in">
      <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
        <li>
          <Link to="/dashboard" className="flex items-center gap-2 hover:text-foreground transition-colors">
            <HeartPulse className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </li>
        {currentNavItem.path !== '/dashboard' && (
          <>
            <li>
              <span className="opacity-50">/</span>
            </li>
            <li>
              <span className="font-medium text-foreground">{currentNavItem.label}</span>
            </li>
          </>
        )}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
