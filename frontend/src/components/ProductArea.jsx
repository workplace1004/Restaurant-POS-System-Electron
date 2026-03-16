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
  positioningLayoutByCategory
}) {
  const { t } = useLanguage();
  const [page, setPage] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
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
  const PAGE_SIZE = 30; // 5 x 6, same as positioning modal
  const totalPages = Math.max(1, Math.ceil((layoutForCategory?.length || PAGE_SIZE) / PAGE_SIZE));
  const pageStart = page * PAGE_SIZE;
  const pageCells = Array.from({ length: PAGE_SIZE }, (_, i) => layoutForCategory?.[pageStart + i] || null);

  const goPrev = () => setPage((p) => Math.max(0, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages - 1, p + 1));

  useEffect(() => {
    // Category switch should always clear selected product and subproducts panel.
    subproductsRequestIdRef.current += 1;
    setSelectedProduct(null);
    setSubproducts([]);
    setLoadingSubproducts(false);
    setPage(0);
  }, [selectedCategoryId]);

  useEffect(() => {
    setPage(0);
  }, [selectedCategoryId, layoutForCategory?.length]);

  const handleProductPress = useCallback(
    async (product) => {
      if (!fetchSubproductsForProduct) {
        onAddProduct(product);
        return;
      }
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
          onAddProduct(product);
          setSelectedProduct(null);
        }
      } catch {
        if (requestId !== subproductsRequestIdRef.current) return;
        onAddProduct(product);
        setSelectedProduct(null);
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
    (subproduct) => {
      if (!selectedProduct) return;
      const price = subproduct?.price != null ? Number(subproduct.price) : Number(selectedProduct.price);
      onAddProduct({
        ...selectedProduct,
        price,
        subproductName: subproduct?.name || ''
      });
    },
    [onAddProduct, selectedProduct]
  );

  return (
    <main className="flex-1 flex flex-col min-w-0 p-4 bg-pos-bg">
      <div className="flex items-center justify-center gap-4 mb-4">
        <button
          type="button"
          className="w-10 h-10 flex items-center justify-center bg-pos-panel border-none text-pos-text text-2xl rounded hover:bg-pos-surface"
          onClick={goPrev}
          aria-label="Previous"
        >
          ‹
        </button>
        <div className="flex gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <span
              key={i}
              className={`w-3 h-3 rounded-full cursor-pointer ${i === page ? 'bg-pos-text' : 'bg-pos-surface'
                }`}
              onClick={() => setPage(i)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setPage(i)}
              aria-label={`Page ${i + 1}`}
            />
          ))}
        </div>
        <button
          type="button"
          className="w-10 h-10 flex items-center justify-center bg-pos-panel border-none text-pos-text text-2xl rounded hover:bg-pos-surface"
          onClick={goNext}
          aria-label="Next"
        >
          ›
        </button>
      </div>
      <div className="max-h-[820px] min-h-[240px] p-1 overflow-auto">
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
              if (!product) {
                return (
                  <div
                    key={`empty-${idx}`}
                    className="min-h-[120px] rounded-lg bg-transparent"
                  />
                );
              }
              return (
                <button
                  type="button"
                  key={`${product.id}-${idx}`}
                  className={`flex flex-row items-center gap-5 justify-center px-3 bg-pos-panel border-none rounded-lg text-pos-text text-xl min-h-[120px] max-h-[120px] hover:bg-pos-rowHover ${selectedProduct?.id === product.id ? 'ring-2 ring-pos-text' : ''
                    }`}
                  onClick={() => handleProductPress(product)}
                >
                  {product.kassaPhotoPath ? (
                    <img
                      src={product.kassaPhotoPath}
                      alt={product.name}
                      className="max-w-[100px] min-w-[100px] max-h-[80px] min-h-[80px] object-cover rounded"
                    />
                  ) : null}
                  <div className="flex flex-col items-start justify-center">
                    <span>{product.name}</span>
                    <span className="font-semibold text-pos-text-dim text-xl">€{Number(product.price).toFixed(2)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
