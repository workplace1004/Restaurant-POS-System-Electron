import React from 'react';

/**
 * Reusable delete confirmation modal.
 * @param {boolean} open - Whether the modal is visible
 * @param {() => void} onClose - Called when user cancels (No or backdrop)
 * @param {() => void} onConfirm - Called when user confirms (Yes)
 * @param {string} [message] - Confirmation question (default: delete price group)
 */
export function DeleteConfirmModal({ open, onClose, onConfirm, message = 'Are you sure you want to delete this price group?' }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-confirm-title"
    >
      <div
        className="bg-pos-bg rounded-2xl shadow-xl max-w-4xl h-[300px] w-full mx-4 p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <p id="delete-confirm-title" className="text-center text-white text-4xl font-medium py-10">
          {message}
        </p>
        <div className="flex justify-around mt-10 gap-12">
          <button
            type="button"
            className="text-3xl font-semibold text-white hover:text-gray-400 focus:outline-none"
            onClick={() => onConfirm?.()}
          >
            Yes
          </button>
          <button
            type="button"
            className="text-3xl font-semibold text-white hover:text-gray-400 focus:outline-none"
            onClick={onClose}
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
}
