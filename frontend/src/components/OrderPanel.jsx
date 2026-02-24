import React, { useState } from 'react';

const KEYPAD = [
  ['C', '7', '8', '9'],
  [',', '4', '5', '6'],
  ['0', '1', '2', '3']
];

const PAYMENT_METHODS = [
  { id: 'cash', label: 'Cash', icon: '€' },
  { id: 'bancontact', label: 'Bancontact', icon: 'card' },
  { id: 'visa', label: 'Visa', icon: 'visa' }
];

export function OrderPanel({ order, orders, onRemoveItem, onUpdateItemQuantity, onStatusChange, onCreateOrder, onRemoveAllOrders, tables }) {
  const [customAmount, setCustomAmount] = useState('');
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [showPayDifferentlyModal, setShowPayDifferentlyModal] = useState(false);
  const [paymentAmounts, setPaymentAmounts] = useState({ cash: 0, bancontact: 0, visa: 0 });
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [payModalKeypadInput, setPayModalKeypadInput] = useState('');
  const [payModalKeypadLocked, setPayModalKeypadLocked] = useState(false);

  const total = order?.total ?? 0;
  const items = order?.items ?? [];
  const selectedItem = selectedItemId != null ? items.find((i) => i.id === selectedItemId) : null;

  const handleKeypad = (key) => {
    if (key === 'C') {
      setCustomAmount('');
      return;
    }
    setCustomAmount((prev) => prev + key);
  };

  const openPayDifferentlyModal = () => {
    setShowPayDifferentlyModal(true);
    setPaymentAmounts({ cash: 0, bancontact: 0, visa: 0 });
    setSelectedPayment(null);
    setPayModalKeypadInput(total.toFixed(2));
    setPayModalKeypadLocked(false);
  };

  const payModalTotalAssigned = paymentAmounts.cash + paymentAmounts.bancontact + paymentAmounts.visa;
  const payModalRemaining = Math.max(0, total - payModalTotalAssigned);

  const handlePayModalKeypad = (key) => {
    if (payModalKeypadLocked) return;
    if (key === 'C') {
      setPayModalKeypadInput('');
      return;
    }
    setPayModalKeypadInput((prev) => {
      if (prev === total.toFixed(2)) return key;
      return prev + key;
    });
  };

  const assignPayModalInput = () => {
    if (selectedPayment == null) return;
    const value = parseFloat(payModalKeypadInput.replace(',', '.')) || 0;
    setPaymentAmounts((prev) => ({
      ...prev,
      [selectedPayment]: prev[selectedPayment] + value
    }));
    setPayModalKeypadInput('');
    setPayModalKeypadLocked(true);
  };

  const handlePaymentCardClick = (methodId) => {
    const value = parseFloat(payModalKeypadInput.replace(',', '.')) || 0;
    setPaymentAmounts((prev) => ({ ...prev, [methodId]: prev[methodId] + value }));
    setPayModalKeypadInput('');
    setSelectedPayment(methodId);
    setPayModalKeypadLocked(true);
  };

  const handlePayHalfAmount = () => {
    if (selectedPayment == null || payModalKeypadLocked) return;
    const half = total / 2;
    setPaymentAmounts((prev) => ({ ...prev, [selectedPayment]: prev[selectedPayment] + half }));
  };
  const handlePayRemaining = () => {
    if (selectedPayment == null || payModalKeypadLocked) return;
    setPaymentAmounts((prev) => ({ ...prev, [selectedPayment]: prev[selectedPayment] + payModalRemaining }));
  };
  const handlePayReset = () => {
    setPaymentAmounts({ cash: 0, bancontact: 0, visa: 0 });
    setPayModalKeypadInput(total.toFixed(2));
    setSelectedPayment(null);
    setPayModalKeypadLocked(false);
  };

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
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 py-2 px-2 border-t border-black/10 text-2xl">
          <button
            type="button"
            disabled={selectedItemId === null}
            className={`w-12 h-12 p-0 flex items-center justify-center border-none rounded text-3xl ${
              selectedItemId === null ? 'bg-black/10 opacity-50 cursor-not-allowed' : 'bg-black/10 hover:opacity-90'
            }`}
            onClick={() => {
              if (selectedItemId !== null && order && selectedItem) {
                onUpdateItemQuantity?.(order.id, selectedItemId, selectedItem.quantity + 1);
              }
            }}
          >
            <svg width="30px" height="30px" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 17V5.414l3.293 3.293a.999.999 0 101.414-1.414l-5-5a.999.999 0 00-1.414 0l-5 5a.997.997 0 000 1.414.999.999 0 001.414 0L9 5.414V17a1 1 0 102 0z" fill="#ffffff" />
            </svg>
          </button>
          <button
            type="button"
            className={`flex-1 py-2 border-none rounded text-2xl ${
              selectedItemId === null
                ? 'text-gray-400 cursor-not-allowed opacity-70'
                : 'text-white hover:bg-gray-600'
            }`}
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
            className="flex-1 py-2 text-pos-text border-none rounded text-2xl hover:bg-gray-600"
            onClick={() => setShowDeleteAllModal(true)}
          >
            Again
          </button>
          <button
            type="button"
            disabled={selectedItemId === null || (selectedItem?.quantity ?? 0) <= 1}
            className={`w-12 h-12 p-0 flex items-center justify-center border-none rounded text-3xl ${
              selectedItemId === null || (selectedItem?.quantity ?? 0) <= 1 ? 'bg-black/10 opacity-50 cursor-not-allowed' : 'bg-black/10 hover:opacity-90'
            }`}
            onClick={() => {
              if (selectedItemId !== null && order && selectedItem && selectedItem.quantity > 1) {
                onUpdateItemQuantity?.(order.id, selectedItemId, selectedItem.quantity - 1);
              }
            }}
          >
            <svg width="30" height="30" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.707 17.707l5-5a.999.999 0 10-1.414-1.414L11 14.586V3a1 1 0 10-2 0v11.586l-3.293-3.293a.999.999 0 10-1.414 1.414l5 5a.999.999 0 001.414 0z" fill="#ffffff" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex items-center w-full px-5 justify-between text-xl font-semibold py-2">
        <span className='text-4xl'>Total:&nbsp;€{total.toFixed(2)}</span>
        <div>
          <input
            readOnly
            tabIndex={0}
            className='w-[180px] h-full py-4 px-2 bg-pos-surface border-none rounded-md text-pos-text text-2xl hover:bg-pos-surface-hover outline-none cursor-pointer'
            type='text'
            value={customAmount}
            placeholder='Enter amount'
            aria-label='Enter amount (use keypad)'
          />
        </div>
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
          onClick={openPayDifferentlyModal}
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

      {showPayDifferentlyModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pay-differently-title"
          onClick={() => setShowPayDifferentlyModal(false)}
        >
          <div
            className="flex flex-col h-[60vh] bg-gray-100 rounded-xl shadow-2xl max-w-[1800px] w-full overflow-auto text-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left: Total + payment methods + Cancel */}
            <div className="flex items-center justify-center">
              <div className="p-10 min-w-[46%] w-full h-full flex flex-col">
                <div className="text-3xl font-semibold mb-4 flex w-full justify-center items-center">Total: €{total.toFixed(2)}</div>
                <div className="flex gap-3 w-full mb-6 h-full items-center justify-center">
                  {PAYMENT_METHODS.map((method) => {
                    const amount = paymentAmounts[method.id];
                    const isSelected = selectedPayment === method.id;
                    return (
                      <button
                        type="button"
                        key={method.id}
                        onClick={() => (payModalKeypadLocked ? setSelectedPayment(method.id) : handlePaymentCardClick(method.id))}
                        className={`flex flex-col h-[200px] items-center justify-center p-4 rounded-lg border-2 min-w-[220px] transition-colors ${isSelected ? 'bg-green-500 border-green-600 text-white' : 'bg-white border-gray-300 hover:border-gray-400'
                          }`}
                      >
                        {method.icon === '€' && <span className="text-6xl mb-1">
                          <svg width="60" height="60" viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
                            <path fill="#444" d="M10.89 3c1.166 0.009 2.244 0.383 3.127 1.011l-0.017-2.321c-0.918-0.433-1.994-0.686-3.129-0.686-3.606 0-6.616 2.551-7.323 5.947l-1.548 0.049v1h1.41c0 0.17 0 0.33 0 0.5-0.005 0.075-0.008 0.162-0.008 0.25s0.003 0.175 0.008 0.262l-1.411-0.012v1h1.54c0.882 3.353 3.805 5.818 7.331 5.999 1.149-0.002 2.218-0.256 3.175-0.708l-0.045-2.291c-0.866 0.617-1.944 0.991-3.108 1-2.461-0.128-4.512-1.744-5.28-3.959l6.388-0.041v-1h-6.59c-0.006-0.075-0.009-0.162-0.009-0.25s0.003-0.175 0.010-0.261c-0.001-0.159-0.001-0.319-0.001-0.489h6.59v-1h-6.4c0.678-2.325 2.788-3.996 5.29-4z"></path>
                          </svg>
                        </span>}
                        {method.icon === 'card' && (
                          <span className="mb-1 flex items-center justify-center text-xs">
                            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M22 7.54844C22 8.20844 21.46 8.74844 20.8 8.74844H3.2C2.54 8.74844 2 8.20844 2 7.54844V7.53844C2 5.24844 3.85 3.39844 6.14 3.39844H17.85C20.14 3.39844 22 5.25844 22 7.54844Z" fill="#292D32" />
                              <path d="M2 11.45V16.46C2 18.75 3.85 20.6 6.14 20.6H17.85C20.14 20.6 22 18.74 22 16.45V11.45C22 10.79 21.46 10.25 20.8 10.25H3.2C2.54 10.25 2 10.79 2 11.45ZM8 17.25H6C5.59 17.25 5.25 16.91 5.25 16.5C5.25 16.09 5.59 15.75 6 15.75H8C8.41 15.75 8.75 16.09 8.75 16.5C8.75 16.91 8.41 17.25 8 17.25ZM14.5 17.25H10.5C10.09 17.25 9.75 16.91 9.75 16.5C9.75 16.09 10.09 15.75 10.5 15.75H14.5C14.91 15.75 15.25 16.09 15.25 16.5C15.25 16.91 14.91 17.25 14.5 17.25Z" fill="#292D32" />
                            </svg>

                          </span>
                        )}
                        {method.icon === 'visa' && <span className="text-xs font-bold mb-1">
                          <svg fill="#000000" width="60" height="60" viewBox="0 -6 36 36" xmlns="http://www.w3.org/2000/svg">
                            <path d="m33.6 24h-31.2c-1.325 0-2.4-1.075-2.4-2.4v-19.2c0-1.325 1.075-2.4 2.4-2.4h31.2c1.325 0 2.4 1.075 2.4 2.4v19.2c0 1.325-1.075 2.4-2.4 2.4zm-15.76-9.238-.359 2.25c.79.338 1.709.535 2.674.535.077 0 .153-.001.229-.004h-.011c.088.005.19.008.294.008 1.109 0 2.137-.348 2.981-.941l-.017.011c.766-.568 1.258-1.469 1.258-2.485 0-.005 0-.01 0-.015v.001c0-1.1-.736-2.014-2.187-2.72-.426-.208-.79-.426-1.132-.672l.023.016c-.198-.13-.33-.345-.343-.592v-.002c.016-.26.165-.482.379-.6l.004-.002c.282-.164.62-.261.982-.261.042 0 .084.001.126.004h-.006.08c.023 0 .05-.001.077-.001.644 0 1.255.139 1.806.388l-.028-.011.234.125.359-2.171c-.675-.267-1.458-.422-2.277-.422-.016 0-.033 0-.049 0h.003c-.064-.003-.139-.005-.214-.005-1.096 0-2.112.347-2.943.937l.016-.011c-.752.536-1.237 1.404-1.237 2.386v.005c-.01 1.058.752 1.972 2.266 2.72.4.175.745.389 1.054.646l-.007-.006c.175.148.288.365.297.608v.002.002c0 .319-.19.593-.464.716l-.005.002c-.3.158-.656.25-1.034.25-.015 0-.031 0-.046 0h.002c-.022 0-.049 0-.075 0-.857 0-1.669-.19-2.397-.53l.035.015-.343-.172zm10.125 1.141h3.315q.08.343.313 1.5h2.407l-2.094-10.031h-2c-.035-.003-.076-.005-.118-.005-.562 0-1.043.348-1.239.84l-.003.009-3.84 9.187h2.72l.546-1.499zm-13.074-8.531-1.626 10.031h2.594l1.625-10.031zm-9.969 2.047 2.11 7.968h2.734l4.075-10.015h-2.746l-2.534 6.844-.266-1.391-.904-4.609c-.091-.489-.514-.855-1.023-.855-.052 0-.104.004-.154.011l.006-.001h-4.187l-.031.203c3.224.819 5.342 2.586 6.296 5.25-.309-.792-.76-1.467-1.326-2.024l-.001-.001c-.567-.582-1.248-1.049-2.007-1.368l-.04-.015zm25.937 4.421h-2.16q.219-.578 1.032-2.8l.046-.141c.042-.104.094-.24.16-.406s.11-.302.14-.406l.188.859.593 2.89z" />
                          </svg>
                        </span>}
                        <span className="text-3xl font-medium">{method.label}</span>
                        <span className={`text-4xl font-semibold mt-1 ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                          €{amount.toFixed(2).replace('.', ',')}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              {/* Right: Assigned + input + keypad + actions + To confirm */}
              <div className="min-w-[30%] p-6">
                <div className="text-3xl font-semibold mb-2 flex justify-center">Assigned: €{payModalTotalAssigned.toFixed(2)}</div>
                <div className="flex justify-center mt-3">
                  <input
                    readOnly
                    className="w-[200px] py-3 px-4 bg-gray-200 rounded-lg text-xl mb-4 outline-none cursor-default"
                    value={payModalKeypadInput}
                    aria-label="Amount (use keypad)"
                  />

                </div>
                <div className="flex gap-4 flex-1 min-h-0 mt-5">
                  <div className="flex flex-col gap-2 flex-1">
                    {KEYPAD.map((row, ri) => (
                      <div key={ri} className="grid grid-cols-4 gap-2">
                        {row.map((key) => (
                          <button
                            key={key}
                            type="button"
                            disabled={payModalKeypadLocked}
                            className={`py-9 rounded-lg text-3xl font-medium ${
                              payModalKeypadLocked ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-300 text-gray-800 hover:bg-gray-400'
                            }`}
                            onClick={() => handlePayModalKeypad(key)}
                          >
                            {key}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="min-w-[24%] flex flex-col items-center justify-center gap-10">
                <button
                  type="button"
                  disabled={payModalKeypadLocked}
                  className={`py-3 px-3 w-[300px] rounded-lg text-3xl font-medium ${
                    payModalKeypadLocked ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-300 text-gray-800 hover:bg-gray-400'
                  }`}
                  onClick={handlePayHalfAmount}
                >
                  Half amount
                </button>
                <button
                  type="button"
                  disabled={payModalKeypadLocked}
                  className={`py-3 px-3 w-[300px] rounded-lg text-3xl font-medium ${
                    payModalKeypadLocked ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-300 text-gray-800 hover:bg-gray-400'
                  }`}
                  onClick={handlePayRemaining}
                >
                  Remaining amount
                </button>
                <button
                  type="button"
                  className="py-3 px-3 bg-gray-300 w-[300px] rounded-lg text-gray-800 text-3xl font-medium hover:bg-gray-400"
                  onClick={handlePayReset}
                >
                  Reset
                </button>
              </div>
            </div>
            <div className="flex justify-between px-[250px] text-3xl gap-10 w-full pt-10">
              <button
                type="button"
                className="mt-auto w-[230px] py-3 px-6 bg-gray-300 rounded-lg text-gray-800 font-medium hover:bg-gray-400"
                onClick={() => setShowPayDifferentlyModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={selectedPayment == null}
                className={`mt-4 py-3 w-[230px] px-6 rounded-lg font-medium ${
                  selectedPayment == null
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-300 text-gray-800 hover:bg-gray-400'
                }`}
                onClick={() => {
                  if (selectedPayment != null && payModalKeypadInput && !payModalKeypadLocked) assignPayModalInput();
                  setShowPayDifferentlyModal(false);
                }}
              >
                To confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteAllModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-all-title"
          onClick={() => setShowDeleteAllModal(false)}
        >
          <div
            className="bg-pos-panel rounded-lg shadow-xl px-16 py-8 max-w-3xl w-full mx-4 border border-pos-border"
            onClick={(e) => e.stopPropagation()}
          >
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
                className="py-8 bg-pos-surface border-none rounded-md text-pos-text text-lg hover:bg-pos-surface-hover"
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
