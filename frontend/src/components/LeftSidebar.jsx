import React from 'react';

export function LeftSidebar({ categories, selectedCategoryId, onSelectCategory }) {
  return (
    <aside className="w-[300px] shrink-0 flex flex-col bg-pos-bg p-4 px-2">

      <div className="flex items-center justify-center h-[80px] mb-4">
        <div className="text-5xl font-semibold text-pos-text">CloudPOS</div>
      </div>
      <div className="flex flex-col gap-1 flex-1 overflow-auto">
        {categories.map((cat) => (
          <button
            type="button"
            key={cat.id}
            className={`flex items-center gap-2 text-left px-4 py-5 rounded-md text-pos-text text-2xl hover:bg-pos-panel ${selectedCategoryId === cat.id ? 'bg-pos-panel font-medium' : 'bg-transparent'
              }`}
            onClick={() => onSelectCategory(cat.id)}
          >
            {selectedCategoryId === cat.id ? (
              <span className="text-pos-text text-3xl pr-2 font-normal" aria-hidden>→</span>
            ) : <div className="pl-[34px]" />}
            {cat.name}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-5 items-center">
        <div className="px-4 py-4 text-center">
          <div className="text-3xl mb-6">admin</div>
          <button type="button" className="bg-transparent border-none text-pos-muted text-3xl p-0 hover:text-pos-text">
            Log out
          </button>
        </div>
        <div className="px-10 py-6 border-t border-pos-border border-gray-500">
          <div className="text-3xl text-pos-muted">Control</div>
        </div>
      </div>
      <div className="text-center text-3xl text-pos-muted">
        <span className="text-4xl pr-1">☁</span>
        RestaurantPOS
      </div>
    </aside>
  );
}
