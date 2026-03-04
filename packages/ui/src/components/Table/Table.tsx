import * as React from 'react';

/** Table component placeholder. Will support sorting, pagination, and selection. */
export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ children, ...props }, ref) => {
    return (
      <table ref={ref} {...props}>
        {children}
      </table>
    );
  }
);

Table.displayName = 'Table';

export default Table;
