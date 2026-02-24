import React, { useState } from 'react';

const KEYPAD = [
  ['C', '7', '8', '9'],
  [',', '4', '5', '6'],
  ['0', '1', '2', '3']
];

export function OrderPanel({ order, orders, onRemoveItem, onStatusChange, onCreateOrder, onRemoveAllOrders, tables }) {
  const [customAmount, setCustomAmount] = useState('');
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);

  const handleKeypad = (key) => {
    if (key === 'C') {
      setCustomAmount('');
      return;
    }
    setCustomAmount((prev) => prev + key);
  };

  const total = order?.total ?? 0;
  const items = order?.items ?? [];

  return (
    <aside className="w-[500px] shrink-0 flex flex-col gap-3 p-4 bg-pos-bg border-l border-pos-border">
      <div className="min-h-[600px] flex flex-col bg-pos-surface rounded-lg overflow-hidden">
        <div className="flex-1 overflow-auto p-2">
          {items.map((item) => (
            <div
              key={item.id}
              className={`flex flex-wrap items-center gap-1 p-2 text-2xl text-pos-bg rounded mb-1 hover:bg-white/30 ${selectedItemId === item.id ? 'bg-white/50' : ''
                }`}
              onClick={() => setSelectedItemId(selectedItemId === item.id ? null : item.id)}
            >
              <span className="flex-1 font-semibold">
                {item.product?.name} × {item.quantity}
              </span>
              <span className="font-semibold">€{(item.price * item.quantity).toFixed(2)}</span>
              {selectedItemId === item.id && (
                <button
                  type="button"
                  className="w-full mt-1 py-1 text-sm bg-pos-danger text-white border-none rounded"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveItem(order.id, item.id);
                    setSelectedItemId(null);
                  }}
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 py-2 px-2 border-t border-black/10 text-2xl">
          <button type="button" className="w-12 h-12 p-0 bg-black/10 border-none rounded text-3xl">
            <img
              src="/arrow-up.svg"
              alt="Arrow Up"
              className="w-7 h-7"
              style={{ display: "block", margin: "auto" , color:"black"}}
            />
          </button>
          <button
            type="button"
            className="flex-1 py-1 bg-pos-danger text-white border-none rounded text-2xl hover:bg-pos-danger/80"
            onClick={() => {
              if (selectedItemId !== null && order) {
                onRemoveItem(order.id, selectedItemId);
                setSelectedItemId(null);
              }
            }}
            disabled={selectedItemId === null}
          >
            Delete
          </button>
          <button
            type="button"
            className="flex-1 py-1 bg-pos-panel text-pos-text border-none rounded text-2xl hover:bg-pos-surface"
            onClick={() => setShowDeleteAllModal(true)}
          >
            Again
          </button>
          <button type="button" className="w-12 h-12 p-0 bg-black/10 border-none rounded text- text-3xl">
            <img
              src="/arrow-down.svg"
              alt="Arrow Up"
              className="w-7 h-7"
              style={{ display: "block", margin: "auto" }}
            />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-xl font-semibold py-5">
        <span className='text-4xl ml-10'>Total: €{total.toFixed(2)}</span>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          className="flex-1 py-3 px-2 bg-pos-surface border-none rounded-md text-pos-text text-2xl hover:bg-pos-surface-hover"
          onClick={() => order && onStatusChange(order.id, 'in_planning')}
        >
          In planning
        </button>
        <button
          type="button"
          className="flex-1 py-3 px-2 bg-pos-surface border-none rounded-md text-pos-text text-2xl hover:bg-pos-surface-hover"
        >
          Pay differently
        </button>
        <button
          type="button"
          className="min-w-[7rem] py-3 px-2 bg-pos-surface border-none rounded-md text-pos-text text-5xl hover:bg-pos-surface-hover"
        >
          €
        </button>
      </div>

      {showDeleteAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="dialog" aria-modal="true" aria-labelledby="delete-all-title">
          <div className="bg-pos-panel rounded-lg shadow-xl px-16 py-8 max-w-3xl w-full mx-4 border border-pos-border">
            <h2 id="delete-all-title" className="text-3xl mb-10 font-semibold flex justify-center w-full text-pos-text">
              <div className='flex'>
                Are you sure you want to clear the list?
              </div>
            </h2>
            <div className="flex gap-3 justify-between">
              <button
                type="button"
                className="w-[200px] py-5 bg-pos-surface text-pos-text rounded text-2xl hover:bg-pos-surface-hover"
                onClick={() => setShowDeleteAllModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="w-[200px] py-5 bg-pos-danger text-white rounded text-2xl hover:bg-pos-danger/90"
                onClick={async () => {
                  await onRemoveAllOrders?.();
                  setShowDeleteAllModal(false);
                  setSelectedItemId(null);
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {KEYPAD.map((row, ri) => (
          <div key={ri} className="grid grid-cols-4 gap-2">
            {row.map((key) => (
              <button
                key={key}
                type="button"
                className="py-7 bg-pos-surface border-none rounded-md text-pos-text text-lg hover:bg-pos-surface-hover"
                onClick={() => handleKeypad(key)}
              >
                {key}
              </button>
            ))}
          </div>
        ))}
      </div>
    </aside>
  );
}
