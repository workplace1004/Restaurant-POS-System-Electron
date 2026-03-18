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
    <aside className="w-[300px] shrink-0 flex flex-col bg-pos-bg p-4 px-2">

      <div className="flex items-center justify-center h-[80px] mb-4">
        <div className="text-5xl font-semibold text-pos-text">{t('appName')}</div>
      </div>
      <div className="flex flex-col gap-1 flex-1 overflow-auto">
        {categories.map((cat) => (
          <button
            type="button"
            key={cat.id}
            className={`flex items-center gap-2 text-left px-4 py-5 rounded-md text-pos-text text-2xl hover:bg-pos-panel ${selectedCategoryId === cat.id ? 'bg-pos-panel font-medium' : 'bg-transparent'
              }`}
            onClick={() => onSelectCategory(cat.id)}
          >
            {selectedCategoryId === cat.id ? (
              <span className="text-pos-text text-3xl pr-2 font-normal" aria-hidden>
                <svg width="30px" height="30px" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.707 9.293l-5-5a.999.999 0 10-1.414 1.414L14.586 9H3a1 1 0 100 2h11.586l-3.293 3.293a.999.999 0 101.414 1.414l5-5a.999.999 0 000-1.414z" fill="#ffffff" /></svg>
              </span>
            ) : <div className="pl-[34px]" />}
            {cat.name}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-5 items-center">
        <div className="px-4 py-4 text-center flex flex-col">
          {currentUser && (
            <span className="text-3xl mb-6 text-pos-text">{currentUser.label}</span>
          )}
          <button
            type="button"
            className="bg-transparent border-none text-pos-muted text-3xl p-0 hover:text-pos-text"
            onClick={() => setShowLogoutModal(true)}
          >
            {t('logOut')}
          </button>
        </div>
        <div className="px-10 py-6 border-t border-pos-border border-gray-500">
          <button
            type="button"
            className="bg-transparent border-none text-pos-muted text-3xl p-0 hover:text-pos-text"
            onClick={() => onControlClick?.()}
          >
            {t('control')}
          </button>
        </div>
      </div>
      <div className="text-center text-3xl text-pos-muted">
        <span className="text-4xl pr-1">☁</span>
        {t('tagline')}
      </div>

      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-pos-panel border border-pos-border rounded-xl shadow-xl p-8 py-14 max-w-4xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <p className="text-pos-text text-5xl mb-8 text-center">{t('logoutConfirm')}</p>
            <div className="flex gap-4 justify-around mt-20 items-center">
              <button
                type="button"
                className="px-8 py-4 rounded-lg text-4xl font-medium bg-pos-bg text-pos-text hover:bg-gray-700 border border-pos-border"
                onClick={() => setShowLogoutModal(false)}
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                className="px-8 py-4 rounded-lg text-4xl font-medium bg-red-600 text-white hover:bg-red-700"
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
