import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const API = '/api';
const ROW1_KEYS = 'a z e r t y u i o p'.split(' ');
const ROW2_KEYS = 'q s d f g h j k l m'.split(' ');
const ROW3_KEYS = 'w x c v b n , €'.split(' ');
const NUMPAD_KEYS = [['7', '8', '9'], ['4', '5', '6'], ['1', '2', '3'], ['-', '0', '.']];
const KEY_STYLE = 'w-[100px] h-[60px] bg-pos-panel rounded text-white text-4xl hover:bg-pos-panel/80 border border-transparent transition-colors';
const INPUT_STYLE = 'w-full py-3 px-3 bg-pos-bg border border-pos-panel text-pos-text outline-none';
const EMPTY_NEW_CUSTOMER = {
  companyName: '',
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  discount: '',
  priceGroup: 'Uitgeschakeld',
  streetHouseNumber: '',
  postalCode: '',
  city: '',
  vatNumber: '',
  loyaltyBarcode: '',
  loyaltyTag: ''
};

export function CustomersView({
  onBack
}) {
  const { t } = useLanguage();
  const [uppercase, setUppercase] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [search, setSearch] = useState({ companyName: '', name: '', street: '', phone: '' });
  const [quickSearch, setQuickSearch] = useState('');
  const [isNewCustomerMode, setIsNewCustomerMode] = useState(false);
  const [isSavingCustomer, setIsSavingCustomer] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState(EMPTY_NEW_CUSTOMER);
  const activeInputRef = useRef(null);
  const listRef = useRef(null);

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

  const setActiveInput = (e) => {
    activeInputRef.current = e.target;
  };

  const handleKeyboardChange = (nextValue) => {
    const el = activeInputRef.current;
    if (!el) return;
    const name = el.name;
    if (!name) return;
    if (name === 'quickSearch') {
      setQuickSearch(nextValue);
      return;
    }
    if (isNewCustomerMode) {
      setNewCustomerForm((s) => ({ ...s, [name]: nextValue }));
      return;
    }
    setSearch((s) => ({ ...s, [name]: nextValue }));
  };

  const activeValue = activeInputRef.current?.name
    ? (activeInputRef.current.name === 'quickSearch'
      ? quickSearch
      : isNewCustomerMode
      ? (newCustomerForm[activeInputRef.current.name] || '')
      : (search[activeInputRef.current.name] || ''))
    : '';

  const displayKey = (key) => (/^[a-z]$/.test(key) ? (uppercase ? key.toUpperCase() : key) : key);

  const pressKey = (key) => {
    if (key === 'Backspace') {
      handleKeyboardChange(activeValue.slice(0, -1));
      return;
    }
    handleKeyboardChange(activeValue + key);
  };

  const pressLetterOrSymbol = (key) => {
    if (/^[a-z]$/.test(key)) {
      pressKey(uppercase ? key.toUpperCase() : key);
      return;
    }
    pressKey(key);
  };

  const scrollList = (direction) => {
    if (!listRef.current) return;
    listRef.current.scrollBy({ top: direction * 120, behavior: 'smooth' });
  };

  const openNewCustomerMode = () => {
    activeInputRef.current = null;
    setNewCustomerForm(EMPTY_NEW_CUSTOMER);
    setIsNewCustomerMode(true);
  };

  const cancelNewCustomerMode = () => {
    activeInputRef.current = null;
    setIsNewCustomerMode(false);
    setIsSavingCustomer(false);
    setNewCustomerForm(EMPTY_NEW_CUSTOMER);
  };

  const saveNewCustomer = async () => {
    if (isSavingCustomer) return;
    setIsSavingCustomer(true);
    try {
      const fullName = `${newCustomerForm.firstName} ${newCustomerForm.lastName}`.trim();
      const payload = {
        companyName: newCustomerForm.companyName.trim(),
        name: fullName || 'New customer',
        street: [newCustomerForm.streetHouseNumber, newCustomerForm.postalCode, newCustomerForm.city]
          .map((v) => v.trim())
          .filter(Boolean)
          .join(' '),
        phone: newCustomerForm.phone.trim()
      };
      const response = await fetch(`${API}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('Failed to save customer');
      await fetchCustomers();
      cancelNewCustomerMode();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSavingCustomer(false);
    }
  };

  const normalizedQuickSearch = quickSearch.trim().toLowerCase();
  const visibleCustomers = normalizedQuickSearch
    ? customers.filter((customer) => [customer.companyName, customer.name, customer.street, customer.phone]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalizedQuickSearch)))
    : customers;

  return (
    <div className="flex flex-col h-full bg-pos-bg text-pos-text p-3 gap-3">
      <div className="flex flex-1 min-h-0 gap-3">
        <main className="flex-1 min-w-0 flex flex-col">
          {isNewCustomerMode ? (
            <div className="flex-1 min-h-0 border border-pos-panel rounded-md p-6">
              <div className="grid grid-cols-3 gap-8 h-full">
                <div>
                  <div>
                    <label className="block text-2xl font-semibold w-full flex justify-center mb-1 pb-1">Firmanaam:</label>
                    <input name="companyName" value={newCustomerForm.companyName} onFocus={setActiveInput} onChange={(e) => setNewCustomerForm((s) => ({ ...s, companyName: e.target.value }))} className={INPUT_STYLE} />
                  </div>
                  <div className='pt-4'>
                    <label className="block text-2xl font-semibold w-full flex justify-center mb-1">Voornaam:</label>
                    <input name="firstName" value={newCustomerForm.firstName} onFocus={setActiveInput} onChange={(e) => setNewCustomerForm((s) => ({ ...s, firstName: e.target.value }))} className={INPUT_STYLE} />
                  </div>
                  <div className='pt-4'>
                    <label className="block text-2xl font-semibold w-full flex justify-center mb-1">Naam:</label>
                    <input name="lastName" value={newCustomerForm.lastName} onFocus={setActiveInput} onChange={(e) => setNewCustomerForm((s) => ({ ...s, lastName: e.target.value }))} className={INPUT_STYLE} />
                  </div>
                  <div className='pt-4'>
                    <label className="block text-2xl font-semibold w-full flex justify-center mb-1">Telefoon:</label>
                    <input name="phone" value={newCustomerForm.phone} onFocus={setActiveInput} onChange={(e) => setNewCustomerForm((s) => ({ ...s, phone: e.target.value }))} className={INPUT_STYLE} />
                  </div>
                  <div className='pt-4'>
                    <label className="block text-2xl font-semibold w-full flex justify-center mb-1">E-mail:</label>
                    <input name="email" value={newCustomerForm.email} onFocus={setActiveInput} onChange={(e) => setNewCustomerForm((s) => ({ ...s, email: e.target.value }))} className={INPUT_STYLE} />
                  </div>
                  <div className='pt-4'>
                    <label className="block text-2xl font-semibold w-full flex justify-center mb-1">Korting:</label>
                    <input name="discount" value={newCustomerForm.discount} onFocus={setActiveInput} onChange={(e) => setNewCustomerForm((s) => ({ ...s, discount: e.target.value }))} className={INPUT_STYLE} />
                  </div>
                  <div className='pt-4'>
                    <label className="block text-2xl font-semibold w-full flex justify-center mb-1">Prijsgroep:</label>
                    <select name="priceGroup" value={newCustomerForm.priceGroup} onChange={(e) => setNewCustomerForm((s) => ({ ...s, priceGroup: e.target.value }))} className={INPUT_STYLE}>
                      <option value="Uitgeschakeld">Uitgeschakeld</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-2xl font-semibold w-full flex justify-center mb-1">Straat + Huisnummer:</label>
                    <input name="streetHouseNumber" value={newCustomerForm.streetHouseNumber} onFocus={setActiveInput} onChange={(e) => setNewCustomerForm((s) => ({ ...s, streetHouseNumber: e.target.value }))} className={INPUT_STYLE} />
                  </div>
                  <div className='pt-4'>
                    <label className="block text-2xl font-semibold w-full flex justify-center mb-1">Postcode:</label>
                    <input name="postalCode" value={newCustomerForm.postalCode} onFocus={setActiveInput} onChange={(e) => setNewCustomerForm((s) => ({ ...s, postalCode: e.target.value }))} className={INPUT_STYLE} />
                  </div>
                  <div className='pt-4'>
                    <label className="block text-2xl font-semibold w-full flex justify-center mb-1">Gemeente:</label>
                    <input name="city" value={newCustomerForm.city} onFocus={setActiveInput} onChange={(e) => setNewCustomerForm((s) => ({ ...s, city: e.target.value }))} className={INPUT_STYLE} />
                  </div>
                  <div className='pt-4'>
                    <label className="block text-2xl font-semibold w-full flex justify-center mb-1">BTW nummer:</label>
                    <input name="vatNumber" value={newCustomerForm.vatNumber} onFocus={setActiveInput} onChange={(e) => setNewCustomerForm((s) => ({ ...s, vatNumber: e.target.value }))} className={INPUT_STYLE} />
                  </div>
                  <div className='pt-4'>
                    <label className="block text-2xl font-semibold w-full flex justify-center mb-1">Spaarkaart barcode:</label>
                    <input name="loyaltyBarcode" value={newCustomerForm.loyaltyBarcode} onFocus={setActiveInput} onChange={(e) => setNewCustomerForm((s) => ({ ...s, loyaltyBarcode: e.target.value }))} className={INPUT_STYLE} />
                  </div>
                  <div className='pt-4'>
                    <label className="block text-2xl font-semibold w-full flex justify-center mb-1">Tegoed tag:</label>
                    <div className="grid grid-cols-[1fr_auto] gap-2">
                      <input name="loyaltyTag" value={newCustomerForm.loyaltyTag} onFocus={setActiveInput} onChange={(e) => setNewCustomerForm((s) => ({ ...s, loyaltyTag: e.target.value }))} className={INPUT_STYLE} />
                      <button type="button" className="h-11 px-6 bg-pos-surface rounded-md text-2xl hover:bg-pos-surface-hover">
                        Extra tags
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-6 pt-10">
                  <button type="button" onClick={saveNewCustomer} disabled={isSavingCustomer} className="h-20 px-5 bg-pos-surface rounded-md text-3xl hover:bg-pos-surface-hover disabled:opacity-60">
                    Opslaan
                  </button>
                  <button type="button" onClick={cancelNewCustomerMode} className="h-20 px-5 bg-pos-surface rounded-md text-3xl hover:bg-pos-surface-hover">
                    Annuleren
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-3 px-3 pb-2 pt-5 text-2xl font-semibold text-pos-text">
                <div>{t('customersCompanyName')}:</div>
                <div>{t('name')}:</div>
                <div>{t('customersStreetHouseNumber')}:</div>
                <div>{t('customersPhone')}:</div>
              </div>

              <div className="flex-1 min-h-0 bg-pos-bg border border-pos-panel rounded-md overflow-hidden">
                <table className="w-full border-collapse text-xl">
                  <tbody ref={listRef} className="block max-h-full overflow-auto">
                    {visibleCustomers.map((c) => (
                      <tr
                        key={c.id}
                        className={`grid grid-cols-[1fr_1fr_1fr_1fr] px-3 py-3 border-b border-pos-border cursor-pointer ${
                          selectedCustomer?.id === c.id ? 'bg-pos-panel text-white' : ''
                        }`}
                        onClick={() => setSelectedCustomer(c)}
                      >
                        <td>{c.companyName || ''}</td>
                        <td>{c.name || ''}</td>
                        <td>{c.street || ''}</td>
                        <td>{c.phone || ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-center gap-40 py-2 text-5xl">
                <button type="button" className="text-pos-text hover:text-white" onClick={() => scrollList(-1)}>↑</button>
                <button type="button" className="text-pos-text hover:text-white" onClick={() => scrollList(1)}>↓</button>
              </div>
            </>
          )}
        </main>

        {!isNewCustomerMode && (
          <aside className="w-[170px] shrink-0 flex flex-col gap-4 text-xl h-full justify-around py-8">
            <input
              name="quickSearch"
              value={quickSearch}
              onFocus={setActiveInput}
              onChange={(e) => setQuickSearch(e.target.value)}
              className="py-3 px-3 bg-pos-surface border border-pos-border rounded-md text-pos-text outline-none"
            />
            <button type="button" onClick={openNewCustomerMode} className="py-3 px-3 bg-pos-surface border-none rounded-md text-pos-text text-left hover:bg-pos-surface-hover">
              {t('customersNewCustomer')}
            </button>
            <button type="button" className="py-3 px-3 bg-pos-surface border-none rounded-md text-pos-text text-left hover:bg-pos-surface-hover">
              {t('customersEditCustomer')}
            </button>
            <button type="button" className="py-3 px-3 bg-pos-surface border-none rounded-md text-pos-text text-left hover:bg-pos-surface-hover">
              {t('history')}
            </button>
            <button type="button" className="py-3 px-3 bg-pos-surface border-none rounded-md text-pos-text text-left hover:bg-pos-surface-hover">
              {t('customersPickup')}
            </button>
            <button type="button" className="py-3 px-3 bg-pos-surface border-none rounded-md text-pos-text text-left hover:bg-pos-surface-hover">
              {t('customersDeliver')}
            </button>
            <button type="button" className="py-3 px-3 bg-pos-surface border-none rounded-md text-pos-text text-left hover:bg-pos-surface-hover">
              {t('customersNone')}
            </button>
          </aside>
        )}
      </div>

      {!isNewCustomerMode && (
        <div className="grid grid-cols-4 gap-3 text-2xl shrink-0">
          <button type="button" className="py-3 px-4 bg-pos-panel border-none rounded text-pos-text hover:bg-pos-surface" onClick={onBack}>
            {t('backName')}
          </button>
          <button type="button" className="py-3 px-4 bg-pos-panel border-none rounded text-pos-text hover:bg-pos-surface">
            {t('customersNewReservation')}
          </button>
          <button type="button" className="py-3 px-4 bg-pos-panel border-none rounded text-pos-text hover:bg-pos-surface">
            {t('customersNoCustomer')}
          </button>
          <button type="button" className="py-3 px-4 bg-pos-panel border-none rounded text-pos-text hover:bg-pos-surface">
            {t('customersSelectCustomer')}
          </button>
        </div>
      )}

      <div className="shrink-0 p-0 flex gap-4 w-full justify-center">
        <div className="flex flex-col gap-1">
          <div className="flex gap-1">
            {ROW1_KEYS.map((key) => (
              <button key={key} type="button" className={KEY_STYLE} onClick={() => pressLetterOrSymbol(key)}>
                {displayKey(key)}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {ROW2_KEYS.map((key) => (
              <button key={key} type="button" className={KEY_STYLE} onClick={() => pressLetterOrSymbol(key)}>
                {displayKey(key)}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {ROW3_KEYS.map((key) => (
              <button key={key} type="button" className={KEY_STYLE} onClick={() => pressLetterOrSymbol(key)}>
                {displayKey(key)}
              </button>
            ))}
            <button type="button" className={`${KEY_STYLE} w-[204px]`} onClick={() => pressKey('Backspace')} aria-label="Backspace">
              ←
            </button>
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              className={`${KEY_STYLE} ${uppercase ? 'bg-blue-600 ring-2 ring-blue-400' : ''}`}
              onClick={() => setUppercase((prev) => !prev)}
              title="Shift"
            >
              ↑
            </button>
            <button type="button" className={KEY_STYLE} onClick={() => pressKey('@')}>
              @
            </button>
            <button type="button" className={KEY_STYLE} onClick={() => pressKey('/')}>
              /
            </button>
            <button type="button" className="bg-pos-panel rounded hover:bg-pos-panel/80 w-[412px] h-[60px] border border-transparent transition-colors" onClick={() => pressKey(' ')} aria-label="Space" />
            <button type="button" className={KEY_STYLE} onClick={() => pressKey('-')} aria-label="Minus">
              -
            </button>
            <button type="button" className={KEY_STYLE} aria-label="Left">
              ←
            </button>
            <button type="button" className={KEY_STYLE} aria-label="Right">
              →
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          {NUMPAD_KEYS.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-1">
              {row.map((key) => (
                <button key={key} type="button" className={KEY_STYLE} onClick={() => pressKey(key)}>
                  {key}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
