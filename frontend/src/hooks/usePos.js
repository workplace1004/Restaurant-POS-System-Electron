import { useState, useCallback, useEffect } from 'react';

export function usePos(API, socket) {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [webordersCount, setWebordersCount] = useState(0);
  const [inPlanningCount, setInPlanningCount] = useState(0);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [loading, setLoading] = useState(false);

  const safeJson = (res) => res.json().catch(() => null);

  const fetchCategories = useCallback(async () => {
    const res = await fetch(`${API}/categories`);
    const data = await safeJson(res);
    if (Array.isArray(data)) {
      setCategories(data);
      if (data.length && !selectedCategoryId) setSelectedCategoryId(data[0].id);
    }
  }, [API]);

  const fetchProducts = useCallback(async (categoryId) => {
    if (!categoryId) return;
    const res = await fetch(`${API}/categories/${categoryId}/products`);
    const data = await safeJson(res);
    if (Array.isArray(data)) setProducts(data);
  }, [API]);

  const fetchOrders = useCallback(async () => {
    const res = await fetch(`${API}/orders`);
    const data = await safeJson(res);
    if (Array.isArray(data)) setOrders(data);
  }, [API]);

  const fetchWebordersCount = useCallback(async () => {
    const res = await fetch(`${API}/weborders/count`);
    const data = await safeJson(res);
    if (data && typeof data.count === 'number') setWebordersCount(data.count);
  }, [API]);

  const fetchInPlanningCount = useCallback(async () => {
    const res = await fetch(`${API}/orders/in-planning/count`);
    const data = await safeJson(res);
    if (data && typeof data.count === 'number') setInPlanningCount(data.count);
  }, [API]);

  const fetchTables = useCallback(async () => {
    const res = await fetch(`${API}/tables`);
    const data = await safeJson(res);
    if (Array.isArray(data)) setTables(data);
  }, [API]);

  useEffect(() => {
    if (!socket?.on) return;
    const handler = (order) => {
      setOrders((prev) => {
        const idx = prev.findIndex((o) => o.id === order.id);
        const next = idx >= 0 ? [...prev.slice(0, idx), order, ...prev.slice(idx + 1)] : [order, ...prev];
        return next;
      });
    };
    const clearHandler = () => setOrders([]);
    socket.on('order:updated', handler);
    socket.on('orders:cleared', clearHandler);
    return () => {
      socket.off('order:updated', handler);
      socket.off('orders:cleared', clearHandler);
    };
  }, [socket]);

  const currentOrder = orders.find((o) => o.status === 'open') || orders[0] || null;

  const addItemToOrder = useCallback(
    async (product, quantity = 1) => {
      let orderId = currentOrder?.id;
      if (!orderId) {
        const createRes = await fetch(`${API}/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: [{ productId: product.id, quantity, price: product.price }] })
        });
        const created = await safeJson(createRes);
        if (created?.id) {
          orderId = created.id;
          setOrders((prev) => [created, ...prev]);
        }
        return;
      }
      await fetch(`${API}/orders/${orderId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity, price: product.price })
      });
      const res = await fetch(`${API}/orders`);
      const list = await safeJson(res);
      if (Array.isArray(list)) setOrders(list);
    },
    [API, currentOrder?.id]
  );

  const removeOrderItem = useCallback(
    async (orderId, itemId) => {
      await fetch(`${API}/orders/${orderId}/items/${itemId}`, { method: 'DELETE' });
      const res = await fetch(`${API}/orders`);
      const list = await safeJson(res);
      if (Array.isArray(list)) setOrders(list);
    },
    [API]
  );

  const updateOrderItemQuantity = useCallback(
    async (orderId, itemId, quantity) => {
      const patchRes = await fetch(`${API}/orders/${orderId}/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity })
      });
      if (!patchRes.ok) {
        const err = await patchRes.json().catch(() => ({ error: patchRes.statusText }));
        console.error('updateOrderItemQuantity', err);
        return;
      }
      const res = await fetch(`${API}/orders`);
      if (!res.ok) return;
      const list = await res.json().catch(() => []);
      setOrders(list);
    },
    [API]
  );

  const setOrderStatus = useCallback(
    async (orderId, status) => {
      await fetch(`${API}/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (status === 'in_planning') {
        fetchInPlanningCount();
      }
      const res = await fetch(`${API}/orders`);
      const list = await safeJson(res);
      if (Array.isArray(list)) setOrders(list);
    },
    [API, fetchInPlanningCount]
  );

  const createOrder = useCallback(async () => {
    const res = await fetch(`${API}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const created = await safeJson(res);
    if (created?.id) setOrders((prev) => [created, ...prev]);
  }, [API]);

  const removeAllOrders = useCallback(async () => {
    await fetch(`${API}/orders`, { method: 'DELETE' });
    setOrders([]);
  }, [API]);

  return {
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
  };
}
