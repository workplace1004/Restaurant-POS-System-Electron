import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export function ProductArea({
  products,
  selectedCategoryId,
  categories,
  onSelectCategory,
  onAddProduct,
  currentOrderId,
  fetchSubproductsForProduct,
  positioningLayoutByCategory,
  positioningColorByCategory,
  appendSubproductNoteToItem
}) {
  const { t } = useLanguage();
  const [page, setPage] = useState(0);
  const [subPage, setSubPage] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOrderItemId, setSelectedOrderItemId] = useState(null);
  const [subproducts, setSubproducts] = useState([]);
  const [loadingSubproducts, setLoadingSubproducts] = useState(false);
  const [showSubproductModal, setShowSubproductModal] = useState(false);
  const subproductsRequestIdRef = useRef(0);
  const getSubproductExtra = useCallback(() => {
    try {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('pos_subproduct_extra') : null;
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }, []);
  const productById = new Map(products.map((p) => [p.id, p]));
  const layoutForCategory = Array.isArray(positioningLayoutByCategory?.[selectedCategoryId])
    ? positioningLayoutByCategory[selectedCategoryId]
    : null;
  const colorForCategory = positioningColorByCategory?.[selectedCategoryId] || {};
  const PAGE_SIZE = 40; // 5 x 8, same as positioning modal
  const totalPages = Math.max(1, Math.ceil((layoutForCategory?.length || PAGE_SIZE) / PAGE_SIZE));
  const pageStart = page * PAGE_SIZE;
  const pageCells = Array.from({ length: PAGE_SIZE }, (_, i) => layoutForCategory?.[pageStart + i] || null);

  const goPrev = () => setPage((p) => Math.max(0, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages - 1, p + 1));
  const SUBPRODUCTS_PER_PAGE = 5;
  const subTotalPages = Math.max(1, Math.ceil(subproducts.length / SUBPRODUCTS_PER_PAGE));
  const paginatedSubproducts = subproducts.slice(
    subPage * SUBPRODUCTS_PER_PAGE,
    subPage * SUBPRODUCTS_PER_PAGE + SUBPRODUCTS_PER_PAGE
  );
  const goSubPrev = () => setSubPage((p) => Math.max(0, p - 1));
  const goSubNext = () => setSubPage((p) => Math.min(subTotalPages - 1, p + 1));

  useEffect(() => {
    // Category switch should always clear selected product and subproducts panel.
    subproductsRequestIdRef.current += 1;
    setSelectedProduct(null);
    setSelectedOrderItemId(null);
    setSubproducts([]);
    setShowSubproductModal(false);
    setLoadingSubproducts(false);
    setPage(0);
    setSubPage(0);
  }, [selectedCategoryId]);

  useEffect(() => {
    setPage(0);
  }, [selectedCategoryId, layoutForCategory?.length]);

  useEffect(() => {
    setSubPage(0);
  }, [selectedProduct?.id, subproducts.length]);

  const handleProductPress = useCallback(
    async (product) => {
      if (!fetchSubproductsForProduct) {
        await onAddProduct(product);
        return;
      }
      const createdItemId = await onAddProduct(product);
      setSelectedOrderItemId(createdItemId || null);
      const requestId = subproductsRequestIdRef.current + 1;
      subproductsRequestIdRef.current = requestId;
      setSelectedProduct(product);
      setSubproducts([]);
      setLoadingSubproducts(true);
      try {
        const data = await fetchSubproductsForProduct(product.id);
        if (requestId !== subproductsRequestIdRef.current) return;
        const list = Array.isArray(data) ? data : [];
        const extraMap = getSubproductExtra();
        const withExtras = list.map((sp) => ({
          ...sp,
          kioskPicture: extraMap?.[sp.id]?.kioskPicture || ''
        }));
        setSubproducts(withExtras);
        if (list.length > 0) {
          setShowSubproductModal(true);
        } else {
          setSelectedProduct(null);
          setSelectedOrderItemId(null);
        }
      } catch {
        if (requestId !== subproductsRequestIdRef.current) return;
        setSelectedProduct(null);
        setSelectedOrderItemId(null);
        setSubproducts([]);
      } finally {
        if (requestId === subproductsRequestIdRef.current) {
          setLoadingSubproducts(false);
        }
      }
    },
    [fetchSubproductsForProduct, getSubproductExtra, onAddProduct]
  );

  const handleSubproductPress = useCallback(
    async (subproduct) => {
      if (!selectedProduct || !selectedOrderItemId) return;
      const note = subproduct?.name || '';
      if (!note) return;
      await appendSubproductNoteToItem?.(selectedOrderItemId, note, Number(subproduct?.price) || 0);
    },
    [appendSubproductNoteToItem, selectedOrderItemId, selectedProduct]
  );

  const closeSubproductModal = useCallback(() => {
    setShowSubproductModal(false);
    setSelectedProduct(null);
    setSelectedOrderItemId(null);
  }, []);

  const colorStyleById = {
    green: { backgroundColor: '#22c55e', color: '#ffffff' },
    blue: { backgroundColor: '#1d4ed8', color: '#ffffff' },
    pink: { backgroundColor: '#f9a8d4', color: '#ffffff' },
    orange: { backgroundColor: '#fdba74', color: '#ffffff' },
    yellow: { backgroundColor: '#fde047', color: '#ffffff' },
    gray: { backgroundColor: '#9ca3af', color: '#ffffff' }
  };

  return (
    <main className="flex-1 flex flex-col min-w-0 p-4 bg-pos-bg py-2">
      <div className="flex items-center justify-center gap-5 mb-1 text-lg">
        <button
          type="button"
          className="w-8 h-8 flex items-center justify-center bg-pos-panel border-none text-pos-text text-xl rounded hover:bg-pos-surface"
          onClick={goPrev}
          aria-label={t('previous')}
        >
          ‹
        </button>
        <div className="flex gap-5 text-lg">
          {Array.from({ length: totalPages }, (_, i) => (
            <span
              key={i}
              className={`w-3 h-3 rounded-full cursor-pointer ${i === page ? 'bg-pos-text' : 'bg-pos-surface'
                }`}
              onClick={() => setPage(i)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setPage(i)}
              aria-label={`${t('page')} ${i + 1}`}
            />
          ))}
        </div>
        <button
          type="button"
          className="w-8 h-8 flex items-center justify-center bg-pos-panel border-none text-pos-text text-xl rounded hover:bg-pos-surface"
          onClick={goNext}
          aria-label={t('next')}
        >
          ›
        </button>
      </div>
      <div className="p-1 overflow-auto">
        {!layoutForCategory ? (
          <div className="col-span-full flex items-center justify-center text-pos-surface text-lg min-h-[100px] max-h-[100px]">
            {t('selectCategoryToSeeProducts')}
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-1 content-start text-lg">
            {pageCells.map((entry, idx) => {
              const product = typeof entry === 'string' && entry.startsWith('p:')
                ? productById.get(entry.slice(2))
                : null;
              const absoluteIdx = pageStart + idx;
              const colorId = colorForCategory[String(absoluteIdx)];
              const tileStyle = colorStyleById[colorId] || undefined;
              if (!product) {
                return (
                  <div
                    key={`empty-${idx}`}
                    className="min-h-[70px] max-h-[70px] rounded-lg bg-transparent"
                  />
                );
              }
              return (
                <button
                  type="button"
                  key={`${product.id}-${idx}`}
                  style={tileStyle}
                  className={`flex relative flex-row items-center gap-1 justify-center px-1 border-none rounded-lg text-sm min-h-[70px] max-h-[70px] hover:bg-pos-rowHover ${tileStyle ? '' : 'bg-pos-panel'} ${selectedProduct?.id === product.id ? 'ring-2 ring-pos-text' : ''
                    }`}
                  onClick={() => handleProductPress(product)}
                >
                  {product.kassaPhotoPath ? (
                    <img
                      src={product.kassaPhotoPath}
                      alt={product.name}
                      className="max-w-[45px] absolute top-0 left-0 mt-1 ml-1 min-w-[45px] max-h-[45px] min-h-[45px] object-cover rounded"
                    />
                  ) : null}
                  <span className="text-sm absolute bottom-0 left-0 pb-1 pl-1 block max-w-[100px] break-words leading-tight">{product.name}</span>
                  <span className="font-semibold absolute top-0 right-0 pr-1 pt-1 text-sm">€{Number(product.price).toFixed(2)}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
