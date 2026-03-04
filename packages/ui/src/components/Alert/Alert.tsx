import * as React from 'react';

/** Alert component placeholder. Variants: default, destructive, success, warning. */
export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  title?: string;
}

const Alert: React.FC<AlertProps> = ({ title, children, ...props }) => {
  return (
    <div role="alert" {...props}>
      {title && <h5>{title}</h5>}
      {children}
    </div>
  );
};

Alert.displayName = 'Alert';

export default Alert;
