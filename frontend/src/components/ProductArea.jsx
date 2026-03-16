import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export function ProductArea({
  products,
  selectedCategoryId,
  categories,
  onSelectCategory,
  onAddProduct,
  currentOrderId,
  fetchSubproductsForProduct
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
  const perPage = 8;
  const totalPages = Math.max(1, Math.ceil(products.length / perPage));
  const paginated = products.slice(page * perPage, page * perPage + perPage);

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
      <div className="max-h-[300px] min-h-[160px] p-1 grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3 content-start overflow-auto">
        {paginated.length === 0 ? (
          <div className="col-span-full flex items-center justify-center text-pos-surface text-lg min-h-[120px]">
            {t('selectCategoryToSeeProducts')}
          </div>
        ) : (
          paginated.map((product) => (
            <button
              type="button"
              key={product.id}
              className={`flex flex-col items-center justify-center p-4 bg-pos-panel border-none rounded-lg text-pos-text text-2xl min-h-[88px] hover:bg-pos-rowHover ${selectedProduct?.id === product.id ? 'ring-2 ring-pos-text' : ''
                }`}
              onClick={() => handleProductPress(product)}
            >
              {product.kassaPhotoPath ? (
                <img
                  src={product.kassaPhotoPath}
                  alt={product.name}
                  className="w-full h-[88px] object-cover rounded mb-2"
                />
              ) : null}
              <span className="mb-1">{product.name}</span>
              <span className="font-semibold text-pos-text-dim text-xl">€{Number(product.price).toFixed(2)}</span>
            </button>
          ))
        )}
      </div>
      <div className="flex-1 min-h-[120px] mt-3 overflow-auto">
        {selectedProduct && loadingSubproducts ? (
          <div className="h-full flex items-center justify-center text-pos-surface text-lg">
            Loading subproducts...
          </div>
        ) : null}
        {selectedProduct && !loadingSubproducts && subproducts.length > 0 ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3 content-start">
            {subproducts.map((subproduct) => (
              <button
                type="button"
                key={subproduct.id}
                className="flex flex-col items-center justify-center p-4 bg-pos-surface border-none rounded-lg text-pos-text text-xl min-h-[82px] hover:bg-pos-rowHover"
                onClick={() => handleSubproductPress(subproduct)}
              >
                {subproduct?.kioskPicture ? (
                  <img
                    src={subproduct.kioskPicture}
                    alt={subproduct.name}
                    className="w-full h-[64px] object-cover rounded mb-2"
                  />
                ) : null}
                <span className="mb-1">{subproduct.name}</span>
                <span className="font-semibold text-pos-text-dim text-lg">
                  €{Number(subproduct?.price != null ? subproduct.price : selectedProduct?.price ?? 0).toFixed(2)}
                </span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </main>
  );
}
