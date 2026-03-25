import React, { useRef, useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const formatHistoryAmount = (n) => `€ ${Number(n).toFixed(2).replace('.', ',')}`;

const formatHistoryDate = (d) => {
  try {
    const date = new Date(d);
    const dateStr = date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '/');
    const timeStr = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
    return `${dateStr} ${timeStr}`;
  } catch {
    return '–';
  }
};

export function HistoryModal({ open, onClose, historyOrders = [], onFetchHistory }) {
  const { t } = useLanguage();
  const listRef = useRef(null);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    if (open && onFetchHistory) onFetchHistory();
  }, [open, onFetchHistory]);

  const scroll = (dir) => {
    const el = listRef?.current;
    if (el) el.scrollTop += dir * 60;
  };

  if (!open) return null;

  const baseReceipt = 60;
  const total = historyOrders.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div
        className="bg-gray-200 min-h-[700px] p-5 bg-pos-panel rounded-lg shadow-xl flex flex-col border border-gray-400 w-full max-w-5xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 py-2 border-b border-pos-border">
          <h2 className="text-xl font-semibold text-pos-text">{t('historyOrderTitle')}</h2>
        </div>

        <div
          ref={listRef}
          className="flex-1 overflow-auto min-h-[280px] border-b border-pos-border"
        >
          <table className="w-full text-left text-pos-text">
            <thead className="bg-pos-bg sticky top-0">
              <tr className="text-md font-semibold">
                <th className="p-2">{t('historyReceiptNo')}:</th>
                <th className="p-2">{t('historyTime')}:</th>
                <th className="p-2 border-l border-dotted border-gray-500">{t('historyAmount')}:</th>
                <th className="p-2 border-l border-dotted border-gray-500">{t('table')}:</th>
              </tr>
            </thead>
            <tbody>
              {historyOrders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-500">
                    {t('historyNoOrders')}
                  </td>
                </tr>
              ) : (
                historyOrders.map((order, index) => (
                  <tr
                    key={order.id}
                    className={`border-t text-md bg-pos-bg border-pos-border ${selectedId === order.id ? 'bg-pos-bg/50' : 'active:bg-green-500'}`}
                    onClick={() => setSelectedId(selectedId === order.id ? null : order.id)}
                  >
                    <td className="p-2 font-medium">
                      NS {baseReceipt + total - 1 - index}
                    </td>
                    <td className="p-2">{formatHistoryDate(order.updatedAt || order.createdAt)}</td>
                    <td className="p-2 border-l border-dotted border-gray-500">
                      {formatHistoryAmount(order.total)}
                    </td>
                    <td className="p-2 border-l border-dotted border-gray-500">
                      {order.table?.name ?? '–'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-around text-2xl gap-2 py-1 border-b border-pos-border bg-pos-bg">
          <button
            type="button"
            className="p-2 text-pos-text active:bg-green-500 rounded"
            onClick={() => scroll(-1)}
            aria-label={t('scrollUp')}
          >
            <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
              <path d="M11 17V5.414l3.293 3.293a.999.999 0 101.414-1.414l-5-5a.999.999 0 00-1.414 0l-5 5a.997.997 0 000 1.414.999.999 0 001.414 0L9 5.414V17a1 1 0 102 0z" />
            </svg>
          </button>
          <button
            type="button"
            className="p-2 text-pos-text active:bg-green-500 rounded"
            onClick={() => scroll(1)}
            aria-label={t('scrollDown')}
          >
            <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 17.707l5-5a.999.999 0 10-1.414-1.414L11 14.586V3a1 1 0 10-2 0v11.586l-3.293-3.293a.999.999 0 10-1.414 1.414l5 5a.999.999 0 001.414 0z" />
            </svg>
          </button>
        </div>

        <div className="flex flex-wrap gap-2 p-4 text-md py-1 justify-around bg-pos-bg">
          <button
            type="button"
            className="px-4 py-2 rounded bg-pos-panel text-pos-text font-medium active:bg-green-500"
            onClick={onClose}
          >
            {t('backName')}
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded bg-pos-panel text-pos-text font-medium active:bg-green-500"
            onClick={() => {}}
          >
            {t('historyView')}
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded bg-pos-panel text-pos-text font-medium active:bg-green-500"
            onClick={() => {}}
          >
            {t('historyTakeBack')}
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded bg-pos-panel text-pos-text font-medium active:bg-green-500"
            onClick={() => {}}
          >
            {t('historyTakeBackAgain')}
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded bg-pos-panel text-pos-text font-medium active:bg-green-500"
            onClick={() => {}}
          >
            {t('historyReprintTicket')}
          </button>
        </div>
      </div>
    </div>
  );
}
