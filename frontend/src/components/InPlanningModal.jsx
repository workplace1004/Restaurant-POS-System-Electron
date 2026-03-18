import React, { useRef, useState } from 'react';
import { CalendarModal } from './CalendarModal';
import { useLanguage } from '../contexts/LanguageContext';

const SortIcon = () => (
  <span className="ml-0.5 align-middle" aria-hidden>^</span>
);

const toDateOnly = (d) => {
  const x = new Date(d);
  return new Date(x.getFullYear(), x.getMonth(), x.getDate());
};

const MONTH_ABBREV = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function MonthPickerModal({ open, onClose, value, onChange, prevYearLabel, nextYearLabel }) {
  // value: Date (first day of selected month) or null
  const initial = value ? new Date(value) : new Date();
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const selectedMonth = value ? new Date(value).getMonth() : null;
  const selectedYear = value ? new Date(value).getFullYear() : null;

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[52] flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl overflow-hidden min-w-[800px] h-[710px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#1e3a5f] flex items-center justify-between px-4 py-3">
          <button type="button" className="text-white p-1 hover:opacity-80" onClick={() => setViewYear((y) => y - 1)} aria-label={prevYearLabel}>
            <svg width="46" height="46" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" /></svg>
          </button>
          <span className="text-white py-5 text-5xl font-medium">{viewYear}</span>
          <button type="button" className="text-white p-1 hover:opacity-80" onClick={() => setViewYear((y) => y + 1)} aria-label={nextYearLabel}>
            <svg width="46" height="46" viewBox="0 0 24 24" fill="currentColor"><path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" /></svg>
          </button>
        </div>
        <div className="p-4 grid grid-cols-4 gap-2">
          {MONTH_ABBREV.map((label, i) => {
            const isSelected = selectedMonth === i && selectedYear === viewYear;
            return (
              <button
                key={label}
                type="button"
                className={`py-20 px-3 rounded text-4xl font-medium transition-colors ${isSelected ? 'bg-[#1e3a5f] text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                onClick={() => {
                  onChange(new Date(viewYear, i, 1));
                  onClose();
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function InPlanningModal({ open, onClose, orders = [] }) {
  const { t } = useLanguage();
  const leftListRef = useRef(null);
  const rightListRef = useRef(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const today = toDateOnly(new Date());
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [calendarFor, setCalendarFor] = useState(null);
  const [showPrintOptionsModal, setShowPrintOptionsModal] = useState(false);
  const [keyboardUppercase, setKeyboardUppercase] = useState(false);
  const [keyboardInputValue, setKeyboardInputValue] = useState('');
  const [historyMode, setHistoryMode] = useState(false);
  const [historyMonthDate, setHistoryMonthDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [showMonthPickerModal, setShowMonthPickerModal] = useState(false);
  const [dateViewActive, setDateViewActive] = useState(false); // true = show all orders history, white Date, hide date input

  const keyDisplay = (k) => (/^[a-z]$/.test(k) ? (keyboardUppercase ? k.toUpperCase() : k) : k);

  const sendKey = (char) => {
    if (char === 'Backspace') setKeyboardInputValue((prev) => prev.slice(0, -1));
    else setKeyboardInputValue((prev) => prev + char);
  };

  const sendLetterOrSymbol = (k) => {
    if (/^[a-z]$/.test(k)) sendKey(keyboardUppercase ? k.toUpperCase() : k);
    else sendKey(k);
  };

  if (!open) return null;

  const formatDate = (d) => {
    try {
      const date = new Date(d);
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '/');
    } catch {
      return '–';
    }
  };
  const formatTime = (d) => {
    try {
      return new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
      return '–';
    }
  };
  const formatAmount = (total) => (total != null ? `€${Number(total).toFixed(2)}` : '€0.00');
  const customerName = (o) => (o?.customer ? (o.customer.companyName || o.customer.name) : '–');
  const orderNo = (id) => (id ? id.slice(-6) : '–');

  // In history mode: fromDate/toDate = first/last day of selected month; when dateViewActive show all orders (no date filter)
  const effectiveFrom = dateViewActive
    ? new Date(1970, 0, 1)
    : historyMode
      ? new Date(historyMonthDate.getFullYear(), historyMonthDate.getMonth(), 1)
      : fromDate;
  const effectiveTo = dateViewActive
    ? new Date(2100, 11, 31)
    : historyMode
      ? new Date(historyMonthDate.getFullYear(), historyMonthDate.getMonth() + 1, 0)
      : toDate;
  const formatMonthYear = (d) => {
    try {
      const date = new Date(d);
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const y = date.getFullYear();
      return `${m}/${y}`;
    } catch {
      return '–';
    }
  };

  // Orders in planning/open whose date is within [effectiveFrom, effectiveTo] (or all when dateViewActive)
  const ordersInDateRange = orders.filter((o) => {
    if (o.status !== 'in_planning' && o.status !== 'open') return false;
    if (dateViewActive) return true;
    const orderDay = toDateOnly(o.createdAt);
    const from = effectiveFrom.getTime();
    const to = effectiveTo.getTime();
    const t = orderDay.getTime();
    return t >= from && t <= to;
  });

  // Search filter: match query in order no, name, time, type, amount, origin
  const searchQuery = keyboardInputValue.trim().toLowerCase();
  const displayedOrders =
    searchQuery === ''
      ? ordersInDateRange
      : ordersInDateRange.filter((o) => {
        const no = orderNo(o.id).toLowerCase();
        const name = customerName(o).toLowerCase();
        const time = formatTime(o.createdAt).toLowerCase();
        const type = t('webordersCollection').toLowerCase();
        const amount = formatAmount(o.total).toLowerCase();
        const origin = (o.source || 'pos').toLowerCase();
        const q = searchQuery;
        return no.includes(q) || name.includes(q) || time.includes(q) || type.includes(q) || amount.includes(q) || origin.includes(q);
      });

  const scroll = (ref, dir) => {
    const el = ref?.current;
    if (el) el.scrollTop += dir * 60;
  };

  const qwertyTop = 'a z e r t y u i o p'.split(' ');
  const qwertyMid = 'q s d f g h j k l m'.split(' ');
  const qwertyBot = 'w x c v b n , €'.split(' ');
  const numPad = [['7', '8', '9'], ['4', '5', '6'], ['1', '2', '3'], ['-', '0', '.']];

  const handleBackdropClick = () => {
    if (showMonthPickerModal) setShowMonthPickerModal(false);
    else if (calendarFor !== null) setCalendarFor(null);
    else onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-pos-panel rounded-lg shadow-xl flex flex-col w-full max-w-[1400px] h-[1000px] overflow-hidden"
        onClick={(e) => {
          e.stopPropagation();
          if (showMonthPickerModal) setShowMonthPickerModal(false);
          if (calendarFor !== null) setCalendarFor(null);
        }}
      >
        <div className="flex w-full overflow-hidden">
          {/* Left panel: table */}
          <div className="flex flex-col w-full h-full overflow-hidden">
            {/* Header: Date, Full list or mm/yyyy, Search, History / Full list */}
            <div className="flex items-center justify-around w-full px-4 py-5">
              <button
                type="button"
                className="text-left"
                onClick={() => setDateViewActive((prev) => !prev)}
              >
                <div className={`font-semibold text-3xl ${dateViewActive ? 'text-white' : 'text-green-400'}`}>{t('inPlanningDate')}</div>
                {!historyMode && <div className={`text-xl ${dateViewActive ? 'text-green-400' : 'text-white'}`}>{t('inPlanningFullList')}</div>}
              </button>
              {!dateViewActive ? (
                <>
                  {historyMode ? (
                    <input
                      type="text"
                      readOnly
                      value={formatMonthYear(historyMonthDate)}
                      className="w-48 px-3 py-2 text-3xl font-medium text-white bg-pos-panel border border-white/30 rounded cursor-pointer hover:border-white/50 focus:outline-none focus:ring-2 focus:ring-green-400"
                      onClick={() => setShowMonthPickerModal(true)}
                      aria-label={t('selectMonthYear')}
                    />
                  ) : (
                    <input
                      type="text"
                      readOnly
                      value={formatDate(fromDate)}
                      className="w-48 px-3 py-2 text-3xl font-medium text-white bg-pos-panel border border-white/30 rounded cursor-pointer hover:border-white/50 focus:outline-none focus:ring-2 focus:ring-gray-400"
                      onClick={() => setCalendarFor('from')}
                      aria-label={t('fromDate')}
                    />
                  )}
                </>
              ) : (
                <div className='w-48 h-5'>
                </div>
              )}
              <input
                type="text"
                readOnly
                value={keyboardInputValue}
                className="max-w-[200px] flex-1 px-3 py-2 text-3xl font-medium text-white bg-pos-panel border-2 border-gray-400 rounded placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-gray-400"
                aria-label={t('searchOrders')}
              />
              <button
                type="button"
                className={`px-3 py-1.5 rounded text-3xl font-medium ${historyMode ? 'text-green-400' : 'text-white'}`}
                onClick={() => {
                  if (historyMode) {
                    setHistoryMode(false);
                    setKeyboardInputValue('');
                  } else {
                    setHistoryMode(true);
                  }
                }}
              >
                {t('history')}
              </button>
            </div>

            <div className="flex w-full gap-1 px-2 py-2 text-2xl justify-around font-medium text-white">
              <span>{t('inPlanningNo')}</span>
              <span>{t('inPlanningDeliveryTime')}</span>
              <span>{t('name')}</span>
              <span>{t('inPlanningType')}</span>
              <span>{t('inPlanningAmount')}</span>
              <span>{t('inPlanningPrinted')}</span>
              <span>{t('inPlanningPaid')}</span>
              <span>{t('inPlanningOrigin')}</span>
            </div>
            <div
              ref={leftListRef}
              className="overflow-auto min-h-[400px] border border-white rounded-lg mx-2"
            >
              {displayedOrders.length > 0 ? (
                <table className="text-left text-xl text-white">
                  <tbody>
                    {displayedOrders.map((order) => (
                      <tr
                        key={order.id}
                        className={`border-b border-gray-100 cursor-pointer ${selectedOrderId === order.id ? 'bg-gray-400' : 'hover:bg-gray-300'
                          }`}
                        onClick={() => setSelectedOrderId(order.id)}
                      >
                        <td className="p-3 min-w-[100px] whitespace-nowrap">
                          <div className="flex items-center justify-center">
                            {orderNo(order.id)}
                          </div>
                        </td>
                        <td className="p-3 min-w-[200px] whitespace-nowrap">
                          <div className="flex items-center justify-center">
                            {formatTime(order.createdAt)}
                          </div>
                        </td>
                        <td className="p-3 min-w-[120px] truncate">
                          <div className="flex items-center justify-center">
                            {customerName(order)}
                          </div>
                        </td>
                        <td className="p-3 min-w-[110px] whitespace-nowrap">
                          <div className="flex items-center justify-center">
                            {t('webordersCollection')}
                          </div>
                        </td>
                        <td className="p-3 min-w-[150px] whitespace-nowrap">
                          <div className="flex items-center justify-center">
                            {formatAmount(order.total)}
                          </div>
                        </td>
                        <td className="p-3 min-w-[130px] whitespace-nowrap">
                          <div className="flex items-center justify-center">
                            {t('no')}
                          </div>
                        </td>
                        <td className="p-3 min-w-[110px] whitespace-nowrap">
                          <div className="flex items-center justify-center">
                            {order.status === 'paid' ? t('yes') : t('no')}
                          </div>
                        </td>
                        <td className="p-3 min-w-[123px] whitespace-nowrap">
                          <div className="flex items-center justify-center">
                            {order.source || t('originPos')}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-6 text-center text-gray-500 flex flex-col items-center gap-2">
                  <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  {searchQuery ? (
                    <span className="text-xl">{t('inPlanningNoOrdersMatch')} &quot;{keyboardInputValue.trim()}&quot;</span>
                  ) : (
                    <span className="text-xl">{historyMode ? t('inPlanningNoOrdersForMonth') : t('inPlanningNoOrdersForDate')}</span>
                  )}
                </div>
              )}
            </div>
            <div className="flex justify-around w-full gap-2 py-5">
              <button type="button" className="p-1 text-gray-500 hover:text-gray-700 active:opacity-70 active:scale-95 transition-transform" onClick={() => scroll(leftListRef, -1)} aria-label={t('scrollUp')}>
                <svg width="40" height="40" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M11 17V5.414l3.293 3.293a.999.999 0 101.414-1.414l-5-5a.999.999 0 00-1.414 0l-5 5a.997.997 0 000 1.414.999.999 0 001.414 0L9 5.414V17a1 1 0 102 0z" fill="#ffffff" /></svg>
              </button>
              <button type="button" className="p-1 text-gray-500 hover:text-gray-700 active:opacity-70 active:scale-95 transition-transform" onClick={() => scroll(leftListRef, 1)} aria-label={t('scrollDown')}>
                <svg width="40" height="40" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10.707 17.707l5-5a.999.999 0 10-1.414-1.414L11 14.586V3a1 1 0 10-2 0v11.586l-3.293-3.293a.999.999 0 10-1.414 1.414l5 5a.999.999 0 001.414 0z" fill="#ffffff" /></svg>
              </button>
            </div>
          </div>

          {/* Right panel: print buttons + content */}
          <div className="flex flex-col w-[340px] shrink-0">
            <div className="flex flex-wrap gap-2 py-[40px] w-full justify-center items-center">
              <button
                type="button"
                disabled={!selectedOrderId}
                className={`px-1.5 py-1.5 w-[100px] rounded text-xl ${selectedOrderId ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : 'bg-gray-400 text-gray-500 cursor-not-allowed opacity-70'
                  }`}
              >
                {t('inPlanningProductionPrint')}
              </button>
              <button
                type="button"
                disabled={historyMode}
                className={`px-1.5 py-1.5 w-[100px] rounded text-xl ${historyMode ? 'bg-gray-400 text-gray-500 cursor-not-allowed opacity-70' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                onClick={() => !historyMode && setShowPrintOptionsModal(true)}
              >
                {t('inPlanningPrintAllProduction')}
              </button>
              <button type="button" className="px-1.5 py-1.5 w-[100px] rounded bg-gray-200 text-gray-800 text-xl hover:bg-gray-300">{t('inPlanningPrintTotals')}</button>
            </div>
            <div ref={rightListRef} className="h-[400px] overflow-auto border rounded-lg mx-2 border-white" />
            <div className="flex justify-around w-full gap-2 py-5">
              <button type="button" className="p-1 text-gray-500 hover:text-gray-700 active:opacity-70 active:scale-95 transition-transform" onClick={() => scroll(rightListRef, -1)} aria-label={t('scrollUp')}>
                <svg width="40" height="40" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M11 17V5.414l3.293 3.293a.999.999 0 101.414-1.414l-5-5a.999.999 0 00-1.414 0l-5 5a.997.997 0 000 1.414.999.999 0 001.414 0L9 5.414V17a1 1 0 102 0z" fill="#ffffff" /></svg>
              </button>
              <button type="button" className="p-1 text-gray-500 hover:text-gray-700 active:opacity-70 active:scale-95 transition-transform" onClick={() => scroll(rightListRef, 1)} aria-label={t('scrollDown')}>
                <svg width="40" height="40" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10.707 17.707l5-5a.999.999 0 10-1.414-1.414L11 14.586V3a1 1 0 10-2 0v11.586l-3.293-3.293a.999.999 0 10-1.414 1.414l5 5a.999.999 0 001.414 0z" fill="#ffffff" /></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom: keyboard + keypad + buttons */}
        <div className="flex gap-2 p-2 shrink-0">
          <div className="flex gap-2">
            <div className="flex gap-2">
              {/* QWERTY */}
              <div className="flex flex-col gap-1 text-5xl">
                <div className="flex gap-1 justify-center">
                  {qwertyTop.map((k) => (
                    <button key={k} type="button" className="w-[80px] h-[80px] border rounded bg-pos-panel text-pos-text hover:bg-pos-rowHover" onClick={() => sendLetterOrSymbol(k)}>{keyDisplay(k)}</button>
                  ))}
                </div>
                <div className="flex gap-1 justify-center">
                  {qwertyMid.map((k) => (
                    <button key={k} type="button" className="w-[80px] h-[80px] border rounded bg-pos-panel text-pos-text hover:bg-pos-rowHover" onClick={() => sendLetterOrSymbol(k)}>{keyDisplay(k)}</button>
                  ))}
                </div>
                <div className="flex gap-1 justify-center">
                  {qwertyBot.map((k) => (
                    <button key={k} type="button" className="w-[80px] h-[80px] border rounded bg-pos-panel text-pos-text hover:bg-pos-rowHover" onClick={() => sendLetterOrSymbol(k)}>{keyDisplay(k)}</button>
                  ))}
                  <button type="button" className="w-[164px] h-[80px] border rounded bg-pos-panel text-pos-text hover:bg-pos-rowHover" onClick={() => sendKey('Backspace')}>←</button>
                </div>
                <div className="flex gap-1 justify-center">
                  <button
                    type="button"
                    className={`w-[80px] h-[80px] border rounded text-pos-text hover:bg-pos-rowHover ${keyboardUppercase ? 'bg-pos-rowHover ring-2 ring-green-400' : 'bg-pos-panel'}`}
                    onClick={() => setKeyboardUppercase((prev) => !prev)}
                    title="Toggle uppercase"
                  >
                    ↑
                  </button>
                  <button type="button" className="w-[80px] h-[80px] border rounded bg-pos-panel text-pos-text hover:bg-pos-rowHover" onClick={() => sendKey('@')}>@</button>
                  <button type="button" className="w-[80px] h-[80px] border rounded bg-pos-panel text-pos-text hover:bg-pos-rowHover" onClick={() => sendKey('/')}>/</button>
                  <button type="button" className="w-[332px] h-[80px] border rounded bg-pos-panel hover:bg-pos-rowHover" aria-label={t('space')} onClick={() => sendKey(' ')} />
                  <button type="button" className="w-[80px] h-[80px] border rounded bg-pos-panel text-pos-text hover:bg-pos-rowHover" onClick={() => sendKey('_')}>_</button>
                  <button type="button" className="w-[80px] h-[80px] border rounded bg-pos-panel text-pos-text hover:bg-pos-rowHover" onClick={() => sendKey('Backspace')}>←</button>
                  <button type="button" className="w-[80px] h-[80px] border rounded bg-pos-panel text-pos-text hover:bg-pos-rowHover">→</button>
                </div>
              </div>
              {/* Numeric keypad */}
              <div className="flex flex-col gap-1 text-5xl ml-10">
                {numPad.map((row, i) => (
                  <div key={i} className="flex gap-1">
                    {row.map((k) => (
                      <button key={k} type="button" className="w-[80px] h-[80px] border rounded bg-pos-panel text-pos-text hover:bg-pos-rowHover" onClick={() => sendKey(k)}>{k}</button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            {/* Action buttons */}
            <div className="flex flex-col gap-2 text-xl w-[242px] justify-center items-center ml-2">
              <button type="button" className="w-48 h-[70px] px-3 rounded bg-gray-300 text-gray-500 cursor-not-allowed" disabled>{t('inPlanningLoad')}</button>
              <button type="button" className="w-48 h-[70px] px-3 rounded bg-gray-300 text-gray-500 cursor-not-allowed" disabled>{t('inPlanningAddRecurringOrder')}</button>
              <button type="button" className="w-48 h-[70px] px-3 rounded bg-gray-300 text-gray-500 cursor-not-allowed" disabled>{t('webordersCancelOrder')}</button>
              <button type="button" className="w-48 h-[70px] px-3 rounded bg-gray-400 text-gray-800 font-medium hover:bg-gray-500" onClick={onClose}>{t('webordersClose')}</button>
            </div>
          </div>
        </div>
      </div>

      <CalendarModal
        open={calendarFor !== null}
        onClose={() => setCalendarFor(null)}
        value={calendarFor === 'from' ? fromDate : toDate}
        onChange={(date) => {
          const d = toDateOnly(date);
          if (calendarFor === 'from') setFromDate(d);
          else if (calendarFor === 'to') setToDate(d);
          setCalendarFor(null);
        }}
      />

      <MonthPickerModal
        open={showMonthPickerModal}
        onClose={() => setShowMonthPickerModal(false)}
        value={historyMonthDate}
        onChange={(firstDayOfMonth) => setHistoryMonthDate(firstDayOfMonth)}
        prevYearLabel={t('previousYear')}
        nextYearLabel={t('nextYear')}
      />

      {/* Print options modal */}
      {showPrintOptionsModal && (
        <div
          className="fixed inset-0 z-[55] flex items-center justify-center bg-black/40"
          onClick={(e) => {
            e.stopPropagation();
            setShowPrintOptionsModal(false);
          }}
        >
          <div
            className="bg-white rounded-lg shadow-xl border border-gray-300 p-6 grid grid-rows-2 gap-6 min-w-[600px] h-[300px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex gap-4 justify-center items-center">
              <button
                type="button"
                className="h-[80px] w-[200px] rounded-lg bg-gray-200 text-gray-800 text-lg font-medium hover:bg-gray-300 text-center"
                onClick={() => setShowPrintOptionsModal(false)}
              >
                {t('inPlanningPrintAll')}
              </button>
              <button
                type="button"
                className="h-[80px] w-[200px] rounded-lg bg-gray-200 text-gray-800 text-lg font-medium hover:bg-gray-300 text-center"
                onClick={() => setShowPrintOptionsModal(false)}
              >
                {t('inPlanningPrintNewOrders')}
              </button>
            </div>
            <div className="flex justify-center items-center">
              <button
                type="button"
                className="h-[80px] w-[200px] rounded-lg bg-gray-200 text-gray-800 text-lg font-medium hover:bg-gray-300"
                onClick={() => setShowPrintOptionsModal(false)}
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
