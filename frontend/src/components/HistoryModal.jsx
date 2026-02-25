import React, { useRef, useState, useEffect } from 'react';

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
      onClick={onClose}
    >
      <div
        className="bg-gray-200 rounded-lg shadow-xl flex flex-col border border-gray-400 w-full max-w-2xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-400 bg-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">Order history</h2>
        </div>

        <div
          ref={listRef}
          className="flex-1 overflow-auto min-h-[280px] border-b border-gray-400"
        >
          <table className="w-full text-left text-gray-800">
            <thead className="bg-gray-100 sticky top-0">
              <tr className="text-sm font-semibold">
                <th className="p-2">Bonnummer:</th>
                <th className="p-2">Tijdstip:</th>
                <th className="p-2 border-l border-dotted border-gray-500">Bedrag:</th>
                <th className="p-2 border-l border-dotted border-gray-500">Tafel:</th>
              </tr>
            </thead>
            <tbody>
              {historyOrders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-500">
                    No order history
                  </td>
                </tr>
              ) : (
                historyOrders.map((order, index) => (
                  <tr
                    key={order.id}
                    className={`border-t border-gray-300 ${selectedId === order.id ? 'bg-gray-300' : 'hover:bg-gray-100'}`}
                    onClick={() => setSelectedId(selectedId === order.id ? null : order.id)}
                  >
                    <td className="p-2 font-medium">
                      NS {baseReceipt + total - 1 - index}
                    </td>
                    <td className="p-2">{formatHistoryDate(order.createdAt)}</td>
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

        <div className="flex justify-center gap-2 py-3 border-b border-gray-400 bg-gray-100">
          <button
            type="button"
            className="p-2 text-gray-700 hover:bg-gray-200 rounded"
            onClick={() => scroll(-1)}
            aria-label="Scroll up"
          >
            <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
              <path d="M11 17V5.414l3.293 3.293a.999.999 0 101.414-1.414l-5-5a.999.999 0 00-1.414 0l-5 5a.997.997 0 000 1.414.999.999 0 001.414 0L9 5.414V17a1 1 0 102 0z" />
            </svg>
          </button>
          <button
            type="button"
            className="p-2 text-gray-700 hover:bg-gray-200 rounded"
            onClick={() => scroll(1)}
            aria-label="Scroll down"
          >
            <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 17.707l5-5a.999.999 0 10-1.414-1.414L11 14.586V3a1 1 0 10-2 0v11.586l-3.293-3.293a.999.999 0 10-1.414 1.414l5 5a.999.999 0 001.414 0z" />
            </svg>
          </button>
        </div>

        <div className="flex flex-wrap gap-2 p-4 bg-gray-100">
          <button
            type="button"
            className="px-4 py-2 rounded bg-gray-400 text-gray-900 font-medium hover:bg-gray-500"
            onClick={onClose}
          >
            Terug
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded bg-gray-300 text-gray-800 font-medium hover:bg-gray-400"
            onClick={() => {}}
          >
            Bekijken
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded bg-gray-300 text-gray-800 font-medium hover:bg-gray-400"
            onClick={() => {}}
          >
            Terugnemen
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded bg-gray-300 text-gray-800 font-medium hover:bg-gray-400"
            onClick={() => {}}
          >
            Terugnemen + Again inladen
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded bg-gray-300 text-gray-800 font-medium hover:bg-gray-400"
            onClick={() => {}}
          >
            Ticket herdrukken
          </button>
        </div>
      </div>
    </div>
  );
}
