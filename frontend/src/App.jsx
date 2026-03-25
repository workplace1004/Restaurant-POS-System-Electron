import { useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { useLanguage } from './contexts/LanguageContext';
import { Header } from './components/Header';
import { LeftSidebar } from './components/LeftSidebar';
import { ProductArea } from './components/ProductArea';
import { OrderPanel } from './components/OrderPanel';
import { Footer } from './components/Footer';
import { CustomersView } from './components/CustomersView';
import { TablesView } from './components/TablesView';
import { WebordersModal } from './components/WebordersModal';
import { InPlanningModal } from './components/InPlanningModal';
import { InWaitingModal } from './components/InWaitingModal';
import { HistoryModal } from './components/HistoryModal';
import { LoginScreen } from './components/LoginScreen';
import { ControlView } from './components/ControlView';
import { LoadingSpinner } from './components/LoadingSpinner';
import { usePos } from './hooks/usePos';

const API = '/api';
const USER_STORAGE_KEY = 'pos-user';
const VIEW_STORAGE_KEY = 'pos-view';
const VALID_VIEWS = ['pos', 'control', 'tables'];

function loadStoredUser() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    const u = JSON.parse(raw);
    return u && u.id && (u.label ?? u.name) ? u : null;
  } catch {
    return null;
  }
}

function loadStoredView() {
  try {
    const v = localStorage.getItem(VIEW_STORAGE_KEY);
    return VALID_VIEWS.includes(v) ? v : 'pos';
  } catch {
    return 'pos';
  }
}

const socket = io(window.location.origin, { path: '/socket.io' });

export default function App() {
  const { t } = useLanguage();
  const [user, setUser] = useState(loadStoredUser);
  const [view, setView] = useState(loadStoredView);
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedTableLabel, setSelectedTableLabel] = useState(null);
  const [selectedRoomName, setSelectedRoomName] = useState(null);
  const [roomCount, setRoomCount] = useState(null);
  const [isOpeningTables, setIsOpeningTables] = useState(false);

  const fetchRoomCount = useCallback(async () => {
    try {
      const res = await fetch(`${API}/rooms`);
      const data = await res.json().catch(() => []);
      setRoomCount(Array.isArray(data) ? data.length : 0);
    } catch {
      setRoomCount(null);
    }
  }, []);

  const setViewAndPersist = useCallback((nextView) => {
    setView(nextView);
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, nextView);
    } catch {}
  }, []);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [ordersModalTab, setOrdersModalTab] = useState('new');
  const [showInPlanningModal, setShowInPlanningModal] = useState(false);
  const [showInWaitingModal, setShowInWaitingModal] = useState(false);
  const [focusedOrderId, setFocusedOrderId] = useState(null);
  const [focusedOrderInitialItemCount, setFocusedOrderInitialItemCount] = useState(0);
  const [showCustomersModal, setShowCustomersModal] = useState(false);
  const [showSubtotalView, setShowSubtotalView] = useState(false);
  const [subtotalBreaks, setSubtotalBreaks] = useState([]); // after each click: item count at which we inserted a subtotal
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [quantityInput, setQuantityInput] = useState('');
  const [showInWaitingButton, setShowInWaitingButton] = useState(false);
  const UA_TIMEZONE = 'Europe/Kyiv';
const [time, setTime] = useState(() => new Date().toLocaleTimeString('en-GB', { timeZone: UA_TIMEZONE, hour: '2-digit', minute: '2-digit', hour12: false }));
  const {
    categories,
    products,
    selectedCategoryId,
    setSelectedCategoryId,
    currentOrder,
    orders,
    webordersCount,
    weborders,
    inPlanningCount,
    inWaitingCount,
    fetchInWaitingCount,
    tables,
    fetchWeborders,
    loading,
    addItemToOrder,
    removeOrderItem,
    updateOrderItemQuantity,
    setOrderStatus,
    createOrder,
    markOrderPrinted,
    removeOrder,
    removeAllOrders,
    fetchCategories,
    fetchProducts,
    fetchOrders,
    fetchWebordersCount,
    fetchInPlanningCount,
    fetchTables,
    historyOrders,
    fetchOrderHistory,
    fetchSubproductsForProduct,
    savedPositioningLayoutByCategory,
    fetchSavedPositioningLayout,
    savedPositioningColorByCategory,
    fetchSavedPositioningColors,
    savedFunctionButtonsLayout,
    fetchSavedFunctionButtonsLayout,
    tableLayouts,
    fetchTableLayouts,
    appendSubproductNoteToItem,
    setOrderTable
  } = usePos(API, socket, selectedTable?.id ?? null, focusedOrderId);

  const inPlanningCountDisplay = (orders || []).filter((o) => o?.status === 'in_planning').length;
  const inWaitingCountDisplay = (orders || []).filter((o) => o?.status === 'in_waiting').length;

  useEffect(() => {
    const t = setInterval(() => setTime(new Date().toLocaleTimeString('en-GB', { timeZone: UA_TIMEZONE, hour: '2-digit', minute: '2-digit', hour12: false })), 1000);
    return () => clearInterval(t);
  }, []);

  const refreshDeviceSettings = useCallback(() => {
    try {
      const raw = typeof localStorage !== 'undefined' && localStorage.getItem('pos_device_settings');
      const saved = raw ? JSON.parse(raw) : {};
      const allFour =
        !!saved.ordersConfirmOnHold &&
        !!saved.ordersCustomerCanBeModified &&
        !!saved.ordersBookTableToWaiting &&
        !!saved.ordersFastCustomerName;
      setShowInWaitingButton(!!allFour);
    } catch {
      setShowInWaitingButton(false);
    }
  }, []);

  useEffect(() => {
    refreshDeviceSettings();
    (async () => {
      try {
        const res = await fetch(`${API}/settings/device-settings`);
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          const saved = data?.value;
          if (saved && typeof saved === 'object' && Object.keys(saved).length > 0) {
            if (typeof localStorage !== 'undefined') localStorage.setItem('pos_device_settings', JSON.stringify(saved));
            refreshDeviceSettings();
          }
        }
      } catch (_) {}
    })();
  }, [refreshDeviceSettings]);

  useEffect(() => {
    fetchCategories();
    fetchOrders();
    fetchWebordersCount();
    fetchInPlanningCount();
    fetchInWaitingCount();
    fetchTables();
    fetchSavedPositioningLayout();
    fetchSavedPositioningColors();
    fetchSavedFunctionButtonsLayout();
    fetchRoomCount();
  }, [fetchCategories, fetchOrders, fetchWebordersCount, fetchInPlanningCount, fetchInWaitingCount, fetchTables, fetchSavedPositioningLayout, fetchSavedPositioningColors, fetchSavedFunctionButtonsLayout, fetchRoomCount]);

  useEffect(() => {
    if (selectedCategoryId) fetchProducts(selectedCategoryId);
  }, [selectedCategoryId, fetchProducts]);

  useEffect(() => {
    if (view === 'pos') {
      fetchSavedPositioningLayout();
      fetchSavedPositioningColors();
      fetchSavedFunctionButtonsLayout();
      fetchRoomCount();
      refreshDeviceSettings();
    }
  }, [view, fetchSavedPositioningLayout, fetchSavedPositioningColors, fetchSavedFunctionButtonsLayout, fetchRoomCount, refreshDeviceSettings]);

  const prevViewRef = useRef(view);
  useEffect(() => {
    if (prevViewRef.current === 'control' && view === 'pos') {
      fetchCategories();
      if (selectedCategoryId) fetchProducts(selectedCategoryId);
    }
    prevViewRef.current = view;
  }, [view, fetchCategories, fetchProducts, selectedCategoryId]);

  useEffect(() => {
    setSubtotalBreaks([]);
  }, [currentOrder?.id]);

  const itemCount = currentOrder?.items?.length ?? 0;
  const lastBreak = subtotalBreaks[subtotalBreaks.length - 1] ?? 0;
  const hasNewItemsSinceLastSubtotal = itemCount > lastBreak;
  const subtotalButtonDisabled = itemCount === 0 || !hasNewItemsSinceLastSubtotal;

  const handleSubtotalClick = () => {
    if (subtotalButtonDisabled) return;
    const n = currentOrder?.items?.length ?? 0;
    setSubtotalBreaks((prev) => [...prev, n]);
    setShowSubtotalView(true);
  };

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    setViewAndPersist('pos');
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedInUser));
    } catch {}
  };

  const handleLogout = () => {
    setUser(null);
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch {}
  };

  const handleSelectTable = useCallback(
    async (table, options) => {
      // If current order has items but no table, assign it to the selected table
      const orderWithItemsNoTable = currentOrder?.items?.length > 0 && !currentOrder?.tableId;
      if (table != null && orderWithItemsNoTable && currentOrder?.id) {
        await setOrderTable(currentOrder.id, table.id);
      }
      setFocusedOrderId(null);
      setFocusedOrderInitialItemCount(0);
      setSelectedTable(table);
      if (table == null) {
        setSelectedTableLabel(null);
        setSelectedRoomName(null);
      } else {
        setSelectedTableLabel(options?.tableLabel ?? null);
        setSelectedRoomName(options?.roomName ?? (table?.name ?? null));
      }
      setViewAndPersist('pos');
    },
    [setViewAndPersist, currentOrder, setOrderTable, setFocusedOrderId]
  );

  const handleAddProductWithSelectedTable = useCallback(
    async (product) => {
      const qty = Math.max(1, parseInt(quantityInput, 10) || 1);
      setQuantityInput('');
      return addItemToOrder(product, qty, selectedTable?.id || null);
    },
    [addItemToOrder, selectedTable?.id, quantityInput]
  );

  const handleOpenTables = useCallback(async () => {
    setViewAndPersist('tables');
    setIsOpeningTables(true);
    try {
      await Promise.all([
        fetchTables(),
        fetchTableLayouts(),
        fetchRoomCount()
      ]);
    } finally {
      setIsOpeningTables(false);
    }
  }, [setViewAndPersist, fetchTables, fetchTableLayouts, fetchRoomCount]);

  if (!user) {
    return (
      <LoginScreen
        time={time}
        onLogin={handleLogin}
      />
    );
  }

  if (view === 'tables') {
    if (isOpeningTables) {
      return (
        <div className="h-full w-full flex items-center justify-center bg-pos-bg">
          <LoadingSpinner label={t('loadingTables')} />
        </div>
      );
    }
    return (
      <TablesView
        tables={tables}
        tableLayouts={tableLayouts}
        fetchTableLayouts={fetchTableLayouts}
        selectedTableId={selectedTable?.id ?? null}
        onSelectTable={handleSelectTable}
        onBack={() => setViewAndPersist('pos')}
        time={time}
        api={API}
      />
    );
  }

  if (view === 'control') {
    return (
      <ControlView
        currentUser={user}
        onLogout={handleLogout}
        onBack={() => setViewAndPersist('pos')}
        fetchTableLayouts={fetchTableLayouts}
        fetchTables={fetchTables}
        onFunctionButtonsSaved={fetchSavedFunctionButtonsLayout}
      />
    );
  }

  return (
    <div className="flex h-full bg-pos-bg text-pos-text">
      <LeftSidebar
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
        currentUser={user}
        onControlClick={() => setViewAndPersist('control')}
        onLogout={handleLogout}
        time={time}
      />
      <div className="flex flex-col flex-1 min-h-0 w-2/4">
        <Header
          webordersCount={webordersCount}
          inPlanningCount={inPlanningCountDisplay}
          inWaitingCount={inWaitingCountDisplay}
          functionButtonSlots={savedFunctionButtonsLayout}
          selectedTable={selectedTable}
          selectedTableLabel={selectedTableLabel}
          selectedRoomName={selectedRoomName}
          roomCount={roomCount}
          onOpenTables={handleOpenTables}
          onOpenWeborders={() => {
            setOrdersModalTab('new');
            setShowOrdersModal(true);
            fetchOrders();
            fetchOrderHistory();
          }}
          onOpenInPlanning={() => {
            setShowInPlanningModal(true);
            fetchOrders();
          }}
          onOpenInWaiting={() => {
            setShowInWaitingModal(true);
            fetchOrders();
          }}
        />
        <ProductArea
          products={products}
          selectedCategoryId={selectedCategoryId}
          categories={categories}
          onSelectCategory={setSelectedCategoryId}
          onAddProduct={handleAddProductWithSelectedTable}
          currentOrderId={currentOrder?.id}
          fetchSubproductsForProduct={fetchSubproductsForProduct}
          positioningLayoutByCategory={savedPositioningLayoutByCategory}
          positioningColorByCategory={savedPositioningColorByCategory}
          appendSubproductNoteToItem={appendSubproductNoteToItem}
        />
        <Footer
          customersActive={showCustomersModal}
          onCustomersClick={() => setShowCustomersModal(true)}
          showSubtotalView={showSubtotalView}
          subtotalButtonDisabled={subtotalButtonDisabled}
          onSubtotalClick={handleSubtotalClick}
          onHistoryClick={() => setShowHistoryModal(true)}
        />
      </div>
      <OrderPanel
        order={currentOrder}
        orders={orders}
        focusedOrderId={focusedOrderId}
        focusedOrderInitialItemCount={focusedOrderInitialItemCount}
        onRemoveItem={removeOrderItem}
        onUpdateItemQuantity={updateOrderItemQuantity}
        onStatusChange={setOrderStatus}
        onCreateOrder={async (tableId) => {
          setFocusedOrderId(null);
          setFocusedOrderInitialItemCount(0);
          await createOrder(tableId);
        }}
        onRemoveAllOrders={async () => {
          await removeAllOrders();
          setFocusedOrderId(null);
          setFocusedOrderInitialItemCount(0);
        }}
        showInPlanningButton={Array.isArray(savedFunctionButtonsLayout) && savedFunctionButtonsLayout.includes('geplande-orders')}
        onSaveInWaitingAndReset={async () => {
          setFocusedOrderId(null);
          setFocusedOrderInitialItemCount(0);
          await createOrder(null);
          fetchOrders();
        }}
        tables={tables}
        showSubtotalView={showSubtotalView}
        subtotalBreaks={subtotalBreaks}
        onPaymentCompleted={() => {
          fetchOrderHistory();
          fetchTables();
        }}
        selectedTable={selectedTable}
        currentUser={user}
        currentTime={time}
        onOpenTables={handleOpenTables}
        quantityInput={quantityInput}
        setQuantityInput={setQuantityInput}
        showInWaitingButton={showInWaitingButton}
        onOpenInPlanning={() => {
          setShowInPlanningModal(true);
          fetchOrders();
        }}
        onOpenInWaiting={() => {
          setShowInWaitingModal(true);
          fetchOrders();
        }}
      />
      <WebordersModal
        open={showOrdersModal}
        onClose={() => setShowOrdersModal(false)}
        weborders={(orders || []).filter((o) => o.status === 'in_planning')}
        inPlanningOrders={historyOrders || []}
        initialTab={ordersModalTab}
        onConfirm={() => {
          fetchOrders();
          fetchOrderHistory();
          fetchWebordersCount();
          fetchInPlanningCount();
        }}
        onCancelOrder={removeOrder}
      />
      <InPlanningModal
        open={showInPlanningModal}
        onClose={() => setShowInPlanningModal(false)}
        orders={orders || []}
        onDeleteOrder={async (orderId) => {
          await removeOrder(orderId);
          fetchInPlanningCount();
        }}
        onLoadOrder={(orderId) => {
          setSelectedTable(null);
          setSelectedTableLabel(null);
          const ord = (orders || []).find((o) => o.id === orderId);
          setFocusedOrderId(orderId);
          setFocusedOrderInitialItemCount(ord?.items?.length ?? 0);
          setShowInPlanningModal(false);
        }}
        onFetchOrders={fetchOrders}
      />
      <InWaitingModal
        open={showInWaitingModal}
        onClose={() => setShowInWaitingModal(false)}
        orders={orders || []}
        currentUser={user}
        onViewOrder={(orderId) => {
          setSelectedTable(null);
          setSelectedTableLabel(null);
          const viewedOrder = (orders || []).find((o) => o.id === orderId);
          setFocusedOrderId(orderId);
          let savedCount = viewedOrder?.items?.length ?? 0;
          try {
            if (viewedOrder?.itemBatchBoundariesJson) {
              const b = JSON.parse(viewedOrder.itemBatchBoundariesJson);
              if (Array.isArray(b) && b.length > 0) savedCount = b[b.length - 1];
            }
          } catch { /* ignore */ }
          setFocusedOrderInitialItemCount(savedCount);
          setShowInWaitingModal(false);
          // Don't change status to open - order stays in_waiting, remains in In waiting list
        }}
        onPrintOrder={async (orderId) => {
          await markOrderPrinted(orderId);
          fetchOrders();
        }}
        onDeleteOrder={async (orderId) => {
          await removeOrder(orderId);
          fetchOrders();
          fetchInPlanningCount();
          fetchInWaitingCount();
        }}
      />
      <HistoryModal
        open={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        historyOrders={historyOrders || []}
        onFetchHistory={fetchOrderHistory}
      />
      {showCustomersModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="h-[96vh] w-[96vw] rounded-xl overflow-hidden border border-pos-border shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <CustomersView onBack={() => setShowCustomersModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
