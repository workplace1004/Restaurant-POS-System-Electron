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

const VAT_PERCENT_OPTIONS = [
  { value: '', label: '--' },
  { value: '0', label: '0%' },
  { value: '6', label: '6%' },
  { value: '9', label: '9%' },
  { value: '12', label: '12%' },
  { value: '21', label: '21%' }
];

const EXTRA_PRICE_PRINTER_OPTIONS = [
  { value: 'Disabled', label: 'Disabled' }
];

const VERVALTYPE_OPTIONS = [
  { value: 'Houdbare dagen', label: 'Shelf life' },
  { value: 'Vervaldatum', label: 'Expiration date' }
];

const PURCHASE_UNIT_OPTIONS = [
  { value: 'Piece', label: 'Piece' },
  { value: 'Kg', label: 'Kg' },
  { value: 'Liter', label: 'Liter' },
  { value: 'Meter', label: 'Meter' }
];

const PURCHASE_SUPPLIER_OPTIONS = [
  { value: '', label: '--' }
];

const KIOSK_SUBS_OPTIONS = [
  { value: 'unlimited', label: 'Unlimited' },
  ...Array.from({ length: 10 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }))
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
    <svg className={className} fill="currentColor" viewBox="0 0 16 16">
      <path fillRule="evenodd" clipRule="evenodd" d="M9.02.678a2.25 2.25 0 00-2.04 0L1.682 3.374A1.25 1.25 0 001 4.488v6.717c0 .658.37 1.26.956 1.56l5.023 2.557a2.25 2.25 0 002.042 0l5.023-2.557a1.75 1.75 0 00.956-1.56V4.488c0-.47-.264-.9-.683-1.114L9.021.678zM7.66 2.015a.75.75 0 01.68 0l4.436 2.258-1.468.734-4.805-2.403 1.157-.59zM4.84 3.45l-1.617.823L8 6.661l1.631-.815-4.79-2.396zM2.5 5.588v5.617c0 .094.053.18.137.223l4.613 2.348V7.964L2.5 5.588zm10.863 5.84L8.75 13.776V7.964l4.75-2.375v5.617a.25.25 0 01-.137.223z" />
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
    <svg className={className} fill="currentColor" viewBox="0 0 70 70">
      <path d="M62.597,21.583H8.46c-3.954,0-6.877,3.133-6.877,6.979v20.137c0,3.751,2.968,6.884,6.877,6.884h4.123v4.485c0,3.828,3.521,6.515,7.349,6.515h30.137c3.828,0,6.515-2.687,6.515-6.515v-4.485h6.014c3.481,0,4.986-2.268,4.986-6.884V28.563C67.583,23.216,64.771,21.583,62.597,21.583z M52.583,60.068c0,1.619-0.896,2.515-2.515,2.515H19.932c-1.619,0-3.349-0.896-3.349-2.515V46.932c0-1.619,1.729-3.349,3.349-3.349h30.137c1.619,0,2.515,1.729,2.515,3.349V60.068z M62.597,51.583h-6.014v-4.651c0-3.828-2.687-7.349-6.515-7.349H19.932c-3.828,0-7.349,3.521-7.349,7.349v4.651H8.46c-1.7,0-2.877-1.32-2.877-2.884V28.563c0-1.228,0.968-2.979,2.877-2.979h54.137c1.294,0,0.986,1.028,0.986,2.979v20.137C63.583,49.733,64.09,51.583,62.597,51.583z" />
      <path d="M14.583,20.417c1.104,0,2-0.896,2-2V9.563c0-1.228,0.521-2.979,3.877-2.979h30.137c1.294,0,1.986,1.028,1.986,2.979v8.854c0,1.104,0.896,2,2,2s2-0.896,2-2V9.563c0-5.347-1.667-6.979-5.986-6.979H20.46c-5.543,0-7.877,2.084-7.877,6.979v8.854C12.583,19.521,13.479,20.417,14.583,20.417z" />
      <path d="M17.417,31.583c0.552,0,1-0.447,1-1s-0.448-1-1-1h-3c-0.552,0-1,0.447-1,1s0.448,1,1,1H17.417z" />
      <path d="M21.417,31.583h3c0.552,0,1-0.447,1-1s-0.448-1-1-1h-3c-0.552,0-1,0.447-1,1S20.865,31.583,21.417,31.583z" />
      <path d="M55.417,33.583h-40c-0.552,0-1,0.447-1,1s0.448,1,1,1h40c0.552,0,1-0.447,1-1S55.969,33.583,55.417,33.583z" />
      <path d="M22.417,49.583h12c0.552,0,1-0.447,1-1s-0.448-1-1-1h-12c-0.552,0-1,0.447-1,1S21.865,49.583,22.417,49.583z" />
      <path d="M47.417,47.583h-9c-0.552,0-1,0.447-1,1s0.448,1,1,1h9c0.552,0,1-0.447,1-1S47.969,47.583,47.417,47.583z" />
      <path d="M22.417,54.583h6c0.552,0,1-0.447,1-1s-0.448-1-1-1h-6c-0.552,0-1,0.447-1,1S21.865,54.583,22.417,54.583z" />
      <path d="M31.417,53.583c0,0.553,0.448,1,1,1h7c0.552,0,1-0.447,1-1s-0.448-1-1-1h-7C31.865,52.583,31.417,53.03,31.417,53.583z" />
      <path d="M32.417,57.583h-10c-0.552,0-1,0.447-1,1s0.448,1,1,1h10c0.552,0,1-0.447,1-1S32.969,57.583,32.417,57.583z" />
      <path d="M43.417,57.583h-7c-0.552,0-1,0.447-1,1s0.448,1,1,1h7c0.552,0,1-0.447,1-1S43.969,57.583,43.417,57.583z" />
      <path d="M47.417,52.583h-4c-0.552,0-1,0.447-1,1s0.448,1,1,1h4c0.552,0,1-0.447,1-1S47.969,52.583,47.417,52.583z" />
    </svg>
  );
}

function IconTable({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 491.413 491.413">
      <path d="M491.413,133.867c0-62.4-126.613-96.107-245.653-96.107S0,71.467,0,133.867c0,60.48,118.72,93.973,234.453,96v125.76c-0.213,0.747-0.533,1.387-0.853,2.133c-4.587,0.32-8.533,3.52-9.6,8.107c-1.173,4.16-2.773,8.107-4.8,11.947c-1.067,0.533-2.24,0.853-3.413,1.067c-12.373,1.6-30.08-17.707-36.693-27.307c-3.307-4.907-10.027-6.08-14.827-2.773c-4.8,3.307-6.08,10.027-2.773,14.827c2.347,3.413,20.373,29.013,42.987,35.2c-13.013,14.08-34.027,28.373-67.84,33.6c-5.867,0.853-9.813,6.293-8.96,12.16c0.747,5.227,5.333,9.067,10.56,9.067c0.533,0,1.067,0,1.6-0.107c56.853-8.64,83.733-39.68,95.787-61.227c3.627-3.093,6.827-6.613,9.387-10.667c2.56,3.947,5.76,7.573,9.387,10.667c12.16,21.547,39.04,52.587,95.893,61.227c0.533,0.107,1.067,0.107,1.6,0.107c5.867,0,10.667-4.8,10.667-10.667c0-5.333-3.84-9.813-9.067-10.56c-33.92-5.227-55.04-19.52-67.947-33.6c22.613-6.293,40.747-31.893,43.093-35.307c3.307-4.907,2.027-11.52-2.773-14.827c-4.907-3.307-11.52-2.027-14.827,2.773c-6.507,9.6-24.213,29.013-36.693,27.307c-1.173-0.107-2.453-0.533-3.52-1.067c-1.92-3.84-3.52-7.787-4.693-11.947c-1.067-4.48-5.013-7.787-9.6-8c-0.32-0.747-0.533-1.387-0.853-2.133l0.107-125.653C371.84,228.16,491.413,194.56,491.413,133.867z M248.32,208.747c-1.707-0.747-3.733-0.747-5.44,0C112.747,208,22.187,169.067,22.187,134.08c0-35.307,91.947-74.667,224-74.667s224,39.36,224,74.667C470.187,169.173,379.2,208.32,248.32,208.747z" />
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
  const [productTab, setProductTab] = useState('General');
  const [productTabsUnlocked, setProductTabsUnlocked] = useState(false);
  const [productDisplayNumber, setProductDisplayNumber] = useState(null);
  const [productName, setProductName] = useState('');
  const [productKeyName, setProductKeyName] = useState('');
  const [productProductionName, setProductProductionName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productVatTakeOut, setProductVatTakeOut] = useState('');
  const [productVatEatIn, setProductVatEatIn] = useState('');
  const [productCategoryIds, setProductCategoryIds] = useState(['']);
  const [productAddition, setProductAddition] = useState('Subproducts');
  const [productBarcode, setProductBarcode] = useState('');
  const [productPrinter1, setProductPrinter1] = useState('Disabled');
  const [productPrinter2, setProductPrinter2] = useState('Disabled');
  const [productPrinter3, setProductPrinter3] = useState('Disabled');
  const [productActiveField, setProductActiveField] = useState('name');
  const [savingProduct, setSavingProduct] = useState(false);
  const [deleteConfirmProductId, setDeleteConfirmProductId] = useState(null);
  const [productSearch, setProductSearch] = useState('');
  const [showProductSearchKeyboard, setShowProductSearchKeyboard] = useState(false);
  const [barcodeButtonSpinning, setBarcodeButtonSpinning] = useState(false);
  const [productFieldErrors, setProductFieldErrors] = useState({ name: false, keyName: false, productionName: false, vatTakeOut: false, vatEatIn: false });
  const [advancedOpenPrice, setAdvancedOpenPrice] = useState(false);
  const [advancedWeegschaal, setAdvancedWeegschaal] = useState(false);
  const [advancedSubproductRequires, setAdvancedSubproductRequires] = useState(false);
  const [advancedLeeggoedPrijs, setAdvancedLeeggoedPrijs] = useState('0.00');
  const [advancedPagerVerplicht, setAdvancedPagerVerplicht] = useState(false);
  const [advancedBoldPrint, setAdvancedBoldPrint] = useState(false);
  const [advancedGroupingReceipt, setAdvancedGroupingReceipt] = useState(true);
  const [advancedLabelExtraInfo, setAdvancedLabelExtraInfo] = useState('');
  const [advancedVoorverpakVervaltype, setAdvancedVoorverpakVervaltype] = useState('Houdbare dagen');
  const [advancedHoudbareDagen, setAdvancedHoudbareDagen] = useState('0');
  const [advancedBewarenGebruik, setAdvancedBewarenGebruik] = useState('');
  const [advancedKassaPhotoPreview, setAdvancedKassaPhotoPreview] = useState(null);

  const [extraPricesRows, setExtraPricesRows] = useState([]);
  const [extraPricesSelectedIndex, setExtraPricesSelectedIndex] = useState(0);

  const [purchaseVat, setPurchaseVat] = useState('');
  const [purchasePriceExcl, setPurchasePriceExcl] = useState('0.00');
  const [purchasePriceIncl, setPurchasePriceIncl] = useState('0.00');
  const [profitPct, setProfitPct] = useState('0.00');
  const [purchaseUnit, setPurchaseUnit] = useState('Piece');
  const [unitContent, setUnitContent] = useState('0');
  const [stock, setStock] = useState('0');
  const [purchaseSupplier, setPurchaseSupplier] = useState('');
  const [supplierCode, setSupplierCode] = useState('');
  const [stockNotification, setStockNotification] = useState(true);
  const [expirationDate, setExpirationDate] = useState('');
  const [declarationExpiryDays, setDeclarationExpiryDays] = useState('0');
  const [notificationSoldOutPieces, setNotificationSoldOutPieces] = useState('');

  const [productInWebshop, setProductInWebshop] = useState(false);
  const [webshopOnlineOrderable, setWebshopOnlineOrderable] = useState(true);
  const [websiteRemark, setWebsiteRemark] = useState('');
  const [websiteOrder, setWebsiteOrder] = useState('0');
  const [shortWebText, setShortWebText] = useState('');
  const [websitePhotoFileName, setWebsitePhotoFileName] = useState('');

  const [kioskInfo, setKioskInfo] = useState('');
  const [kioskTakeAway, setKioskTakeAway] = useState(true);
  const [kioskEatIn, setKioskEatIn] = useState('');
  const [kioskSubtitle, setKioskSubtitle] = useState('');
  const [kioskPictureFileName, setKioskPictureFileName] = useState('');
  const [kioskMinSubs, setKioskMinSubs] = useState('unlimited');
  const [kioskMaxSubs, setKioskMaxSubs] = useState('unlimited');

  const [subproductGroups, setSubproductGroups] = useState([]);
  const [subproductGroupsLoading, setSubproductGroupsLoading] = useState(false);
  const [selectedSubproductGroupId, setSelectedSubproductGroupId] = useState(null);
  const [selectedSubproductId, setSelectedSubproductId] = useState(null);
  const [subproducts, setSubproducts] = useState([]);
  const [subproductsLoading, setSubproductsLoading] = useState(false);
  const [subproductSearch, setSubproductSearch] = useState('');
  const [showSubproductModal, setShowSubproductModal] = useState(false);
  const [showManageGroupsModal, setShowManageGroupsModal] = useState(false);
  const [editingSubproductId, setEditingSubproductId] = useState(null);
  const [subproductName, setSubproductName] = useState('');
  const [savingSubproduct, setSavingSubproduct] = useState(false);
  const [deleteConfirmSubproductId, setDeleteConfirmSubproductId] = useState(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [showAddGroupInline, setShowAddGroupInline] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [editingGroupName, setEditingGroupName] = useState('');
  const [deleteConfirmGroupId, setDeleteConfirmGroupId] = useState(null);
  const [savingGroup, setSavingGroup] = useState(false);

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

  useEffect(() => {
    if (showProductModal) fetchPriceGroups();
  }, [showProductModal, fetchPriceGroups]);

  useEffect(() => {
    if (!showProductModal || !priceGroups.length) return;
    setExtraPricesRows((prev) => {
      const byId = new Map(prev.filter((r) => r.priceGroupId).map((r) => [r.priceGroupId, r]));
      return priceGroups.map((pg) => {
        const ex = byId.get(pg.id);
        return {
          priceGroupId: pg.id,
          priceGroupLabel: pg.name,
          otherName: ex?.otherName ?? '',
          otherPrinter: ex?.otherPrinter ?? '',
          otherPrice: ex?.otherPrice ?? ''
        };
      });
    });
  }, [showProductModal, priceGroups]);

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

  const fetchSubproductGroups = useCallback(async () => {
    setSubproductGroupsLoading(true);
    try {
      const res = await fetch(`${API}/subproduct-groups`);
      const data = await res.json();
      setSubproductGroups(Array.isArray(data) ? data : []);
    } catch {
      setSubproductGroups([]);
    } finally {
      setSubproductGroupsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (subNavId === 'Subproducts') fetchSubproductGroups();
  }, [subNavId, fetchSubproductGroups]);

  const fetchSubproducts = useCallback(async (groupId) => {
    if (!groupId) {
      setSubproducts([]);
      return;
    }
    setSubproductsLoading(true);
    try {
      const res = await fetch(`${API}/subproduct-groups/${groupId}/subproducts`);
      const data = await res.json();
      setSubproducts(Array.isArray(data) ? data : []);
    } catch {
      setSubproducts([]);
    } finally {
      setSubproductsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (subNavId === 'Subproducts' && selectedSubproductGroupId) fetchSubproducts(selectedSubproductGroupId);
  }, [subNavId, selectedSubproductGroupId, fetchSubproducts]);

  useEffect(() => {
    if (subNavId === 'Subproducts' && subproductGroups.length > 0 && !selectedSubproductGroupId) {
      setSelectedSubproductGroupId(subproductGroups[0].id);
    }
  }, [subNavId, subproductGroups, selectedSubproductGroupId]);

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
    setProductTab('General');
    setProductName('');
    setProductKeyName('');
    setProductProductionName('');
    setProductPrice('');
    setProductVatTakeOut('');
    setProductVatEatIn('');
    setProductCategoryIds([selectedCategoryId || '']);
    setProductAddition('Subproducts');
    setProductBarcode('');
    setProductPrinter1('Disabled');
    setProductPrinter2('Disabled');
    setProductPrinter3('Disabled');
    setProductActiveField('name');
    setProductFieldErrors({ name: false, keyName: false, productionName: false, vatTakeOut: false, vatEatIn: false });
    setProductTabsUnlocked(false);
    setProductDisplayNumber(null);
    setShowProductModal(true);
  };

  const openEditProductModal = (product) => {
    setEditingProductId(product.id);
    setProductTab('General');
    setProductName(product.name || '');
    setProductKeyName(product.keyName ?? '');
    setProductProductionName(product.productionName ?? '');
    setProductPrice(String(product.price ?? ''));
    setProductVatTakeOut(product.vatTakeOut ?? '');
    setProductVatEatIn(product.vatEatIn ?? '');
    let categoryIds = [product.categoryId || selectedCategoryId || ''];
    if (product.categoryIdsJson) {
      try {
        const parsed = JSON.parse(product.categoryIdsJson);
        if (Array.isArray(parsed) && parsed.length) categoryIds = parsed;
      } catch (_) {}
    }
    setProductCategoryIds(categoryIds);
    setProductAddition(product.addition ?? 'Subproducts');
    setProductBarcode(product.barcode ?? '');
    setProductPrinter1(product.printer1 ?? 'Disabled');
    setProductPrinter2(product.printer2 ?? 'Disabled');
    setProductPrinter3(product.printer3 ?? 'Disabled');
    setProductActiveField('name');
    setProductFieldErrors({ name: false, keyName: false, productionName: false, vatTakeOut: false, vatEatIn: false });
    setProductTabsUnlocked(false);
    setProductDisplayNumber(product.number != null ? product.number : null);

    setAdvancedOpenPrice(!!product.openPrice);
    setAdvancedWeegschaal(!!product.weegschaal);
    setAdvancedSubproductRequires(!!product.subproductRequires);
    setAdvancedLeeggoedPrijs(product.leeggoedPrijs ?? '0.00');
    setAdvancedPagerVerplicht(!!product.pagerVerplicht);
    setAdvancedBoldPrint(!!product.boldPrint);
    setAdvancedGroupingReceipt(product.groupingReceipt !== false);
    setAdvancedLabelExtraInfo(product.labelExtraInfo ?? '');
    setAdvancedVoorverpakVervaltype(product.voorverpakVervaltype ?? 'Houdbare dagen');
    setAdvancedHoudbareDagen(product.houdbareDagen ?? '0');
    setAdvancedBewarenGebruik(product.bewarenGebruik ?? '');
    if (product.kassaPhotoPath) setAdvancedKassaPhotoPreview(null);

    let rows = [];
    if (product.extraPricesJson) {
      try {
        const parsed = JSON.parse(product.extraPricesJson);
        if (Array.isArray(parsed)) rows = parsed;
      } catch (_) {}
    }
    setExtraPricesRows(rows);
    setExtraPricesSelectedIndex(0);

    setPurchaseVat(product.purchaseVat ?? '');
    setPurchasePriceExcl(product.purchasePriceExcl ?? '0.00');
    setPurchasePriceIncl(product.purchasePriceIncl ?? '0.00');
    setProfitPct(product.profitPct ?? '0.00');
    setPurchaseUnit(product.unit ?? 'Piece');
    setUnitContent(product.unitContent ?? '0');
    setStock(product.stock ?? '0');
    setPurchaseSupplier(product.supplierCode ?? '');
    setSupplierCode(product.supplierCode ?? '');
    setStockNotification(product.stockNotification !== false);
    setExpirationDate(product.expirationDate ?? '');
    setDeclarationExpiryDays(product.declarationExpiryDays ?? '0');
    setNotificationSoldOutPieces(product.notificationSoldOutPieces ?? '');

    setProductInWebshop(!!product.inWebshop);
    setWebshopOnlineOrderable(product.onlineOrderable !== false);
    setWebsiteRemark(product.websiteRemark ?? '');
    setWebsiteOrder(product.websiteOrder ?? '0');
    setShortWebText(product.shortWebText ?? '');
    setWebsitePhotoFileName(product.websitePhotoPath ?? '');

    setKioskInfo(product.kioskInfo ?? '');
    setKioskTakeAway(product.kioskTakeAway !== false);
    setKioskEatIn(product.kioskEatIn ?? '');
    setKioskSubtitle(product.kioskSubtitle ?? '');
    setKioskMinSubs(product.kioskMinSubs ?? 'unlimited');
    setKioskMaxSubs(product.kioskMaxSubs ?? 'unlimited');
    setKioskPictureFileName(product.kioskPicturePath ?? '');

    setShowProductModal(true);
  };

  const closeProductModal = () => {
    if (advancedKassaPhotoPreview) {
      URL.revokeObjectURL(advancedKassaPhotoPreview);
      setAdvancedKassaPhotoPreview(null);
    }
    setExtraPricesRows([]);
    setExtraPricesSelectedIndex(0);
    setProductCategoryIds(['']);
    setShowProductModal(false);
    setEditingProductId(null);
  };

  const validateProductRequired = () => {
    const name = !productName.trim();
    const keyName = !productKeyName.trim();
    const productionName = !productProductionName.trim();
    const vatTakeOut = !productVatTakeOut;
    const vatEatIn = !productVatEatIn;
    setProductFieldErrors({ name, keyName, productionName, vatTakeOut, vatEatIn });
    return !name && !keyName && !productionName && !vatTakeOut && !vatEatIn;
  };

  const buildProductPayload = () => {
    const categoryId = (productCategoryIds[0] || '') || selectedCategoryId;
    const payload = {
      name: productName.trim() || 'New product',
      price: parseFloat(productPrice) || 0,
      categoryId: categoryId || undefined,
      keyName: productKeyName.trim() || null,
      productionName: productProductionName.trim() || null,
      vatTakeOut: productVatTakeOut || null,
      vatEatIn: productVatEatIn || null,
      barcode: productBarcode.trim() || null,
      printer1: productPrinter1 || null,
      printer2: productPrinter2 || null,
      printer3: productPrinter3 || null,
      addition: productAddition || null,
      categoryIdsJson: JSON.stringify(productCategoryIds.filter(Boolean)),
      openPrice: advancedOpenPrice,
      weegschaal: advancedWeegschaal,
      subproductRequires: advancedSubproductRequires,
      leeggoedPrijs: advancedLeeggoedPrijs || null,
      pagerVerplicht: advancedPagerVerplicht,
      boldPrint: advancedBoldPrint,
      groupingReceipt: advancedGroupingReceipt,
      labelExtraInfo: advancedLabelExtraInfo.trim() || null,
      kassaPhotoPath: null,
      voorverpakVervaltype: advancedVoorverpakVervaltype || null,
      houdbareDagen: advancedHoudbareDagen || null,
      bewarenGebruik: advancedBewarenGebruik.trim() || null,
      extraPricesJson: JSON.stringify(extraPricesRows.map((r) => ({ priceGroupId: r.priceGroupId, priceGroupLabel: r.priceGroupLabel, otherName: r.otherName || '', otherPrinter: r.otherPrinter || '', otherPrice: r.otherPrice || '' }))),
      purchaseVat: purchaseVat || null,
      purchasePriceExcl: purchasePriceExcl || null,
      purchasePriceIncl: purchasePriceIncl || null,
      profitPct: profitPct || null,
      unit: purchaseUnit || null,
      unitContent: unitContent || null,
      stock: stock || null,
      supplierCode: supplierCode.trim() || null,
      stockNotification: stockNotification,
      expirationDate: expirationDate || null,
      declarationExpiryDays: declarationExpiryDays || null,
      notificationSoldOutPieces: notificationSoldOutPieces || null,
      inWebshop: productInWebshop,
      onlineOrderable: webshopOnlineOrderable,
      websiteRemark: websiteRemark.trim() || null,
      websiteOrder: websiteOrder || null,
      shortWebText: shortWebText.trim() || null,
      websitePhotoPath: websitePhotoFileName || null,
      kioskInfo: kioskInfo.trim() || null,
      kioskTakeAway: kioskTakeAway,
      kioskEatIn: kioskEatIn.trim() || null,
      kioskSubtitle: kioskSubtitle.trim() || null,
      kioskMinSubs: kioskMinSubs || null,
      kioskMaxSubs: kioskMaxSubs || null,
      kioskPicturePath: kioskPictureFileName || null
    };
    return payload;
  };

  const handleSaveProduct = async () => {
    if (!validateProductRequired()) return;
    const categoryId = (productCategoryIds[0] || '') || selectedCategoryId;
    if (!categoryId) return;
    setSavingProduct(true);
    const payload = buildProductPayload();
    try {
      if (editingProductId) {
        const res = await fetch(`${API}/products/${editingProductId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
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
          body: JSON.stringify({ ...payload, categoryId })
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

  const productKeyboardValue = productActiveField === 'name' ? productName : productActiveField === 'keyName' ? productKeyName : productActiveField === 'productionName' ? productProductionName : productActiveField === 'price' ? productPrice : productActiveField === 'barcode' ? productBarcode : productActiveField === 'leeggoedPrijs' ? advancedLeeggoedPrijs : productActiveField === 'labelExtraInfo' ? advancedLabelExtraInfo : productActiveField === 'houdbareDagen' ? advancedHoudbareDagen : productActiveField === 'bewarenGebruik' ? advancedBewarenGebruik : productActiveField === 'extraOtherName' ? (extraPricesRows[extraPricesSelectedIndex]?.otherName ?? '') : productActiveField === 'extraOtherPrice' ? (extraPricesRows[extraPricesSelectedIndex]?.otherPrice ?? '') : productActiveField === 'purchasePriceExcl' ? purchasePriceExcl : productActiveField === 'purchasePriceIncl' ? purchasePriceIncl : productActiveField === 'profitPct' ? profitPct : productActiveField === 'unitContent' ? unitContent : productActiveField === 'stock' ? stock : productActiveField === 'supplierCode' ? supplierCode : productActiveField === 'expirationDate' ? expirationDate : productActiveField === 'declarationExpiryDays' ? declarationExpiryDays : productActiveField === 'notificationSoldOutPieces' ? notificationSoldOutPieces : productActiveField === 'websiteRemark' ? websiteRemark : productActiveField === 'websiteOrder' ? websiteOrder : productActiveField === 'shortWebText' ? shortWebText : productActiveField === 'kioskInfo' ? kioskInfo : productActiveField === 'kioskEatIn' ? kioskEatIn : productActiveField === 'kioskSubtitle' ? kioskSubtitle : '';
  const productKeyboardOnChange = productActiveField === 'name'
    ? (v) => { setProductName(v); setProductFieldErrors((e) => ({ ...e, name: false })); }
    : productActiveField === 'keyName'
      ? (v) => { setProductKeyName(v); setProductFieldErrors((e) => ({ ...e, keyName: false })); }
      : productActiveField === 'productionName'
        ? (v) => { setProductProductionName(v); setProductFieldErrors((e) => ({ ...e, productionName: false })); }
        : productActiveField === 'price'
          ? setProductPrice
          : productActiveField === 'barcode'
            ? setProductBarcode
            : productActiveField === 'leeggoedPrijs'
              ? setAdvancedLeeggoedPrijs
              : productActiveField === 'labelExtraInfo'
                ? setAdvancedLabelExtraInfo
                : productActiveField === 'houdbareDagen'
                  ? setAdvancedHoudbareDagen
                  : productActiveField === 'bewarenGebruik'
                    ? setAdvancedBewarenGebruik
                    : productActiveField === 'extraOtherName'
                      ? (v) => setExtraPricesRows((prev) => { const next = prev.map((r, i) => i === extraPricesSelectedIndex ? { ...r, otherName: v } : r); return next; })
                      : productActiveField === 'extraOtherPrice'
                        ? (v) => setExtraPricesRows((prev) => { const next = prev.map((r, i) => i === extraPricesSelectedIndex ? { ...r, otherPrice: v } : r); return next; })
                        : productActiveField === 'purchasePriceExcl'
                          ? setPurchasePriceExcl
                          : productActiveField === 'purchasePriceIncl'
                            ? setPurchasePriceIncl
                            : productActiveField === 'profitPct'
                              ? setProfitPct
                              : productActiveField === 'unitContent'
                                ? setUnitContent
                                : productActiveField === 'stock'
                                  ? setStock
                                  : productActiveField === 'supplierCode'
                                    ? setSupplierCode
                                    : productActiveField === 'expirationDate'
                                      ? setExpirationDate
                                      : productActiveField === 'declarationExpiryDays'
                                        ? setDeclarationExpiryDays
                                        : productActiveField === 'notificationSoldOutPieces'
                                          ? setNotificationSoldOutPieces
                                          : productActiveField === 'websiteRemark'
                                            ? setWebsiteRemark
                                            : productActiveField === 'websiteOrder'
                                              ? setWebsiteOrder
                                              : productActiveField === 'shortWebText'
                                                ? setShortWebText
                                                : productActiveField === 'kioskInfo'
                                                  ? setKioskInfo
                                                  : productActiveField === 'kioskEatIn'
                                                    ? setKioskEatIn
                                                    : productActiveField === 'kioskSubtitle'
                                                      ? setKioskSubtitle
                                                      : () => { };

  const handleGenerateBarcode = () => {
    const digits = Array.from({ length: 13 }, () => Math.floor(Math.random() * 10)).join('');
    setProductBarcode(digits);
    setBarcodeButtonSpinning(true);
    setTimeout(() => setBarcodeButtonSpinning(false), 600);
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

  const filteredSubproducts = subproductSearch.trim()
    ? subproducts.filter((s) => (s.name || '').toLowerCase().includes(subproductSearch.trim().toLowerCase()))
    : subproducts;

  const openSubproductModal = () => {
    setEditingSubproductId(null);
    setSubproductName('');
    setShowSubproductModal(true);
  };

  const openEditSubproductModal = (sp) => {
    setEditingSubproductId(sp.id);
    setSubproductName(sp.name || '');
    setShowSubproductModal(true);
  };

  const closeSubproductModal = () => {
    setShowSubproductModal(false);
    setEditingSubproductId(null);
  };

  const handleSaveSubproduct = async () => {
    if (!selectedSubproductGroupId) return;
    setSavingSubproduct(true);
    const name = subproductName.trim() || 'New subproduct';
    try {
      if (editingSubproductId) {
        const res = await fetch(`${API}/subproducts/${editingSubproductId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name })
        });
        const updated = await res.json();
        if (res.ok && updated) {
          setSubproducts((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
          closeSubproductModal();
        } else fetchSubproducts(selectedSubproductGroupId);
      } else {
        const res = await fetch(`${API}/subproducts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, groupId: selectedSubproductGroupId })
        });
        const created = await res.json();
        if (res.ok && created) {
          setSubproducts((prev) => [...prev, created].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)));
          closeSubproductModal();
        } else fetchSubproducts(selectedSubproductGroupId);
      }
    } catch {
      fetchSubproducts(selectedSubproductGroupId);
    } finally {
      setSavingSubproduct(false);
    }
  };

  const handleDeleteSubproduct = async (id) => {
    try {
      const res = await fetch(`${API}/subproducts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSubproducts((prev) => prev.filter((s) => s.id !== id));
        if (selectedSubproductId === id) setSelectedSubproductId(null);
      } else fetchSubproducts(selectedSubproductGroupId);
    } catch {
      fetchSubproducts(selectedSubproductGroupId);
    } finally {
      setDeleteConfirmSubproductId(null);
    }
  };

  const handleMoveSubproduct = async (direction) => {
    if (!selectedSubproductId) return;
    const idx = subproducts.findIndex((s) => s.id === selectedSubproductId);
    if (idx < 0) return;
    const nextIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (nextIdx < 0 || nextIdx >= subproducts.length) return;
    const curr = subproducts[idx];
    const other = subproducts[nextIdx];
    const currOrder = curr.sortOrder ?? idx;
    const otherOrder = other.sortOrder ?? nextIdx;
    try {
      await fetch(`${API}/subproducts/${curr.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sortOrder: otherOrder })
      });
      await fetch(`${API}/subproducts/${other.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sortOrder: currOrder })
      });
      setSubproducts((prev) => {
        const list = [...prev];
        list[idx] = { ...list[idx], sortOrder: otherOrder };
        list[nextIdx] = { ...list[nextIdx], sortOrder: currOrder };
        return list.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      });
    } catch {
      fetchSubproducts(selectedSubproductGroupId);
    }
  };

  const handleAddGroup = async () => {
    const name = newGroupName.trim() || 'New group';
    setSavingGroup(true);
    try {
      const res = await fetch(`${API}/subproduct-groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      const created = await res.json();
      if (res.ok && created) {
        setSubproductGroups((prev) => [...prev, created].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)));
        setNewGroupName('');
        setShowAddGroupInline(false);
      } else fetchSubproductGroups();
    } catch {
      fetchSubproductGroups();
    } finally {
      setSavingGroup(false);
    }
  };

  const handleSaveEditGroup = async () => {
    if (!editingGroupId) return;
    const name = editingGroupName.trim() || 'New group';
    setSavingGroup(true);
    try {
      const res = await fetch(`${API}/subproduct-groups/${editingGroupId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      const updated = await res.json();
      if (res.ok && updated) {
        setSubproductGroups((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
        setEditingGroupId(null);
        setEditingGroupName('');
      } else fetchSubproductGroups();
    } catch {
      fetchSubproductGroups();
    } finally {
      setSavingGroup(false);
    }
  };

  const handleDeleteGroup = async (id) => {
    try {
      const res = await fetch(`${API}/subproduct-groups/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSubproductGroups((prev) => prev.filter((g) => g.id !== id));
        if (selectedSubproductGroupId === id) setSelectedSubproductGroupId(null);
      } else fetchSubproductGroups();
    } catch {
      fetchSubproductGroups();
    } finally {
      setDeleteConfirmGroupId(null);
    }
  };

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
              className={`px-4 py-2 rounded-lg text-xl transition-colors ${subNavId === label
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
                  New category
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
              {/* Action bar: New Product, Positioning, Search (right-aligned like reference) */}
              <div className="flex items-center w-full justify-around gap-4 mb-4 flex-wrap">
                <button
                  type="button"
                  disabled={!selectedCategoryId || productsLoading}
                  onClick={openProductModal}
                  className="px-6 py-3 rounded-lg text-xl font-medium bg-pos-panel border border-pos-border text-pos-text hover:bg-pos-bg hover:border-white/30 transition-colors disabled:opacity-50"
                >
                  New Product
                </button>
                <button
                  type="button"
                  className="px-6 py-3 rounded-lg text-xl font-medium bg-pos-panel border border-pos-border text-pos-text hover:bg-pos-bg hover:border-white/30 transition-colors disabled:opacity-50"
                >
                  Positioning
                </button>
                <input
                  type="text"
                  readOnly
                  value={productSearch}
                  placeholder="Search products"
                  onClick={() => setShowProductSearchKeyboard(true)}
                  onFocus={() => setShowProductSearchKeyboard(true)}
                  className="px-4 py-2 rounded-lg bg-pos-bg border border-pos-border text-pos-text text-xl min-w-[200px] placeholder:text-pos-muted cursor-pointer"
                />
              </div>
              {/* Category tabs: horizontal, scrollable, selected with underline */}
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
                  <div id="products-category-scroll" className="flex gap-4 overflow-x-auto flex-1 min-w-0 scrollbar-thin">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        className={`px-5 py-3 text-xl font-medium whitespace-nowrap shrink-0 transition-colors border-b-2 ${selectedCategoryId === cat.id
                          ? 'bg-pos-bg/80 text-pos-text border-green-500'
                          : 'text-pos-muted hover:text-pos-text bg-transparent border-transparent hover:bg-pos-panel/50'
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
              {/* Product list: name (left), Subproducts (center), Edit/Delete (right) */}
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
                        className={`flex items-center px-10 w-full justify-between py-3 border-b border-pos-border text-pos-text text-lg last:border-b-0 cursor-pointer ${selectedProductId === product.id ? 'bg-pos-panel/70' : 'bg-pos-bg hover:bg-pos-panel/40'}`}
                        onClick={(e) => { if (!e.target.closest('button')) setSelectedProductId(product.id); }}
                      >
                        <span className="min-w-0 text-left font-medium truncate" title={product.name}>
                          {product.name}
                        </span>
                        <span className="flex-shrink-0 w-[180px] text-center text-pos-muted text-lg">
                          Subproducts
                        </span>
                        <div className="flex items-center gap-10 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
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
                        </div>
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
          ) : subNavId === 'Subproducts' ? (
            <div className="rounded-xl border border-pos-border bg-pos-panel/30 p-8 min-h-[300px] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  className="px-6 py-3 rounded-lg text-xl font-medium bg-pos-panel border border-pos-border text-pos-text hover:bg-pos-bg hover:border-white/30 transition-colors disabled:opacity-50"
                  disabled={!selectedSubproductGroupId || subproductsLoading}
                  onClick={openSubproductModal}
                >
                  New subproduct
                </button>
                <button
                  type="button"
                  className="px-6 py-3 rounded-lg text-xl font-medium bg-pos-panel border border-pos-border text-pos-text hover:bg-pos-bg hover:border-white/30 transition-colors"
                  onClick={() => setShowManageGroupsModal(true)}
                >
                  Manage Groups
                </button>
              </div>
              {subproductGroups.length > 0 && (
                <div className="flex items-center gap-2 mb-4 overflow-hidden">
                  <button
                    type="button"
                    className="p-2 rounded bg-pos-bg border border-pos-border text-pos-text hover:bg-pos-panel shrink-0"
                    onClick={() => { const el = document.getElementById('subproducts-group-scroll'); if (el) el.scrollBy({ left: -200, behavior: 'smooth' }); }}
                    aria-label="Scroll left"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <div id="subproducts-group-scroll" className="flex gap-2 overflow-x-auto flex-1 min-w-0 py-2 px-1 bg-pos-bg border border-pos-border rounded-lg">
                    {subproductGroups.map((grp) => (
                      <button
                        key={grp.id}
                        type="button"
                        className={`px-5 py-3 rounded-lg text-xl font-medium whitespace-nowrap shrink-0 transition-colors ${selectedSubproductGroupId === grp.id ? 'bg-pos-panel text-pos-text border border-pos-border' : 'text-pos-muted hover:text-pos-text bg-pos-panel/50 border border-transparent'}`}
                        onClick={() => setSelectedSubproductGroupId(grp.id)}
                      >
                        {grp.name}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="p-2 rounded bg-pos-bg border border-pos-border text-pos-text hover:bg-pos-panel shrink-0"
                    onClick={() => { const el = document.getElementById('subproducts-group-scroll'); if (el) el.scrollBy({ left: 200, behavior: 'smooth' }); }}
                    aria-label="Scroll right"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              )}
              <div className="flex-1 overflow-auto border border-pos-border rounded-lg bg-pos-bg min-h-[200px]">
                {!selectedSubproductGroupId ? (
                  <p className="text-pos-muted text-xl p-6 text-center">Select a group or add one via Manage Groups.</p>
                ) : subproductGroupsLoading ? (
                  <p className="text-pos-muted text-lg p-6">Loading groups…</p>
                ) : subproductsLoading ? (
                  <p className="text-pos-muted text-lg p-6">Loading subproducts…</p>
                ) : subproducts.length === 0 ? (
                  <p className="text-pos-muted text-xl p-6 text-center">No subproducts in this group yet.</p>
                ) : (
                  <ul className="w-full">
                    {subproducts.map((sp) => (
                      <li key={sp.id} className="flex items-center w-full px-4 py-3 border-b border-pos-border text-pos-text text-lg last:border-b-0">
                        <span className="flex-1 font-medium">{sp.name}</span>
                        <button type="button" className="p-2 rounded text-pos-text hover:bg-pos-panel" onClick={() => openEditSubproductModal(sp)} aria-label="Edit">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button type="button" className="p-2 rounded text-pos-text hover:bg-pos-panel" onClick={() => setDeleteConfirmSubproductId(sp.id)} aria-label="Delete">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
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
      <DeleteConfirmModal
        open={deleteConfirmSubproductId !== null}
        onClose={() => setDeleteConfirmSubproductId(null)}
        onConfirm={() => handleDeleteSubproduct(deleteConfirmSubproductId)}
        message="Are you sure you want to delete this subproduct?"
      />
      <DeleteConfirmModal
        open={deleteConfirmGroupId !== null}
        onClose={() => setDeleteConfirmGroupId(null)}
        onConfirm={() => handleDeleteGroup(deleteConfirmGroupId)}
        message="Are you sure you want to delete this group? Subproducts in it will also be deleted."
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
                    className="px-4 w-[300px] bg-pos-panel h-[60px] py-3 text-xl border border-gray-300 rounded-lg text-gray-200"
                  />
                </div>
                <div className="flex gap-2 w-full items-center justify-center h-[100px]">
                  <label className="block text-3xl pr-[80px] font-medium text-gray-200 mb-2">VAT : </label>
                  <Dropdown
                    options={VAT_OPTIONS}
                    value={priceGroupTax}
                    onChange={setPriceGroupTax}
                    placeholder="Select VAT"
                    className="text-xl min-w-[300px]"
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
                    className="flex-1 px-4 bg-pos-panel h-[60px] py-3 text-xl border border-gray-300 rounded-lg text-gray-200"
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
                    className="flex-1 px-4 bg-pos-panel h-[60px] py-3 text-xl border border-gray-300 rounded-lg text-gray-200"
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
          <div className="bg-pos-bg rounded-xl shadow-2xl max-w-[1380px] h-[1050px] w-full mx-4 overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex gap-1 w-full justify-around px-4 py-2 py-5 shrink-0">
              {['General', 'Advanced', 'Extra prices', 'Purchase and stock', 'Webshop', 'Kiosk'].map((tab) => {
                const isLocked = tab !== 'General' && !productTabsUnlocked;
                return (
                  <button
                    key={tab}
                    type="button"
                    disabled={isLocked}
                    className={`px-4 py-2 rounded-lg text-xl font-medium transition-colors ${productTab === tab ? 'bg-green-600 text-white border border-b-0 border-pos-border' : isLocked ? 'text-pos-muted opacity-50 cursor-not-allowed' : 'text-white hover:text-pos-text'}`}
                    onClick={() => !isLocked && setProductTab(tab)}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
            {/* Single scrollable area for all tabs so keyboard stays fixed at bottom */}
            <div className="flex-1 min-h-0 overflow-auto">
              {productTab === 'General' && (
                <div className="p-6 pb-0">
                  <div className="grid grid-cols-3 gap-6">
                    <div className="flex text-xl flex-col gap-4">
                      <div className="flex items-center gap-1">
                        <label className="text-xl font-medium text-gray-200 w-[300px]">Name:</label>
                        <input type="text" readOnly value={productName} className={`w-full px-4 py-3 border rounded-lg text-pos-text text-xl ${productFieldErrors.name ? 'bg-rose-500/40 border-rose-400' : 'bg-pos-panel border-pos-border'}`} onFocus={() => setProductActiveField('name')} onClick={() => setProductActiveField('name')} />
                      </div>
                      <div className="flex items-center gap-1">
                        <label className="w-[300px] font-medium text-gray-200">Test name:</label>
                        <input type="text" readOnly value={productKeyName} className={`w-full px-4 py-3 border rounded-lg text-pos-text text-xl ${productFieldErrors.keyName ? 'bg-rose-500/40 border-rose-400' : 'bg-pos-panel border-pos-border'}`} onFocus={() => setProductActiveField('keyName')} onClick={() => setProductActiveField('keyName')} />
                      </div>
                      <div className="flex items-center gap-1">
                        <label className="w-[300px] font-medium text-gray-200">Production name:</label>
                        <input type="text" readOnly value={productProductionName} className={`w-full px-4 py-3 border rounded-lg text-pos-text text-xl ${productFieldErrors.productionName ? 'bg-rose-500/40 border-rose-400' : 'bg-pos-panel border-pos-border'}`} onFocus={() => setProductActiveField('productionName')} onClick={() => setProductActiveField('productionName')} />
                      </div>
                      <div className="flex items-center gap-1">
                        <label className="w-[170px] font-medium text-gray-200">Price:</label>
                        <input type="text" readOnly value={productPrice} className="w-full px-4 py-3 bg-pos-panel border border-pos-border rounded-lg text-pos-text text-xl max-w-[150px]" onFocus={() => setProductActiveField('price')} onClick={() => setProductActiveField('price')} />
                      </div>
                      <div className="flex items-center gap-1">
                        <label className="min-w-[170px] font-medium text-gray-200">VAT Take out:</label>
                        <Dropdown options={VAT_PERCENT_OPTIONS} value={productVatTakeOut} onChange={(v) => { setProductVatTakeOut(v); setProductFieldErrors((e) => ({ ...e, vatTakeOut: false })); }} placeholder="--" className={`text-xl min-w-[150px] ${productFieldErrors.vatTakeOut ? '!bg-rose-500/40 !border-rose-400' : ''}`} />
                      </div>
                      <div className="flex items-center gap-1">
                        <label className="min-w-[170px] font-medium text-gray-200">VAT Eat in:</label>
                        <Dropdown options={VAT_PERCENT_OPTIONS} value={productVatEatIn} onChange={(v) => { setProductVatEatIn(v); setProductFieldErrors((e) => ({ ...e, vatEatIn: false })); }} placeholder="--" className={`text-xl min-w-[150px] ${productFieldErrors.vatEatIn ? '!bg-rose-500/40 !border-rose-400' : ''}`} />
                      </div>
                      {productTabsUnlocked ? (
                        <div className="flex items-center gap-1 h-[50px]">
                          <label className="min-w-[170px] font-medium text-gray-200">Id:</label>
                          <span className="text-pos-text text-xl">{productDisplayNumber != null ? productDisplayNumber : '—'}</span>
                        </div>
                      )
                        : (
                          <div className="flex items-center gap-1 h-[50px]">
                          </div>
                        )
                      }
                    </div>
                    <div className='flex flex-col gap-4'>
                      {(() => {
                        const ids = [...productCategoryIds];
                        let numVisible = 1;
                        if (productTabsUnlocked && categories.length > 0) {
                          for (let i = 0; i < categories.length; i++) {
                            if (i > 0 && !ids[i - 1]) break;
                            const optionsForNext = categories.filter((c) => !ids.slice(0, i + 1).includes(c.id));
                            if (!ids[i]) {
                              numVisible = i + 1;
                              break;
                            }
                            if (optionsForNext.length < 1) {
                              numVisible = i + 1;
                              break;
                            }
                            numVisible = i + 2;
                          }
                        }
                        while (ids.length < numVisible) ids.push('');
                        return Array.from({ length: numVisible }, (_, i) => {
                          const optionsForI = i === 0
                            ? categories
                            : categories.filter((c) => !ids.slice(0, i).includes(c.id));
                          return (
                            <div key={i} className="flex gap-1 w-full h-[50px]">
                              <label className="pr-5 font-medium text-xl items-center justify-center flex h-[50px] text-gray-200">Category:</label>
                              <Dropdown
                                options={optionsForI.map((c) => ({ value: c.id, label: c.name }))}
                                value={ids[i] || ''}
                                onChange={(v) => {
                                  setProductCategoryIds((prev) => {
                                    const next = [...prev];
                                    while (next.length <= i) next.push('');
                                    next[i] = v;
                                    for (let j = i + 1; j < next.length; j++) next[j] = '';
                                    return next;
                                  });
                                }}
                                placeholder="--"
                                inline
                                className="text-xl w-full min-w-[320px]"
                              />
                            </div>
                          );
                        });
                      })()}
                    </div>
                    <div className="flex flex-col gap-4">
                      <div className="flex gap-1 items-center w-full">
                        <label className="w-[100px] font-medium text-xl text-gray-200">Addition:</label>
                        <Dropdown options={[{ value: 'Subproducts', label: 'Subproducts' }]} value={productAddition} onChange={setProductAddition} placeholder="--" className="text-xl w-full min-w-[320px]" />
                      </div>
                      <div className="flex gap-1 items-center">
                        <label className="min-w-[100px] font-medium text-xl text-gray-200">Barcode:</label>
                        <div className="flex gap-2 items-center w-full">
                          <input type="text" readOnly value={productBarcode} className="flex-1 px-4 py-3 bg-pos-panel border border-pos-border rounded-lg text-pos-text text-xl " onFocus={() => setProductActiveField('barcode')} onClick={() => setProductActiveField('barcode')} />
                          <button type="button" className="p-2 rounded-full bg-pos-panel border border-pos-border text-pos-text hover:bg-pos-bg disabled:opacity-70" aria-label="Generate barcode" onClick={handleGenerateBarcode}>
                            <svg className={`w-6 h-6 ${barcodeButtonSpinning ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                          </button>
                        </div>
                      </div>
                      <div className="flex gap-1 items-center">
                        <label className="w-[100px] font-medium text-xl text-gray-200">Printer 1:</label>
                        <Dropdown options={[{ value: 'Disabled', label: 'Disabled' }]} value={productPrinter1} onChange={setProductPrinter1} className="text-xl w-full min-w-[320px]" />
                      </div>
                      <div className="flex gap-1 items-center">
                        <label className="w-[100px] font-medium text-xl text-gray-200">Printer 2:</label>
                        <Dropdown options={[{ value: 'Disabled', label: 'Disabled' }]} value={productPrinter2} onChange={setProductPrinter2} className="text-xl w-full min-w-[320px]" />
                      </div>
                      <div className="flex gap-1 items-center">
                        <label className="w-[100px] font-medium text-xl text-gray-200">Printer 3:</label>
                        <Dropdown options={[{ value: 'Disabled', label: 'Disabled' }]} value={productPrinter3} onChange={setProductPrinter3} className="text-xl w-full min-w-[320px]" />
                      </div>
                    </div>
                  </div>
                  <div className="flex w-full justify-center gap-4">
                    <button type="button" className="flex items-center gap-2 px-5 py-3 rounded-lg bg-pos-panel border border-pos-border text-pos-text font-medium hover:bg-pos-bg text-xl" onClick={async () => {
                      if (!validateProductRequired()) return;
                      setProductTabsUnlocked(true);
                      if (!editingProductId) {
                        try {
                          const res = await fetch(`${API}/products/next-number`);
                          const data = await res.json();
                          if (data.nextNumber != null) setProductDisplayNumber(data.nextNumber);
                        } catch { /* keep — */ }
                      }
                    }}>
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      Complete further
                    </button>
                    <button type="button" className="flex items-center gap-2 px-5 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 text-xl" disabled={savingProduct} onClick={handleSaveProduct}>
                      <svg fill="#ffffff" width="24" height="24" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M-5.732,2.97-7.97.732a2.474,2.474,0,0,0-1.483-.7A.491.491,0,0,0-9.591,0H-18.5A2.5,2.5,0,0,0-21,2.5v11A2.5,2.5,0,0,0-18.5,16h11A2.5,2.5,0,0,0-5,13.5V4.737A2.483,2.483,0,0,0-5.732,2.97ZM-13,1V5.455h-3.591V1Zm-4.272,14V10.545h8.544V15ZM-6,13.5A1.5,1.5,0,0,1-7.5,15h-.228V10.045a.5.5,0,0,0-.5-.5h-9.544a.5.5,0,0,0-.5.5V15H-18.5A1.5,1.5,0,0,1-20,13.5V2.5A1.5,1.5,0,0,1-18.5,1h.909V5.955a.5.5,0,0,0,.5.5h7.5a.5.5,0,0,0,.5-.5v-4.8a1.492,1.492,0,0,1,.414.285l2.238,2.238A1.511,1.511,0,0,1-6,4.737Z" transform="translate(21)" /></svg>
                      Add and close
                    </button>
                  </div>
                </div>
              )}
              {productTab === 'Advanced' && (
                <div className="p-6 pb-0 flex flex-col gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col gap-4">
                      <label className="flex items-center text-xl gap-2 text-pos-text">
                        Open price:
                        <input type="checkbox" checked={advancedOpenPrice} onChange={(e) => setAdvancedOpenPrice(e.target.checked)} className="rounded border-pos-border w-8 h-8 text-xl  mt-1 mb-1 ml-[120px]" />
                      </label>
                      <label className="flex items-center text-xl gap-2 text-pos-text">
                        Libra:
                        <input type="checkbox" checked={advancedWeegschaal} onChange={(e) => setAdvancedWeegschaal(e.target.checked)} className="rounded border-pos-border w-8 h-8 text-xl mt-1 mb-1 ml-[170px]" />
                      </label>
                      <label className="flex items-center text-xl gap-2 text-pos-text">
                        Subproduct requires :
                        <input type="checkbox" checked={advancedSubproductRequires} onChange={(e) => setAdvancedSubproductRequires(e.target.checked)} className="rounded border-pos-border w-8 h-8 text-xl mt-1 ml-[37px]" />
                      </label>
                      <div className="flex items-center gap-1">
                        <label className="block text-pos-text mb-1 text-xl min-w-[220px]">Empty price:</label>
                        <input type="text" value={advancedLeeggoedPrijs} onChange={(e) => setAdvancedLeeggoedPrijs(e.target.value)} onFocus={() => setProductActiveField('leeggoedPrijs')} className="w-full border border-pos-border rounded-lg px-3 py-2 bg-pos-bg text-pos-text text-xl max-w-[180px]" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-4">
                      <label className="flex items-center text-xl gap-2 text-pos-text">
                        Pager required:
                        <input type="checkbox" checked={advancedPagerVerplicht} onChange={(e) => setAdvancedPagerVerplicht(e.target.checked)} className="rounded border-pos-border w-8 h-8 text-xl mt-1 mb-1 ml-[120px]" />
                      </label>
                      <label className="flex items-center text-xl gap-2 text-pos-text">
                        Bold print:
                        <input type="checkbox" checked={advancedBoldPrint} onChange={(e) => setAdvancedBoldPrint(e.target.checked)} className="rounded border-pos-border w-8 h-8 text-xl mt-1 mb-1 ml-[160px]" />
                      </label>
                      <label className="flex items-center text-xl gap-2 text-pos-text">
                        Grouping receipt:
                        <input type="checkbox" checked={advancedGroupingReceipt} onChange={(e) => setAdvancedGroupingReceipt(e.target.checked)} className="rounded border-pos-border w-8 h-8 text-xl mt-1 mb-1 ml-[100px]" />
                      </label>
                    </div>
                    <div className="flex flex-col gap-4">
                      <div className="flex text-xl items-center gap-1">
                        <label className="block min-w-[170px] mr-3 text-pos-text mb-1">Label extra info:</label>
                        <input type="text" value={advancedLabelExtraInfo} onChange={(e) => setAdvancedLabelExtraInfo(e.target.value)} onFocus={() => setProductActiveField('labelExtraInfo')} className="w-full border border-pos-border rounded-lg px-3 py-2 bg-pos-bg text-pos-text text-xl max-w-[320px]" />
                      </div>
                      <div className="flex text-xl items-center gap-3">
                        <label className="block min-w-[170px] mr-1.5 text-pos-text mb-1">Cash register photo:</label>
                        <div className="flex items-center gap-3">
                          {!advancedKassaPhotoPreview ? (
                            <label className="px-4 py-2 border border-pos-border rounded-lg text-pos-text hover:bg-pos-panel cursor-pointer shrink-0 text-xl">
                              Select
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file && file.type.startsWith('image/')) {
                                    setAdvancedKassaPhotoPreview(URL.createObjectURL(file));
                                  }
                                  e.target.value = '';
                                }}
                              />
                            </label>
                          ) : (
                            <>
                              <img src={advancedKassaPhotoPreview} alt="Cash register" className="w-[100px] h-[100px] object-cover rounded-lg border border-pos-border shrink-0" />
                              <button
                                type="button"
                                className="px-4 py-2 border border-pos-border rounded-lg text-pos-text hover:bg-rose-500/30 text-xl shrink-0"
                                onClick={() => {
                                  URL.revokeObjectURL(advancedKassaPhotoPreview);
                                  setAdvancedKassaPhotoPreview(null);
                                }}
                              >
                                Remove
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex text-xl items-center gap-1">
                        <label className="block min-w-[180px] text-pos-text mb-1">Pre-pack expiry type:</label>
                        <Dropdown options={VERVALTYPE_OPTIONS} value={advancedVoorverpakVervaltype} onChange={setAdvancedVoorverpakVervaltype} placeholder="Select…" className="w-full border border-pos-border rounded-lg px-3 py-2 bg-pos-bg text-pos-text text-xl min-w-[247px]" />
                      </div>
                      <div className="flex text-xl items-center gap-1">
                        <label className="block min-w-[180px] text-pos-text mb-1">Shelf life:</label>
                        <input type="text" value={advancedHoudbareDagen} onChange={(e) => setAdvancedHoudbareDagen(e.target.value)} onFocus={() => setProductActiveField('houdbareDagen')} className="w-full border border-pos-border rounded-lg px-3 py-2 bg-pos-bg text-pos-text" />
                      </div>
                      <div className="flex text-xl gap-1">
                        <label className="block min-w-[180px] text-pos-text mb-1">Storage, use:</label>
                        <textarea value={advancedBewarenGebruik} onChange={(e) => setAdvancedBewarenGebruik(e.target.value)} onFocus={() => setProductActiveField('bewarenGebruik')} rows={4} className="w-full border border-pos-border rounded-lg px-3 py-2 bg-pos-bg text-pos-text resize-none" />
                      </div>
                    </div>
                  </div>
                  <div className="flex text-2xl justify-center absolute top-[50%] left-0 right-0">
                    <button type="button" className="flex items-center gap-2 px-5 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700" onClick={handleSaveProduct} disabled={savingProduct}>
                      <svg fill="#ffffff" width="20" height="20" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M-5.732,2.97-7.97.732a2.474,2.474,0,0,0-1.483-.7A.491.491,0,0,0-9.591,0H-18.5A2.5,2.5,0,0,0-21,2.5v11A2.5,2.5,0,0,0-18.5,16h11A2.5,2.5,0,0,0-5,13.5V4.737A2.483,2.483,0,0,0-5.732,2.97ZM-13,1V5.455h-3.591V1Zm-4.272,14V10.545h8.544V15ZM-6,13.5A1.5,1.5,0,0,1-7.5,15h-.228V10.045a.5.5,0,0,0-.5-.5h-9.544a.5.5,0,0,0-.5.5V15H-18.5A1.5,1.5,0,0,1-20,13.5V2.5A1.5,1.5,0,0,1-18.5,1h.909V5.955a.5.5,0,0,0,.5.5h7.5a.5.5,0,0,0,.5-.5v-4.8a1.492,1.492,0,0,1,.414.285l2.238,2.238A1.511,1.511,0,0,1-6,4.737Z" transform="translate(21)" /></svg>
                      Save
                    </button>
                  </div>
                </div>
              )}
              {productTab === 'Extra prices' && (
                <div className="p-6 flex flex-col gap-5">
                  <div className="overflow-x-auto">
                    <div className="flex gap-4 text-xl w-full justify-around mb-5 text-pos-text">
                      <div className="font-medium">Pricegroup</div>
                      <div className="font-medium">Other name</div>
                      <div className="font-medium">Other printer</div>
                      <div className="font-medium">Other price</div>
                    </div>
                    <table className="w-full h-[300px] border-collapse border border-pos-border rounded-lg text-pos-text text-xl">
                      <tbody className='h-[50px] flex flex-col w-full'>
                        {extraPricesRows.map((row, idx) => (
                          <tr key={idx} className="bg-pos-bg">
                            <td className="w-[323px] px-4 py-2">
                              <span className="px-3 py-2 block flex justify-center rounded-lg text-pos-text text-xl">{row.priceGroupLabel}</span>
                            </td>
                            <td className="w-[330px] px-4 py-2">
                              <input
                                type="text"
                                value={row.otherName}
                                onChange={(e) => setExtraPricesRows((prev) => prev.map((r, i) => i === idx ? { ...r, otherName: e.target.value } : r))}
                                onFocus={() => { setExtraPricesSelectedIndex(idx); setProductActiveField('extraOtherName'); }}
                                className="w-full max-w-[150px] ml-[80px] rounded-lg px-3 py-2 border border-pos-border flex justify-center bg-pos-panel text-pos-text"
                              />
                            </td>
                            <td className="w-[350px] px-4 py-2">
                              <Dropdown
                                options={EXTRA_PRICE_PRINTER_OPTIONS}
                                value={row.otherPrinter}
                                onChange={(v) => setExtraPricesRows((prev) => prev.map((r, i) => i === idx ? { ...r, otherPrinter: v } : r))}
                                placeholder="--"
                                className="w-full rounded-lg px-3 py-2 bg-pos-bg text-pos-text"
                              />
                            </td>
                            <td className="w-[320px] px-4 py-2">
                              <input
                                type="text"
                                value={row.otherPrice}
                                onChange={(e) => setExtraPricesRows((prev) => prev.map((r, i) => i === idx ? { ...r, otherPrice: e.target.value } : r))}
                                onFocus={() => { setExtraPricesSelectedIndex(idx); setProductActiveField('extraOtherPrice'); }}
                                className="w-full rounded-lg ml-[100px] max-w-[120px] px-3 py-2 border border-pos-border bg-pos-panel text-pos-text"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-center justify-around px-[400px]">
                    <button type="button" className="p-2 rounded-lg text-white hover:bg-pos-panel disabled:opacity-50 text-3xl" disabled={extraPricesSelectedIndex <= 0} onClick={() => { if (extraPricesSelectedIndex > 0) { setExtraPricesRows((prev) => { const next = [...prev]; const t = next[extraPricesSelectedIndex]; next[extraPricesSelectedIndex] = next[extraPricesSelectedIndex - 1]; next[extraPricesSelectedIndex - 1] = t; return next; }); setExtraPricesSelectedIndex((i) => i - 1); } }} aria-label="Move up">↑</button>
                    <button type="button" className="p-2 rounded-lg text-white hover:bg-pos-panel disabled:opacity-50 text-3xl" disabled={extraPricesSelectedIndex >= extraPricesRows.length - 1} onClick={() => { if (extraPricesSelectedIndex < extraPricesRows.length - 1) { setExtraPricesRows((prev) => { const next = [...prev]; const t = next[extraPricesSelectedIndex]; next[extraPricesSelectedIndex] = next[extraPricesSelectedIndex + 1]; next[extraPricesSelectedIndex + 1] = t; return next; }); setExtraPricesSelectedIndex((i) => i + 1); } }} aria-label="Move down">↓</button>
                  </div>
                  <div className="flex justify-center">
                    <button type="button" className="flex items-center gap-4 px-5 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 text-2xl" onClick={handleSaveProduct} disabled={savingProduct}>
                      <svg fill="#ffffff" width="24" height="24" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M-5.732,2.97-7.97.732a2.474,2.474,0,0,0-1.483-.7A.491.491,0,0,0-9.591,0H-18.5A2.5,2.5,0,0,0-21,2.5v11A2.5,2.5,0,0,0-18.5,16h11A2.5,2.5,0,0,0-5,13.5V4.737A2.483,2.483,0,0,0-5.732,2.97ZM-13,1V5.455h-3.591V1Zm-4.272,14V10.545h8.544V15ZM-6,13.5A1.5,1.5,0,0,1-7.5,15h-.228V10.045a.5.5,0,0,0-.5-.5h-9.544a.5.5,0,0,0-.5.5V15H-18.5A1.5,1.5,0,0,1-20,13.5V2.5A1.5,1.5,0,0,1-18.5,1h.909V5.955a.5.5,0,0,0,.5.5h7.5a.5.5,0,0,0,.5-.5v-4.8a1.492,1.492,0,0,1,.414.285l2.238,2.238A1.511,1.511,0,0,1-6,4.737Z" transform="translate(21)" /></svg>
                      Save
                    </button>
                  </div>
                </div>
              )}
              {productTab === 'Purchase and stock' && (
                <div className="p-6 flex flex-col gap-6 text-xl">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col gap-6">
                      <div className='flex items-center gap-2'>
                        <label className="block text-pos-text mb-1 mr-[65px]">Purchase VAT:</label>
                        <Dropdown options={VAT_PERCENT_OPTIONS} value={purchaseVat} onChange={setPurchaseVat} placeholder="--" className="border min-w-[150px] border-pos-border rounded-lg px-3 py-2 bg-pos-bg text-pos-text" />
                      </div>
                      <div className='flex items-center gap-2'>
                        <label className="block text-pos-text mb-1 mr-[20px]">Purchase price excl:</label>
                        <input type="text" value={purchasePriceExcl} onChange={(e) => setPurchasePriceExcl(e.target.value)} onFocus={() => setProductActiveField('purchasePriceExcl')} className="border max-w-[220px] border-pos-border rounded-lg px-3 py-2 bg-pos-bg text-pos-text" />
                      </div>
                      <div className='flex items-center gap-2'>
                        <label className="block text-pos-text mb-1 mr-[20px]">Purchase price incl.:</label>
                        <input type="text" value={purchasePriceIncl} onChange={(e) => setPurchasePriceIncl(e.target.value)} onFocus={() => setProductActiveField('purchasePriceIncl')} className="border max-w-[220px] border-pos-border rounded-lg px-3 py-2 bg-pos-bg text-pos-text" />
                      </div>
                      <div className='flex items-center gap-2'>
                        <label className="block text-pos-text mb-1 mr-[35px]">Profit percentage:</label>
                        <input type="text" value={profitPct} onChange={(e) => setProfitPct(e.target.value)} onFocus={() => setProductActiveField('profitPct')} className="border border-pos-border rounded-lg px-3 max-w-[220px] py-2 bg-pos-bg text-pos-text" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-6">
                      <div className='flex items-center gap-2'>
                        <label className="block text-pos-text mb-1 mr-[75px]">Unit:</label>
                        <Dropdown options={PURCHASE_UNIT_OPTIONS} value={purchaseUnit} onChange={setPurchaseUnit} placeholder="--" className="border border-pos-border min-w-[150px] rounded-lg px-3 py-2 bg-pos-bg text-pos-text" />
                      </div>
                      <div className='flex items-center gap-2'>
                        <label className="block text-pos-text mb-1 mr-[10px]">Unit content:</label>
                        <input type="text" value={unitContent} onChange={(e) => setUnitContent(e.target.value)} onFocus={() => setProductActiveField('unitContent')} className="border border-pos-border rounded-lg px-3 py-2 bg-pos-bg text-pos-text" />
                      </div>
                      <div className='flex items-center gap-2'>
                        <label className="block text-pos-text mb-1 mr-[70px]">Stock:</label>
                        <input type="text" value={stock} onChange={(e) => setStock(e.target.value)} onFocus={() => setProductActiveField('stock')} className="border border-pos-border rounded-lg px-3 py-2 bg-pos-bg text-pos-text" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-6">
                      <div className='flex items-center gap-28'>
                        <label className="block text-pos-text pr-3 mb-1">Supplier:</label>
                        <Dropdown options={PURCHASE_SUPPLIER_OPTIONS} value={purchaseSupplier} onChange={setPurchaseSupplier} placeholder="--" className="border min-w-[150px] border-pos-border rounded-lg px-3 py-2 bg-pos-bg text-pos-text" />
                      </div>
                      <div className='flex items-center gap-16'>
                        <label className="block text-pos-text pr-3 mb-1">Supplier code:</label>
                        <input type="text" value={supplierCode} onChange={(e) => setSupplierCode(e.target.value)} onFocus={() => setProductActiveField('supplierCode')} className="border max-w-[200px] border-pos-border rounded-lg px-3 py-2 bg-pos-bg text-pos-text" />
                      </div>
                      <label className="flex items-center gap-12 text-pos-text">
                        Stock notification
                        <input type="checkbox" checked={stockNotification} onChange={(e) => setStockNotification(e.target.checked)} className="rounded w-8 h-8 border-pos-border" />
                      </label>
                      <div className='flex items-center gap-2'>
                        <label className="block text-pos-text mb-1 pr-[55px]">Expiration date:</label>
                        <input type="text" value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)} onFocus={() => setProductActiveField('expirationDate')} className="border border-pos-border max-w-[200px] rounded-lg px-3 py-2 bg-pos-bg text-pos-text" placeholder="" />
                      </div>
                      <div className='flex items-center gap-2'>
                        <label className="block text-pos-text pr-[10px] mb-1">Declaration of expiry:</label>
                        <div className="flex items-center gap-2">
                          <input type="text" value={declarationExpiryDays} onChange={(e) => setDeclarationExpiryDays(e.target.value)} onFocus={() => setProductActiveField('declarationExpiryDays')} className="border max-w-[80px] border-pos-border rounded-lg px-3 py-2 bg-pos-bg text-pos-text max-w-[120px]" />
                          <span className="text-pos-text text-md">days in advance</span>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <label className="block text-pos-text mb-1 pr-[10px]">Notification sold out:</label>
                        <div className="flex items-center gap-2">
                          <input type="text" value={notificationSoldOutPieces} onChange={(e) => setNotificationSoldOutPieces(e.target.value)} onFocus={() => setProductActiveField('notificationSoldOutPieces')} className="border max-w-[80px] border-pos-border rounded-lg px-3 py-2 bg-pos-bg text-pos-text max-w-[120px]" />
                          <span className="text-pos-text text-md">pieces in advance</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center absolute top-[50%] left-0 right-0">
                    <button type="button" className="flex text-2xl items-center gap-4 px-5 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700" onClick={handleSaveProduct} disabled={savingProduct}>
                      <svg fill="#ffffff" width="20" height="20" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M-5.732,2.97-7.97.732a2.474,2.474,0,0,0-1.483-.7A.491.491,0,0,0-9.591,0H-18.5A2.5,2.5,0,0,0-21,2.5v11A2.5,2.5,0,0,0-18.5,16h11A2.5,2.5,0,0,0-5,13.5V4.737A2.483,2.483,0,0,0-5.732,2.97ZM-13,1V5.455h-3.591V1Zm-4.272,14V10.545h8.544V15ZM-6,13.5A1.5,1.5,0,0,1-7.5,15h-.228V10.045a.5.5,0,0,0-.5-.5h-9.544a.5.5,0,0,0-.5.5V15H-18.5A1.5,1.5,0,0,1-20,13.5V2.5A1.5,1.5,0,0,1-18.5,1h.909V5.955a.5.5,0,0,0,.5.5h7.5a.5.5,0,0,0,.5-.5v-4.8a1.492,1.492,0,0,1,.414.285l2.238,2.238A1.511,1.511,0,0,1-6,4.737Z" transform="translate(21)" /></svg>
                      Save
                    </button>
                  </div>
                </div>
              )}
              {productTab === 'Webshop' && (
                <div className="p-6 flex flex-col gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex text-xl flex-col gap-4">
                      <label className="flex items-center gap-2 text-pos-text">
                        In webshop:
                        <input type="checkbox" checked={productInWebshop} onChange={(e) => setProductInWebshop(e.target.checked)} className="w-8 h-8 ml-[100px] rounded border-pos-border" />
                      </label>
                      <label className="flex items-center gap-2 text-pos-text">
                        Online orderable:
                        <input type="checkbox" checked={webshopOnlineOrderable} onChange={(e) => setWebshopOnlineOrderable(e.target.checked)} className="w-8 h-8 ml-[57px] rounded border-pos-border" />
                      </label>
                      <div className='flex items-center gap-2'>
                        <label className="block text-pos-text mb-1 mr-[65px]">Website remark:</label>
                        <input type="text" value={websiteRemark} onChange={(e) => setWebsiteRemark(e.target.value)} onFocus={() => setProductActiveField('websiteRemark')} className="border max-w-[220px] border-pos-border rounded-lg px-3 py-2 bg-pos-bg text-pos-text" />
                      </div>
                      <div className='flex items-center gap-2'>
                        <label className="block text-pos-text mb-1 mr-[75px]">Website order:</label>
                        <input type="text" value={websiteOrder} onChange={(e) => setWebsiteOrder(e.target.value)} onFocus={() => setProductActiveField('websiteOrder')} className="border max-w-[220px] border-pos-border rounded-lg px-3 py-2 bg-pos-bg text-pos-text" />
                      </div>
                    </div>
                    <div className="flex text-xl flex-col gap-4">
                      <div className='flex items-center gap-2'>
                        <label className="block text-pos-text mb-1 mr-[70px]">Short web text:</label>
                        <input type="text" value={shortWebText} onChange={(e) => setShortWebText(e.target.value)} onFocus={() => setProductActiveField('shortWebText')} className="border max-w-[220px] border-pos-border rounded-lg px-3 py-2 bg-pos-bg text-pos-text" />
                      </div>
                      <div className='flex items-center gap-2'>
                        <label className="block text-pos-text mb-1 mr-[70px]">Website photo:</label>
                        <div className="flex items-center gap-2">
                          <label className="px-4 py-2 border border-pos-border rounded-lg text-pos-text hover:bg-pos-panel cursor-pointer shrink-0">
                            Choose File
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => setWebsitePhotoFileName(e.target.files?.[0]?.name ?? '')} />
                          </label>
                          <span className="text-pos-muted text-lg">{websitePhotoFileName || 'No file chosen'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <button type="button" className="flex items-center gap-2 px-5 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700" onClick={handleSaveProduct} disabled={savingProduct}>
                      <svg fill="#ffffff" width="20" height="20" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M-5.732,2.97-7.97.732a2.474,2.474,0,0,0-1.483-.7A.491.491,0,0,0-9.591,0H-18.5A2.5,2.5,0,0,0-21,2.5v11A2.5,2.5,0,0,0-18.5,16h11A2.5,2.5,0,0,0-5,13.5V4.737A2.483,2.483,0,0,0-5.732,2.97ZM-13,1V5.455h-3.591V1Zm-4.272,14V10.545h8.544V15ZM-6,13.5A1.5,1.5,0,0,1-7.5,15h-.228V10.045a.5.5,0,0,0-.5-.5h-9.544a.5.5,0,0,0-.5.5V15H-18.5A1.5,1.5,0,0,1-20,13.5V2.5A1.5,1.5,0,0,1-18.5,1h.909V5.955a.5.5,0,0,0,.5.5h7.5a.5.5,0,0,0,.5-.5v-4.8a1.492,1.492,0,0,1,.414.285l2.238,2.238A1.511,1.511,0,0,1-6,4.737Z" transform="translate(21)" /></svg>
                      Save
                    </button>
                  </div>
                </div>
              )}
              {productTab === 'Kiosk' && (
                <div className="p-6 flex flex-col  gap-6">
                  <div className="grid grid-cols-2 gap-4 text-xl">
                    <div className='flex flex-col gap-5'>
                      <div className='flex items-center gap-2'>
                        <label className="block w-[150px] text-pos-text mb-1">Kiosk info:</label>
                        <input type="text" value={kioskInfo} onChange={(e) => setKioskInfo(e.target.value)} onFocus={() => setProductActiveField('kioskInfo')} className="border border-pos-border rounded-lg px-3 py-2 bg-pos-bg text-pos-text" />
                      </div>
                      <label className="flex items-center gap-2 text-pos-text">
                        Kiosk take away:
                        <input type="checkbox" checked={kioskTakeAway} onChange={(e) => setKioskTakeAway(e.target.checked)} className="w-8 h-8 ml-4 rounded border-pos-border" />
                      </label>
                      <div className='flex items-center gap-2'>
                        <label className="block w-[150px] text-pos-text mb-1">Kiosk eat in:</label>
                        <input type="text" value={kioskEatIn} onChange={(e) => setKioskEatIn(e.target.value)} onFocus={() => setProductActiveField('kioskEatIn')} className="border border-pos-border rounded-lg px-3 py-2 bg-pos-bg text-pos-text max-w-md" />
                      </div>
                      <div className='flex items-center gap-2'>
                        <label className="block w-[150px] text-pos-text mb-1">Kiosk subtitle:</label>
                        <input type="text" value={kioskSubtitle} onChange={(e) => setKioskSubtitle(e.target.value)} onFocus={() => setProductActiveField('kioskSubtitle')} className="border border-pos-border rounded-lg px-3 py-2 bg-pos-bg text-pos-text" />
                      </div>
                      <div className='flex items-center gap-2'>
                        <label className="block text-pos-text w-[150px] mb-1">Kiosk min. subs:</label>
                        <Dropdown options={KIOSK_SUBS_OPTIONS} value={kioskMinSubs} onChange={setKioskMinSubs} className="min-w-[200px] border border-pos-border rounded-lg px-3 py-2 bg-pos-bg text-pos-text" />
                      </div>
                      <div className='flex items-center gap-2'>
                        <label className="block text-pos-text w-[150px] mb-1">Kiosk max. subs:</label>
                        <Dropdown options={KIOSK_SUBS_OPTIONS} value={kioskMaxSubs} onChange={setKioskMaxSubs} className="min-w-[200px]  border border-pos-border rounded-lg px-3 py-2 bg-pos-bg text-pos-text" />
                      </div>
                    </div>
                    <div className='flex items-start gap-2'>
                      <div className='flex items-center'>
                        <label className="block text-pos-text mb-1 pr-10">Kiosk picture:</label>
                        <div className="flex items-center gap-2">
                          <label className="px-4 py-2 border border-pos-border rounded-lg text-pos-text hover:bg-pos-panel cursor-pointer shrink-0">
                            Choose File
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => setKioskPictureFileName(e.target.files?.[0]?.name ?? '')} />
                          </label>
                          <span className="text-pos-muted text-lg pl-5">{kioskPictureFileName || 'No file chosen'}</span>
                        </div>

                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <button type="button" className="flex items-center gap-2 px-5 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700" onClick={handleSaveProduct} disabled={savingProduct}>
                      <svg fill="#ffffff" width="20" height="20" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M-5.732,2.97-7.97.732a2.474,2.474,0,0,0-1.483-.7A.491.491,0,0,0-9.591,0H-18.5A2.5,2.5,0,0,0-21,2.5v11A2.5,2.5,0,0,0-18.5,16h11A2.5,2.5,0,0,0-5,13.5V4.737A2.483,2.483,0,0,0-5.732,2.97ZM-13,1V5.455h-3.591V1Zm-4.272,14V10.545h8.544V15ZM-6,13.5A1.5,1.5,0,0,1-7.5,15h-.228V10.045a.5.5,0,0,0-.5-.5h-9.544a.5.5,0,0,0-.5.5V15H-18.5A1.5,1.5,0,0,1-20,13.5V2.5A1.5,1.5,0,0,1-18.5,1h.909V5.955a.5.5,0,0,0,.5.5h7.5a.5.5,0,0,0,.5-.5v-4.8a1.492,1.492,0,0,1,.414.285l2.238,2.238A1.511,1.511,0,0,1-6,4.737Z" transform="translate(21)" /></svg>
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>
            {/* Keyboard fixed at bottom in every tab */}
            <div className="shrink-0">
              <KeyboardWithNumpad value={productKeyboardValue} onChange={productKeyboardOnChange} />
            </div>
          </div>
        </div>
      )}

      {/* Product search keyboard modal */}
      {showProductSearchKeyboard && subNavId === 'Products' && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setShowProductSearchKeyboard(false)}>
          <div className="bg-pos-bg rounded-t-xl shadow-2xl w-full max-w-[1415px] overflow-hidden flex flex-col max-h-[70vh]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-end px-4 py-3 bg-pos-panel border-b border-pos-border shrink-0">
              <button type="button" className="p-2 rounded text-pos-text hover:bg-pos-bg" onClick={() => setShowProductSearchKeyboard(false)} aria-label="Close">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-4 shrink-0">
              <KeyboardWithNumpad value={productSearch} onChange={setProductSearch} />
            </div>
          </div>
        </div>
      )}

      {/* New / Edit subproduct modal */}
      {showSubproductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={closeSubproductModal}>
          <div className="bg-pos-bg rounded-xl shadow-2xl max-w-[700px] w-full mx-4 overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="w-full flex items-center justify-between px-6 py-4 bg-pos-panel border-b border-pos-border shrink-0">
              <span className="text-xl font-medium text-pos-text">{editingSubproductId ? 'Edit subproduct' : 'New subproduct'}</span>
              <button type="button" className="p-2 rounded text-pos-text hover:bg-pos-bg" onClick={closeSubproductModal} aria-label="Close">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 flex flex-col gap-6 w-full">
              <div className="flex gap-2 w-full items-center">
                <label className="block text-xl w-[120px] font-medium text-gray-200 shrink-0">Name :</label>
                <input
                  type="text"
                  readOnly
                  value={subproductName}
                  placeholder="Enter name"
                  className="flex-1 px-4 bg-pos-panel h-[56px] py-3 text-xl border border-gray-300 rounded-lg text-gray-200"
                />
              </div>
              <div className="flex justify-center">
                <button
                  type="button"
                  className="flex items-center text-3xl gap-3 px-6 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50"
                  disabled={savingSubproduct}
                  onClick={handleSaveSubproduct}
                >
                  <svg fill="#ffffff" width="24" height="24" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M-5.732,2.97-7.97.732a2.474,2.474,0,0,0-1.483-.7A.491.491,0,0,0-9.591,0H-18.5A2.5,2.5,0,0,0-21,2.5v11A2.5,2.5,0,0,0-18.5,16h11A2.5,2.5,0,0,0-5,13.5V4.737A2.483,2.483,0,0,0-5.732,2.97ZM-13,1V5.455h-3.591V1Zm-4.272,14V10.545h8.544V15ZM-6,13.5A1.5,1.5,0,0,1-7.5,15h-.228V10.045a.5.5,0,0,0-.5-.5h-9.544a.5.5,0,0,0-.5.5V15H-18.5A1.5,1.5,0,0,1-20,13.5V2.5A1.5,1.5,0,0,1-18.5,1h.909V5.955a.5.5,0,0,0,.5.5h7.5a.5.5,0,0,0,.5-.5v-4.8a1.492,1.492,0,0,1,.414.285l2.238,2.238A1.511,1.511,0,0,1-6,4.737Z" transform="translate(21)" /></svg>
                  Save
                </button>
              </div>
            </div>
            <KeyboardWithNumpad value={subproductName} onChange={setSubproductName} />
          </div>
        </div>
      )}

      {/* Manage Groups modal */}
      {showManageGroupsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowManageGroupsModal(false)}>
          <div className="bg-pos-bg rounded-xl shadow-2xl max-w-[600px] w-full mx-4 max-h-[80vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="w-full flex items-center justify-between px-6 py-4 bg-pos-panel border-b border-pos-border shrink-0">
              <span className="text-xl font-medium text-pos-text">Manage Groups</span>
              <button type="button" className="p-2 rounded text-pos-text hover:bg-pos-bg" onClick={() => setShowManageGroupsModal(false)} aria-label="Close">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-4 overflow-auto">
              {showAddGroupInline ? (
                <div className="flex gap-2 items-center mb-4">
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Group name"
                    className="flex-1 px-4 py-2 bg-pos-panel border border-pos-border rounded-lg text-pos-text text-xl"
                    autoFocus
                  />
                  <button type="button" className="px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50" disabled={savingGroup} onClick={handleAddGroup}>Save</button>
                  <button type="button" className="px-4 py-2 rounded-lg bg-pos-panel border border-pos-border text-pos-text" onClick={() => { setShowAddGroupInline(false); setNewGroupName(''); }}>Cancel</button>
                </div>
              ) : (
                <button type="button" className="mb-4 px-4 py-2 rounded-lg text-xl font-medium bg-pos-panel border border-pos-border text-pos-text hover:bg-pos-bg" onClick={() => setShowAddGroupInline(true)}>Add group</button>
              )}
              <ul className="w-full">
                {subproductGroups.map((grp) => (
                  <li key={grp.id} className="flex items-center w-full px-3 py-2 border-b border-pos-border text-pos-text w-[300px] gap-2">
                    {editingGroupId === grp.id ? (
                      <>
                        <input
                          type="text"
                          value={editingGroupName}
                          onChange={(e) => setEditingGroupName(e.target.value)}
                          className="flex-1 px-3 py-2 bg-pos-panel border border-pos-border rounded text-pos-text"
                          autoFocus
                        />
                        <button type="button" className="px-3 py-1 rounded bg-green-600 text-white text-sm disabled:opacity-50" disabled={savingGroup} onClick={handleSaveEditGroup}>Save</button>
                        <button type="button" className="px-3 py-1 rounded bg-pos-panel border border-pos-border text-pos-text text-sm" onClick={() => { setEditingGroupId(null); setEditingGroupName(''); }}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 font-medium">{grp.name}</span>
                        <button type="button" className="p-1.5 rounded text-pos-text hover:bg-pos-panel" onClick={() => { setEditingGroupId(grp.id); setEditingGroupName(grp.name || ''); }} aria-label="Edit">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button type="button" className="p-1.5 rounded text-pos-text hover:bg-pos-panel" onClick={() => setDeleteConfirmGroupId(grp.id)} aria-label="Delete">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Logout confirmation modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowLogoutModal(false)}>
          <div className="bg-pos-panel border border-pos-border rounded-xl shadow-xl p-8 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <p className="text-pos-text text-xl mb-8 text-center">Are you sure you want to log out?</p>
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
