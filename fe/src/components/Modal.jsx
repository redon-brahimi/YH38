import React from 'react';
import { createPortal } from 'react-dom';

const Modal = ({ show, onClose, title, children }) => {
  if (!show) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-800 text-2xl font-semibold leading-none focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-full w-8 h-8 flex items-center justify-center"
          aria-label="Fermer"
        >
          &times;
        </button>

        {/* Title */}
        {title && (
          <h2 className="text-2xl font-bold text-secondary-900 mb-4 border-b pb-3">
            {title}
          </h2>
        )}

        {/* Content */}
        <div className="text-neutral-700">
          {children}
        </div>
      </div>
    </div>,
    document.body // Render modal outside the main app div
  );
};

export default Modal;