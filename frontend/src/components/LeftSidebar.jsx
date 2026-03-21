import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
const LANG_OPTIONS = [
  { value: 'en', label: 'EN' },
  { value: 'nl', label: 'NL' },
  { value: 'fr', label: 'FR' },
  { value: 'tr', label: 'TR' },
];

export function LeftSidebar({ categories, selectedCategoryId, onSelectCategory, currentUser, onLogout, onControlClick }) {
  const { t, lang, setLang } = useLanguage();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    onLogout?.();
  };

  return (
    <aside className="w-[14%] shrink-0 flex flex-col bg-pos-bg p-4 px-2">

      <div className="flex items-center justify-center mb-4">
        <div className="text-2xl font-semibold text-pos-text">{t('appName')}</div>
      </div>
      <div className="flex flex-col text-sm gap-1 flex-1 overflow-auto">
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
          <button
            type="button"
            className="bg-transparent border-none text-pos-muted text-md p-0 hover:text-pos-text"
            onClick={() => setShowLogoutModal(true)}
          >
            {t('logOut')}
          </button>
        </div>
        <div className="px-10 py-1 border-t border-pos-border border-gray-500">
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

      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-pos-panel border border-pos-border rounded-xl shadow-xl p-8 py-8 max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <p className="text-pos-text text-xl mb-8 text-center">{t('logoutConfirm')}</p>
            <div className="flex gap-4 justify-around mt-10 items-center">
              <button
                type="button"
                className="px-8 py-4 rounded-lg text-md font-medium bg-pos-bg text-pos-text hover:bg-gray-700 border border-pos-border"
                onClick={() => setShowLogoutModal(false)}
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                className="px-8 py-4 rounded-lg text-md font-medium bg-red-600 text-white hover:bg-red-700"
                onClick={handleLogoutConfirm}
              >
                {t('logOut')}
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
