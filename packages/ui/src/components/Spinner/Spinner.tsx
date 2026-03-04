import * as React from 'react';

/** Spinner/Loading component placeholder. */
export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'md' }) => {
  const sizeMap = { sm: '16px', md: '24px', lg: '32px' };
  return (
    <div
      role="status"
      aria-label="Loading"
      style={{ width: sizeMap[size], height: sizeMap[size] }}
    >
      <span>Loading...</span>
    </div>
  );
};

Spinner.displayName = 'Spinner';

export default Spinner;
