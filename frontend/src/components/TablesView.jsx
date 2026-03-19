import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const TABLE_SIZE = 200;
const TABLE_GAP = 24;
const TABLE_POSITIONS_STORAGE_KEY = 'pos.tables.positions';
const TABLE_LAST_PAID_AT_STORAGE_KEY = 'pos.tables.lastPaidAtById';
const TABLE_PAID_HIGHLIGHT_WINDOW_MS = 15 * 60 * 1000;

export function TablesView({ tables = [], selectedTableId = null, onSelectTable, onBack, time }) {
  const { t } = useLanguage();
  const canvasRef = useRef(null);
  const [positions, setPositions] = useState({});
  const [positionsReady, setPositionsReady] = useState(false);
  const [lastPaidAtByTableId, setLastPaidAtByTableId] = useState({});

  const tableIds = useMemo(
    () => tables.filter((table) => table && table.id != null).map((table) => String(table.id)),
    [tables]
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem(TABLE_POSITIONS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') setPositions(parsed);
      }
    } catch {
      // Ignore invalid cached positions.
    } finally {
      setPositionsReady(true);
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(TABLE_LAST_PAID_AT_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      setLastPaidAtByTableId(parsed && typeof parsed === 'object' ? parsed : {});
    } catch {
      setLastPaidAtByTableId({});
    }
  }, [tables]);

  useEffect(() => {
    if (tableIds.length === 0) return;
    setPositions((prev) => {
      const next = {};
      for (const id of tableIds) {
        if (prev[id]) next[id] = prev[id];
      }
      const width = canvasRef.current?.clientWidth || 1200;
      const cols = Math.max(1, Math.floor((width + TABLE_GAP) / (TABLE_SIZE + TABLE_GAP)));
      let nextSlot = 0;
      for (const id of tableIds) {
        if (next[id]) continue;
        const col = nextSlot % cols;
        const row = Math.floor(nextSlot / cols);
        next[id] = { x: col * (TABLE_SIZE + TABLE_GAP), y: row * (TABLE_SIZE + TABLE_GAP) };
        nextSlot += 1;
      }
      return next;
    });
  }, [tableIds]);

  useEffect(() => {
    if (!positionsReady || tableIds.length === 0) return;
    try {
      localStorage.setItem(TABLE_POSITIONS_STORAGE_KEY, JSON.stringify(positions));
    } catch {
      // Ignore storage errors.
    }
  }, [positions, positionsReady, tableIds.length]);

  const handleSelectAndClose = (table) => {
    onSelectTable?.(table);
    onBack?.();
  };

  const contentHeight = useMemo(() => {
    const ys = Object.values(positions).map((item) => item?.y || 0);
    const maxY = ys.length ? Math.max(...ys) : 0;
    return Math.max(400, maxY + TABLE_SIZE + TABLE_GAP);
  }, [positions]);

  return (
    <div className="flex flex-col h-full bg-[#b0b0b0] text-pos-text">
      <div className="px-4 py-5 bg-pos-bg flex justify-end items-center text-2xl">
        {time != null ? <span className="text-3xl">{time}</span> : null}
      </div>

      <div className="flex-1 overflow-auto p-6 bg-pos-bg">
        <div ref={canvasRef} className="relative w-full" style={{ minHeight: `${contentHeight}px` }}>
          {tables.map((table) => {
            if (!table || table.id == null) return null;
            const id = String(table?.id);
            const isSelected = selectedTableId != null && String(selectedTableId) === id;
            const tableNumber = String(table?.name ?? id).replace(/^Table\s*/i, '') || id;
            const pos = positions[id] || { x: 0, y: 0 };
            const hasOpenOrders = Array.isArray(table?.orders) && table.orders.length > 0;
            const lastPaidAt = Number(lastPaidAtByTableId?.[id]) || 0;
            const wasPaidRecently = !hasOpenOrders && lastPaidAt > 0 && Date.now() - lastPaidAt <= TABLE_PAID_HIGHLIGHT_WINDOW_MS;
            const tableNumberColorClass = hasOpenOrders
              ? 'text-red-500'
              : wasPaidRecently
                ? 'text-[#3fa666]'
                : 'text-black';
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleSelectAndClose(table)}
                className={`w-[200px] h-[200px] absolute overflow-hidden rounded-[4px] border-2 transition-colors ${
                  isSelected ? 'border-[#e67e22]' : 'border-transparent'
                } cursor-pointer`}
                style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
              >
                <img src="/table.png" alt={`${t('table')} ${tableNumber}`} className="w-full h-full object-contain" />
                <span
                  className={`absolute inset-0 flex items-center justify-center text-[40px] font-bold -mt-10 pointer-events-none ${tableNumberColorClass}`}
                >
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
