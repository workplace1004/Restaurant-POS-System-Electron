import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const API = '/api';
const TOAST_DURATION_MS = 3500;

const PAD = [
  ['7', '8', '9'],
  ['4', '5', '6'],
  ['1', '2', '3'],
  ['Again', '0']
];

export function LoginScreen({ time, onLogin }) {
  const { t } = useLanguage();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [pinInput, setPinInput] = useState('');
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const rolesScrollRef = useRef(null);

  const scrollRoles = (direction) => {
    const el = rolesScrollRef.current;
    if (!el) return;
    const cardWidth = 350 + 24; // min-w + gap
    el.scrollBy({ left: direction === 'left' ? -cardWidth : cardWidth, behavior: 'smooth' });
  };

  useEffect(() => {
    let cancelled = false;
    fetch(`${API}/users`)
      .then((res) => res.json())
      .then((data) => { if (!cancelled) setUsers(Array.isArray(data) ? data : []); })
      .catch(() => { if (!cancelled) setUsers([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), TOAST_DURATION_MS);
    return () => clearTimeout(id);
  }, [toast]);

  const showToast = (message) => setToast(message);

  const handlePadKey = (key) => {
    if (key === 'Again') {
      setPinInput('');
      return;
    }
    if (pinInput.length >= 8) return;
    setPinInput((prev) => prev + key);
  };

  const handleSubmit = useCallback(async () => {
    if (!selectedUser) {
      showToast(t('loginSelectUser'));
      return;
    }
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser.id, pin: pinInput })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(data.error || t('loginWrongPin'));
        setPinInput('');
        return;
      }
      onLogin?.(data);
    } catch {
      showToast(t('loginFailed'));
      setPinInput('');
    }
  }, [selectedUser, pinInput, onLogin, t]);

  return (
    <div className="flex flex-col h-full bg-pos-bg text-pos-text">
      <div className="flex items-center justify-between px-6 py-5 border-b border-pos-border">
        <span className="text-5xl font-medium">{time}</span>
        <span className="text-5xl font-semibold text-pos-text">RestaurantPOS</span>
        <div className="w-16" />
      </div>

      <div className="mt-10 flex flex-col items-center justify-center gap-8 p-6">

        <div className="flex items-center gap-20 max-w-[1300px] w-full">
          <button
            type="button"
            onClick={() => scrollRoles('left')}
            className="flex-shrink-0 w-16 h-[320px] rounded-xl bg-pos-panel border-2 border-pos-border text-white hover:border-white/50 transition-all flex items-center justify-center"
            aria-label="Previous users"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div ref={rolesScrollRef} className="flex gap-6 overflow-x-auto flex-1 min-w-0 scroll-smooth">
          {loading ? (
            <p className="text-pos-muted text-2xl">{t('loginLoadingUsers')}</p>
          ) : (
            users.map((user) => {
              const color = 'bg-blue-600';
              return (
            <button
              key={user.id}
              type="button"
              className={`flex min-w-[350px] h-[320px] flex-col items-center p-6 rounded-xl border-2 transition-all ${selectedUser?.id === user.id
                ? `${color} border-white text-white`
                : 'bg-pos-panel border-pos-border text-pos-text hover:border-white/50'
                }`}
              onClick={() => {
                setSelectedUser(user);
                setPinInput('');
              }}
            >
              <span className="flex-1 flex items-center justify-center" aria-hidden>
                <svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 256 256" aria-hidden>
                  <g style={{ stroke: 'none', strokeWidth: 0, strokeDasharray: 'none', strokeLinecap: 'butt', strokeLinejoin: 'miter', strokeMiterlimit: 10, fill: 'none', fillRule: 'nonzero', opacity: 1 }} transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)">
                    <path d="M 81.004 45.328 H 8.996 c -2.291 0 -4.155 -1.864 -4.155 -4.155 s 1.864 -4.155 4.155 -4.155 h 72.008 c 2.291 0 4.155 1.864 4.155 4.155 S 83.295 45.328 81.004 45.328 z M 8.996 39.019 c -1.188 0 -2.155 0.967 -2.155 2.155 s 0.967 2.155 2.155 2.155 h 72.008 c 1.188 0 2.155 -0.967 2.155 -2.155 s -0.967 -2.155 -2.155 -2.155 H 8.996 z" style={{ stroke: 'none', strokeWidth: 1, strokeDasharray: 'none', strokeLinecap: 'butt', strokeLinejoin: 'miter', strokeMiterlimit: 10, fill: 'rgb(255,255,255)', fillRule: 'nonzero', opacity: 1 }} transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round" />
                    <path d="M 77.954 38.67 c -0.553 0 -1 -0.448 -1 -1 c 0 -17.62 -14.335 -31.954 -31.954 -31.954 S 13.046 20.051 13.046 37.67 c 0 0.552 -0.448 1 -1 1 s -1 -0.448 -1 -1 C 11.046 18.948 26.278 3.716 45 3.716 c 18.723 0 33.954 15.232 33.954 33.954 C 78.954 38.223 78.507 38.67 77.954 38.67 z" style={{ stroke: 'none', strokeWidth: 1, strokeDasharray: 'none', strokeLinecap: 'butt', strokeLinejoin: 'miter', strokeMiterlimit: 10, fill: 'rgb(255,255,255)', fillRule: 'nonzero', opacity: 1 }} transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round" />
                    <path d="M 18.399 32.489 c -0.075 0 -0.15 -0.008 -0.227 -0.026 c -0.538 -0.125 -0.873 -0.662 -0.749 -1.2 c 2.177 -9.407 8.91 -16.973 18.01 -20.241 c 0.52 -0.188 1.092 0.083 1.279 0.604 c 0.187 0.52 -0.083 1.092 -0.604 1.279 c -8.458 3.036 -14.715 10.068 -16.738 18.809 C 19.266 32.177 18.854 32.489 18.399 32.489 z" style={{ stroke: 'none', strokeWidth: 1, strokeDasharray: 'none', strokeLinecap: 'butt', strokeLinejoin: 'miter', strokeMiterlimit: 10, fill: 'rgb(255,255,255)', fillRule: 'nonzero', opacity: 1 }} transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round" />
                    <path d="M 48.717 5.924 c -0.553 0 -1 -0.448 -1 -1 C 47.717 3.366 46.447 2 45 2 c -1.447 0 -2.716 1.366 -2.716 2.924 c 0 0.552 -0.448 1 -1 1 s -1 -0.448 -1 -1 C 40.284 2.255 42.443 0 45 0 s 4.717 2.255 4.717 4.924 C 49.717 5.476 49.27 5.924 48.717 5.924 z" style={{ stroke: 'none', strokeWidth: 1, strokeDasharray: 'none', strokeLinecap: 'butt', strokeLinejoin: 'miter', strokeMiterlimit: 10, fill: 'rgb(255,255,255)', fillRule: 'nonzero', opacity: 1 }} transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round" />
                    <path d="M 29.228 81.016 c -0.031 0 -0.062 -0.001 -0.093 -0.004 c -0.264 -0.025 -0.507 -0.153 -0.677 -0.357 l -6.596 -7.949 c -0.172 -0.208 -0.253 -0.476 -0.225 -0.744 c 0.029 -0.269 0.164 -0.514 0.376 -0.681 l 1.851 -1.457 c 0.198 -0.161 0.339 -0.412 0.385 -0.693 c 0.679 -4.203 1.706 -7.613 4.728 -11.617 c 2.044 -2.646 3.452 -6.211 4.311 -10.91 c 0.277 -1.517 1.596 -2.631 3.137 -2.648 c 0.827 -0.01 1.69 0.322 2.31 0.937 c 0.618 0.613 0.958 1.428 0.955 2.296 c -0.015 4.617 -0.516 8.339 -1.526 11.312 c 5.25 -0.987 11.363 -8.216 15.933 -13.62 c 1.139 -1.344 3.108 -1.631 4.584 -0.661 c 1.493 0.981 2.007 2.92 1.194 4.511 l -8.28 15.961 c -0.655 1.282 -1.547 2.412 -2.647 3.354 c 0 0 -0.001 0 -0.001 0.001 l -3.553 3.036 c -0.655 0.559 -1.373 1.039 -2.134 1.429 l -7.699 3.942 c -0.814 0.417 -1.583 0.924 -2.287 1.508 l -3.405 2.825 C 29.687 80.935 29.46 81.016 29.228 81.016 z M 24.057 72.218 l 5.302 6.39 l 2.635 -2.187 c 0.816 -0.678 1.709 -1.266 2.653 -1.749 l 7.699 -3.942 c 0.624 -0.319 1.211 -0.713 1.747 -1.17 l 3.553 -3.036 c 0.9 -0.771 1.631 -1.696 2.169 -2.75 l 8.28 -15.961 c 0.345 -0.674 0.125 -1.504 -0.514 -1.923 c -0.631 -0.415 -1.473 -0.293 -1.959 0.281 c -5.267 6.228 -12.505 14.739 -19.009 14.433 c -0.329 -0.017 -0.628 -0.193 -0.801 -0.474 c -0.173 -0.279 -0.197 -0.626 -0.065 -0.928 c 1.289 -2.936 1.924 -6.867 1.941 -12.021 c 0.001 -0.328 -0.128 -0.637 -0.362 -0.87 c -0.236 -0.234 -0.575 -0.376 -0.879 -0.356 c -0.585 0.007 -1.087 0.431 -1.192 1.008 c -0.917 5.021 -2.451 8.869 -4.689 11.765 c -2.778 3.682 -3.697 6.72 -4.343 10.722 c -0.124 0.765 -0.517 1.452 -1.107 1.936 L 24.057 72.218 z M 48.296 67.284 h 0.01 H 48.296 z" style={{ stroke: 'none', strokeWidth: 1, strokeDasharray: 'none', strokeLinecap: 'butt', strokeLinejoin: 'miter', strokeMiterlimit: 10, fill: 'rgb(255,255,255)', fillRule: 'nonzero', opacity: 1 }} transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round" />
                    <path d="M 24.838 90 c -0.287 0 -0.572 -0.123 -0.77 -0.361 l -11.326 -13.65 c -0.169 -0.204 -0.251 -0.467 -0.226 -0.731 c 0.024 -0.264 0.153 -0.508 0.357 -0.677 l 7.015 -5.82 c 0.426 -0.354 1.056 -0.293 1.408 0.131 l 11.326 13.65 c 0.169 0.204 0.251 0.467 0.226 0.731 c -0.024 0.264 -0.153 0.508 -0.357 0.677 l -7.015 5.82 C 25.29 89.925 25.063 90 24.838 90 z M 14.92 75.48 l 10.048 12.111 l 5.476 -4.543 L 20.396 70.938 L 14.92 75.48 z" style={{ stroke: 'none', strokeWidth: 1, strokeDasharray: 'none', strokeLinecap: 'butt', strokeLinejoin: 'miter', strokeMiterlimit: 10, fill: 'rgb(255,255,255)', fillRule: 'nonzero', opacity: 1 }} transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round" />
                    <path d="M 25.751 83.962 c -0.287 0 -0.572 -0.123 -0.77 -0.361 l -0.708 -0.854 c -0.353 -0.425 -0.294 -1.056 0.131 -1.408 c 0.424 -0.353 1.055 -0.294 1.408 0.131 l 0.708 0.854 c 0.353 0.425 0.294 1.056 -0.131 1.408 C 26.203 83.887 25.976 83.962 25.751 83.962 z" style={{ stroke: 'none', strokeWidth: 1, strokeDasharray: 'none', strokeLinecap: 'butt', strokeLinejoin: 'miter', strokeMiterlimit: 10, fill: 'rgb(255,255,255)', fillRule: 'nonzero', opacity: 1 }} transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round" />
                    <path d="M 45 31.277 c -0.168 0 -0.336 -0.042 -0.487 -0.127 c -1.54 -0.859 -3.941 -2.882 -4.941 -4.162 c -2.243 -2.87 -2.645 -6.19 -0.977 -8.073 c 0.803 -0.907 1.929 -1.431 3.169 -1.474 c 1.13 -0.035 2.253 0.33 3.236 1.05 c 0.983 -0.721 2.113 -1.078 3.236 -1.05 c 1.241 0.043 2.366 0.566 3.17 1.474 c 1.667 1.884 1.265 5.203 -0.978 8.073 c -1.001 1.281 -3.402 3.304 -4.941 4.163 C 45.336 31.235 45.168 31.277 45 31.277 z M 41.925 19.438 c -0.031 0 -0.062 0 -0.093 0.001 c -0.687 0.023 -1.305 0.308 -1.741 0.801 c -0.985 1.113 -0.531 3.484 1.056 5.516 c 0.743 0.952 2.542 2.5 3.853 3.352 c 1.311 -0.851 3.109 -2.399 3.853 -3.352 c 1.588 -2.031 2.041 -4.402 1.056 -5.516 l 0 0 c -0.436 -0.492 -1.054 -0.776 -1.741 -0.8 c -0.858 -0.035 -1.732 0.353 -2.466 1.075 c -0.389 0.383 -1.014 0.383 -1.402 0 C 43.591 19.818 42.751 19.438 41.925 19.438 z" style={{ stroke: 'none', strokeWidth: 1, strokeDasharray: 'none', strokeLinecap: 'butt', strokeLinejoin: 'miter', strokeMiterlimit: 10, fill: 'rgb(255,255,255)', fillRule: 'nonzero', opacity: 1 }} transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round" />
                  </g>
                </svg>
              </span>
              <span className="text-5xl font-semibold">{user.label}</span>
            </button>
          ); })
          )}
          </div>
          <button
            type="button"
            onClick={() => scrollRoles('right')}
            className="flex-shrink-0 w-16 h-[320px] rounded-xl bg-pos-panel border-2 border-pos-border text-white hover:border-white/50 transition-all flex items-center justify-center"
            aria-label="Next users"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        <div className="bg-pos-panel rounded-xl shadow-xl p-6 w-full max-w-2xl">
          <div className="mb-4 h-16 flex items-center bg-pos-bg justify-center rounded text-2xl font-mono text-white tracking-widest">
            {pinInput.replace(/./g, '•') || 'PIN'}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {PAD.map((row, ri) =>
              row.map((key) => (
                <button
                  key={key}
                  type="button"
                  className={`col-span-1 py-5 rounded-lg font-semibold transition-colors border border-transparent ${key === 'Again'
                    ? 'col-span-2 text-4xl bg-pos-bg text-white hover:border-white'
                    : 'bg-pos-bg text-5xl text-white hover:border-white'
                    }`}
                  onClick={() => {
                    if (key === 'Again') handlePadKey('Again');
                    else handlePadKey(key);
                  }}
                >
                  {key === 'Again' ? t('again') : key}
                </button>
              ))
            )}
          </div>
          <button
            type="button"
            className="w-full mt-4 py-5 bg-green-600 text-white rounded-lg text-4xl font-semibold hover:bg-green-700"
            onClick={handleSubmit}
          >
            {t('loginButton')}
          </button>
        </div>
      </div>

      {toast && (
        <div
          className="fixed top-8 right-8 z-50 flex items-stretch rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-2xl shadow-black/40 border border-white/10 overflow-hidden min-w-[280px]"
          role="alert"
          aria-live="polite"
        >
          <div className="flex-shrink-0 w-1 bg-amber-400/90" aria-hidden />
          <div className="flex items-center gap-3 py-4 pr-6 pl-2">
            <span className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center" aria-hidden>
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </span>
            <p className="text-lg font-medium tracking-tight text-white/95">{toast}</p>
          </div>
        </div>
      )}
    </div>
  );
}
