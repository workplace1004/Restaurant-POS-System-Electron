import React, { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const DEVICE_SETTINGS_STORAGE_KEY = 'pos_device_settings';
const OPTION_BUTTON_SLOT_COUNT = 28;
const OPTION_BUTTON_MORE_ID = 'meer';
const DEFAULT_OPTION_BUTTON_LAYOUT = [
  'extra-bc-bedrag', '', 'bc-refund', 'stock-retour', 'product-labels', '', '',
  'ticket-afdrukken', '', 'tegoed', 'tickets-optellen', '', 'product-info', 'personeel-ticket',
  'productie-bericht', 'prijs-groep', 'discount', 'kadobon', 'various', 'plu', 'product-zoeken',
  'lade', 'klanten', 'historiek', 'subtotaal', 'terugname', '', 'meer'
];
const OPTION_BUTTON_LABELS = {
  'extra-bc-bedrag': { key: 'control.optionButton.extraBcAmount', fallback: 'Extra BC\nAmount' },
  'bc-refund': { key: 'control.optionButton.bcRefund', fallback: 'BC Refund' },
  'stock-retour': { key: 'control.optionButton.stockRetour', fallback: 'Stock Return' },
  'product-labels': { key: 'control.optionButton.productLabels', fallback: 'Product\nLabels' },
  'ticket-afdrukken': { key: 'control.optionButton.printTicket', fallback: 'Print\nTicket' },
  tegoed: { key: 'control.optionButton.credit', fallback: 'Credit' },
  'tickets-optellen': { key: 'control.optionButton.sumTickets', fallback: 'Sum Tickets' },
  'product-info': { key: 'control.optionButton.productInfo', fallback: 'Product\nInfo' },
  'personeel-ticket': { key: 'control.optionButton.staffTicket', fallback: 'Staff Ticket' },
  'productie-bericht': { key: 'control.optionButton.productionMessage', fallback: 'Production\nMessage' },
  'prijs-groep': { key: 'control.optionButton.priceGroup', fallback: 'Price Group' },
  discount: { key: 'control.optionButton.discount', fallback: 'Discount' },
  kadobon: { key: 'control.optionButton.giftVoucher', fallback: 'Gift voucher' },
  various: { key: 'control.optionButton.various', fallback: 'Various' },
  plu: { key: 'control.optionButton.plu', fallback: 'PLU' },
  'product-zoeken': { key: 'control.optionButton.searchProduct', fallback: 'Search\nProduct' },
  lade: { key: 'control.optionButton.drawer', fallback: 'Drawer' },
  klanten: { key: 'control.optionButton.customers', fallback: 'Customers' },
  historiek: { key: 'control.optionButton.history', fallback: 'History' },
  subtotaal: { key: 'control.optionButton.subtotal', fallback: 'Subtotal' },
  terugname: { key: 'control.optionButton.return', fallback: 'Return' },
  meer: { key: 'control.optionButton.more', fallback: 'More...' },
  'eat-in-take-out': { key: 'control.optionButton.eatInTakeOut', fallback: 'Eat In\nTake Out' },
  'externe-apps': { key: 'control.optionButton.externalApps', fallback: 'External\nApps' },
  'voor-verpakken': { key: 'control.optionButton.forPacking', fallback: 'For\nPacking' },
  'leeggoed-terugnemen': { key: 'control.optionButton.depositReturn', fallback: 'Deposit\nReturn' },
  'webshop-tijdsloten': { key: 'control.optionButton.webshopTimeslots', fallback: 'Webshop timeslots' }
};

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

  const handleFooterButtonClick = (id) => {
    if (!id) return;
    if (id === OPTION_BUTTON_MORE_ID) {
      setShowMoreMenu((prev) => !prev);
      return;
    }
    setShowMoreMenu(false);
    if (id === 'klanten') onCustomersClick?.();
    if (id === 'historiek') onHistoryClick?.();
    if (id === 'subtotaal') onSubtotalClick?.();
  };

  return (
    <footer className="flex items-center py-3 px-4 bg-pos-bg shrink-0">
      <div className="flex gap-2 text-2xl w-full relative">
        {footerRowSlotIds.map((slotId, index) => {
          if (!slotId) {
            return <div key={`footer-empty-${index}`} className="w-[150px] h-[74px]" />;
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
              className={`py-5 w-[150px] border-none rounded whitespace-pre-line leading-tight ${
                disabled
                  ? 'bg-pos-panel text-pos-text opacity-60 cursor-not-allowed'
                  : active
                    ? 'bg-pos-surface text-white'
                    : 'bg-pos-panel text-pos-text hover:bg-pos-surface'
              }`}
              onClick={() => handleFooterButtonClick(slotId)}
            >
              {getLabel(slotId)}
            </button>
          );
        })}
        {showMoreMenu ? (
          <div className="absolute right-0 bottom-[86px] rounded-md border border-pos-border bg-pos-panel shadow-xl p-2 z-20">
            <div className="grid grid-cols-7 gap-2">
              {moreGridSlotIds.map((id, idx) => {
                if (!id) {
                  return <div key={`more-grid-empty-${idx}`} className="w-[130px] h-[74px] rounded bg-pos-bg/40" />;
                }
                return (
                  <button
                    key={`more-grid-${id}-${idx}`}
                    type="button"
                    className="w-[130px] h-[74px] px-2 rounded bg-pos-bg text-pos-text hover:bg-pos-surface whitespace-pre-line leading-tight text-center"
                    onClick={() => handleFooterButtonClick(id)}
                  >
                    {getLabel(id)}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </footer>
  );
}
