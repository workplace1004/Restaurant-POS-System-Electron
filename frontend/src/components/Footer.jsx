import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const DEVICE_SETTINGS_STORAGE_KEY = 'pos_device_settings';
const API = '/api';
const OPTION_BUTTON_SLOT_COUNT = 28;
const OPTION_BUTTON_MORE_ID = 'meer';
const DEFAULT_OPTION_BUTTON_LAYOUT = [
  'extra-bc-bedrag', '', 'bc-refund', 'stock-retour', 'product-labels', '', '',
  'ticket-afdrukken', '', 'tegoed', 'tickets-optellen', '', 'product-info', 'personeel-ticket',
  'productie-bericht', 'prijs-groep', 'discount', 'kadobon', 'various', 'plu', 'product-zoeken',
  'lade', 'klanten', 'historiek', 'subtotaal', 'terugname', '', 'meer'
];
const OPTION_BUTTON_LABELS = {
  'extra-bc-bedrag': { key: 'control.optionButton.extraBcAmount', fallback: 'Extra BC\namount' },
  'bc-refund': { key: 'control.optionButton.bcRefund', fallback: 'BC Refund' },
  'stock-retour': { key: 'control.optionButton.stockRetour', fallback: 'Stock\nreturn' },
  'product-labels': { key: 'control.optionButton.productLabels', fallback: 'Product\nLabels' },
  'ticket-afdrukken': { key: 'control.optionButton.printTicket', fallback: 'Add\nticket' },
  tegoed: { key: 'control.optionButton.credit', fallback: 'Credit' },
  'tickets-optellen': { key: 'control.optionButton.sumTickets', fallback: 'Ticket\nTo' },
  'product-info': { key: 'control.optionButton.productInfo', fallback: 'Product\ninfo' },
  'personeel-ticket': { key: 'control.optionButton.staffTicket', fallback: 'Staff\nconsumables' },
  'productie-bericht': { key: 'control.optionButton.productionMessage', fallback: 'Production\nmessage' },
  'prijs-groep': { key: 'control.optionButton.priceGroup', fallback: 'Price\ngroup' },
  discount: { key: 'control.optionButton.discount', fallback: 'Discount' },
  kadobon: { key: 'control.optionButton.giftVoucher', fallback: 'Gift voucher' },
  various: { key: 'control.optionButton.various', fallback: 'Miscellaneous' },
  plu: { key: 'control.optionButton.plu', fallback: 'PLU' },
  'product-zoeken': { key: 'control.optionButton.searchProduct', fallback: 'Search\nProduct' },
  lade: { key: 'control.optionButton.drawer', fallback: 'Drawer' },
  klanten: { key: 'control.optionButton.customers', fallback: 'Customers' },
  historiek: { key: 'control.optionButton.history', fallback: 'History' },
  subtotaal: { key: 'control.optionButton.subtotal', fallback: 'Subtotal' },
  terugname: { key: 'control.optionButton.return', fallback: 'Return\nname' },
  meer: { key: 'control.optionButton.more', fallback: 'More...' },
  'eat-in-take-out': { key: 'control.optionButton.eatInTakeOut', fallback: 'Take\nOut' },
  'externe-apps': { key: 'control.optionButton.externalApps', fallback: 'External\nApps' },
  'voor-verpakken': { key: 'control.optionButton.forPacking', fallback: 'Pre-\npackaging' },
  'leeggoed-terugnemen': { key: 'control.optionButton.depositReturn', fallback: 'Return empty\ncontainers' },
  'webshop-tijdsloten': { key: 'control.optionButton.webshopTimeslots', fallback: 'Webshop\ntime slots' }
};
const KEYPAD_ROWS = [
  ['C', '7', '8', '9'],
  [',', '4', '5', '6'],
  ['0', '1', '2', '3']
];

function normalizeOptionButtonSlots(value) {
  if (!Array.isArray(value)) return [...DEFAULT_OPTION_BUTTON_LAYOUT];
  const next = Array(OPTION_BUTTON_SLOT_COUNT).fill('');
  const used = new Set();
  for (let i = 0; i < OPTION_BUTTON_SLOT_COUNT; i += 1) {
    const candidate = String(value[i] || '').trim();
    if (!candidate || !OPTION_BUTTON_LABELS[candidate] || used.has(candidate)) continue;
    next[i] = candidate;
    used.add(candidate);
  }
  if (!next.includes(OPTION_BUTTON_MORE_ID)) next[OPTION_BUTTON_SLOT_COUNT - 1] = OPTION_BUTTON_MORE_ID;
  return next;
}

export function Footer({ customersActive = false, onCustomersClick, showSubtotalView, subtotalButtonDisabled, onSubtotalClick, onHistoryClick }) {
  const { t } = useLanguage();
  const tr = (key, fallback) => {
    const translated = t(key);
    return translated === key ? fallback : translated;
  };
  const [optionButtonSlots, setOptionButtonSlots] = useState(() => normalizeOptionButtonSlots(null));
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showExtraBcModal, setShowExtraBcModal] = useState(false);
  const [showPriceGroupModal, setShowPriceGroupModal] = useState(false);
  const [priceGroups, setPriceGroups] = useState([]);
  const [priceGroupsLoading, setPriceGroupsLoading] = useState(false);
  const [extraBcInput, setExtraBcInput] = useState('');
  const [activeExtraBcButtonId, setActiveExtraBcButtonId] = useState('');
  const moreMenuAreaRef = useRef(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DEVICE_SETTINGS_STORAGE_KEY);
      const saved = raw ? JSON.parse(raw) : {};
      setOptionButtonSlots(normalizeOptionButtonSlots(saved?.optionButtonLayout));
    } catch {
      setOptionButtonSlots(normalizeOptionButtonSlots(null));
    }
  }, []);

  const footerRowSlotIds = useMemo(
    () => optionButtonSlots.slice(21, 28),
    [optionButtonSlots]
  );
  const moreGridSlotIds = useMemo(
    () => optionButtonSlots.slice(0, 21),
    [optionButtonSlots]
  );

  const getLabel = (id) => {
    const meta = OPTION_BUTTON_LABELS[id];
    if (!meta) return '';
    return tr(meta.key, meta.fallback);
  };
  const getTwoLineLabel = (id) => getLabel(id).replace(/\s*\n\s*/g, ' ').trim();

  const handleFooterButtonClick = (id) => {
    if (!id) return;
    if (id === OPTION_BUTTON_MORE_ID) {
      setShowMoreMenu((prev) => !prev);
      return;
    }
    setShowMoreMenu(false);
    if (id === 'extra-bc-bedrag') {
      setShowExtraBcModal(true);
      setExtraBcInput('');
      return;
    }
    if (id === 'prijs-groep') {
      setShowPriceGroupModal(true);
      return;
    }
    if (id === 'klanten') onCustomersClick?.();
    if (id === 'historiek') onHistoryClick?.();
    if (id === 'subtotaal') onSubtotalClick?.();
  };
  const handleExtraBcKeypad = (key) => {
    if (key === 'C') {
      setExtraBcInput('');
      return;
    }
    if (key === ',') {
      setExtraBcInput((prev) => (prev.includes(',') ? prev : `${prev},`));
      return;
    }
    setExtraBcInput((prev) => `${prev}${key}`);
  };
  const closeExtraBcModal = () => {
    setShowExtraBcModal(false);
    setExtraBcInput('');
    setActiveExtraBcButtonId('');
  };
  useEffect(() => {
    if (!showMoreMenu) return undefined;
    const handleDocumentMouseDown = (event) => {
      const area = moreMenuAreaRef.current;
      if (!area) return;
      if (!area.contains(event.target)) {
        setShowMoreMenu(false);
      }
    };
    document.addEventListener('mousedown', handleDocumentMouseDown);
    return () => {
      document.removeEventListener('mousedown', handleDocumentMouseDown);
    };
  }, [showMoreMenu]);
  useEffect(() => {
    if (!showPriceGroupModal) return;
    let cancelled = false;
    const run = async () => {
      setPriceGroupsLoading(true);
      try {
        const res = await fetch(`${API}/price-groups`);
        const data = await res.json().catch(() => []);
        if (cancelled) return;
        setPriceGroups(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setPriceGroups([]);
      } finally {
        if (!cancelled) setPriceGroupsLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [showPriceGroupModal]);
  const pulseExtraBcButton = (id) => {
    setActiveExtraBcButtonId(id);
    window.setTimeout(() => {
      setActiveExtraBcButtonId((prev) => (prev === id ? '' : prev));
    }, 180);
  };

  return (
    <footer className="flex items-center py-3 px-2 bg-pos-bg shrink-0">
      <div ref={moreMenuAreaRef} className="grid grid-cols-7 gap-1 text-sm w-full relative">
        {footerRowSlotIds.map((slotId, index) => {
          if (!slotId) {
            return <div key={`footer-empty-${index}`}/>;
          }
          const isCustomers = slotId === 'klanten';
          const isHistory = slotId === 'historiek';
          const isSubtotal = slotId === 'subtotaal';
          const isMore = slotId === OPTION_BUTTON_MORE_ID;
          const disabled = isSubtotal ? subtotalButtonDisabled : false;
          const active =
            (isCustomers && customersActive) ||
            (isSubtotal && showSubtotalView) ||
            (isHistory && false);
          return (
            <button
              key={`footer-slot-${slotId}-${index}`}
              type="button"
              disabled={disabled}
              className={`py-3 border-none rounded overflow-hidden ${
                disabled
                  ? 'bg-pos-panel text-pos-text opacity-60 cursor-not-allowed'
                  : active
                    ? 'bg-pos-surface text-white'
                    : 'bg-pos-panel text-pos-text hover:bg-pos-surface'
              }`}
              onClick={() => handleFooterButtonClick(slotId)}
            >
              <span className="block w-full truncate whitespace-nowrap">
                {getLabel(slotId)}
              </span>
            </button>
          );
        })}
        {showMoreMenu ? (
          <div className="absolute right-0 bottom-[46px] rounded-md border border-pos-border bg-pos-panel shadow-xl p-2 z-20">
            <div className="grid grid-cols-7 gap-2 text-sm">
              {moreGridSlotIds.map((id, idx) => {
                if (!id) {
                  return <div key={`more-grid-empty-${idx}`} className="rounded bg-pos-bg/40 min-h-[46px]" />;
                }
                return (
                  <button
                    key={`more-grid-${id}-${idx}`}
                    type="button"
                    className="px-2 rounded bg-pos-bg text-pos-text hover:bg-pos-surface text-center min-h-[46px]"
                    onClick={() => handleFooterButtonClick(id)}
                  >
                    <span
                      className="block leading-tight overflow-hidden text-ellipsis"
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}
                    >
                      {getTwoLineLabel(id)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
      {showExtraBcModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-[540px] rounded-md bg-[#d8d8da] px-6 pb-6 pt-8 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto mb-8 h-[48px] w-[150px] flex justify-center items-center rounded bg-white/35 px-3 text-center text-4xl leading-[28px] text-pos-bg">
              {extraBcInput}
            </div>
            <div className="flex flex-col gap-6">
              {KEYPAD_ROWS.map((row, rowIndex) => (
                <div key={`bc-row-${rowIndex}`} className="grid grid-cols-4 gap-6">
                  {row.map((key) => (
                    <button
                      key={`bc-key-${key}`}
                      type="button"
                      className={`h-[58px] rounded bg-transparent text-5xl hover:bg-white/30 ${
                        activeExtraBcButtonId === `keypad-${key}` ? 'text-rose-500' : 'text-[#3f5478]'
                      }`}
                      onClick={() => {
                        pulseExtraBcButton(`keypad-${key}`);
                        handleExtraBcKeypad(key);
                      }}
                    >
                      {key}
                    </button>
                  ))}
                </div>
              ))}
            </div>
            <div className="mt-8 grid grid-cols-3 gap-8">
              <button
                type="button"
                className={`h-[56px] rounded bg-white/45 text-3xl hover:bg-white/70 ${
                  activeExtraBcButtonId === 'action-cancel' ? 'text-rose-500' : 'text-[#3f5478]'
                }`}
                onClick={() => {
                  pulseExtraBcButton('action-cancel');
                  closeExtraBcModal();
                }}
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                className={`h-[56px] rounded bg-white/45 text-3xl hover:bg-white/70 ${
                  activeExtraBcButtonId === 'action-reset' ? 'text-rose-500' : 'text-[#3f5478]'
                }`}
                onClick={() => {
                  pulseExtraBcButton('action-reset');
                  setExtraBcInput('');
                }}
              >
                {t('reset')}
              </button>
              <button
                type="button"
                disabled={!extraBcInput}
                className={`h-[56px] rounded text-3xl ${
                  extraBcInput
                    ? `${activeExtraBcButtonId === 'action-ok' ? 'text-rose-500' : 'text-[#3f5478]'} bg-white/45 hover:bg-white/70`
                    : 'bg-white/30 text-[#9aa7bd] cursor-not-allowed'
                }`}
                onClick={() => {
                  if (!extraBcInput) return;
                  pulseExtraBcButton('action-ok');
                  closeExtraBcModal();
                }}
              >
                {t('ok')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {showPriceGroupModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-[1260px] rounded-md bg-pos-bg px-8 py-7 shadow-2xl">
            <div className="mb-10 min-h-[120px]">
              {priceGroupsLoading ? (
                <div className="h-[54px] w-[220px] rounded bg-white/45 flex items-center justify-center text-2xl text-[#3f5478]">
                  {tr('control.priceGroups.loading', 'Loading price groups...')}
                </div>
              ) : priceGroups.length === 0 ? (
                <div className="h-[54px] w-[260px] rounded bg-white/45 flex items-center justify-center text-2xl text-[#3f5478]">
                  {tr('control.priceGroups.empty', 'No price groups yet.')}
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {priceGroups
                    .slice()
                    .sort((a, b) => (a?.name || '').localeCompare(b?.name || ''))
                    .map((group) => (
                      <button
                        key={group.id}
                        type="button"
                        className="h-[54px] px-6 rounded bg-white/45 text-3xl text-green-400 hover:bg-white/70"
                      >
                        {group.name || group.id}
                      </button>
                    ))}
                </div>
              )}
            </div>
            <div className="flex items-center justify-center">
              <button
                type="button"
                className="h-[62px] min-w-[190px] rounded bg-white/45 px-8 text-3xl hover:bg-white/70"
                onClick={() => setShowPriceGroupModal(false)}
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </footer>
  );
}
