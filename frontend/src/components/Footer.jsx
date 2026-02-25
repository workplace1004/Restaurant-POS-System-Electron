import React from 'react';

export function Footer({ view, onViewChange, showSubtotalView, subtotalButtonDisabled, onSubtotalClick, onHistoryClick }) {
  return (
    <footer className="flex items-center gap-6 py-3 px-4 bg-pos-bg shrink-0">
      <div className="flex gap-2 flex-wrap text-2xl justify-between w-full ">
        <div className="flex gap-2">
          <button type="button" className="py-5 w-[150px] bg-pos-panel border-none rounded text-pos-text hover:bg-pos-surface">
            Let
          </button>
          <button
            type="button"
            className={`py-5 w-[150px] border-none rounded ${view === 'customers'
                ? 'bg-pos-surface text-white'
                : 'bg-pos-panel text-pos-text hover:bg-pos-surface'
              }`}
            onClick={() => onViewChange?.('customers')}
          >
            Customers
          </button>
          <button
            type="button"
            className="py-5 w-[150px] bg-pos-panel border-none rounded text-pos-text hover:bg-pos-surface"
            onClick={() => onHistoryClick?.()}
          >
            History
          </button>
          <button
            type="button"
            disabled={subtotalButtonDisabled}
            className={`py-5 w-[150px] border-none rounded ${subtotalButtonDisabled ? 'bg-pos-panel text-pos-text opacity-60 cursor-not-allowed' : showSubtotalView ? 'bg-pos-surface text-white' : 'bg-pos-panel text-pos-text hover:bg-pos-surface'}`}
            onClick={() => onSubtotalClick?.()}
          >
            Subtotal
          </button>
          <button type="button" className="py-5 w-[150px] bg-pos-panel border-none rounded text-pos-text hover:bg-pos-surface">
            Back name
          </button>
        </div>
        <button type="button" className="py-5 w-[150px] bg-pos-panel border-none rounded text-pos-text hover:bg-pos-surface">
          More...
        </button>
      </div>
    </footer>
  );
}
