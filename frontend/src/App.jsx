import { useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { Header } from './components/Header';
import { LeftSidebar } from './components/LeftSidebar';
import { ProductArea } from './components/ProductArea';
import { OrderPanel } from './components/OrderPanel';
import { Footer } from './components/Footer';
import { CustomersView } from './components/CustomersView';
import { TablesView } from './components/TablesView';
import { WebordersModal } from './components/WebordersModal';
import { InPlanningModal } from './components/InPlanningModal';
import { HistoryModal } from './components/HistoryModal';
import { LoginScreen } from './components/LoginScreen';
import { ControlView } from './components/ControlView';
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
  const [user, setUser] = useState(loadStoredUser);
  const [view, setView] = useState(loadStoredView);
  const [selectedTable, setSelectedTable] = useState(null);

  const setViewAndPersist = useCallback((nextView) => {
    setView(nextView);
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, nextView);
    } catch {}
  }, []);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [ordersModalTab, setOrdersModalTab] = useState('new');
  const [showInPlanningModal, setShowInPlanningModal] = useState(false);
  const [showCustomersModal, setShowCustomersModal] = useState(false);
  const [showSubtotalView, setShowSubtotalView] = useState(false);
  const [subtotalBreaks, setSubtotalBreaks] = useState([]); // after each click: item count at which we inserted a subtotal
  const [showHistoryModal, setShowHistoryModal] = useState(false);
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
    tables,
    fetchWeborders,
    loading,
    addItemToOrder,
    removeOrderItem,
    updateOrderItemQuantity,
    setOrderStatus,
    createOrder,
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
    appendSubproductNoteToItem
  } = usePos(API, socket, selectedTable?.id ?? null);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date().toLocaleTimeString('en-GB', { timeZone: UA_TIMEZONE, hour: '2-digit', minute: '2-digit', hour12: false })), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchOrders();
    fetchWebordersCount();
    fetchInPlanningCount();
    fetchTables();
    fetchSavedPositioningLayout();
    fetchSavedPositioningColors();
    fetchSavedFunctionButtonsLayout();
  }, [fetchCategories, fetchOrders, fetchWebordersCount, fetchInPlanningCount, fetchTables, fetchSavedPositioningLayout, fetchSavedPositioningColors, fetchSavedFunctionButtonsLayout]);

  useEffect(() => {
    if (selectedCategoryId) fetchProducts(selectedCategoryId);
  }, [selectedCategoryId, fetchProducts]);

  useEffect(() => {
    if (view === 'pos') {
      fetchSavedPositioningLayout();
      fetchSavedPositioningColors();
      fetchSavedFunctionButtonsLayout();
    }
  }, [view, fetchSavedPositioningLayout, fetchSavedPositioningColors, fetchSavedFunctionButtonsLayout]);

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
    (table) => {
      setSelectedTable(table);
      setViewAndPersist('pos');
    },
    [setViewAndPersist]
  );

  const handleAddProductWithSelectedTable = useCallback(
    (product) => addItemToOrder(product, 1, selectedTable?.id || null),
    [addItemToOrder, selectedTable?.id]
  );

  if (!user) {
    return (
      <LoginScreen
        time={time}
        onLogin={handleLogin}
      />
    );
  }

  if (view === 'tables') {
    return (
      <TablesView
        tables={tables}
        selectedTableId={selectedTable?.id ?? null}
        onSelectTable={handleSelectTable}
        onBack={() => setViewAndPersist('pos')}
        time={time}
      />
    );
  }

  if (view === 'control') {
    return (
      <ControlView
        currentUser={user}
        onLogout={handleLogout}
        onBack={() => setViewAndPersist('pos')}
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
        onLogout={handleLogout}
        onControlClick={() => setViewAndPersist('control')}
      />
      <div className="flex flex-col flex-1 min-h-0">
        <Header
          time={time}
          webordersCount={webordersCount}
          inPlanningCount={inPlanningCount}
          functionButtonSlots={savedFunctionButtonsLayout}
          selectedTable={selectedTable}
          onOpenTables={() => setViewAndPersist('tables')}
          onOpenWeborders={() => {
            setOrdersModalTab('new');
            setShowOrdersModal(true);
            fetchWeborders();
          }}
          onOpenInPlanning={() => {
            setShowInPlanningModal(true);
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
        onRemoveItem={removeOrderItem}
        onUpdateItemQuantity={updateOrderItemQuantity}
        onStatusChange={setOrderStatus}
        onCreateOrder={createOrder}
        onRemoveAllOrders={removeAllOrders}
        tables={tables}
        showSubtotalView={showSubtotalView}
        subtotalBreaks={subtotalBreaks}
        onPaymentCompleted={() => fetchOrderHistory()}
        selectedTable={selectedTable}
        currentUser={user}
        currentTime={time}
      />
      <WebordersModal
        open={showOrdersModal}
        onClose={() => setShowOrdersModal(false)}
        weborders={weborders}
        inPlanningOrders={(orders || []).filter((o) => o.status === 'in_planning')}
        initialTab={ordersModalTab}
        onConfirm={() => {
          fetchOrders();
          fetchWebordersCount();
          fetchInPlanningCount();
        }}
        onCancelOrder={removeOrder}
      />
      <InPlanningModal
        open={showInPlanningModal}
        onClose={() => setShowInPlanningModal(false)}
        orders={orders || []}
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
            className="h-[96vh] w-[96vw] max-w-[1410px] rounded-xl overflow-hidden border border-pos-border shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <CustomersView onBack={() => setShowCustomersModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
