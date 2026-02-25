import React, { useState, useEffect, useCallback } from 'react';
import { Dropdown } from './Dropdown';
import { DeleteConfirmModal } from './DeleteConfirmModal';

const API = '/api';

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

const VAT_OPTIONS = [
  { value: 'standard', label: 'Standard' },
  { value: 'take-out', label: 'Take-out' },
  { value: 'eat-in', label: 'Eat-in' }
];

const QWERTY_ROW1 = 'a z e r t y u i o p'.split(' ');
const QWERTY_ROW2 = 'q s d f g h j k l m'.split(' ');
const QWERTY_ROW3 = 'w x c v b n , €'.split(' ');
const NUMPAD = [['7', '8', '9'], ['4', '5', '6'], ['1', '2', '3'], ['-', '0', '.']];

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
  const [priceGroups, setPriceGroups] = useState([]);
  const [priceGroupsLoading, setPriceGroupsLoading] = useState(false);
  const [showPriceGroupModal, setShowPriceGroupModal] = useState(false);
  const [editingPriceGroupId, setEditingPriceGroupId] = useState(null);
  const [priceGroupName, setPriceGroupName] = useState('');
  const [priceGroupTax, setPriceGroupTax] = useState('standard');
  const [keyboardUppercase, setKeyboardUppercase] = useState(false);
  const [savingPriceGroup, setSavingPriceGroup] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchPriceGroups = useCallback(async () => {
    setPriceGroupsLoading(true);
    try {
      const res = await fetch(`${API}/price-groups`);
      const data = await res.json();
      setPriceGroups(Array.isArray(data) ? data : []);
    } catch {
      setPriceGroups([]);
    } finally {
      setPriceGroupsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (subNavId === 'Price Groups') fetchPriceGroups();
  }, [subNavId, fetchPriceGroups]);

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    onLogout?.();
  };

  const openPriceGroupModal = () => {
    setEditingPriceGroupId(null);
    setPriceGroupName('');
    setPriceGroupTax('standard');
    setKeyboardUppercase(false);
    setShowPriceGroupModal(true);
  };

  const openEditPriceGroupModal = (pg) => {
    setEditingPriceGroupId(pg.id);
    setPriceGroupName(pg.name || '');
    setPriceGroupTax(pg.tax && VAT_OPTIONS.some((o) => o.value === pg.tax) ? pg.tax : 'standard');
    setKeyboardUppercase(false);
    setShowPriceGroupModal(true);
  };

  const closePriceGroupModal = () => {
    setShowPriceGroupModal(false);
    setEditingPriceGroupId(null);
  };

  const keyDisplay = (k) => (/^[a-z]$/.test(k) ? (keyboardUppercase ? k.toUpperCase() : k) : k);
  const sendKey = (char) => {
    if (char === 'Backspace') setPriceGroupName((prev) => prev.slice(0, -1));
    else setPriceGroupName((prev) => prev + char);
  };
  const sendLetterOrSymbol = (k) => {
    if (/^[a-z]$/.test(k)) sendKey(keyboardUppercase ? k.toUpperCase() : k);
    else sendKey(k);
  };

  const handleSavePriceGroup = async () => {
    setSavingPriceGroup(true);
    const payload = { name: priceGroupName.trim() || 'New price group', tax: priceGroupTax };
    try {
      if (editingPriceGroupId) {
        const res = await fetch(`${API}/price-groups/${editingPriceGroupId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const updated = await res.json();
        if (res.ok && updated) {
          setPriceGroups((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
          closePriceGroupModal();
        } else fetchPriceGroups();
      } else {
        const res = await fetch(`${API}/price-groups`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const created = await res.json();
        if (res.ok && created) {
          setPriceGroups((prev) => [...prev, created]);
          closePriceGroupModal();
        } else fetchPriceGroups();
      }
    } catch {
      fetchPriceGroups();
    } finally {
      setSavingPriceGroup(false);
    }
  };

  const handleDeletePriceGroup = async (id) => {
    try {
      const res = await fetch(`${API}/price-groups/${id}`, { method: 'DELETE' });
      if (res.ok) setPriceGroups((prev) => prev.filter((p) => p.id !== id));
      else fetchPriceGroups();
    } catch {
      fetchPriceGroups();
    } finally {
      setDeleteConfirmId(null);
    }
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
          {subNavId === 'Price Groups' ? (
            <div className="rounded-xl border border-pos-border bg-pos-panel/30 p-8 min-h-[300px]">
              <div className="flex items-center w-full  justify-center mb-6">
                <button
                  type="button"
                  className="px-6 py-3 rounded-lg text-xl font-medium bg-pos-panel border border-pos-border text-pos-text hover:bg-pos-bg hover:border-white/30 transition-colors disabled:opacity-50"
                  disabled={priceGroupsLoading}
                  onClick={openPriceGroupModal}
                >
                  New price group
                </button>
              </div>
              <ul className="w-full flex justify-center items-center flex flex-col h-full">
                {priceGroupsLoading ? (
                  <li className="text-pos-muted text-lg py-4">Loading price groups…</li>
                ) : priceGroups.length === 0 ? (
                  <li className="text-pos-muted text-3xl py-4">No price groups yet.</li>
                ) : (
                  priceGroups.map((pg) => (
                    <li
                      key={pg.id}
                      className="flex items-center w-full justify-between px-4 py-3 bg-pos-bg border-y border-pos-panel text-pos-text text-lg"
                    >
                      <span className="font-medium">{pg.name}</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="p-2 rounded text-pos-text mr-20 hover:bg-pos-panel"
                          onClick={() => openEditPriceGroupModal(pg)}
                          aria-label="Edit"
                        >
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button
                          type="button"
                          className="p-2 rounded text-pos-text hover:bg-pos-panel"
                          onClick={() => setDeleteConfirmId(pg.id)}
                          aria-label="Delete"
                        >
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          ) : (
            <div className="rounded-xl border border-pos-border bg-pos-panel/30 p-8 min-h-[300px] flex items-center justify-center">
              <p className="text-pos-muted text-xl">
                Select a section above to manage {subNavId.toLowerCase()}.
              </p>
            </div>
          )}
        </main>
      </div>

      <DeleteConfirmModal
        open={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => handleDeletePriceGroup(deleteConfirmId)}
        message="Are you sure you want to delete this price group?"
      />

      {/* New price group modal */}
      {showPriceGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={closePriceGroupModal}>
          <div className="bg-pos-bg rounded-xl shadow-2xl max-w-[1450px] w-full justify-center items-center mx-4 overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 flex flex-col space-y-6 w-full justify-center items-center">
              <div className='w-full flex flex-col h-[400px] justify-center items-center gap-10'>
                <div className="flex gap-2 w-full items-center justify-center h-[100px]">
                  <label className="block text-3xl pr-[50px] font-medium text-gray-200 mb-2">Name : </label>
                  <input
                    type="text"
                    readOnly
                    value={priceGroupName}
                    placeholder="Enter name"
                    className="px-4 w-[300px] bg-pos-panel h-[60px] py-3 text-2xl border border-gray-300 rounded-lg text-gray-200"
                  />
                </div>
                <div className="flex gap-2 w-full items-center justify-center h-[100px]">
                  <label className="block text-3xl pr-[80px] font-medium text-gray-200 mb-2">VAT : </label>
                  <Dropdown
                    options={VAT_OPTIONS}
                    value={priceGroupTax}
                    onChange={setPriceGroupTax}
                    placeholder="Select VAT"
                    className="text-2xl min-w-[300px]"
                  />
                </div>
              </div>
              <div className="flex justify-center">
                <button
                  type="button"
                  className="flex items-center text-4xl gap-4 px-6 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50"
                  disabled={savingPriceGroup}
                  onClick={handleSavePriceGroup}
                >
                  <svg fill="#ffffff" width="30px" height="30px" viewBox="0 0 16 16" id="save-16px" xmlns="http://www.w3.org/2000/svg">
                    <path id="Path_42" data-name="Path 42" d="M-5.732,2.97-7.97.732a2.474,2.474,0,0,0-1.483-.7A.491.491,0,0,0-9.591,0H-18.5A2.5,2.5,0,0,0-21,2.5v11A2.5,2.5,0,0,0-18.5,16h11A2.5,2.5,0,0,0-5,13.5V4.737A2.483,2.483,0,0,0-5.732,2.97ZM-13,1V5.455h-3.591V1Zm-4.272,14V10.545h8.544V15ZM-6,13.5A1.5,1.5,0,0,1-7.5,15h-.228V10.045a.5.5,0,0,0-.5-.5h-9.544a.5.5,0,0,0-.5.5V15H-18.5A1.5,1.5,0,0,1-20,13.5V2.5A1.5,1.5,0,0,1-18.5,1h.909V5.955a.5.5,0,0,0,.5.5h7.5a.5.5,0,0,0,.5-.5v-4.8a1.492,1.492,0,0,1,.414.285l2.238,2.238A1.511,1.511,0,0,1-6,4.737Z" transform="translate(21)" />
                  </svg>
                  Save
                </button>
              </div>
            </div>
            {/* On-screen keyboard */}
            <div className="p-4 flex gap-4 flex-wrap">
              <div className="flex gap-16">
                <div className="flex flex-col gap-1">
                  <div className="flex gap-1">
                    {QWERTY_ROW1.map((k) => (
                      <button key={k} type="button" className="w-[100px] bg-pos-panel h-[100px] rounded text-white text-5xl hover:bg-pos-panel/50" onClick={() => sendLetterOrSymbol(k)}>{keyDisplay(k)}</button>
                    ))}
                  </div>
                  <div className="flex gap-1">
                    {QWERTY_ROW2.map((k) => (
                      <button key={k} type="button" className="w-[100px] bg-pos-panel h-[100px] rounded text-white text-5xl hover:bg-pos-panel/50" onClick={() => sendLetterOrSymbol(k)}>{keyDisplay(k)}</button>
                    ))}
                  </div>
                  <div className="flex gap-1">
                    {QWERTY_ROW3.map((k) => (
                      <button key={k} type="button" className="w-[100px] bg-pos-panel h-[100px] rounded text-white text-5xl hover:bg-pos-panel/50" onClick={() => sendLetterOrSymbol(k)}>{keyDisplay(k)}</button>
                    ))}
                    <button type="button" className="w-[100px] bg-pos-panel h-[100px] rounded text-white hover:bg-pos-panel/50 text-5xl w-[204px]" onClick={() => sendKey('Backspace')}>←</button>
                  </div>
                  <div className="flex gap-1">
                    <button type="button" className={`w-[100px] bg-pos-panel h-[100px] rounded text-5xl text-white ${keyboardUppercase ? 'bg-blue-200 ring-2 ring-blue-500' : 'bg-pos'} text-gray-800 hover:bg-pos-panel/50`} onClick={() => setKeyboardUppercase((p) => !p)}>↑</button>
                    <button type="button" className="w-[100px] bg-pos-panel h-[100px] rounded text-white text-5xl hover:bg-pos-panel/50" onClick={() => sendKey('@')}>@</button>
                    <button type="button" className="w-[100px] bg-pos-panel h-[100px] rounded text-white text-5xl hover:bg-pos-panel/50" onClick={() => sendKey('/')}>/</button>
                    <button type="button" className="bg-pos-panel rounded hove-white w-[412px]" onClick={() => sendKey(' ')} aria-label="Space" />
                    <button type="button" className="w-[100px] bg-pos-panel h-[100px] rounded text-5xl text-white hover:bg-pos-panel/50" onClick={() => sendKey('Backspace')}>_</button>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  {NUMPAD.map((row, i) => (
                    <div key={i} className="flex gap-1">
                      {row.map((k) => (
                        <button key={k} type="button" className="w-[100px] h-[100px] bg-pos-panel rounded text-white text-5xl hover:bg-pos-panel/50" onClick={() => sendKey(k)}>{k}</button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
