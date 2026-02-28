import React, { useState, useEffect, useCallback, useRef } from 'react';

const API = '/api';
const TOAST_DURATION_MS = 3500;

const ROLE_COLORS = { admin: 'bg-red-600', kitchen: 'bg-amber-600', waiter: 'bg-blue-600' };

const PAD = [
  ['7', '8', '9'],
  ['4', '5', '6'],
  ['1', '2', '3'],
  ['Again', '0']
];

export function LoginScreen({ time, onLogin }) {
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
      showToast('Select a user');
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
        showToast(data.error || 'Wrong PIN');
        setPinInput('');
        return;
      }
      onLogin?.(data);
    } catch {
      showToast('Login failed');
      setPinInput('');
    }
  }, [selectedUser, pinInput, onLogin]);

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
            <p className="text-pos-muted text-2xl">Loading users…</p>
          ) : (
            users.map((user) => {
              const color = ROLE_COLORS[user.role] || 'bg-gray-600';
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
                {user.role === 'admin' ?
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="150"
                    height="150"
                    viewBox="0 0 90 90"
                    aria-hidden
                  >
                    <g transform="translate(1.4 1.4)">
                      <path d="M 79.636 41.865 l -0.003 -0.001 c -2.515 -1.042 -2.71 -3.369 -2.71 -4.057 c -0.001 -0.689 0.195 -3.016 2.71 -4.058 c 1.268 -0.525 2.254 -1.512 2.779 -2.779 c 0.525 -1.267 0.525 -2.662 0 -3.93 l -3.345 -8.075 c -1.085 -2.614 -4.091 -3.863 -6.71 -2.777 c -2.517 1.043 -4.3 -0.465 -4.786 -0.952 c -0.487 -0.487 -1.995 -2.271 -0.952 -4.787 c 0.524 -1.267 0.524 -2.662 -0.001 -3.929 c -0.525 -1.268 -1.512 -2.255 -2.778 -2.779 l -8.075 -3.345 c -2.614 -1.082 -5.624 0.165 -6.709 2.78 C 48.015 5.688 45.689 5.884 45 5.884 s -3.016 -0.195 -4.058 -2.71 c -0.524 -1.268 -1.511 -2.255 -2.779 -2.78 c -1.267 -0.525 -2.662 -0.525 -3.931 0 L 26.16 3.738 c -1.268 0.525 -2.255 1.511 -2.78 2.779 s -0.525 2.663 0 3.93 c 1.043 2.515 -0.465 4.3 -0.952 4.786 c -0.486 0.487 -2.268 1.996 -4.786 0.953 c -1.267 -0.524 -2.663 -0.524 -3.931 0 c -1.268 0.525 -2.255 1.512 -2.779 2.779 l -3.344 8.073 c -0.525 1.268 -0.525 2.663 0 3.931 c 0.525 1.268 1.512 2.255 2.779 2.779 c 2.515 1.042 2.71 3.37 2.71 4.058 s -0.196 3.015 -2.713 4.058 c -2.615 1.085 -3.861 4.095 -2.778 6.709 l 3.344 8.074 c 0.525 1.268 1.512 2.254 2.779 2.779 c 1.266 0.524 2.662 0.525 3.93 0 c 2.515 -1.04 4.299 0.465 4.786 0.953 c 0.246 0.246 0.75 0.824 1.057 1.659 c 2.618 -3.386 6.007 -6.147 9.913 -7.998 c -5.061 -3.628 -8.376 -9.545 -8.376 -16.233 c 0 -11.016 8.963 -19.979 19.979 -19.979 c 11.017 0 19.98 8.963 19.98 19.979 c 0 6.688 -3.315 12.604 -8.376 16.232 c 3.905 1.851 7.294 4.611 9.912 7.996 c 0.307 -0.834 0.811 -1.411 1.057 -1.657 c 0.487 -0.487 2.268 -1.996 4.787 -0.952 c 2.616 1.08 5.624 -0.165 6.709 -2.78 l 3.345 -8.074 C 83.495 45.958 82.249 42.949 79.636 41.865 z" style={{ fill: "#ffffff" }} />
                      <path d="M 44.999 24.18 c -7.514 0 -13.626 6.113 -13.626 13.626 s 6.113 13.626 13.626 13.626 s 13.627 -6.113 13.627 -13.626 S 52.513 24.18 44.999 24.18 z" style={{ fill: "#ffffff" }} />
                      <path d="M 65.84 78.626 c 0 -11.759 -9.79 -21.274 -21.646 -20.825 C 32.917 58.228 24.16 67.853 24.16 79.138 V 85.7 c 0 2.374 1.925 4.299 4.299 4.299 L 61.541 90 c 2.374 0 4.299 -1.924 4.299 -4.299 V 78.626 z" style={{ fill: "#ffffff" }} />
                    </g>
                  </svg>
                  : user.role === 'kitchen' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="170" height="170" viewBox="0 0 256 256" aria-hidden>
                      <g style={{ stroke: 'none', strokeWidth: 0, strokeDasharray: 'none', strokeLinecap: 'butt', strokeLinejoin: 'miter', strokeMiterlimit: 10, fill: 'none', fillRule: 'nonzero', opacity: 1 }} transform="translate(18.12918287937744 18.12918287937741) scale(2.43 2.43)">
                        <path d="M 55.222 62.02 H 34.778 c -8.794 0 -15.922 7.129 -15.922 15.922 V 90 h 11.49 V 77.816 c 0 -0.819 0.664 -1.484 1.484 -1.484 c 0.82 0 1.484 0.664 1.484 1.484 V 90 h 23.375 V 77.816 c 0 -0.819 0.664 -1.484 1.484 -1.484 c 0.819 0 1.484 0.664 1.484 1.484 V 90 h 11.49 V 77.942 C 71.144 69.148 64.016 62.02 55.222 62.02 z" style={{ stroke: 'none', strokeWidth: 1, strokeDasharray: 'none', strokeLinecap: 'butt', strokeLinejoin: 'miter', strokeMiterlimit: 10, fill: 'rgb(255,255,255)', fillRule: 'nonzero', opacity: 1 }} transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round" />
                        <path d="M 56.16 8.552 C 54.83 3.628 50.344 0 45 0 s -9.83 3.628 -11.16 8.552 c -6.228 0.187 -11.222 5.282 -11.222 11.555 c 0 4.853 2.988 9.009 7.224 10.728 c 1.04 0.422 1.687 1.474 1.687 2.596 v 4.596 h 26.942 l 0.001 -4.597 c 0 -1.123 0.646 -2.174 1.687 -2.596 c 4.237 -1.719 7.224 -5.874 7.224 -10.728 C 67.382 13.834 62.388 8.739 56.16 8.552 z M 37.686 31.56 c -0.078 0.012 -0.155 0.018 -0.232 0.018 c -0.718 0 -1.349 -0.522 -1.464 -1.253 c -0.548 -3.486 -1.565 -6.431 -3.024 -8.753 c -0.436 -0.694 -0.227 -1.61 0.467 -2.045 c 0.695 -0.436 1.61 -0.226 2.045 0.467 c 1.674 2.664 2.832 5.985 3.443 9.87 C 39.048 30.674 38.495 31.433 37.686 31.56 z M 46.484 30.095 c 0 0.82 -0.664 1.484 -1.484 1.484 s -1.484 -0.664 -1.484 -1.484 v -9.312 c 0 -0.82 0.664 -1.484 1.484 -1.484 s 1.484 0.664 1.484 1.484 V 30.095 z M 57.034 21.572 c -1.458 2.322 -2.476 5.267 -3.025 8.753 c -0.115 0.732 -0.746 1.253 -1.463 1.253 c -0.076 0 -0.155 -0.006 -0.233 -0.018 c -0.809 -0.127 -1.362 -0.887 -1.234 -1.696 c 0.61 -3.885 1.769 -7.206 3.442 -9.87 c 0.437 -0.695 1.353 -0.901 2.046 -0.467 C 57.26 19.963 57.47 20.878 57.034 21.572 z" style={{ stroke: 'none', strokeWidth: 1, strokeDasharray: 'none', strokeLinecap: 'butt', strokeLinejoin: 'miter', strokeMiterlimit: 10, fill: 'rgb(255,255,255)', fillRule: 'nonzero', opacity: 1 }} transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round" />
                        <path d="M 31.528 40.994 v 11.61 c 0 5.2 4.215 9.416 9.416 9.416 h 8.111 c 5.2 0 9.416 -4.215 9.416 -9.416 v -11.61 H 31.528 z M 39.744 48.011 c 0 -0.82 0.664 -1.484 1.484 -1.484 s 1.484 0.664 1.484 1.484 v 0.623 c 0 0.819 -0.664 1.484 -1.484 1.484 s -1.484 -0.664 -1.484 -1.484 V 48.011 z M 49.645 56.033 c -1.519 1.105 -3.082 1.658 -4.645 1.658 s -3.125 -0.552 -4.645 -1.658 c -0.663 -0.482 -0.809 -1.41 -0.327 -2.073 c 0.481 -0.662 1.409 -0.81 2.072 -0.326 c 2.005 1.458 3.793 1.458 5.8 0 c 0.659 -0.483 1.59 -0.338 2.072 0.327 C 50.454 54.624 50.308 55.551 49.645 56.033 z M 50.256 48.634 c 0 0.819 -0.664 1.484 -1.484 1.484 c -0.819 0 -1.484 -0.664 -1.484 -1.484 v -0.623 c 0 -0.82 0.664 -1.484 1.484 -1.484 c 0.819 0 1.484 0.664 1.484 1.484 V 48.634 z" style={{ stroke: 'none', strokeWidth: 1, strokeDasharray: 'none', strokeLinecap: 'butt', strokeLinejoin: 'miter', strokeMiterlimit: 10, fill: 'rgb(255,255,255)', fillRule: 'nonzero', opacity: 1 }} transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round" />
                      </g>
                    </svg>
                  ) : (
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
                  )}
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
                  {key}
                </button>
              ))
            )}
          </div>
          <button
            type="button"
            className="w-full mt-4 py-5 bg-green-600 text-white rounded-lg text-4xl font-semibold hover:bg-green-700"
            onClick={handleSubmit}
          >
            Login
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
