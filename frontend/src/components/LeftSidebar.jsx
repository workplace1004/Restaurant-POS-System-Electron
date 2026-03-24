import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
const LANG_OPTIONS = [
  { value: 'en', label: 'EN' },
  { value: 'nl', label: 'NL' },
  { value: 'fr', label: 'FR' },
  { value: 'tr', label: 'TR' },
];

export function LeftSidebar({ categories, selectedCategoryId, onSelectCategory, currentUser, onControlClick, time }) {
  const { t } = useLanguage();

  return (
    <aside className="w-[14%] shrink-0 flex flex-col bg-pos-bg p-4 px-2">

      <div className="flex items-center justify-center mb-4">
        <div className="text-3xl font-semibold text-pos-text">{time != null ? time : '--:--'}</div>
      </div>
      <div className="flex flex-col text-sm gap-1 flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
        {categories.map((cat) => (
          <button
            type="button"
            key={cat.id}
            className={`flex items-center gap-2 text-left px-4 py-2 rounded-lg hover:bg-pos-panel ${selectedCategoryId === cat.id ? 'bg-pos-panel font-medium text-green-500 border border-green-500' : 'bg-pos-panel/50 text-pos-text'
              }`}
            onClick={() => onSelectCategory(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>
      <div className="flex flex-col items-center border-t border-gray-500">
        <div className="px-4 py-1 text-center flex flex-col">
          {currentUser && (
            <span className="text-md mb-1 text-pos-text">{currentUser.label}</span>
          )}
        </div>
        <div className="px-10 py-1">
          <button
            type="button"
            className="bg-transparent border-none text-pos-muted text-md p-0 hover:text-pos-text"
            onClick={() => onControlClick?.()}
          >
            {t('control')}
          </button>
        </div>
      </div>
      <div className="text-center text-md text-pos-muted">
        <span className="text-xl pr-1">☁</span>
        {t('tagline')}
      </div>

    </aside>
  );
}
