import { useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { Header } from './components/Header';
import { LeftSidebar } from './components/LeftSidebar';
import { ProductArea } from './components/ProductArea';
import { OrderPanel } from './components/OrderPanel';
import { Footer } from './components/Footer';
import { CustomersView } from './components/CustomersView';
import { usePos } from './hooks/usePos';

const API = '/api';
const socket = io(window.location.origin, { path: '/socket.io' });

export default function App() {
  const [view, setView] = useState('pos');
  const [time, setTime] = useState(() => new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }));
  const {
    categories,
    products,
    selectedCategoryId,
    setSelectedCategoryId,
    currentOrder,
    orders,
    webordersCount,
    inPlanningCount,
    tables,
    loading,
    addItemToOrder,
    removeOrderItem,
    updateOrderItemQuantity,
    setOrderStatus,
    createOrder,
    removeAllOrders,
    fetchCategories,
    fetchProducts,
    fetchOrders,
    fetchWebordersCount,
    fetchInPlanningCount,
    fetchTables
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
        />
        <ProductArea
          products={products}
          selectedCategoryId={selectedCategoryId}
          categories={categories}
          onSelectCategory={setSelectedCategoryId}
          onAddProduct={addItemToOrder}
          currentOrderId={currentOrder?.id}
        />
        <Footer view={view} onViewChange={setView} />
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
      />
    </div>
  );
}
