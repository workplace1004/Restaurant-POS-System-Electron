import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const KEYPAD = [
  ['C', '7', '8', '9'],
  [',', '4', '5', '6'],
  ['0', '1', '2', '3']
];

const formatSubtotalPrice = (n) => `€ ${Number(n).toFixed(2).replace('.', ',')}`;
const roundCurrency = (n) => Math.round((Number(n) || 0) * 100) / 100;
const formatPaymentAmount = (n) => `€${roundCurrency(n).toFixed(2)}`;

export function OrderPanel({ order, orders, onRemoveItem, onUpdateItemQuantity, onStatusChange, onCreateOrder, onRemoveAllOrders, tables, showSubtotalView = false, subtotalBreaks = [], onPaymentCompleted }) {
  const { t } = useLanguage();
  const [customAmount, setCustomAmount] = useState('');
  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [showPayDifferentlyModal, setShowPayDifferentlyModal] = useState(false);
  const [paymentAmounts, setPaymentAmounts] = useState({ cash: 0, bancontact: 0, visa: 0 });
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [payModalKeypadInput, setPayModalKeypadInput] = useState('');
  const [payModalKeypadLocked, setPayModalKeypadLocked] = useState(false);
  const [payConfirmLoading, setPayConfirmLoading] = useState(false);
  const [paymentErrorMessage, setPaymentErrorMessage] = useState('');
  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState('');

  const total = order?.total ?? 0;
  const items = order?.items ?? [];
  const selectedItems = items.filter((i) => selectedItemIds.includes(i.id));
  const hasSelection = selectedItemIds.length > 0;
  const canDecreaseAll = selectedItems.length > 0 && selectedItems.every((i) => (i.quantity ?? 0) > 1);
  const getItemLabel = (item) => {
    const base = item?.product?.name ?? '—';
    const note = (item?.notes || '').trim();
    return note ? `${base} (${note})` : base;
  };

  const toggleItemSelection = (id) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

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

  const handleCashImageClick = () => {
    if (payModalKeypadLocked) {
      setSelectedPayment('cash');
      return;
    }
    const value = parseFloat(payModalKeypadInput.replace(',', '.')) || 0;
    setPaymentAmounts((prev) => ({ ...prev, cash: prev.cash + value }));
    setPayModalKeypadInput('');
    setSelectedPayment('cash');
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

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const runCashmaticPayment = async (amountEuro) => {
    const cents = Math.round((Number(amountEuro) || 0) * 100);
    if (cents <= 0) return;

    const startRes = await fetch('/api/cashmatic/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: cents })
    });
    const startData = await startRes.json().catch(() => ({}));
    if (!startRes.ok) {
      throw new Error(startData?.error || 'Unable to start Cashmatic payment.');
    }

    const sessionId = startData?.data?.sessionId;
    if (!sessionId) throw new Error('Cashmatic session did not start.');

    for (let i = 0; i < 90; i += 1) {
      await sleep(1000);
      const statusRes = await fetch(`/api/cashmatic/status/${encodeURIComponent(sessionId)}`);
      const statusData = await statusRes.json().catch(() => ({}));
      if (!statusRes.ok) {
        throw new Error(statusData?.error || 'Unable to read Cashmatic payment status.');
      }

      const state = String(statusData?.data?.state || '').toUpperCase();
      if (state === 'PAID' || state === 'FINISHED' || state === 'FINISHED_MANUAL') {
        await fetch(`/api/cashmatic/finish/${encodeURIComponent(sessionId)}`, { method: 'POST' });
        return;
      }
      if (state === 'CANCELLED' || state === 'ERROR') {
        throw new Error(statusData?.error || `Cashmatic payment ${state.toLowerCase()}.`);
      }
    }

    await fetch(`/api/cashmatic/cancel/${encodeURIComponent(sessionId)}`, { method: 'POST' }).catch(() => {});
    throw new Error('Cashmatic payment timeout. Please try again.');
  };

  const printTicketAutomatically = async (paymentBreakdown) => {
    const printRes = await fetch('/api/printers/receipt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: order?.id,
        paymentBreakdown
      })
    });
    const printData = await printRes.json().catch(() => ({}));
    if (!printRes.ok) {
      throw new Error(printData?.error || 'Automatic ticket print failed.');
    }
    if (printData?.success !== true || printData?.data?.printed !== true) {
      throw new Error(printData?.error || 'Printer did not confirm successful print.');
    }
    return printData?.data || {};
  };

  const resetAfterSuccessfulPayment = () => {
    setShowPayDifferentlyModal(false);
    setPaymentAmounts({ cash: 0, bancontact: 0, visa: 0 });
    setSelectedPayment(null);
    setPayModalKeypadInput('');
    setPayModalKeypadLocked(false);
    setSelectedItemIds([]);
    setCustomAmount('');
    setShowDeleteAllModal(false);
  };

  const handleConfirmPayment = async () => {
    if (selectedPayment == null || payConfirmLoading) return;

    const pendingInput = parseFloat(String(payModalKeypadInput || '').replace(',', '.')) || 0;
    const shouldAssignInput = !payModalKeypadLocked && pendingInput > 0;
    const nextAmounts = {
      ...paymentAmounts,
      ...(shouldAssignInput ? { [selectedPayment]: paymentAmounts[selectedPayment] + pendingInput } : {})
    };
    const assignedTotal = roundCurrency(nextAmounts.cash + nextAmounts.bancontact + nextAmounts.visa);
    const orderTotal = roundCurrency(total);

    if (assignedTotal <= 0) {
      setPaymentErrorMessage('Assigned amount must be greater than 0.');
      return;
    }
    if (Math.abs(assignedTotal - orderTotal) > 0.009) {
      setPaymentErrorMessage(`Assigned amount (€${assignedTotal.toFixed(2)}) must match total (€${orderTotal.toFixed(2)}).`);
      return;
    }

    setPaymentAmounts(nextAmounts);
    if (shouldAssignInput) {
      setPayModalKeypadInput('');
      setPayModalKeypadLocked(true);
    }

    try {
      setPayConfirmLoading(true);
      if (nextAmounts.cash > 0) {
        await runCashmaticPayment(nextAmounts.cash);
      }
      if (order?.id) {
        await onStatusChange?.(order.id, 'paid');
        await onPaymentCompleted?.(order.id);
      }
      let printedSuccessfully = true;
      let printResult = null;
      try {
        printResult = await printTicketAutomatically(nextAmounts);
      } catch (printErr) {
        printedSuccessfully = false;
        setPaymentErrorMessage(printErr?.message || 'Automatic ticket print failed.');
      }
      if (printedSuccessfully) {
        const methodLines = [
          nextAmounts.cash > 0 ? `Cashmatic: ${formatPaymentAmount(nextAmounts.cash)}` : null,
          nextAmounts.bancontact > 0 ? `Bancontact: ${formatPaymentAmount(nextAmounts.bancontact)}` : null,
          nextAmounts.visa > 0 ? `Visa: ${formatPaymentAmount(nextAmounts.visa)}` : null,
        ].filter(Boolean);
        setPaymentSuccessMessage([
          `Payment successful (${formatPaymentAmount(orderTotal)}).`,
          methodLines.length ? methodLines.join(' | ') : '',
          `Receipt printed successfully${printResult?.printerName ? ` on ${printResult.printerName}` : ''}.`,
        ].filter(Boolean).join(' '));
      }
      await onCreateOrder?.();
      resetAfterSuccessfulPayment();
    } catch (err) {
      setPaymentErrorMessage(err?.message || 'Payment failed.');
    } finally {
      setPayConfirmLoading(false);
    }
  };

  return (
    <aside className="w-[500px] shrink-0 flex flex-col gap-3 p-4 bg-pos-bg border-l border-pos-border">
      <div className="min-h-[600px] flex flex-col bg-pos-surface rounded-lg overflow-hidden">
        {showSubtotalView ? (
          <div className="flex-1 overflow-auto p-4 text-pos-bg">
            {(() => {
              let start = 0;
              const result = [];
              for (let i = 0; i < subtotalBreaks.length; i++) {
                const end = subtotalBreaks[i];
                const group = items.slice(start, end);
                const groupTotal = group.reduce((s, it) => s + it.price * it.quantity, 0);
                group.forEach((item) => (
                  result.push(
                    <div key={item.id} className="flex justify-between items-baseline py-1.5 text-2xl">
                      <span className="font-medium">{item.quantity}x {getItemLabel(item)}</span>
                      <span className="font-medium">{formatSubtotalPrice(item.price * item.quantity)}</span>
                    </div>
                  )
                ));
                result.push(
                  <div key={`sub-${i}`} className="border-b border-gray-800 mb-2 pb-2 mb-3">
                    <div className="flex justify-center items-baseline text-3xl font-medium relative">
                      <span className='font-bold'>Subtotal:</span>
                      <span className='flex font-bold absolute w-full justify-end'>{formatSubtotalPrice(groupTotal)}</span>
                    </div>
                  </div>
                );
                start = end;
              }
              const remaining = items.slice(start);
              remaining.forEach((item) =>
                result.push(
                  <div key={item.id} className="flex justify-between items-baseline py-1.5 text-2xl">
                    <span className="font-medium">{item.quantity}x {getItemLabel(item)}</span>
                    <span className="font-medium">{formatSubtotalPrice(item.price * item.quantity)}</span>
                  </div>
                )
              );
              return result;
            })()}
          </div>
        ) : (
          <div className="flex-1 overflow-auto p-2">
            {items.map((item) => (
              <div
                key={item.id}
                className={`flex flex-wrap items-center gap-1 p-2 text-2xl text-pos-bg rounded mb-1 hover:bg-white/30 cursor-pointer ${selectedItemIds.includes(item.id) ? 'bg-white/50' : ''
                  }`}
                onClick={() => toggleItemSelection(item.id)}
              >
                <span className="flex-1 font-semibold">
                  {getItemLabel(item)} × {item.quantity}
                </span>
                <span className="font-semibold">€{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2 py-2 px-2 border-t border-black/10 text-2xl">
          <button
            type="button"
            disabled={!hasSelection}
            className={`w-12 h-12 p-0 flex items-center justify-center border-none rounded text-3xl ${
              !hasSelection ? 'bg-black/10 opacity-50 cursor-not-allowed' : 'bg-black/10 hover:opacity-90'
            }`}
            onClick={() => {
              if (order && selectedItems.length > 0) {
                selectedItems.forEach((item) => {
                  onUpdateItemQuantity?.(order.id, item.id, item.quantity + 1);
                });
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
              !hasSelection
                ? 'text-gray-400 cursor-not-allowed opacity-70'
                : 'text-white hover:bg-gray-600'
            }`}
            onClick={() => {
              if (order && selectedItemIds.length > 0) {
                selectedItemIds.forEach((id) => onRemoveItem(order.id, id));
                setSelectedItemIds([]);
              }
            }}
            disabled={!hasSelection}
          >
            {t('remove')}
          </button>
          <button
            type="button"
            className="flex-1 py-2 text-pos-text border-none rounded text-2xl hover:bg-gray-600"
            onClick={() => setShowDeleteAllModal(true)}
          >
            {t('clear')}
          </button>
          <button
            type="button"
            disabled={!canDecreaseAll}
            className={`w-12 h-12 p-0 flex items-center justify-center border-none rounded text-3xl ${
              !canDecreaseAll ? 'bg-black/10 opacity-50 cursor-not-allowed' : 'bg-black/10 hover:opacity-90'
            }`}
            onClick={() => {
              if (order && canDecreaseAll) {
                selectedItems.forEach((item) => {
                  if (item.quantity > 1) {
                    onUpdateItemQuantity?.(order.id, item.id, item.quantity - 1);
                  }
                });
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
        <span className='text-4xl'>{t('total')}:&nbsp;€{total.toFixed(2)}</span>
        <div>
          <input
            readOnly
            tabIndex={0}
            className='w-[180px] h-full py-4 px-2 bg-pos-surface border-none rounded-md text-pos-text text-2xl hover:bg-pos-surface-hover outline-none cursor-pointer'
            type='text'
            value={customAmount}
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
          {t('inPlanning')}
        </button>
        <button
          type="button"
          className="flex-1 py-3 px-2 bg-pos-surface border-none rounded-md text-pos-text text-2xl hover:bg-pos-surface-hover"
          onClick={openPayDifferentlyModal}
        >
          {t('payDifferently')}
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
                <div className="text-3xl font-semibold mb-4 flex w-full justify-center items-center">{t('total')}: €{total.toFixed(2)}</div>
                <div className="flex gap-3 w-full mb-6 h-full items-center justify-center">
                  <button
                    type="button"
                    onClick={handleCashImageClick}
                    className={`rounded-lg border-2 p-2 transition-colors ${
                      selectedPayment === 'cash' ? 'bg-gray-300 border-gray-400' : 'bg-white'
                    }`}
                    aria-label={t('cash')}
                  >
                    <img src="/cash.png" alt={t('cash')} className="max-h-[280px] w-auto object-contain" />
                  </button>
                </div>
              </div>
              {/* Right: Assigned + input + keypad + actions + To confirm */}
              <div className="min-w-[30%] p-6">
                <div className="text-3xl font-semibold mb-2 flex justify-center">{t('assigned')}: €{payModalTotalAssigned.toFixed(2)}</div>
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
                  {t('halfAmount')}
                </button>
                <button
                  type="button"
                  disabled={payModalKeypadLocked}
                  className={`py-3 px-3 w-[300px] rounded-lg text-3xl font-medium ${
                    payModalKeypadLocked ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-300 text-gray-800 hover:bg-gray-400'
                  }`}
                  onClick={handlePayRemaining}
                >
                  {t('remainingAmount')}
                </button>
                <button
                  type="button"
                  className="py-3 px-3 bg-gray-300 w-[300px] rounded-lg text-gray-800 text-3xl font-medium hover:bg-gray-400"
                  onClick={handlePayReset}
                >
                  {t('reset')}
                </button>
              </div>
            </div>
            <div className="flex justify-between px-[250px] text-3xl gap-10 w-full pt-10">
              <button
                type="button"
                disabled={payConfirmLoading}
                className="mt-auto w-[230px] py-3 px-6 bg-gray-300 rounded-lg text-gray-800 font-medium hover:bg-gray-400"
                onClick={() => setShowPayDifferentlyModal(false)}
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                disabled={selectedPayment == null || payConfirmLoading}
                className={`mt-4 py-3 w-[230px] px-6 rounded-lg font-medium ${
                  selectedPayment == null || payConfirmLoading
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-300 text-gray-800 hover:bg-gray-400'
                }`}
                onClick={handleConfirmPayment}
              >
                {payConfirmLoading ? 'Processing...' : t('toConfirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {paymentSuccessMessage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="payment-success-title"
          onClick={() => setPaymentSuccessMessage('')}
        >
          <div
            className="bg-pos-panel rounded-lg shadow-xl px-10 py-8 max-w-3xl w-full mx-4 border border-pos-border"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="payment-success-title" className="text-3xl mb-6 font-semibold text-pos-text text-center">
              Payment successful
            </h2>
            <p className="text-2xl text-pos-text text-center mb-8">{paymentSuccessMessage}</p>
            <div className="flex justify-center">
              <button
                type="button"
                className="w-[200px] py-4 bg-green-600 text-white rounded text-2xl hover:bg-green-700"
                onClick={() => setPaymentSuccessMessage('')}
              >
                OK
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
                {t('clearListConfirm')}
              </div>
            </h2>
            <div className="flex gap-3 justify-between">
              <button
                type="button"
                className="w-[200px] py-5 bg-pos-surface text-pos-text rounded text-2xl hover:bg-pos-surface-hover"
                onClick={() => setShowDeleteAllModal(false)}
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                className="w-[200px] py-5 bg-pos-danger text-white rounded text-2xl hover:bg-pos-danger/90"
                onClick={async () => {
                  await onRemoveAllOrders?.();
                  setShowDeleteAllModal(false);
                  setSelectedItemIds([]);
                }}
              >
                {t('ok')}
              </button>
            </div>
          </div>
        </div>
      )}

      {paymentErrorMessage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="payment-error-title"
          onClick={() => setPaymentErrorMessage('')}
        >
          <div
            className="bg-pos-panel rounded-lg shadow-xl px-10 py-8 max-w-3xl w-full mx-4 border border-pos-border"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="payment-error-title" className="text-3xl mb-6 font-semibold text-pos-text text-center">
              Payment error
            </h2>
            <p className="text-2xl text-pos-text text-center mb-8">{paymentErrorMessage}</p>
            <div className="flex justify-center">
              <button
                type="button"
                className="w-[200px] py-4 bg-pos-surface text-pos-text rounded text-2xl hover:bg-pos-surface-hover"
                onClick={() => setPaymentErrorMessage('')}
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
                className="py-7 bg-pos-surface border-none rounded-md text-pos-text text-3xl hover:bg-pos-surface-hover"
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
