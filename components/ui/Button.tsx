import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'success' | 'gradient';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}

const Button: React.FC<ButtonProps> = ({ className, variant = 'default', size = 'default', asChild = false, ...props }) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden";

  const variants = {
    default: "bg-primary text-primary-foreground hover:brightness-110 shadow-sm hover:shadow-md hover:scale-105",
    gradient: "gradient-primary text-white hover:brightness-110 shadow-md hover:shadow-lg hover:scale-105",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:scale-105",
    success: "gradient-success text-white hover:brightness-110 shadow-sm hover:shadow-md hover:scale-105",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:border-primary/50",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:scale-105",
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