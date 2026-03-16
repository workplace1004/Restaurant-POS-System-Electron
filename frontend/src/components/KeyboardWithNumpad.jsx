import React, { useState } from 'react';

// Alphanumeric layout (AZERTY-style): row1 a z e r t y u i o p, row2 q s d f g h j k l m, row3 w x c v b n , €
const ROW1 = 'a z e r t y u i o p'.split(' ');
const ROW2 = 'q s d f g h j k l m'.split(' ');
const ROW3 = 'w x c v b n , €'.split(' ');
const NUMPAD = [['7', '8', '9'], ['4', '5', '6'], ['1', '2', '3'], ['-', '0', '.']];

const KEY_STYLE = 'w-[100px] h-[100px] bg-pos-panel rounded text-white text-5xl hover:bg-pos-panel/80 border border-transparent transition-colors';

/**
 * Reusable virtual keyboard with alphanumeric keys and numpad.
 * @param {string} value - Current input value (controlled)
 * @param {(value: string) => void} onChange - Called when value changes (e.g. after key press)
 * @param {string} [className] - Optional wrapper className
 */
export function KeyboardWithNumpad({ value = '', onChange, className = '' }) {
  const [uppercase, setUppercase] = useState(false);

  const display = (k) => (/^[a-z]$/.test(k) ? (uppercase ? k.toUpperCase() : k) : k);

  const sendKey = (char) => {
    if (char === 'Backspace') onChange(value.slice(0, -1));
    else onChange(value + char);
  };

  const sendLetterOrSymbol = (k) => {
    if (/^[a-z]$/.test(k)) sendKey(uppercase ? k.toUpperCase() : k);
    else sendKey(k);
  };

  return (
    <div className={`p-4 flex gap-4 flex-wrap ${className}`}>
      <div className="flex gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex gap-1">
            {ROW1.map((k) => (
              <button key={k} type="button" className={KEY_STYLE} onClick={() => sendLetterOrSymbol(k)}>
                {display(k)}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {ROW2.map((k) => (
              <button key={k} type="button" className={KEY_STYLE} onClick={() => sendLetterOrSymbol(k)}>
                {display(k)}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {ROW3.map((k) => (
              <button key={k} type="button" className={KEY_STYLE} onClick={() => sendLetterOrSymbol(k)}>
                {display(k)}
              </button>
            ))}
            <button type="button" className={`${KEY_STYLE} w-[204px]`} onClick={() => sendKey('Backspace')} aria-label="Backspace">
              ←
            </button>
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              className={`${KEY_STYLE} ${uppercase ? 'bg-blue-600 ring-2 ring-blue-400' : ''}`}
              onClick={() => setUppercase((p) => !p)}
              title="Shift"
            >
              ↑
            </button>
            <button type="button" className={KEY_STYLE} onClick={() => sendKey('@')}>
              @
            </button>
            <button type="button" className={KEY_STYLE} onClick={() => sendKey('/')}>
              /
            </button>
            <button type="button" className="bg-pos-panel rounded hover:bg-pos-panel/80 w-[412px] h-[100px] border border-transparent transition-colors" onClick={() => sendKey(' ')} aria-label="Space" />
            <button type="button" className={KEY_STYLE} onClick={() => sendKey('Backspace')} aria-label="Backspace">
              _
            </button>
            <button type="button" className={KEY_STYLE} onClick={() => sendKey('Backspace')} aria-label="Backspace">
              ←
            </button>
            <button type="button" className={KEY_STYLE} onClick={() => sendKey('Backspace')} aria-label="Backspace">
              →
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          {NUMPAD.map((row, i) => (
            <div key={i} className="flex gap-1">
              {row.map((k) => (
                <button key={k} type="button" className={KEY_STYLE} onClick={() => sendKey(k)}>
                  {k}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
