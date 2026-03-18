import React, { useRef, useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const SortIcon = () => (
  <span className="inline-block ml-1 text-gray-500 font-normal align-middle" aria-hidden>v</span>
);

export function WebordersModal({
  open,
  onClose,
  weborders = [],
  inPlanningOrders = [],
  initialTab = 'new',
  onConfirm,
  onCancelOrder,
  loading = false
}) {
  const { t } = useLanguage();
  const listRef = useRef(null);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  useEffect(() => {
    if (open) {
      setActiveTab(initialTab);
      setSelectedOrderId(null);
    }
  }, [open, initialTab]);

  if (!open) return null;

  const formatTime = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
      return '–';
    }
  };

  const formatAmount = (total) => {
    if (total == null) return '€0.00';
    return `€${Number(total).toFixed(2)}`;
  };

  const customerName = (order) => {
    const c = order?.customer;
    if (!c) return '–';
    return c.companyName || c.name || '–';
  };

  const orderNumber = (id) => (id ? id.slice(-8) : '–');
  const deliveryCollection = () => t('webordersCollection');

  const list = activeTab === 'new' ? weborders : inPlanningOrders;
  const isEmpty = !Array.isArray(list) || list.length === 0;

  const scroll = (dir) => {
    if (!listRef.current) return;
    listRef.current.scrollTop += dir * 80;
  };

  const handleCancelOrder = () => {
    if (selectedOrderId && onCancelOrder) {
      onCancelOrder(selectedOrderId);
      setSelectedOrderId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className="bg-pos-panel rounded-lg shadow-xl flex flex-col w-full max-w-[1600px] p-5 px-20 h-[800px] max-h-[85vh] text-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tabs */}
        <div className="flex px-4 pt-4 w-full justify-between px-[300px]">
          <button
            type="button"
            className={`pb-3 px-4 text-3xl font-medium -mb-px ${activeTab === 'new'
              ? 'text-green-400'
              : 'text-white'
              }`}
            onClick={() => setActiveTab('new')}
          >
            {t('webordersNewOrders')}
          </button>
          <button
            type="button"
            className={`pb-3 px-4 text-3xl font-medium-mb-px ${activeTab === 'onHold'
              ? 'text-green-400'
              : 'text-white'
              }`}
            onClick={() => setActiveTab('onHold')}
          >
            {t('webordersOnHold')}
          </button>
        </div>

        {/* Table headers: New orders = Time, Customer, Amount only; On hold = full columns */}
        {activeTab === 'new' ? (
          <div className="flex gap-8 px-4 py-2 text-2xl font-medium text-white px-[200px] w-full justify-between">
            <span>{t('webordersTime')}:</span>
            <span>{t('webordersCustomer')}:</span>
            <span>{t('webordersAmount')}:</span>
          </div>
        ) : (
          <div className="flex gap-2 px-20 py-2 text-2xl font-medium text-white w-full justify-between">
            <span>{t('webordersOrderNumber')}</span>
            <span>{t('webordersDeliveryCollection')}</span>
            <span>{t('webordersDeliveryCollectionTime')}</span>
            <span>{t('webordersCustomer')}</span>
            <span>{t('webordersAmount')}</span>
          </div>
        )}

        {/* List area */}
        <div
          ref={listRef}
          className="flex-1 min-h-[200px] max-h-[40vh] overflow-auto border border-gray-300 m-4 rounded bg-gray-300"
        >
          {!isEmpty ? (
            <table className="text-left">
              <tbody>
                {list.map((order) => (
                  <tr
                    key={order.id}
                    className={`border-b text-3xl w-full border-gray-200 cursor-pointer ${selectedOrderId === order.id ? 'bg-gray-500' : 'hover:bg-gray-100'
                      }`}
                    onClick={() => setSelectedOrderId(order.id)}
                  >
                    {activeTab === 'new' ? (
                      <>
                        <td className="p-4 whitespace-nowrap">
                          <div className="flex items-center justify-center">
                            {formatTime(order.createdAt)}
                          </div>
                        </td>
                        <td className="p-4">{customerName(order)}</td>
                        <td className="p-4 whitespace-nowrap">
                          <div className="flex items-center justify-center">
                            {formatAmount(order.total)}
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-4 whitespace-nowrap" style={{ minWidth: '280px' }}>
                          <div className="flex items-center justify-center">
                            {orderNumber(order.id)}
                          </div>
                        </td>
                        <td className="p-4" style={{ minWidth: '330px' }}>
                          <div className="flex items-center justify-center">
                            {deliveryCollection()}
                          </div>
                        </td>
                        <td className="p-4 whitespace-nowrap" style={{ minWidth: '370px' }}>
                          <div className="flex items-center justify-center">
                            {formatTime(order.createdAt)}
                          </div>
                        </td>
                        <td className="p-4" style={{ minWidth: '230px' }}>
                          <div className="flex items-center justify-center">
                            {customerName(order)}
                          </div>
                        </td>
                        <td className="p-4 whitespace-nowrap" style={{ minWidth: '210px' }}>
                          <div className="flex items-center justify-center">
                            {formatAmount(order.total)}
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 flex flex-col items-center justify-center gap-4 h-full text-3xl text-gray-500">
              <svg
                className="w-24 h-24 text-gray-400 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18" className="opacity-60" />
              </svg>
              <span className="text-3xl text-center">
                {activeTab === 'new' ? t('webordersNoNewOrders') : t('webordersNoOrdersOnHold')}
              </span>
            </div>
          )}
        </div>

        {/* Scroll arrows */}
        <div className="flex items-center justify-around gap-4 py-2 w-full">
          <button
            type="button"
            className="group p-2 rounded transition-colors hover:bg-white/10 rounded-full"
            onClick={() => scroll(-1)}
            aria-label={t('scrollUp')}
          >
            <svg width="40" height="40" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" className="text-white group-hover:text-amber-300 transition-colors">
              <path d="M11 17V5.414l3.293 3.293a.999.999 0 101.414-1.414l-5-5a.999.999 0 00-1.414 0l-5 5a.997.997 0 000 1.414.999.999 0 001.414 0L9 5.414V17a1 1 0 102 0z" fill="currentColor" />
            </svg>
          </button>
          <button
            type="button"
            className="group p-2 rounded transition-colors hover:bg-white/10 rounded-full"
            onClick={() => scroll(1)}
            aria-label={t('scrollDown')}
          >
            <svg width="40" height="40" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" className="text-white group-hover:text-amber-300 transition-colors">
              <path d="M10.707 17.707l5-5a.999.999 0 10-1.414-1.414L11 14.586V3a1 1 0 10-2 0v11.586l-3.293-3.293a.999.999 0 10-1.414 1.414l5 5a.999.999 0 001.414 0z" fill="currentColor" />
            </svg>
          </button>
        </div>

        {/* Buttons: New orders = Close + Confirm only; On hold = Close + Cancel order + Confirm */}
        <div className="flex gap-3 justify-around p-4">
          <button
            type="button"
            className="h-[80px] w-[240px] py-3 px-4 rounded bg-gray-300 text-gray-700 text-3xl font-medium hover:bg-gray-500"
            onClick={onClose}
          >
            {t('webordersClose')}
          </button>
          {activeTab === 'onHold' && (
            <button
              type="button"
              className="h-[80px] w-[240px] py-3 px-4 rounded bg-gray-300 text-gray-700 text-3xl font-medium hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleCancelOrder}
              disabled={!selectedOrderId}
            >
              {t('webordersCancelOrder')}
            </button>
          )}
          <button
            type="button"
            className="h-[80px] w-[240px] py-3 px-4 rounded bg-gray-300 text-gray-700 text-3xl font-medium hover:bg-gray-300 disabled:opacity-70"
            onClick={() => { onConfirm?.(); onClose?.(); }}
            disabled={loading}
          >
            {loading ? t('webordersLoading') : t('webordersConfirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
