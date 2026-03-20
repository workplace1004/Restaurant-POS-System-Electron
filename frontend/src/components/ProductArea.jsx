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
  const PAGE_SIZE = 25; // 5 x 5, same as positioning modal
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
        if (list.length === 0) {
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
      <div className="flex items-center justify-center gap-10 mb-1">
        <button
          type="button"
          className="w-10 h-10 flex items-center justify-center bg-pos-panel border-none text-pos-text text-2xl rounded hover:bg-pos-surface"
          onClick={goPrev}
          aria-label={t('previous')}
        >
          ‹
        </button>
        <div className="flex gap-10">
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
          className="w-10 h-10 flex items-center justify-center bg-pos-panel border-none text-pos-text text-2xl rounded hover:bg-pos-surface"
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
          <div className="grid grid-cols-5 gap-3 content-start">
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
                    className="min-h-[70px] rounded-lg bg-transparent"
                  />
                );
              }
              return (
                <button
                  type="button"
                  key={`${product.id}-${idx}`}
                  style={tileStyle}
                  className={`flex flex-row items-center gap-5 justify-center px-3 border-none rounded-lg text-xl min-h-[70px] max-h-[70px] hover:bg-pos-rowHover ${tileStyle ? '' : 'bg-pos-panel'} ${selectedProduct?.id === product.id ? 'ring-2 ring-pos-text' : ''
                    }`}
                  onClick={() => handleProductPress(product)}
                >
                  {product.kassaPhotoPath ? (
                    <img
                      src={product.kassaPhotoPath}
                      alt={product.name}
                      className="max-w-[50px] min-w-[50px] max-h-[50px] min-h-[50px] object-cover rounded"
                    />
                  ) : null}
                  <div className="flex flex-col items-start justify-center">
                    <span className="text-xl">{product.name}</span>
                    <span className="font-semibold text-2xl">€{Number(product.price).toFixed(2)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
      <div className="mt-3 min-h-[70px] max-h-[70px] overflow-auto">
        {selectedProduct && loadingSubproducts ? (
          <div className="h-full flex items-center justify-center text-pos-surface text-lg">
            {t('loadingSubproducts')}
          </div>
        ) : null}
        {selectedProduct && !loadingSubproducts && subproducts.length > 0 ? (
          <div className="grid grid-cols-5 gap-3 content-start max-h-[120px]">
            {paginatedSubproducts.map((subproduct) => (
              <button
                type="button"
                key={subproduct.id}
                className="flex items-center justify-center p-4 bg-pos-surface border-none rounded-lg text-pos-text text-xl min-h-[110px] hover:bg-pos-rowHover"
                onClick={() => handleSubproductPress(subproduct)}
              >
                {subproduct?.kioskPicture ? (
                  <img
                    src={subproduct.kioskPicture}
                    alt={subproduct.name}
                    className="max-w-[100px] min-w-[100px] max-h-[80px] min-h-[80px] object-cover rounded"
                  />
                ) : null}
                <div className="flex flex-col w-full items-center justify-center">
                  <span>{subproduct.name}</span>
                  <span className="font-semibold text-pos-text text-xl">
                    €{Number(subproduct?.price != null ? subproduct.price : selectedProduct?.price ?? 0).toFixed(2)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : null}
        {selectedProduct && !loadingSubproducts && subproducts.length > 0 ? (
          <div className="flex items-center justify-center gap-10 mt-2">
            <button
              type="button"
              className="w-10 h-10 flex items-center justify-center bg-pos-panel border-none text-pos-text text-2xl rounded hover:bg-pos-surface"
              onClick={goSubPrev}
              aria-label={t('previousSubproducts')}
            >
              ‹
            </button>
            <div className="flex gap-10">
              {Array.from({ length: subTotalPages }, (_, i) => (
                <span
                  key={`sub-page-${i}`}
                  className={`w-3 h-3 rounded-full cursor-pointer ${i === subPage ? 'bg-pos-text' : 'bg-pos-surface'}`}
                  onClick={() => setSubPage(i)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setSubPage(i)}
                  aria-label={`${t('subproductsPage')} ${i + 1}`}
                />
              ))}
            </div>
            <button
              type="button"
              className="w-10 h-10 flex items-center justify-center bg-pos-panel border-none text-pos-text text-2xl rounded hover:bg-pos-surface"
              onClick={goSubNext}
              aria-label={t('nextSubproducts')}
            >
              ›
            </button>
          </div>
        ) : null}
      </div>
    </main>
  );
}
