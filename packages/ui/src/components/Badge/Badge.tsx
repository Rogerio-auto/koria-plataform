import * as React from 'react';

/** Badge component placeholder. Variants: default, secondary, destructive, outline. */
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

const Badge: React.FC<BadgeProps> = ({ children, ...props }) => {
  return <span {...props}>{children}</span>;
};

Badge.displayName = 'Badge';

export default Badge;
