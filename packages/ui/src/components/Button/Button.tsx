import * as React from 'react';

/**
 * Button component placeholder.
 *
 * Will be implemented with:
 * - class-variance-authority for variant management
 * - @radix-ui/react-slot for asChild pattern
 * - Tailwind CSS for styling
 *
 * Variants: default, destructive, outline, secondary, ghost, link
 * Sizes: default, sm, lg, icon
 */

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, ...props }, ref) => {
    return (
      <button ref={ref} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
