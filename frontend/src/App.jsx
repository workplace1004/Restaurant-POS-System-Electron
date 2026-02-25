import { useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { Header } from './components/Header';
import { LeftSidebar } from './components/LeftSidebar';
import { ProductArea } from './components/ProductArea';
import { OrderPanel } from './components/OrderPanel';
import { Footer } from './components/Footer';
import { CustomersView } from './components/CustomersView';
import { WebordersModal } from './components/WebordersModal';
import { InPlanningModal } from './components/InPlanningModal';
import { HistoryModal } from './components/HistoryModal';
import { usePos } from './hooks/usePos';

const API = '/api';
const socket = io(window.location.origin, { path: '/socket.io' });

export default function App() {
  const [view, setView] = useState('pos');
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [ordersModalTab, setOrdersModalTab] = useState('new');
  const [showInPlanningModal, setShowInPlanningModal] = useState(false);
  const [showSubtotalView, setShowSubtotalView] = useState(false);
  const [subtotalBreaks, setSubtotalBreaks] = useState([]); // after each click: item count at which we inserted a subtotal
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [time, setTime] = useState(() => new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }));
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
    fetchOrderHistory
  } = usePos(API, socket);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchOrders();
    fetchWebordersCount();
    fetchInPlanningCount();
    fetchTables();
  }, [fetchCategories, fetchOrders, fetchWebordersCount, fetchInPlanningCount, fetchTables]);

  useEffect(() => {
    if (selectedCategoryId) fetchProducts(selectedCategoryId);
  }, [selectedCategoryId, fetchProducts]);

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

  if (view === 'customers') {
    return (
      <CustomersView
        time={time}
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
        webordersCount={webordersCount}
        inPlanningCount={inPlanningCount}
        onBack={() => setView('pos')}
      />
    );
  }

  return (
    <div className="flex h-full bg-pos-bg text-pos-text">
      <LeftSidebar
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
      />
      <div className="flex flex-col flex-1 min-h-0">
        <Header
          time={time}
          webordersCount={webordersCount}
          inPlanningCount={inPlanningCount}
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
          onAddProduct={addItemToOrder}
          currentOrderId={currentOrder?.id}
        />
        <Footer
          view={view}
          onViewChange={setView}
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
    </div>
  );
}
