import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { TableShapeSvg, getTableFill } from './TableShapeSvg';
import { LoadingSpinner } from './LoadingSpinner';

const TABLE_SIZE = 200;
const TABLE_GAP = 24;
const TABLE_POSITIONS_STORAGE_KEY = 'pos.tables.positions';
const TABLE_LAST_PAID_AT_STORAGE_KEY = 'pos.tables.lastPaidAtById';
const TABLE_PAID_HIGHLIGHT_WINDOW_MS = 15 * 60 * 1000;

const TABLE_TEMPLATE_OPTIONS = [
  { id: '4table', src: '/4table.svg' },
  { id: '5table', src: '/5table.svg' },
  { id: '6table', src: '/6table.svg' }
];

const ZOOM_MIN = 50;
const ZOOM_MAX = 150;
const ZOOM_STEP = 10;

export function TablesView({ tables = [], tableLayouts = {}, fetchTableLayouts, selectedTableId = null, onSelectTable, onBack, time, api = '/api' }) {
  const { t } = useLanguage();
  const canvasRef = useRef(null);
  const [rooms, setRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [layoutsLoading, setLayoutsLoading] = useState(true);
  const [positions, setPositions] = useState({});
  const [positionsReady, setPositionsReady] = useState(false);
  const [lastPaidAtByTableId, setLastPaidAtByTableId] = useState({});
  const [selectedRoomIndex, setSelectedRoomIndex] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [showRoomsModal, setShowRoomsModal] = useState(false);

  useEffect(() => {
    let alive = true;
    const loadLayouts = async () => {
      setLayoutsLoading(true);
      try {
        if (typeof fetchTableLayouts === 'function') await fetchTableLayouts();
      } finally {
        if (alive) setLayoutsLoading(false);
      }
    };
    loadLayouts();
    return () => {
      alive = false;
    };
  }, [fetchTableLayouts]);

  useEffect(() => {
    let alive = true;
    const loadRooms = async () => {
      setRoomsLoading(true);
      try {
        const res = await fetch(`${api}/rooms`);
        const data = await res.json().catch(() => []);
        if (!alive) return;
        setRooms(Array.isArray(data) ? data : []);
      } catch {
        if (!alive) return;
        setRooms([]);
      } finally {
        if (alive) setRoomsLoading(false);
      }
    };
    loadRooms();
    return () => {
      alive = false;
    };
  }, [api]);

  const sortedRooms = useMemo(() => {
    if (!rooms.length) return [];
    const roomHasTables = (room) => {
      const roomId = room?.id != null ? String(room.id) : null;
      if (!roomId) return false;
      return tables.some((t) => t && String(t?.roomId || '') === roomId);
    };
    const roomHasOpenOrders = (room) => {
      const roomId = room?.id != null ? String(room.id) : null;
      if (!roomId) return false;
      return tables.some((t) => t && String(t?.roomId || '') === roomId && Array.isArray(t?.orders) && t.orders.length > 0);
    };
    return [...rooms].sort((a, b) => {
      const aHasTables = roomHasTables(a);
      const bHasTables = roomHasTables(b);
      if (aHasTables && !bHasTables) return -1;
      if (!aHasTables && bHasTables) return 1;
      const aHasOpen = roomHasOpenOrders(a);
      const bHasOpen = roomHasOpenOrders(b);
      if (aHasOpen && !bHasOpen) return -1;
      if (!aHasOpen && bHasOpen) return 1;
      return 0;
    });
  }, [rooms, tables]);

  useEffect(() => {
    if (sortedRooms.length === 0) {
      setSelectedRoomIndex(0);
      return;
    }
    setSelectedRoomIndex((prev) => {
      if (prev < 0) return 0;
      if (prev >= sortedRooms.length) return 0;
      return prev;
    });
  }, [sortedRooms]);

  const currentRoom = sortedRooms?.length > 0 ? sortedRooms[selectedRoomIndex % sortedRooms.length] : null;
  const locationId = currentRoom?.id != null ? String(currentRoom.id) : null;
  const layout = locationId && tableLayouts?.[locationId] && typeof tableLayouts[locationId] === 'object' ? tableLayouts[locationId] : null;
  const layoutTables = layout?.tables && Array.isArray(layout.tables) ? layout.tables : [];
  const useLayoutMode = layoutTables.length > 0;

  const tablesForCurrentRoom = useMemo(() => {
    if (!locationId) return [];
    return tables.filter((table) => table && table.id != null && String(table?.roomId || '') === String(locationId));
  }, [tables, locationId]);

  const tableIds = useMemo(
    () => (useLayoutMode ? [] : tablesForCurrentRoom.map((table) => String(table.id))),
    [useLayoutMode, tablesForCurrentRoom]
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

  const handleSelectAndClose = (table, options) => {
    onSelectTable?.(table, options);
    onBack?.();
  };

  const contentHeight = useMemo(() => {
    const ys = Object.values(positions).map((item) => item?.y || 0);
    const maxY = ys.length ? Math.max(...ys) : 0;
    return Math.max(400, maxY + TABLE_SIZE + TABLE_GAP);
  }, [positions]);

  const layoutCanvasHeight = layout?.floorHeight ? Math.max(400, Number(layout.floorHeight)) : 654;
  const layoutCanvasWidth = layout?.floorWidth ? Math.max(400, Number(layout.floorWidth)) : 2048;

  const handleNextRoom = () => {
    if (sortedRooms.length === 0) return;
    setSelectedRoomIndex((prev) => (prev + 1) % sortedRooms.length);
  };

  const showLoading = roomsLoading || layoutsLoading;

  if (showLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-pos-bg">
        <LoadingSpinner label={t('loadingTables')} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#b0b0b0] text-pos-text">
      <div className="px-4 py-5 bg-pos-bg flex justify-between items-center text-2xl gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="w-10 h-10 rounded-lg border border-pos-border bg-pos-panel active:bg-green-500 text-xl font-bold"
            onClick={() => setZoom((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP))}
            aria-label="Zoom out"
          >
            −
          </button>
          <span className="min-w-[3ch] text-center text-lg">{zoom}%</span>
          <button
            type="button"
            className="w-10 h-10 rounded-lg border border-pos-border bg-pos-panel active:bg-green-500 text-xl font-bold"
            onClick={() => setZoom((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP))}
            aria-label="Zoom in"
          >
            +
          </button>
        </div>
        {time != null ? <span className="text-3xl">{time}</span> : null}
      </div>

      <div className="flex-1 overflow-hidden p-6 bg-pos-bg">
        <div
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: '0 0'
          }}
        >
          <div
            ref={canvasRef}
            className="relative w-full"
            style={{
              minHeight: useLayoutMode ? `${layoutCanvasHeight}px` : `${contentHeight}px`,
              ...(useLayoutMode ? { minWidth: `${layoutCanvasWidth}px` } : {})
            }}
          >
          {useLayoutMode ? (
            <>
              {layoutTables.map((layoutTable, idx) => {
                const sizeStyle = layoutTable.round
                  ? { width: `${Math.max(70, layoutTable.width)}px`, height: `${Math.max(70, layoutTable.width)}px` }
                  : { width: `${layoutTable.width || 130}px`, height: `${layoutTable.height || 155}px` };
                const matchedTable = tables.find((table) => {
                  const nameMatch = String(table?.name || '').trim().toLowerCase() === String(layoutTable?.name || '').trim().toLowerCase();
                  if (!nameMatch) return false;
                  if (locationId != null && table?.roomId != null) return table.roomId === locationId;
                  return true;
                }) || null;
                const id = matchedTable?.id != null ? String(matchedTable.id) : layoutTable.id;
                const isSelected = selectedTableId != null && String(selectedTableId) === id;
                const tableNumber = String(layoutTable?.name ?? currentRoom?.name ?? id).replace(/^Table\s*/i, '') || String(idx + 1);
                const hasOpenOrders = matchedTable && Array.isArray(matchedTable?.orders) && matchedTable.orders.length > 0;
                const lastPaidAt = Number(lastPaidAtByTableId?.[id]) || 0;
                const wasPaidRecently = !hasOpenOrders && lastPaidAt > 0 && Date.now() - lastPaidAt <= TABLE_PAID_HIGHLIGHT_WINDOW_MS;
                const tableNumberColorClass = 'text-white';
                const tableFill = getTableFill(hasOpenOrders, wasPaidRecently);
                return (
                  <button
                    key={layoutTable.id || id}
                    type="button"
                    onClick={() =>
                      handleSelectAndClose(matchedTable, {
                        tableLabel: layoutTable?.name ?? tableNumber,
                        roomName: currentRoom?.name ?? null
                      })
                    }
                    className={`absolute flex items-center justify-center font-semibold border-2 text-white overflow-hidden ${
                      layoutTable.round ? 'rounded-full' : 'rounded-md'
                    } border-transparent cursor-pointer`}
                    style={{
                      left: `${Math.max(0, Number(layoutTable.x) || 0)}px`,
                      top: `${Math.max(0, Number(layoutTable.y) || 0)}px`,
                      transform: `rotate(${Number(layoutTable.rotation) || 0}deg)`,
                      zIndex: 20,
                      ...sizeStyle
                    }}
                  >
                    <span className="absolute inset-0 w-full h-full pointer-events-none">
                      <TableShapeSvg
                        templateType={layoutTable.templateType || '4table'}
                        tableFill={tableFill}
                        className="w-full h-full object-contain"
                        idPrefix={layoutTable.id || id || `idx-${idx}`}
                      />
                    </span>
                    <span className={`relative z-10 text-2xl font-bold drop-shadow-[0_1px_1px_rgba(0,0,0,0.7)] ${tableNumberColorClass}`}>{tableNumber}</span>
                  </button>
                );
              })}
              {layoutTables.map((layoutTable) =>
                (Array.isArray(layoutTable.boards) ? layoutTable.boards : []).map((board) => (
                  <div
                    key={board.id || `board-${layoutTable.id}-${board.x}-${board.y}`}
                    className="absolute border border-pos-border opacity-75"
                    style={{
                      left: `${Math.max(0, Number(board.x) || 0)}px`,
                      top: `${Math.max(0, Number(board.y) || 0)}px`,
                      width: `${Math.max(10, Number(board.width) || 120)}px`,
                      height: `${Math.max(10, Number(board.height) || 120)}px`,
                      transform: `rotate(${Number(board.rotation) || 0}deg)`,
                      zIndex: 10,
                      backgroundColor: board.color || '#facc15'
                    }}
                  />
                ))
              )}
              {layoutTables.map((layoutTable) =>
                (Array.isArray(layoutTable.flowerPots) ? layoutTable.flowerPots : []).map((fp) => (
                  <div
                    key={fp.id || `fp-${layoutTable.id}-${fp.x}-${fp.y}`}
                    className="absolute border border-transparent"
                    style={{
                      left: `${Math.max(0, Number(fp.x) || 0)}px`,
                      top: `${Math.max(0, Number(fp.y) || 0)}px`,
                      width: `${Math.max(10, Number(fp.width) || 60)}px`,
                      height: `${Math.max(10, Number(fp.height) || 72)}px`,
                      transform: `rotate(${Number(fp.rotation) || 0}deg)`,
                      zIndex: 15
                    }}
                  >
                    <img src="/flowerpot.svg" alt="" className="w-full h-full object-contain" />
                  </div>
                ))
              )}
            </>
          ) : (
            tablesForCurrentRoom.map((table) => {
              if (!table || table.id == null) return null;
              const id = String(table?.id);
              const isSelected = selectedTableId != null && String(selectedTableId) === id;
              const tableNumber = String(table?.name ?? id).replace(/^Table\s*/i, '') || id;
              const pos = positions[id] || { x: 0, y: 0 };
              const hasOpenOrders = Array.isArray(table?.orders) && table.orders.length > 0;
              const lastPaidAt = Number(lastPaidAtByTableId?.[id]) || 0;
              const wasPaidRecently = !hasOpenOrders && lastPaidAt > 0 && Date.now() - lastPaidAt <= TABLE_PAID_HIGHLIGHT_WINDOW_MS;
              const tableNumberColorClass = 'text-white';
              const tableColorOverlay = hasOpenOrders ? 'bg-rose-500/50' : wasPaidRecently ? 'bg-green-500/50' : '';
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleSelectAndClose(table, {
                    tableLabel: tableNumber,
                    roomName: currentRoom?.name ?? null
                  })}
                  className={`w-[200px] h-[200px] absolute overflow-hidden rounded-[4px] border-2 transition-colors ${
                    'border-transparent'
                  } cursor-pointer`}
                  style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
                >
                  <img src="/table.png" alt={`${t('table')} ${tableNumber}`} className="w-full h-full object-contain" />
                  {tableColorOverlay ? <span className={`absolute inset-0 pointer-events-none ${tableColorOverlay}`} aria-hidden /> : null}
                  <span
                    className={`absolute inset-0 flex items-center justify-center text-[40px] font-bold -mt-10 pointer-events-none ${tableNumberColorClass}`}
                  >
                    {tableNumber}
                  </span>
                </button>
              );
            })
          )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-around text-md px-4 py-2 bg-pos-panel">
        <button type="button" className="py-2 px-3 active:bg-green-500" onClick={onBack}>
          {t('backName')}
        </button>
        <button type="button" className="py-2 px-3 active:bg-green-500" onClick={handleNextRoom}>
          {t('nextCourse')}
        </button>
        <button type="button" className="py-2 px-3 active:bg-green-500">
          {t('name')}
        </button>
        <button type="button" className="py-2 px-3 active:bg-green-500" onClick={() => setShowRoomsModal(true)}>
          {currentRoom?.name ?? t('room1')}
        </button>
        <button type="button" className="py-2 px-3 active:bg-green-500" onClick={() => handleSelectAndClose(null)}>
          {t('noTable')}
        </button>
      </div>

      {showRoomsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowRoomsModal(false)}>
          <div
            className="bg-pos-bg rounded-xl border border-pos-border shadow-2xl max-w-md w-full p-6 max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-pos-text text-2xl font-semibold mb-4">{t('room1')}</h3>
            <div className="space-y-2 max-h-[300px] overflow-auto [scrollbar-width:none]">
              {sortedRooms.map((room, idx) => (
                <button
                  key={room?.id ?? idx}
                  type="button"
                  onClick={() => {
                    setSelectedRoomIndex(idx);
                    setShowRoomsModal(false);
                  }}
                  className={`w-full py-3 px-4 rounded-lg text-left text-sm ${
                    selectedRoomIndex === idx ? 'bg-pos-rowHover border-2 border-pos-border' : 'bg-pos-panel active:bg-green-500 border border-transparent'
                  }`}
                >
                  {room?.name ?? `Room ${idx + 1}`}
                </button>
              ))}
            </div>
            {sortedRooms.length === 0 && (
              <p className="text-pos-muted py-4">{t('noTable')}</p>
            )}
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-pos-panel border border-pos-border active:bg-green-500"
                onClick={() => setShowRoomsModal(false)}
              >
                {t('backName')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
