import * as React from 'react';

/** Card component placeholder. Container with border, shadow, and rounded corners. */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ title, description, children, ...props }, ref) => {
    return (
      <div ref={ref} {...props}>
        {title && <h3>{title}</h3>}
        {description && <p>{description}</p>}
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
