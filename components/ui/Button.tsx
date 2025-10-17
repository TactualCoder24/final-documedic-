import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}

const Button: React.FC<ButtonProps> = ({ className, variant = 'default', size = 'default', asChild = false, ...props }) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

  const variants = {
    default: "bg-primary-gradient text-primary-foreground hover:brightness-110 shadow-sm hover:shadow-md transition-all",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-primary underline-offset-4 hover:underline",
  };

  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8 text-base",
    icon: "h-10 w-10",
  };
  
  const buttonClasses = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;
  
  if (asChild) {
    // FIX: Use `React.isValidElement` as a generic type guard to correctly type `props.children`.
    // This resolves issues where `child.props` was inferred as `unknown`, causing spread and property access errors.
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