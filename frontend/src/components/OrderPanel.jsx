import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const KEYPAD = [
  ['C', '7', '8', '9'],
  [',', '4', '5', '6'],
  ['0', '1', '2', '3']
];

const formatSubtotalPrice = (n) => `€ ${Number(n).toFixed(2).replace('.', ',')}`;
const roundCurrency = (n) => Math.round((Number(n) || 0) * 100) / 100;
const formatPaymentAmount = (n) => `€${roundCurrency(n).toFixed(2)}`;
const TABLE_SAVED_ORDERS_API = '/api/settings/table-saved-orders';
const TABLE_LAST_PAID_AT_STORAGE_KEY = 'pos.tables.lastPaidAtById';

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
  const [paymentAmounts, setPaymentAmounts] = useState({ cash: 0, bancontact: 0, visa: 0 });
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [payModalTargetTotal, setPayModalTargetTotal] = useState(0);
  const [payModalKeypadInput, setPayModalKeypadInput] = useState('');
  const [payModalKeypadLocked, setPayModalKeypadLocked] = useState(false);
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
    setShowPayDifferentlyModal(true);
    setPaymentAmounts({ cash: 0, bancontact: 0, visa: 0 });
    setSelectedPayment('cash');
    setPayModalTargetTotal(targetTotal);
    setPayModalKeypadInput(targetTotal.toFixed(2));
    setPayModalKeypadLocked(false);
  };

  const payModalTotalAssigned = paymentAmounts.cash + paymentAmounts.bancontact + paymentAmounts.visa;
  const payModalRemaining = Math.max(0, payModalTargetTotal - payModalTotalAssigned);

  const handlePayModalKeypad = (key) => {
    if (payModalKeypadLocked) return;
    if (key === 'C') {
      setPayModalKeypadInput('');
      return;
    }
    setPayModalKeypadInput((prev) => {
      if (prev === payModalTargetTotal.toFixed(2)) return key;
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
    if (payModalKeypadLocked) return;
    const targetPayment = selectedPayment || 'cash';
    const half = roundCurrency(payModalTargetTotal / 2);
    setSelectedPayment(targetPayment);
    setPaymentAmounts((prev) => ({ ...prev, [targetPayment]: half }));
    setPayModalKeypadInput('');
  };
  const handlePayRemaining = () => {
    if (payModalKeypadLocked) return;
    const targetPayment = selectedPayment || 'cash';
    setSelectedPayment(targetPayment);
    setPaymentAmounts((prev) => ({ ...prev, [targetPayment]: prev[targetPayment] + payModalRemaining }));
    setPayModalKeypadInput('');
  };
  const handlePayReset = () => {
    setPaymentAmounts({ cash: 0, bancontact: 0, visa: 0 });
    setPayModalKeypadInput(payModalTargetTotal.toFixed(2));
    setSelectedPayment('cash');
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
    activeCashmaticSessionIdRef.current = sessionId;
    cancelCashmaticRequestedRef.current = false;

    for (let i = 0; i < 90; i += 1) {
      if (cancelCashmaticRequestedRef.current) {
        await fetch(`/api/cashmatic/cancel/${encodeURIComponent(sessionId)}`, { method: 'POST' }).catch(() => {});
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

  const handleCancelPayDifferentlyModal = async () => {
    if (payConfirmLoading) {
      cancelCashmaticRequestedRef.current = true;
      const activeSessionId = activeCashmaticSessionIdRef.current;
      if (activeSessionId) {
        await fetch(`/api/cashmatic/cancel/${encodeURIComponent(activeSessionId)}`, { method: 'POST' }).catch(() => {});
      }
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

  const createPaidSplitOrder = async (sourceItems) => {
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
    await onStatusChange?.(data.id, 'paid');
    return data.id;
  };

  const settleSplitBillSelection = async (selectedLineIds) => {
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

    for (const sourceOrder of savedOrdersForSelectedTable) {
      const selectedItemIds = selectedByOrderId.get(sourceOrder?.id);
      if (!selectedItemIds || selectedItemIds.size === 0) continue;

      const sourceItems = Array.isArray(sourceOrder?.items) ? sourceOrder.items : [];
      const selectedItems = sourceItems.filter((item) => selectedItemIds.has(item?.id));
      const remainingItems = sourceItems.filter((item) => !selectedItemIds.has(item?.id));
      if (selectedItems.length === 0) continue;

      if (remainingItems.length === 0) {
        await onStatusChange?.(sourceOrder.id, 'paid');
        paidOrderIds.push(sourceOrder.id);
        fullySettledSourceOrderIds.push(sourceOrder.id);
      } else {
        const paidSplitOrderId = await createPaidSplitOrder(selectedItems);
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
    setPaymentAmounts({ cash: 0, bancontact: 0, visa: 0 });
    setSelectedPayment(null);
    setPayModalTargetTotal(0);
    setPayModalKeypadInput('');
    setPayModalKeypadLocked(false);
    setSelectedItemIds([]);
    setCustomAmount('');
    setShowDeleteAllModal(false);
    setShowSettlementSubtotalModal(false);
    setSettlementModalType('subtotal');
    setPendingSplitCheckout(null);
    setSubtotalLineGroups([]);
    setSubtotalSelectedLeftIds([]);
    setSubtotalSelectedRightIds([]);
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
    const orderTotal = roundCurrency(payModalTargetTotal);

    if (assignedTotal <= 0) {
      setPaymentErrorMessage(tr('orderPanel.assignedAmountGreaterThanZero', 'Assigned amount must be greater than 0.'));
      return;
    }
    if (assignedTotal - orderTotal > 0.009) {
      setPaymentErrorMessage(`Assigned amount (€${assignedTotal.toFixed(2)}) exceeds total (€${orderTotal.toFixed(2)}).`);
      return;
    }
    if (Math.abs(assignedTotal - orderTotal) > 0.009 && nextAmounts.cash <= 0) {
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
      if (Math.abs(assignedTotal - orderTotal) > 0.009) {
        const remainingDue = roundCurrency(orderTotal - assignedTotal);
        setPayModalTargetTotal(remainingDue);
        setPaymentAmounts({ cash: 0, bancontact: 0, visa: 0 });
        setSelectedPayment('cash');
        setPayModalKeypadInput(remainingDue.toFixed(2));
        setPayModalKeypadLocked(false);
        setPaymentSuccessMessage(`Partial payment successful (${formatPaymentAmount(assignedTotal)}). Remaining: ${formatPaymentAmount(remainingDue)}.`);
        return;
      }
      if (pendingSplitCheckout?.type === 'splitBill') {
        const paidOrderIds = await settleSplitBillSelection(pendingSplitCheckout.lineIds || []);
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
      for (const paidOrderId of targetOrderIds) {
        await onStatusChange?.(paidOrderId, 'paid');
      }
      await onPaymentCompleted?.(targetOrderIds);
      markSelectedTablePaid();
      let printedSuccessfully = true;
      let printResult = null;
      try {
        if (targetOrderIds.length === 1) {
          printResult = await printTicketAutomatically(targetOrderIds[0], nextAmounts);
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
      if (!hasSelectedTable) {
        await onCreateOrder?.();
      }
      resetAfterSuccessfulPayment();
    } catch (err) {
      setPaymentErrorMessage(err?.message || tr('orderPanel.paymentFailed', 'Payment failed.'));
    } finally {
      setPayConfirmLoading(false);
      activeCashmaticSessionIdRef.current = null;
      cancelCashmaticRequestedRef.current = false;
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
                    <div key={item.id} className="py-1.5 text-2xl">
                      <div className="flex justify-between items-baseline">
                        <span className="font-medium">{item.quantity}x {getItemLabel(item)}</span>
                        <span className="font-medium">{formatSubtotalPrice(getItemBaseLinePrice(item))}</span>
                      </div>
                      {getItemNotes(item).map((note, noteIdx) => (
                        <div key={`${item.id}-note-${noteIdx}`} className="flex justify-between items-baseline pl-6 text-xl text-pos-bg/80">
                          <span>{note.label}</span>
                          <span>{formatSubtotalPrice(getItemNoteLinePrice(item, note))}</span>
                        </div>
                      ))}
                    </div>
                  )
                ));
                result.push(
                  <div key={`sub-${i}`} className="border-b border-gray-800 mb-2 pb-2 mb-3">
                    <div className="flex justify-center items-baseline text-3xl font-medium relative">
                      <span className='font-bold'>{t('subtotal')}:</span>
                      <span className='flex font-bold absolute w-full justify-end'>{formatSubtotalPrice(groupTotal)}</span>
                    </div>
                  </div>
                );
                start = end;
              }
              const remaining = items.slice(start);
              remaining.forEach((item) =>
                result.push(
                  <div key={item.id} className="py-1.5 text-2xl">
                    <div className="flex justify-between items-baseline">
                      <span className="font-medium">{item.quantity}x {getItemLabel(item)}</span>
                      <span className="font-medium">{formatSubtotalPrice(getItemBaseLinePrice(item))}</span>
                    </div>
                    {getItemNotes(item).map((note, noteIdx) => (
                      <div key={`${item.id}-note-rem-${noteIdx}`} className="flex justify-between items-baseline pl-6 text-xl text-pos-bg/80">
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
                    className="flex flex-wrap items-center gap-1 p-2 text-2xl text-pos-bg rounded mb-1"
                  >
                    <div className="w-full">
                      <div className="flex items-baseline justify-between">
                        <span className="flex-1 font-semibold">
                          {item.quantity}x {getItemLabel(item)}
                        </span>
                        <span className="font-semibold">€{getItemBaseLinePrice(item).toFixed(2)}</span>
                      </div>
                      {getItemNotes(item).map((note, noteIdx) => (
                        <div key={`saved-${savedOrder.id}-${item.id}-notes-${noteIdx}`} className="flex items-baseline justify-between pl-6 text-xl opacity-90">
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
                      <div className="flex items-center justify-around text-2xl font-semibold py-1">
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
                className={`flex flex-wrap items-center gap-1 p-2 text-2xl text-pos-bg rounded mb-1 hover:bg-white/30 cursor-pointer ${selectedItemIds.includes(item.id) ? 'bg-white/50' : ''
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
                    <div key={`${item.id}-notes-${noteIdx}`} className="flex items-baseline justify-between pl-6 text-xl opacity-90">
                      <span>▪ {note.label}</span>
                      <span>€{getItemNoteLinePrice(item, note).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2 py-2 px-2 border-t border-black/10 text-2xl">
          <button
            type="button"
            disabled={!hasSelection}
            className={`w-12 h-12 p-0 flex items-center justify-center border-none rounded text-3xl ${!hasSelection || isSavedTableOrder ? 'bg-black/10 opacity-50 cursor-not-allowed' : 'bg-black/10 hover:opacity-90'
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
            <svg width="30px" height="30px" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 17V5.414l3.293 3.293a.999.999 0 101.414-1.414l-5-5a.999.999 0 00-1.414 0l-5 5a.997.997 0 000 1.414.999.999 0 001.414 0L9 5.414V17a1 1 0 102 0z" fill="#ffffff" />
            </svg>
          </button>
          <button
            type="button"
            className={`flex-1 py-2 border-none rounded text-2xl ${!hasSelection || isSavedTableOrder
              ? 'text-gray-400 cursor-not-allowed opacity-70'
              : 'text-white hover:bg-gray-600'
              }`}
            onClick={() => {
              if (isSavedTableOrder) return;
              if (order && selectedItemIds.length > 0) {
                selectedItemIds.forEach((id) => onRemoveItem(order.id, id));
                setSelectedItemIds([]);
              }
            }}
            disabled={!hasSelection || isSavedTableOrder}
          >
            {t('remove')}
          </button>
          <button
            type="button"
            disabled={isSavedTableOrder}
            className={`flex-1 py-2 text-pos-text border-none rounded text-2xl ${isSavedTableOrder ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-600'
              }`}
            onClick={() => setShowDeleteAllModal(true)}
          >
            {t('clear')}
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
            <svg width="30" height="30" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.707 17.707l5-5a.999.999 0 10-1.414-1.414L11 14.586V3a1 1 0 10-2 0v11.586l-3.293-3.293a.999.999 0 10-1.414 1.414l5 5a.999.999 0 001.414 0z" fill="#ffffff" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex items-center w-full px-5 justify-between text-xl font-semibold py-2">
        <span className='text-4xl'>{t('total')}:&nbsp;€{payableTotal.toFixed(2)}</span>
        <div>
          <input
            readOnly
            tabIndex={0}
            className='w-[180px] h-full py-4 px-2 bg-pos-surface border-none rounded-md text-pos-text text-2xl hover:bg-pos-surface-hover outline-none cursor-pointer'
            type='text'
            value={customAmount}
            aria-label={t('enterAmountKeypad')}
          />
        </div>
      </div>

      {hasSelectedTable ? (
        showSettlementActions ? (
          <div className="flex gap-2">
            <button
              type="button"
              className="flex-1 py-3 px-2 bg-pos-surface border-none rounded-md text-pos-text text-2xl hover:bg-pos-surface-hover"
              onClick={() => settlementOrder && onStatusChange?.(settlementOrder.id, 'in_planning')}
            >
              {t('interimAccount')}
            </button>
            <button
              type="button"
              className="flex-1 py-3 px-2 bg-pos-surface border-none rounded-md text-pos-text text-2xl hover:bg-pos-surface-hover"
              onClick={() => setShowFinalSettlementModal(true)}
            >
              {t('finalSettlement')}
            </button>
          </div>
        ) : (
          <div className="flex">
            <button
              type="button"
              className={`w-full py-3 px-2 border-none rounded-md text-2xl ${hasOrderItems
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
            disabled={payableTotalForPaymentModal <= 0.009}
            className={`flex-1 py-3 px-2 border-none rounded-md text-2xl ${
              payableTotalForPaymentModal <= 0.009
                ? 'bg-pos-surface text-gray-400 cursor-not-allowed opacity-70'
                : 'bg-pos-surface text-pos-text hover:bg-pos-surface-hover'
            }`}
            onClick={() => openPayDifferentlyModal()}
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
      )}

      {showPayDifferentlyModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pay-differently-title"
        >
          <div
            className="flex flex-col h-[60vh] bg-gray-100 rounded-xl shadow-2xl max-w-[1800px] w-full overflow-auto text-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left: Total + payment methods + Cancel */}
            <div className="flex items-center justify-center">
              <div className="p-10 min-w-[46%] w-full h-full flex flex-col">
                <div className="text-3xl font-semibold mb-4 flex w-full justify-center items-center">{t('total')}: €{payModalTargetTotal.toFixed(2)}</div>
                <div className="flex gap-3 w-full mb-6 h-full items-center justify-center">
                  <button
                    type="button"
                    onClick={handleCashImageClick}
                    className={`rounded-lg border-2 p-2 transition-colors ${selectedPayment === 'cash' ? 'bg-gray-300 border-gray-400' : 'bg-white'
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
                    aria-label={t('amountKeypad')}
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
                            className={`py-9 rounded-lg text-3xl font-medium ${payModalKeypadLocked ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-300 text-gray-800 hover:bg-gray-400'
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
                  className={`py-3 px-3 w-[300px] rounded-lg text-3xl font-medium ${payModalKeypadLocked ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-300 text-gray-800 hover:bg-gray-400'
                    }`}
                  onClick={handlePayHalfAmount}
                >
                  {t('halfAmount')}
                </button>
                <button
                  type="button"
                  disabled={payModalKeypadLocked}
                  className={`py-3 px-3 w-[300px] rounded-lg text-3xl font-medium ${payModalKeypadLocked ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-300 text-gray-800 hover:bg-gray-400'
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
                className="mt-auto w-[230px] py-3 px-6 bg-gray-300 rounded-lg text-gray-800 font-medium hover:bg-gray-400"
                onClick={handleCancelPayDifferentlyModal}
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                disabled={selectedPayment == null || payConfirmLoading}
                className={`mt-4 py-3 w-[230px] px-6 rounded-lg font-medium ${selectedPayment == null || payConfirmLoading
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

      {showFinalSettlementModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="final-settlement-options-title"
        >
          <div
            className="bg-gray-100 rounded-xl shadow-2xl max-w-6xl w-full px-8 py-10"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="final-settlement-options-title" className="sr-only">
              {t('finalSettlementOptions')}
            </h2>
            <div className="grid grid-cols-3 gap-10 items-start">
              <button
                type="button"
                className="h-20 bg-gray-200 border-none rounded text-3xl font-semibold text-gray-700 hover:bg-gray-300"
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
                  className="h-20 bg-gray-200 border-none rounded text-3xl font-semibold text-gray-700 hover:bg-gray-300"
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
                  className="h-20 bg-gray-200 border-none rounded text-3xl font-semibold text-gray-700 hover:bg-gray-300"
                  onClick={() => setShowFinalSettlementModal(false)}
                >
                  {t('cancel')}
                </button>
              </div>
              <button
                type="button"
                className="h-20 bg-gray-200 border-none rounded text-3xl font-semibold text-gray-700 hover:bg-gray-300"
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
            <div id="settlement-subtotal-title" className="flex items-center justify-between text-3xl font-semibold text-pos-text px-2 pb-3 border-b border-pos-border">
              <span>{selectedTable?.name || t('table')}</span>
              <span>€ {payableTotal.toFixed(2)}</span>
            </div>

            <div className="flex-1 min-h-0 flex gap-5 pt-3">
              <div className="flex flex-col h-full w-full">
                <div className="flex-1 border border-pos-border overflow-auto bg-pos-bg">
                  {settlementSubtotalLeftLines.map((line) => (
                    <button
                      key={line.id}
                      type="button"
                      className={`w-full text-left px-4 py-2 border-b border-pos-border/40 text-2xl text-pos-text flex items-center justify-between ${
                        subtotalSelectedLeftIds.includes(line.id) ? 'bg-pos-surface-hover' : 'hover:bg-pos-surface-hover/60'
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
                <div className="py-3 flex items-center justify-center border-t border-pos-border/50">
                  <button
                    type="button"
                    disabled={settlementSubtotalLeftLines.length === 0}
                    className={`min-w-[200px] py-3 px-6 rounded text-pos-text text-2xl ${
                      settlementSubtotalLeftLines.length === 0
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
                        className={`px-4 py-3 border-b ${
                          group.lines.length > 0 && group.lines.every((line) => subtotalSelectedRightIds.includes(line.id))
                            ? 'border-2 border-rose-500 rounded-md'
                            : ''
                        }`}
                      >
                        <div className="text-center text-3xl font-semibold text-pos-text mb-2">
                          {group.label}
                        </div>
                        {group.lines.map((line) => (
                          <button
                            key={line.id}
                            type="button"
                            className={`w-full text-left px-2 py-1 text-2xl text-pos-text flex items-center justify-between ${
                              subtotalSelectedRightIds.includes(line.id) ? 'bg-pos-surface-hover' : 'hover:bg-pos-surface-hover/60'
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
                        <div className="text-center text-3xl font-semibold text-pos-text mt-2">
                          € {group.total.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="py-3 flex items-center justify-around gap-5">
                    <button
                      type="button"
                      className="w-16 h-14 rounded bg-pos-surface text-pos-text text-4xl leading-none hover:bg-pos-surface-hover"
                      onClick={() => scrollSplitRightPanel(-1)}
                      aria-label={t('scrollUp')}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="min-w-[200px] py-3 px-6 rounded bg-pos-surface text-pos-text text-2xl hover:bg-pos-surface-hover"
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
                      className="w-16 h-14 rounded bg-pos-surface text-pos-text text-4xl leading-none hover:bg-pos-surface-hover"
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
                    className="min-w-[200px] min-h-[80px] py-3 px-6 rounded bg-pos-surface text-pos-text text-2xl hover:bg-pos-surface-hover"
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
                        className={`min-w-[200px] min-h-[80px] py-3 px-6 rounded text-2xl ${
                          !hasSplitBillSelection
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
                        className={`min-w-[220px] min-h-[80px] py-3 px-6 rounded text-2xl ${
                          !hasSplitBillSelection
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
                      className={`min-w-[200px] py-3 px-6 rounded text-2xl ${
                        settlementSubtotalLeftLines.length > 0
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
