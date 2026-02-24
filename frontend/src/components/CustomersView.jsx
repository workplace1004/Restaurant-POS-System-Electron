import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './Header';
import { LeftSidebar } from './LeftSidebar';

const API = '/api';

const ROW1 = 'q w e r t y u i o p';
const ROW2 = 'a s d f g h j k l';
const ROW3 = 'z x c v b n m , €';
const NUMPAD = [
  ['7', '8', '9'],
  ['4', '5', '6'],
  ['1', '2', '3'],
  ['-', '0', '.']
];

export function CustomersView({
  time,
  categories,
  selectedCategoryId,
  onSelectCategory,
  webordersCount,
  inPlanningCount,
  onBack
}) {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [search, setSearch] = useState({ companyName: '', name: '', street: '', phone: '' });
  const activeInputRef = React.useRef(null);
  const [listScroll, setListScroll] = useState(0);

  const fetchCustomers = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search.companyName) params.set('companyName', search.companyName);
      if (search.name) params.set('name', search.name);
      if (search.street) params.set('street', search.street);
      if (search.phone) params.set('phone', search.phone);
      const res = await fetch(`${API}/customers?${params}`);
      const data = res.ok ? await res.json() : [];
      setCustomers(Array.isArray(data) ? data : []);
    } catch {
      setCustomers([]);
    }
  }, [search.companyName, search.name, search.street, search.phone]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleKey = (key) => {
    const el = activeInputRef.current;
    if (!el) return;
    if (key === '←' || key === '<—') {
      el.value = el.value.slice(0, -1);
    } else if (key.length === 1) {
      const start = el.selectionStart ?? el.value.length;
      const end = el.selectionEnd ?? el.value.length;
      const next = el.value.slice(0, start) + key + el.value.slice(end);
      el.value = next;
      el.setSelectionRange(start + 1, start + 1);
    }
    const name = el.name;
    if (name) setSearch((s) => ({ ...s, [name]: el.value }));
    el.dispatchEvent(new Event('input', { bubbles: true }));
  };

  const setActiveInput = (e) => {
    activeInputRef.current = e.target;
  };

  return (
    <div className="flex flex-col h-full bg-pos-bg text-pos-text">
      <Header
        time={time}
        webordersCount={webordersCount}
        inPlanningCount={inPlanningCount}
      />
      <div className="flex flex-1 min-h-0">
        <LeftSidebar
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={onSelectCategory}
        />

        <main className="flex-1 flex flex-col min-w-0 p-4 bg-pos-bg">
          <div className="grid grid-cols-[auto_1fr_auto_1fr_auto_1fr_auto_1fr] items-center gap-x-4 gap-y-2 mb-3 text-base">
            <label className="whitespace-nowrap">Company Name:</label>
            <input
              type="text"
              name="companyName"
              value={search.companyName}
              onChange={(e) => setSearch((s) => ({ ...s, companyName: e.target.value }))}
              onFocus={setActiveInput}
              className="min-w-[100px] py-2 px-3 bg-pos-panel border border-pos-inputBorder rounded text-pos-text text-base"
            />
            <label className="whitespace-nowrap">Name:</label>
            <input
              type="text"
              name="name"
              value={search.name}
              onChange={(e) => setSearch((s) => ({ ...s, name: e.target.value }))}
              onFocus={setActiveInput}
              className="min-w-[100px] py-2 px-3 bg-pos-panel border border-pos-inputBorder rounded text-pos-text text-base"
            />
            <label className="whitespace-nowrap">Street + House Number:</label>
            <input
              type="text"
              name="street"
              value={search.street}
              onChange={(e) => setSearch((s) => ({ ...s, street: e.target.value }))}
              onFocus={setActiveInput}
              className="min-w-[100px] py-2 px-3 bg-pos-panel border border-pos-inputBorder rounded text-pos-text text-base"
            />
            <label className="whitespace-nowrap">Phone:</label>
            <input
              type="text"
              name="phone"
              value={search.phone}
              onChange={(e) => setSearch((s) => ({ ...s, phone: e.target.value }))}
              onFocus={setActiveInput}
              className="min-w-[100px] py-2 px-3 bg-pos-panel border border-pos-inputBorder rounded text-pos-text text-base"
            />
          </div>

          <div className="flex-1 min-h-0 flex flex-col bg-pos-panel rounded-lg overflow-hidden">
            <table className="w-full border-collapse text-base flex-1">
              <thead>
                <tr>
                  <th className="text-left py-3 px-3 bg-pos-bg text-pos-muted font-medium text-base">Company Name</th>
                  <th className="text-left py-3 px-3 bg-pos-bg text-pos-muted font-medium text-base">Name</th>
                  <th className="text-left py-3 px-3 bg-pos-bg text-pos-muted font-medium text-base">Street + House Number</th>
                  <th className="text-left py-3 px-3 bg-pos-bg text-pos-muted font-medium text-base">Phone</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr
                    key={c.id}
                    className={`py-3 px-3 border-b border-pos-rowHover hover:bg-pos-rowHover cursor-pointer text-base ${
                      selectedCustomer?.id === c.id ? 'bg-pos-surface text-white' : ''
                    }`}
                    onClick={() => setSelectedCustomer(c)}
                  >
                    <td className="py-3 px-3">{c.companyName || ''}</td>
                    <td className="py-3 px-3">{c.name}</td>
                    <td className="py-3 px-3">{c.street || ''}</td>
                    <td className="py-3 px-3">{c.phone || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex gap-2 py-2 px-2 border-t border-pos-rowHover bg-pos-bg">
              <button type="button" className="py-2 px-3 bg-pos-panel border-none rounded text-pos-text text-base hover:bg-pos-surface" onClick={() => setListScroll((s) => Math.max(0, s - 1))}>
                ↑
              </button>
              <button type="button" className="py-2 px-3 bg-pos-panel border-none rounded text-pos-text text-base hover:bg-pos-surface" onClick={() => setListScroll((s) => s + 1)}>
                ↓
              </button>
            </div>
          </div>
        </main>

        <aside className="w-[180px] shrink-0 flex flex-col gap-2 p-4 bg-pos-bg border-l border-pos-border">
          <button type="button" className="py-3 px-3 bg-pos-surface border-none rounded-md text-pos-text text-base text-left hover:bg-pos-surface-hover">
            New Customer
          </button>
          <button type="button" className="py-3 px-3 bg-pos-surface border-none rounded-md text-pos-text text-base text-left hover:bg-pos-surface-hover">
            Edit Customer
          </button>
          <button type="button" className="py-3 px-3 bg-pos-surface border-none rounded-md text-pos-text text-base text-left hover:bg-pos-surface-hover">
            History
          </button>
          <button type="button" className="py-3 px-3 bg-pos-surface border-none rounded-md text-pos-text text-base text-left hover:bg-pos-surface-hover">
            Pick-up
          </button>
          <button type="button" className="py-3 px-3 bg-pos-surface border-none rounded-md text-pos-text text-base text-left hover:bg-pos-surface-hover">
            Deliver
          </button>
          <button type="button" className="py-3 px-3 bg-pos-surface border-none rounded-md text-pos-text text-base text-left hover:bg-pos-surface-hover mt-auto">
            None
          </button>
        </aside>
      </div>

      <div className="flex gap-2 py-3 px-4 bg-pos-bg border-t border-pos-border shrink-0">
        <button type="button" className="py-2 px-4 bg-pos-panel border-none rounded text-pos-text text-base hover:bg-pos-surface" onClick={onBack}>
          Back
        </button>
        <button type="button" className="py-2 px-4 bg-pos-panel border-none rounded text-pos-text text-base hover:bg-pos-surface">
          New Reservation
        </button>
        <button type="button" className="py-2 px-4 bg-pos-panel border-none rounded text-pos-text text-base hover:bg-pos-surface">
          No Customer
        </button>
        <button type="button" className="py-2 px-4 bg-pos-panel border-none rounded text-pos-text text-base hover:bg-pos-surface">
          Select Customer
        </button>
      </div>

      <footer className="flex items-center gap-6 py-3 px-4 bg-pos-bg border-t border-pos-border shrink-0">
        <div className="flex items-center gap-2 text-base font-medium">
          <span className="text-lg">☁</span>
          CloudPOS
        </div>
      </footer>

      <div className="flex gap-4 py-3 px-4 bg-pos-dark border-t border-pos-border shrink-0">
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex gap-1.5 justify-start">
            {ROW1.split(' ').map((k) => (
              <button key={k} type="button" className="min-w-9 py-2 px-2.5 bg-pos-panel border-none rounded text-pos-text text-base hover:bg-pos-surface" onClick={() => handleKey(k)}>
                {k}
              </button>
            ))}
            <button type="button" className="min-w-12 py-2 px-2.5 bg-pos-panel border-none rounded text-pos-text text-base hover:bg-pos-surface" onClick={() => handleKey('←')}>
              ←
            </button>
          </div>
          <div className="flex gap-1.5 justify-start">
            <span className="min-w-9 py-2 px-2.5 bg-pos-panel rounded text-pos-text text-base opacity-80 cursor-default">↑</span>
            {ROW2.split(' ').map((k) => (
              <button key={k} type="button" className="min-w-9 py-2 px-2.5 bg-pos-panel border-none rounded text-pos-text text-base hover:bg-pos-surface" onClick={() => handleKey(k)}>
                {k}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5 justify-start">
            {ROW3.split(' ').map((k) => (
              <button key={k} type="button" className="min-w-9 py-2 px-2.5 bg-pos-panel border-none rounded text-pos-text text-base hover:bg-pos-surface" onClick={() => handleKey(k)}>
                {k}
              </button>
            ))}
            <button type="button" className="min-w-9 py-2 px-2.5 bg-pos-panel border-none rounded text-pos-text text-base hover:bg-pos-surface" onClick={() => handleKey('@')}>
              @
            </button>
            <button type="button" className="min-w-9 py-2 px-2.5 bg-pos-panel border-none rounded text-pos-text text-base hover:bg-pos-surface" onClick={() => handleKey('/')}>
              /
            </button>
          </div>
          <div className="flex gap-1.5 justify-start">
            <button type="button" className="min-w-9 py-2 px-2.5 bg-pos-panel border-none rounded text-pos-text text-base hover:bg-pos-surface">
              ←
            </button>
            <button type="button" className="min-w-9 py-2 px-2.5 bg-pos-panel border-none rounded text-pos-text text-base hover:bg-pos-surface">
              →
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-2 justify-end">
          {NUMPAD.map((row, i) => (
            <div key={i} className="flex gap-1.5 justify-end">
              {row.map((k) => (
                <button key={k} type="button" className="min-w-9 py-2 px-2.5 bg-pos-panel border-none rounded text-pos-text text-base hover:bg-pos-surface" onClick={() => handleKey(k)}>
                  {k}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
