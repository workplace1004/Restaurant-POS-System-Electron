import React, { useRef, useState } from 'react';

const SortIcon = () => (
  <span className="ml-0.5 align-middle" aria-hidden>^</span>
);

export function InPlanningModal({ open, onClose, orders = [] }) {
  const leftListRef = useRef(null);
  const rightListRef = useRef(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  if (!open) return null;

  const inPlanningOrders = orders.filter((o) => o.status === 'in_planning' || o.status === 'open');
  const formatDate = (d) => {
    try {
      const date = new Date(d);
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '/');
    } catch {
      return '–';
    }
  };
  const formatTime = (d) => {
    try {
      return new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
      return '–';
    }
  };
  const formatAmount = (total) => (total != null ? `€${Number(total).toFixed(2)}` : '€0.00');
  const customerName = (o) => (o?.customer ? (o.customer.companyName || o.customer.name) : '–');
  const orderNo = (id) => (id ? id.slice(-6) : '–');

  const todayStr = formatDate(new Date());

  const scroll = (ref, dir) => {
    const el = ref?.current;
    if (el) el.scrollTop += dir * 60;
  };

  const qwertyTop = 'a z e r t y u i o p'.split(' ');
  const qwertyMid = 'q s d f g h j k l m'.split(' ');
  const qwertyBot = 'w x c v b n , €'.split(' ');
  const numPad = [['7', '8', '9'], ['4', '5', '6'], ['1', '2', '3'], ['-', '0', '.']];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-pos-panel rounded-lg shadow-xl flex flex-col w-full max-w-[1400px] h-[1000px] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full overflow-hidden">
          {/* Left panel: table */}
          <div className="flex flex-col w-full h-full overflow-hidden">
            {/* Header: Date, Full list, Date value, History tab */}
            <div className="flex items-center justify-around w-full px-4 py-5">
              <div>
                <div className="text-green-400 font-semibold text-3xl">Date</div>
                <div className="text-white text-xl">Full list</div>
              </div>
              <div className="text-3xl font-medium text-white">{todayStr}</div>
              <div className="text-3xl font-medium text-white">{todayStr}</div>
              <div className="flex gap-2">
                <button type="button" className="px-3 py-1.5 rounded text-white text-3xl font-medium">
                  History
                </button>
              </div>
            </div>

            <div className="flex w-full gap-1 px-2 py-2 text-2xl justify-around font-medium text-white">
              <span>No.</span>
              <span>Delivery time</span>
              <span>Name</span>
              <span>Type</span>
              <span>Amount</span>
              <span>Printed</span>
              <span>Paid</span>
              <span>Origin</span>
            </div>
            <div
              ref={leftListRef}
              className="overflow-auto min-h-[400px] border border-white rounded-lg mx-2"
            >
              {inPlanningOrders.length > 0 ? (
                <table className="text-left text-xl text-white">
                  <tbody>
                    {inPlanningOrders.map((order) => (
                      <tr
                        key={order.id}
                        className={`border-b border-gray-100 cursor-pointer ${selectedOrderId === order.id ? 'bg-gray-400' : 'hover:bg-gray-300'
                          }`}
                        onClick={() => setSelectedOrderId(order.id)}
                      >
                        <td className="p-3 min-w-[100px] whitespace-nowrap">
                          <div className="flex items-center justify-center">
                            {orderNo(order.id)}
                          </div>
                        </td>
                        <td className="p-3 min-w-[200px] whitespace-nowrap">
                          <div className="flex items-center justify-center">
                            {formatTime(order.createdAt)}
                          </div>
                        </td>
                        <td className="p-3 min-w-[120px] truncate">
                          <div className="flex items-center justify-center">
                            {customerName(order)}
                          </div>
                        </td>
                        <td className="p-3 min-w-[110px] whitespace-nowrap">
                          <div className="flex items-center justify-center">
                            Collection
                          </div>
                        </td>
                        <td className="p-3 min-w-[150px] whitespace-nowrap">
                          <div className="flex items-center justify-center">
                            {formatAmount(order.total)}
                          </div>
                        </td>
                        <td className="p-3 min-w-[130px] whitespace-nowrap">
                          <div className="flex items-center justify-center">
                            No
                          </div>
                        </td>
                        <td className="p-3 min-w-[110px] whitespace-nowrap">
                          <div className="flex items-center justify-center">
                            {order.status === 'paid' ? 'Yes' : 'No'}
                          </div>
                        </td>
                        <td className="p-3 min-w-[123px] whitespace-nowrap">
                          <div className="flex items-center justify-center">
                            {order.source || 'pos'}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-6 text-center text-gray-500 flex flex-col items-center gap-2">
                  <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  <span>No orders</span>
                </div>
              )}
            </div>
            <div className="flex justify-around w-full gap-2 py-5">
              <button type="button" className="p-1 text-gray-500 hover:text-gray-700" onClick={() => scroll(rightListRef, -1)} aria-label="Scroll up">
                <svg width="40" height="40" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M11 17V5.414l3.293 3.293a.999.999 0 101.414-1.414l-5-5a.999.999 0 00-1.414 0l-5 5a.997.997 0 000 1.414.999.999 0 001.414 0L9 5.414V17a1 1 0 102 0z" fill="#ffffff" /></svg>              </button>
              <button type="button" className="p-1 text-gray-500 hover:text-gray-700" onClick={() => scroll(rightListRef, 1)} aria-label="Scroll down">
                <svg width="40" height="40" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10.707 17.707l5-5a.999.999 0 10-1.414-1.414L11 14.586V3a1 1 0 10-2 0v11.586l-3.293-3.293a.999.999 0 10-1.414 1.414l5 5a.999.999 0 001.414 0z" fill="#ffffff" /></svg>
              </button>
            </div>
          </div>

          {/* Right panel: print buttons + content */}
          <div className="flex flex-col w-[340px] shrink-0">
            <div className="flex flex-wrap gap-2 py-[40px] w-full justify-center items-center">
              <button type="button" className="px-1.5 py-1.5 w-[100px] rounded bg-gray-200 text-gray-800 text-xl hover:bg-gray-300">Production print</button>
              <button type="button" className="px-1.5 py-1.5 w-[100px] rounded bg-gray-200 text-gray-800 text-xl hover:bg-gray-300">Print all production</button>
              <button type="button" className="px-1.5 py-1.5 w-[100px] rounded bg-gray-200 text-gray-800 text-xl hover:bg-gray-300">Print totals</button>
            </div>
            <div ref={rightListRef} className="h-[400px] overflow-auto border rounded-lg mx-2 border-white" />
            <div className="flex justify-around w-full gap-2 py-5">
              <button type="button" className="p-1 text-gray-500 hover:text-gray-700" onClick={() => scroll(rightListRef, -1)} aria-label="Scroll up">
                <svg width="40" height="40" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M11 17V5.414l3.293 3.293a.999.999 0 101.414-1.414l-5-5a.999.999 0 00-1.414 0l-5 5a.997.997 0 000 1.414.999.999 0 001.414 0L9 5.414V17a1 1 0 102 0z" fill="#ffffff" /></svg>              </button>
              <button type="button" className="p-1 text-gray-500 hover:text-gray-700" onClick={() => scroll(rightListRef, 1)} aria-label="Scroll down">
                <svg width="40" height="40" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10.707 17.707l5-5a.999.999 0 10-1.414-1.414L11 14.586V3a1 1 0 10-2 0v11.586l-3.293-3.293a.999.999 0 10-1.414 1.414l5 5a.999.999 0 001.414 0z" fill="#ffffff" /></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom: keyboard + keypad + buttons */}
        <div className="flex gap-2 p-2 shrink-0">
          <div className="flex gap-2">
            <div className="flex gap-2">
              {/* QWERTY */}
              <div className="flex flex-col gap-1 text-5xl">
                <div className="flex gap-1 justify-center">
                  {qwertyTop.map((k) => (
                    <button key={k} type="button" className="w-[80px] h-[80px] border rounded bg-pos-panel text-pos-text hover:bg-pos-rowHover">{k}</button>
                  ))}
                </div>
                <div className="flex gap-1 justify-center">
                  {qwertyMid.map((k) => (
                    <button key={k} type="button" className="w-[80px] h-[80px] border rounded bg-pos-panel text-pos-text hover:bg-pos-rowHover">{k}</button>
                  ))}
                </div>
                <div className="flex gap-1 justify-center">
                  {qwertyBot.map((k) => (
                    <button key={k} type="button" className="w-[80px] h-[80px] border rounded bg-pos-panel text-pos-text hover:bg-pos-rowHover">{k}</button>
                  ))}
                  <button type="button" className="w-[164px] h-[80px] border rounded bg-pos-panel text-pos-text hover:bg-pos-rowHover">←</button>
                </div>
                <div className="flex gap-1 justify-center">
                  <button type="button" className="w-[80px] h-[80px] border rounded bg-pos-panel text-pos-text hover:bg-pos-rowHover">↑</button>
                  <button type="button" className="w-[80px] h-[80px] border rounded bg-pos-panel text-pos-text hover:bg-pos-rowHover">@</button>
                  <button type="button" className="w-[80px] h-[80px] border rounded bg-pos-panel text-pos-text hover:bg-pos-rowHover">/</button>
                  <button type="button" className="w-[332px] h-[80px] border rounded bg-pos-panel hover:bg-pos-rowHover" aria-label="Space" />
                  <button type="button" className="w-[80px] h-[80px] border rounded bg-pos-panel text-pos-text hover:bg-pos-rowHover">_</button>
                  <button type="button" className="w-[80px] h-[80px] border rounded bg-pos-panel text-pos-text hover:bg-pos-rowHover">←</button>
                  <button type="button" className="w-[80px] h-[80px] border rounded bg-pos-panel text-pos-text hover:bg-pos-rowHover">→</button>
                </div>
              </div>
              {/* Numeric keypad */}
              <div className="flex flex-col gap-1 text-5xl ml-10">
                {numPad.map((row, i) => (
                  <div key={i} className="flex gap-1">
                    {row.map((k) => (
                      <button key={k} type="button" className="w-[80px] h-[80px] border rounded bg-pos-panel text-pos-text hover:bg-pos-rowHover">{k}</button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            {/* Action buttons */}
            <div className="flex flex-col gap-2 text-xl w-[242px] justify-center items-center ml-2">
              <button type="button" className="w-48 h-[70px] px-3 rounded bg-gray-300 text-gray-500 cursor-not-allowed" disabled>Load</button>
              <button type="button" className="w-48 h-[70px] px-3 rounded bg-gray-300 text-gray-500 cursor-not-allowed" disabled>Add recurring order</button>
              <button type="button" className="w-48 h-[70px] px-3 rounded bg-gray-300 text-gray-500 cursor-not-allowed" disabled>Cancel order</button>
              <button type="button" className="w-48 h-[70px] px-3 rounded bg-gray-400 text-gray-800 font-medium hover:bg-gray-500" onClick={onClose}>Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
