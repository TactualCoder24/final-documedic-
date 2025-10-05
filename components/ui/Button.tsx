import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}

const Button: React.FC<ButtonProps> = ({ className, variant = 'default', size = 'default', asChild = false, ...props }) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg transition-shadow",
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
    // FIX: Add a generic type to `React.isValidElement`. This helps TypeScript correctly
    // infer the type of `child.props`, resolving errors related to spreading an `unknown`
    // type and accessing the `className` property.
    if (React.isValidElement<any>(props.children)) {
      const child = props.children;
      // The `props` from destructuring includes `children` and any other props passed to Button.
      // We destructure `children` out to avoid passing it in `restProps` and causing a recursion issue.
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