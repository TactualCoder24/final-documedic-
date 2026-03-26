import React from 'react';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'premium' | 'gradient' | 'medical' | 'stat';
  hover?: boolean;
  [key: string]: any;
}

const Card: React.FC<CardProps> = ({ className = '', children, variant = 'default', hover = false, ...rest }) => {
  const variants = {
    default:  'bg-card border-border shadow-sm',
    glass:    'glass-card border-border/40',
    premium:  'card-premium',
    gradient: 'bg-gradient-to-br from-card via-card to-primary/5 border-primary/20',
    medical:  'dm-card',
    stat:     'stat-tile',
  };

  const hoverClass = hover ? 'hover-lift hover-glow cursor-pointer' : '';

  return (
    <div
      className={`rounded-xl border text-card-foreground transition-all duration-300 ${variants[variant]} ${hoverClass} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};

const CardHeader: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>
    {children}
  </div>
);

const CardTitle: React.FC<{ className?: string; children: React.ReactNode; id?: string }> = ({ className = '', children, id }) => (
  <h3 id={id} className={`font-heading text-lg font-semibold leading-snug tracking-tight ${className}`}>
    {children}
  </h3>
);

const CardDescription: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <p className={`text-sm text-muted-foreground leading-relaxed ${className}`}>
    {children}
  </p>
);

const CardContent: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);

const CardFooter: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <div className={`flex items-center p-6 pt-0 ${className}`}>
    {children}
  </div>
);

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };