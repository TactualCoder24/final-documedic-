import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'success' | 'gradient' | 'white';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}

const Button: React.FC<ButtonProps> = ({ className = '', variant = 'default', size = 'default', asChild = false, ...props }) => {
  const baseClasses =
    'inline-flex items-center justify-center rounded-xl font-medium ring-offset-background ' +
    'transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ' +
    'focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden';

  const variants = {
    default:     'bg-primary text-primary-foreground hover:brightness-110 shadow-sm hover:shadow-md hover:scale-[1.02]',
    gradient:    'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:brightness-110 shadow-md hover:shadow-lg hover:scale-[1.02]',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:scale-[1.02]',
    success:     'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:brightness-110 shadow-sm hover:shadow-md hover:scale-[1.02]',
    outline:     'border border-input bg-background hover:bg-primary/5 hover:text-primary hover:border-primary/40 transition-colors',
    secondary:   'bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:scale-[1.02]',
    ghost:       'hover:bg-primary/8 hover:text-primary transition-colors',
    link:        'text-primary underline-offset-4 hover:underline',
    white:       'bg-white text-primary hover:bg-gray-50 shadow-sm hover:shadow-md hover:scale-[1.02]',
  };

  const sizes = {
    default: 'h-10 px-4 py-2',
    sm:      'h-8 rounded-lg px-3 text-xs',
    lg:      'h-11 rounded-xl px-8 text-base',
    icon:    'h-10 w-10',
  };

  const buttonClasses = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  if (asChild) {
    if (React.isValidElement<React.HTMLAttributes<HTMLElement>>(props.children)) {
      const child = props.children;
      const { children: _children, ...restProps } = props;
      return React.cloneElement(child, {
        ...child.props,
        ...restProps,
        className: `${buttonClasses} ${child.props.className || ''}`.trim(),
      });
    }
    return null;
  }

  return <button className={buttonClasses} {...props} />;
};

export default Button;