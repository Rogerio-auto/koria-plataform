import * as React from 'react';

/** Modal/Dialog component placeholder. Will be implemented with Radix UI Dialog. */
export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ open, title, description, children }) => {
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true">
      {title && <h2>{title}</h2>}
      {description && <p>{description}</p>}
      {children}
    </div>
  );
};

Modal.displayName = 'Modal';

export default Modal;
