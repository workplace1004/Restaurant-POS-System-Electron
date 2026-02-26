import React, { useState, useEffect, useCallback } from 'react';
import { Dropdown } from './Dropdown';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { KeyboardWithNumpad } from './KeyboardWithNumpad';

const API = '/api';

const CONTROL_SIDEBAR_ITEMS = [
  { id: 'personalize', label: 'Personalize Cash Register', icon: 'monitor' },
  { id: 'reports', label: 'Reports', icon: 'chart' },
  { id: 'users', label: 'Users', icon: 'users' }
];

const TOP_NAV_ITEMS = [
  { id: 'categories-products', label: 'Categories and products', icon: 'box' },
  { id: 'cash-register', label: 'Cash Register Settings', icon: 'gear' },
  { id: 'external-devices', label: 'External Devices', icon: 'printer' },
  { id: 'tables', label: 'Tables', icon: 'table' }
];

const SUB_NAV_ITEMS = [
  'Price Groups',
  'Categories',
  'Products',
  'Subproducts',
  'Kitchen messages',
  'Discounts'
];

const VAT_OPTIONS = [
  { value: 'standard', label: 'Standard' },
  { value: 'take-out', label: 'Take-out' },
  { value: 'eat-in', label: 'Eat-in' }
];

function IconMonitor({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function IconChart({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function IconUsers({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function IconBox({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}

function IconGear({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function IconPrinter({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2h-2m-4-1v4m0 16v-7a2 2 0 00-2-2H9a2 2 0 00-2 2v7a2 2 0 002 2z" />
    </svg>
  );
}

function IconTable({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

function SidebarIcon({ id, className }) {
  if (id === 'monitor') return <IconMonitor className={className} />;
  if (id === 'chart') return <IconChart className={className} />;
  if (id === 'users') return <IconUsers className={className} />;
  return null;
}

function TopNavIcon({ id, className }) {
  if (id === 'box') return <IconBox className={className} />;
  if (id === 'gear') return <IconGear className={className} />;
  if (id === 'printer') return <IconPrinter className={className} />;
  if (id === 'table') return <IconTable className={className} />;
  return null;
}

export function ControlView({ currentUser, onLogout, onBack }) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [controlSidebarId, setControlSidebarId] = useState('personalize');
  const [topNavId, setTopNavId] = useState('categories-products');
  const [subNavId, setSubNavId] = useState('Price Groups');
  const [priceGroups, setPriceGroups] = useState([]);
  const [priceGroupsLoading, setPriceGroupsLoading] = useState(false);
  const [showPriceGroupModal, setShowPriceGroupModal] = useState(false);
  const [editingPriceGroupId, setEditingPriceGroupId] = useState(null);
  const [priceGroupName, setPriceGroupName] = useState('');
  const [priceGroupTax, setPriceGroupTax] = useState('standard');
  const [savingPriceGroup, setSavingPriceGroup] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryNextCourse, setCategoryNextCourse] = useState('');
  const [categoryInWebshop, setCategoryInWebshop] = useState(true);
  const [categoryDisplayOnCashRegister, setCategoryDisplayOnCashRegister] = useState(true);
  const [categoryActiveField, setCategoryActiveField] = useState('name');
  const [savingCategory, setSavingCategory] = useState(false);
  const [deleteConfirmCategoryId, setDeleteConfirmCategoryId] = useState(null);

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productActiveField, setProductActiveField] = useState('name');
  const [savingProduct, setSavingProduct] = useState(false);
  const [deleteConfirmProductId, setDeleteConfirmProductId] = useState(null);
  const [productSearch, setProductSearch] = useState('');

  const fetchPriceGroups = useCallback(async () => {
    setPriceGroupsLoading(true);
    try {
      const res = await fetch(`${API}/price-groups`);
      const data = await res.json();
      setPriceGroups(Array.isArray(data) ? data : []);
    } catch {
      setPriceGroups([]);
    } finally {
      setPriceGroupsLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      const res = await fetch(`${API}/categories`);
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (subNavId === 'Price Groups') fetchPriceGroups();
  }, [subNavId, fetchPriceGroups]);

  useEffect(() => {
    if (subNavId === 'Categories') fetchCategories();
  }, [subNavId, fetchCategories]);

  useEffect(() => {
    if (subNavId === 'Products') fetchCategories();
  }, [subNavId, fetchCategories]);

  const fetchProducts = useCallback(async (categoryId) => {
    if (!categoryId) {
      setProducts([]);
      return;
    }
    setProductsLoading(true);
    try {
      const res = await fetch(`${API}/categories/${categoryId}/products`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (subNavId === 'Products' && selectedCategoryId) fetchProducts(selectedCategoryId);
  }, [subNavId, selectedCategoryId, fetchProducts]);

  useEffect(() => {
    if (subNavId === 'Products' && categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [subNavId, categories, selectedCategoryId]);

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    onLogout?.();
  };

  const openPriceGroupModal = () => {
    setEditingPriceGroupId(null);
    setPriceGroupName('');
    setPriceGroupTax('standard');
    setShowPriceGroupModal(true);
  };

  const openEditPriceGroupModal = (pg) => {
    setEditingPriceGroupId(pg.id);
    setPriceGroupName(pg.name || '');
    setPriceGroupTax(pg.tax && VAT_OPTIONS.some((o) => o.value === pg.tax) ? pg.tax : 'standard');
    setShowPriceGroupModal(true);
  };

  const closePriceGroupModal = () => {
    setShowPriceGroupModal(false);
    setEditingPriceGroupId(null);
  };

  const handleSavePriceGroup = async () => {
    setSavingPriceGroup(true);
    const payload = { name: priceGroupName.trim() || 'New price group', tax: priceGroupTax };
    try {
      if (editingPriceGroupId) {
        const res = await fetch(`${API}/price-groups/${editingPriceGroupId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const updated = await res.json();
        if (res.ok && updated) {
          setPriceGroups((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
          closePriceGroupModal();
        } else fetchPriceGroups();
      } else {
        const res = await fetch(`${API}/price-groups`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const created = await res.json();
        if (res.ok && created) {
          setPriceGroups((prev) => [...prev, created]);
          closePriceGroupModal();
        } else fetchPriceGroups();
      }
    } catch {
      fetchPriceGroups();
    } finally {
      setSavingPriceGroup(false);
    }
  };

  const handleDeletePriceGroup = async (id) => {
    try {
      const res = await fetch(`${API}/price-groups/${id}`, { method: 'DELETE' });
      if (res.ok) setPriceGroups((prev) => prev.filter((p) => p.id !== id));
      else fetchPriceGroups();
    } catch {
      fetchPriceGroups();
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const openCategoryModal = () => {
    setEditingCategoryId(null);
    setCategoryName('');
    setCategoryNextCourse('');
    setCategoryInWebshop(true);
    setCategoryDisplayOnCashRegister(true);
    setCategoryActiveField('name');
    setShowCategoryModal(true);
  };

  const openEditCategoryModal = (cat) => {
    setEditingCategoryId(cat.id);
    setCategoryName(cat.name || '');
    setCategoryNextCourse(cat.nextCourse || '');
    setCategoryInWebshop(cat.inWebshop !== false);
    setCategoryDisplayOnCashRegister(cat.displayOnCashRegister !== false);
    setCategoryActiveField('name');
    setShowCategoryModal(true);
  };

  const closeCategoryModal = () => {
    setShowCategoryModal(false);
    setEditingCategoryId(null);
  };

  const handleSaveCategory = async () => {
    setSavingCategory(true);
    const payload = {
      name: categoryName.trim() || 'New category',
      inWebshop: categoryInWebshop,
      displayOnCashRegister: categoryDisplayOnCashRegister,
      nextCourse: categoryNextCourse.trim() || null
    };
    try {
      if (editingCategoryId) {
        const res = await fetch(`${API}/categories/${editingCategoryId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const updated = await res.json();
        if (res.ok && updated) {
          setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
          closeCategoryModal();
        } else fetchCategories();
      } else {
        const res = await fetch(`${API}/categories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const created = await res.json();
        if (res.ok && created) {
          setCategories((prev) => [...prev, created]);
          closeCategoryModal();
        } else fetchCategories();
      }
    } catch {
      fetchCategories();
    } finally {
      setSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      const res = await fetch(`${API}/categories/${id}`, { method: 'DELETE' });
      if (res.ok) setCategories((prev) => prev.filter((c) => c.id !== id));
      else fetchCategories();
    } catch {
      fetchCategories();
    } finally {
      setDeleteConfirmCategoryId(null);
    }
  };

  const handleMoveCategory = async (id, direction) => {
    const idx = categories.findIndex((c) => c.id === id);
    if (idx < 0) return;
    const nextIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (nextIdx < 0 || nextIdx >= categories.length) return;
    const curr = categories[idx];
    const other = categories[nextIdx];
    const currOrder = curr.sortOrder;
    const otherOrder = other.sortOrder;
    try {
      await fetch(`${API}/categories/${curr.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sortOrder: otherOrder })
      });
      await fetch(`${API}/categories/${other.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sortOrder: currOrder })
      });
      setCategories((prev) => {
        const list = [...prev];
        list[idx] = { ...list[idx], sortOrder: otherOrder };
        list[nextIdx] = { ...list[nextIdx], sortOrder: currOrder };
        return list.sort((a, b) => a.sortOrder - b.sortOrder);
      });
    } catch {
      fetchCategories();
    }
  };

  const openProductModal = () => {
    setEditingProductId(null);
    setProductName('');
    setProductPrice('');
    setProductActiveField('name');
    setShowProductModal(true);
  };

  const openEditProductModal = (product) => {
    setEditingProductId(product.id);
    setProductName(product.name || '');
    setProductPrice(String(product.price ?? ''));
    setProductActiveField('name');
    setShowProductModal(true);
  };

  const closeProductModal = () => {
    setShowProductModal(false);
    setEditingProductId(null);
  };

  const handleSaveProduct = async () => {
    if (!selectedCategoryId) return;
    setSavingProduct(true);
    const name = productName.trim() || 'New product';
    const price = parseFloat(productPrice) || 0;
    try {
      if (editingProductId) {
        const res = await fetch(`${API}/products/${editingProductId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, price })
        });
        const updated = await res.json();
        if (res.ok && updated) {
          setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
          closeProductModal();
        } else fetchProducts(selectedCategoryId);
      } else {
        const res = await fetch(`${API}/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, price, categoryId: selectedCategoryId })
        });
        const created = await res.json();
        if (res.ok && created) {
          setProducts((prev) => [...prev, created].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)));
          closeProductModal();
        } else fetchProducts(selectedCategoryId);
      }
    } catch {
      fetchProducts(selectedCategoryId);
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      const res = await fetch(`${API}/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        if (selectedProductId === id) setSelectedProductId(null);
      } else fetchProducts(selectedCategoryId);
    } catch {
      fetchProducts(selectedCategoryId);
    } finally {
      setDeleteConfirmProductId(null);
    }
  };

  const handleMoveProduct = async (direction) => {
    if (!selectedProductId) return;
    const idx = products.findIndex((p) => p.id === selectedProductId);
    if (idx < 0) return;
    const nextIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (nextIdx < 0 || nextIdx >= products.length) return;
    const curr = products[idx];
    const other = products[nextIdx];
    const currOrder = curr.sortOrder ?? idx;
    const otherOrder = other.sortOrder ?? nextIdx;
    try {
      await fetch(`${API}/products/${curr.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sortOrder: otherOrder })
      });
      await fetch(`${API}/products/${other.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sortOrder: currOrder })
      });
      setProducts((prev) => {
        const list = [...prev];
        list[idx] = { ...list[idx], sortOrder: otherOrder };
        list[nextIdx] = { ...list[nextIdx], sortOrder: currOrder };
        return list.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      });
    } catch {
      fetchProducts(selectedCategoryId);
    }
  };

  const filteredProducts = productSearch.trim()
    ? products.filter((p) => (p.name || '').toLowerCase().includes(productSearch.trim().toLowerCase()))
    : products;

  return (
    <div className="flex h-full bg-pos-bg text-pos-text">
      {/* Control left sidebar */}
      <aside className="w-[330px] shrink-0 flex flex-col bg-pos-panel border-r border-pos-border">
        <nav className="flex flex-col gap-0.5 flex-1 p-3">
          {CONTROL_SIDEBAR_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`flex items-center gap-3 px-5 py-5 rounded-lg text-left text-3xl transition-colors ${controlSidebarId === item.id
                ? 'bg-pos-bg text-pos-text font-medium'
                : 'text-pos-muted hover:bg-pos-bg/50 hover:text-pos-text'
                }`}
              onClick={() => setControlSidebarId(item.id)}
            >
              <SidebarIcon id={item.icon} className="w-8 h-8 shrink-0" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 w-full flex flex-col items-center space-y-5">
          {currentUser && (
            <p className="text-pos-text text-3xl font-medium truncate px-1">{currentUser.label}</p>
          )}
          <div className="flex flex-col gap-1">
            <button
              type="button"
              className="text-left px-3 py-2 rounded-lg text-pos-muted hover:text-pos-text hover:bg-pos-bg/50 text-3xl"
              onClick={() => setShowLogoutModal(true)}
            >
              Log out
            </button>
          </div>
          <div className="px-16 mt-10 py-3 flex justify-center border-t border-gray-500">
            <button
              type="button"
              className="text-left px-3 py-2 rounded-lg text-pos-muted hover:text-pos-text hover:bg-pos-bg/50 text-3xl"
              onClick={onBack}
            >
              Back
            </button>

          </div>
          <div className="flex flex-wrap gap-2 text-xl font-semibold text-white">
            <button type="button" className="px-3.5 py-2.5 rounded-md bg-pos-bg hover:text-pos-text border border-pos-border">
              Info
            </button>
            <button type="button" className="px-3.5 py-2.5 rounded-md bg-pos-bg hover:text-pos-text border border-pos-border">
              Changelog
            </button>
            <button type="button" className="px-3.5 py-2.5 rounded-md bg-pos-bg hover:text-pos-text border border-pos-border">
              Backup
            </button>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Top navigation */}
        <div className="flex items-center gap-1 p-4 px-10 justify-around w-full bg-pos-bg/50">
          {TOP_NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`flex items-center gap-2 px-5 py-3 rounded-lg text-3xl transition-colors ${topNavId === item.id
                ? 'bg-pos-panel text-pos-text font-medium border border-pos-border'
                : 'text-pos-muted hover:text-pos-text hover:bg-pos-panel/50 border border-transparent'
                }`}
              onClick={() => setTopNavId(item.id)}
            >
              <TopNavIcon id={item.icon} className="w-8 h-8 shrink-0" />
              {item.label}
            </button>
          ))}
        </div>

        {/* Sub-navigation */}
        <div className="flex items-center w-full justify-around gap-1 px-4 py-3 bg-pos-bg">
          {SUB_NAV_ITEMS.map((label) => (
            <button
              key={label}
              type="button"
              className={`px-4 py-2 rounded-lg text-2xl transition-colors ${subNavId === label
                ? 'bg-pos-panel text-pos-text font-medium'
                : 'text-pos-muted hover:text-pos-text hover:bg-pos-panel/50'
                }`}
              onClick={() => setSubNavId(label)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Content area */}
        <main className="flex-1 overflow-auto p-6">
          {subNavId === 'Price Groups' ? (
            <div className="rounded-xl border border-pos-border bg-pos-panel/30 p-8 min-h-[300px]">
              <div className="flex items-center w-full  justify-center mb-6">
                <button
                  type="button"
                  className="px-6 py-3 rounded-lg text-xl font-medium bg-pos-panel border border-pos-border text-pos-text hover:bg-pos-bg hover:border-white/30 transition-colors disabled:opacity-50"
                  disabled={priceGroupsLoading}
                  onClick={openPriceGroupModal}
                >
                  New price group
                </button>
              </div>
              <ul className="w-full flex justify-center items-center flex flex-col h-full">
                {priceGroupsLoading ? (
                  <li className="text-pos-muted text-lg py-4">Loading price groups…</li>
                ) : priceGroups.length === 0 ? (
                  <li className="text-pos-muted text-3xl py-4">No price groups yet.</li>
                ) : (
                  priceGroups.map((pg) => (
                    <li
                      key={pg.id}
                      className="flex items-center w-full justify-between px-4 py-3 bg-pos-bg border-y border-pos-panel text-pos-text text-lg"
                    >
                      <span className="font-medium">{pg.name}</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="p-2 rounded text-pos-text mr-20 hover:bg-pos-panel"
                          onClick={() => openEditPriceGroupModal(pg)}
                          aria-label="Edit"
                        >
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button
                          type="button"
                          className="p-2 rounded text-pos-text hover:bg-pos-panel"
                          onClick={() => setDeleteConfirmId(pg.id)}
                          aria-label="Delete"
                        >
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          ) : subNavId === 'Categories' ? (
            <div className="rounded-xl border border-pos-border bg-pos-panel/30 p-8 min-h-[300px]">
              <div className="flex items-center w-full justify-center mb-6">
                <button
                  type="button"
                  className="px-6 py-3 rounded-lg text-xl font-medium bg-pos-panel border border-pos-border text-pos-text hover:bg-pos-bg hover:border-white/30 transition-colors disabled:opacity-50"
                  disabled={categoriesLoading}
                  onClick={openCategoryModal}
                >
                  Add category
                </button>
              </div>
              <ul className="w-full flex flex-col justify-center items-center h-full">
                {categoriesLoading ? (
                  <li className="text-pos-muted text-lg py-4">Loading categories…</li>
                ) : categories.length === 0 ? (
                  <li className="text-pos-muted text-3xl py-4">No categories yet.</li>
                ) : (
                  categories.map((cat, index) => (
                    <li
                      key={cat.id}
                      className="flex items-center w-full justify-between px-4 py-3 bg-pos-bg border-b border-pos-border text-pos-text text-lg"
                    >
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          className="p-2 rounded text-pos-text hover:bg-pos-panel disabled:opacity-30 disabled:cursor-not-allowed"
                          onClick={() => handleMoveCategory(cat.id, 'down')}
                          disabled={index >= categories.length - 1}
                          aria-label="Move down"
                        >
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                        </button>
                        <button
                          type="button"
                          className="p-2 ml-10 rounded text-pos-text hover:bg-pos-panel disabled:opacity-30 disabled:cursor-not-allowed"
                          onClick={() => handleMoveCategory(cat.id, 'up')}
                          disabled={index <= 0}
                          aria-label="Move up"
                        >
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v14" /></svg>
                        </button>
                      </div>
                      <span className="flex-1 text-center font-medium">{cat.name}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          className="p-2 mr-20 rounded text-pos-text hover:bg-pos-panel"
                          onClick={() => openEditCategoryModal(cat)}
                          aria-label="Edit"
                        >
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button
                          type="button"
                          className="p-2 rounded text-pos-text hover:bg-pos-panel"
                          onClick={() => setDeleteConfirmCategoryId(cat.id)}
                          aria-label="Delete"
                        >
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          ) : subNavId === 'Products' ? (
            <div className="rounded-xl border border-pos-border bg-pos-panel/30 p-8 min-h-[300px] flex flex-col">
              {/* Header: New Product, Positioning, Search */}
              <div className="flex items-center gap-4 mb-4 flex-wrap">
                <button
                  type="button"
                  className="px-6 py-3 rounded-lg text-xl font-medium bg-pos-panel border border-pos-border text-pos-text hover:bg-pos-bg hover:border-white/30 transition-colors disabled:opacity-50"
                  disabled={!selectedCategoryId || productsLoading}
                  onClick={openProductModal}
                >
                  New Product
                </button>
                <span className="text-pos-muted text-xl">Positioning</span>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="px-4 py-2 rounded-lg bg-pos-bg border border-pos-border text-pos-text text-xl min-w-[200px]"
                />
              </div>
              {/* Category tabs (horizontal, scrollable) */}
              {categories.length > 0 && (
                <div className="flex items-center gap-2 mb-4 overflow-hidden">
                  <button
                    type="button"
                    className="p-2 rounded text-pos-text hover:bg-pos-bg shrink-0"
                    onClick={() => {
                      const el = document.getElementById('products-category-scroll');
                      if (el) el.scrollBy({ left: -200, behavior: 'smooth' });
                    }}
                    aria-label="Scroll left"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <div id="products-category-scroll" className="flex gap-2 overflow-x-auto flex-1 min-w-0 py-1 scrollbar-thin">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        className={`px-5 py-2.5 rounded-lg text-xl font-medium whitespace-nowrap shrink-0 transition-colors ${selectedCategoryId === cat.id
                          ? 'bg-pos-bg text-pos-text border border-pos-border'
                          : 'text-pos-muted hover:text-pos-text bg-pos-panel/50 border border-transparent'
                          }`}
                        onClick={() => { setSelectedCategoryId(cat.id); setSelectedProductId(null); }}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="p-2 rounded text-pos-text hover:bg-pos-bg shrink-0"
                    onClick={() => {
                      const el = document.getElementById('products-category-scroll');
                      if (el) el.scrollBy({ left: 200, behavior: 'smooth' });
                    }}
                    aria-label="Scroll right"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              )}
              {/* Product list */}
              <div className="flex-1 overflow-auto border border-pos-border rounded-lg bg-pos-bg">
                {!selectedCategoryId ? (
                  <p className="text-pos-muted text-xl p-6 text-center">Select a category or add one in Categories.</p>
                ) : productsLoading ? (
                  <p className="text-pos-muted text-lg p-6">Loading products…</p>
                ) : filteredProducts.length === 0 ? (
                  <p className="text-pos-muted text-xl p-6 text-center">No products in this category yet.</p>
                ) : (
                  <ul className="w-full">
                    {filteredProducts.map((product) => (
                      <li
                        key={product.id}
                        className={`flex items-center w-full px-4 py-3 border-b border-pos-border text-pos-text text-lg last:border-b-0 ${selectedProductId === product.id ? 'bg-pos-panel/70' : ''}`}
                      >
                        <button
                          type="button"
                          className="flex-1 text-left font-medium hover:underline"
                          onClick={() => setSelectedProductId(product.id)}
                        >
                          {product.name}
                        </button>
                        <button
                          type="button"
                          className="px-4 py-2 text-pos-muted hover:text-pos-text text-lg"
                          onClick={() => {}}
                        >
                          Subproducts
                        </button>
                        <button
                          type="button"
                          className="p-2 rounded text-pos-text hover:bg-pos-panel"
                          onClick={() => openEditProductModal(product)}
                          aria-label="Edit"
                        >
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button
                          type="button"
                          className="p-2 rounded text-pos-text hover:bg-pos-panel"
                          onClick={() => setDeleteConfirmProductId(product.id)}
                          aria-label="Delete"
                        >
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {/* Bottom: Arrow up and Arrow down */}
              <div className="flex justify-center gap-4 mt-4 pt-4 border-t border-pos-border">
                <button
                  type="button"
                  className="p-4 rounded-lg bg-pos-panel border border-pos-border text-pos-text hover:bg-pos-bg disabled:opacity-40 disabled:cursor-not-allowed"
                  onClick={() => handleMoveProduct('up')}
                  disabled={!selectedProductId || (products.findIndex((p) => p.id === selectedProductId) <= 0)}
                  aria-label="Move up"
                >
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v14" /></svg>
                </button>
                <button
                  type="button"
                  className="p-4 rounded-lg bg-pos-panel border border-pos-border text-pos-text hover:bg-pos-bg disabled:opacity-40 disabled:cursor-not-allowed"
                  onClick={() => handleMoveProduct('down')}
                  disabled={!selectedProductId || (products.findIndex((p) => p.id === selectedProductId) < 0) || (products.findIndex((p) => p.id === selectedProductId) >= products.length - 1)}
                  aria-label="Move down"
                >
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-pos-border bg-pos-panel/30 p-8 min-h-[300px] flex items-center justify-center">
              <p className="text-pos-muted text-xl">
                Select a section above to manage {subNavId.toLowerCase()}.
              </p>
            </div>
          )}
        </main>
      </div>

      <DeleteConfirmModal
        open={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => handleDeletePriceGroup(deleteConfirmId)}
        message="Are you sure you want to delete this price group?"
      />
      <DeleteConfirmModal
        open={deleteConfirmCategoryId !== null}
        onClose={() => setDeleteConfirmCategoryId(null)}
        onConfirm={() => handleDeleteCategory(deleteConfirmCategoryId)}
        message="Are you sure you want to delete this category?"
      />
      <DeleteConfirmModal
        open={deleteConfirmProductId !== null}
        onClose={() => setDeleteConfirmProductId(null)}
        onConfirm={() => handleDeleteProduct(deleteConfirmProductId)}
        message="Are you sure you want to delete this product?"
      />

      {/* New price group modal */}
      {showPriceGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={closePriceGroupModal}>
          <div className="bg-pos-bg rounded-xl shadow-2xl max-w-[1450px] w-full justify-center items-center mx-4 overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 flex flex-col space-y-6 w-full justify-center items-center">
              <div className='w-full flex flex-col h-[400px] justify-center items-center gap-10'>
                <div className="flex gap-2 w-full items-center justify-center h-[100px]">
                  <label className="block text-3xl pr-[50px] font-medium text-gray-200 mb-2">Name : </label>
                  <input
                    type="text"
                    readOnly
                    value={priceGroupName}
                    placeholder="Enter name"
                    className="px-4 w-[300px] bg-pos-panel h-[60px] py-3 text-2xl border border-gray-300 rounded-lg text-gray-200"
                  />
                </div>
                <div className="flex gap-2 w-full items-center justify-center h-[100px]">
                  <label className="block text-3xl pr-[80px] font-medium text-gray-200 mb-2">VAT : </label>
                  <Dropdown
                    options={VAT_OPTIONS}
                    value={priceGroupTax}
                    onChange={setPriceGroupTax}
                    placeholder="Select VAT"
                    className="text-2xl min-w-[300px]"
                  />
                </div>
              </div>
              <div className="flex justify-center">
                <button
                  type="button"
                  className="flex items-center text-4xl gap-4 px-6 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50"
                  disabled={savingPriceGroup}
                  onClick={handleSavePriceGroup}
                >
                  <svg fill="#ffffff" width="30px" height="30px" viewBox="0 0 16 16" id="save-16px" xmlns="http://www.w3.org/2000/svg">
                    <path id="Path_42" data-name="Path 42" d="M-5.732,2.97-7.97.732a2.474,2.474,0,0,0-1.483-.7A.491.491,0,0,0-9.591,0H-18.5A2.5,2.5,0,0,0-21,2.5v11A2.5,2.5,0,0,0-18.5,16h11A2.5,2.5,0,0,0-5,13.5V4.737A2.483,2.483,0,0,0-5.732,2.97ZM-13,1V5.455h-3.591V1Zm-4.272,14V10.545h8.544V15ZM-6,13.5A1.5,1.5,0,0,1-7.5,15h-.228V10.045a.5.5,0,0,0-.5-.5h-9.544a.5.5,0,0,0-.5.5V15H-18.5A1.5,1.5,0,0,1-20,13.5V2.5A1.5,1.5,0,0,1-18.5,1h.909V5.955a.5.5,0,0,0,.5.5h7.5a.5.5,0,0,0,.5-.5v-4.8a1.492,1.492,0,0,1,.414.285l2.238,2.238A1.511,1.511,0,0,1-6,4.737Z" transform="translate(21)" />
                  </svg>
                  Save
                </button>
              </div>
            </div>
            <KeyboardWithNumpad value={priceGroupName} onChange={setPriceGroupName} />
          </div>
        </div>
      )}

      {/* Add / Edit category modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={closeCategoryModal}>
          <div className="bg-pos-bg rounded-xl shadow-2xl max-w-[1380px] h-[980px] w-full justify-center items-center mx-4 overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 flex flex-col space-y-6 w-full justify-center items-center overflow-auto">
              <div className="w-full flex flex-col justify-center items-center gap-6 max-w-2xl">
                <div className="flex gap-2 w-full items-center mt-8">
                  <label className="block text-3xl w-[200px] font-medium text-gray-200 shrink-0">Name :</label>
                  <input
                    type="text"
                    readOnly
                    value={categoryName}
                    className="flex-1 px-4 bg-pos-panel h-[60px] py-3 text-2xl border border-gray-300 rounded-lg text-gray-200"
                    onFocus={() => setCategoryActiveField('name')}
                    onClick={() => setCategoryActiveField('name')}
                  />
                </div>
                <div className="flex gap-2 w-full items-center">
                  <label className="block text-3xl w-[200px] font-medium text-gray-200 shrink-0">In webshop :</label>
                  <input
                    type="checkbox"
                    checked={categoryInWebshop}
                    onChange={(e) => setCategoryInWebshop(e.target.checked)}
                    className="w-8 h-8 rounded border-gray-300"
                  />
                </div>
                <div className="flex gap-2 w-full items-center">
                  <label className="block text-3xl w-[200px] font-medium text-gray-200 shrink-0">Display on this cash register :</label>
                  <input
                    type="checkbox"
                    checked={categoryDisplayOnCashRegister}
                    onChange={(e) => setCategoryDisplayOnCashRegister(e.target.checked)}
                    className="w-8 h-8 rounded border-gray-300"
                  />
                </div>
                <div className="flex gap-2 w-full items-center">
                  <label className="block text-3xl w-[200px] font-medium text-gray-200 shrink-0">Next course :</label>
                  <input
                    type="text"
                    readOnly
                    value={categoryNextCourse}
                    className="flex-1 px-4 bg-pos-panel h-[60px] py-3 text-2xl border border-gray-300 rounded-lg text-gray-200"
                    onFocus={() => setCategoryActiveField('nextCourse')}
                    onClick={() => setCategoryActiveField('nextCourse')}
                  />
                </div>
              </div>
              <div className="flex justify-center">
                <button
                  type="button"
                  className="flex items-center mt-20 text-4xl gap-4 px-6 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50"
                  disabled={savingCategory}
                  onClick={handleSaveCategory}
                >
                  <svg fill="#ffffff" width="30px" height="30px" viewBox="0 0 16 16" id="save-16px" xmlns="http://www.w3.org/2000/svg">
                    <path id="Path_42" data-name="Path 42" d="M-5.732,2.97-7.97.732a2.474,2.474,0,0,0-1.483-.7A.491.491,0,0,0-9.591,0H-18.5A2.5,2.5,0,0,0-21,2.5v11A2.5,2.5,0,0,0-18.5,16h11A2.5,2.5,0,0,0-5,13.5V4.737A2.483,2.483,0,0,0-5.732,2.97ZM-13,1V5.455h-3.591V1Zm-4.272,14V10.545h8.544V15ZM-6,13.5A1.5,1.5,0,0,1-7.5,15h-.228V10.045a.5.5,0,0,0-.5-.5h-9.544a.5.5,0,0,0-.5.5V15H-18.5A1.5,1.5,0,0,1-20,13.5V2.5A1.5,1.5,0,0,1-18.5,1h.909V5.955a.5.5,0,0,0,.5.5h7.5a.5.5,0,0,0,.5-.5v-4.8a1.492,1.492,0,0,1,.414.285l2.238,2.238A1.511,1.511,0,0,1-6,4.737Z" transform="translate(21)" />
                  </svg>
                  Save
                </button>
              </div>
            </div>
            <KeyboardWithNumpad
              value={categoryActiveField === 'name' ? categoryName : categoryNextCourse}
              onChange={categoryActiveField === 'name' ? setCategoryName : setCategoryNextCourse}
            />
          </div>
        </div>
      )}

      {/* New / Edit product modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={closeProductModal}>
          <div className="bg-pos-bg rounded-xl shadow-2xl max-w-[900px] w-full mx-4 overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="w-full flex items-center justify-between px-6 py-4 bg-pos-panel border-b border-pos-border shrink-0">
              <span className="text-2xl font-medium text-pos-text">{editingProductId ? 'Edit product' : 'New Product'}</span>
              <button type="button" className="p-2 rounded text-pos-text hover:bg-pos-bg" onClick={closeProductModal} aria-label="Close">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 flex flex-col gap-6 w-full">
              <div className="flex gap-2 w-full items-center">
                <label className="block text-2xl w-[120px] font-medium text-gray-200 shrink-0">Name :</label>
                <input
                  type="text"
                  readOnly
                  value={productName}
                  placeholder="Enter name"
                  className="flex-1 px-4 bg-pos-panel h-[56px] py-3 text-xl border border-gray-300 rounded-lg text-gray-200"
                  onFocus={() => setProductActiveField('name')}
                  onClick={() => setProductActiveField('name')}
                />
              </div>
              <div className="flex gap-2 w-full items-center">
                <label className="block text-2xl w-[120px] font-medium text-gray-200 shrink-0">Price :</label>
                <input
                  type="text"
                  readOnly
                  value={productPrice}
                  placeholder="0.00"
                  className="flex-1 px-4 bg-pos-panel h-[56px] py-3 text-xl border border-gray-300 rounded-lg text-gray-200 max-w-[200px]"
                  onFocus={() => setProductActiveField('price')}
                  onClick={() => setProductActiveField('price')}
                />
              </div>
              <div className="flex justify-center">
                <button
                  type="button"
                  className="flex items-center text-3xl gap-3 px-6 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50"
                  disabled={savingProduct}
                  onClick={handleSaveProduct}
                >
                  <svg fill="#ffffff" width="24" height="24" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M-5.732,2.97-7.97.732a2.474,2.474,0,0,0-1.483-.7A.491.491,0,0,0-9.591,0H-18.5A2.5,2.5,0,0,0-21,2.5v11A2.5,2.5,0,0,0-18.5,16h11A2.5,2.5,0,0,0-5,13.5V4.737A2.483,2.483,0,0,0-5.732,2.97ZM-13,1V5.455h-3.591V1Zm-4.272,14V10.545h8.544V15ZM-6,13.5A1.5,1.5,0,0,1-7.5,15h-.228V10.045a.5.5,0,0,0-.5-.5h-9.544a.5.5,0,0,0-.5.5V15H-18.5A1.5,1.5,0,0,1-20,13.5V2.5A1.5,1.5,0,0,1-18.5,1h.909V5.955a.5.5,0,0,0,.5.5h7.5a.5.5,0,0,0,.5-.5v-4.8a1.492,1.492,0,0,1,.414.285l2.238,2.238A1.511,1.511,0,0,1-6,4.737Z" transform="translate(21)" /></svg>
                  Save
                </button>
              </div>
            </div>
            <KeyboardWithNumpad
              value={productActiveField === 'name' ? productName : productPrice}
              onChange={productActiveField === 'name' ? setProductName : setProductPrice}
            />
          </div>
        </div>
      )}

      {/* Logout confirmation modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowLogoutModal(false)}>
          <div className="bg-pos-panel border border-pos-border rounded-xl shadow-xl p-8 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <p className="text-pos-text text-2xl mb-8 text-center">Are you sure you want to log out?</p>
            <div className="flex gap-4 justify-center">
              <button
                type="button"
                className="px-8 py-4 rounded-lg text-xl font-medium bg-pos-bg text-pos-text hover:bg-gray-700 border border-pos-border"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-8 py-4 rounded-lg text-xl font-medium bg-red-600 text-white hover:bg-red-700"
                onClick={handleLogoutConfirm}
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
