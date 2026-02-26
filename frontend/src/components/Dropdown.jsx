import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * Reusable dropdown component.
 * When inline=false (default): options list is portaled to document.body with position:fixed so it appears above keyboard/modals.
 * When inline=true: options list is rendered directly under the trigger (position:absolute) so it appears under the dropdown.
 * @param {Object} props
 * @param {{ value: string, label: string }[]} props.options - List of { value, label }
 * @param {string} props.value - Current selected value
 * @param {(value: string) => void} props.onChange - Called when selection changes
 * @param {string} [props.placeholder] - Placeholder when no value selected
 * @param {boolean} [props.disabled] - Disable the dropdown
 * @param {boolean} [props.inline] - If true, render options list under the trigger (no portal)
 * @param {string} [props.className] - Additional classes for the trigger button
 * @param {string} [props.labelClassName] - Additional classes for the option list container
 */
export function Dropdown({ options = [], value, onChange, placeholder = 'Select…', disabled = false, inline = false, className = '', labelClassName = '' }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const ref = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (!open || inline) return;
    const updatePosition = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        setPosition({ top: rect.bottom + 4, left: rect.left, width: rect.width });
      }
    };
    updatePosition();
    const raf = requestAnimationFrame(() => {
      updatePosition();
    });
    return () => cancelAnimationFrame(raf);
  }, [open, inline]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const inTrigger = ref.current && ref.current.contains(e.target);
      const inList = listRef.current && listRef.current.contains(e.target);
      if (!inTrigger && !inList) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selected = options.find((opt) => opt.value === value);
  const displayLabel = selected ? selected.label : placeholder;

  const listCommonClasses = `w-full py-1 bg-pos-bg border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto z-[10000] ${labelClassName}`;

  const listContent = open ? (
    <ul
      ref={listRef}
      className={inline ? `absolute top-full left-0 mt-1 ${listCommonClasses}` : `fixed ${listCommonClasses}`}
      role="listbox"
      style={inline ? undefined : { top: position.top, left: position.left, width: position.width }}
    >
      {options.map((opt) => (
        <li
          key={opt.value}
          role="option"
          aria-selected={opt.value === value}
          className={`px-4 py-2 cursor-pointer text-white text-xl transition-colors ${opt.value === value ? 'bg-pos-panel font-medium' : 'text-gray-800 hover:bg-pos-panel'}`}
          onClick={() => {
            onChange(opt.value);
            setOpen(false);
          }}
        >
          {opt.label}
        </li>
      ))}
    </ul>
  ) : null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        className={`w-full flex items-center h-[50px] justify-between px-4 py-3 text-left border border-gray-300 rounded-lg bg-pos-panel text-white text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={displayLabel}
      >
        <span>{displayLabel}</span>
        <svg className={`w-5 h-5 text-gray-500 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {inline ? listContent : (typeof document !== 'undefined' && open && createPortal(listContent, document.body))}
    </div>
  );
}
