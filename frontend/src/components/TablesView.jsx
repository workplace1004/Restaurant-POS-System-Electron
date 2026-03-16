import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export function TablesView({ tables = [], selectedTableId = null, onSelectTable, onBack, time }) {
  const { t } = useLanguage();
  const handleSelectAndClose = (table) => {
    onSelectTable?.(table);
    onBack?.();
  };

  return (
    <div className="flex flex-col h-full bg-[#b0b0b0] text-pos-text">
      <div className="px-4 py-5 bg-pos-bg flex justify-end items-center text-2xl">
        {time != null ? <span className="text-3xl">{time}</span> : null}
      </div>

      <div className="flex-1 overflow-auto p-6 bg-pos-bg">
        <div className="flex flex-wrap gap-6 content-start">
          {tables.map((table) => {
            const id = String(table?.id);
            const isSelected = selectedTableId != null && String(selectedTableId) === id;
            const tableNumber = String(table?.name ?? id).replace(/^Table\s*/i, '') || id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleSelectAndClose(table)}
                className={`w-[200px] h-[200px] relative overflow-hidden rounded-[4px] border-2 transition-colors ${
                  isSelected ? 'border-[#e67e22]' : 'border-transparent'
                }`}
              >
                <img src="/table.png" alt={`Table ${tableNumber}`} className="w-full h-full object-contain" />
                <span className="absolute inset-0 flex items-center justify-center text-[40px] font-bold text-[#3fa666] -mt-10 pointer-events-none">
                  {tableNumber}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-around text-3xl px-4 py-3 bg-pos-panel">
        <button type="button" className="py-2 px-3 hover:bg-pos-rowHover" onClick={onBack}>
          {t('backName')}
        </button>
        <button type="button" className="py-2 px-3 hover:bg-pos-rowHover">
          {t('nextCourse')}
        </button>
        <button type="button" className="py-2 px-3 hover:bg-pos-rowHover">
          {t('name')}
        </button>
        <button type="button" className="py-2 px-3 hover:bg-pos-rowHover">
          {t('room1')}
        </button>
        <button type="button" className="py-2 px-3 hover:bg-pos-rowHover" onClick={() => handleSelectAndClose(null)}>
          {t('noTable')}
        </button>
      </div>
    </div>
  );
}
