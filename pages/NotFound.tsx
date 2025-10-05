
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';

const NotFound: React.FC = () => {
  const { user } = useAuth();
  const destination = user ? '/dashboard' : '/';

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center bg-background">
      <h1 className="text-6xl font-bold text-primary">404</h1>
      <p className="mt-4 text-2xl font-medium text-foreground">Page Not Found</p>
      <p className="mt-2 text-muted-foreground">
        Sorry, the page you are looking for does not exist.
      </p>
      <Link to={destination}>
        <Button className="mt-6">Go back to {user ? 'Dashboard' : 'Homepage'}</Button>
      </Link>
    </div>
  );
};

export default NotFound;
