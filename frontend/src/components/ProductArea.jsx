import React, { useState } from 'react';

export function ProductArea({
  products,
  selectedCategoryId,
  categories,
  onSelectCategory,
  onAddProduct,
  currentOrderId
}) {
  const [page, setPage] = useState(0);
  const perPage = 8;
  const totalPages = Math.max(1, Math.ceil(products.length / perPage));
  const paginated = products.slice(page * perPage, page * perPage + perPage);

  const goPrev = () => setPage((p) => Math.max(0, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages - 1, p + 1));

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
              className={`w-3 h-3 rounded-full cursor-pointer ${
                i === page ? 'bg-pos-text' : 'bg-pos-surface'
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
      <div className="flex-1 grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3 content-start overflow-auto">
        {paginated.length === 0 ? (
          <div className="col-span-full flex items-center justify-center text-pos-surface text-lg min-h-[120px]">
            Select a category to see products
          </div>
        ) : (
          paginated.map((product) => (
            <button
              type="button"
              key={product.id}
              className="flex flex-col items-center justify-center p-4 bg-pos-panel border-none rounded-lg text-pos-text text-lg min-h-[88px] hover:bg-pos-rowHover"
              onClick={() => onAddProduct(product)}
            >
              <span className="mb-1">{product.name}</span>
              <span className="font-semibold text-pos-text-dim text-base">€{Number(product.price).toFixed(2)}</span>
            </button>
          ))
        )}
      </div>
    </main>
  );
}
