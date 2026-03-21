import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const KEYPAD = [
  ['7', '8', '9'],
  ['4', '5', '6'],
  ['1', '2', '3'],
  ['C', '0', '.']
];

const formatSubtotalPrice = (n) => `€ ${Number(n).toFixed(2).replace('.', ',')}`;
const roundCurrency = (n) => Math.round((Number(n) || 0) * 100) / 100;
const formatPaymentAmount = (n) => `€${roundCurrency(n).toFixed(2)}`;
const TABLE_SAVED_ORDERS_API = '/api/settings/table-saved-orders';
const TABLE_LAST_PAID_AT_STORAGE_KEY = 'pos.tables.lastPaidAtById';

function sumAmountsByIntegration(methods, amounts, integration) {
  return methods
    .filter((m) => m.integration === integration)
    .reduce((sum, m) => sum + (Number(amounts[m.id]) || 0), 0);
}

/** Build payment breakdown { amounts: { methodId: amount } } from methods and amounts */
function buildPaymentBreakdown(methods, amounts) {
  const result = {};
  for (const m of methods) {
    const v = Number(amounts[m.id]) || 0;
    if (v > 0.0001) result[m.id] = roundCurrency(v);
  }
  return Object.keys(result).length > 0 ? { amounts: result } : null;
}

/** Allocate payment breakdown proportionally across orders. totalOfAllOrders = sum of order totals. */
function allocatePaymentBreakdown(paymentBreakdown, orderTotal, totalOfAllOrders) {
  if (!paymentBreakdown?.amounts || totalOfAllOrders <= 0) return paymentBreakdown;
  const ratio = orderTotal / totalOfAllOrders;
  const allocated = {};
  for (const [methodId, amt] of Object.entries(paymentBreakdown.amounts)) {
    const allocatedAmt = roundCurrency(amt * ratio);
    if (allocatedAmt > 0.0001) allocated[methodId] = allocatedAmt;
  }
  return Object.keys(allocated).length > 0 ? { amounts: allocated } : null;
}

export function OrderPanel({ order, orders, onRemoveItem, onUpdateItemQuantity, onStatusChange, onCreateOrder, onRemoveAllOrders, tables, showSubtotalView = false, subtotalBreaks = [], onPaymentCompleted, selectedTable = null, currentUser = null, currentTime = '' }) {
  const { t } = useLanguage();
  const tr = (key, fallback) => {
    const translated = t(key);
    return translated === key ? fallback : translated;
  };
  const [customAmount, setCustomAmount] = useState('');
  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [showPayDifferentlyModal, setShowPayDifferentlyModal] = useState(false);
  const [paymentAmounts, setPaymentAmounts] = useState({});
  const [activePaymentMethods, setActivePaymentMethods] = useState([]);
  const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPayworldStatusModal, setShowPayworldStatusModal] = useState(false);
  const [payworldStatus, setPayworldStatus] = useState({ state: 'IDLE', message: '', details: null });
  const [payModalTargetTotal, setPayModalTargetTotal] = useState(0);
  const [payModalKeypadInput, setPayModalKeypadInput] = useState('');
  const [payConfirmLoading, setPayConfirmLoading] = useState(false);
  const [paymentErrorMessage, setPaymentErrorMessage] = useState('');
  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState('');
  const [showFinalSettlementModal, setShowFinalSettlementModal] = useState(false);
  const [showSettlementSubtotalModal, setShowSettlementSubtotalModal] = useState(false);
  const [settlementModalType, setSettlementModalType] = useState('subtotal');
  const [pendingSplitCheckout, setPendingSplitCheckout] = useState(null);
  const [subtotalLineGroups, setSubtotalLineGroups] = useState([]);
  const [subtotalSelectedLeftIds, setSubtotalSelectedLeftIds] = useState([]);
  const [subtotalSelectedRightIds, setSubtotalSelectedRightIds] = useState([]);
  const [savedTableOrders, setSavedTableOrders] = useState([]);
  const splitRightPanelScrollRef = useRef(null);
  const activeCashmaticSessionIdRef = useRef(null);
  const cancelCashmaticRequestedRef = useRef(false);
  const activePayworldSessionIdRef = useRef(null);
  const cancelPayworldRequestedRef = useRef(false);

  const total = order?.total ?? 0;
  const items = order?.items ?? [];
  const hasSelectedTable = selectedTable?.id != null;
  const hasOrderItems = items.length > 0;
  const cashierName = currentUser?.label || currentUser?.name || 'admin';
  const savedTableOrderIds = savedTableOrders.map((entry) => entry.orderId).filter(Boolean);
  const savedOrderMetaById = new Map(savedTableOrders.map((entry) => [entry.orderId, entry]));
  const isSavedTableOrder = !!(hasSelectedTable && order?.id && savedTableOrderIds.includes(order.id));
  const savedOrdersForSelectedTable = hasSelectedTable
    ? (orders || []).filter(
      (o) =>
        o?.status === 'open' &&
        String(o?.tableId ?? '') === String(selectedTable?.id ?? '') &&
        savedTableOrderIds.includes(o?.id) &&
        o?.id !== order?.id
    )
    : [];
  const settlementOrder = savedOrdersForSelectedTable[savedOrdersForSelectedTable.length - 1] || null;
  const showSettlementActions = hasSelectedTable && !hasOrderItems && !!settlementOrder;
  const settlementSubtotalLines = savedOrdersForSelectedTable.flatMap((savedOrder) =>
    (savedOrder?.items || []).map((item, itemIndex) => ({
      id: `${savedOrder.id}:${item?.id || itemIndex}`,
      label: `${Math.max(1, Number(item?.quantity) || 1)}x ${item?.product?.name ?? '—'}`,
      amount: roundCurrency((Number(item?.price) || 0) * Math.max(1, Number(item?.quantity) || 1))
    }))
  );
  const settlementSubtotalLineById = new Map(settlementSubtotalLines.map((line) => [line.id, line]));
  const subtotalAssignedLineIds = new Set(subtotalLineGroups.flatMap((group) => group?.lineIds || []));
  const settlementSubtotalLeftLines = settlementSubtotalLines.filter((line) => !subtotalAssignedLineIds.has(line.id));
  const settlementSubtotalRightGroups = subtotalLineGroups
    .map((group, index) => {
      const lines = (group?.lineIds || []).map((id) => settlementSubtotalLineById.get(id)).filter(Boolean);
      return {
        id: group?.id || `group-${index + 1}`,
        label: `${t('group')} ${index + 1}`,
        lines,
        total: roundCurrency(lines.reduce((sum, line) => sum + (Number(line?.amount) || 0), 0))
      };
    })
    .filter((group) => group.lines.length > 0);
  const hasSplitBillSelection = settlementSubtotalRightGroups.some((group) => group.lines.length > 0);
  const splitSelectedLineIds = settlementSubtotalRightGroups.flatMap((group) => group.lines.map((line) => line.id));
  const splitSelectedTotal = roundCurrency(settlementSubtotalRightGroups.reduce((sum, group) => sum + (Number(group.total) || 0), 0));
  const scrollSplitRightPanel = (direction) => {
    const el = splitRightPanelScrollRef.current;
    if (!el) return;
    el.scrollTop += direction * 120;
  };
  const computeOrderTotal = (sourceOrder) =>
    roundCurrency((sourceOrder?.items || []).reduce((sum, item) => sum + (Number(item?.price) || 0) * (Number(item?.quantity) || 0), 0));
  const currentOrderTotal = hasOrderItems ? computeOrderTotal({ items }) : roundCurrency(total);
  const settlementOrdersTotal = roundCurrency(savedOrdersForSelectedTable.reduce((sum, sourceOrder) => sum + computeOrderTotal(sourceOrder), 0));
  const payableTotal = showSettlementActions ? settlementOrdersTotal : currentOrderTotal;
  const latestOpenNoTableOrder = !hasSelectedTable
    ? (orders || [])
      .filter((o) => o?.status === 'open' && !o?.tableId)
      .reduce((latest, candidate) => {
        if (!latest) return candidate;
        const latestTime = new Date(latest?.createdAt || 0).getTime();
        const candidateTime = new Date(candidate?.createdAt || 0).getTime();
        return candidateTime >= latestTime ? candidate : latest;
      }, null)
    : null;
  const fallbackNoTableTotal = latestOpenNoTableOrder
    ? (Array.isArray(latestOpenNoTableOrder.items) && latestOpenNoTableOrder.items.length > 0
      ? computeOrderTotal(latestOpenNoTableOrder)
      : roundCurrency(Number(latestOpenNoTableOrder?.total) || 0))
    : 0;
  const payableTotalForPaymentModal =
    !hasSelectedTable && payableTotal <= 0.009 && fallbackNoTableTotal > 0.009
      ? fallbackNoTableTotal
      : payableTotal;
  const selectedItems = items.filter((i) => selectedItemIds.includes(i.id));
  const hasSelection = selectedItemIds.length > 0;
  const canDecreaseAll = selectedItems.length > 0 && selectedItems.every((i) => (i.quantity ?? 0) > 1);
  const getItemLabel = (item) => item?.product?.name ?? '—';
  const parseNoteToken = (token) => {
    const raw = String(token || '').trim();
    if (!raw) return null;
    const [labelPart, pricePart] = raw.split('::');
    const label = String(labelPart || '').trim();
    if (!label) return null;
    if (pricePart == null) return { label, price: 0 };
    const parsed = Number(pricePart);
    if (!Number.isFinite(parsed)) return { label, price: 0 };
    return { label, price: parsed };
  };
  const getItemNotes = (item) =>
    String(item?.notes || '')
      .split(/[;,]/)
      .map((n) => parseNoteToken(n))
      .filter(Boolean);
  const getItemQuantity = (item) => Math.max(1, Number(item?.quantity) || 1);
  const getItemNoteUnitTotal = (item) =>
    roundCurrency(getItemNotes(item).reduce((sum, note) => sum + (Number(note?.price) || 0), 0));
  const getItemBaseUnitPrice = (item) => {
    const productBase = Number(item?.product?.price);
    if (Number.isFinite(productBase)) return roundCurrency(productBase);
    const orderUnitPrice = Number(item?.price) || 0;
    return roundCurrency(Math.max(0, orderUnitPrice - getItemNoteUnitTotal(item)));
  };
  const getItemBaseLinePrice = (item) => roundCurrency(getItemBaseUnitPrice(item) * getItemQuantity(item));
  const getItemNoteLinePrice = (item, note) => roundCurrency((Number(note?.price) || 0) * getItemQuantity(item));
  const formatSavedOrderTime = (dateLike, fallbackDateLike = null) => {
    const d = new Date(dateLike || fallbackDateLike || Date.now());
    if (Number.isNaN(d.getTime())) return currentTime || '';
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
  };
  const normalizeSavedTableOrders = (list) => {
    if (!Array.isArray(list)) return [];
    const byOrderId = new Map();
    for (const raw of list) {
      if (raw == null) continue;
      if (typeof raw === 'string') {
        const orderId = String(raw).trim();
        if (!orderId) continue;
        byOrderId.set(orderId, { orderId, cashierName: '', savedAt: null });
        continue;
      }
      if (typeof raw === 'object') {
        const orderId = String(raw.orderId ?? raw.id ?? '').trim();
        if (!orderId) continue;
        byOrderId.set(orderId, {
          orderId,
          cashierName: String(raw.cashierName ?? raw.userName ?? raw.name ?? '').trim(),
          savedAt: raw.savedAt ? String(raw.savedAt) : null
        });
      }
    }
    return Array.from(byOrderId.values());
  };

  const persistSavedTableOrders = async (entries) => {
    const normalized = normalizeSavedTableOrders(entries);
    setSavedTableOrders(normalized);
    const res = await fetch(TABLE_SAVED_ORDERS_API, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: normalized })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error || 'Failed to save table order.');
    }
    const serverValue = normalizeSavedTableOrders(data?.value);
    setSavedTableOrders(serverValue);
    return serverValue;
  };

  const toggleItemSelection = (id) => {
    if (isSavedTableOrder) return;
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(TABLE_SAVED_ORDERS_API);
        const data = await res.json().catch(() => ({}));
        if (!res.ok || cancelled) return;
        setSavedTableOrders(normalizeSavedTableOrders(data?.value));
      } catch { }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!showPayDifferentlyModal) return;
    let cancelled = false;
    (async () => {
      setPaymentMethodsLoading(true);
      try {
        const res = await fetch('/api/payment-methods?active=1');
        const data = await res.json().catch(() => ({}));
        if (!res.ok || cancelled) return;
        const list = Array.isArray(data?.data) ? data.data : [];
        const sorted = [...list].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
        if (cancelled) return;
        setActivePaymentMethods(sorted);
        setPaymentAmounts(Object.fromEntries(sorted.map((m) => [m.id, 0])));
      } catch {
        if (!cancelled) setActivePaymentMethods([]);
      } finally {
        if (!cancelled) setPaymentMethodsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showPayDifferentlyModal]);

  const handleKeypad = (key) => {
    if (key === 'C') {
      setCustomAmount('');
      return;
    }
    setCustomAmount((prev) => prev + key);
  };

  const openPayDifferentlyModal = (overrideTotal = null) => {
    const targetTotal = roundCurrency(overrideTotal ?? payableTotalForPaymentModal);
    if (targetTotal <= 0) return;
    setActivePaymentMethods([]);
    setPaymentAmounts({});
    setShowPayDifferentlyModal(true);
    setSelectedPayment(null);
    setPayModalTargetTotal(targetTotal);
    setPayModalKeypadInput(targetTotal.toFixed(2));
  };

  const payModalTotalAssigned = activePaymentMethods.reduce(
    (sum, m) => sum + (Number(paymentAmounts[m.id]) || 0),
    0,
  );
  const payModalRemaining = Math.max(0, payModalTargetTotal - payModalTotalAssigned);
  const payModalKeypadValue = parseFloat(String(payModalKeypadInput || '').replace(',', '.')) || 0;
  /** Block assigning if keypad value would push assigned total over order total. */
  const payModalWouldExceedTotal =
    payModalKeypadValue > 0 &&
    roundCurrency(payModalTotalAssigned + payModalKeypadValue) - payModalTargetTotal > 0.009;
  /** When assigned matches total, lock keypad/methods/half/remaining/cancel; only Reset + To confirm remain active (To confirm runs payment). */
  const payModalSplitComplete =
    payModalTargetTotal > 0.009 && Math.abs(payModalTotalAssigned - payModalTargetTotal) <= 0.009;

  const handlePayModalKeypad = (key) => {
    if (payModalSplitComplete) return;
    if (key === 'C') {
      setPayModalKeypadInput('');
      return;
    }
    setPayModalKeypadInput((prev) => {
      if (prev === payModalTargetTotal.toFixed(2)) return key;
      return prev + key;
    });
  };

  const handlePaymentMethodClick = (method) => {
    if (!method?.id || payModalSplitComplete || payModalWouldExceedTotal) return;
    const value = parseFloat(String(payModalKeypadInput || '').replace(',', '.')) || 0;
    if (value > 0) {
      setPaymentAmounts((prev) => ({
        ...prev,
        [method.id]: (Number(prev[method.id]) || 0) + value,
      }));
      setPayModalKeypadInput('');
    } else {
      setSelectedPayment(method.id);
    }
  };

  const handlePayHalfAmount = () => {
    if (payModalSplitComplete) return;
    const half = roundCurrency(payModalTargetTotal / 2);
    setPayModalKeypadInput(half.toFixed(2));
  };
  const handlePayRemaining = () => {
    if (payModalSplitComplete) return;
    const remaining = roundCurrency(Math.max(0, payModalTargetTotal - payModalTotalAssigned));
    setPayModalKeypadInput(remaining.toFixed(2));
  };
  const handlePayReset = () => {
    setPaymentAmounts(Object.fromEntries(activePaymentMethods.map((m) => [m.id, 0])));
    setPayModalKeypadInput(payModalTargetTotal.toFixed(2));
    setSelectedPayment(null);
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
    activeCashmaticSessionIdRef.current = sessionId;
    cancelCashmaticRequestedRef.current = false;

    for (let i = 0; i < 90; i += 1) {
      if (cancelCashmaticRequestedRef.current) {
        await fetch(`/api/cashmatic/cancel/${encodeURIComponent(sessionId)}`, { method: 'POST' }).catch(() => { });
        throw new Error('Cashmatic payment cancelled.');
      }
      await sleep(1000);
      const statusRes = await fetch(`/api/cashmatic/status/${encodeURIComponent(sessionId)}`);
      const statusData = await statusRes.json().catch(() => ({}));
      if (!statusRes.ok) {
        throw new Error(statusData?.error || 'Unable to read Cashmatic payment status.');
      }

      const state = String(statusData?.data?.state || '').toUpperCase();
      if (state === 'PAID' || state === 'FINISHED' || state === 'FINISHED_MANUAL') {
        await fetch(`/api/cashmatic/finish/${encodeURIComponent(sessionId)}`, { method: 'POST' });
        activeCashmaticSessionIdRef.current = null;
        return;
      }
      if (state === 'CANCELLED' || state === 'ERROR') {
        throw new Error(statusData?.error || `Cashmatic payment ${state.toLowerCase()}.`);
      }
    }

    await fetch(`/api/cashmatic/cancel/${encodeURIComponent(sessionId)}`, { method: 'POST' }).catch(() => { });
    activeCashmaticSessionIdRef.current = null;
    throw new Error('Cashmatic payment timeout. Please try again.');
  };

  const runPayworldPayment = async (amountEuro) => {
    const amount = roundCurrency(Number(amountEuro) || 0);
    if (amount <= 0) return;

    setShowPayworldStatusModal(true);
    setPayworldStatus({
      state: 'IN_PROGRESS',
      message: tr('orderPanel.payworldConnecting', 'Connecting to terminal...'),
      details: null,
    });

    const startRes = await fetch('/api/payworld/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount })
    });
    const startData = await startRes.json().catch(() => ({}));
    if (!startRes.ok || startData?.ok === false) {
      throw new Error(startData?.error || 'Unable to start Payworld payment.');
    }

    const sessionId = startData?.sessionId || startData?.data?.sessionId;
    if (!sessionId) throw new Error('Payworld session did not start.');

    activePayworldSessionIdRef.current = sessionId;
    cancelPayworldRequestedRef.current = false;
    setPayworldStatus({
      state: 'IN_PROGRESS',
      message: tr('orderPanel.payworldInProgress', 'Payment in progress on terminal...'),
      details: null,
    });

    for (let i = 0; i < 150; i += 1) {
      if (cancelPayworldRequestedRef.current) {
        await fetch(`/api/payworld/cancel/${encodeURIComponent(sessionId)}`, { method: 'POST' }).catch(() => { });
        setPayworldStatus({
          state: 'CANCELLED',
          message: tr('orderPanel.paymentCancelled', 'Payment cancelled.'),
          details: null,
        });
        throw new Error(tr('orderPanel.paymentCancelled', 'Payment cancelled.'));
      }
      await sleep(1000);
      const statusRes = await fetch(`/api/payworld/status/${encodeURIComponent(sessionId)}`);
      const statusData = await statusRes.json().catch(() => ({}));
      if (!statusRes.ok || statusData?.ok === false) {
        throw new Error(statusData?.error || 'Unable to read Payworld payment status.');
      }

      const state = String(statusData?.state || '').toUpperCase();
      const statusMessage = String(statusData?.message || '').trim();
      const details = statusData?.details || null;
      setPayworldStatus({
        state: state || 'IN_PROGRESS',
        message: statusMessage || tr('orderPanel.payworldInProgress', 'Payment in progress on terminal...'),
        details,
      });
      if (state === 'APPROVED') {
        setPayworldStatus({
          state: 'APPROVED',
          message: statusMessage || tr('orderPanel.payworldApproved', 'Payment approved.'),
          details,
        });
        await sleep(800);
        setShowPayworldStatusModal(false);
        activePayworldSessionIdRef.current = null;
        return;
      }
      if (state === 'DECLINED' || state === 'CANCELLED' || state === 'ERROR') {
        setShowPayworldStatusModal(false);
        throw new Error(statusMessage || `Payworld payment ${state.toLowerCase()}.`);
      }
    }

    await fetch(`/api/payworld/cancel/${encodeURIComponent(sessionId)}`, { method: 'POST' }).catch(() => { });
    setPayworldStatus({
      state: 'ERROR',
      message: tr('orderPanel.payworldTimeout', 'Payworld payment timeout. Please try again.'),
      details: null,
    });
    setShowPayworldStatusModal(false);
    activePayworldSessionIdRef.current = null;
    throw new Error('Payworld payment timeout. Please try again.');
  };

  const handleAbortPayworld = async () => {
    const activeSessionId = activePayworldSessionIdRef.current;
    if (!activeSessionId) {
      setPayworldStatus({
        state: 'ERROR',
        message: tr('orderPanel.payworldNoActiveSession', 'No active Payworld session to cancel.'),
        details: null,
      });
      return;
    }

    cancelPayworldRequestedRef.current = true;
    setPayworldStatus({
      state: 'IN_PROGRESS',
      message: tr('orderPanel.payworldCancelling', 'Payment is being cancelled on the terminal...'),
      details: null,
    });

    await fetch(`/api/payworld/cancel/${encodeURIComponent(activeSessionId)}`, { method: 'POST' }).catch(() => { });
  };

  const payworldStatusTitle = (() => {
    switch (String(payworldStatus.state || '').toUpperCase()) {
      case 'IN_PROGRESS':
        return tr('orderPanel.payworldStatusInProgress', 'Payment in progress on terminal...');
      case 'APPROVED':
        return tr('orderPanel.payworldStatusApproved', 'Payment approved.');
      case 'DECLINED':
        return tr('orderPanel.payworldStatusDeclined', 'Payment declined.');
      case 'CANCELLED':
        return tr('orderPanel.payworldStatusCancelled', 'Payment cancelled.');
      case 'ERROR':
        return tr('orderPanel.payworldStatusError', 'Error during payment.');
      default:
        return tr('orderPanel.payworldStatusReady', 'Ready.');
    }
  })();

  const handleCancelPayDifferentlyModal = async () => {
    if (payModalSplitComplete && !payConfirmLoading) return;
    if (payConfirmLoading) {
      cancelCashmaticRequestedRef.current = true;
      cancelPayworldRequestedRef.current = true;
      const activeSessionId = activeCashmaticSessionIdRef.current;
      if (activeSessionId) {
        await fetch(`/api/cashmatic/cancel/${encodeURIComponent(activeSessionId)}`, { method: 'POST' }).catch(() => { });
      }
      const activePayworldSessionId = activePayworldSessionIdRef.current;
      if (activePayworldSessionId) {
        await fetch(`/api/payworld/cancel/${encodeURIComponent(activePayworldSessionId)}`, { method: 'POST' }).catch(() => { });
      }
      setShowPayworldStatusModal(false);
      setPaymentErrorMessage(tr('orderPanel.paymentCancelled', 'Payment cancelled.'));
    }
    setShowPayDifferentlyModal(false);
    setPendingSplitCheckout(null);
  };

  const printTicketAutomatically = async (targetOrderId, paymentBreakdown = null) => {
    if (!targetOrderId) throw new Error('No order selected for printing.');
    const body = { orderId: targetOrderId };
    if (paymentBreakdown && typeof paymentBreakdown === 'object') body.paymentBreakdown = paymentBreakdown;
    const printRes = await fetch('/api/printers/receipt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
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

  const toApiOrderItem = (item) => {
    const productId = String(item?.productId || item?.product?.id || '').trim();
    if (!productId) throw new Error('Split bill contains an item without product id.');
    return {
      productId,
      quantity: Math.max(1, Number(item?.quantity) || 1),
      price: Number(item?.price) || 0,
      notes: item?.notes || null
    };
  };

  const patchOrderItems = async (orderId, nextItems) => {
    const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: nextItems.map(toApiOrderItem) })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || 'Failed to update split order items.');
    return data;
  };

  const markSelectedTablePaid = () => {
    if (!selectedTable?.id) return;
    try {
      const raw = localStorage.getItem(TABLE_LAST_PAID_AT_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      const current = parsed && typeof parsed === 'object' ? parsed : {};
      current[String(selectedTable.id)] = Date.now();
      localStorage.setItem(TABLE_LAST_PAID_AT_STORAGE_KEY, JSON.stringify(current));
    } catch {
      // Ignore storage write failures.
    }
  };

  const createPaidSplitOrder = async (sourceItems, paymentBreakdown = null) => {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tableId: selectedTable?.id || null,
        items: sourceItems.map(toApiOrderItem)
      })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.id) {
      throw new Error(data?.error || 'Failed to create split checkout order.');
    }
    await onStatusChange?.(data.id, 'paid', paymentBreakdown ? { paymentBreakdown } : {});
    return data.id;
  };

  const settleSplitBillSelection = async (selectedLineIds, paymentBreakdown = null) => {
    const selectedByOrderId = new Map();
    for (const lineId of selectedLineIds) {
      const [orderId, itemId] = String(lineId || '').split(':');
      if (!orderId || !itemId) continue;
      if (!selectedByOrderId.has(orderId)) selectedByOrderId.set(orderId, new Set());
      selectedByOrderId.get(orderId).add(itemId);
    }
    if (selectedByOrderId.size === 0) throw new Error('No split bill items selected.');

    const paidOrderIds = [];
    const fullySettledSourceOrderIds = [];

    const ordersToPay = [];
    for (const sourceOrder of savedOrdersForSelectedTable) {
      const selectedItemIdsForOrder = selectedByOrderId.get(sourceOrder?.id);
      if (!selectedItemIdsForOrder || selectedItemIdsForOrder.size === 0) continue;

      const sourceItems = Array.isArray(sourceOrder?.items) ? sourceOrder.items : [];
      const selectedItems = sourceItems.filter((item) => selectedItemIdsForOrder.has(item?.id));
      const remainingItems = sourceItems.filter((item) => !selectedItemIdsForOrder.has(item?.id));
      if (selectedItems.length === 0) continue;

      const orderTotal = roundCurrency(selectedItems.reduce((sum, item) => sum + (Number(item?.price) || 0) * Math.max(1, Number(item?.quantity) || 1), 0));
      ordersToPay.push({ sourceOrder, selectedItems, remainingItems, orderTotal });
    }

    const totalPaid = roundCurrency(ordersToPay.reduce((sum, o) => sum + o.orderTotal, 0));

    for (const { sourceOrder, selectedItems, remainingItems, orderTotal } of ordersToPay) {
      const orderPaymentBreakdown = paymentBreakdown && totalPaid > 0
        ? allocatePaymentBreakdown(paymentBreakdown, orderTotal, totalPaid)
        : null;

      if (remainingItems.length === 0) {
        await onStatusChange?.(sourceOrder.id, 'paid', orderPaymentBreakdown ? { paymentBreakdown: orderPaymentBreakdown } : {});
        paidOrderIds.push(sourceOrder.id);
        fullySettledSourceOrderIds.push(sourceOrder.id);
      } else {
        const paidSplitOrderId = await createPaidSplitOrder(selectedItems, orderPaymentBreakdown);
        await patchOrderItems(sourceOrder.id, remainingItems);
        paidOrderIds.push(paidSplitOrderId);
      }
    }

    if (fullySettledSourceOrderIds.length > 0) {
      const nextSaved = savedTableOrders.filter((entry) => !fullySettledSourceOrderIds.includes(entry.orderId));
      await persistSavedTableOrders(nextSaved);
    }

    return paidOrderIds;
  };

  const resetAfterSuccessfulPayment = () => {
    setShowPayDifferentlyModal(false);
    setPaymentAmounts({});
    setActivePaymentMethods([]);
    setSelectedPayment(null);
    setPayModalTargetTotal(0);
    setPayModalKeypadInput('');
    setSelectedItemIds([]);
    setCustomAmount('');
    setShowDeleteAllModal(false);
    setShowSettlementSubtotalModal(false);
    setSettlementModalType('subtotal');
    setPendingSplitCheckout(null);
    setSubtotalLineGroups([]);
    setSubtotalSelectedLeftIds([]);
    setSubtotalSelectedRightIds([]);
    setShowPayworldStatusModal(false);
    setPayworldStatus({ state: 'IDLE', message: '', details: null });
  };

  const handleConfirmPayment = async () => {
    if (payConfirmLoading) return;

    const assignedTotal = roundCurrency(payModalTotalAssigned);
    const orderTotal = roundCurrency(payModalTargetTotal);

    if (assignedTotal <= 0) {
      setPaymentErrorMessage(tr('orderPanel.assignedAmountGreaterThanZero', 'Assigned amount must be greater than 0.'));
      return;
    }
    if (Math.abs(assignedTotal - orderTotal) > 0.009) {
      setPaymentErrorMessage(`Assigned amount (€${assignedTotal.toFixed(2)}) must match total (€${orderTotal.toFixed(2)}).`);
      return;
    }
    if (paymentMethodsLoading || activePaymentMethods.length === 0) {
      setPaymentErrorMessage(
        tr('orderPanel.noPaymentMethods', 'No active payment methods. Add them under Control → Payment types.'),
      );
      return;
    }

    try {
      setPayConfirmLoading(true);
      const cashmaticTotal = sumAmountsByIntegration(activePaymentMethods, paymentAmounts, 'cashmatic');
      if (cashmaticTotal > 0) {
        await runCashmaticPayment(cashmaticTotal);
      }
      const payworldTotal = sumAmountsByIntegration(activePaymentMethods, paymentAmounts, 'payworld');
      if (payworldTotal > 0) {
        await runPayworldPayment(payworldTotal);
      }
      if (pendingSplitCheckout?.type === 'splitBill') {
        const paymentBreakdown = buildPaymentBreakdown(activePaymentMethods, paymentAmounts);
        const paidOrderIds = await settleSplitBillSelection(pendingSplitCheckout.lineIds || [], paymentBreakdown);
        if (paidOrderIds.length === 0) {
          throw new Error('No split bill order available for checkout.');
        }

        let printedSuccessfully = true;
        let printResult = null;
        try {
          for (const paidOrderId of paidOrderIds) {
            // Split checkout prints only selected(right panel) items because paid split orders contain only those items.
            printResult = await printTicketAutomatically(paidOrderId);
          }
        } catch (printErr) {
          printedSuccessfully = false;
          setPaymentErrorMessage(printErr?.message || 'Automatic ticket print failed.');
        }

        await onPaymentCompleted?.(paidOrderIds);
        markSelectedTablePaid();
        if (printedSuccessfully) {
          setPaymentSuccessMessage(
            `Payment successful (${formatPaymentAmount(orderTotal)}). Receipt printed successfully${printResult?.printerName ? ` on ${printResult.printerName}` : ''}.`
          );
        }

        const nextAction = pendingSplitCheckout.action;
        resetAfterSuccessfulPayment();
        if (nextAction === 'continue') {
          setSettlementModalType('splitBill');
          setShowSettlementSubtotalModal(true);
        }
        return;
      }

      const targetOrderIds = showSettlementActions
        ? savedOrdersForSelectedTable.map((o) => o.id).filter(Boolean)
        : (order?.id ? [order.id] : []);
      if (targetOrderIds.length === 0) {
        throw new Error('No order available for settlement.');
      }
      const remainingSavedIds = savedTableOrders.filter((entry) => !targetOrderIds.includes(entry.orderId));
      if (remainingSavedIds.length !== savedTableOrders.length) {
        await persistSavedTableOrders(remainingSavedIds);
      }

      const paymentBreakdown = buildPaymentBreakdown(activePaymentMethods, paymentAmounts);
      const settlementTotal = roundCurrency(targetOrderIds.reduce((sum, id) => {
        const o = (showSettlementActions ? savedOrdersForSelectedTable : [order]).find((x) => x?.id === id);
        return sum + (o ? computeOrderTotal(o) : 0);
      }, 0));

      for (const paidOrderId of targetOrderIds) {
        const paidOrder = showSettlementActions
          ? savedOrdersForSelectedTable.find((o) => o?.id === paidOrderId)
          : (order?.id === paidOrderId ? order : null);
        const orderTotal = paidOrder ? computeOrderTotal(paidOrder) : 0;
        const orderPaymentBreakdown = paymentBreakdown && settlementTotal > 0
          ? allocatePaymentBreakdown(paymentBreakdown, orderTotal, settlementTotal)
          : paymentBreakdown;
        await onStatusChange?.(paidOrderId, 'paid', orderPaymentBreakdown ? { paymentBreakdown: orderPaymentBreakdown } : {});
      }
      await onPaymentCompleted?.(targetOrderIds);
      markSelectedTablePaid();
      let printedSuccessfully = true;
      let printResult = null;
      try {
        if (targetOrderIds.length === 1) {
          const amounts = {};
          for (const m of activePaymentMethods) {
            const v = Number(paymentAmounts[m.id]) || 0;
            if (v > 0.0001) amounts[m.id] = v;
          }
          printResult = await printTicketAutomatically(targetOrderIds[0], { amounts });
        } else {
          for (const targetId of targetOrderIds) {
            // Print each settled order ticket separately; backend computes each order total.
            printResult = await printTicketAutomatically(targetId);
          }
        }
      } catch (printErr) {
        printedSuccessfully = false;
        setPaymentErrorMessage(printErr?.message || 'Automatic ticket print failed.');
      }
      if (printedSuccessfully) {
        const methodLines = activePaymentMethods
          .map((m) => {
            const v = Number(paymentAmounts[m.id]) || 0;
            return v > 0.0001 ? `${m.name}: ${formatPaymentAmount(v)}` : null;
          })
          .filter(Boolean);
        setPaymentSuccessMessage([
          `Payment successful (${formatPaymentAmount(orderTotal)}).`,
          methodLines.length ? methodLines.join(' | ') : '',
          `Receipt printed successfully${printResult?.printerName ? ` on ${printResult.printerName}` : ''}.`,
        ].filter(Boolean).join(' '));
      }
      if (!hasSelectedTable) {
        await onCreateOrder?.();
      }
      resetAfterSuccessfulPayment();
    } catch (err) {
      setPaymentErrorMessage(err?.message || tr('orderPanel.paymentFailed', 'Payment failed.'));
    } finally {
      setPayConfirmLoading(false);
      activeCashmaticSessionIdRef.current = null;
      activePayworldSessionIdRef.current = null;
      cancelCashmaticRequestedRef.current = false;
      cancelPayworldRequestedRef.current = false;
    }
  };

  return (
    <aside className="w-1/4 shrink-0 flex flex-col px-2 py-1 bg-pos-bg border-l border-pos-border">
      <div className="flex flex-col bg-pos-surface rounded-lg overflow-hidden min-h-[50%]">
        {showSubtotalView ? (
          <div className="flex-1 overflow-auto p-4 py-2 text-pos-bg text-sm">
            {(() => {
              let start = 0;
              const result = [];
              for (let i = 0; i < subtotalBreaks.length; i++) {
                const end = subtotalBreaks[i];
                const group = items.slice(start, end);
                const groupTotal = group.reduce((s, it) => s + it.price * it.quantity, 0);
                group.forEach((item) => (
                  result.push(
                    <div key={item.id} className="py-1">
                      <div className="flex justify-between items-baseline">
                        <span className="font-medium">{item.quantity}x {getItemLabel(item)}</span>
                        <span className="font-medium">{formatSubtotalPrice(getItemBaseLinePrice(item))}</span>
                      </div>
                      {getItemNotes(item).map((note, noteIdx) => (
                        <div key={`${item.id}-note-${noteIdx}`} className="flex justify-between items-baseline pl-6 text-pos-bg/80">
                          <span>{note.label}</span>
                          <span>{formatSubtotalPrice(getItemNoteLinePrice(item, note))}</span>
                        </div>
                      ))}
                    </div>
                  )
                ));
                result.push(
                  <div key={`sub-${i}`} className="border-b border-gray-800 mb-2">
                    <div className="flex justify-around items-baseline text-md font-medium relative">
                      <span className='font-bold'>{t('subtotal')}:</span>
                      <span className='flex font-bold'>{formatSubtotalPrice(groupTotal)}</span>
                    </div>
                  </div>
                );
                start = end;
              }
              const remaining = items.slice(start);
              remaining.forEach((item) =>
                result.push(
                  <div key={item.id} className="py-1 text-sm">
                    <div className="flex justify-between items-baseline">
                      <span className="font-medium">{item.quantity}x {getItemLabel(item)}</span>
                      <span className="font-medium">{formatSubtotalPrice(getItemBaseLinePrice(item))}</span>
                    </div>
                    {getItemNotes(item).map((note, noteIdx) => (
                      <div key={`${item.id}-note-rem-${noteIdx}`} className="flex justify-between items-baseline pl-6 text-sm text-pos-bg/80">
                        <span>{note.label}</span>
                        <span>{formatSubtotalPrice(getItemNoteLinePrice(item, note))}</span>
                      </div>
                    ))}
                  </div>
                )
              );
              return result;
            })()}
          </div>
        ) : (
          <div className="flex-1 overflow-auto p-2">
            {savedOrdersForSelectedTable.map((savedOrder) => (
              <div key={`saved-order-${savedOrder.id}`}>
                {(savedOrder.items || []).map((item) => (
                  <div
                    key={`saved-${savedOrder.id}-${item.id}`}
                    className="flex flex-wrap items-center gap-1 p-1 text-sm text-pos-bg rounded"
                  >
                    <div className="w-full">
                      <div className="flex items-baseline justify-between">
                        <span className="flex-1 font-semibold">
                          {item.quantity}x {getItemLabel(item)}
                        </span>
                        <span className="font-semibold">€{getItemBaseLinePrice(item).toFixed(2)}</span>
                      </div>
                      {getItemNotes(item).map((note, noteIdx) => (
                        <div key={`saved-${savedOrder.id}-${item.id}-notes-${noteIdx}`} className="flex items-baseline justify-between pl-6 text-sm opacity-90">
                          <span>▪ {note.label}</span>
                          <span>€{getItemNoteLinePrice(item, note).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="pt-1 px-2 text-pos-bg/90">
                  {(() => {
                    const savedMeta = savedOrderMetaById.get(savedOrder.id);
                    const savedCashierName = savedMeta?.cashierName || cashierName;
                    const savedTime = formatSavedOrderTime(savedMeta?.savedAt, savedOrder?.createdAt);
                    return (
                      <div className="flex items-center justify-around text-md font-semibold py-1 pt-0">
                        <span>{savedCashierName}</span>
                        <span>{savedTime}</span>
                      </div>
                    );
                  })()}
                  <div className="w-full h-px bg-pos-bg/40" />
                </div>
              </div>
            ))}
            {items.map((item) => (
              <div
                key={item.id}
                className={`flex flex-wrap items-center gap-1 p-2 py-1 text-sm text-pos-bg rounded hover:bg-white/30 cursor-pointer ${selectedItemIds.includes(item.id) ? 'bg-white/50' : ''
                  }`}
                onClick={() => toggleItemSelection(item.id)}
              >
                <div className="w-full">
                  <div className="flex items-baseline justify-between">
                    <span className="flex-1 font-semibold">
                      {item.quantity}x {getItemLabel(item)}
                    </span>
                    <span className="font-semibold">€{getItemBaseLinePrice(item).toFixed(2)}</span>
                  </div>
                  {getItemNotes(item).map((note, noteIdx) => (
                    <div key={`${item.id}-notes-${noteIdx}`} className="flex items-baseline justify-between pl-6 text-md opacity-90">
                      <span>▪ {note.label}</span>
                      <span>€{getItemNoteLinePrice(item, note).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 py-1 px-2 border-t border-black/10 text-xl">
        <button
          type="button"
          disabled={!hasSelection}
          className={`w-12 h-12 p-0 flex items-center justify-center border-none rounded text-xl ${!hasSelection || isSavedTableOrder ? 'bg-black/10 opacity-50 cursor-not-allowed' : 'bg-black/10 hover:opacity-90'
            }`}
          onClick={() => {
            if (isSavedTableOrder) return;
            if (order && selectedItems.length > 0) {
              selectedItems.forEach((item) => {
                onUpdateItemQuantity?.(order.id, item.id, item.quantity + 1);
              });
            }
          }}
        >
          <svg width="25px" height="25px" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path fill="#ffffff" d="M9 4h2v5h5v2h-5v5H9v-5H4V9h5V4z" />
          </svg>
        </button>
        <button
          type="button"
          disabled={!canDecreaseAll || isSavedTableOrder}
          className={`w-12 h-12 p-0 flex items-center justify-center border-none rounded text-3xl ${!canDecreaseAll || isSavedTableOrder ? 'bg-black/10 opacity-50 cursor-not-allowed' : 'bg-black/10 hover:opacity-90'
            }`}
          onClick={() => {
            if (isSavedTableOrder) return;
            if (order && canDecreaseAll) {
              selectedItems.forEach((item) => {
                if (item.quantity > 1) {
                  onUpdateItemQuantity?.(order.id, item.id, item.quantity - 1);
                }
              });
            }
          }}
        >
          <svg width="30" height="30" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path fill="#ffffff" d="M4 9h12v2H4V9z" />
          </svg>
        </button>
        <button
          type="button"
          className={`flex-1 py-2 flex items-center justify-center border-none rounded ${!hasSelection || isSavedTableOrder
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-gray-600'
            }`}
          onClick={() => {
            if (isSavedTableOrder) return;
            if (order && selectedItemIds.length > 0) {
              selectedItemIds.forEach((id) => onRemoveItem(order.id, id));
              setSelectedItemIds([]);
            }
          }}
          disabled={!hasSelection || isSavedTableOrder}
          aria-label={t('remove')}
        >
          <img src="/delete.svg" alt="" className="w-8 h-8 brightness-0 invert" />
        </button>
        <button
          type="button"
          disabled={isSavedTableOrder}
          className={`flex-1 py-2 flex items-center justify-center border-none rounded ${isSavedTableOrder ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-600'
            }`}
          onClick={() => setShowDeleteAllModal(true)}
          aria-label={t('clear')}
        >
          <img src="/clear.svg" alt="" className="w-8 h-8 brightness-0 invert" />
        </button>
      </div>

      <div className="flex items-center w-full px-2 justify-between text-xl font-semibold py-1">
        <span className='text-lg'>{t('total')}:&nbsp;€{payableTotal.toFixed(2)}</span>
        <div>
          <input
            readOnly
            tabIndex={0}
            className='w-[100px] h-full py-2 px-2 bg-pos-surface border-none rounded-md text-pos-text text-lg hover:bg-pos-surface-hover outline-none cursor-pointer'
            type='text'
            value={customAmount}
            aria-label={t('enterAmountKeypad')}
          />
        </div>
      </div>

      {hasSelectedTable ? (
        showSettlementActions ? (
          <div className="flex gap-2 text-sm py-1 min-h-[59px]">
            <button
              type="button"
              className="flex-1 py-3 px-2 bg-pos-surface border-none rounded-md text-pos-text hover:bg-pos-surface-hover"
              onClick={() => settlementOrder && onStatusChange?.(settlementOrder.id, 'in_planning')}
            >
              {t('interimAccount')}
            </button>
            <button
              type="button"
              className="flex-1 py-3 px-2 bg-pos-surface border-none rounded-md text-pos-text hover:bg-pos-surface-hover"
              onClick={() => setShowFinalSettlementModal(true)}
            >
              {t('finalSettlement')}
            </button>
          </div>
        ) : (
          <div className="flex py-2">
            <button
              type="button"
              className={`w-full py-3 px-2 border-none rounded-md text-md ${hasOrderItems
                ? 'bg-pos-surface text-pos-text hover:bg-pos-surface-hover'
                : 'bg-pos-surface text-gray-400 cursor-not-allowed opacity-70'
                }`}
              onClick={async () => {
                if (!hasOrderItems) return;
                const currentOrderId = order?.id;
                if (!currentOrderId) return;
                try {
                  await persistSavedTableOrders([
                    ...savedTableOrders,
                    { orderId: currentOrderId, cashierName, savedAt: new Date().toISOString() }
                  ]);
                } catch (err) {
                  setPaymentErrorMessage(err?.message || tr('orderPanel.failedSaveTableOrder', 'Failed to save table order.'));
                  return;
                }
                try {
                  await onCreateOrder?.(selectedTable?.id || null);
                } catch (err) {
                  setPaymentErrorMessage(err?.message || tr('orderPanel.failedCreateNewTableOrder', 'Failed to create new table order.'));
                  return;
                }
                setSelectedItemIds([]);
              }}
              disabled={!hasOrderItems}
            >
              {t('addToTable')}
            </button>
          </div>
        )
      ) : (
        <div className="flex gap-2 text-md py-1">
          <button
            type="button"
            className="flex-1 py-1 bg-pos-surface border-none rounded-md text-pos-text hover:bg-pos-surface-hover"
            onClick={() => order && onStatusChange(order.id, 'in_planning')}
          >
            {t('inPlanning')}
          </button>
          <button
            type="button"
            disabled={payableTotalForPaymentModal <= 0.009}
            className={`flex-1 py-1 border-none rounded-md min-h-[53px] max-h-[53px] ${payableTotalForPaymentModal <= 0.009
              ? 'bg-pos-surface text-gray-400 cursor-not-allowed opacity-70'
              : 'bg-pos-surface text-pos-text hover:bg-pos-surface-hover'
              }`}
            onClick={() => openPayDifferentlyModal()}
          >
            {t('payDifferently')}
          </button>
          <button
            type="button"
            className="px-4 bg-pos-surface border-none rounded-md text-pos-text text-2xl hover:bg-pos-surface-hover"
          >
            €
          </button>
        </div>
      )}

      {showPayDifferentlyModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pay-differently-title"
        >
          <div
            className="flex flex-col bg-gray-100 rounded-xl shadow-2xl max-w-[1800px] w-full overflow-auto text-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left: Total + payment methods */}
            <div className="flex items-center justify-center">
              <div className="p-6 min-w-[46%] w-full h-full flex flex-col">
                <div className="text-lg font-semibold mb-3 flex w-full justify-center items-center">{t('total')}: €{payModalTargetTotal.toFixed(2)}</div>
                <div className="grid grid-cols-2 gap-4 w-full mb-4 h-full items-start justify-center">
                  {paymentMethodsLoading ? (
                    <div className="text-sm text-gray-600 py-6">
                      {tr('orderPanel.loadingPaymentMethods', 'Loading payment methods...')}
                    </div>
                  ) : activePaymentMethods.length === 0 ? (
                    <div className="text-sm text-amber-900 py-6 text-center max-w-lg px-4">
                      {tr(
                        'orderPanel.noPaymentMethods',
                        'No active payment methods. Configure them under Control → Payment types.',
                      )}
                    </div>
                  ) : (
                    activePaymentMethods.map((m) => {
                      const amt = Number(paymentAmounts[m.id]) || 0;
                      const isHighlighted = selectedPayment === m.id || amt > 0;
                      const integ = m.integration || 'generic';
                      return (
                        <div key={m.id} className="flex flex-col items-center gap-1.5">
                          <button
                            type="button"
                            disabled={payModalSplitComplete || payModalWouldExceedTotal}
                            onClick={() => handlePaymentMethodClick(m)}
                            className={`rounded-lg border-2 p-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isHighlighted ? 'bg-green-500 border-green-700' : 'bg-white border-gray-300'
                              }`}
                            aria-label={m.name}
                          >
                            {integ === 'manual_cash' ? (
                              <span className="flex items-center justify-center w-[105px] h-[70px] text-4xl font-bold text-amber-600 bg-amber-50/80 rounded">€</span>
                            ) : integ === 'cashmatic' ? (
                              <img src="/cash.png" alt={m.name} className="max-h-[70px] w-auto object-contain" />
                            ) : integ === 'payworld' ? (
                              <img src="/payworld.png" alt={m.name} className="max-h-[70px] w-auto object-contain" />
                            ) : integ === 'generic' ? (
                              <img src="/card.svg" alt={m.name} className="max-h-[70px] w-[105px] w-auto object-contain" />
                            ) : (
                              <span className="flex items-center justify-center w-[70px] min-h-[70px] px-2 py-3 text-base font-semibold text-center text-blue-900 bg-blue-50/80 rounded leading-tight">
                                {m.name}
                              </span>
                            )}
                          </button>
                          <div className="text-sm font-semibold tabular-nums text-center max-w-[140px]" aria-live="polite">
                            <span className="block text-xs font-normal text-gray-600 mb-0.5 truncate">{m.name}</span>
                            {formatPaymentAmount(amt)}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
              {/* Right: Assigned + input + keypad */}
              <div className="min-w-[30%] p-6">
                <div className="text-lg font-semibold mb-2 flex justify-center">{t('assigned')}: €{payModalTotalAssigned.toFixed(2)}</div>
                <div className="flex justify-center mt-2">
                  <input
                    readOnly
                    className="w-[160px] py-2 px-3 bg-gray-200 rounded-lg text-base mb-3 outline-none cursor-default"
                    value={payModalKeypadInput}
                    aria-label={t('amountKeypad')}
                  />
                </div>
                <div className="flex gap-2 flex-1 min-h-0 mt-3">
                  <div className="flex flex-col gap-1.5 flex-1">
                    {KEYPAD.map((row, ri) => (
                      <div key={ri} className="grid grid-cols-3 gap-1.5">
                        {row.map((key) => (
                          <button
                            key={key}
                            type="button"
                            disabled={payModalSplitComplete}
                            className={`py-4 rounded-lg text-lg font-medium ${payModalSplitComplete ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-300 text-gray-800 hover:bg-gray-400'}`}
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
              <div className="min-w-[24%] flex flex-col items-center justify-center gap-4 p-6">
                <button
                  type="button"
                  disabled={payModalSplitComplete}
                  className={`py-2 px-4 w-full max-w-[200px] rounded-lg text-sm font-medium ${payModalSplitComplete ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-300 text-gray-800 hover:bg-gray-400'}`}
                  onClick={handlePayHalfAmount}
                >
                  {t('halfAmount')}
                </button>
                <button
                  type="button"
                  disabled={payModalSplitComplete}
                  className={`py-2 px-4 w-full max-w-[200px] rounded-lg text-sm font-medium ${payModalSplitComplete ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-300 text-gray-800 hover:bg-gray-400'}`}
                  onClick={handlePayRemaining}
                >
                  {t('remainingAmount')}
                </button>
                <button
                  type="button"
                  className="py-2 px-4 bg-gray-300 w-full max-w-[200px] rounded-lg text-gray-800 text-sm font-medium hover:bg-gray-400"
                  onClick={handlePayReset}
                >
                  {t('reset')}
                </button>
              </div>
            </div>
            <div className="flex justify-around px-6 gap-4 w-full pt-6 pb-6">
              <button
                type="button"
                disabled={payModalSplitComplete && !payConfirmLoading}
                className={`w-[140px] py-2 px-4 rounded-lg text-sm font-medium ${payModalSplitComplete && !payConfirmLoading
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-300 text-gray-800 hover:bg-gray-400'
                  }`}
                onClick={handleCancelPayDifferentlyModal}
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                disabled={
                  Math.abs(payModalTotalAssigned - payModalTargetTotal) > 0.009 ||
                  payConfirmLoading ||
                  paymentMethodsLoading ||
                  activePaymentMethods.length === 0
                }
                className={`w-[140px] py-2 px-4 rounded-lg text-sm font-medium ${Math.abs(payModalTotalAssigned - payModalTargetTotal) > 0.009 || payConfirmLoading || paymentMethodsLoading || activePaymentMethods.length === 0
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-300 text-gray-800 hover:bg-gray-400'
                  }`}
                onClick={handleConfirmPayment}
              >
                {payConfirmLoading ? t('processing') : t('toConfirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPayworldStatusModal && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="payworld-status-title"
        >
          <div className="bg-pos-panel rounded-lg shadow-xl px-10 py-8 max-w-2xl w-full mx-4 border border-pos-border">
            <h2 id="payworld-status-title" className="text-3xl mb-6 font-semibold text-pos-text text-center">
              {tr('orderPanel.payworldModalTitle', 'Payworld / PAX A35 Payment')}
            </h2>
            <div className="space-y-4 text-pos-text">
              <div className="flex justify-between items-center text-2xl">
                <span>{tr('orderPanel.payworldAmount', 'Amount')}:</span>
                <span className="font-semibold">€ {payModalTargetTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-2xl">
                <span>{tr('orderPanel.payworldStatusLabel', 'Status')}:</span>
                <span className="font-semibold">{payworldStatusTitle}</span>
              </div>
              {payworldStatus.message && (
                <div className="rounded-md bg-pos-surface px-4 py-3 text-xl whitespace-pre-line">
                  {payworldStatus.message}
                </div>
              )}
            </div>
            <div className="mt-8 flex justify-center gap-4">
              {String(payworldStatus.state || '').toUpperCase() === 'IN_PROGRESS' ? (
                <button
                  type="button"
                  className="min-w-[220px] py-4 bg-pos-surface text-pos-text rounded text-2xl hover:bg-pos-surface-hover"
                  onClick={handleAbortPayworld}
                >
                  {tr('orderPanel.cancelPayworld', 'Cancel Payment')}
                </button>
              ) : (
                <button
                  type="button"
                  className="min-w-[220px] py-4 bg-pos-surface text-pos-text rounded text-2xl hover:bg-pos-surface-hover"
                  onClick={() => setShowPayworldStatusModal(false)}
                >
                  {tr('orderPanel.closePayworldModal', 'Close')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showFinalSettlementModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="final-settlement-options-title"
        >
          <div
            className="bg-gray-100 rounded-xl shadow-2xl max-w-3xl w-full px-8 py-10"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="final-settlement-options-title" className="sr-only">
              {t('finalSettlementOptions')}
            </h2>
            <div className="grid grid-cols-3 gap-10 items-start">
              <button
                type="button"
                className="h-14 bg-gray-200 border-none rounded text-xl font-semibold text-gray-700 hover:bg-gray-300"
                onClick={() => {
                  setShowFinalSettlementModal(false);
                  openPayDifferentlyModal();
                }}
              >
                {t('finalPayment')}
              </button>
              <div className="flex flex-col gap-6">
                <button
                  type="button"
                  className="h-14 bg-gray-200 border-none rounded text-xl font-semibold text-gray-700 hover:bg-gray-300"
                  onClick={() => {
                    setShowFinalSettlementModal(false);
                    setShowSettlementSubtotalModal(true);
                    setSettlementModalType('subtotal');
                    setSubtotalLineGroups([]);
                    setSubtotalSelectedLeftIds([]);
                    setSubtotalSelectedRightIds([]);
                  }}
                >
                  {t('subtotal')}
                </button>
                <button
                  type="button"
                  className="h-14 bg-gray-200 border-none rounded text-xl font-semibold text-gray-700 hover:bg-gray-300"
                  onClick={() => setShowFinalSettlementModal(false)}
                >
                  {t('cancel')}
                </button>
              </div>
              <button
                type="button"
                className="h-14 bg-gray-200 border-none rounded text-xl font-semibold text-gray-700 hover:bg-gray-300"
                onClick={() => {
                  setShowFinalSettlementModal(false);
                  setShowSettlementSubtotalModal(true);
                  setSettlementModalType('splitBill');
                  setSubtotalLineGroups([]);
                  setSubtotalSelectedLeftIds([]);
                  setSubtotalSelectedRightIds([]);
                }}
              >
                {t('splitBill')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSettlementSubtotalModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="settlement-subtotal-title"
        >
          <div
            className="bg-pos-panel rounded-xl shadow-2xl w-full max-w-[1400px] h-[86vh] p-4 border border-pos-border flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div id="settlement-subtotal-title" className="flex items-center justify-between text-xl font-semibold text-pos-text px-2 pb-1 border-b border-pos-border">
              <span>{selectedTable?.name || t('table')}</span>
              <span>€ {payableTotal.toFixed(2)}</span>
            </div>

            <div className="flex-1 min-h-0 flex gap-5">
              <div className="flex flex-col h-full w-full">
                <div className="flex-1 border border-pos-border overflow-auto bg-pos-bg">
                  {settlementSubtotalLeftLines.map((line) => (
                    <button
                      key={line.id}
                      type="button"
                      className={`w-full text-left px-4 py-2 border-b border-pos-border/40 text-sm text-pos-text flex items-center justify-between ${subtotalSelectedLeftIds.includes(line.id) ? 'bg-pos-surface-hover' : 'hover:bg-pos-surface-hover/60'
                        }`}
                      onClick={() => {
                        setSubtotalSelectedLeftIds((prev) =>
                          prev.includes(line.id) ? prev.filter((id) => id !== line.id) : [...prev, line.id]
                        );
                        setSubtotalSelectedRightIds([]);
                      }}
                    >
                      <span>- {line.label}</span>
                      <span>€ {line.amount.toFixed(2)}</span>
                    </button>
                  ))}
                </div>
                <div className="pt-4 flex items-center justify-center border-t border-pos-border/50">
                  <button
                    type="button"
                    disabled={settlementSubtotalLeftLines.length === 0}
                    className={`min-w-[100px] py-1 px-6 rounded text-pos-text text-md ${settlementSubtotalLeftLines.length === 0
                      ? 'bg-pos-surface opacity-50 cursor-not-allowed'
                      : 'bg-pos-surface hover:bg-pos-surface-hover'
                      }`}
                    onClick={() => {
                      setSubtotalSelectedLeftIds(settlementSubtotalLeftLines.map((line) => line.id));
                      setSubtotalSelectedRightIds([]);
                    }}
                  >
                    {t('all')}
                  </button>
                </div>
              </div>

              <div className="w-16 flex flex-col items-center justify-between py-16 text-pos-text mb-20">
                <button
                  type="button"
                  className="text-6xl leading-none hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={subtotalSelectedLeftIds.length === 0}
                  onClick={() => {
                    if (subtotalSelectedLeftIds.length === 0) return;
                    const idsToMove = subtotalSelectedLeftIds.filter((id) =>
                      settlementSubtotalLeftLines.some((line) => line.id === id)
                    );
                    if (idsToMove.length === 0) return;
                    setSubtotalLineGroups((prev) => [
                      ...prev,
                      { id: `group-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, lineIds: idsToMove }
                    ]);
                    setSubtotalSelectedLeftIds([]);
                    setSubtotalSelectedRightIds([]);
                  }}
                >
                  →
                </button>
                <button
                  type="button"
                  className="text-6xl leading-none hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={subtotalSelectedRightIds.length === 0}
                  onClick={() => {
                    if (subtotalSelectedRightIds.length === 0) return;
                    setSubtotalLineGroups((prev) =>
                      prev
                        .map((group) => ({
                          ...group,
                          lineIds: (group?.lineIds || []).filter((id) => !subtotalSelectedRightIds.includes(id))
                        }))
                        .filter((group) => (group?.lineIds || []).length > 0)
                    );
                    setSubtotalSelectedRightIds([]);
                    setSubtotalSelectedLeftIds([]);
                  }}
                >
                  ←
                </button>
              </div>

              <div className="flex flex-col h-full w-full">
                <div className="flex-1 border border-pos-border bg-pos-bg flex flex-col">
                  <div ref={splitRightPanelScrollRef} className="flex-1 overflow-auto">
                    {settlementSubtotalRightGroups.map((group) => (
                      <div
                        key={group.id}
                        className={`px-4 py-2 border-b ${group.lines.length > 0 && group.lines.every((line) => subtotalSelectedRightIds.includes(line.id))
                          ? 'border-2 border-rose-500 rounded-md'
                          : ''
                          }`}
                      >
                        <div className="text-center text-lg font-semibold text-pos-text">
                          {group.label}
                        </div>
                        {group.lines.map((line) => (
                          <button
                            key={line.id}
                            type="button"
                            className={`w-full text-left px-2 py-1 text-sm text-pos-text flex items-center justify-between ${subtotalSelectedRightIds.includes(line.id) ? 'bg-pos-surface-hover' : 'hover:bg-pos-surface-hover/60'
                              }`}
                            onClick={() => {
                              setSubtotalSelectedRightIds((prev) =>
                                prev.includes(line.id) ? prev.filter((id) => id !== line.id) : [...prev, line.id]
                              );
                              setSubtotalSelectedLeftIds([]);
                            }}
                          >
                            <span>- {line.label}</span>
                            <span>€ {line.amount.toFixed(2)}</span>
                          </button>
                        ))}
                        <div className="text-center text-md font-semibold text-pos-text">
                          € {group.total.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="py-1 flex items-center justify-around gap-5">
                    <button
                      type="button"
                      className="w-10 h-10 rounded bg-pos-surface text-pos-text text-xl leading-none hover:bg-pos-surface-hover"
                      onClick={() => scrollSplitRightPanel(-1)}
                      aria-label={t('scrollUp')}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="min-w-[100px] py-2 px-6 rounded bg-pos-surface text-pos-text text-md hover:bg-pos-surface-hover"
                      onClick={() => {
                        setSubtotalLineGroups([]);
                        setSubtotalSelectedLeftIds([]);
                        setSubtotalSelectedRightIds([]);
                      }}
                    >
                      {t('again')}
                    </button>
                    <button
                      type="button"
                      className="w-10 h-10 rounded bg-pos-surface text-pos-text text-xl leading-none hover:bg-pos-surface-hover"
                      onClick={() => scrollSplitRightPanel(1)}
                      aria-label={t('scrollDown')}
                    >
                      ↓
                    </button>
                  </div>
                </div>
                <div className="pt-4 flex items-center justify-center gap-12">
                  <button
                    type="button"
                    className="min-w-[100px] py-1 px-6 rounded bg-pos-surface text-pos-text text-md hover:bg-pos-surface-hover"
                    onClick={() => {
                      setShowSettlementSubtotalModal(false);
                      setSettlementModalType('subtotal');
                      setSubtotalLineGroups([]);
                      setSubtotalSelectedLeftIds([]);
                      setSubtotalSelectedRightIds([]);
                    }}
                  >
                    {t('cancel')}
                  </button>
                  {settlementModalType === 'splitBill' ? (
                    <>
                      <button
                        type="button"
                        disabled={!hasSplitBillSelection}
                        className={`min-w-[150px] py-1 px-6 rounded text-md ${!hasSplitBillSelection
                          ? 'bg-pos-surface text-pos-text opacity-50 cursor-not-allowed'
                          : 'bg-pos-surface text-pos-text hover:bg-pos-surface-hover'
                          }`}
                        onClick={() => {
                          if (!hasSplitBillSelection) return;
                          setShowSettlementSubtotalModal(false);
                          setPendingSplitCheckout({
                            type: 'splitBill',
                            action: 'return',
                            lineIds: splitSelectedLineIds
                          });
                          openPayDifferentlyModal(splitSelectedTotal);
                        }}
                      >
                        {t('checkoutAndReturn')}
                      </button>
                      <button
                        type="button"
                        disabled={!hasSplitBillSelection}
                        className={`min-w-[170px] py-1 px-6 rounded text-md ${!hasSplitBillSelection
                          ? 'bg-pos-surface text-pos-text opacity-50 cursor-not-allowed'
                          : 'bg-pos-surface text-pos-text hover:bg-pos-surface-hover'
                          }`}
                        onClick={() => {
                          if (!hasSplitBillSelection) return;
                          setShowSettlementSubtotalModal(false);
                          setPendingSplitCheckout({
                            type: 'splitBill',
                            action: 'continue',
                            lineIds: splitSelectedLineIds
                          });
                          openPayDifferentlyModal(splitSelectedTotal);
                        }}
                      >
                        {t('checkoutAndContinueSplit')}
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      disabled={settlementSubtotalLeftLines.length > 0}
                      className={`min-w-[100px] py-1 px-6 rounded text-md ${settlementSubtotalLeftLines.length > 0
                        ? 'bg-pos-surface text-pos-text opacity-50 cursor-not-allowed'
                        : 'bg-pos-surface text-pos-text hover:bg-pos-surface-hover'
                        }`}
                      onClick={() => {
                        if (settlementSubtotalLeftLines.length > 0) return;
                        setShowSettlementSubtotalModal(false);
                        setPendingSplitCheckout(null);
                        openPayDifferentlyModal();
                      }}
                    >
                      {t('checkout')}
                    </button>
                  )}
                </div>
              </div>
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
        >
          <div
            className="bg-pos-panel rounded-lg shadow-xl px-10 py-8 max-w-3xl w-full mx-4 border border-pos-border"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="payment-success-title" className="text-3xl mb-6 font-semibold text-pos-text text-center">
              {t('paymentSuccessfulTitle')}
            </h2>
            <p className="text-2xl text-pos-text text-center mb-8">{paymentSuccessMessage}</p>
            <div className="flex justify-center">
              <button
                type="button"
                className="w-[200px] py-4 bg-green-600 text-white rounded text-2xl hover:bg-green-700"
                onClick={() => setPaymentSuccessMessage('')}
              >
                {t('ok')}
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
        >
          <div
            className="bg-pos-panel rounded-lg shadow-xl px-16 py-8 max-w-2xl w-full mx-4 border border-pos-border"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="delete-all-title" className="text-2xl mb-10 font-semibold flex justify-center w-full text-pos-text">
              <div className='flex'>
                {t('clearListConfirm')}
              </div>
            </h2>
            <div className="flex gap-3 justify-between">
              <button
                type="button"
                className="py-3 px-10 bg-pos-surface text-pos-text rounded text-xl hover:bg-pos-surface-hover"
                onClick={() => setShowDeleteAllModal(false)}
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                className="py-3 px-10 bg-pos-danger text-white rounded text-xl hover:bg-pos-danger/90"
                onClick={async () => {
                  if (isSavedTableOrder) {
                    setShowDeleteAllModal(false);
                    return;
                  }
                  if (hasSelectedTable && order?.id) {
                    const currentItemIds = (order.items || []).map((it) => it.id).filter(Boolean);
                    for (const itemId of currentItemIds) {
                      await onRemoveItem?.(order.id, itemId);
                    }
                    setShowDeleteAllModal(false);
                    setSelectedItemIds([]);
                    return;
                  }
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
        >
          <div
            className="bg-pos-panel rounded-lg shadow-xl px-10 py-8 max-w-3xl w-full mx-4 border border-pos-border"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="payment-error-title" className="text-3xl mb-6 font-semibold text-pos-text text-center">
              {t('paymentErrorTitle')}
            </h2>
            <p className="text-2xl text-pos-text text-center mb-8">{paymentErrorMessage}</p>
            <div className="flex justify-center">
              <button
                type="button"
                className="w-[200px] py-4 bg-pos-surface text-pos-text rounded text-2xl hover:bg-pos-surface-hover"
                onClick={() => setPaymentErrorMessage('')}
              >
                {t('ok')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2 h-[45%]">
        {KEYPAD.map((row, ri) => (
          <div key={ri} className="grid grid-cols-3 gap-2">
            {row.map((key) => (
              <button
                key={key}
                type="button"
                className="py-3 bg-pos-panel border-none rounded-md text-pos-text text-xl active:bg-pos-surface-hover"
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
