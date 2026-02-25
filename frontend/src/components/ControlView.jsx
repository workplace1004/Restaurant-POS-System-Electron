import React, { useState } from 'react';

const CONTROL_SIDEBAR_ITEMS = [
  { id: 'personalize', label: 'Personalize Cash Register', icon: 'monitor' },
  { id: 'reports', label: 'Reports', icon: 'chart' },
  { id: 'users', label: 'Users', icon: 'users' }
];

const TOP_NAV_ITEMS = [
  { id: 'categories-products', label: 'Categories and products', icon: 'box' },
  { id: 'cash-register', label: 'Cash Register Settings', icon: 'gear' },
  { id: 'external-devices', label: 'External Devices', icon: 'printer' },
  { id: 'tables', label: 'Tables', icon: 'table' }
];

const SUB_NAV_ITEMS = [
  'Price Groups',
  'Categories',
  'Products',
  'Subproducts',
  'Kitchen messages',
  'Discounts'
];

function IconMonitor({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function IconChart({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function IconUsers({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function IconBox({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}

function IconGear({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function IconPrinter({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2h-2m-4-1v4m0 16v-7a2 2 0 00-2-2H9a2 2 0 00-2 2v7a2 2 0 002 2z" />
    </svg>
  );
}

function IconTable({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

function SidebarIcon({ id, className }) {
  if (id === 'monitor') return <IconMonitor className={className} />;
  if (id === 'chart') return <IconChart className={className} />;
  if (id === 'users') return <IconUsers className={className} />;
  return null;
}

function TopNavIcon({ id, className }) {
  if (id === 'box') return <IconBox className={className} />;
  if (id === 'gear') return <IconGear className={className} />;
  if (id === 'printer') return <IconPrinter className={className} />;
  if (id === 'table') return <IconTable className={className} />;
  return null;
}

export function ControlView({ currentUser, onLogout, onBack }) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [controlSidebarId, setControlSidebarId] = useState('personalize');
  const [topNavId, setTopNavId] = useState('categories-products');
  const [subNavId, setSubNavId] = useState('Price Groups');

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    onLogout?.();
  };

  return (
    <div className="flex h-full bg-pos-bg text-pos-text">
      {/* Control left sidebar */}
      <aside className="w-[330px] shrink-0 flex flex-col bg-pos-panel border-r border-pos-border">
        <nav className="flex flex-col gap-0.5 flex-1 p-3">
          {CONTROL_SIDEBAR_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`flex items-center gap-3 px-5 py-5 rounded-lg text-left text-3xl transition-colors ${controlSidebarId === item.id
                ? 'bg-pos-bg text-pos-text font-medium'
                : 'text-pos-muted hover:bg-pos-bg/50 hover:text-pos-text'
                }`}
              onClick={() => setControlSidebarId(item.id)}
            >
              <SidebarIcon id={item.icon} className="w-8 h-8 shrink-0" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 w-full flex flex-col items-center space-y-5">
          {currentUser && (
            <p className="text-pos-text text-3xl font-medium truncate px-1">{currentUser.label}</p>
          )}
          <div className="flex flex-col gap-1">
            <button
              type="button"
              className="text-left px-3 py-2 rounded-lg text-pos-muted hover:text-pos-text hover:bg-pos-bg/50 text-3xl"
              onClick={() => setShowLogoutModal(true)}
            >
              Log out
            </button>
          </div>
          <div className="px-16 mt-10 py-3 flex justify-center border-t border-gray-500">
            <button
              type="button"
              className="text-left px-3 py-2 rounded-lg text-pos-muted hover:text-pos-text hover:bg-pos-bg/50 text-3xl"
              onClick={onBack}
            >
              Back
            </button>

          </div>
          <div className="flex flex-wrap gap-2 text-xl font-semibold text-white">
            <button type="button" className="px-3.5 py-2.5 rounded-md bg-pos-bg hover:text-pos-text border border-pos-border">
              Info
            </button>
            <button type="button" className="px-3.5 py-2.5 rounded-md bg-pos-bg hover:text-pos-text border border-pos-border">
              Changelog
            </button>
            <button type="button" className="px-3.5 py-2.5 rounded-md bg-pos-bg hover:text-pos-text border border-pos-border">
              Backup
            </button>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Top navigation */}
        <div className="flex items-center gap-1 p-4 px-10 justify-around w-full bg-pos-bg/50">
          {TOP_NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`flex items-center gap-2 px-5 py-3 rounded-lg text-3xl transition-colors ${topNavId === item.id
                ? 'bg-pos-panel text-pos-text font-medium border border-pos-border'
                : 'text-pos-muted hover:text-pos-text hover:bg-pos-panel/50 border border-transparent'
                }`}
              onClick={() => setTopNavId(item.id)}
            >
              <TopNavIcon id={item.icon} className="w-8 h-8 shrink-0" />
              {item.label}
            </button>
          ))}
        </div>

        {/* Sub-navigation */}
        <div className="flex items-center w-full justify-around gap-1 px-4 py-3 bg-pos-bg">
          {SUB_NAV_ITEMS.map((label) => (
            <button
              key={label}
              type="button"
              className={`px-4 py-2 rounded-lg text-2xl transition-colors ${subNavId === label
                ? 'bg-pos-panel text-pos-text font-medium'
                : 'text-pos-muted hover:text-pos-text hover:bg-pos-panel/50'
                }`}
              onClick={() => setSubNavId(label)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Content area */}
        <main className="flex-1 overflow-auto p-6">
          <div className="rounded-xl border border-pos-border bg-pos-panel/30 p-8 min-h-[300px] flex items-center justify-center">
            <p className="text-pos-muted text-xl">
              Select a section above to manage {subNavId.toLowerCase()}.
            </p>
          </div>
        </main>
      </div>

      {/* Logout confirmation modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowLogoutModal(false)}>
          <div className="bg-pos-panel border border-pos-border rounded-xl shadow-xl p-8 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <p className="text-pos-text text-2xl mb-8 text-center">Are you sure you want to log out?</p>
            <div className="flex gap-4 justify-center">
              <button
                type="button"
                className="px-8 py-4 rounded-lg text-xl font-medium bg-pos-bg text-pos-text hover:bg-gray-700 border border-pos-border"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-8 py-4 rounded-lg text-xl font-medium bg-red-600 text-white hover:bg-red-700"
                onClick={handleLogoutConfirm}
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
