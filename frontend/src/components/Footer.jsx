import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export function Footer({ customersActive = false, onCustomersClick, showSubtotalView, subtotalButtonDisabled, onSubtotalClick, onHistoryClick }) {
  const { t } = useLanguage();
  return (
    <footer className="flex items-center gap-6 py-3 px-4 bg-pos-bg shrink-0">
      <div className="flex gap-2 flex-wrap text-2xl justify-between w-full ">
        <div className="flex gap-2">
          <button type="button" className="py-5 w-[150px] bg-pos-panel border-none rounded text-pos-text hover:bg-pos-surface">
            {t('left')}
          </button>
          <button
            type="button"
            className={`py-5 w-[150px] border-none rounded ${customersActive
                ? 'bg-pos-surface text-white'
                : 'bg-pos-panel text-pos-text hover:bg-pos-surface'
              }`}
            onClick={() => onCustomersClick?.()}
          >
            {t('customers')}
          </button>
          <button
            type="button"
            className="py-5 w-[150px] bg-pos-panel border-none rounded text-pos-text hover:bg-pos-surface"
            onClick={() => onHistoryClick?.()}
          >
            {t('history')}
          </button>
          <button
            type="button"
            disabled={subtotalButtonDisabled}
            className={`py-5 w-[150px] border-none rounded ${subtotalButtonDisabled ? 'bg-pos-panel text-pos-text opacity-60 cursor-not-allowed' : showSubtotalView ? 'bg-pos-surface text-white' : 'bg-pos-panel text-pos-text hover:bg-pos-surface'}`}
            onClick={() => onSubtotalClick?.()}
          >
            {t('subtotal')}
          </button>
          <button type="button" className="py-5 w-[150px] bg-pos-panel border-none rounded text-pos-text hover:bg-pos-surface">
            {t('backName')}
          </button>
        </div>
        <button type="button" className="py-5 w-[150px] bg-pos-panel border-none rounded text-pos-text hover:bg-pos-surface">
          {t('more')}
        </button>
      </div>
    </footer>
  );
}
