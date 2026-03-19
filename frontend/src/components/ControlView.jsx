import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Dropdown } from './Dropdown';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { KeyboardWithNumpad } from './KeyboardWithNumpad';
import { CalendarModal } from './CalendarModal';
import { PaginationArrows } from './PaginationArrows';
import { PrinterModal } from './PrinterModal';
import { useLanguage } from '../contexts/LanguageContext';

const API = '/api';

const CONTROL_SIDEBAR_ITEMS = [
  { id: 'personalize', label: 'Personalize Cash Register', icon: 'monitor' },
  { id: 'reports', label: 'Reports', icon: 'chart' },
  { id: 'users', label: 'Users', icon: 'users' },
  { id: 'language', label: 'Language', icon: 'language' }
];

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'nl', label: 'Dutch' },
  { value: 'fr', label: 'French' },
  { value: 'tr', label: 'Turkish' }
];

const TOP_NAV_ITEMS = [
  { id: 'categories-products', label: 'Categories and products', icon: 'box' },
  { id: 'cash-register', label: 'Cash Register Settings', icon: 'gear' },
  { id: 'external-devices', label: 'External Devices', icon: 'printer' },
  { id: 'tables', label: 'Tables', icon: 'table' }
];

const SUB_NAV_ITEMS = [
  'Price Groups',
  'Categories',
  'Products',
  'Subproducts',
  'Discounts'
];

const CASH_REGISTER_SUB_NAV_ITEMS = [
  'Template Settings',
  'Device Settings',
  'System Settings',
  'Payment types',
  'Production messages'
];

const EXTERNAL_DEVICES_SUB_NAV_ITEMS = [
  'Printer',
  'Price Display',
  'RFID Reader',
  'Barcode Scanner',
  'Credit Card',
  'Libra',
  'Cashmatic',
  'Payworld'
];

const PRINTER_TABS = ['General', 'Final tickets', 'Production Tickets', 'Labels'];

const PRINTING_ORDER_OPTIONS = [
  { value: 'as-registered', label: 'As Registered' },
  { value: 'reverse', label: 'Reverse' }
];

const PRINTER_DISABLED_OPTIONS = [
  { value: 'disabled', label: 'Disabled' }
];

const SUBPRODUCT_VAT_OPTIONS = [
  { value: '', label: '--' },
  { value: '0', label: '0%' },
  { value: '6', label: '6%' },
  { value: '12', label: '12%' },
  { value: '21', label: '21%' }
];

const GROUPING_RECEIPT_OPTIONS = [
  { value: 'enable', label: 'Enable' },
  { value: 'disable', label: 'Disable' }
];

const SCHEDULED_ORDERS_PRODUCTION_FLOW_OPTIONS = [
  { value: 'scheduled-orders-print', label: 'Scheduled orders…' },
  { value: 'default', label: 'Default' }
];

const SCHEDULED_ORDERS_LOADING_OPTIONS = [
  { value: '0', label: '0 days ago' },
  { value: '1', label: '1 day ago' },
  { value: '7', label: '7 days ago' },
  { value: '30', label: '30 days ago' }
];

const SCHEDULED_ORDERS_MODE_OPTIONS = [
  { value: 'labels', label: 'Labels' },
  { value: 'list', label: 'List' }
];

const SCHEDULED_ORDERS_INVOICE_LAYOUT_OPTIONS = [
  { value: 'standard', label: 'Standard' },
  { value: 'compact', label: 'Compact' }
];

const SCHEDULED_ORDERS_CHECKOUT_AT_OPTIONS = [
  { value: 'delivery-note', label: 'Delivery note' },
  { value: 'order-date', label: 'Order date' }
];

const LABELS_TYPE_OPTIONS = [
  { value: 'production-labels', label: 'Production labels' }
];

const PRICE_DISPLAY_TYPE_OPTIONS = [
  { value: 'disabled', label: 'Disabled' }
];

const RFID_READER_TYPE_OPTIONS = [
  { value: 'disabled', label: 'Disabled' }
];

const BARCODE_SCANNER_TYPE_OPTIONS = [
  { value: 'disabled', label: 'Disabled' },
  { value: 'serial', label: 'Serial' }
];

const BARCODE_SCANNER_PORT_OPTIONS = [
  { value: 'COM 1', label: 'COM 1' },
  { value: 'COM 2', label: 'COM 2' },
  { value: 'COM 3', label: 'COM 3' },
  { value: 'COM 4', label: 'COM 4' }
];

const CREDIT_CARD_TYPE_OPTIONS = [
  { value: 'disabled', label: 'Disabled' }
];

const SCALE_TYPE_OPTIONS = [
  { value: 'disabled', label: 'Disabled' }
];

const SCALE_PORT_OPTIONS = [
  { value: '', label: '' },
  { value: 'COM 1', label: 'COM 1' },
  { value: 'COM 2', label: 'COM 2' },
  { value: 'COM 3', label: 'COM 3' },
  { value: 'COM 4', label: 'COM 4' }
];

const REPORT_TABS = [
  { id: 'financial', label: 'Financial Reports', icon: 'document' },
  { id: 'user', label: 'User Reports', icon: 'person' },
  { id: 'periodic', label: 'Periodic Reports', icon: 'chart' },
  { id: 'settings', label: 'Settings', icon: 'gear' }
];

const REPORT_GENERATE_UNTIL_OPTIONS = [
  { value: 'current-time', label: 'Current time' }
];

const PERIODIC_REPORT_TIME_OPTIONS = Array.from({ length: 25 }, (_, i) => {
  const h = i === 24 ? '24' : String(i).padStart(2, '0');
  const label = i === 24 ? '24:00' : `${h}:00`;
  return { value: label, label };
});

const USER_AVATAR_COLORS = ['#ef4444', '#22c55e', '#38bdf8', '#ec4899', '#a78bfa'];
// User modal privilege avatars: blue, green, yellow, red, gray, dark gray, orange, magenta, pink
const USER_PRIVILEGE_AVATAR_COLORS = ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#9ca3af', '#4b5563', '#f97316', '#d946ef', '#f472b6'];

const USER_PRIVILEGE_OPTIONS = [
  { id: 'roundTables', label: 'Rounding tables:' },
  { id: 'adjustCustomers', label: 'Customize customers:' },
  { id: 'openDrawer', label: 'Open drawer:' },
  { id: 'discount', label: 'Discount:' },
  { id: 'tableReturns', label: 'Table returns:' },
  { id: 'historyReturns', label: 'History of returns:' },
  { id: 'looseReturns', label: 'Individual returns:' },
  { id: 'showInSellerList', label: 'Show in seller list:' },
  { id: 'cancelPlannedOrders', label: 'Canceling planned orders:' },
  { id: 'cashMachineReceiveManually', label: 'With cash machine recieve cash manually:' },
  { id: 'createNewCustomer', label: 'Create new customer:' },
  { id: 'revenueVisible', label: 'Turnover visible:' }
];

const DEFAULT_USER_PRIVILEGES = Object.fromEntries(USER_PRIVILEGE_OPTIONS.map((p) => [p.id, true]));

const DISCOUNT_TRIGGER_OPTIONS = [
  { value: 'number', label: 'Number' },
  { value: 'weight', label: 'Weight' },
  { value: 'min-amount', label: 'Minimum amount' },
  { value: 'time', label: 'Time' }
];

const DISCOUNT_TYPE_OPTIONS = [
  { value: 'amount', label: 'Amount' },
  { value: 'percent', label: 'Percent' },
  { value: 'free_products', label: 'Free products' },
  { value: 'number', label: '+ Number' },
  { value: 'weight', label: '+ Weight' },
  { value: 'different_price_group', label: 'Different price group' },
];

const DISCOUNT_ON_OPTIONS = [
  { value: 'products', label: 'Products' },
  { value: 'categories', label: 'Categories' },
  { value: 'all-products', label: 'All products' }
];

const REPORT_SETTINGS_ROWS = [
  { id: 'category-totals', label: 'Category totals:' },
  { id: 'product-totals', label: 'Product totals:' },
  { id: 'vat-totals', label: 'VAT totals:' },
  { id: 'payments', label: 'Payments:' },
  { id: 'ticket-types', label: 'Ticket types:' },
  { id: 'eat-in-take-out', label: 'Eat-in / Take-out:' },
  { id: 'open-tables', label: 'Open tables:' },
  { id: 'hour-totals', label: 'Hour totals:' },
  { id: 'hour-totals-per-user', label: 'Hour totals per user:' }
];

const DEFAULT_REPORT_SETTINGS = Object.fromEntries(
  REPORT_SETTINGS_ROWS.map((row) => {
    const allChecked = ['vat-totals', 'payments', 'ticket-types', 'eat-in-take-out'].includes(row.id);
    return [row.id, { z: allChecked, x: allChecked, periodic: allChecked }];
  })
);

const DEFAULT_LABELS_LIST = [
  { id: 'lbl1', sizeLabel: '5.6cm x 3.5cm', sortOrder: 0 }
];

const DEFAULT_PRINTERS = [
  { id: 'p1', name: 'RP4xx Series 200DPI TSC', isDefault: false, sortOrder: 0 },
  { id: 'p2', name: 'ip printer', isDefault: true, sortOrder: 1 },
  { id: 'p3', name: 'Xprinter XP-420B', isDefault: false, sortOrder: 2 },
  { id: 'p4', name: 'bar printer', isDefault: false, sortOrder: 3 },
  { id: 'p5', name: 'extra kitchen printer', isDefault: false, sortOrder: 4 },
  { id: 'p6', name: 'extra printer', isDefault: false, sortOrder: 5 }
];

const VAT_OPTIONS = [
  { value: 'standard', label: 'Standard' },
  { value: 'take-out', label: 'Take-out' },
  { value: 'eat-in', label: 'Eat-in' }
];

const DEVICE_SETTINGS_TABS = [
  'General',
  'Printer',
  'Category display',
  'Orders in waiting',
  'Scheduled orders',
  'Option buttons',
  'Function buttons'
];
const DEVICE_SETTINGS_TAB_LABEL_KEYS = {
  General: 'control.deviceSettingsTab.general',
  Printer: 'control.deviceSettingsTab.printer',
  'Category display': 'control.deviceSettingsTab.categoryDisplay',
  'Orders in waiting': 'control.deviceSettingsTab.ordersInWaiting',
  'Scheduled orders': 'control.deviceSettingsTab.scheduledOrders',
  'Option buttons': 'control.deviceSettingsTab.optionButtons',
  'Function buttons': 'control.deviceSettingsTab.functionButtons'
};

const FUNCTION_BUTTON_ITEMS = [
  { id: 'tables', labelKey: 'control.functionButton.tables', fallbackLabel: 'Tafels' },
  { id: 'weborders', labelKey: 'control.functionButton.weborders', fallbackLabel: 'Weborders' },
  { id: 'in-wacht', labelKey: 'control.functionButton.inWaiting', fallbackLabel: 'In Wacht' },
  { id: 'geplande-orders', labelKey: 'control.functionButton.scheduledOrders', fallbackLabel: 'Geplande orders' },
  { id: 'reservaties', labelKey: 'control.functionButton.reservations', fallbackLabel: 'Reservaties' },
  { id: 'verkopers', labelKey: 'control.functionButton.sellers', fallbackLabel: 'Verkopers' }
];

const FUNCTION_BUTTON_SLOT_COUNT = 3;
const FUNCTION_BUTTON_ITEM_IDS = FUNCTION_BUTTON_ITEMS.map((item) => item.id);
const FUNCTION_BUTTON_ITEM_BY_ID = Object.fromEntries(
  FUNCTION_BUTTON_ITEMS.map((item) => [item.id, item])
);

const OPTION_BUTTON_ITEMS = [
  { id: 'extra-bc-bedrag', labelKey: 'control.optionButton.extraBcAmount', fallbackLabel: 'Extra BC amount' },
  { id: 'bc-refund', labelKey: 'control.optionButton.bcRefund', fallbackLabel: 'BC Refund' },
  { id: 'stock-retour', labelKey: 'control.optionButton.stockRetour', fallbackLabel: 'Stock return' },
  { id: 'product-labels', labelKey: 'control.optionButton.productLabels', fallbackLabel: 'Product Labels' },
  { id: 'ticket-afdrukken', labelKey: 'control.optionButton.printTicket', fallbackLabel: 'Add ticket' },
  { id: 'tegoed', labelKey: 'control.optionButton.credit', fallbackLabel: 'Credit' },
  { id: 'tickets-optellen', labelKey: 'control.optionButton.sumTickets', fallbackLabel: 'Ticket To' },
  { id: 'product-info', labelKey: 'control.optionButton.productInfo', fallbackLabel: 'Product info' },
  { id: 'personeel-ticket', labelKey: 'control.optionButton.staffTicket', fallbackLabel: 'Staff consumables' },
  { id: 'productie-bericht', labelKey: 'control.optionButton.productionMessage', fallbackLabel: 'Production message' },
  { id: 'prijs-groep', labelKey: 'control.optionButton.priceGroup', fallbackLabel: 'Price group' },
  { id: 'discount', labelKey: 'control.optionButton.discount', fallbackLabel: 'Discount' },
  { id: 'kadobon', labelKey: 'control.optionButton.giftVoucher', fallbackLabel: 'Gift voucher' },
  { id: 'various', labelKey: 'control.optionButton.various', fallbackLabel: 'Miscellaneous' },
  { id: 'plu', labelKey: 'control.optionButton.plu', fallbackLabel: 'PLU' },
  { id: 'product-zoeken', labelKey: 'control.optionButton.searchProduct', fallbackLabel: 'Search Product' },
  { id: 'lade', labelKey: 'control.optionButton.drawer', fallbackLabel: 'Drawer' },
  { id: 'klanten', labelKey: 'control.optionButton.customers', fallbackLabel: 'Customers' },
  { id: 'historiek', labelKey: 'control.optionButton.history', fallbackLabel: 'History' },
  { id: 'subtotaal', labelKey: 'control.optionButton.subtotal', fallbackLabel: 'Subtotaal' },
  { id: 'terugname', labelKey: 'control.optionButton.return', fallbackLabel: 'Return name' },
  { id: 'meer', labelKey: 'control.optionButton.more', fallbackLabel: 'Meer...' },
  { id: 'eat-in-take-out', labelKey: 'control.optionButton.eatInTakeOut', fallbackLabel: 'Take Out' },
  { id: 'externe-apps', labelKey: 'control.optionButton.externalApps', fallbackLabel: 'External Apps' },
  { id: 'voor-verpakken', labelKey: 'control.optionButton.forPacking', fallbackLabel: 'Pre-packaging' },
  { id: 'leeggoed-terugnemen', labelKey: 'control.optionButton.depositReturn', fallbackLabel: 'Return empty containers' },
  { id: 'webshop-tijdsloten', labelKey: 'control.optionButton.webshopTimeslots', fallbackLabel: 'Webshop time slots' }
];
const OPTION_BUTTON_SLOT_COUNT = 28;
const OPTION_BUTTON_LOCKED_ID = 'meer';
const OPTION_BUTTON_ITEM_IDS = OPTION_BUTTON_ITEMS.map((item) => item.id);
const OPTION_BUTTON_ITEM_BY_ID = Object.fromEntries(
  OPTION_BUTTON_ITEMS.map((item) => [item.id, item])
);
const DEFAULT_OPTION_BUTTON_LAYOUT = [
  'extra-bc-bedrag', '', 'bc-refund', 'stock-retour', 'product-labels', '', '',
  'ticket-afdrukken', '', 'tegoed', 'tickets-optellen', '', 'product-info', 'personeel-ticket',
  'productie-bericht', 'prijs-groep', 'discount', 'kadobon', 'various', 'plu', 'product-zoeken',
  'lade', 'klanten', 'historiek', 'subtotaal', 'terugname', '', 'meer'
];

function normalizeFunctionButtonSlots(value) {
  if (!Array.isArray(value)) return Array(FUNCTION_BUTTON_SLOT_COUNT).fill('');
  const next = Array(FUNCTION_BUTTON_SLOT_COUNT).fill('');
  const used = new Set();
  for (let i = 0; i < FUNCTION_BUTTON_SLOT_COUNT; i += 1) {
    const candidate = String(value[i] || '').trim();
    if (!candidate) continue;
    if (!FUNCTION_BUTTON_ITEM_IDS.includes(candidate)) continue;
    if (used.has(candidate)) continue;
    next[i] = candidate;
    used.add(candidate);
  }
  return next;
}

function normalizeOptionButtonSlots(value) {
  if (!Array.isArray(value)) return [...DEFAULT_OPTION_BUTTON_LAYOUT];
  const next = Array(OPTION_BUTTON_SLOT_COUNT).fill('');
  const used = new Set();
  for (let i = 0; i < OPTION_BUTTON_SLOT_COUNT; i += 1) {
    const candidate = String(value[i] || '').trim();
    if (!candidate) continue;
    if (!OPTION_BUTTON_ITEM_IDS.includes(candidate)) continue;
    if (used.has(candidate)) continue;
    next[i] = candidate;
    used.add(candidate);
  }
  if (!next.includes(OPTION_BUTTON_LOCKED_ID)) {
    next[OPTION_BUTTON_SLOT_COUNT - 1] = OPTION_BUTTON_LOCKED_ID;
  }
  return next;
}

const SYSTEM_SETTINGS_TABS = ['General', 'Prices', 'Ticket'];
const SYSTEM_SETTINGS_TAB_LABEL_KEYS = {
  General: 'control.systemSettingsTab.general',
  Prices: 'control.systemSettingsTab.prices',
  Ticket: 'control.systemSettingsTab.ticket'
};

const LEEGGOED_OPTIONS = [
  { value: 'by-customers-name', label: 'By customers name' },
  { value: 'other', label: 'Other' }
];

const SAVINGS_DISCOUNT_OPTIONS = [
  { value: '', label: 'Disabled' },
  { value: 'percentage', label: 'Percentage' },
  { value: 'amount', label: 'Amount' }
];

const TICKET_VOUCHER_VALIDITY_OPTIONS = [
  { value: '1', label: '1 month' },
  { value: '3', label: '3 months' },
  { value: '6', label: '6 months' },
  { value: '12', label: '12 months' }
];

const TICKET_SCHEDULED_PRINT_MODE_OPTIONS = [
  { value: 'Production ticket', label: 'Production ticket' },
  { value: 'label-small', label: 'Small label' },
  { value: 'label-large', label: 'Large label' },
  { value: 'label-Production ticket + Small label', label: 'Production ticket + Small label label' },
  { value: 'Production ticket + Large label', label: 'Production ticket + Large label' },
];

const TICKET_SCHEDULED_CUSTOMER_SORT_OPTIONS = [
  { value: 'as-registered', label: 'As Registered' },
  { value: 'Alphabetical first name', label: 'Alphabetical first name' },
  { value: 'Alphabetical last name', label: 'Alphabetical last name' }
];

const BARCODE_TYPE_OPTIONS = [
  { value: 'Code39', label: 'Code39' },
  { value: 'Code93', label: 'Code93' },
  { value: 'Code128', label: 'Code128' },
  { value: 'Interleaved2of5', label: 'Interleaved 2 of 5' }
];

const TABLE_LOCATION_BACKGROUND_OPTIONS = [
  { value: '', label: 'Default' },
  { value: 'white', label: 'White' },
  { value: 'gray', label: 'Gray' },
  { value: 'blue', label: 'Blue' }
];

const TABLE_TEMPLATE_OPTIONS = [
  { id: '4table', src: '/4table.svg', chairs: 4, width: 130, height: 155 },
  { id: '5table', src: '/5table.svg', chairs: 5, width: 145, height: 173 },
  { id: '6table', src: '/6table.svg', chairs: 6, width: 150, height: 179 }
];

const TABLE_BOARD_COLOR_OPTIONS = [
  '#facc15', // yellow
  '#22c55e', // green
  '#3b82f6', // blue
  '#ef4444', // red
  '#a855f7', // purple
  '#ffffff'  // white
];

const createDefaultBoard = (table, color = '#facc15') => {
  const tableW = Math.max(60, Number(table?.width) || 120);
  const tableH = Math.max(40, Number(table?.height) || 80);
  const boardW = Math.max(120, Math.round(tableW + 40));
  const boardH = Math.max(120, Math.round(tableH + 40));
  return {
    id: `board-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    color,
    x: 0,
    y: 0,
    width: boardW,
    height: boardH,
    rotation: 0
  };
};

const normalizeBoardToItem = (b, defaultColor = '#facc15') => ({
  id: b?.id && typeof b.id === 'string' ? b.id : `board-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  color: typeof b?.color === 'string' && b.color.trim() ? b.color.trim() : defaultColor,
  x: Number(b?.x) || 0,
  y: Number(b?.y) || 0,
  width: Math.max(10, Number(b?.width) || 120),
  height: Math.max(10, Number(b?.height) || 120),
  rotation: Number(b?.rotation) || 0
});

const createDefaultFlowerPot = () => ({
  id: `flowerpot-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  x: 0,
  y: 0,
  width: 60,
  height: 72,
  rotation: 0
});

const normalizeFlowerPotToItem = (fp) => ({
  id: fp?.id && typeof fp.id === 'string' ? fp.id : `flowerpot-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  x: Number(fp?.x) || 0,
  y: Number(fp?.y) || 0,
  width: Math.max(10, Number(fp?.width) || 60),
  height: Math.max(10, Number(fp?.height) || 72),
  rotation: Number(fp?.rotation) || 0
});

const createDefaultLayoutTable = (index = 1, templateType = '4table') => {
  const tpl = TABLE_TEMPLATE_OPTIONS.find((item) => item.id === templateType) || TABLE_TEMPLATE_OPTIONS[0];
  return {
    id: `tbl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: `T-${String(index).padStart(2, '0')}`,
    x: 120 + (index - 1) * 180,
    y: 120 + ((index - 1) % 3) * 120,
    width: tpl.width,
    height: tpl.height,
    chairs: tpl.chairs,
    rotation: 0,
    round: false,
    templateType: tpl.id,
    boards: [],
    flowerPots: []
  };
};

const normalizeLayoutEditorDraft = (raw, locationName = 'Restaurant') => {
  const hasTablesArray = Array.isArray(raw?.tables);
  const tables = Array.isArray(raw?.tables)
    ? raw.tables.map((table, index) => ({
      id: String(table?.id || `tbl-${index + 1}`),
      name: String(table?.name || `T-${String(index + 1).padStart(2, '0')}`),
      x: Number(table?.x) || 0,
      y: Number(table?.y) || 0,
      width: Math.max(60, Number(table?.width) || 120),
      height: Math.max(40, Number(table?.height) || 80),
      chairs: Math.max(0, Number(table?.chairs) || 4),
      rotation: Number(table?.rotation) || 0,
      round: !!table?.round,
      templateType: TABLE_TEMPLATE_OPTIONS.some((tpl) => tpl.id === table?.templateType)
        ? table.templateType
        : ((Number(table?.chairs) || 4) >= 6 ? '6table' : (Number(table?.chairs) || 4) >= 5 ? '5table' : '4table'),
      boards: (() => {
        if (Array.isArray(table?.boards) && table.boards.length > 0) {
          return table.boards.map((b) => normalizeBoardToItem(b));
        }
        if (table?.board && typeof table.board === 'object') {
          return [normalizeBoardToItem(table.board)];
        }
        if (typeof table?.boardColor === 'string' && table.boardColor.trim()) {
          return [normalizeBoardToItem(createDefaultBoard(table, table.boardColor.trim()))];
        }
        return [];
      })(),
      flowerPots: Array.isArray(table?.flowerPots) && table.flowerPots.length > 0
        ? table.flowerPots.map((fp) => normalizeFlowerPotToItem(fp))
        : (table?.flowerPot && typeof table.flowerPot === 'object' ? [normalizeFlowerPotToItem(table.flowerPot)] : [])
    }))
    : [];
  return {
    floorName: String(raw?.floorName || locationName || 'Restaurant'),
    floorWidth: Math.max(400, Number(raw?.floorWidth) || 2048),
    floorHeight: Math.max(300, Number(raw?.floorHeight) || 654),
    bookingCapacity: Math.max(0, Number(raw?.bookingCapacity) || 0),
    floors: Math.max(1, Number(raw?.floors) || 1),
    tables: hasTablesArray ? tables : [createDefaultLayoutTable(1)]
  };
};

const DEFAULT_PAYMENT_TYPES = [
  { id: '1', name: 'Cash', active: true, sortOrder: 0 },
  { id: '2', name: 'Bancontact', active: true, sortOrder: 1 },
  { id: '3', name: 'Transfer', active: false, sortOrder: 2 },
  { id: '4', name: 'Visa', active: true, sortOrder: 3 },
  { id: '5', name: 'Meal vouchers', active: false, sortOrder: 4 },
  { id: '6', name: 'Gift voucher', active: false, sortOrder: 5 },
  { id: '7', name: 'Charging card', active: false, sortOrder: 6 },
  { id: '8', name: 'American Express', active: false, sortOrder: 7 },
  { id: '9', name: 'Mastercard', active: false, sortOrder: 8 },
  { id: '10', name: 'Seqr', active: false, sortOrder: 9 },
  { id: '11', name: 'RES', active: false, sortOrder: 10 },
  { id: '12', name: 'Payconiq', active: false, sortOrder: 11 },
  { id: '13', name: 'Too Good To Go', active: false, sortOrder: 12 }
];

const VAT_PERCENT_OPTIONS = [
  { value: '', label: '--' },
  { value: '0', label: '0%' },
  { value: '6', label: '6%' },
  { value: '9', label: '9%' },
  { value: '12', label: '12%' },
  { value: '21', label: '21%' }
];

const EXTRA_PRICE_PRINTER_OPTIONS = [
  { value: 'Disabled', label: 'Disabled' }
];

const VERVALTYPE_OPTIONS = [
  { value: 'Shelf life', label: 'Shelf life' },
  { value: 'Expiration date', label: 'Expiration date' }
];

const PURCHASE_UNIT_OPTIONS = [
  { value: 'Piece', label: 'Piece' },
  { value: 'Kg', label: 'Kg' },
  { value: 'Liter', label: 'Liter' },
  { value: 'Meter', label: 'Meter' }
];

const PURCHASE_SUPPLIER_OPTIONS = [
  { value: '', label: '--' }
];

const KIOSK_SUBS_OPTIONS = [
  { value: 'unlimited', label: 'Unlimited' },
  ...Array.from({ length: 10 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }))
];

function IconMonitor({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function IconChart({ className }) {
  return (
    <svg className={className} viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <g fill="currentColor" fillRule="evenodd">
        <rect x="15" rx="1" width="3" height="18" />
        <rect x="10" y="5" width="3" height="13" rx="1" />
        <rect x="5" y="9" width="3" height="9" rx="1" />
        <rect y="13" width="3" height="5" rx="1.001" />
      </g>
    </svg>
  );
}

function IconUsers({ className }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

function IconBox({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 16 16">
      <path fillRule="evenodd" clipRule="evenodd" d="M9.02.678a2.25 2.25 0 00-2.04 0L1.682 3.374A1.25 1.25 0 001 4.488v6.717c0 .658.37 1.26.956 1.56l5.023 2.557a2.25 2.25 0 002.042 0l5.023-2.557a1.75 1.75 0 00.956-1.56V4.488c0-.47-.264-.9-.683-1.114L9.021.678zM7.66 2.015a.75.75 0 01.68 0l4.436 2.258-1.468.734-4.805-2.403 1.157-.59zM4.84 3.45l-1.617.823L8 6.661l1.631-.815-4.79-2.396zM2.5 5.588v5.617c0 .094.053.18.137.223l4.613 2.348V7.964L2.5 5.588zm10.863 5.84L8.75 13.776V7.964l4.75-2.375v5.617a.25.25 0 01-.137.223z" />
    </svg>
  );
}

function IconGear({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function IconPrinter({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 70 70">
      <path d="M62.597,21.583H8.46c-3.954,0-6.877,3.133-6.877,6.979v20.137c0,3.751,2.968,6.884,6.877,6.884h4.123v4.485c0,3.828,3.521,6.515,7.349,6.515h30.137c3.828,0,6.515-2.687,6.515-6.515v-4.485h6.014c3.481,0,4.986-2.268,4.986-6.884V28.563C67.583,23.216,64.771,21.583,62.597,21.583z M52.583,60.068c0,1.619-0.896,2.515-2.515,2.515H19.932c-1.619,0-3.349-0.896-3.349-2.515V46.932c0-1.619,1.729-3.349,3.349-3.349h30.137c1.619,0,2.515,1.729,2.515,3.349V60.068z M62.597,51.583h-6.014v-4.651c0-3.828-2.687-7.349-6.515-7.349H19.932c-3.828,0-7.349,3.521-7.349,7.349v4.651H8.46c-1.7,0-2.877-1.32-2.877-2.884V28.563c0-1.228,0.968-2.979,2.877-2.979h54.137c1.294,0,0.986,1.028,0.986,2.979v20.137C63.583,49.733,64.09,51.583,62.597,51.583z" />
      <path d="M14.583,20.417c1.104,0,2-0.896,2-2V9.563c0-1.228,0.521-2.979,3.877-2.979h30.137c1.294,0,1.986,1.028,1.986,2.979v8.854c0,1.104,0.896,2,2,2s2-0.896,2-2V9.563c0-5.347-1.667-6.979-5.986-6.979H20.46c-5.543,0-7.877,2.084-7.877,6.979v8.854C12.583,19.521,13.479,20.417,14.583,20.417z" />
      <path d="M17.417,31.583c0.552,0,1-0.447,1-1s-0.448-1-1-1h-3c-0.552,0-1,0.447-1,1s0.448,1,1,1H17.417z" />
      <path d="M21.417,31.583h3c0.552,0,1-0.447,1-1s-0.448-1-1-1h-3c-0.552,0-1,0.447-1,1S20.865,31.583,21.417,31.583z" />
      <path d="M55.417,33.583h-40c-0.552,0-1,0.447-1,1s0.448,1,1,1h40c0.552,0,1-0.447,1-1S55.969,33.583,55.417,33.583z" />
      <path d="M22.417,49.583h12c0.552,0,1-0.447,1-1s-0.448-1-1-1h-12c-0.552,0-1,0.447-1,1S21.865,49.583,22.417,49.583z" />
      <path d="M47.417,47.583h-9c-0.552,0-1,0.447-1,1s0.448,1,1,1h9c0.552,0,1-0.447,1-1S47.969,47.583,47.417,47.583z" />
      <path d="M22.417,54.583h6c0.552,0,1-0.447,1-1s-0.448-1-1-1h-6c-0.552,0-1,0.447-1,1S21.865,54.583,22.417,54.583z" />
      <path d="M31.417,53.583c0,0.553,0.448,1,1,1h7c0.552,0,1-0.447,1-1s-0.448-1-1-1h-7C31.865,52.583,31.417,53.03,31.417,53.583z" />
      <path d="M32.417,57.583h-10c-0.552,0-1,0.447-1,1s0.448,1,1,1h10c0.552,0,1-0.447,1-1S32.969,57.583,32.417,57.583z" />
      <path d="M43.417,57.583h-7c-0.552,0-1,0.447-1,1s0.448,1,1,1h7c0.552,0,1-0.447,1-1S43.969,57.583,43.417,57.583z" />
      <path d="M47.417,52.583h-4c-0.552,0-1,0.447-1,1s0.448,1,1,1h4c0.552,0,1-0.447,1-1S47.969,52.583,47.417,52.583z" />
    </svg>
  );
}

function IconTable({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 491.413 491.413">
      <path d="M491.413,133.867c0-62.4-126.613-96.107-245.653-96.107S0,71.467,0,133.867c0,60.48,118.72,93.973,234.453,96v125.76c-0.213,0.747-0.533,1.387-0.853,2.133c-4.587,0.32-8.533,3.52-9.6,8.107c-1.173,4.16-2.773,8.107-4.8,11.947c-1.067,0.533-2.24,0.853-3.413,1.067c-12.373,1.6-30.08-17.707-36.693-27.307c-3.307-4.907-10.027-6.08-14.827-2.773c-4.8,3.307-6.08,10.027-2.773,14.827c2.347,3.413,20.373,29.013,42.987,35.2c-13.013,14.08-34.027,28.373-67.84,33.6c-5.867,0.853-9.813,6.293-8.96,12.16c0.747,5.227,5.333,9.067,10.56,9.067c0.533,0,1.067,0,1.6-0.107c56.853-8.64,83.733-39.68,95.787-61.227c3.627-3.093,6.827-6.613,9.387-10.667c2.56,3.947,5.76,7.573,9.387,10.667c12.16,21.547,39.04,52.587,95.893,61.227c0.533,0.107,1.067,0.107,1.6,0.107c5.867,0,10.667-4.8,10.667-10.667c0-5.333-3.84-9.813-9.067-10.56c-33.92-5.227-55.04-19.52-67.947-33.6c22.613-6.293,40.747-31.893,43.093-35.307c3.307-4.907,2.027-11.52-2.773-14.827c-4.907-3.307-11.52-2.027-14.827,2.773c-6.507,9.6-24.213,29.013-36.693,27.307c-1.173-0.107-2.453-0.533-3.52-1.067c-1.92-3.84-3.52-7.787-4.693-11.947c-1.067-4.48-5.013-7.787-9.6-8c-0.32-0.747-0.533-1.387-0.853-2.133l0.107-125.653C371.84,228.16,491.413,194.56,491.413,133.867z M248.32,208.747c-1.707-0.747-3.733-0.747-5.44,0C112.747,208,22.187,169.067,22.187,134.08c0-35.307,91.947-74.667,224-74.667s224,39.36,224,74.667C470.187,169.173,379.2,208.32,248.32,208.747z" />
    </svg>
  );
}

function IconDocument({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function IconPerson({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function IconLanguage({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
    </svg>
  );
}

function ReportTabIcon({ id, className }) {
  if (id === 'document') return <IconDocument className={className} />;
  if (id === 'person') return <IconPerson className={className} />;
  if (id === 'chart') return <IconChart className={className} />;
  if (id === 'gear') return <IconGear className={className} />;
  return null;
}

function SidebarIcon({ id, className }) {
  if (id === 'monitor') return <IconMonitor className={className} />;
  if (id === 'chart') return <IconChart className={className} />;
  if (id === 'users') return <IconUsers className={className} />;
  if (id === 'language') return <IconLanguage className={className} />;
  return null;
}

function TopNavIcon({ id, className }) {
  if (id === 'box') return <IconBox className={className} />;
  if (id === 'gear') return <IconGear className={className} />;
  if (id === 'printer') return <IconPrinter className={className} />;
  if (id === 'table') return <IconTable className={className} />;
  return null;
}

export function ControlView({ currentUser, onLogout, onBack, fetchTableLayouts, fetchTables }) {
  const { lang, setLang, t } = useLanguage();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [controlSidebarId, setControlSidebarId] = useState('personalize');
  const [appLanguage, setAppLanguage] = useState(() => (LANGUAGE_OPTIONS.some((o) => o.value === lang) ? lang : 'en'));
  const [savingAppLanguage, setSavingAppLanguage] = useState(false);
  const [topNavId, setTopNavId] = useState('categories-products');
  const [subNavId, setSubNavId] = useState('Price Groups');
  const [reportTabId, setReportTabId] = useState('financial');
  const [reportGenerateUntil, setReportGenerateUntil] = useState('current-time');
  const [periodicReportStartTime, setPeriodicReportStartTime] = useState('00:00');
  const [periodicReportStartDate, setPeriodicReportStartDate] = useState(() => {
    const d = new Date();
    return [String(d.getDate()).padStart(2, '0'), String(d.getMonth() + 1).padStart(2, '0'), d.getFullYear()].join('-');
  });
  const [periodicReportEndTime, setPeriodicReportEndTime] = useState('24:00');
  const [periodicReportEndDate, setPeriodicReportEndDate] = useState(() => {
    const d = new Date();
    return [String(d.getDate()).padStart(2, '0'), String(d.getMonth() + 1).padStart(2, '0'), d.getFullYear()].join('-');
  });
  const [reportSettings, setReportSettings] = useState(() => ({ ...DEFAULT_REPORT_SETTINGS }));
  const [savingReportSettings, setSavingReportSettings] = useState(false);

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [userName, setUserName] = useState('');
  const [userPin, setUserPin] = useState('');
  const [savingUser, setSavingUser] = useState(false);
  const [deleteConfirmUserId, setDeleteConfirmUserId] = useState(null);
  const [userModalTab, setUserModalTab] = useState('general');
  const [userAvatarColorIndex, setUserAvatarColorIndex] = useState(0);
  const [userModalActiveField, setUserModalActiveField] = useState(null);
  const [userPrivileges, setUserPrivileges] = useState(() => ({ ...DEFAULT_USER_PRIVILEGES }));
  const [usersPage, setUsersPage] = useState(0);
  const USERS_PAGE_SIZE = 11;

  const [discounts, setDiscounts] = useState([]);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [editingDiscountId, setEditingDiscountId] = useState(null);
  const [discountName, setDiscountName] = useState('');
  const [discountTrigger, setDiscountTrigger] = useState('number');
  const [discountType, setDiscountType] = useState('amount');
  const [discountValue, setDiscountValue] = useState('');
  const [discountStartDate, setDiscountStartDate] = useState('');
  const [discountEndDate, setDiscountEndDate] = useState('');
  const [discountOn, setDiscountOn] = useState('products');
  const [discountPieces, setDiscountPieces] = useState('');
  const [discountCombinable, setDiscountCombinable] = useState(false);
  const [discountKeyboardValue, setDiscountKeyboardValue] = useState('');
  const [savingDiscount, setSavingDiscount] = useState(false);
  const [deleteConfirmDiscountId, setDeleteConfirmDiscountId] = useState(null);
  const [discountCalendarField, setDiscountCalendarField] = useState(null); // 'start' | 'end' | null

  const [kitchenMessages, setKitchenMessages] = useState([]);
  const [showKitchenMessageModal, setShowKitchenMessageModal] = useState(false);
  const [editingKitchenMessageId, setEditingKitchenMessageId] = useState(null);
  const [kitchenMessageName, setKitchenMessageName] = useState('');
  const [savingKitchenMessage, setSavingKitchenMessage] = useState(false);
  const [deleteConfirmKitchenMessageId, setDeleteConfirmKitchenMessageId] = useState(null);

  const [priceGroups, setPriceGroups] = useState([]);
  const [priceGroupsLoading, setPriceGroupsLoading] = useState(false);
  const [priceGroupsPage, setPriceGroupsPage] = useState(0);
  const PRICE_GROUPS_PAGE_SIZE = 11;
  const [showPriceGroupModal, setShowPriceGroupModal] = useState(false);
  const [editingPriceGroupId, setEditingPriceGroupId] = useState(null);
  const [priceGroupName, setPriceGroupName] = useState('');
  const [priceGroupTax, setPriceGroupTax] = useState('standard');
  const [savingPriceGroup, setSavingPriceGroup] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryNextCourse, setCategoryNextCourse] = useState('');
  const [categoryInWebshop, setCategoryInWebshop] = useState(true);
  const [categoryDisplayOnCashRegister, setCategoryDisplayOnCashRegister] = useState(true);
  const [categoryActiveField, setCategoryActiveField] = useState('name');
  const [savingCategory, setSavingCategory] = useState(false);
  const [deleteConfirmCategoryId, setDeleteConfirmCategoryId] = useState(null);
  const [categoriesPage, setCategoriesPage] = useState(0);
  const [productsPage, setProductsPage] = useState(0);

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [showProductSubproductsModal, setShowProductSubproductsModal] = useState(false);
  const [productSubproductsProduct, setProductSubproductsProduct] = useState(null);
  const [productSubproductsGroupId, setProductSubproductsGroupId] = useState('');
  const [productSubproductsOptions, setProductSubproductsOptions] = useState([]);
  const [productSubproductsByGroup, setProductSubproductsByGroup] = useState({});
  const [productSubproductsSelectedId, setProductSubproductsSelectedId] = useState('');
  const [productSubproductsLinked, setProductSubproductsLinked] = useState([]);
  const [loadingProductSubproductsLinked, setLoadingProductSubproductsLinked] = useState(false);
  const [savingProductSubproducts, setSavingProductSubproducts] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showProductPositioningModal, setShowProductPositioningModal] = useState(false);
  const [positioningCategoryId, setPositioningCategoryId] = useState(null);
  const [positioningSelectedProductId, setPositioningSelectedProductId] = useState(null);
  const [positioningSelectedCellIndex, setPositioningSelectedCellIndex] = useState(null);
  const [positioningSubproducts, setPositioningSubproducts] = useState([]);
  const [positioningLayoutByCategory, setPositioningLayoutByCategory] = useState({});
  const [positioningColorByCategory, setPositioningColorByCategory] = useState({});
  const [savingPositioningLayout, setSavingPositioningLayout] = useState(false);
  const [positioningLayoutSaveMessage, setPositioningLayoutSaveMessage] = useState('');
  const [editingProductId, setEditingProductId] = useState(null);
  const [productTab, setProductTab] = useState('general');
  const [productTabsUnlocked, setProductTabsUnlocked] = useState(false);
  const [productDisplayNumber, setProductDisplayNumber] = useState(null);
  const [productName, setProductName] = useState('');
  const [productKeyName, setProductKeyName] = useState('');
  const [productProductionName, setProductProductionName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productVatTakeOut, setProductVatTakeOut] = useState('');
  const [productVatEatIn, setProductVatEatIn] = useState('');
  const [productCategoryIds, setProductCategoryIds] = useState(['']);
  const [productAddition, setProductAddition] = useState('Subproducts');
  const [productBarcode, setProductBarcode] = useState('');
  const [productPrinter1, setProductPrinter1] = useState('');
  const [productPrinter2, setProductPrinter2] = useState('');
  const [productPrinter3, setProductPrinter3] = useState('');
  const [productActiveField, setProductActiveField] = useState('name');
  const [savingProduct, setSavingProduct] = useState(false);
  const [deleteConfirmProductId, setDeleteConfirmProductId] = useState(null);
  const [productSearch, setProductSearch] = useState('');
  const [showProductSearchKeyboard, setShowProductSearchKeyboard] = useState(false);
  const [barcodeButtonSpinning, setBarcodeButtonSpinning] = useState(false);
  const [productFieldErrors, setProductFieldErrors] = useState({ name: false, keyName: false, productionName: false, vatTakeOut: false, vatEatIn: false });
  const [advancedOpenPrice, setAdvancedOpenPrice] = useState(false);
  const [advancedWeegschaal, setAdvancedWeegschaal] = useState(false);
  const [advancedSubproductRequires, setAdvancedSubproductRequires] = useState(false);
  const [advancedLeeggoedPrijs, setAdvancedLeeggoedPrijs] = useState('0.00');
  const [advancedPagerVerplicht, setAdvancedPagerVerplicht] = useState(false);
  const [advancedBoldPrint, setAdvancedBoldPrint] = useState(false);
  const [advancedGroupingReceipt, setAdvancedGroupingReceipt] = useState(true);
  const [advancedLabelExtraInfo, setAdvancedLabelExtraInfo] = useState('');
  const [advancedVoorverpakVervaltype, setAdvancedVoorverpakVervaltype] = useState('Shelf life');
  const [advancedHoudbareDagen, setAdvancedHoudbareDagen] = useState('0');
  const [advancedBewarenGebruik, setAdvancedBewarenGebruik] = useState('');
  const [advancedKassaPhotoPreview, setAdvancedKassaPhotoPreview] = useState(null);

  const [extraPricesRows, setExtraPricesRows] = useState([]);
  const [extraPricesSelectedIndex, setExtraPricesSelectedIndex] = useState(0);

  const [purchaseVat, setPurchaseVat] = useState('');
  const [purchasePriceExcl, setPurchasePriceExcl] = useState('0.00');
  const [purchasePriceIncl, setPurchasePriceIncl] = useState('0.00');
  const [profitPct, setProfitPct] = useState('0.00');
  const [purchaseUnit, setPurchaseUnit] = useState('Piece');
  const [unitContent, setUnitContent] = useState('0');
  const [stock, setStock] = useState('0');
  const [purchaseSupplier, setPurchaseSupplier] = useState('');
  const [supplierCode, setSupplierCode] = useState('');
  const [stockNotification, setStockNotification] = useState(true);
  const [expirationDate, setExpirationDate] = useState('');
  const [declarationExpiryDays, setDeclarationExpiryDays] = useState('0');
  const [notificationSoldOutPieces, setNotificationSoldOutPieces] = useState('');

  const [productInWebshop, setProductInWebshop] = useState(false);
  const [webshopOnlineOrderable, setWebshopOnlineOrderable] = useState(true);
  const [websiteRemark, setWebsiteRemark] = useState('');
  const [websiteOrder, setWebsiteOrder] = useState('0');
  const [shortWebText, setShortWebText] = useState('');
  const [websitePhotoFileName, setWebsitePhotoFileName] = useState('');

  const [kioskInfo, setKioskInfo] = useState('');
  const [kioskTakeAway, setKioskTakeAway] = useState(true);
  const [kioskEatIn, setKioskEatIn] = useState('');
  const [kioskSubtitle, setKioskSubtitle] = useState('');
  const [kioskPictureFileName, setKioskPictureFileName] = useState('');
  const [kioskMinSubs, setKioskMinSubs] = useState('unlimited');
  const [kioskMaxSubs, setKioskMaxSubs] = useState('unlimited');

  const [tableLocations, setTableLocations] = useState([]);
  const [tableLocationsLoading, setTableLocationsLoading] = useState(false);
  const [showTableLocationModal, setShowTableLocationModal] = useState(false);
  const [editingTableLocationId, setEditingTableLocationId] = useState(null);
  const [tableLocationName, setTableLocationName] = useState('');
  const [tableLocationSelectionStart, setTableLocationSelectionStart] = useState(0);
  const [tableLocationSelectionEnd, setTableLocationSelectionEnd] = useState(0);
  const [tableLocationBackground, setTableLocationBackground] = useState('');
  const [tableLocationTextColor, setTableLocationTextColor] = useState('light');
  const [savingTableLocation, setSavingTableLocation] = useState(false);
  const [deleteConfirmTableLocationId, setDeleteConfirmTableLocationId] = useState(null);
  const [tableLocationsPage, setTableLocationsPage] = useState(0);
  const tableLocationNameInputRef = useRef(null);
  const [showSetTablesModal, setShowSetTablesModal] = useState(false);
  const [setTablesLocationId, setSetTablesLocationId] = useState(null);
  const [setTablesLocationName, setSetTablesLocationName] = useState('');
  const [setTablesDraft, setSetTablesDraft] = useState(() => normalizeLayoutEditorDraft(null, 'Restaurant'));
  const [setTablesSelectedTableId, setSetTablesSelectedTableId] = useState(null);
  const [setTablesSelectedBoardIndex, setSetTablesSelectedBoardIndex] = useState(null);
  const [setTablesSelectedFlowerPotIndex, setSetTablesSelectedFlowerPotIndex] = useState(null);
  const [showSetTableTypeModal, setShowSetTableTypeModal] = useState(false);
  const [showSetBoardColorModal, setShowSetBoardColorModal] = useState(false);
  const setTablesCanvasRef = useRef(null);
  const setTablesDragRef = useRef(null);
  const [setTablesDraggingId, setSetTablesDraggingId] = useState(null);
  const [setTablesDraggingType, setSetTablesDraggingType] = useState(null);

  const [templateTheme, setTemplateTheme] = useState(() => {
    try {
      return (typeof localStorage !== 'undefined' && localStorage.getItem('pos-template-theme')) || 'light';
    } catch {
      return 'light';
    }
  });
  const [savingTemplateSettings, setSavingTemplateSettings] = useState(false);

  const [showDeviceSettingsModal, setShowDeviceSettingsModal] = useState(false);
  const [deviceSettingsTab, setDeviceSettingsTab] = useState('General');
  const [deviceUseSubproducts, setDeviceUseSubproducts] = useState(true);
  const [deviceAutoLogoutAfterTransaction, setDeviceAutoLogoutAfterTransaction] = useState(false);
  const [deviceAutoReturnToTablePlan, setDeviceAutoReturnToTablePlan] = useState(false);
  const [deviceDisableCashButtonInPayment, setDeviceDisableCashButtonInPayment] = useState(false);
  const [deviceOpenPriceWithoutPopup, setDeviceOpenPriceWithoutPopup] = useState(false);
  const [deviceOpenCashDrawerAfterOrder, setDeviceOpenCashDrawerAfterOrder] = useState(true);
  const [deviceAutoReturnToCounterSale, setDeviceAutoReturnToCounterSale] = useState(false);
  const [deviceAskSendToKitchen, setDeviceAskSendToKitchen] = useState(false);
  const [deviceCounterSaleVat, setDeviceCounterSaleVat] = useState('take-out');
  const [deviceTableSaleVat, setDeviceTableSaleVat] = useState('eat-in');
  const [deviceTimeoutLogout, setDeviceTimeoutLogout] = useState(0);
  const [deviceFixedBorder, setDeviceFixedBorder] = useState(true);
  const [deviceAlwaysOnTop, setDeviceAlwaysOnTop] = useState(true);
  const [deviceAskInvoiceOrTicket, setDeviceAskInvoiceOrTicket] = useState(false);
  const [savingDeviceSettings, setSavingDeviceSettings] = useState(false);
  const [devicePrinterGroupingProducts, setDevicePrinterGroupingProducts] = useState(true);
  const [devicePrinterShowErrorScreen, setDevicePrinterShowErrorScreen] = useState(true);
  const [devicePrinterProductionMessageOnVat, setDevicePrinterProductionMessageOnVat] = useState(false);
  const [devicePrinterNextCourseOrder, setDevicePrinterNextCourseOrder] = useState('as-registered');
  const [devicePrinterStandardMode, setDevicePrinterStandardMode] = useState('enable');
  const [devicePrinterQROrderPrinter, setDevicePrinterQROrderPrinter] = useState('');
  const [devicePrinterReprintWithNextCourse, setDevicePrinterReprintWithNextCourse] = useState(false);
  const [devicePrinterPrintZeroTickets, setDevicePrinterPrintZeroTickets] = useState(false);
  const [devicePrinterGiftVoucherAtMin, setDevicePrinterGiftVoucherAtMin] = useState(false);
  const [deviceCategoryDisplayIds, setDeviceCategoryDisplayIds] = useState([]); // empty = all categories displayed
  const [deviceOrdersConfirmOnHold, setDeviceOrdersConfirmOnHold] = useState(false);
  const [deviceOrdersPrintBarcodeAfterCreate, setDeviceOrdersPrintBarcodeAfterCreate] = useState(false);
  const [deviceOrdersCustomerCanBeModified, setDeviceOrdersCustomerCanBeModified] = useState(false);
  const [deviceOrdersBookTableToWaiting, setDeviceOrdersBookTableToWaiting] = useState(false);
  const [deviceOrdersFastCustomerName, setDeviceOrdersFastCustomerName] = useState(false);
  const [deviceScheduledPrinter, setDeviceScheduledPrinter] = useState('');
  const [deviceScheduledProductionFlow, setDeviceScheduledProductionFlow] = useState('scheduled-orders-print');
  const [deviceScheduledLoading, setDeviceScheduledLoading] = useState('0');
  const [deviceScheduledMode, setDeviceScheduledMode] = useState('labels');
  const [deviceScheduledInvoiceLayout, setDeviceScheduledInvoiceLayout] = useState('standard');
  const [deviceScheduledCheckoutAt, setDeviceScheduledCheckoutAt] = useState('delivery-note');
  const [deviceScheduledPrintBarcodeLabel, setDeviceScheduledPrintBarcodeLabel] = useState(true);
  const [deviceScheduledDeliveryNoteToTurnover, setDeviceScheduledDeliveryNoteToTurnover] = useState(true);
  const [deviceScheduledPrintProductionReceipt, setDeviceScheduledPrintProductionReceipt] = useState(true);
  const [deviceScheduledPrintCustomerProductionReceipt, setDeviceScheduledPrintCustomerProductionReceipt] = useState(true);
  const [deviceScheduledWebOrderAutoPrint, setDeviceScheduledWebOrderAutoPrint] = useState(true);
  const [functionButtonSlots, setFunctionButtonSlots] = useState(() =>
    Array(FUNCTION_BUTTON_SLOT_COUNT).fill('')
  );
  const [selectedFunctionButtonSlotIndex, setSelectedFunctionButtonSlotIndex] = useState(null);
  const [optionButtonSlots, setOptionButtonSlots] = useState(() =>
    normalizeOptionButtonSlots(null)
  );
  const [selectedOptionButtonSlotIndex, setSelectedOptionButtonSlotIndex] = useState(null);

  const [showSystemSettingsModal, setShowSystemSettingsModal] = useState(false);
  const [systemSettingsTab, setSystemSettingsTab] = useState('General');
  const [sysUseStockManagement, setSysUseStockManagement] = useState(true);
  const [sysUsePriceGroups, setSysUsePriceGroups] = useState(true);
  const [sysLoginWithoutCode, setSysLoginWithoutCode] = useState(true);
  const [sysCategorieenPerKassa, setSysCategorieenPerKassa] = useState(true);
  const [sysAutoAcceptQROrders, setSysAutoAcceptQROrders] = useState(false);
  const [sysQrOrdersAutomatischAfrekenen, setSysQrOrdersAutomatischAfrekenen] = useState(false);
  const [sysEnkelQROrdersKeukenscherm, setSysEnkelQROrdersKeukenscherm] = useState(false);
  const [sysAspect169Windows, setSysAspect169Windows] = useState(false);
  const [sysVatRateVariousProducts, setSysVatRateVariousProducts] = useState('12');
  const [sysArrangeProductsManually, setSysArrangeProductsManually] = useState(true);
  const [sysLimitOneUserPerTable, setSysLimitOneUserPerTable] = useState(false);
  const [sysOneWachtorderPerKlant, setSysOneWachtorderPerKlant] = useState(false);
  const [sysCashButtonVisibleMultiplePayment, setSysCashButtonVisibleMultiplePayment] = useState(true);
  const [sysUsePlaceSettings, setSysUsePlaceSettings] = useState(false);
  const [sysTegoedAutomatischInladen, setSysTegoedAutomatischInladen] = useState(true);
  const [sysNieuwstePrijsGebruiken, setSysNieuwstePrijsGebruiken] = useState(true);
  const [sysLeeggoedTerugname, setSysLeeggoedTerugname] = useState('by-customers-name');
  const [sysKlantgegevensQRAfdrukken, setSysKlantgegevensQRAfdrukken] = useState(false);
  const [savingSystemSettings, setSavingSystemSettings] = useState(false);
  const [sysPriceTakeAway, setSysPriceTakeAway] = useState('');
  const [sysPriceDelivery, setSysPriceDelivery] = useState('');
  const [sysPriceCounterSale, setSysPriceCounterSale] = useState('');
  const [sysPriceTableSale, setSysPriceTableSale] = useState('');
  const [sysSavingsPointsPerEuro, setSysSavingsPointsPerEuro] = useState(0);
  const [sysSavingsPointsPerDiscount, setSysSavingsPointsPerDiscount] = useState(0);
  const [sysSavingsDiscount, setSysSavingsDiscount] = useState('');
  const [sysTicketVoucherValidity, setSysTicketVoucherValidity] = useState('3');
  const [sysTicketScheduledPrintMode, setSysTicketScheduledPrintMode] = useState('label-large');
  const [sysTicketScheduledCustomerSort, setSysTicketScheduledCustomerSort] = useState('as-registered');
  const [sysBarcodeType, setSysBarcodeType] = useState('Code39');

  const [paymentTypes, setPaymentTypes] = useState(() => {
    try {
      const raw = typeof localStorage !== 'undefined' && localStorage.getItem('pos_payment_types');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch (_) { }
    return DEFAULT_PAYMENT_TYPES.map((p, i) => ({ ...p, sortOrder: i }));
  });
  const [showPaymentTypeModal, setShowPaymentTypeModal] = useState(false);
  const [editingPaymentTypeId, setEditingPaymentTypeId] = useState(null);
  const [paymentTypeName, setPaymentTypeName] = useState('');
  const [paymentTypeActive, setPaymentTypeActive] = useState(true);
  const [savingPaymentType, setSavingPaymentType] = useState(false);
  const [paymentTypesPage, setPaymentTypesPage] = useState(0);
  const PAYMENT_TYPES_PAGE_SIZE = 5;
  const PAYMENT_TYPES_PAGE_SIZE1 = 8;

  const [showProductionMessagesModal, setShowProductionMessagesModal] = useState(false);
  const [productionMessages, setProductionMessages] = useState([]);
  const [productionMessageInput, setProductionMessageInput] = useState('');
  const [productionMessagesPage, setProductionMessagesPage] = useState(0);
  const PRODUCTION_MESSAGES_PAGE_SIZE = 5;
  const PRODUCTION_MESSAGES_PAGE_SIZE1 = 8;
  const [editingProductionMessageId, setEditingProductionMessageId] = useState(null);
  const [deleteConfirmProductionMessageId, setDeleteConfirmProductionMessageId] = useState(null);

  const [printerTab, setPrinterTab] = useState('General');
  const [printers, setPrinters] = useState(() => {
    try {
      const raw = typeof localStorage !== 'undefined' && localStorage.getItem('pos_printers');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch (_) { }
    return DEFAULT_PRINTERS.map((p, i) => ({ ...p, sortOrder: i }));
  });
  const [showPrinterModal, setShowPrinterModal] = useState(false);
  const [editingPrinterId, setEditingPrinterId] = useState(null);
  const [deleteConfirmPrinterId, setDeleteConfirmPrinterId] = useState(null);
  const [printersPage, setPrintersPage] = useState(0);
  const PRINTERS_PAGE_SIZE = 7;

  const [finalTicketsCompanyData1, setFinalTicketsCompanyData1] = useState('BE.0.0.0');
  const [finalTicketsCompanyData2, setFinalTicketsCompanyData2] = useState('');
  const [finalTicketsCompanyData3, setFinalTicketsCompanyData3] = useState('');
  const [finalTicketsCompanyData4, setFinalTicketsCompanyData4] = useState('');
  const [finalTicketsCompanyData5, setFinalTicketsCompanyData5] = useState('');
  const [finalTicketsThankText, setFinalTicketsThankText] = useState('Thank you and goodbye');
  const [finalTicketsProforma, setFinalTicketsProforma] = useState(false);
  const [finalTicketsPrintPaymentType, setFinalTicketsPrintPaymentType] = useState(false);
  const [finalTicketsTicketTearable, setFinalTicketsTicketTearable] = useState(false);
  const [finalTicketsPrintLogo, setFinalTicketsPrintLogo] = useState(false);
  const [finalTicketsPrintingOrder, setFinalTicketsPrintingOrder] = useState('as-registered');
  const [finalTicketsActiveField, setFinalTicketsActiveField] = useState(null);
  const [savingFinalTickets, setSavingFinalTickets] = useState(false);

  const [prodTicketsDisplayCategories, setProdTicketsDisplayCategories] = useState(false);
  const [prodTicketsSpaceAbove, setProdTicketsSpaceAbove] = useState(false);
  const [prodTicketsTicketTearable, setProdTicketsTicketTearable] = useState(false);
  const [prodTicketsKeukenprinterBuzzer, setProdTicketsKeukenprinterBuzzer] = useState(false);
  const [prodTicketsProductenIndividueel, setProdTicketsProductenIndividueel] = useState(false);
  const [prodTicketsEatInTakeOutOnderaan, setProdTicketsEatInTakeOutOnderaan] = useState(false);
  const [prodTicketsNextCoursePrinter1, setProdTicketsNextCoursePrinter1] = useState('disabled');
  const [prodTicketsNextCoursePrinter2, setProdTicketsNextCoursePrinter2] = useState('disabled');
  const [prodTicketsNextCoursePrinter3, setProdTicketsNextCoursePrinter3] = useState('disabled');
  const [prodTicketsNextCoursePrinter4, setProdTicketsNextCoursePrinter4] = useState('disabled');
  const [prodTicketsPrintingOrder, setProdTicketsPrintingOrder] = useState('as-registered');
  const [prodTicketsGroupingReceipt, setProdTicketsGroupingReceipt] = useState('enable');
  const [prodTicketsPrinterOverboeken, setProdTicketsPrinterOverboeken] = useState('disabled');
  const [savingProdTickets, setSavingProdTickets] = useState(false);

  const [labelsType, setLabelsType] = useState('production-labels');
  const [labelsPrinter, setLabelsPrinter] = useState('p3');
  const [labelsList, setLabelsList] = useState(() => {
    try {
      const raw = typeof localStorage !== 'undefined' && localStorage.getItem('pos_printer_labels_list');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch (_) { }
    return DEFAULT_LABELS_LIST.map((l, i) => ({ ...l, sortOrder: i }));
  });
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [editingLabelId, setEditingLabelId] = useState(null);
  const [labelName, setLabelName] = useState('');
  const [labelHeight, setLabelHeight] = useState('');
  const [labelWidth, setLabelWidth] = useState('');
  const [labelStandard, setLabelStandard] = useState(false);
  const [labelMarginLeft, setLabelMarginLeft] = useState('0');
  const [labelMarginRight, setLabelMarginRight] = useState('0');
  const [labelMarginBottom, setLabelMarginBottom] = useState('0');
  const [labelMarginTop, setLabelMarginTop] = useState('0');
  const [deleteConfirmLabelId, setDeleteConfirmLabelId] = useState(null);
  const [labelsListPage, setLabelsListPage] = useState(0);

  const [priceDisplayType, setPriceDisplayType] = useState('disabled');
  const [priceDisplayKeyboardValue, setPriceDisplayKeyboardValue] = useState('');
  const [savingPriceDisplay, setSavingPriceDisplay] = useState(false);

  const [rfidReaderType, setRfidReaderType] = useState('disabled');
  const [rfidReaderKeyboardValue, setRfidReaderKeyboardValue] = useState('');
  const [savingRfidReader, setSavingRfidReader] = useState(false);

  const [barcodeScannerType, setBarcodeScannerType] = useState('serial');
  const [barcodeScannerPort, setBarcodeScannerPort] = useState('COM 1');
  const [barcodeScannerKeyboardValue, setBarcodeScannerKeyboardValue] = useState('');
  const [savingBarcodeScanner, setSavingBarcodeScanner] = useState(false);

  const [creditCardType, setCreditCardType] = useState('disabled');
  const [creditCardKeyboardValue, setCreditCardKeyboardValue] = useState('');
  const [savingCreditCard, setSavingCreditCard] = useState(false);

  const [scaleType, setScaleType] = useState('disabled');
  const [scalePort, setScalePort] = useState('');
  const [scaleKeyboardValue, setScaleKeyboardValue] = useState('');
  const [savingScale, setSavingScale] = useState(false);

  const [cashmaticName, setCashmaticName] = useState('Cashmatic Terminal');
  const [cashmaticConnectionType, setCashmaticConnectionType] = useState('tcp');
  const [cashmaticIpAddress, setCashmaticIpAddress] = useState('');
  const [cashmaticPort, setCashmaticPort] = useState('');
  const [cashmaticUsername, setCashmaticUsername] = useState('');
  const [cashmaticPassword, setCashmaticPassword] = useState('');
  const [cashmaticUrl, setCashmaticUrl] = useState('');
  const [cashmaticActiveField, setCashmaticActiveField] = useState('name');
  const [savingCashmatic, setSavingCashmatic] = useState(false);
  const [cashmaticTerminalId, setCashmaticTerminalId] = useState(null);

  const [payworldName, setPayworldName] = useState('Payworld Terminal');
  const [payworldIpAddress, setPayworldIpAddress] = useState('');
  const [payworldPort, setPayworldPort] = useState('5015');
  const [payworldActiveField, setPayworldActiveField] = useState('name');
  const [savingPayworld, setSavingPayworld] = useState(false);
  const [payworldTerminalId, setPayworldTerminalId] = useState(null);

  const [subproductGroups, setSubproductGroups] = useState([]);
  const [subproductGroupsLoading, setSubproductGroupsLoading] = useState(false);
  const [selectedSubproductGroupId, setSelectedSubproductGroupId] = useState(null);
  const [selectedSubproductId, setSelectedSubproductId] = useState(null);
  const [subproducts, setSubproducts] = useState([]);
  const [subproductsLoading, setSubproductsLoading] = useState(false);
  const [subproductSearch, setSubproductSearch] = useState('');
  const [showSubproductModal, setShowSubproductModal] = useState(false);
  const [showManageGroupsModal, setShowManageGroupsModal] = useState(false);
  const [editingSubproductId, setEditingSubproductId] = useState(null);
  const [subproductName, setSubproductName] = useState('');
  const [subproductKeyName, setSubproductKeyName] = useState('');
  const [subproductProductionName, setSubproductProductionName] = useState('');
  const [subproductActiveField, setSubproductActiveField] = useState('name');
  const [subproductPrice, setSubproductPrice] = useState('');
  const [subproductVatTakeOut, setSubproductVatTakeOut] = useState('');
  const [subproductVatEatIn, setSubproductVatEatIn] = useState('');
  const [subproductModalGroupId, setSubproductModalGroupId] = useState(null);
  const [subproductKioskPicture, setSubproductKioskPicture] = useState('');
  const [subproductAttachToCategoryIds, setSubproductAttachToCategoryIds] = useState([]);
  const [subproductAddCategoryId, setSubproductAddCategoryId] = useState('');
  const [savingSubproduct, setSavingSubproduct] = useState(false);
  const [deleteConfirmSubproductId, setDeleteConfirmSubproductId] = useState(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [showAddGroupInline, setShowAddGroupInline] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [editingGroupName, setEditingGroupName] = useState('');
  const [deleteConfirmGroupId, setDeleteConfirmGroupId] = useState(null);
  const [savingGroup, setSavingGroup] = useState(false);
  const [selectedManageGroupId, setSelectedManageGroupId] = useState(null);

  const showToast = useCallback((type, text) => {
    setToast({ id: Date.now(), type, text });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const fetchPriceGroups = useCallback(async () => {
    setPriceGroupsLoading(true);
    try {
      const res = await fetch(`${API}/price-groups`);
      const data = await res.json();
      setPriceGroups(Array.isArray(data) ? data : []);
    } catch {
      setPriceGroups([]);
    } finally {
      setPriceGroupsLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      const res = await fetch(`${API}/categories`);
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (subNavId === 'Price Groups') fetchPriceGroups();
  }, [subNavId, fetchPriceGroups]);

  useEffect(() => {
    if (subNavId === 'Categories') fetchCategories();
  }, [subNavId, fetchCategories]);

  useEffect(() => {
    if (topNavId !== 'categories-products' || subNavId !== 'Categories') setCategoriesPage(0);
  }, [topNavId, subNavId]);

  useEffect(() => {
    if (topNavId !== 'categories-products' || subNavId !== 'Products') setProductsPage(0);
  }, [topNavId, subNavId]);
  useEffect(() => {
    setProductsPage(0);
  }, [selectedCategoryId]);

  const [subproductsPage, setSubproductsPage] = useState(0);
  const [kitchenMessagesPage, setKitchenMessagesPage] = useState(0);
  const [discountsPage, setDiscountsPage] = useState(0);
  useEffect(() => {
    if (topNavId !== 'categories-products' || subNavId !== 'Subproducts') setSubproductsPage(0);
  }, [topNavId, subNavId]);
  useEffect(() => { setSubproductsPage(0); }, [selectedSubproductGroupId]);
  useEffect(() => {
    if (topNavId !== 'categories-products' || subNavId !== 'Kitchen messages') setKitchenMessagesPage(0);
  }, [topNavId, subNavId]);
  useEffect(() => {
    if (topNavId === 'categories-products' && subNavId === 'Kitchen messages') {
      setSubNavId('Price Groups');
    }
  }, [topNavId, subNavId]);
  useEffect(() => {
    if (topNavId !== 'categories-products' || subNavId !== 'Discounts') setDiscountsPage(0);
  }, [topNavId, subNavId]);

  useEffect(() => {
    if (subNavId === 'Products') fetchCategories();
  }, [subNavId, fetchCategories]);

  useEffect(() => {
    if (showProductModal) fetchPriceGroups();
  }, [showProductModal, fetchPriceGroups]);

  useEffect(() => {
    if (!showProductModal || !priceGroups.length) return;
    setExtraPricesRows((prev) => {
      const byId = new Map(prev.filter((r) => r.priceGroupId).map((r) => [r.priceGroupId, r]));
      return priceGroups.map((pg) => {
        const ex = byId.get(pg.id);
        return {
          priceGroupId: pg.id,
          priceGroupLabel: pg.name,
          otherName: ex?.otherName ?? '',
          otherPrinter: ex?.otherPrinter ?? '',
          otherPrice: ex?.otherPrice ?? ''
        };
      });
    });
  }, [showProductModal, priceGroups]);

  const fetchProducts = useCallback(async (categoryId) => {
    if (!categoryId) {
      setProducts([]);
      return;
    }
    setProductsLoading(true);
    try {
      const res = await fetch(`${API}/categories/${categoryId}/products`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (subNavId === 'Products' && selectedCategoryId) fetchProducts(selectedCategoryId);
  }, [subNavId, selectedCategoryId, fetchProducts]);

  useEffect(() => {
    if (subNavId === 'Products' && categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [subNavId, categories, selectedCategoryId]);

  useEffect(() => {
    if (!showProductPositioningModal) return;
    if (!positioningCategoryId && categories.length > 0) {
      setPositioningCategoryId(selectedCategoryId || categories[0].id);
    }
  }, [showProductPositioningModal, positioningCategoryId, categories, selectedCategoryId]);

  useEffect(() => {
    let alive = true;
    const loadSavedPositioningLayout = async () => {
      try {
        const res = await fetch(`${API}/settings/product-positioning-layout`);
        const data = await res.json().catch(() => null);
        const value = data?.value;
        if (alive && value && typeof value === 'object') {
          setPositioningLayoutByCategory(value);
          return;
        }
      } catch {
        // fallback to local draft when api is unavailable
      }
      try {
        const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('pos_product_positioning_layout') : null;
        if (alive && raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') setPositioningLayoutByCategory(parsed);
        }
      } catch {
        // ignore broken local positioning data
      }
    };
    loadSavedPositioningLayout();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    const loadSavedPositioningColors = async () => {
      try {
        const res = await fetch(`${API}/settings/product-positioning-colors`);
        const data = await res.json().catch(() => null);
        const value = data?.value;
        if (alive && value && typeof value === 'object') {
          setPositioningColorByCategory(value);
          return;
        }
      } catch {
        // fallback to local draft when api is unavailable
      }
      try {
        const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('pos_product_positioning_colors') : null;
        if (alive && raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') setPositioningColorByCategory(parsed);
        }
      } catch {
        // ignore broken local color data
      }
    };
    loadSavedPositioningColors();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('pos_product_positioning_layout', JSON.stringify(positioningLayoutByCategory));
      }
    } catch {
      // ignore localStorage write failures
    }
  }, [positioningLayoutByCategory]);

  useEffect(() => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('pos_product_positioning_colors', JSON.stringify(positioningColorByCategory));
      }
    } catch {
      // ignore localStorage write failures
    }
  }, [positioningColorByCategory]);

  const fetchPositioningSubproducts = useCallback(async (categoryId) => {
    if (!categoryId) {
      setPositioningSubproducts([]);
      return;
    }
    try {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('pos_subproduct_extra') : null;
      const extraMap = raw ? JSON.parse(raw) : {};
      const attachedIds = Object.entries(extraMap || {})
        .filter(([, value]) => Array.isArray(value?.attachToCategoryIds) && value.attachToCategoryIds.includes(categoryId))
        .map(([id]) => id);
      if (attachedIds.length === 0) {
        setPositioningSubproducts([]);
        return;
      }
      const groupsRes = await fetch(`${API}/subproduct-groups`);
      const groups = await groupsRes.json().catch(() => []);
      const safeGroups = Array.isArray(groups) ? groups : [];
      const listNested = await Promise.all(
        safeGroups.map(async (g) => {
          const res = await fetch(`${API}/subproduct-groups/${g.id}/subproducts`);
          const data = await res.json().catch(() => []);
          return Array.isArray(data) ? data : [];
        })
      );
      const allSubproducts = listNested.flat();
      const filtered = allSubproducts
        .filter((sp) => attachedIds.includes(sp.id))
        .map((sp) => {
          const ex = extraMap?.[sp.id] || {};
          const parsedPrice = parseFloat(ex?.price);
          return {
            ...sp,
            type: 'subproduct',
            _positioningId: `s:${sp.id}`,
            _positioningPrice: Number.isFinite(parsedPrice) ? parsedPrice : Number(sp.price ?? 0),
          };
        });
      setPositioningSubproducts(filtered);
    } catch {
      setPositioningSubproducts([]);
    }
  }, []);

  useEffect(() => {
    if (!showProductPositioningModal) return;
    const categoryId = positioningCategoryId || selectedCategoryId || categories[0]?.id || null;
    if (!categoryId) return;
    fetchProducts(categoryId);
    fetchPositioningSubproducts(categoryId);
  }, [showProductPositioningModal, positioningCategoryId, selectedCategoryId, categories, fetchProducts, fetchPositioningSubproducts]);

  useEffect(() => {
    if (!showProductPositioningModal) return;
    const categoryId = positioningCategoryId || selectedCategoryId || categories[0]?.id || null;
    if (!categoryId) return;
    setPositioningLayoutByCategory((prev) => {
      if (Array.isArray(prev?.[categoryId])) return prev;
      // Persist explicit empty layout so POS does not auto-fallback to full product list.
      return { ...prev, [categoryId]: Array.from({ length: 25 }, () => null) };
    });
  }, [showProductPositioningModal, positioningCategoryId, selectedCategoryId, categories]);

  const openProductPositioningModal = () => {
    setPositioningCategoryId(selectedCategoryId || categories[0]?.id || null);
    setPositioningSelectedProductId(null);
    setPositioningSelectedCellIndex(null);
    setShowProductPositioningModal(true);
  };

  const closeProductPositioningModal = () => {
    setShowProductPositioningModal(false);
    setPositioningSelectedProductId(null);
    setPositioningSelectedCellIndex(null);
    setPositioningLayoutSaveMessage('');
  };

  const saveProductPositioningLayout = useCallback(async () => {
    setSavingPositioningLayout(true);
    setPositioningLayoutSaveMessage('');
    try {
      const [layoutRes, colorRes] = await Promise.all([
        fetch(`${API}/settings/product-positioning-layout`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value: positioningLayoutByCategory || {} })
        }),
        fetch(`${API}/settings/product-positioning-colors`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value: positioningColorByCategory || {} })
        })
      ]);
      if (!layoutRes.ok || !colorRes.ok) {
        const layoutErr = layoutRes.ok ? null : await layoutRes.json().catch(() => null);
        const colorErr = colorRes.ok ? null : await colorRes.json().catch(() => null);
        throw new Error(layoutErr?.error || colorErr?.error || 'Failed to save positioning layout');
      }
      setPositioningLayoutSaveMessage('Layout and colors saved');
    } catch (err) {
      setPositioningLayoutSaveMessage(err?.message || 'Failed to save layout');
    } finally {
      setSavingPositioningLayout(false);
    }
  }, [positioningLayoutByCategory, positioningColorByCategory]);

  const fetchSubproductGroups = useCallback(async () => {
    setSubproductGroupsLoading(true);
    try {
      const res = await fetch(`${API}/subproduct-groups`);
      const data = await res.json();
      setSubproductGroups(Array.isArray(data) ? data : []);
    } catch {
      setSubproductGroups([]);
    } finally {
      setSubproductGroupsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (subNavId === 'Subproducts') {
      fetchSubproductGroups();
      fetchCategories();
    }
  }, [subNavId, fetchSubproductGroups, fetchCategories]);

  const fetchTableLocations = useCallback(async () => {
    setTableLocationsLoading(true);
    try {
      const res = await fetch(`${API}/rooms`);
      const data = await res.json();
      setTableLocations(Array.isArray(data) ? data : []);
    } catch {
      setTableLocations([]);
    } finally {
      setTableLocationsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (topNavId === 'tables') fetchTableLocations();
  }, [topNavId, fetchTableLocations]);

  useEffect(() => {
    if (topNavId !== 'tables') setTableLocationsPage(0);
  }, [topNavId]);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await fetch(`${API}/users`);
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (controlSidebarId === 'users') fetchUsers();
    if (controlSidebarId !== 'users') setUsersPage(0);
  }, [controlSidebarId, fetchUsers]);

  const fetchSubproducts = useCallback(async (groupId) => {
    if (!groupId) {
      setSubproducts([]);
      return;
    }
    setSubproductsLoading(true);
    try {
      const res = await fetch(`${API}/subproduct-groups/${groupId}/subproducts`);
      const data = await res.json();
      setSubproducts(Array.isArray(data) ? data : []);
    } catch {
      setSubproducts([]);
    } finally {
      setSubproductsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (subNavId === 'Subproducts' && selectedSubproductGroupId) fetchSubproducts(selectedSubproductGroupId);
  }, [subNavId, selectedSubproductGroupId, fetchSubproducts]);

  useEffect(() => {
    if (subNavId === 'Subproducts' && subproductGroups.length > 0 && !selectedSubproductGroupId) {
      setSelectedSubproductGroupId(subproductGroups[0].id);
    }
  }, [subNavId, subproductGroups, selectedSubproductGroupId]);

  const openProductSubproductsModal = useCallback(async (product) => {
    setProductSubproductsProduct(product);
    let groups = subproductGroups;
    if (!groups.length) {
      try {
        const res = await fetch(`${API}/subproduct-groups`);
        const data = await res.json().catch(() => []);
        groups = Array.isArray(data) ? data : [];
        setSubproductGroups(groups);
      } catch {
        groups = [];
      }
    }
    setProductSubproductsGroupId('');
    setProductSubproductsSelectedId('');
    setProductSubproductsOptions([]);
    setProductSubproductsLinked([]);
    setLoadingProductSubproductsLinked(true);
    try {
      const res = await fetch(`${API}/products/${product.id}/subproduct-links`);
      const data = await res.json().catch(() => []);
      const links = Array.isArray(data) ? data : [];
      setProductSubproductsLinked(links.map((l) => ({
        subproductId: l.subproductId,
        subproductName: l.subproductName,
        groupId: l.groupId || '',
        groupName: l.groupName || ''
      })));
      // Only preselect group when this product already has linked subproducts.
      const firstLinkedGroupId = links.find((l) => l?.groupId)?.groupId || '';
      if (firstLinkedGroupId && groups.some((g) => g.id === firstLinkedGroupId)) {
        setProductSubproductsGroupId(firstLinkedGroupId);
      }
    } catch {
      setProductSubproductsLinked([]);
    } finally {
      setLoadingProductSubproductsLinked(false);
    }
    setShowProductSubproductsModal(true);
  }, [subproductGroups]);

  const closeProductSubproductsModal = useCallback(() => {
    setShowProductSubproductsModal(false);
    setProductSubproductsProduct(null);
    setProductSubproductsGroupId('');
    setProductSubproductsSelectedId('');
    setProductSubproductsOptions([]);
    setProductSubproductsLinked([]);
    setLoadingProductSubproductsLinked(false);
    setSavingProductSubproducts(false);
  }, []);

  useEffect(() => {
    if (!showProductSubproductsModal || !productSubproductsGroupId) {
      setProductSubproductsOptions([]);
      setProductSubproductsSelectedId('');
      return;
    }
    let alive = true;
    const loadGroupSubproducts = async () => {
      try {
        const res = await fetch(`${API}/subproduct-groups/${productSubproductsGroupId}/subproducts`);
        const data = await res.json().catch(() => []);
        if (!alive) return;
        const list = Array.isArray(data) ? data : [];
        setProductSubproductsOptions(list);
        // Keep placeholder selected by default when a group is chosen.
        setProductSubproductsSelectedId('');
      } catch {
        if (!alive) return;
        setProductSubproductsOptions([]);
        setProductSubproductsSelectedId('');
      }
    };
    loadGroupSubproducts();
    return () => {
      alive = false;
    };
  }, [showProductSubproductsModal, productSubproductsGroupId]);

  const handleAddProductSubproductLink = useCallback(() => {
    if (!productSubproductsSelectedId) return;
    const selected = productSubproductsOptions.find((sp) => sp.id === productSubproductsSelectedId);
    if (!selected) return;
    let added = false;
    setProductSubproductsLinked((prev) => {
      if (prev.some((x) => x.subproductId === selected.id)) return prev;
      const group = subproductGroups.find((g) => g.id === productSubproductsGroupId);
      added = true;
      return [
        ...prev,
        {
          subproductId: selected.id,
          subproductName: selected.name,
          groupId: group?.id || productSubproductsGroupId || '',
          groupName: group?.name || ''
        }
      ];
    });
    if (added) setProductSubproductsSelectedId('');
  }, [productSubproductsSelectedId, productSubproductsOptions, subproductGroups, productSubproductsGroupId]);

  const moveProductSubproductLink = useCallback((index, direction) => {
    setProductSubproductsLinked((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (index < 0 || index >= next.length || target < 0 || target >= next.length) return prev;
      const tmp = next[index];
      next[index] = next[target];
      next[target] = tmp;
      return next;
    });
  }, []);

  const removeProductSubproductLink = useCallback((subproductId) => {
    setProductSubproductsLinked((prev) => prev.filter((x) => x.subproductId !== subproductId));
  }, []);

  const handleSaveProductSubproducts = useCallback(async () => {
    if (!productSubproductsProduct?.id) return;
    setSavingProductSubproducts(true);
    try {
      const linksPayload = productSubproductsLinked.map((l) => ({
        groupId: l.groupId || '',
        subproductId: l.subproductId
      }));
      const res = await fetch(`${API}/products/${productSubproductsProduct.id}/subproduct-links`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ links: linksPayload })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || 'Failed to save product subproducts');
      }
      showToast('success', 'Product subproducts saved.');
      closeProductSubproductsModal();
    } catch (err) {
      showToast('error', err?.message || 'Failed to save product subproducts.');
    } finally {
      setSavingProductSubproducts(false);
    }
  }, [closeProductSubproductsModal, productSubproductsLinked, productSubproductsProduct, showToast]);

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    onLogout?.();
  };

  const tr = useCallback((key, fallback) => {
    const translated = t(key);
    return translated === key ? fallback : translated;
  }, [t]);
  const getFunctionButtonLabel = useCallback((id) => {
    const item = FUNCTION_BUTTON_ITEM_BY_ID[id];
    if (!item) return '';
    return tr(item.labelKey, item.fallbackLabel);
  }, [tr]);
  const getOptionButtonLabel = useCallback((id) => {
    const item = OPTION_BUTTON_ITEM_BY_ID[id];
    if (!item) return '';
    return tr(item.labelKey, item.fallbackLabel);
  }, [tr]);

  useEffect(() => {
    if (LANGUAGE_OPTIONS.some((o) => o.value === lang)) setAppLanguage(lang);
  }, [lang]);

  const handleSaveAppLanguage = () => {
    setSavingAppLanguage(true);
    try {
      setLang(appLanguage);
      showToast('success', tr('control.languageUpdated', 'Language updated.'));
    } finally {
      setSavingAppLanguage(false);
    }
  };

  const openPriceGroupModal = () => {
    setEditingPriceGroupId(null);
    setPriceGroupName('');
    setPriceGroupTax('standard');
    setShowPriceGroupModal(true);
  };

  const openEditPriceGroupModal = (pg) => {
    setEditingPriceGroupId(pg.id);
    setPriceGroupName(pg.name || '');
    setPriceGroupTax(pg.tax && VAT_OPTIONS.some((o) => o.value === pg.tax) ? pg.tax : 'standard');
    setShowPriceGroupModal(true);
  };

  const closePriceGroupModal = () => {
    setShowPriceGroupModal(false);
    setEditingPriceGroupId(null);
  };

  const handleSavePriceGroup = async () => {
    setSavingPriceGroup(true);
    const payload = { name: priceGroupName.trim() || 'New price group', tax: priceGroupTax };
    try {
      if (editingPriceGroupId) {
        const res = await fetch(`${API}/price-groups/${editingPriceGroupId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const updated = await res.json();
        if (res.ok && updated) {
          setPriceGroups((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
          closePriceGroupModal();
        } else fetchPriceGroups();
      } else {
        const res = await fetch(`${API}/price-groups`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const created = await res.json();
        if (res.ok && created) {
          setPriceGroups((prev) => [...prev, created]);
          closePriceGroupModal();
        } else fetchPriceGroups();
      }
    } catch {
      fetchPriceGroups();
    } finally {
      setSavingPriceGroup(false);
    }
  };

  const handleDeletePriceGroup = async (id) => {
    try {
      const res = await fetch(`${API}/price-groups/${id}`, { method: 'DELETE' });
      if (res.ok) setPriceGroups((prev) => prev.filter((p) => p.id !== id));
      else fetchPriceGroups();
    } catch {
      fetchPriceGroups();
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const openCategoryModal = () => {
    setEditingCategoryId(null);
    setCategoryName('');
    setCategoryNextCourse('');
    setCategoryInWebshop(true);
    setCategoryDisplayOnCashRegister(true);
    setCategoryActiveField('name');
    setShowCategoryModal(true);
  };

  const openEditCategoryModal = (cat) => {
    setEditingCategoryId(cat.id);
    setCategoryName(cat.name || '');
    setCategoryNextCourse(cat.nextCourse || '');
    setCategoryInWebshop(cat.inWebshop !== false);
    setCategoryDisplayOnCashRegister(cat.displayOnCashRegister !== false);
    setCategoryActiveField('name');
    setShowCategoryModal(true);
  };

  const closeCategoryModal = () => {
    setShowCategoryModal(false);
    setEditingCategoryId(null);
  };

  const handleSaveCategory = async () => {
    setSavingCategory(true);
    const payload = {
      name: categoryName.trim() || 'New category',
      inWebshop: categoryInWebshop,
      displayOnCashRegister: categoryDisplayOnCashRegister,
      nextCourse: categoryNextCourse.trim() || null
    };
    try {
      if (editingCategoryId) {
        const res = await fetch(`${API}/categories/${editingCategoryId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const updated = await res.json();
        if (res.ok && updated) {
          setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
          closeCategoryModal();
        } else fetchCategories();
      } else {
        const res = await fetch(`${API}/categories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const created = await res.json();
        if (res.ok && created) {
          setCategories((prev) => [...prev, created]);
          closeCategoryModal();
        } else fetchCategories();
      }
    } catch {
      fetchCategories();
    } finally {
      setSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      const res = await fetch(`${API}/categories/${id}`, { method: 'DELETE' });
      if (res.ok) setCategories((prev) => prev.filter((c) => c.id !== id));
      else fetchCategories();
    } catch {
      fetchCategories();
    } finally {
      setDeleteConfirmCategoryId(null);
    }
  };

  const handleMoveCategory = async (id, direction) => {
    const idx = categories.findIndex((c) => c.id === id);
    if (idx < 0) return;
    const nextIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (nextIdx < 0 || nextIdx >= categories.length) return;
    const curr = categories[idx];
    const other = categories[nextIdx];
    const currOrder = curr.sortOrder;
    const otherOrder = other.sortOrder;
    try {
      await fetch(`${API}/categories/${curr.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sortOrder: otherOrder })
      });
      await fetch(`${API}/categories/${other.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sortOrder: currOrder })
      });
      setCategories((prev) => {
        const list = [...prev];
        list[idx] = { ...list[idx], sortOrder: otherOrder };
        list[nextIdx] = { ...list[nextIdx], sortOrder: currOrder };
        return list.sort((a, b) => a.sortOrder - b.sortOrder);
      });
    } catch {
      fetchCategories();
    }
  };

  const openProductModal = () => {
    setEditingProductId(null);
    setProductTab('general');
    setProductName('');
    setProductKeyName('');
    setProductProductionName('');
    setProductPrice('');
    setProductVatTakeOut('');
    setProductVatEatIn('');
    setProductCategoryIds([selectedCategoryId || '']);
    setProductAddition('Subproducts');
    setProductBarcode('');
    setProductPrinter1('');
    setProductPrinter2('');
    setProductPrinter3('');
    setProductActiveField('name');
    setProductFieldErrors({ name: false, keyName: false, productionName: false, vatTakeOut: false, vatEatIn: false });
    setProductTabsUnlocked(false);
    setProductDisplayNumber(null);
    setAdvancedKassaPhotoPreview(null);
    setShowProductModal(true);
  };

  const openEditProductModal = (product) => {
    setEditingProductId(product.id);
    setProductTab('general');
    setProductName(product.name || '');
    setProductKeyName(product.keyName ?? '');
    setProductProductionName(product.productionName ?? '');
    setProductPrice(String(product.price ?? ''));
    setProductVatTakeOut(product.vatTakeOut ?? '');
    setProductVatEatIn(product.vatEatIn ?? '');
    let categoryIds = [product.categoryId || selectedCategoryId || ''];
    if (product.categoryIdsJson) {
      try {
        const parsed = JSON.parse(product.categoryIdsJson);
        if (Array.isArray(parsed) && parsed.length) categoryIds = parsed;
      } catch (_) { }
    }
    setProductCategoryIds(categoryIds);
    setProductAddition(product.addition ?? 'Subproducts');
    setProductBarcode(product.barcode ?? '');
    setProductPrinter1(product.printer1 || '');
    setProductPrinter2(product.printer2 || '');
    setProductPrinter3(product.printer3 || '');
    setProductActiveField('name');
    setProductFieldErrors({ name: false, keyName: false, productionName: false, vatTakeOut: false, vatEatIn: false });
    setProductTabsUnlocked(false);
    setProductDisplayNumber(product.number != null ? product.number : null);

    setAdvancedOpenPrice(!!product.openPrice);
    setAdvancedWeegschaal(!!product.weegschaal);
    setAdvancedSubproductRequires(!!product.subproductRequires);
    setAdvancedLeeggoedPrijs(product.leeggoedPrijs ?? '0.00');
    setAdvancedPagerVerplicht(!!product.pagerVerplicht);
    setAdvancedBoldPrint(!!product.boldPrint);
    setAdvancedGroupingReceipt(product.groupingReceipt !== false);
    setAdvancedLabelExtraInfo(product.labelExtraInfo ?? '');
    setAdvancedVoorverpakVervaltype(product.voorverpakVervaltype ?? 'Shelf life');
    setAdvancedHoudbareDagen(product.houdbareDagen ?? '0');
    setAdvancedBewarenGebruik(product.bewarenGebruik ?? '');
    setAdvancedKassaPhotoPreview(product.kassaPhotoPath ?? null);

    let rows = [];
    if (product.extraPricesJson) {
      try {
        const parsed = JSON.parse(product.extraPricesJson);
        if (Array.isArray(parsed)) rows = parsed;
      } catch (_) { }
    }
    setExtraPricesRows(rows);
    setExtraPricesSelectedIndex(0);

    setPurchaseVat(product.purchaseVat ?? '');
    setPurchasePriceExcl(product.purchasePriceExcl ?? '0.00');
    setPurchasePriceIncl(product.purchasePriceIncl ?? '0.00');
    setProfitPct(product.profitPct ?? '0.00');
    setPurchaseUnit(product.unit ?? 'Piece');
    setUnitContent(product.unitContent ?? '0');
    setStock(product.stock ?? '0');
    setPurchaseSupplier(product.supplierCode ?? '');
    setSupplierCode(product.supplierCode ?? '');
    setStockNotification(product.stockNotification !== false);
    setExpirationDate(product.expirationDate ?? '');
    setDeclarationExpiryDays(product.declarationExpiryDays ?? '0');
    setNotificationSoldOutPieces(product.notificationSoldOutPieces ?? '');

    setProductInWebshop(!!product.inWebshop);
    setWebshopOnlineOrderable(product.onlineOrderable !== false);
    setWebsiteRemark(product.websiteRemark ?? '');
    setWebsiteOrder(product.websiteOrder ?? '0');
    setShortWebText(product.shortWebText ?? '');
    setWebsitePhotoFileName(product.websitePhotoPath ?? '');

    setKioskInfo(product.kioskInfo ?? '');
    setKioskTakeAway(product.kioskTakeAway !== false);
    setKioskEatIn(product.kioskEatIn ?? '');
    setKioskSubtitle(product.kioskSubtitle ?? '');
    setKioskMinSubs(product.kioskMinSubs ?? 'unlimited');
    setKioskMaxSubs(product.kioskMaxSubs ?? 'unlimited');
    setKioskPictureFileName(product.kioskPicturePath ?? '');

    setShowProductModal(true);
  };

  const closeProductModal = () => {
    setAdvancedKassaPhotoPreview(null);
    setExtraPricesRows([]);
    setExtraPricesSelectedIndex(0);
    setProductCategoryIds(['']);
    setShowProductModal(false);
    setEditingProductId(null);
  };

  const validateProductRequired = () => {
    const name = !productName.trim();
    const keyName = !productKeyName.trim();
    const productionName = !productProductionName.trim();
    const vatTakeOut = !productVatTakeOut;
    const vatEatIn = !productVatEatIn;
    setProductFieldErrors({ name, keyName, productionName, vatTakeOut, vatEatIn });
    return !name && !keyName && !productionName && !vatTakeOut && !vatEatIn;
  };

  const buildProductPayload = () => {
    const categoryId = (productCategoryIds[0] || '') || selectedCategoryId;
    const payload = {
      name: productName.trim() || 'New product',
      price: parseFloat(productPrice) || 0,
      categoryId: categoryId || undefined,
      keyName: productKeyName.trim() || null,
      productionName: productProductionName.trim() || null,
      vatTakeOut: productVatTakeOut || null,
      vatEatIn: productVatEatIn || null,
      barcode: productBarcode.trim() || null,
      printer1: productPrinter1 || null,
      printer2: productPrinter2 || null,
      printer3: productPrinter3 || null,
      addition: productAddition || null,
      categoryIdsJson: JSON.stringify(productCategoryIds.filter(Boolean)),
      openPrice: advancedOpenPrice,
      weegschaal: advancedWeegschaal,
      subproductRequires: advancedSubproductRequires,
      leeggoedPrijs: advancedLeeggoedPrijs || null,
      pagerVerplicht: advancedPagerVerplicht,
      boldPrint: advancedBoldPrint,
      groupingReceipt: advancedGroupingReceipt,
      labelExtraInfo: advancedLabelExtraInfo.trim() || null,
      kassaPhotoPath: advancedKassaPhotoPreview || null,
      voorverpakVervaltype: advancedVoorverpakVervaltype || null,
      houdbareDagen: advancedHoudbareDagen || null,
      bewarenGebruik: advancedBewarenGebruik.trim() || null,
      extraPricesJson: JSON.stringify(extraPricesRows.map((r) => ({ priceGroupId: r.priceGroupId, priceGroupLabel: r.priceGroupLabel, otherName: r.otherName || '', otherPrinter: r.otherPrinter || '', otherPrice: r.otherPrice || '' }))),
      purchaseVat: purchaseVat || null,
      purchasePriceExcl: purchasePriceExcl || null,
      purchasePriceIncl: purchasePriceIncl || null,
      profitPct: profitPct || null,
      unit: purchaseUnit || null,
      unitContent: unitContent || null,
      stock: stock || null,
      supplierCode: supplierCode.trim() || null,
      stockNotification: stockNotification,
      expirationDate: expirationDate || null,
      declarationExpiryDays: declarationExpiryDays || null,
      notificationSoldOutPieces: notificationSoldOutPieces || null,
      inWebshop: productInWebshop,
      onlineOrderable: webshopOnlineOrderable,
      websiteRemark: websiteRemark.trim() || null,
      websiteOrder: websiteOrder || null,
      shortWebText: shortWebText.trim() || null,
      websitePhotoPath: websitePhotoFileName || null,
      kioskInfo: kioskInfo.trim() || null,
      kioskTakeAway: kioskTakeAway,
      kioskEatIn: kioskEatIn.trim() || null,
      kioskSubtitle: kioskSubtitle.trim() || null,
      kioskMinSubs: kioskMinSubs || null,
      kioskMaxSubs: kioskMaxSubs || null,
      kioskPicturePath: kioskPictureFileName || null
    };
    return payload;
  };

  const handleSaveProduct = async () => {
    if (!validateProductRequired()) return;
    const categoryId = (productCategoryIds[0] || '') || selectedCategoryId;
    if (!categoryId) return;
    setSavingProduct(true);
    const payload = buildProductPayload();
    try {
      if (editingProductId) {
        const res = await fetch(`${API}/products/${editingProductId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const updated = await res.json();
        if (res.ok && updated) {
          setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
          closeProductModal();
        } else fetchProducts(selectedCategoryId);
      } else {
        const res = await fetch(`${API}/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, categoryId })
        });
        const created = await res.json();
        if (res.ok && created) {
          setProducts((prev) => [...prev, created].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)));
          closeProductModal();
        } else fetchProducts(selectedCategoryId);
      }
    } catch {
      fetchProducts(selectedCategoryId);
    } finally {
      setSavingProduct(false);
    }
  };

  const productKeyboardValue = productActiveField === 'name' ? productName : productActiveField === 'keyName' ? productKeyName : productActiveField === 'productionName' ? productProductionName : productActiveField === 'price' ? productPrice : productActiveField === 'barcode' ? productBarcode : productActiveField === 'leeggoedPrijs' ? advancedLeeggoedPrijs : productActiveField === 'labelExtraInfo' ? advancedLabelExtraInfo : productActiveField === 'houdbareDagen' ? advancedHoudbareDagen : productActiveField === 'bewarenGebruik' ? advancedBewarenGebruik : productActiveField === 'extraOtherName' ? (extraPricesRows[extraPricesSelectedIndex]?.otherName ?? '') : productActiveField === 'extraOtherPrice' ? (extraPricesRows[extraPricesSelectedIndex]?.otherPrice ?? '') : productActiveField === 'purchasePriceExcl' ? purchasePriceExcl : productActiveField === 'purchasePriceIncl' ? purchasePriceIncl : productActiveField === 'profitPct' ? profitPct : productActiveField === 'unitContent' ? unitContent : productActiveField === 'stock' ? stock : productActiveField === 'supplierCode' ? supplierCode : productActiveField === 'expirationDate' ? expirationDate : productActiveField === 'declarationExpiryDays' ? declarationExpiryDays : productActiveField === 'notificationSoldOutPieces' ? notificationSoldOutPieces : productActiveField === 'websiteRemark' ? websiteRemark : productActiveField === 'websiteOrder' ? websiteOrder : productActiveField === 'shortWebText' ? shortWebText : productActiveField === 'kioskInfo' ? kioskInfo : productActiveField === 'kioskEatIn' ? kioskEatIn : productActiveField === 'kioskSubtitle' ? kioskSubtitle : '';
  const productKeyboardOnChange = productActiveField === 'name'
    ? (v) => {
      // Typing in Name should mirror to Test name and Production name.
      setProductName(v);
      setProductKeyName(v);
      setProductProductionName(v);
      setProductFieldErrors((e) => ({ ...e, name: false, keyName: false, productionName: false }));
    }
    : productActiveField === 'keyName'
      ? (v) => { setProductKeyName(v); setProductFieldErrors((e) => ({ ...e, keyName: false })); }
      : productActiveField === 'productionName'
        ? (v) => { setProductProductionName(v); setProductFieldErrors((e) => ({ ...e, productionName: false })); }
        : productActiveField === 'price'
          ? setProductPrice
          : productActiveField === 'barcode'
            ? setProductBarcode
            : productActiveField === 'leeggoedPrijs'
              ? setAdvancedLeeggoedPrijs
              : productActiveField === 'labelExtraInfo'
                ? setAdvancedLabelExtraInfo
                : productActiveField === 'houdbareDagen'
                  ? setAdvancedHoudbareDagen
                  : productActiveField === 'bewarenGebruik'
                    ? setAdvancedBewarenGebruik
                    : productActiveField === 'extraOtherName'
                      ? (v) => setExtraPricesRows((prev) => { const next = prev.map((r, i) => i === extraPricesSelectedIndex ? { ...r, otherName: v } : r); return next; })
                      : productActiveField === 'extraOtherPrice'
                        ? (v) => setExtraPricesRows((prev) => { const next = prev.map((r, i) => i === extraPricesSelectedIndex ? { ...r, otherPrice: v } : r); return next; })
                        : productActiveField === 'purchasePriceExcl'
                          ? setPurchasePriceExcl
                          : productActiveField === 'purchasePriceIncl'
                            ? setPurchasePriceIncl
                            : productActiveField === 'profitPct'
                              ? setProfitPct
                              : productActiveField === 'unitContent'
                                ? setUnitContent
                                : productActiveField === 'stock'
                                  ? setStock
                                  : productActiveField === 'supplierCode'
                                    ? setSupplierCode
                                    : productActiveField === 'expirationDate'
                                      ? setExpirationDate
                                      : productActiveField === 'declarationExpiryDays'
                                        ? setDeclarationExpiryDays
                                        : productActiveField === 'notificationSoldOutPieces'
                                          ? setNotificationSoldOutPieces
                                          : productActiveField === 'websiteRemark'
                                            ? setWebsiteRemark
                                            : productActiveField === 'websiteOrder'
                                              ? setWebsiteOrder
                                              : productActiveField === 'shortWebText'
                                                ? setShortWebText
                                                : productActiveField === 'kioskInfo'
                                                  ? setKioskInfo
                                                  : productActiveField === 'kioskEatIn'
                                                    ? setKioskEatIn
                                                    : productActiveField === 'kioskSubtitle'
                                                      ? setKioskSubtitle
                                                      : () => { };

  const handleGenerateBarcode = () => {
    const digits = Array.from({ length: 13 }, () => Math.floor(Math.random() * 10)).join('');
    setProductBarcode(digits);
    setBarcodeButtonSpinning(true);
    setTimeout(() => setBarcodeButtonSpinning(false), 600);
  };

  const handleDeleteProduct = async (id) => {
    try {
      const res = await fetch(`${API}/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        if (selectedProductId === id) setSelectedProductId(null);
      } else fetchProducts(selectedCategoryId);
    } catch {
      fetchProducts(selectedCategoryId);
    } finally {
      setDeleteConfirmProductId(null);
    }
  };

  const handleMoveProduct = async (direction) => {
    if (!selectedProductId) return;
    const idx = products.findIndex((p) => p.id === selectedProductId);
    if (idx < 0) return;
    const nextIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (nextIdx < 0 || nextIdx >= products.length) return;
    const curr = products[idx];
    const other = products[nextIdx];
    const currOrder = curr.sortOrder ?? idx;
    const otherOrder = other.sortOrder ?? nextIdx;
    try {
      await fetch(`${API}/products/${curr.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sortOrder: otherOrder })
      });
      await fetch(`${API}/products/${other.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sortOrder: currOrder })
      });
      setProducts((prev) => {
        const list = [...prev];
        list[idx] = { ...list[idx], sortOrder: otherOrder };
        list[nextIdx] = { ...list[nextIdx], sortOrder: currOrder };
        return list.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      });
    } catch {
      fetchProducts(selectedCategoryId);
    }
  };

  const filteredProducts = productSearch.trim()
    ? products.filter((p) => (p.name || '').toLowerCase().includes(productSearch.trim().toLowerCase()))
    : products;

  const filteredSubproducts = subproductSearch.trim()
    ? subproducts.filter((s) => (s.name || '').toLowerCase().includes(subproductSearch.trim().toLowerCase()))
    : subproducts;

  const handleSubproductNameChange = useCallback((value) => {
    setSubproductName(value);
    setSubproductKeyName(value);
    setSubproductProductionName(value);
  }, []);

  const subproductKeyboardValue = subproductActiveField === 'name'
    ? subproductName
    : subproductActiveField === 'keyName'
      ? subproductKeyName
      : subproductActiveField === 'productionName'
        ? subproductProductionName
        : subproductActiveField === 'price'
          ? subproductPrice
          : '';

  const subproductKeyboardOnChange = subproductActiveField === 'name'
    ? handleSubproductNameChange
    : subproductActiveField === 'keyName'
      ? setSubproductKeyName
      : subproductActiveField === 'productionName'
        ? setSubproductProductionName
        : subproductActiveField === 'price'
          ? setSubproductPrice
          : () => { };

  const openSubproductModal = () => {
    setEditingSubproductId(null);
    setSubproductName('');
    setSubproductKeyName('');
    setSubproductProductionName('');
    setSubproductActiveField('name');
    setSubproductPrice('');
    setSubproductVatTakeOut('');
    setSubproductVatEatIn('');
    setSubproductModalGroupId(selectedSubproductGroupId || (subproductGroups[0]?.id ?? null));
    setSubproductKioskPicture('');
    setSubproductAttachToCategoryIds([]);
    setSubproductAddCategoryId('');
    setShowSubproductModal(true);
  };

  const openEditSubproductModal = (sp) => {
    setEditingSubproductId(sp.id);
    setSubproductName(sp.name || '');
    setSubproductActiveField('name');
    setSubproductModalGroupId(selectedSubproductGroupId);
    try {
      const raw = typeof localStorage !== 'undefined' && localStorage.getItem('pos_subproduct_extra');
      const extra = raw ? JSON.parse(raw) : {};
      const e = extra[sp.id] || {};
      setSubproductKeyName(e.keyName || '');
      setSubproductProductionName(e.productionName || '');
      setSubproductPrice(e.price != null ? String(e.price) : '');
      setSubproductVatTakeOut(e.vatTakeOut ?? '');
      setSubproductVatEatIn(e.vatEatIn ?? '');
      setSubproductKioskPicture(e.kioskPicture || '');
      setSubproductAttachToCategoryIds(Array.isArray(e.attachToCategoryIds) ? e.attachToCategoryIds : []);
    } catch {
      setSubproductKeyName('');
      setSubproductProductionName('');
      setSubproductPrice('');
      setSubproductVatTakeOut('');
      setSubproductVatEatIn('');
      setSubproductKioskPicture('');
      setSubproductAttachToCategoryIds([]);
    }
    setShowSubproductModal(true);
  };

  const closeSubproductModal = () => {
    setShowSubproductModal(false);
    setEditingSubproductId(null);
    setSubproductName('');
    setSubproductKeyName('');
    setSubproductProductionName('');
    setSubproductActiveField('name');
    setSubproductPrice('');
    setSubproductAttachToCategoryIds([]);
    setSubproductAddCategoryId('');
  };

  const persistSubproductExtra = (id, data) => {
    try {
      const raw = typeof localStorage !== 'undefined' && localStorage.getItem('pos_subproduct_extra');
      const extra = raw ? JSON.parse(raw) : {};
      extra[id] = data;
      if (typeof localStorage !== 'undefined') localStorage.setItem('pos_subproduct_extra', JSON.stringify(extra));
    } catch (_) { }
  };

  const handleSaveSubproduct = async () => {
    const groupId = subproductModalGroupId || selectedSubproductGroupId;
    if (!groupId && !editingSubproductId) return;
    setSavingSubproduct(true);
    const name = subproductName.trim() || 'New subproduct';
    const extraData = {
      keyName: subproductKeyName.trim(),
      productionName: subproductProductionName.trim(),
      price: subproductPrice.trim(),
      vatTakeOut: subproductVatTakeOut,
      vatEatIn: subproductVatEatIn,
      kioskPicture: subproductKioskPicture.trim(),
      attachToCategoryIds: subproductAttachToCategoryIds
    };
    try {
      if (editingSubproductId) {
        const res = await fetch(`${API}/subproducts/${editingSubproductId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name })
        });
        const updated = await res.json();
        if (res.ok && updated) {
          setSubproducts((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
          persistSubproductExtra(editingSubproductId, extraData);
          closeSubproductModal();
        } else fetchSubproducts(selectedSubproductGroupId);
      } else {
        const res = await fetch(`${API}/subproducts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, groupId })
        });
        const created = await res.json();
        if (res.ok && created) {
          setSubproducts((prev) => [...prev, created].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)));
          persistSubproductExtra(created.id, extraData);
          closeSubproductModal();
        } else fetchSubproducts(selectedSubproductGroupId);
      }
    } catch {
      fetchSubproducts(selectedSubproductGroupId);
    } finally {
      setSavingSubproduct(false);
    }
  };

  const handleDeleteSubproduct = async (id) => {
    try {
      const res = await fetch(`${API}/subproducts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSubproducts((prev) => prev.filter((s) => s.id !== id));
        if (selectedSubproductId === id) setSelectedSubproductId(null);
      } else fetchSubproducts(selectedSubproductGroupId);
    } catch {
      fetchSubproducts(selectedSubproductGroupId);
    } finally {
      setDeleteConfirmSubproductId(null);
    }
  };

  const handleMoveSubproduct = async (direction) => {
    if (!selectedSubproductId) return;
    const idx = subproducts.findIndex((s) => s.id === selectedSubproductId);
    if (idx < 0) return;
    const nextIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (nextIdx < 0 || nextIdx >= subproducts.length) return;
    const curr = subproducts[idx];
    const other = subproducts[nextIdx];
    const currOrder = curr.sortOrder ?? idx;
    const otherOrder = other.sortOrder ?? nextIdx;
    try {
      await fetch(`${API}/subproducts/${curr.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sortOrder: otherOrder })
      });
      await fetch(`${API}/subproducts/${other.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sortOrder: currOrder })
      });
      setSubproducts((prev) => {
        const list = [...prev];
        list[idx] = { ...list[idx], sortOrder: otherOrder };
        list[nextIdx] = { ...list[nextIdx], sortOrder: currOrder };
        return list.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      });
    } catch {
      fetchSubproducts(selectedSubproductGroupId);
    }
  };

  const handleAddGroup = async () => {
    const name = newGroupName.trim() || 'New group';
    setSavingGroup(true);
    try {
      const res = await fetch(`${API}/subproduct-groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      const created = await res.json();
      if (res.ok && created) {
        setSubproductGroups((prev) => [...prev, created].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)));
        setNewGroupName('');
        setShowAddGroupInline(false);
      } else fetchSubproductGroups();
    } catch {
      fetchSubproductGroups();
    } finally {
      setSavingGroup(false);
    }
  };

  const handleSaveEditGroup = async () => {
    if (!editingGroupId) return;
    const name = editingGroupName.trim() || 'New group';
    setSavingGroup(true);
    try {
      const res = await fetch(`${API}/subproduct-groups/${editingGroupId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      const updated = await res.json();
      if (res.ok && updated) {
        setSubproductGroups((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
        setEditingGroupId(null);
        setEditingGroupName('');
      } else fetchSubproductGroups();
    } catch {
      fetchSubproductGroups();
    } finally {
      setSavingGroup(false);
    }
  };

  const handleMoveGroup = async (groupId, direction) => {
    const sorted = [...subproductGroups].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    const idx = sorted.findIndex((g) => g.id === groupId);
    if (idx < 0) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const curr = sorted[idx];
    const other = sorted[swapIdx];
    const currOrder = curr.sortOrder ?? idx;
    const otherOrder = other.sortOrder ?? swapIdx;
    setSavingGroup(true);
    try {
      await fetch(`${API}/subproduct-groups/${curr.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sortOrder: otherOrder }) });
      await fetch(`${API}/subproduct-groups/${other.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sortOrder: currOrder }) });
      setSubproductGroups((prev) => prev.map((g) => (g.id === curr.id ? { ...g, sortOrder: otherOrder } : g.id === other.id ? { ...g, sortOrder: currOrder } : g)).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)));
    } catch {
      fetchSubproductGroups();
    } finally {
      setSavingGroup(false);
    }
  };

  const openTableLocationModal = () => {
    setEditingTableLocationId(null);
    setTableLocationName('');
    setTableLocationSelectionStart(0);
    setTableLocationSelectionEnd(0);
    setTableLocationBackground('');
    setTableLocationTextColor('light');
    setShowTableLocationModal(true);
  };

  const openEditTableLocationModal = (loc) => {
    const nextName = loc.name || '';
    setEditingTableLocationId(loc.id);
    setTableLocationName(nextName);
    setTableLocationSelectionStart(nextName.length);
    setTableLocationSelectionEnd(nextName.length);
    setTableLocationBackground(typeof loc?.background === 'string' ? loc.background : '');
    setTableLocationTextColor(loc?.textColor === 'dark' ? 'dark' : 'light');
    setShowTableLocationModal(true);
  };

  const closeTableLocationModal = () => {
    setShowTableLocationModal(false);
    setEditingTableLocationId(null);
    setTableLocationName('');
    setTableLocationSelectionStart(0);
    setTableLocationSelectionEnd(0);
    setTableLocationBackground('');
    setTableLocationTextColor('light');
  };

  useEffect(() => {
    if (!showTableLocationModal) return;
    const input = tableLocationNameInputRef.current;
    if (!input) return;
    if (document.activeElement !== input) input.focus();
    const pos = Math.min(String(tableLocationName || '').length, Math.max(0, tableLocationSelectionStart));
    try {
      input.setSelectionRange(pos, Math.min(String(tableLocationName || '').length, Math.max(0, tableLocationSelectionEnd)));
    } catch {}
  }, [showTableLocationModal, tableLocationName, tableLocationSelectionStart, tableLocationSelectionEnd]);

  const handleSaveTableLocation = async () => {
    const name = tableLocationName.trim() || 'New location';
    setSavingTableLocation(true);
    try {
      if (editingTableLocationId) {
        const res = await fetch(`${API}/rooms/${editingTableLocationId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, background: tableLocationBackground, textColor: tableLocationTextColor })
        });
        const updated = await res.json();
        if (res.ok && updated) {
          setTableLocations((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
          closeTableLocationModal();
        } else fetchTableLocations();
      } else {
        const res = await fetch(`${API}/rooms`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, background: tableLocationBackground, textColor: tableLocationTextColor })
        });
        const created = await res.json();
        if (res.ok && created) {
          setTableLocations((prev) => [...prev, created].sort((a, b) => (a.name || '').localeCompare(b.name || '')));
          closeTableLocationModal();
        } else fetchTableLocations();
      }
    } catch {
      fetchTableLocations();
    } finally {
      setSavingTableLocation(false);
    }
  };

  const handleDeleteTableLocation = async (id) => {
    try {
      const res = await fetch(`${API}/rooms/${id}`, { method: 'DELETE' });
      if (res.ok) setTableLocations((prev) => prev.filter((t) => t.id !== id));
      else fetchTableLocations();
    } catch {
      fetchTableLocations();
    }
    setDeleteConfirmTableLocationId(null);
  };

  const openSetTablesModal = async (loc) => {
    const locationId = String(loc?.id || '');
    const locationName = String(loc?.name || 'Restaurant');
    const emptyDraft = () => ({ ...normalizeLayoutEditorDraft(null, locationName), tables: [] });
    let draft = emptyDraft();
    if (loc?.layoutJson != null && loc.layoutJson !== '') {
      try {
        const parsed = JSON.parse(loc.layoutJson);
        if (parsed && typeof parsed === 'object') draft = normalizeLayoutEditorDraft(parsed, locationName);
      } catch {
        // keep empty draft
      }
    }
    setSetTablesLocationId(locationId);
    setSetTablesLocationName(locationName);
    setSetTablesDraft(draft);
    setSetTablesSelectedTableId(draft.tables[0]?.id || null);
    setShowSetTablesModal(true);
  };

  const closeSetTablesModal = () => {
    setShowSetTablesModal(false);
    setShowSetTableTypeModal(false);
    setShowSetBoardColorModal(false);
    setSetTablesLocationId(null);
    setSetTablesLocationName('');
    setSetTablesSelectedTableId(null);
    setSetTablesSelectedBoardIndex(null);
    setSetTablesSelectedFlowerPotIndex(null);
  };

  const selectedSetTable = setTablesDraft.tables.find((table) => table.id === setTablesSelectedTableId) || null;
  const boards = selectedSetTable?.boards ?? [];
  const flowerPots = selectedSetTable?.flowerPots ?? [];
  const selectedSetBoardIndex = setTablesSelectedBoardIndex != null && setTablesSelectedBoardIndex >= 0 && setTablesSelectedBoardIndex < boards.length ? setTablesSelectedBoardIndex : null;
  const selectedSetBoard = selectedSetBoardIndex != null ? boards[selectedSetBoardIndex] : null;
  const selectedSetFlowerPotIndex = setTablesSelectedFlowerPotIndex != null && setTablesSelectedFlowerPotIndex >= 0 && setTablesSelectedFlowerPotIndex < flowerPots.length ? setTablesSelectedFlowerPotIndex : null;
  const selectedSetFlowerPot = selectedSetFlowerPotIndex != null ? flowerPots[selectedSetFlowerPotIndex] : null;

  const updateSelectedSetTable = (patch) => {
    if (!setTablesSelectedTableId) return;
    setSetTablesDraft((prev) => ({
      ...prev,
      tables: prev.tables.map((table) => {
        if (table.id !== setTablesSelectedTableId) return table;
        return { ...table, ...patch };
      })
    }));
  };

  const updateSelectedSetBoard = (patch) => {
    if (!setTablesSelectedTableId || selectedSetBoardIndex == null) return;
    setSetTablesDraft((prev) => ({
      ...prev,
      tables: prev.tables.map((table) => {
        if (table.id !== setTablesSelectedTableId || !Array.isArray(table.boards) || selectedSetBoardIndex >= table.boards.length) return table;
        const nextBoards = [...table.boards];
        nextBoards[selectedSetBoardIndex] = { ...nextBoards[selectedSetBoardIndex], ...patch };
        return { ...table, boards: nextBoards };
      })
    }));
  };

  const updateSelectedSetFlowerPot = (patch) => {
    if (!setTablesSelectedTableId || selectedSetFlowerPotIndex == null) return;
    setSetTablesDraft((prev) => ({
      ...prev,
      tables: prev.tables.map((table) => {
        if (table.id !== setTablesSelectedTableId || !Array.isArray(table.flowerPots) || selectedSetFlowerPotIndex >= table.flowerPots.length) return table;
        const nextFlowerPots = [...table.flowerPots];
        nextFlowerPots[selectedSetFlowerPotIndex] = { ...nextFlowerPots[selectedSetFlowerPotIndex], ...patch };
        return { ...table, flowerPots: nextFlowerPots };
      })
    }));
  };

  const addSetTable = () => {
    setShowSetTableTypeModal(true);
  };

  const addSetTableWithTemplate = (templateType) => {
    setSetTablesDraft((prev) => {
      const nextTable = createDefaultLayoutTable(prev.tables.length + 1, templateType);
      const next = { ...prev, tables: [...prev.tables, nextTable] };
      setSetTablesSelectedTableId(nextTable.id);
      return next;
    });
    setShowSetTableTypeModal(false);
  };

  const handleAddBoard = () => {
    if (!setTablesSelectedTableId) return;
    setShowSetBoardColorModal(true);
  };

  const handleRemoveBoard = () => {
    if (!setTablesSelectedTableId) return;
    setSetTablesDraft((prev) => {
      const table = prev.tables.find((t) => t.id === setTablesSelectedTableId);
      if (!table || !Array.isArray(table.boards) || table.boards.length === 0) return prev;
      const idx = selectedSetBoardIndex != null && selectedSetBoardIndex < table.boards.length ? selectedSetBoardIndex : table.boards.length - 1;
      const nextBoards = table.boards.filter((_, i) => i !== idx);
      return {
        ...prev,
        tables: prev.tables.map((t) => (t.id !== setTablesSelectedTableId ? t : { ...t, boards: nextBoards }))
      };
    });
    setSetTablesSelectedBoardIndex(null);
  };

  const handleSelectBoardColor = (color) => {
    if (!setTablesSelectedTableId) return;
    setSetTablesDraft((prev) => ({
      ...prev,
      tables: prev.tables.map((table) => {
        if (table.id !== setTablesSelectedTableId) return table;
        const newBoard = { ...createDefaultBoard(table, color), color, x: 0, y: 0 };
        const nextBoards = [...(Array.isArray(table.boards) ? table.boards : []), newBoard];
        return { ...table, boards: nextBoards };
      })
    }));
    setShowSetBoardColorModal(false);
  };

  const handleAddFlowerPot = () => {
    if (!setTablesSelectedTableId) return;
    setSetTablesDraft((prev) => ({
      ...prev,
      tables: prev.tables.map((table) => {
        if (table.id !== setTablesSelectedTableId) return table;
        const newFlowerPot = createDefaultFlowerPot();
        const nextFlowerPots = [...(Array.isArray(table.flowerPots) ? table.flowerPots : []), newFlowerPot];
        return { ...table, flowerPots: nextFlowerPots };
      })
    }));
  };

  const handleRemoveFlowerPot = () => {
    if (!setTablesSelectedTableId) return;
    setSetTablesDraft((prev) => {
      const table = prev.tables.find((t) => t.id === setTablesSelectedTableId);
      if (!table || !Array.isArray(table.flowerPots) || table.flowerPots.length === 0) return prev;
      const idx = selectedSetFlowerPotIndex != null && selectedSetFlowerPotIndex < table.flowerPots.length ? selectedSetFlowerPotIndex : table.flowerPots.length - 1;
      const nextFlowerPots = table.flowerPots.filter((_, i) => i !== idx);
      return {
        ...prev,
        tables: prev.tables.map((t) => (t.id !== setTablesSelectedTableId ? t : { ...t, flowerPots: nextFlowerPots }))
      };
    });
    setSetTablesSelectedFlowerPotIndex(null);
  };

  const startSetTableDrag = (event, table) => {
    event.preventDefault();
    event.stopPropagation();
    setSetTablesSelectedTableId(table.id);
    setTablesDragRef.current = {
      type: 'table',
      id: table.id,
      startMouseX: event.clientX,
      startMouseY: event.clientY,
      startX: Number(table.x) || 0,
      startY: Number(table.y) || 0
    };
    setSetTablesDraggingId(table.id);
    setSetTablesDraggingType('table');
  };

  const startSetBoardDrag = (event, table, boardIndex) => {
    const boards = table?.boards;
    if (!Array.isArray(boards) || boardIndex < 0 || boardIndex >= boards.length) return;
    const board = boards[boardIndex];
    event.preventDefault();
    event.stopPropagation();
    setSetTablesSelectedTableId(table.id);
    setSetTablesSelectedBoardIndex(boardIndex);
    setTablesDragRef.current = {
      type: 'board',
      id: table.id,
      boardIndex,
      startMouseX: event.clientX,
      startMouseY: event.clientY,
      startX: Number(board.x) || 0,
      startY: Number(board.y) || 0
    };
    setSetTablesDraggingId(table.id);
    setSetTablesDraggingType('board');
  };

  const startSetFlowerPotDrag = (event, table, flowerPotIndex) => {
    const pots = table?.flowerPots;
    if (!Array.isArray(pots) || flowerPotIndex < 0 || flowerPotIndex >= pots.length) return;
    const fp = pots[flowerPotIndex];
    event.preventDefault();
    event.stopPropagation();
    setSetTablesSelectedTableId(table.id);
    setSetTablesSelectedFlowerPotIndex(flowerPotIndex);
    setTablesDragRef.current = {
      type: 'flowerPot',
      id: table.id,
      flowerPotIndex,
      startMouseX: event.clientX,
      startMouseY: event.clientY,
      startX: Number(fp.x) || 0,
      startY: Number(fp.y) || 0
    };
    setSetTablesDraggingId(table.id);
    setSetTablesDraggingType('flowerPot');
  };

  useEffect(() => {
    if (!setTablesDraggingId) return undefined;

    const onMouseMove = (event) => {
      const drag = setTablesDragRef.current;
      if (!drag) return;
      const dx = event.clientX - drag.startMouseX;
      const dy = event.clientY - drag.startMouseY;
      const canvas = setTablesCanvasRef.current;
      const canvasWidth = canvas?.clientWidth || 0;
      const canvasHeight = canvas?.clientHeight || 0;

      setSetTablesDraft((prev) => ({
        ...prev,
        tables: prev.tables.map((table) => {
          if (table.id !== drag.id) return table;
          if (drag.type === 'flowerPot' && Array.isArray(table.flowerPots) && drag.flowerPotIndex != null && table.flowerPots[drag.flowerPotIndex]) {
            const fp = table.flowerPots[drag.flowerPotIndex];
            const fpWidth = Math.max(10, Number(fp.width) || 0);
            const fpHeight = Math.max(10, Number(fp.height) || 0);
            const maxX = Math.max(0, canvasWidth - fpWidth);
            const maxY = Math.max(0, canvasHeight - fpHeight);
            const x = Math.min(maxX, Math.max(0, drag.startX + dx));
            const y = Math.min(maxY, Math.max(0, drag.startY + dy));
            const nextFlowerPots = [...table.flowerPots];
            nextFlowerPots[drag.flowerPotIndex] = { ...fp, x, y };
            return { ...table, flowerPots: nextFlowerPots };
          }
          if (drag.type === 'board' && Array.isArray(table.boards) && drag.boardIndex != null && table.boards[drag.boardIndex]) {
            const board = table.boards[drag.boardIndex];
            const boardWidth = Math.max(10, Number(board.width) || 0);
            const boardHeight = Math.max(10, Number(board.height) || 0);
            const maxX = Math.max(0, canvasWidth - boardWidth);
            const maxY = Math.max(0, canvasHeight - boardHeight);
            const x = Math.min(maxX, Math.max(0, drag.startX + dx));
            const y = Math.min(maxY, Math.max(0, drag.startY + dy));
            const nextBoards = [...table.boards];
            nextBoards[drag.boardIndex] = { ...board, x, y };
            return { ...table, boards: nextBoards };
          }
          const tableWidth = table.round ? Math.max(70, Number(table.width) || 0) : Math.max(60, Number(table.width) || 0);
          const tableHeight = table.round ? tableWidth : Math.max(40, Number(table.height) || 0);
          const maxX = Math.max(0, canvasWidth - tableWidth);
          const maxY = Math.max(0, canvasHeight - tableHeight);
          const x = Math.min(maxX, Math.max(0, drag.startX + dx));
          const y = Math.min(maxY, Math.max(0, drag.startY + dy));
          return { ...table, x, y };
        })
      }));
    };

    const onMouseUp = () => {
      setTablesDragRef.current = null;
      setSetTablesDraggingId(null);
      setSetTablesDraggingType(null);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [setTablesDraggingId]);

  const removeSetTable = () => {
    if (!setTablesSelectedTableId) return;
    setSetTablesDraft((prev) => {
      const nextTables = prev.tables.filter((table) => table.id !== setTablesSelectedTableId);
      setSetTablesSelectedTableId(nextTables[0]?.id || null);
      return { ...prev, tables: nextTables };
    });
  };

  const saveSetTablesLayout = async () => {
    if (!setTablesLocationId) return;
    try {
      const patchRes = await fetch(`${API}/rooms/${setTablesLocationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layoutJson: JSON.stringify(setTablesDraft) })
      });
      if (!patchRes.ok) throw new Error('Failed to save table layout');
      const names = (setTablesDraft.tables || [])
        .map((t) => String(t?.name ?? '').trim())
        .filter(Boolean);
      if (names.length > 0) {
        const syncRes = await fetch(`${API}/tables/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId: setTablesLocationId, names })
        });
        if (!syncRes.ok) throw new Error('Failed to sync tables');
      }
      setTableLocations((prev) =>
        prev.map((r) =>
          r.id === setTablesLocationId ? { ...r, layoutJson: JSON.stringify(setTablesDraft) } : r
        )
      );
      if (typeof fetchTableLayouts === 'function') fetchTableLayouts();
      if (typeof fetchTables === 'function') fetchTables();
      showToast('success', tr('control.tables.layoutSaved', 'Table layout saved.'));
      closeSetTablesModal();
    } catch {
      showToast('error', tr('control.tables.layoutSaveFailed', 'Failed to save table layout.'));
    }
  };

  const handleDeleteGroup = async (id) => {
    try {
      const res = await fetch(`${API}/subproduct-groups/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSubproductGroups((prev) => prev.filter((g) => g.id !== id));
        if (selectedSubproductGroupId === id) setSelectedSubproductGroupId(null);
      } else fetchSubproductGroups();
    } catch {
      fetchSubproductGroups();
    } finally {
      setDeleteConfirmGroupId(null);
    }
  };

  useEffect(() => {
    if (!showDeviceSettingsModal) return;
    fetchCategories();
    try {
      const raw = typeof localStorage !== 'undefined' && localStorage.getItem('pos_device_settings');
      const saved = raw ? JSON.parse(raw) : {};
      if (saved.useSubproducts != null) setDeviceUseSubproducts(!!saved.useSubproducts);
      if (saved.autoLogoutAfterTransaction != null) setDeviceAutoLogoutAfterTransaction(!!saved.autoLogoutAfterTransaction);
      if (saved.autoReturnToTablePlan != null) setDeviceAutoReturnToTablePlan(!!saved.autoReturnToTablePlan);
      if (saved.disableCashButtonInPayment != null) setDeviceDisableCashButtonInPayment(!!saved.disableCashButtonInPayment);
      if (saved.openPriceWithoutPopup != null) setDeviceOpenPriceWithoutPopup(!!saved.openPriceWithoutPopup);
      if (saved.openCashDrawerAfterOrder != null) setDeviceOpenCashDrawerAfterOrder(!!saved.openCashDrawerAfterOrder);
      if (saved.autoReturnToCounterSale != null) setDeviceAutoReturnToCounterSale(!!saved.autoReturnToCounterSale);
      if (saved.askSendToKitchen != null) setDeviceAskSendToKitchen(!!saved.askSendToKitchen);
      if (saved.counterSaleVat != null) setDeviceCounterSaleVat(saved.counterSaleVat);
      if (saved.tableSaleVat != null) setDeviceTableSaleVat(saved.tableSaleVat);
      if (saved.timeoutLogout != null) setDeviceTimeoutLogout(Number(saved.timeoutLogout) || 0);
      if (saved.fixedBorder != null) setDeviceFixedBorder(!!saved.fixedBorder);
      if (saved.alwaysOnTop != null) setDeviceAlwaysOnTop(!!saved.alwaysOnTop);
      if (saved.askInvoiceOrTicket != null) setDeviceAskInvoiceOrTicket(!!saved.askInvoiceOrTicket);
      if (saved.printerGroupingProducts != null) setDevicePrinterGroupingProducts(!!saved.printerGroupingProducts);
      if (saved.printerShowErrorScreen != null) setDevicePrinterShowErrorScreen(!!saved.printerShowErrorScreen);
      if (saved.printerProductionMessageOnVat != null) setDevicePrinterProductionMessageOnVat(!!saved.printerProductionMessageOnVat);
      if (saved.printerNextCourseOrder != null) setDevicePrinterNextCourseOrder(saved.printerNextCourseOrder);
      if (saved.printerStandardMode != null) setDevicePrinterStandardMode(saved.printerStandardMode);
      if (saved.printerQROrderPrinter != null) setDevicePrinterQROrderPrinter(saved.printerQROrderPrinter || '');
      if (saved.printerReprintWithNextCourse != null) setDevicePrinterReprintWithNextCourse(!!saved.printerReprintWithNextCourse);
      if (saved.printerPrintZeroTickets != null) setDevicePrinterPrintZeroTickets(!!saved.printerPrintZeroTickets);
      if (saved.printerGiftVoucherAtMin != null) setDevicePrinterGiftVoucherAtMin(!!saved.printerGiftVoucherAtMin);
      if (Array.isArray(saved.categoryDisplayIds)) setDeviceCategoryDisplayIds(saved.categoryDisplayIds);
      if (saved.ordersConfirmOnHold != null) setDeviceOrdersConfirmOnHold(!!saved.ordersConfirmOnHold);
      if (saved.ordersPrintBarcodeAfterCreate != null) setDeviceOrdersPrintBarcodeAfterCreate(!!saved.ordersPrintBarcodeAfterCreate);
      if (saved.ordersCustomerCanBeModified != null) setDeviceOrdersCustomerCanBeModified(!!saved.ordersCustomerCanBeModified);
      if (saved.ordersBookTableToWaiting != null) setDeviceOrdersBookTableToWaiting(!!saved.ordersBookTableToWaiting);
      if (saved.ordersFastCustomerName != null) setDeviceOrdersFastCustomerName(!!saved.ordersFastCustomerName);
      if (saved.scheduledPrinter != null) setDeviceScheduledPrinter(saved.scheduledPrinter || '');
      if (saved.scheduledProductionFlow != null) setDeviceScheduledProductionFlow(saved.scheduledProductionFlow);
      if (saved.scheduledLoading != null) setDeviceScheduledLoading(saved.scheduledLoading);
      if (saved.scheduledMode != null) setDeviceScheduledMode(saved.scheduledMode);
      if (saved.scheduledInvoiceLayout != null) setDeviceScheduledInvoiceLayout(saved.scheduledInvoiceLayout);
      if (saved.scheduledCheckoutAt != null) setDeviceScheduledCheckoutAt(saved.scheduledCheckoutAt);
      if (saved.scheduledPrintBarcodeLabel != null) setDeviceScheduledPrintBarcodeLabel(!!saved.scheduledPrintBarcodeLabel);
      if (saved.scheduledDeliveryNoteToTurnover != null) setDeviceScheduledDeliveryNoteToTurnover(!!saved.scheduledDeliveryNoteToTurnover);
      if (saved.scheduledPrintProductionReceipt != null) setDeviceScheduledPrintProductionReceipt(!!saved.scheduledPrintProductionReceipt);
      if (saved.scheduledPrintCustomerProductionReceipt != null) setDeviceScheduledPrintCustomerProductionReceipt(!!saved.scheduledPrintCustomerProductionReceipt);
      if (saved.scheduledWebOrderAutoPrint != null) setDeviceScheduledWebOrderAutoPrint(!!saved.scheduledWebOrderAutoPrint);
      if (saved.optionButtonLayout != null) setOptionButtonSlots(normalizeOptionButtonSlots(saved.optionButtonLayout));
      setSelectedFunctionButtonSlotIndex(null);
      setSelectedOptionButtonSlotIndex(null);
    } catch (_) { }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API}/settings/function-buttons-layout`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok || cancelled) return;
        setFunctionButtonSlots(normalizeFunctionButtonSlots(data?.value));
      } catch {
        if (!cancelled) {
          setFunctionButtonSlots(normalizeFunctionButtonSlots([]));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showDeviceSettingsModal, fetchCategories]);

  const handleSaveDeviceSettings = async () => {
    setSavingDeviceSettings(true);
    try {
      const payload = {
        useSubproducts: deviceUseSubproducts,
        autoLogoutAfterTransaction: deviceAutoLogoutAfterTransaction,
        autoReturnToTablePlan: deviceAutoReturnToTablePlan,
        disableCashButtonInPayment: deviceDisableCashButtonInPayment,
        openPriceWithoutPopup: deviceOpenPriceWithoutPopup,
        openCashDrawerAfterOrder: deviceOpenCashDrawerAfterOrder,
        autoReturnToCounterSale: deviceAutoReturnToCounterSale,
        askSendToKitchen: deviceAskSendToKitchen,
        counterSaleVat: deviceCounterSaleVat,
        tableSaleVat: deviceTableSaleVat,
        timeoutLogout: deviceTimeoutLogout,
        fixedBorder: deviceFixedBorder,
        alwaysOnTop: deviceAlwaysOnTop,
        askInvoiceOrTicket: deviceAskInvoiceOrTicket,
        printerGroupingProducts: devicePrinterGroupingProducts,
        printerShowErrorScreen: devicePrinterShowErrorScreen,
        printerProductionMessageOnVat: devicePrinterProductionMessageOnVat,
        printerNextCourseOrder: devicePrinterNextCourseOrder,
        printerStandardMode: devicePrinterStandardMode,
        printerQROrderPrinter: devicePrinterQROrderPrinter,
        printerReprintWithNextCourse: devicePrinterReprintWithNextCourse,
        printerPrintZeroTickets: devicePrinterPrintZeroTickets,
        printerGiftVoucherAtMin: devicePrinterGiftVoucherAtMin,
        categoryDisplayIds: deviceCategoryDisplayIds,
        ordersConfirmOnHold: deviceOrdersConfirmOnHold,
        ordersPrintBarcodeAfterCreate: deviceOrdersPrintBarcodeAfterCreate,
        ordersCustomerCanBeModified: deviceOrdersCustomerCanBeModified,
        ordersBookTableToWaiting: deviceOrdersBookTableToWaiting,
        ordersFastCustomerName: deviceOrdersFastCustomerName,
        scheduledPrinter: deviceScheduledPrinter,
        scheduledProductionFlow: deviceScheduledProductionFlow,
        scheduledLoading: deviceScheduledLoading,
        scheduledMode: deviceScheduledMode,
        scheduledInvoiceLayout: deviceScheduledInvoiceLayout,
        scheduledCheckoutAt: deviceScheduledCheckoutAt,
        scheduledPrintBarcodeLabel: deviceScheduledPrintBarcodeLabel,
        scheduledDeliveryNoteToTurnover: deviceScheduledDeliveryNoteToTurnover,
        scheduledPrintProductionReceipt: deviceScheduledPrintProductionReceipt,
        scheduledPrintCustomerProductionReceipt: deviceScheduledPrintCustomerProductionReceipt,
        scheduledWebOrderAutoPrint: deviceScheduledWebOrderAutoPrint,
        optionButtonLayout: optionButtonSlots
      };
      if (typeof localStorage !== 'undefined') localStorage.setItem('pos_device_settings', JSON.stringify(payload));
      const layoutRes = await fetch(`${API}/settings/function-buttons-layout`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: functionButtonSlots })
      });
      const layoutData = await layoutRes.json().catch(() => ({}));
      if (!layoutRes.ok) {
        throw new Error(layoutData?.error || 'Failed to save function buttons layout');
      }
      setFunctionButtonSlots(normalizeFunctionButtonSlots(layoutData?.value));
      setSelectedFunctionButtonSlotIndex(null);
      setShowDeviceSettingsModal(false);
      showToast('success', 'Device settings saved.');
    } catch (err) {
      showToast('error', err?.message || 'Failed to save device settings.');
    } finally {
      setSavingDeviceSettings(false);
    }
  };

  const handleFunctionButtonDragStart = (event, itemId) => {
    if (!itemId) return;
    event.dataTransfer.setData('text/plain', itemId);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleFunctionButtonDropOnSlot = (event, slotIndex) => {
    event.preventDefault();
    if (slotIndex < 0 || slotIndex >= FUNCTION_BUTTON_SLOT_COUNT) return;
    const droppedId = String(event.dataTransfer.getData('text/plain') || '').trim();
    if (!FUNCTION_BUTTON_ITEM_IDS.includes(droppedId)) return;
    setFunctionButtonSlots((prev) => {
      const next = [...prev];
      const existingIndex = next.findIndex((id) => id === droppedId);
      if (existingIndex >= 0) next[existingIndex] = '';
      next[slotIndex] = droppedId;
      return next;
    });
    setSelectedFunctionButtonSlotIndex(slotIndex);
  };

  const handleRemoveFunctionButtonFromSlot = () => {
    if (!Number.isInteger(selectedFunctionButtonSlotIndex)) return;
    setFunctionButtonSlots((prev) => {
      const next = [...prev];
      if (!next[selectedFunctionButtonSlotIndex]) return prev;
      next[selectedFunctionButtonSlotIndex] = '';
      return next;
    });
  };

  const hasSelectedFunctionButton = Number.isInteger(selectedFunctionButtonSlotIndex)
    && !!functionButtonSlots[selectedFunctionButtonSlotIndex];
  const assignedFunctionButtonIds = new Set(functionButtonSlots.filter(Boolean));
  const assignedOptionButtonIds = new Set(optionButtonSlots.filter(Boolean));
  const unassignedOptionButtons = OPTION_BUTTON_ITEMS.filter((item) => !assignedOptionButtonIds.has(item.id));

  const handleOptionButtonDragStart = (event, itemId) => {
    if (!itemId) return;
    event.dataTransfer.setData('text/plain', itemId);
    event.dataTransfer.effectAllowed = 'move';
  };
  const handleOptionButtonDragStartFromSlot = (event, slotIndex) => {
    const itemId = String(optionButtonSlots[slotIndex] || '').trim();
    if (!itemId || itemId === OPTION_BUTTON_LOCKED_ID) return;
    event.dataTransfer.setData('text/plain', itemId);
    event.dataTransfer.effectAllowed = 'move';
    setSelectedOptionButtonSlotIndex(slotIndex);
  };

  const handleOptionButtonDropOnSlot = (event, slotIndex) => {
    event.preventDefault();
    if (slotIndex < 0 || slotIndex >= OPTION_BUTTON_SLOT_COUNT) return;
    const droppedId = String(event.dataTransfer.getData('text/plain') || '').trim();
    if (!OPTION_BUTTON_ITEM_IDS.includes(droppedId)) return;
    setOptionButtonSlots((prev) => {
      const next = [...prev];
      if (next[slotIndex] === OPTION_BUTTON_LOCKED_ID && droppedId !== OPTION_BUTTON_LOCKED_ID) {
        return prev;
      }
      const existingIndex = next.findIndex((id) => id === droppedId);
      if (existingIndex >= 0) next[existingIndex] = '';
      next[slotIndex] = droppedId;
      return next;
    });
    setSelectedOptionButtonSlotIndex(slotIndex);
  };

  const handleRemoveOptionButtonFromSlot = () => {
    if (!Number.isInteger(selectedOptionButtonSlotIndex)) return;
    setOptionButtonSlots((prev) => {
      const next = [...prev];
      if (!next[selectedOptionButtonSlotIndex]) return prev;
      if (next[selectedOptionButtonSlotIndex] === OPTION_BUTTON_LOCKED_ID) return prev;
      next[selectedOptionButtonSlotIndex] = '';
      return next;
    });
  };

  const hasSelectedOptionButton = Number.isInteger(selectedOptionButtonSlotIndex)
    && !!optionButtonSlots[selectedOptionButtonSlotIndex];
  const hasSelectedRemovableOptionButton = Number.isInteger(selectedOptionButtonSlotIndex)
    && !!optionButtonSlots[selectedOptionButtonSlotIndex]
    && optionButtonSlots[selectedOptionButtonSlotIndex] !== OPTION_BUTTON_LOCKED_ID;

  useEffect(() => {
    if (!showSystemSettingsModal) return;
    fetchPriceGroups();
    try {
      const raw = typeof localStorage !== 'undefined' && localStorage.getItem('pos_system_settings');
      const saved = raw ? JSON.parse(raw) : {};
      if (saved.useStockManagement != null) setSysUseStockManagement(!!saved.useStockManagement);
      if (saved.usePriceGroups != null) setSysUsePriceGroups(!!saved.usePriceGroups);
      if (saved.loginWithoutCode != null) setSysLoginWithoutCode(!!saved.loginWithoutCode);
      if (saved.categorieenPerKassa != null) setSysCategorieenPerKassa(!!saved.categorieenPerKassa);
      if (saved.autoAcceptQROrders != null) setSysAutoAcceptQROrders(!!saved.autoAcceptQROrders);
      if (saved.qrOrdersAutomatischAfrekenen != null) setSysQrOrdersAutomatischAfrekenen(!!saved.qrOrdersAutomatischAfrekenen);
      if (saved.enkelQROrdersKeukenscherm != null) setSysEnkelQROrdersKeukenscherm(!!saved.enkelQROrdersKeukenscherm);
      if (saved.aspect169Windows != null) setSysAspect169Windows(!!saved.aspect169Windows);
      if (saved.vatRateVariousProducts != null) setSysVatRateVariousProducts(saved.vatRateVariousProducts);
      if (saved.arrangeProductsManually != null) setSysArrangeProductsManually(!!saved.arrangeProductsManually);
      if (saved.limitOneUserPerTable != null) setSysLimitOneUserPerTable(!!saved.limitOneUserPerTable);
      if (saved.oneWachtorderPerKlant != null) setSysOneWachtorderPerKlant(!!saved.oneWachtorderPerKlant);
      if (saved.cashButtonVisibleMultiplePayment != null) setSysCashButtonVisibleMultiplePayment(!!saved.cashButtonVisibleMultiplePayment);
      if (saved.usePlaceSettings != null) setSysUsePlaceSettings(!!saved.usePlaceSettings);
      if (saved.tegoedAutomatischInladen != null) setSysTegoedAutomatischInladen(!!saved.tegoedAutomatischInladen);
      if (saved.nieuwstePrijsGebruiken != null) setSysNieuwstePrijsGebruiken(!!saved.nieuwstePrijsGebruiken);
      if (saved.leeggoedTerugname != null) setSysLeeggoedTerugname(saved.leeggoedTerugname);
      if (saved.klantgegevensQRAfdrukken != null) setSysKlantgegevensQRAfdrukken(!!saved.klantgegevensQRAfdrukken);
      if (saved.priceTakeAway != null) setSysPriceTakeAway(saved.priceTakeAway || '');
      if (saved.priceDelivery != null) setSysPriceDelivery(saved.priceDelivery || '');
      if (saved.priceCounterSale != null) setSysPriceCounterSale(saved.priceCounterSale || '');
      if (saved.priceTableSale != null) setSysPriceTableSale(saved.priceTableSale || '');
      if (saved.savingsPointsPerEuro != null) setSysSavingsPointsPerEuro(Number(saved.savingsPointsPerEuro) || 0);
      if (saved.savingsPointsPerDiscount != null) setSysSavingsPointsPerDiscount(Number(saved.savingsPointsPerDiscount) || 0);
      if (saved.savingsDiscount != null) setSysSavingsDiscount(saved.savingsDiscount || '');
      if (saved.ticketVoucherValidity != null) setSysTicketVoucherValidity(saved.ticketVoucherValidity);
      if (saved.ticketScheduledPrintMode != null) setSysTicketScheduledPrintMode(saved.ticketScheduledPrintMode);
      if (saved.ticketScheduledCustomerSort != null) setSysTicketScheduledCustomerSort(saved.ticketScheduledCustomerSort);
      if (saved.barcodeType != null) setSysBarcodeType(saved.barcodeType);
    } catch (_) { }
  }, [showSystemSettingsModal, fetchPriceGroups]);

  const handleSaveSystemSettings = async () => {
    setSavingSystemSettings(true);
    try {
      const payload = {
        useStockManagement: sysUseStockManagement,
        usePriceGroups: sysUsePriceGroups,
        loginWithoutCode: sysLoginWithoutCode,
        categorieenPerKassa: sysCategorieenPerKassa,
        autoAcceptQROrders: sysAutoAcceptQROrders,
        qrOrdersAutomatischAfrekenen: sysQrOrdersAutomatischAfrekenen,
        enkelQROrdersKeukenscherm: sysEnkelQROrdersKeukenscherm,
        aspect169Windows: sysAspect169Windows,
        vatRateVariousProducts: sysVatRateVariousProducts,
        arrangeProductsManually: sysArrangeProductsManually,
        limitOneUserPerTable: sysLimitOneUserPerTable,
        oneWachtorderPerKlant: sysOneWachtorderPerKlant,
        cashButtonVisibleMultiplePayment: sysCashButtonVisibleMultiplePayment,
        usePlaceSettings: sysUsePlaceSettings,
        tegoedAutomatischInladen: sysTegoedAutomatischInladen,
        nieuwstePrijsGebruiken: sysNieuwstePrijsGebruiken,
        leeggoedTerugname: sysLeeggoedTerugname,
        klantgegevensQRAfdrukken: sysKlantgegevensQRAfdrukken,
        priceTakeAway: sysPriceTakeAway,
        priceDelivery: sysPriceDelivery,
        priceCounterSale: sysPriceCounterSale,
        priceTableSale: sysPriceTableSale,
        savingsPointsPerEuro: sysSavingsPointsPerEuro,
        savingsPointsPerDiscount: sysSavingsPointsPerDiscount,
        savingsDiscount: sysSavingsDiscount,
        ticketVoucherValidity: sysTicketVoucherValidity,
        ticketScheduledPrintMode: sysTicketScheduledPrintMode,
        ticketScheduledCustomerSort: sysTicketScheduledCustomerSort,
        barcodeType: sysBarcodeType
      };
      if (typeof localStorage !== 'undefined') localStorage.setItem('pos_system_settings', JSON.stringify(payload));
      setShowSystemSettingsModal(false);
    } finally {
      setSavingSystemSettings(false);
    }
  };

  const persistPaymentTypes = (next) => {
    setPaymentTypes(next);
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem('pos_payment_types', JSON.stringify(next));
    } catch (_) { }
  };

  const openNewPaymentTypeModal = () => {
    setEditingPaymentTypeId(null);
    setPaymentTypeName('');
    setPaymentTypeActive(true);
    setShowPaymentTypeModal(true);
  };

  const openEditPaymentTypeModal = (pt) => {
    setEditingPaymentTypeId(pt.id);
    setPaymentTypeName(pt.name || '');
    setPaymentTypeActive(pt.active !== false);
    setShowPaymentTypeModal(true);
  };

  const closePaymentTypeModal = () => {
    setShowPaymentTypeModal(false);
    setEditingPaymentTypeId(null);
    setPaymentTypeName('');
    setPaymentTypeActive(true);
  };

  const handleSavePaymentType = () => {
    const name = (paymentTypeName || '').trim();
    if (!name) return;
    setSavingPaymentType(true);
    try {
      const sorted = [...paymentTypes].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      if (editingPaymentTypeId) {
        const next = sorted.map((p) => (p.id === editingPaymentTypeId ? { ...p, name, active: paymentTypeActive } : p));
        persistPaymentTypes(next);
      } else {
        const newId = 'pt-' + Date.now();
        const next = [...sorted, { id: newId, name, active: paymentTypeActive, sortOrder: sorted.length }];
        persistPaymentTypes(next);
      }
      closePaymentTypeModal();
    } finally {
      setSavingPaymentType(false);
    }
  };

  const togglePaymentTypeActive = (id) => {
    const next = paymentTypes.map((p) => (p.id === id ? { ...p, active: !p.active } : p));
    persistPaymentTypes(next);
  };

  const movePaymentType = (id, direction) => {
    const sorted = [...paymentTypes].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    const idx = sorted.findIndex((p) => p.id === id);
    if (idx < 0) return;
    const swap = direction === 'up' ? idx - 1 : idx + 1;
    if (swap < 0 || swap >= sorted.length) return;
    [sorted[idx], sorted[swap]] = [sorted[swap], sorted[idx]];
    const withOrder = sorted.map((p, i) => ({ ...p, sortOrder: i }));
    persistPaymentTypes(withOrder);
  };

  const persistProductionMessages = (next) => {
    setProductionMessages(next);
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem('pos_production_messages', JSON.stringify(next));
    } catch (_) { }
  };

  useEffect(() => {
    if (!showProductionMessagesModal) return;
    try {
      const raw = typeof localStorage !== 'undefined' && localStorage.getItem('pos_production_messages');
      const list = raw ? JSON.parse(raw) : [];
      setProductionMessages(Array.isArray(list) ? list : []);
      setProductionMessageInput('');
      setEditingProductionMessageId(null);
    } catch (_) {
      setProductionMessages([]);
    }
  }, [showProductionMessagesModal]);

  const handleAddOrUpdateProductionMessage = () => {
    const text = (productionMessageInput || '').trim();
    if (!text) return;
    const sorted = [...productionMessages].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    if (editingProductionMessageId) {
      const next = sorted.map((m) => (m.id === editingProductionMessageId ? { ...m, text } : m));
      persistProductionMessages(next);
      setEditingProductionMessageId(null);
    } else {
      const newId = 'pm-' + Date.now();
      const next = [...sorted, { id: newId, text, sortOrder: sorted.length }];
      persistProductionMessages(next);
    }
    setProductionMessageInput('');
  };

  const startEditProductionMessage = (m) => {
    setEditingProductionMessageId(m.id);
    setProductionMessageInput(m.text || '');
  };

  const cancelEditProductionMessage = () => {
    setEditingProductionMessageId(null);
    setProductionMessageInput('');
  };

  const handleDeleteProductionMessage = (id) => {
    const next = productionMessages.filter((m) => m.id !== id).map((m, i) => ({ ...m, sortOrder: i }));
    persistProductionMessages(next);
    setDeleteConfirmProductionMessageId(null);
    if (editingProductionMessageId === id) cancelEditProductionMessage();
  };

  const moveProductionMessage = (id, direction) => {
    const sorted = [...productionMessages].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    const idx = sorted.findIndex((m) => m.id === id);
    if (idx < 0) return;
    const swap = direction === 'up' ? idx - 1 : idx + 1;
    if (swap < 0 || swap >= sorted.length) return;
    [sorted[idx], sorted[swap]] = [sorted[swap], sorted[idx]];
    const withOrder = sorted.map((m, i) => ({ ...m, sortOrder: i }));
    persistProductionMessages(withOrder);
  };

  const persistPrinters = (next) => {
    setPrinters(next);
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem('pos_printers', JSON.stringify(next));
    } catch (_) { }
  };

  const parseSerialComPort = (connectionString = '') => {
    const s = String(connectionString || '').trim();
    if (!s) return '';
    if (s.startsWith('serial://')) return (s.substring(9).split('?')[0] || '').trim().toUpperCase();
    if (s.startsWith('\\\\.\\')) return s.substring(4).trim().toUpperCase();
    return s.trim().toUpperCase();
  };

  const parseNetworkAddress = (connectionString = '') => {
    const s = String(connectionString || '').trim();
    if (!s.startsWith('tcp://')) return { ipAddress: '', port: '9100' };
    const [ipAddress = '', port = '9100'] = s.substring(6).split(':');
    return { ipAddress: ipAddress.trim(), port: String(port || '9100').trim() };
  };

  const parseCashmaticConnectionString = (connectionString = '') => {
    const pickFromConfig = (config, keys) => {
      for (const key of keys) {
        if (config[key] != null && String(config[key]).trim() !== '') return String(config[key]).trim();
        const lower = key.toLowerCase();
        const match = Object.keys(config).find((k) => k.toLowerCase() === lower && config[k] != null && String(config[k]).trim() !== '');
        if (match) return String(config[match]).trim();
      }
      return '';
    };

    const raw = String(connectionString || '').trim();
    if (!raw) {
      return { ip: '', port: '', username: '', password: '', url: '' };
    }

    let config = {};
    try {
      config = JSON.parse(raw);
    } catch {
      if (raw.startsWith('tcp://')) {
        const [ip = '', port = '50301'] = raw.substring(6).split(':');
        return { ip: ip.trim(), port: String(port || '50301').trim(), username: '', password: '', url: '' };
      }
      return { ip: raw, port: '', username: '', password: '', url: '' };
    }

    const url = pickFromConfig(config, ['url', 'apiUrl', 'api_url', 'endpoint']);
    const ip = pickFromConfig(config, ['ip', 'ipAddress', 'ip_address']) || (() => {
      if (!url) return '';
      try {
        return new URL(url).hostname || '';
      } catch {
        return '';
      }
    })();
    const port = pickFromConfig(config, ['port']) || (() => {
      if (!url) return '';
      try {
        return String(new URL(url).port || '');
      } catch {
        return '';
      }
    })();
    const username =
      pickFromConfig(config, ['username', 'userName', 'user_name', 'user', 'login']) ||
      (() => {
        if (!url) return '';
        try {
          return new URL(url).username || '';
        } catch {
          return '';
        }
      })();
    const password =
      pickFromConfig(config, ['password', 'pass', 'pwd']) ||
      (() => {
        if (!url) return '';
        try {
          return new URL(url).password || '';
        } catch {
          return '';
        }
      })();

    return { ip, port, username, password, url };
  };

  const mapApiPrinterToUi = (p, index) => {
    const apiType = String(p?.type || '').toLowerCase();
    const connection = String(p?.connection_string || '');
    if (apiType === 'serial') {
      return {
        id: p.id,
        name: p.name || '',
        type: 'COM',
        comPort: parseSerialComPort(connection),
        baudrate: String(p?.baud_rate ?? '9600'),
        characters: '48',
        printerName: '',
        ipAddress: '',
        port: '',
        standard: p?.is_main === 1,
        isDefault: p?.is_main === 1,
        numberOfPrints: 1,
        productionTicketSize: 'normal',
        vatTicketSize: 'normal',
        spaceBetweenProducts: 'none',
        logo: 'disable',
        printerType: 'Esc',
        sortOrder: index,
      };
    }
    if (apiType === 'windows') {
      if (connection.startsWith('tcp://')) {
        const { ipAddress, port } = parseNetworkAddress(connection);
        return {
          id: p.id,
          name: p.name || '',
          type: 'Network',
          comPort: '',
          baudrate: '9600',
          characters: '48',
          printerName: '',
          ipAddress,
          port,
          standard: p?.is_main === 1,
          isDefault: p?.is_main === 1,
          numberOfPrints: 1,
          productionTicketSize: 'normal',
          vatTicketSize: 'normal',
          spaceBetweenProducts: 'none',
          logo: 'disable',
          printerType: 'Esc',
          sortOrder: index,
        };
      }
      return {
        id: p.id,
        name: p.name || '',
        type: 'USB',
        comPort: '',
        baudrate: '9600',
        characters: '48',
        printerName: connection || '',
        ipAddress: '',
        port: '',
        standard: p?.is_main === 1,
        isDefault: p?.is_main === 1,
        numberOfPrints: 1,
        productionTicketSize: 'normal',
        vatTicketSize: 'normal',
        spaceBetweenProducts: 'none',
        logo: 'disable',
        printerType: 'Esc',
        sortOrder: index,
      };
    }
    return {
      id: p?.id ?? `p-${index}`,
      name: p?.name || '',
      type: 'COM',
      comPort: '',
      baudrate: '9600',
      characters: '48',
      printerName: '',
      ipAddress: '',
      port: '',
      standard: false,
      isDefault: false,
      numberOfPrints: 1,
      productionTicketSize: 'normal',
      vatTicketSize: 'normal',
      spaceBetweenProducts: 'none',
      logo: 'disable',
      printerType: 'Esc',
      sortOrder: index,
    };
  };

  const fetchPrintersFromDb = useCallback(async () => {
    try {
      const res = await fetch(`${API}/printers`);
      const data = await res.json().catch(() => null);
      const list = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
      if (!Array.isArray(list)) return;
      const mapped = list.map((p, i) => mapApiPrinterToUi(p, i));
      if (mapped.length) {
        persistPrinters(mapped);
      } else {
        persistPrinters([]);
      }
    } catch {
      // Keep existing local state when backend is unavailable.
    }
  }, []);

  useEffect(() => {
    fetchPrintersFromDb();
  }, [fetchPrintersFromDb]);

  const openNewPrinterModal = () => {
    setEditingPrinterId(null);
    setShowPrinterModal(true);
  };

  const openEditPrinterModal = (p) => {
    setEditingPrinterId(p.id);
    setShowPrinterModal(true);
  };

  const closePrinterModal = () => {
    setShowPrinterModal(false);
    setEditingPrinterId(null);
  };

  const handleSavePrinterPayload = async (payload) => {
    const sorted = [...printers].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    const type = String(payload?.type || 'COM');
    const apiType = type === 'COM' ? 'serial' : 'windows';
    const connectionString =
      type === 'COM'
        ? `serial://${(payload?.comPort || '').trim().toUpperCase()}`
        : type === 'USB'
          ? String(payload?.printerName || '').trim()
          : `tcp://${String(payload?.ipAddress || '').trim()}:${String(payload?.port || '9100').trim()}`;
    const requestBody = {
      name: String(payload?.name || '').trim(),
      type: apiType,
      connection_string: connectionString,
      baud_rate: type === 'COM' ? payload?.baudrate : null,
      data_bits: null,
      parity: null,
      stop_bits: null,
      is_main: payload?.standard ? 1 : 0,
      enabled: 1,
    };
    try {
      const endpoint = editingPrinterId ? `${API}/printers/${editingPrinterId}` : `${API}/printers`;
      const method = editingPrinterId ? 'PUT' : 'POST';
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await fetchPrintersFromDb();
      showToast('success', 'Printer saved to database.');
      closePrinterModal();
    } catch {
      // Fallback to old local-only behavior if DB save fails.
      if (editingPrinterId) {
        const next = sorted.map((p) => (p.id === editingPrinterId ? { ...p, ...payload } : p));
        persistPrinters(next);
      } else {
        const newId = 'prn-' + Date.now();
        const next = [...sorted, { id: newId, ...payload, isDefault: false, sortOrder: sorted.length }];
        persistPrinters(next);
      }
      showToast('error', 'Failed to save printer to database. Saved locally only.');
      closePrinterModal();
    }
  };

  const setDefaultPrinter = async (id) => {
    try {
      const res = await fetch(`${API}/printers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_main: 1 }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await fetchPrintersFromDb();
      showToast('success', 'Default printer updated.');
    } catch {
      const next = printers.map((p) => ({ ...p, isDefault: p.id === id }));
      persistPrinters(next);
      showToast('error', 'Failed to update default printer in database. Updated locally only.');
    }
  };

  const handleDeletePrinter = async (id) => {
    try {
      const res = await fetch(`${API}/printers/${id}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) throw new Error(`HTTP ${res.status}`);
      await fetchPrintersFromDb();
      setDeleteConfirmPrinterId(null);
      showToast('success', 'Printer deleted.');
    } catch {
      const next = printers.filter((p) => p.id !== id).map((p, i) => ({ ...p, sortOrder: i }));
      persistPrinters(next);
      setDeleteConfirmPrinterId(null);
      showToast('error', 'Failed to delete printer from database. Deleted locally only.');
    }
  };

  const movePrinter = (id, direction) => {
    const sorted = [...printers].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    const idx = sorted.findIndex((p) => p.id === id);
    if (idx < 0) return;
    const swap = direction === 'up' ? idx - 1 : idx + 1;
    if (swap < 0 || swap >= sorted.length) return;
    [sorted[idx], sorted[swap]] = [sorted[swap], sorted[idx]];
    const withOrder = sorted.map((p, i) => ({ ...p, sortOrder: i }));
    persistPrinters(withOrder);
  };

  useEffect(() => {
    if (printerTab !== 'Final tickets') return;
    try {
      const raw = typeof localStorage !== 'undefined' && localStorage.getItem('pos_printer_final_tickets');
      if (raw) {
        const s = JSON.parse(raw);
        if (s.companyData1 != null) setFinalTicketsCompanyData1(s.companyData1);
        if (s.companyData2 != null) setFinalTicketsCompanyData2(s.companyData2);
        if (s.companyData3 != null) setFinalTicketsCompanyData3(s.companyData3);
        if (s.companyData4 != null) setFinalTicketsCompanyData4(s.companyData4);
        if (s.companyData5 != null) setFinalTicketsCompanyData5(s.companyData5);
        if (s.thankText != null) setFinalTicketsThankText(s.thankText);
        if (s.proforma != null) setFinalTicketsProforma(!!s.proforma);
        if (s.printPaymentType != null) setFinalTicketsPrintPaymentType(!!s.printPaymentType);
        if (s.ticketTearable != null) setFinalTicketsTicketTearable(!!s.ticketTearable);
        if (s.printLogo != null) setFinalTicketsPrintLogo(!!s.printLogo);
        if (s.printingOrder != null) setFinalTicketsPrintingOrder(s.printingOrder);
      }
    } catch (_) { }
  }, [printerTab]);

  const finalTicketsKeyboardValue = finalTicketsActiveField === 'companyData1' ? finalTicketsCompanyData1
    : finalTicketsActiveField === 'companyData2' ? finalTicketsCompanyData2
      : finalTicketsActiveField === 'companyData3' ? finalTicketsCompanyData3
        : finalTicketsActiveField === 'companyData4' ? finalTicketsCompanyData4
          : finalTicketsActiveField === 'companyData5' ? finalTicketsCompanyData5
            : finalTicketsActiveField === 'thankText' ? finalTicketsThankText
              : '';

  const finalTicketsKeyboardOnChange = (v) => {
    if (finalTicketsActiveField === 'companyData1') setFinalTicketsCompanyData1(v);
    else if (finalTicketsActiveField === 'companyData2') setFinalTicketsCompanyData2(v);
    else if (finalTicketsActiveField === 'companyData3') setFinalTicketsCompanyData3(v);
    else if (finalTicketsActiveField === 'companyData4') setFinalTicketsCompanyData4(v);
    else if (finalTicketsActiveField === 'companyData5') setFinalTicketsCompanyData5(v);
    else if (finalTicketsActiveField === 'thankText') setFinalTicketsThankText(v);
  };

  const handleSaveFinalTickets = () => {
    setSavingFinalTickets(true);
    try {
      const payload = {
        companyData1: finalTicketsCompanyData1,
        companyData2: finalTicketsCompanyData2,
        companyData3: finalTicketsCompanyData3,
        companyData4: finalTicketsCompanyData4,
        companyData5: finalTicketsCompanyData5,
        thankText: finalTicketsThankText,
        proforma: finalTicketsProforma,
        printPaymentType: finalTicketsPrintPaymentType,
        ticketTearable: finalTicketsTicketTearable,
        printLogo: finalTicketsPrintLogo,
        printingOrder: finalTicketsPrintingOrder
      };
      if (typeof localStorage !== 'undefined') localStorage.setItem('pos_printer_final_tickets', JSON.stringify(payload));
    } finally {
      setSavingFinalTickets(false);
    }
  };

  useEffect(() => {
    if (printerTab !== 'Production Tickets') return;
    try {
      const raw = typeof localStorage !== 'undefined' && localStorage.getItem('pos_printer_production_tickets');
      if (raw) {
        const s = JSON.parse(raw);
        if (s.displayCategories != null) setProdTicketsDisplayCategories(!!s.displayCategories);
        if (s.spaceAbove != null) setProdTicketsSpaceAbove(!!s.spaceAbove);
        if (s.ticketTearable != null) setProdTicketsTicketTearable(!!s.ticketTearable);
        if (s.keukenprinterBuzzer != null) setProdTicketsKeukenprinterBuzzer(!!s.keukenprinterBuzzer);
        if (s.productenIndividueel != null) setProdTicketsProductenIndividueel(!!s.productenIndividueel);
        if (s.eatInTakeOutOnderaan != null) setProdTicketsEatInTakeOutOnderaan(!!s.eatInTakeOutOnderaan);
        if (s.nextCoursePrinter1 != null) setProdTicketsNextCoursePrinter1(s.nextCoursePrinter1);
        if (s.nextCoursePrinter2 != null) setProdTicketsNextCoursePrinter2(s.nextCoursePrinter2);
        if (s.nextCoursePrinter3 != null) setProdTicketsNextCoursePrinter3(s.nextCoursePrinter3);
        if (s.nextCoursePrinter4 != null) setProdTicketsNextCoursePrinter4(s.nextCoursePrinter4);
        if (s.printingOrder != null) setProdTicketsPrintingOrder(s.printingOrder);
        if (s.groupingReceipt != null) setProdTicketsGroupingReceipt(s.groupingReceipt);
        if (s.printerOverboeken != null) setProdTicketsPrinterOverboeken(s.printerOverboeken);
      }
    } catch (_) { }
  }, [printerTab]);

  const handleSaveProductionTickets = () => {
    setSavingProdTickets(true);
    try {
      const payload = {
        displayCategories: prodTicketsDisplayCategories,
        spaceAbove: prodTicketsSpaceAbove,
        ticketTearable: prodTicketsTicketTearable,
        keukenprinterBuzzer: prodTicketsKeukenprinterBuzzer,
        productenIndividueel: prodTicketsProductenIndividueel,
        eatInTakeOutOnderaan: prodTicketsEatInTakeOutOnderaan,
        nextCoursePrinter1: prodTicketsNextCoursePrinter1,
        nextCoursePrinter2: prodTicketsNextCoursePrinter2,
        nextCoursePrinter3: prodTicketsNextCoursePrinter3,
        nextCoursePrinter4: prodTicketsNextCoursePrinter4,
        printingOrder: prodTicketsPrintingOrder,
        groupingReceipt: prodTicketsGroupingReceipt,
        printerOverboeken: prodTicketsPrinterOverboeken
      };
      if (typeof localStorage !== 'undefined') localStorage.setItem('pos_printer_production_tickets', JSON.stringify(payload));
    } finally {
      setSavingProdTickets(false);
    }
  };

  const productionTicketsPrinterOptions = [
    ...PRINTER_DISABLED_OPTIONS,
    ...printers.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)).map((p) => ({ value: p.id, label: p.name }))
  ];

  const sortedPrintersForProductModal = [...printers].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const getUniqueProductPrinterOptions = (currentPrinterId, otherPrinterIds = []) => {
    const usedIds = new Set(
      (Array.isArray(otherPrinterIds) ? otherPrinterIds : [])
        .map((id) => String(id || '').trim())
        .filter(Boolean)
    );
    return [
      { value: '', label: tr('control.productModal.disabled', 'Disabled') },
      ...sortedPrintersForProductModal
        .filter((p) => p.id === currentPrinterId || !usedIds.has(p.id))
        .map((p) => ({ value: p.id, label: p.name }))
    ];
  };

  const labelsPrinterOptions = printers.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)).map((p) => ({ value: p.id, label: p.name }));

  useEffect(() => {
    if (printerTab !== 'Labels') return;
    try {
      const raw = typeof localStorage !== 'undefined' && localStorage.getItem('pos_printer_labels');
      if (raw) {
        const s = JSON.parse(raw);
        if (s.type != null) setLabelsType(s.type);
        if (s.printer != null) setLabelsPrinter(s.printer);
      }
      const rawList = typeof localStorage !== 'undefined' && localStorage.getItem('pos_printer_labels_list');
      if (rawList) {
        const list = JSON.parse(rawList);
        if (Array.isArray(list) && list.length) setLabelsList(list);
      }
    } catch (_) { }
  }, [printerTab]);

  useEffect(() => {
    if (printerTab !== 'Labels') setLabelsListPage(0);
  }, [printerTab]);

  const persistLabelsList = (next) => {
    setLabelsList(next);
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem('pos_printer_labels_list', JSON.stringify(next));
    } catch (_) { }
  };

  const saveLabelsSettings = (updates) => {
    try {
      if (typeof localStorage === 'undefined') return;
      const raw = localStorage.getItem('pos_printer_labels');
      const prev = raw ? JSON.parse(raw) : {};
      const next = { type: labelsType, printer: labelsPrinter, ...updates };
      localStorage.setItem('pos_printer_labels', JSON.stringify(next));
      if (updates.type != null) setLabelsType(updates.type);
      if (updates.printer != null) setLabelsPrinter(updates.printer);
    } catch (_) { }
  };

  const openNewLabelModal = () => {
    setEditingLabelId(null);
    setLabelName('');
    setLabelHeight('');
    setLabelWidth('');
    setLabelStandard(false);
    setLabelMarginLeft('0');
    setLabelMarginRight('0');
    setLabelMarginBottom('0');
    setLabelMarginTop('0');
    setShowLabelModal(true);
  };

  const openEditLabelModal = (item) => {
    setEditingLabelId(item.id);
    setLabelName(item.name ?? item.sizeLabel ?? '');
    setLabelHeight(String(item.height ?? ''));
    setLabelWidth(String(item.width ?? ''));
    setLabelStandard(!!item.standard);
    setLabelMarginLeft(String(item.marginLeft ?? '0'));
    setLabelMarginRight(String(item.marginRight ?? '0'));
    setLabelMarginBottom(String(item.marginBottom ?? '0'));
    setLabelMarginTop(String(item.marginTop ?? '0'));
    setShowLabelModal(true);
  };

  const closeLabelModal = () => {
    setShowLabelModal(false);
    setEditingLabelId(null);
    setLabelName('');
    setLabelHeight('');
    setLabelWidth('');
    setLabelStandard(false);
    setLabelMarginLeft('0');
    setLabelMarginRight('0');
    setLabelMarginBottom('0');
    setLabelMarginTop('0');
  };

  const handleSaveLabel = () => {
    const name = (labelName || '').trim();
    if (!name) return;
    const sorted = [...labelsList].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    const payload = {
      name,
      sizeLabel: name,
      height: labelHeight.trim() || undefined,
      width: labelWidth.trim() || undefined,
      standard: labelStandard,
      marginLeft: Number(labelMarginLeft) || 0,
      marginRight: Number(labelMarginRight) || 0,
      marginBottom: Number(labelMarginBottom) || 0,
      marginTop: Number(labelMarginTop) || 0
    };
    if (editingLabelId) {
      const next = sorted.map((l) => (l.id === editingLabelId ? { ...l, ...payload } : l));
      persistLabelsList(next);
    } else {
      const newId = 'lbl-' + Date.now();
      const next = [...sorted, { id: newId, ...payload, sortOrder: sorted.length }];
      persistLabelsList(next);
    }
    closeLabelModal();
  };

  const handleDeleteLabel = (id) => {
    const next = labelsList.filter((l) => l.id !== id).map((l, i) => ({ ...l, sortOrder: i }));
    persistLabelsList(next);
    setDeleteConfirmLabelId(null);
  };

  const moveLabel = (id, direction) => {
    const sorted = [...labelsList].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    const idx = sorted.findIndex((l) => l.id === id);
    if (idx < 0) return;
    const swap = direction === 'up' ? idx - 1 : idx + 1;
    if (swap < 0 || swap >= sorted.length) return;
    [sorted[idx], sorted[swap]] = [sorted[swap], sorted[idx]];
    const withOrder = sorted.map((l, i) => ({ ...l, sortOrder: i }));
    persistLabelsList(withOrder);
  };

  useEffect(() => {
    if (topNavId !== 'external-devices' || subNavId !== 'Price Display') return;
    try {
      const raw = typeof localStorage !== 'undefined' && localStorage.getItem('pos_price_display');
      if (raw) {
        const s = JSON.parse(raw);
        if (s.type != null) setPriceDisplayType(s.type);
      }
    } catch (_) { }
  }, [topNavId, subNavId]);

  useEffect(() => {
    if (topNavId !== 'external-devices' || subNavId !== 'RFID Reader') return;
    try {
      const raw = typeof localStorage !== 'undefined' && localStorage.getItem('pos_rfid_reader');
      if (raw) {
        const s = JSON.parse(raw);
        if (s.type != null) setRfidReaderType(s.type);
      }
    } catch (_) { }
  }, [topNavId, subNavId]);

  useEffect(() => {
    if (topNavId !== 'external-devices' || subNavId !== 'Barcode Scanner') return;
    try {
      const raw = typeof localStorage !== 'undefined' && localStorage.getItem('pos_barcode_scanner');
      if (raw) {
        const s = JSON.parse(raw);
        if (s.type != null) setBarcodeScannerType(s.type);
        if (s.port != null) setBarcodeScannerPort(s.port);
      }
    } catch (_) { }
  }, [topNavId, subNavId]);

  useEffect(() => {
    if (topNavId !== 'external-devices' || subNavId !== 'Credit Card') return;
    try {
      const raw = typeof localStorage !== 'undefined' && localStorage.getItem('pos_credit_card');
      if (raw) {
        const s = JSON.parse(raw);
        if (s.type != null) setCreditCardType(s.type);
      }
    } catch (_) { }
  }, [topNavId, subNavId]);

  useEffect(() => {
    if (topNavId !== 'external-devices' || subNavId !== 'Libra') return;
    try {
      const raw = typeof localStorage !== 'undefined' && localStorage.getItem('pos_scale');
      if (raw) {
        const s = JSON.parse(raw);
        if (s.type != null) setScaleType(s.type);
        if (s.port != null) setScalePort(s.port);
      }
    } catch (_) { }
  }, [topNavId, subNavId]);

  useEffect(() => {
    if (topNavId !== 'external-devices' || subNavId !== 'Cashmatic') return;
    let cancelled = false;
    try {
      const raw = typeof localStorage !== 'undefined' && localStorage.getItem('pos_cashmatic');
      if (raw) {
        const s = JSON.parse(raw);
        if (s.name != null) setCashmaticName(String(s.name));
        if (s.connectionType != null) setCashmaticConnectionType(String(s.connectionType).toLowerCase() === 'api' ? 'api' : 'tcp');
        if (s.ip != null) setCashmaticIpAddress(String(s.ip));
        if (s.port != null) setCashmaticPort(String(s.port));
        if (s.username != null) setCashmaticUsername(String(s.username));
        if (s.password != null) setCashmaticPassword(String(s.password));
        if (s.url != null) setCashmaticUrl(String(s.url));
        // Backward compatibility with old "ipPort" format
        if ((s.ip == null || s.port == null) && s.ipPort) {
          const [ip, port] = String(s.ipPort).split(':');
          if (ip && s.ip == null) setCashmaticIpAddress(ip);
          if (port && s.port == null) setCashmaticPort(port);
        }
      }
    } catch (_) { }
    const loadCashmaticFromDb = async () => {
      try {
        const res = await fetch(`${API}/payment-terminals`);
        const data = await res.json().catch(() => null);
        if (!res.ok) return;
        const terminals = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
        const cashmatic = terminals.find((t) => String(t?.type || '').toLowerCase() === 'cashmatic');
        if (!cashmatic || cancelled) return;
        const parsed = parseCashmaticConnectionString(cashmatic.connection_string);
        setCashmaticTerminalId(cashmatic.id || null);
        if (cashmatic.name != null) setCashmaticName(String(cashmatic.name));
        if (cashmatic.connection_type != null) {
          setCashmaticConnectionType(String(cashmatic.connection_type).toLowerCase() === 'api' ? 'api' : 'tcp');
        }
        if (parsed.ip) setCashmaticIpAddress(parsed.ip);
        if (parsed.port) setCashmaticPort(parsed.port);
        if (parsed.username) setCashmaticUsername(parsed.username);
        if (parsed.password) setCashmaticPassword(parsed.password);
        if (parsed.url) setCashmaticUrl(parsed.url);
      } catch {
        // Keep local values if backend is unavailable.
      }
    };
    loadCashmaticFromDb();
    return () => {
      cancelled = true;
    };
  }, [topNavId, subNavId]);

  useEffect(() => {
    if (topNavId !== 'external-devices' || subNavId !== 'Payworld') return;
    let cancelled = false;
    try {
      const raw = typeof localStorage !== 'undefined' && localStorage.getItem('pos_payworld');
      if (raw) {
        const s = JSON.parse(raw);
        if (s.name != null) setPayworldName(String(s.name));
        if (s.ip != null) setPayworldIpAddress(String(s.ip));
        if (s.port != null) setPayworldPort(String(s.port));
      }
    } catch (_) { }
    const loadPayworldFromDb = async () => {
      try {
        const res = await fetch(`${API}/payment-terminals`);
        const data = await res.json().catch(() => null);
        if (!res.ok) return;
        const terminals = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
        const payworld = terminals.find((t) => String(t?.type || '').toLowerCase() === 'payworld');
        if (!payworld || cancelled) return;
        let parsed = {};
        try {
          parsed = typeof payworld.connection_string === 'string' ? JSON.parse(payworld.connection_string) : (payworld.connection_string || {});
        } catch (_) { }
        setPayworldTerminalId(payworld.id || null);
        if (payworld.name != null) setPayworldName(String(payworld.name));
        if (parsed.ip != null) setPayworldIpAddress(String(parsed.ip));
        if (parsed.port != null) setPayworldPort(String(parsed.port));
      } catch {
        // Keep local values if backend is unavailable.
      }
    };
    loadPayworldFromDb();
    return () => { cancelled = true; };
  }, [topNavId, subNavId]);

  useEffect(() => {
    if (controlSidebarId !== 'reports' || reportTabId !== 'settings') return;
    try {
      const raw = typeof localStorage !== 'undefined' && localStorage.getItem('pos_report_settings');
      if (raw) {
        const s = JSON.parse(raw);
        if (s && typeof s === 'object') setReportSettings((prev) => ({ ...prev, ...s }));
      }
    } catch (_) { }
  }, [controlSidebarId, reportTabId]);

  const handleSavePriceDisplay = () => {
    setSavingPriceDisplay(true);
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem('pos_price_display', JSON.stringify({ type: priceDisplayType }));
    } finally {
      setSavingPriceDisplay(false);
    }
  };

  const handleSaveRfidReader = () => {
    setSavingRfidReader(true);
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem('pos_rfid_reader', JSON.stringify({ type: rfidReaderType }));
    } finally {
      setSavingRfidReader(false);
    }
  };

  const handleSaveBarcodeScanner = () => {
    setSavingBarcodeScanner(true);
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem('pos_barcode_scanner', JSON.stringify({ type: barcodeScannerType, port: barcodeScannerPort }));
    } finally {
      setSavingBarcodeScanner(false);
    }
  };

  const handleSaveCreditCard = () => {
    setSavingCreditCard(true);
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem('pos_credit_card', JSON.stringify({ type: creditCardType }));
    } finally {
      setSavingCreditCard(false);
    }
  };

  const handleSaveScale = () => {
    setSavingScale(true);
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem('pos_scale', JSON.stringify({ type: scaleType, port: scalePort }));
    } finally {
      setSavingScale(false);
    }
  };

  const handleSaveCashmatic = async () => {
    setSavingCashmatic(true);
    try {
      const trimmedUsername = String(cashmaticUsername || '').trim();
      const trimmedPassword = String(cashmaticPassword || '').trim();
      const trimmedIp = String(cashmaticIpAddress || '').trim();
      const trimmedUrl = String(cashmaticUrl || '').trim();
      const trimmedPort = String(cashmaticPort || '').trim();
      const resolvedPort = trimmedPort || '50301';
      const validPort = Number.parseInt(resolvedPort, 10);
      if (!trimmedUsername || !trimmedPassword) {
        throw new Error('Cashmatic username and password are required.');
      }
      if (cashmaticConnectionType === 'tcp' && !trimmedIp) {
        throw new Error('Cashmatic IP address is required for TCP/IP.');
      }
      if (cashmaticConnectionType === 'tcp' && /^[0-9]+$/.test(trimmedIp)) {
        throw new Error('Cashmatic IP address is invalid. Please enter a full IP like 192.168.1.60.');
      }
      if (cashmaticConnectionType === 'api' && !trimmedUrl && !trimmedIp) {
        throw new Error('Cashmatic URL or IP address is required for API mode.');
      }
      if (!Number.isInteger(validPort) || validPort < 1 || validPort > 65535) {
        throw new Error('Cashmatic port must be a number between 1 and 65535.');
      }

      const connectionConfig = cashmaticConnectionType === 'api'
        ? {
          url: trimmedUrl,
          ip: trimmedIp,
          port: resolvedPort,
          username: trimmedUsername,
          password: trimmedPassword,
        }
        : {
          ip: trimmedIp,
          port: resolvedPort,
          username: trimmedUsername,
          password: trimmedPassword,
        };

      const terminalPayload = {
        name: String(cashmaticName || '').trim() || 'Cashmatic Terminal',
        type: 'cashmatic',
        connection_type: cashmaticConnectionType === 'api' ? 'api' : 'tcp',
        connection_string: JSON.stringify(connectionConfig),
        enabled: 1,
        is_main: 1,
      };

      let terminalId = cashmaticTerminalId;
      if (!terminalId) {
        const listRes = await fetch(`${API}/payment-terminals`);
        const listData = await listRes.json().catch(() => null);
        const list = Array.isArray(listData?.data) ? listData.data : (Array.isArray(listData) ? listData : []);
        const existing = list.find((t) => String(t?.type || '').toLowerCase() === 'cashmatic');
        if (existing?.id) terminalId = existing.id;
      }

      const endpoint = terminalId ? `${API}/payment-terminals/${terminalId}` : `${API}/payment-terminals`;
      const method = terminalId ? 'PUT' : 'POST';
      const saveRes = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(terminalPayload),
      });
      const saved = await saveRes.json().catch(() => ({}));
      if (!saveRes.ok) {
        throw new Error(saved?.error || `Failed to save Cashmatic terminal (HTTP ${saveRes.status})`);
      }
      if (saved?.id) setCashmaticTerminalId(saved.id);

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('pos_cashmatic', JSON.stringify({
          name: terminalPayload.name,
          connectionType: cashmaticConnectionType,
          ip: connectionConfig.ip,
          port: connectionConfig.port,
          username: connectionConfig.username,
          password: connectionConfig.password,
          url: connectionConfig.url || '',
          ipPort: `${connectionConfig.ip}${connectionConfig.port ? `:${connectionConfig.port}` : ''}`,
        }));
      }
      showToast('success', 'Cashmatic settings saved.');
    } catch (err) {
      showToast('error', err?.message || 'Failed to save Cashmatic settings.');
    } finally {
      setSavingCashmatic(false);
    }
  };

  const handleSavePayworld = async () => {
    setSavingPayworld(true);
    try {
      const trimmedIp = String(payworldIpAddress || '').trim();
      const trimmedPort = String(payworldPort || '').trim();
      const resolvedPort = trimmedPort || '5015';
      const validPort = Number.parseInt(resolvedPort, 10);
      if (!trimmedIp) {
        throw new Error('Payworld IP address is required.');
      }
      if (/^[0-9]+$/.test(trimmedIp)) {
        throw new Error('Payworld IP address is invalid. Please enter a full IP like 192.168.1.60.');
      }
      if (!Number.isInteger(validPort) || validPort < 1 || validPort > 65535) {
        throw new Error('Payworld port must be a number between 1 and 65535.');
      }
      const connectionConfig = { ip: trimmedIp, port: resolvedPort };
      const terminalPayload = {
        name: String(payworldName || '').trim() || 'Payworld Terminal',
        type: 'payworld',
        connection_type: 'tcp',
        connection_string: JSON.stringify(connectionConfig),
        enabled: 1,
        is_main: 1,
      };
      let terminalId = payworldTerminalId;
      if (!terminalId) {
        const listRes = await fetch(`${API}/payment-terminals`);
        const listData = await listRes.json().catch(() => null);
        const list = Array.isArray(listData?.data) ? listData.data : (Array.isArray(listData) ? listData : []);
        const existing = list.find((t) => String(t?.type || '').toLowerCase() === 'payworld');
        if (existing?.id) terminalId = existing.id;
      }
      const endpoint = terminalId ? `${API}/payment-terminals/${terminalId}` : `${API}/payment-terminals`;
      const method = terminalId ? 'PUT' : 'POST';
      const saveRes = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(terminalPayload),
      });
      const saved = await saveRes.json().catch(() => ({}));
      if (!saveRes.ok) {
        throw new Error(saved?.error || `Failed to save Payworld terminal (HTTP ${saveRes.status})`);
      }
      if (saved?.id) setPayworldTerminalId(saved.id);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('pos_payworld', JSON.stringify({
          name: terminalPayload.name,
          ip: connectionConfig.ip,
          port: connectionConfig.port,
        }));
      }
      showToast('success', 'Payworld settings saved.');
    } catch (err) {
      showToast('error', err?.message || 'Failed to save Payworld settings.');
    } finally {
      setSavingPayworld(false);
    }
  };

  const cashmaticKeyboardValue =
    cashmaticActiveField === 'name' ? cashmaticName
      : cashmaticActiveField === 'ip' ? cashmaticIpAddress
        : cashmaticActiveField === 'port' ? cashmaticPort
          : cashmaticActiveField === 'username' ? cashmaticUsername
            : cashmaticActiveField === 'password' ? cashmaticPassword
              : cashmaticActiveField === 'url' ? cashmaticUrl
                : '';

  const cashmaticKeyboardOnChange = (v) => {
    if (cashmaticActiveField === 'name') setCashmaticName(v);
    else if (cashmaticActiveField === 'ip') setCashmaticIpAddress(v);
    else if (cashmaticActiveField === 'port') setCashmaticPort(v);
    else if (cashmaticActiveField === 'username') setCashmaticUsername(v);
    else if (cashmaticActiveField === 'password') setCashmaticPassword(v);
    else if (cashmaticActiveField === 'url') setCashmaticUrl(v);
  };

  const payworldKeyboardValue =
    payworldActiveField === 'name' ? payworldName
      : payworldActiveField === 'ip' ? payworldIpAddress
        : payworldActiveField === 'port' ? payworldPort
          : '';

  const payworldKeyboardOnChange = (v) => {
    if (payworldActiveField === 'name') setPayworldName(v);
    else if (payworldActiveField === 'ip') setPayworldIpAddress(v);
    else if (payworldActiveField === 'port') setPayworldPort(v);
  };

  const setReportSetting = (rowId, column, value) => {
    setReportSettings((prev) => ({
      ...prev,
      [rowId]: { ...prev[rowId], [column]: value }
    }));
  };

  const handleSaveReportSettings = () => {
    setSavingReportSettings(true);
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem('pos_report_settings', JSON.stringify(reportSettings));
    } finally {
      setSavingReportSettings(false);
    }
  };

  const openNewUserModal = () => {
    setEditingUserId(null);
    setUserName('');
    setUserPin('');
    setUserModalTab('general');
    setUserAvatarColorIndex(0);
    setUserModalActiveField(null);
    setUserPrivileges({ ...DEFAULT_USER_PRIVILEGES });
    setShowUserModal(true);
  };

  const openEditUserModal = async (u) => {
    setEditingUserId(u.id);
    setUserName(u.name || '');
    setUserPin('');
    setUserModalTab('general');
    setUserAvatarColorIndex(0);
    setUserModalActiveField(null);
    setUserPrivileges({ ...DEFAULT_USER_PRIVILEGES });
    try {
      const res = await fetch(`${API}/users/${u.id}`);
      const data = await res.json();
      if (res.ok && data) {
        setUserName(data.name || '');
        setUserPin(data.pin != null ? String(data.pin) : '');
      } else {
        showToast('error', data?.error || 'Failed to load user details');
      }
    } catch {
      showToast('error', 'Failed to load user details');
    }
    setShowUserModal(true);
  };

  const closeUserModal = () => {
    setShowUserModal(false);
    setEditingUserId(null);
    setUserName('');
    setUserPin('');
    setUserModalTab('general');
    setUserAvatarColorIndex(0);
    setUserModalActiveField(null);
    setUserPrivileges({ ...DEFAULT_USER_PRIVILEGES });
  };

  const userModalKeyboardValue = userModalActiveField === 'name' ? userName : userModalActiveField === 'pincode' ? userPin : '';
  const userModalKeyboardOnChange = (v) => {
    if (userModalActiveField === 'name') setUserName(v);
    else if (userModalActiveField === 'pincode') setUserPin(v);
  };

  const handleSaveUser = async () => {
    setSavingUser(true);
    try {
      if (editingUserId) {
        const body = { name: userName.trim() || 'New user' };
        if (userPin !== '') body.pin = userPin;
        const res = await fetch(`${API}/users/${editingUserId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        const updated = await res.json();
        if (res.ok && updated) {
          setUsers((prev) => prev.map((u) => (u.id === editingUserId ? { ...u, ...updated } : u)));
          closeUserModal();
        }
      } else {
        const res = await fetch(`${API}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: userName.trim() || 'New user', pin: userPin || '1234' })
        });
        const created = await res.json();
        if (res.ok && created) {
          setUsers((prev) => [...prev, created].sort((a, b) => (a.name || '').localeCompare(b.name || '')));
          closeUserModal();
        }
      }
    } finally {
      setSavingUser(false);
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      const res = await fetch(`${API}/users/${id}`, { method: 'DELETE' });
      if (res.ok) setUsers((prev) => prev.filter((u) => u.id !== id));
      else fetchUsers();
    } catch {
      fetchUsers();
    }
    setDeleteConfirmUserId(null);
  };

  useEffect(() => {
    if (topNavId !== 'categories-products' || subNavId !== 'Discounts') return;
    try {
      const raw = typeof localStorage !== 'undefined' && localStorage.getItem('pos_discounts');
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) setDiscounts(list);
      }
    } catch (_) { }
  }, [topNavId, subNavId]);

  const openNewDiscountModal = () => {
    setEditingDiscountId(null);
    setDiscountName('');
    setDiscountTrigger('number');
    setDiscountType('amount');
    setDiscountValue('');
    const today = new Date().toISOString().slice(0, 10);
    setDiscountStartDate(today);
    setDiscountEndDate(today);
    setDiscountOn('products');
    setDiscountPieces('');
    setDiscountCombinable(false);
    setDiscountKeyboardValue('');
    setShowDiscountModal(true);
  };

  const openEditDiscountModal = (d) => {
    setEditingDiscountId(d.id);
    setDiscountName(d.name || '');
    setDiscountTrigger(d.trigger || 'number');
    setDiscountType(d.type || 'amount');
    setDiscountValue(String(d.value ?? ''));
    setDiscountStartDate(d.startDate || '');
    setDiscountEndDate(d.endDate || '');
    setDiscountOn(d.discountOn || 'products');
    setDiscountPieces(String(d.pieces ?? ''));
    setDiscountCombinable(!!d.combinable);
    setDiscountKeyboardValue('');
    setShowDiscountModal(true);
  };

  const closeDiscountModal = () => {
    setShowDiscountModal(false);
    setEditingDiscountId(null);
    setDiscountName('');
    setDiscountKeyboardValue('');
    setDiscountCalendarField(null);
  };

  const persistDiscounts = (list) => {
    setDiscounts(list);
    if (typeof localStorage !== 'undefined') localStorage.setItem('pos_discounts', JSON.stringify(list));
  };

  const handleSaveDiscount = () => {
    setSavingDiscount(true);
    try {
      const payload = {
        id: editingDiscountId || `d-${Date.now()}`,
        name: discountName.trim() || 'New discount',
        trigger: discountTrigger,
        type: discountType,
        value: discountValue.trim(),
        startDate: discountStartDate,
        endDate: discountEndDate,
        discountOn,
        pieces: discountPieces.trim(),
        combinable: discountCombinable
      };
      if (editingDiscountId) {
        const next = discounts.map((d) => (d.id === editingDiscountId ? payload : d));
        persistDiscounts(next);
      } else {
        persistDiscounts([...discounts, payload]);
      }
      closeDiscountModal();
    } finally {
      setSavingDiscount(false);
    }
  };

  const handleDeleteDiscount = (id) => {
    persistDiscounts(discounts.filter((d) => d.id !== id));
    setDeleteConfirmDiscountId(null);
  };

  useEffect(() => {
    if (topNavId !== 'categories-products' || subNavId !== 'Kitchen messages') return;
    try {
      const raw = typeof localStorage !== 'undefined' && localStorage.getItem('pos_kitchen_messages');
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) setKitchenMessages(list);
      }
    } catch (_) { }
  }, [topNavId, subNavId]);

  const openNewKitchenMessageModal = () => {
    setEditingKitchenMessageId(null);
    setKitchenMessageName('');
    setShowKitchenMessageModal(true);
  };

  const openEditKitchenMessageModal = (m) => {
    setEditingKitchenMessageId(m.id);
    setKitchenMessageName(m.name || '');
    setShowKitchenMessageModal(true);
  };

  const closeKitchenMessageModal = () => {
    setShowKitchenMessageModal(false);
    setEditingKitchenMessageId(null);
    setKitchenMessageName('');
  };

  const persistKitchenMessages = (list) => {
    setKitchenMessages(list);
    if (typeof localStorage !== 'undefined') localStorage.setItem('pos_kitchen_messages', JSON.stringify(list));
  };

  const handleSaveKitchenMessage = () => {
    setSavingKitchenMessage(true);
    try {
      const name = kitchenMessageName.trim() || 'New message';
      if (editingKitchenMessageId) {
        const next = kitchenMessages.map((m) => (m.id === editingKitchenMessageId ? { ...m, name } : m));
        persistKitchenMessages(next);
      } else {
        persistKitchenMessages([...kitchenMessages, { id: `km-${Date.now()}`, name }]);
      }
      closeKitchenMessageModal();
    } finally {
      setSavingKitchenMessage(false);
    }
  };

  const handleDeleteKitchenMessage = (id) => {
    persistKitchenMessages(kitchenMessages.filter((m) => m.id !== id));
    setDeleteConfirmKitchenMessageId(null);
  };

  return (
    <div className="flex h-full bg-pos-bg text-pos-text">
      {/* Control left sidebar */}
      <aside className="w-[330px] shrink-0 flex flex-col bg-pos-panel border-r border-pos-border">
        <nav className="flex flex-col gap-0.5 flex-1 p-3">
          {CONTROL_SIDEBAR_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`flex items-center gap-3 px-5 py-5 rounded-lg text-left text-3xl transition-colors ${controlSidebarId === item.id
                ? 'bg-pos-bg text-pos-text font-medium'
                : 'text-pos-muted hover:bg-pos-bg/50 hover:text-pos-text'
                }`}
              onClick={() => setControlSidebarId(item.id)}
            >
              <SidebarIcon id={item.icon} className="w-8 h-8 shrink-0" />
              {tr(`control.sidebar.${item.id}`, item.label)}
            </button>
          ))}
        </nav>
        <div className="p-4 w-full flex flex-col items-center space-y-5">
          {currentUser && (
            <p className="text-pos-text text-3xl font-medium truncate px-1">{currentUser.label}</p>
          )}
          <div className="flex flex-col gap-1">
            <button
              type="button"
              className="px-3 py-2 rounded-lg text-pos-muted hover:text-pos-text hover:bg-pos-bg/50 text-3xl"
              onClick={() => onBack?.()}
            >
              {tr('backName', 'Back')}
            </button>
            <button
              type="button"
              className="px-3 py-2 rounded-lg text-pos-muted hover:text-pos-text hover:bg-pos-bg/50 text-3xl"
              onClick={() => setShowLogoutModal(true)}
            >
              {tr('logOut', 'Log out')}
            </button>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Top navigation - Personalize only */}
        {controlSidebarId === 'personalize' && (
          <div className="flex items-center gap-1 p-4 px-10 justify-around w-full bg-pos-bg/50">
            {TOP_NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`flex items-center gap-2 px-5 py-3 rounded-lg text-3xl transition-colors ${topNavId === item.id
                  ? 'bg-pos-panel text-pos-text font-medium border border-pos-border'
                  : 'text-pos-muted hover:text-pos-text hover:bg-pos-panel/50 border border-transparent'
                  }`}
                onClick={() => {
                  setTopNavId(item.id);
                  if (item.id === 'categories-products') setSubNavId('Price Groups');
                  if (item.id === 'cash-register') setSubNavId('Template Settings');
                  if (item.id === 'external-devices') setSubNavId('Printer');
                }}
              >
                <TopNavIcon id={item.icon} className="w-8 h-8 shrink-0" />
                {tr(`control.topNav.${item.id}`, item.label)}
              </button>
            ))}
          </div>
        )}

        {/* Reports tabs - when Reports sidebar selected */}
        {controlSidebarId === 'reports' && (
          <div className="flex items-center gap-1 p-4 px-10 justify-around w-full bg-pos-bg/50">
            {REPORT_TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`flex items-center gap-2 px-5 py-3 rounded-lg text-3xl transition-colors ${reportTabId === item.id
                  ? 'bg-pos-panel text-pos-text font-medium border border-pos-border'
                  : 'text-pos-muted hover:text-pos-text hover:bg-pos-panel/50 border border-transparent'
                  }`}
                onClick={() => setReportTabId(item.id)}
              >
                <ReportTabIcon id={item.icon} className="w-8 h-8 shrink-0" />
                {tr(`control.reportTabs.${item.id}`, item.label)}
              </button>
            ))}
          </div>
        )}

        {/* Sub-navigation - Categories and products */}
        {controlSidebarId === 'personalize' && topNavId === 'categories-products' && (
          <div className="flex items-center w-full justify-around gap-1 px-4 py-3 bg-pos-bg">
            {SUB_NAV_ITEMS.map((label) => (
              <button
                key={label}
                type="button"
                className={`px-4 py-2 rounded-lg text-xl transition-colors ${subNavId === label
                  ? 'bg-pos-panel text-pos-text font-medium'
                  : 'text-pos-muted hover:text-pos-text hover:bg-pos-panel/50'
                  }`}
                onClick={() => setSubNavId(label)}
              >
                {tr(`control.subNav.${label}`, label)}
              </button>
            ))}
          </div>
        )}

        {/* Sub-navigation - Cash Register Settings */}
        {controlSidebarId === 'personalize' && topNavId === 'cash-register' && (
          <div className="flex items-center w-full justify-around gap-1 px-4 py-3 bg-pos-bg">
            {CASH_REGISTER_SUB_NAV_ITEMS.map((label) => (
              <button
                key={label}
                type="button"
                className={`px-4 py-2 rounded-lg text-xl transition-colors ${subNavId === label
                  ? 'bg-pos-panel text-pos-text font-medium'
                  : 'text-pos-muted hover:text-pos-text hover:bg-pos-panel/50'
                  }`}
                onClick={() => {
                  setSubNavId(label);
                  if (label === 'Device Settings') setShowDeviceSettingsModal(true);
                  if (label === 'System Settings') setShowSystemSettingsModal(true);
                  if (label === 'Production messages') setShowProductionMessagesModal(true);
                }}
              >
                {tr(`control.subNav.${label}`, label)}
              </button>
            ))}
          </div>
        )}

        {/* Sub-navigation - External Devices */}
        {controlSidebarId === 'personalize' && topNavId === 'external-devices' && (
          <div className="flex items-center w-full justify-around gap-1 px-4 py-3 bg-pos-bg">
            {EXTERNAL_DEVICES_SUB_NAV_ITEMS.map((label) => (
              <button
                key={label}
                type="button"
                className={`px-4 py-2 rounded-lg text-xl transition-colors ${subNavId === label
                  ? 'bg-pos-panel text-pos-text font-medium'
                  : 'text-pos-muted hover:text-pos-text hover:bg-pos-panel/50'
                  }`}
                onClick={() => setSubNavId(label)}
              >
                {tr(`control.subNav.${label}`, label)}
              </button>
            ))}
          </div>
        )}

        {/* Content area */}
        <main className="flex-1 overflow-hidden p-6">
          {controlSidebarId === 'reports' ? (
            <div className="flex flex-col h-full gap-4">
              {reportTabId === 'financial' && (
                <div className="flex gap-6 flex-col min-h-0 flex-1 w-full">
                  <div className="shrink-0 flex justify-around gap-4 h-[70px] w-full items-center">
                    <span className="text-pos-text text-3xl font-medium">Z</span>
                    <span className="text-pos-text text-3xl font-medium">X</span>
                    <button type="button" className="text-pos-text hover:underline text-3xl">History</button>
                  </div>
                  <div className="relative grid grid-cols-2 flex-1 px-20 min-h-0 gap-10">
                    <div className="flex flex-col min-h-0 gap-5">
                      <div id="financial-report-pospoint-scroll" className="flex-1 overflow-auto rounded-xl border border-pos-border bg-white text-gray-800 p-6 min-h-[400px]">
                        <div className="text-sm font-mono space-y-1 whitespace-pre-wrap text-center">
                          <div className="text-xl font-medium mb-2">pospoint demo</div>
                          <div className="mb-2">BE.0.0.0</div>
                          <div className="flex justify-between border-b border-dotted border-gray-400 pb-1 mb-2">
                            <span>Date : {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')}</span>
                            <span>Tijd: {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</span>
                          </div>
                          <div className="border-b border-dotted border-gray-400 pb-2 mb-4 font-semibold text-lg">Z FINANCIEEL #2</div>
                          <div className="text-left space-y-1">
                            <div className="font-medium">Terminals:</div>
                            <div>Kassa 2 — 16/01-08:26 =&gt; 25/01-11:04</div>
                            <div>Kassa 4 — 13/01-19:07 =&gt; 25/02-14:27</div>
                            <div className="mt-4 font-medium">BTW per tarief</div>
                            <table className="w-full border-collapse text-sm mt-1 text-left">
                              <thead>
                                <tr className="border-b border-gray-300">
                                  <th className="py-1">MvH NS</th>
                                  <th className="py-1">MvH NR</th>
                                  <th className="py-1">Btw</th>
                                  <th className="py-1">Totaal</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="border-b border-gray-200">
                                  <td className="py-1">333.73</td>
                                  <td className="py-1">2.83</td>
                                  <td className="py-1">19.85</td>
                                  <td className="py-1">350.75</td>
                                </tr>
                                <tr className="font-medium">
                                  <td className="py-1">Totaal</td>
                                  <td className="py-1">333.73</td>
                                  <td className="py-1">2.83</td>
                                  <td className="py-1">350.75</td>
                                </tr>
                              </tbody>
                            </table>
                            <div className="mt-4 font-medium">Betalingen</div>
                            <div>Cash — 174.75</div>
                            <div>Credit Card — 117.00</div>
                            <div>Visa — 59.00</div>
                            <div className="font-medium">Totaal 350.75</div>
                            <div className="mt-4 font-medium">Eat-in / Take-out</div>
                            <div>10 Take-Out — 350.75</div>
                            <div className="font-medium">Totaal 350.75</div>
                            <div className="mt-4 font-medium">Ticket types</div>
                            <div>11 Counter Sales — 350.75</div>
                            <div className="font-medium">Total 350.75</div>
                            <div className="mt-4 font-medium">Issued VAT tickets:</div>
                            <div>NS: 10</div>
                            <div>NR: 1</div>
                            <div className="mt-2">Number of return tickets: 1</div>
                            <div>Drawer opened without sale: 0</div>
                            <div>Pro Forma tickets: 7</div>
                            <div>Pro Forma returns: 0</div>
                            <div>Pro Forma turnover (incl. VAT): 126.20</div>
                            <div>Gift vouchers sold: 0</div>
                            <div>Value of gift vouchers sold: 0.00</div>
                            <div>Applied discounts: 0</div>
                            <div>Total discount amount (incl. VAT): 0.00</div>
                            <div>Total cash rounding amount: 0.00</div>
                            <div>Credit top-up: 0.00</div>
                            <div>Staff consumption: 0.00</div>
                            <div>Online payment cash refunded: 0.00</div>
                            <div>Number of online orders: 0.00</div>
                            <div>Database ID: 2</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between px-2 py-3 shrink-0">
                        <div className="flex-1" />
                        <PaginationArrows
                          canPrev={true}
                          canNext={true}
                          onPrev={() => {
                            const el = document.getElementById('financial-report-pospoint-scroll');
                            if (el) el.scrollBy({ top: -200, behavior: 'smooth' });
                          }}
                          onNext={() => {
                            const el = document.getElementById('financial-report-pospoint-scroll');
                            if (el) el.scrollBy({ top: 200, behavior: 'smooth' });
                          }}
                          className="relative py-0"
                        />
                        <div className="flex-1" />
                      </div>
                    </div>
                    <div className="flex flex-col h-full gap-4 shrink-0 justify-center items-center">
                      <div className="flex items-center gap-10 w-full justify-center">
                        <label className="text-pos-text text-xl shrink-0">Create to :</label>
                        <Dropdown options={REPORT_GENERATE_UNTIL_OPTIONS} value={reportGenerateUntil} onChange={setReportGenerateUntil} placeholder="Current time" className="text-xl min-w-[240px] max-w-[240px]" />
                      </div>
                      <button type="button" className="flex mt-10 items-center gap-2 px-4 py-3 rounded-lg bg-pos-panel border border-pos-border text-pos-text hover:bg-pos-bg text-xl justify-center w-[150px]">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                        Print
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {reportTabId === 'user' && (

                <div className="flex gap-6 flex-col min-h-[940px] max-h-[940px] w-full">
                  <div className="shrink-0 flex justify-around gap-4 h-[70px] w-full items-center">
                    <span className="text-pos-text text-3xl font-medium">Z</span>
                    <span className="text-pos-text text-3xl font-medium">X</span>
                  </div>
                  <div className="relative grid grid-cols-2 h-full gap-10">
                    <div className='flex flex-col h-full gap-5'>
                      <div className="flex-1 overflow-auto rounded-xl border border-pos-border bg-white text-gray-800 p-6 min-h-[400px]">
                        <div className="">

                        </div>

                      </div>
                      <div className="flex items-center justify-between px-2 py-3">
                        <div className="flex-1" />
                        <PaginationArrows canPrev={true} canNext={true} onPrev={() => { }} onNext={() => { }} className="relative py-0" />
                        <div className="flex-1" />
                      </div>

                    </div>
                    <div className='flex justify-center items-center'>
                      <button type="button" className="flex items-center h-[60px] w-[150px] gap-2 px-4 py-3 rounded-lg bg-pos-panel border border-pos-border text-pos-text hover:bg-pos-bg text-xl">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                        Print
                      </button>
                    </div>
                  </div>


                </div>
              )}
              {reportTabId === 'periodic' && (
                <div className="flex flex-col gap-4 flex-1 min-h-0">
                  {/* Date and time row */}
                  <div className="flex flex-wrap items-center justify-around gap-4 shrink-0">
                    <Dropdown options={PERIODIC_REPORT_TIME_OPTIONS} value={periodicReportStartTime} onChange={setPeriodicReportStartTime} placeholder="00:00" className="text-xl min-w-[100px]" />
                    <input type="text" value={periodicReportStartDate} onChange={(e) => setPeriodicReportStartDate(e.target.value)} placeholder="dd-mm-yyyy" className="w-[140px] px-4 py-3 rounded-lg bg-pos-panel border border-pos-border text-pos-text text-xl" />
                    <span className="text-pos-text text-xl">to</span>
                    <Dropdown options={PERIODIC_REPORT_TIME_OPTIONS} value={periodicReportEndTime} onChange={setPeriodicReportEndTime} placeholder="24:00" className="text-xl min-w-[100px]" />
                    <input type="text" value={periodicReportEndDate} onChange={(e) => setPeriodicReportEndDate(e.target.value)} placeholder="dd-mm-yyyy" className="w-[140px] px-4 py-3 rounded-lg bg-pos-panel border border-pos-border text-pos-text text-xl" />
                    <button type="button" className="flex items-center gap-2 px-6 py-3 rounded-lg bg-pos-panel border border-pos-border text-pos-text hover:bg-pos-bg text-xl font-medium">
                      Make report
                    </button>
                  </div>
                  {/* Report area (left) + Info panel (right) */}
                  <div className="flex gap-6 flex-1 min-h-0">
                    <div className="relative flex-1 min-w-0 flex flex-col rounded-xl border border-pos-border bg-white min-h-[400px] overflow-hidden">
                      <div className="flex-1 overflow-auto p-6 text-gray-800 min-h-[300px]">
                        <p className="text-gray-500 text-lg">Select period and click &quot;Make report&quot; to generate the report.</p>
                      </div>
                      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50 shrink-0">
                        <div className="flex-1" />
                        <PaginationArrows canPrev={true} canNext={true} onPrev={() => { }} onNext={() => { }} className="relative py-0" />
                        <div className="flex-1 flex justify-end">
                          <button type="button" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-pos-panel border border-pos-border text-pos-text hover:bg-pos-bg text-xl">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                            Print
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 w-[320px] rounded-xl border border-pos-border bg-white p-6 text-gray-800 text-lg leading-relaxed">
                      <p className="font-medium text-gray-900 mb-2">In this new management system we work with 24:00 instead of 00:00 as the end point as in the web panel.</p>
                      <p className="mb-2">Example,</p>
                      <p className="mb-2">all turnover of 27-02-2026</p>
                      <p className="font-medium mt-3 mb-1">Earlier:</p>
                      <p className="mb-2">00:00 27-02-2026 to 00:00 28-02-2026</p>
                      <p className="font-medium mt-3 mb-1">Not:</p>
                      <p>00:00 27-02-2026 tot 24:00 27-02-2026</p>
                    </div>
                  </div>
                </div>
              )}
              {reportTabId === 'settings' && (
                <div className="rounded-xl border border-pos-border bg-pos-panel/30 p-8 min-h-[940px]">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="border-b border-pos-border">
                          <th className="text-pos-text text-xl font-medium py-3 pr-8"></th>
                          <th className="text-pos-text text-xl font-medium py-3 px-4 text-center w-24">Z</th>
                          <th className="text-pos-text text-xl font-medium py-3 px-4 text-center w-24">X</th>
                          <th className="text-pos-text text-xl font-medium py-3 px-4 text-center w-28">Periodic</th>
                        </tr>
                      </thead>
                      <tbody>
                        {REPORT_SETTINGS_ROWS.map((row) => (
                          <tr key={row.id} className="border-b border-pos-border/70">
                            <td className="text-pos-text text-xl py-3 pr-8">{row.label}</td>
                            <td className="py-3 px-4 text-center">
                              <input
                                type="checkbox"
                                checked={reportSettings[row.id]?.z ?? false}
                                onChange={(e) => setReportSetting(row.id, 'z', e.target.checked)}
                                className="w-10 h-10 rounded border-pos-border bg-pos-bg text-green-600 focus:ring-green-500"
                              />
                            </td>
                            <td className="py-3 px-4 text-center">
                              <input
                                type="checkbox"
                                checked={reportSettings[row.id]?.x ?? false}
                                onChange={(e) => setReportSetting(row.id, 'x', e.target.checked)}
                                className="w-10 h-10 rounded border-pos-border bg-pos-bg text-green-600 focus:ring-green-500"
                              />
                            </td>
                            <td className="py-3 px-4 text-center">
                              <input
                                type="checkbox"
                                checked={reportSettings[row.id]?.periodic ?? false}
                                onChange={(e) => setReportSetting(row.id, 'periodic', e.target.checked)}
                                className="w-10 h-10 rounded border-pos-border bg-pos-bg text-green-600 focus:ring-green-500"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-center mt-[150px]">
                    <button
                      type="button"
                      className="flex items-center gap-4 px-6 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 text-2xl"
                      disabled={savingReportSettings}
                      onClick={handleSaveReportSettings}
                    >
                      <svg fill="currentColor" width="24" height="24" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M-5.732,2.97-7.97.732a2.474,2.474,0,0,0-1.483-.7A.491.491,0,0,0-9.591,0H-18.5A2.5,2.5,0,0,0-21,2.5v11A2.5,2.5,0,0,0-18.5,16h11A2.5,2.5,0,0,0-5,13.5V4.737A2.483,2.483,0,0,0-5.732,2.97ZM-13,1V5.455h-3.591V1Zm-4.272,14V10.545h8.544V15ZM-6,13.5A1.5,1.5,0,0,1-7.5,15h-.228V10.045a.5.5,0,0,0-.5-.5h-9.544a.5.5,0,0,0-.5.5V15H-18.5A1.5,1.5,0,0,1-20,13.5V2.5A1.5,1.5,0,0,1-18.5,1h.909V5.955a.5.5,0,0,0,.5.5h7.5a.5.5,0,0,0,.5-.5v-4.8a1.492,1.492,0,0,1,.414.285l2.238,2.238A1.511,1.511,0,0,1-6,4.737Z" transform="translate(21)" /></svg>
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : controlSidebarId === 'users' ? (() => {
            const sortedUsers = [...users].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            const totalUsersPages = Math.max(1, Math.ceil(sortedUsers.length / USERS_PAGE_SIZE));
            const usersPageClamped = Math.min(usersPage, totalUsersPages - 1);
            const paginatedUsers = sortedUsers.slice(usersPageClamped * USERS_PAGE_SIZE, (usersPageClamped + 1) * USERS_PAGE_SIZE);
            const canPrevUsers = usersPageClamped > 0;
            const canNextUsers = usersPageClamped < totalUsersPages - 1;
            return (
              <div className="relative rounded-xl border border-pos-border bg-pos-panel/30 p-8 min-h-[1040px] pb-24">
                <div className="flex items-center justify-center mb-6">
                  <button
                    type="button"
                    className="px-6 py-3 rounded-lg text-xl font-medium bg-pos-panel border border-pos-border text-pos-text hover:bg-pos-bg hover:border-white/30 transition-colors"
                    onClick={openNewUserModal}
                  >
                    New user
                  </button>
                </div>
                {usersLoading ? (
                  <p className="text-pos-muted text-xl py-8 text-center">{tr('loginLoadingUsers', 'Loading users...')}</p>
                ) : users.length === 0 ? (
                  <p className="text-pos-muted text-xl py-8 text-center">{tr('control.users.empty', 'No users yet.')}</p>
                ) : (
                  <>
                    <ul className="w-full flex flex-col border border-pos-border rounded-xl overflow-hidden bg-pos-bg/50">
                      {paginatedUsers.map((u, idx) => (
                        <li
                          key={u.id}
                          className="flex items-center justify-between w-full px-6 py-4 border-b border-pos-border last:border-b-0 bg-pos-panel/30 hover:bg-pos-panel/50 transition-colors gap-4"
                        >
                          <div className='flex gap-5 items-center w-[400px]'>
                            <div
                              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl shrink-0"
                              style={{ backgroundColor: USER_AVATAR_COLORS[idx % USER_AVATAR_COLORS.length] }}
                            >
                              {(u.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <span className="text-pos-text text-xl font-medium block truncate">{u.name || '—'}</span>
                            </div>
                          </div>
                          <div className='flex items-center'>
                            <button
                              type="button"
                              className="p-2 rounded text-pos-text pr-20 hover:bg-pos-bg"
                              onClick={() => openEditUserModal(u)}
                              aria-label="Edit"
                            >
                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                            <button
                              type="button"
                              className="p-2 rounded text-pos-text hover:bg-pos-bg"
                              onClick={() => setDeleteConfirmUserId(u.id)}
                              aria-label="Delete"
                            >
                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <PaginationArrows
                      canPrev={canPrevUsers}
                      canNext={canNextUsers}
                      onPrev={() => setUsersPage((p) => Math.max(0, p - 1))}
                      onNext={() => setUsersPage((p) => Math.min(totalUsersPages - 1, p + 1))}
                    />
                  </>
                )}
              </div>
            );
          })() : controlSidebarId === 'language' ? (
            <div className="rounded-xl border border-pos-border bg-pos-panel/30 p-8 min-h-[700px]">
              <h2 className="text-pos-text text-2xl font-medium mb-6">{tr('control.languageTitle', 'Language')}</h2>
              <p className="text-pos-muted text-xl mb-8">{tr('control.languageDescription', 'Select the language for the application.')}</p>
              <div className="flex flex-wrap gap-4 w-full flex justify-center min-h-[200px] items-center">
                {LANGUAGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setAppLanguage(opt.value)}
                    className={`px-8 py-4 rounded-xl text-xl font-medium border-2 transition-colors ${appLanguage === opt.value
                      ? 'bg-pos-panel border-green-500 text-green-400'
                      : 'bg-pos-bg border-pos-border text-pos-text hover:border-pos-muted hover:bg-pos-panel/50'
                      }`}
                  >
                    {tr(`control.languageOption.${opt.value}`, opt.label)}
                  </button>
                ))}
              </div>
              <div className="mt-10 flex w-full justify-center">
                <button
                  type="button"
                  className="flex items-center gap-4 px-6 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 text-2xl"
                  disabled={savingAppLanguage || appLanguage === lang}
                  onClick={handleSaveAppLanguage}
                >
                  <svg fill="currentColor" width="24" height="24" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M-5.732,2.97-7.97.732a2.474,2.474,0,0,0-1.483-.7A.491.491,0,0,0-9.591,0H-18.5A2.5,2.5,0,0,0-21,2.5v11A2.5,2.5,0,0,0-18.5,16h11A2.5,2.5,0,0,0-5,13.5V4.737A2.483,2.483,0,0,0-5.732,2.97ZM-13,1V5.455h-3.591V1Zm-4.272,14V10.545h8.544V15ZM-6,13.5A1.5,1.5,0,0,1-7.5,15h-.228V10.045a.5.5,0,0,0-.5-.5h-9.544a.5.5,0,0,0-.5.5V15H-18.5A1.5,1.5,0,0,1-20,13.5V2.5A1.5,1.5,0,0,1-18.5,1h.909V5.955a.5.5,0,0,0,.5.5h7.5a.5.5,0,0,0,.5-.5v-4.8a1.492,1.492,0,0,1,.414.285l2.238,2.238A1.511,1.511,0,0,1-6,4.737Z" transform="translate(21)" /></svg>
                  {tr('control.save', 'Save')}
                </button>
              </div>
              <p className="text-pos-muted text-lg mt-8 text-center">{tr('control.currentLanguage', 'Current language')}: {tr(`control.languageOption.${appLanguage}`, LANGUAGE_OPTIONS.find((o) => o.value === appLanguage)?.label ?? 'English')}</p>
            </div>
          ) : topNavId === 'cash-register' ? (
            <div className="rounded-xl p-8 pb-0 min-h-[300px]">
              {subNavId === 'Template Settings' && (
                <div className="flex flex-col items-center justify-center min-h-[600px] gap-20">
                  <div className="flex gap-20">
                    <button
                      type="button"
                      onClick={() => setTemplateTheme('light')}
                      className={`px-12 py-12 rounded-xl text-xl font-medium transition-colors min-w-[180px] ${templateTheme === 'light'
                        ? 'bg-pos-panel border-2 border-green-500 text-green-400'
                        : 'bg-pos-bg border border-pos-border text-pos-muted hover:text-pos-text hover:border-pos-border'
                        }`}
                    >
                      Light
                    </button>
                    <button
                      type="button"
                      onClick={() => setTemplateTheme('dark')}
                      className={`px-12 py-6 rounded-xl text-xl font-medium transition-colors min-w-[180px] ${templateTheme === 'dark'
                        ? 'bg-gray-900 border-2 border-green-500 text-green-400'
                        : 'bg-[#1a1a1a] border border-pos-border text-pos-muted hover:text-pos-text'
                        }`}
                    >
                      Dark
                    </button>
                  </div>
                  <button
                    type="button"
                    disabled={savingTemplateSettings}
                    onClick={() => {
                      setSavingTemplateSettings(true);
                      try {
                        if (typeof localStorage !== 'undefined') localStorage.setItem('pos-template-theme', templateTheme);
                      } finally {
                        setSavingTemplateSettings(false);
                      }
                    }}
                    className="flex items-center gap-4 px-6 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 text-2xl"
                  >
                    <svg fill="#ffffff" width="24" height="24" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                      <path d="M-5.732,2.97-7.97.732a2.474,2.474,0,0,0-1.483-.7A.491.491,0,0,0-9.591,0H-18.5A2.5,2.5,0,0,0-21,2.5v11A2.5,2.5,0,0,0-18.5,16h11A2.5,2.5,0,0,0-5,13.5V4.737A2.483,2.483,0,0,0-5.732,2.97ZM-13,1V5.455h-3.591V1Zm-4.272,14V10.545h8.544V15ZM-6,13.5A1.5,1.5,0,0,1-7.5,15h-.228V10.045a.5.5,0,0,0-.5-.5h-9.544a.5.5,0,0,0-.5.5V15H-18.5A1.5,1.5,0,0,1-20,13.5V2.5A1.5,1.5,0,0,1-18.5,1h.909V5.955a.5.5,0,0,0,.5.5h7.5a.5.5,0,0,0,.5-.5v-4.8a1.492,1.492,0,0,1,.414.285l2.238,2.238A1.511,1.511,0,0,1-6,4.737Z" transform="translate(21)" />
                    </svg>
                    Save
                  </button>
                </div>
              )}
              {subNavId === 'Payment types' && (
                <div className="relative flex flex-col min-h-[300px] pb-24">
                  <div className="flex items-center justify-center mb-6">
                    <button
                      type="button"
                      className="px-6 py-3 rounded-lg text-xl font-medium bg-pos-panel border border-pos-border text-pos-text hover:bg-pos-bg hover:border-white/30 transition-colors"
                      onClick={openNewPaymentTypeModal}
                    >
                      New Payment Method
                    </button>
                  </div>
                  {(() => {
                    const sorted = [...paymentTypes].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
                    const total = sorted.length;
                    const totalPages = Math.max(1, Math.ceil(total / PAYMENT_TYPES_PAGE_SIZE1));
                    const page = Math.min(paymentTypesPage, totalPages - 1);
                    const start = page * PAYMENT_TYPES_PAGE_SIZE1;
                    const paginated = sorted.slice(start, start + PAYMENT_TYPES_PAGE_SIZE1);
                    const canPrev = page > 0;
                    const canNext = page < totalPages - 1;
                    return (
                      <>
                        <ul className="w-full flex relative flex-col border border-pos-border rounded-xl max-h-[680px] overflow-auto bg-pos-bg/50">
                          {paginated.map((pt) => (
                            <li
                              key={pt.id}
                              className="flex items-center w-full px-6 py-4 border-b border-pos-border last:border-b-0 bg-pos-panel/30 hover:bg-pos-panel/50 transition-colors"
                            >
                              <span className="flex-1 text-pos-text text-xl font-medium">{pt.name}</span>
                              <button
                                type="button"
                                className="p-2 rounded text-pos-text hover:bg-pos-bg hover:rounded-full"
                                aria-label={pt.active ? 'Deactivate' : 'Activate'}
                                onClick={() => togglePaymentTypeActive(pt.id)}
                              >
                                {pt.active ? (
                                  <span className={'w-8 h-8 inline-flex justify-center items-center text-green-500 text-2xl'}>{'\u2713'}</span>
                                ) : (
                                  <span className={'w-8 h-8 inline-block rounded-full border-2 border-pos-muted'} />
                                )}
                              </button>
                              <button
                                type="button"
                                className="p-2 rounded text-pos-text pl-20 hover:bg-pos-bg ml-2"
                                onClick={() => openEditPaymentTypeModal(pt)}
                                aria-label="Edit"
                              >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                              </button>
                            </li>
                          ))}
                        </ul>
                        <div className="fixed ml-[700px] mt-[850px]">
                          <PaginationArrows
                            canPrev={canPrev}
                            canNext={canNext}
                            onPrev={() => setPaymentTypesPage((p) => Math.max(0, p - 1))}
                            onNext={() => setPaymentTypesPage((p) => Math.min(totalPages - 1, p + 1))}
                          />
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          ) : topNavId === 'categories-products' && subNavId === 'Price Groups' ? (
            <div className="relative rounded-xl border border-pos-border bg-pos-panel/30 p-8 min-h-[880px] pb-24">
              <div className="flex items-center w-full justify-center mb-6">
                <button
                  type="button"
                  className="px-6 py-3 rounded-lg text-xl font-medium bg-pos-panel border border-pos-border text-pos-text hover:bg-pos-bg hover:border-white/30 transition-colors disabled:opacity-50"
                  disabled={priceGroupsLoading}
                  onClick={openPriceGroupModal}
                >
                  {tr('control.priceGroups.new', 'New price group')}
                </button>
              </div>
              {(() => {
                if (priceGroupsLoading) {
                  return <ul className="w-full flex flex-col"><li className="text-pos-muted text-xl py-4">{tr('control.priceGroups.loading', 'Loading price groups...')}</li></ul>;
                }
                if (priceGroups.length === 0) {
                  return <ul className="w-full flex flex-col"><li className="text-pos-muted text-3xl py-4">{tr('control.priceGroups.empty', 'No price groups yet.')}</li></ul>;
                }
                const total = priceGroups.length;
                const totalPages = Math.max(1, Math.ceil(total / PRICE_GROUPS_PAGE_SIZE));
                const page = Math.min(priceGroupsPage, totalPages - 1);
                const start = page * PRICE_GROUPS_PAGE_SIZE;
                const paginated = priceGroups.slice(start, start + PRICE_GROUPS_PAGE_SIZE);
                const canPrev = page > 0;
                const canNext = page < totalPages - 1;
                return (
                  <>
                    <ul className="w-full flex flex-col">
                      {paginated.map((pg) => (
                        <li
                          key={pg.id}
                          className="flex items-center w-full justify-between px-4 py-3 bg-pos-bg border-y border-pos-panel text-pos-text text-xl"
                        >
                          <span className="font-medium">{pg.name}</span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              className="p-2 rounded text-pos-text mr-20 hover:bg-pos-panel"
                              onClick={() => openEditPriceGroupModal(pg)}
                              aria-label="Edit"
                            >
                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                            <button
                              type="button"
                              className="p-2 rounded text-pos-text hover:bg-pos-panel"
                              onClick={() => setDeleteConfirmId(pg.id)}
                              aria-label="Delete"
                            >
                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <PaginationArrows
                      canPrev={canPrev}
                      canNext={canNext}
                      onPrev={() => setPriceGroupsPage((p) => Math.max(0, p - 1))}
                      onNext={() => setPriceGroupsPage((p) => Math.min(totalPages - 1, p + 1))}
                    />
                  </>
                );
              })()}
            </div>
          ) : topNavId === 'categories-products' && subNavId === 'Categories' ? (() => {
            const CATEGORIES_PER_PAGE = 11;
            const sortedCategories = [...categories].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
            const totalCategoriesPages = Math.max(1, Math.ceil(sortedCategories.length / CATEGORIES_PER_PAGE));
            const page = Math.min(categoriesPage, totalCategoriesPages - 1);
            const paginatedCategories = sortedCategories.slice(page * CATEGORIES_PER_PAGE, (page + 1) * CATEGORIES_PER_PAGE);
            const canPrev = page > 0;
            const canNext = page < totalCategoriesPages - 1;
            return (
              <div className="relative rounded-xl border border-pos-border bg-pos-panel/30 p-8 min-h-[880px] pb-24">
                <div className="flex items-center w-full justify-center mb-6">
                  <button
                    type="button"
                    className="px-6 py-3 rounded-lg text-xl font-medium bg-pos-panel border border-pos-border text-pos-text hover:bg-pos-bg hover:border-white/30 transition-colors disabled:opacity-50"
                    disabled={categoriesLoading}
                    onClick={openCategoryModal}
                  >
                    {tr('control.categories.new', 'New category')}
                  </button>
                </div>
                <ul className="w-full flex flex-col justify-center items-center">
                  {categoriesLoading ? (
                    <li className="text-pos-muted text-xl py-4">{tr('control.categories.loading', 'Loading categories...')}</li>
                  ) : sortedCategories.length === 0 ? (
                    <li className="text-pos-muted text-3xl py-4">{tr('control.categories.empty', 'No categories yet.')}</li>
                  ) : (
                    paginatedCategories.map((cat, index) => {
                      const globalIndex = page * CATEGORIES_PER_PAGE + index;
                      return (
                        <li
                          key={cat.id}
                          className="flex items-center w-full justify-between px-4 py-3 bg-pos-bg border-b border-pos-border text-pos-text text-xl"
                        >
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              className="p-2 rounded text-pos-text hover:bg-pos-panel disabled:opacity-30 disabled:cursor-not-allowed"
                              onClick={() => handleMoveCategory(cat.id, 'down')}
                              disabled={globalIndex >= sortedCategories.length - 1}
                              aria-label="Move down"
                            >
                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                            </button>
                            <button
                              type="button"
                              className="p-2 ml-10 rounded text-pos-text hover:bg-pos-panel disabled:opacity-30 disabled:cursor-not-allowed"
                              onClick={() => handleMoveCategory(cat.id, 'up')}
                              disabled={globalIndex <= 0}
                              aria-label="Move up"
                            >
                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v14" /></svg>
                            </button>
                          </div>
                          <span className="flex-1 text-center font-medium">{cat.name}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              className="p-2 mr-20 rounded text-pos-text hover:bg-pos-panel"
                              onClick={() => openEditCategoryModal(cat)}
                              aria-label="Edit"
                            >
                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                            <button
                              type="button"
                              className="p-2 rounded text-pos-text hover:bg-pos-panel"
                              onClick={() => setDeleteConfirmCategoryId(cat.id)}
                              aria-label="Delete"
                            >
                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </li>
                      );
                    })
                  )}
                </ul>
                {sortedCategories.length > 0 && (
                  <div className='fixed z-50 top-[97%] ml-[750px]'>
                    <PaginationArrows
                      canPrev={canPrev}
                      canNext={canNext}
                      onPrev={() => setCategoriesPage((p) => Math.max(0, p - 1))}
                      onNext={() => setCategoriesPage((p) => Math.min(totalCategoriesPages - 1, p + 1))}
                    />
                  </div>
                )}
              </div>
            );
          })() : topNavId === 'categories-products' && subNavId === 'Products' ? (() => {
            const PRODUCTS_PER_PAGE = 10;
            const totalProductsPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
            const productsPageClamped = Math.min(productsPage, totalProductsPages - 1);
            const paginatedProducts = filteredProducts.slice(productsPageClamped * PRODUCTS_PER_PAGE, (productsPageClamped + 1) * PRODUCTS_PER_PAGE);
            const canPrevProducts = productsPageClamped > 0;
            const canNextProducts = productsPageClamped < totalProductsPages - 1;
            return (
              <div className="relative rounded-xl border border-pos-border bg-pos-panel/30 p-8 min-h-[880px] flex flex-col pb-24">
                {/* Action bar: New Product, Positioning, Search (right-aligned like reference) */}
                <div className="flex items-center w-full justify-around gap-4 mb-4 flex-wrap">
                  <button
                    type="button"
                    disabled={!selectedCategoryId || productsLoading}
                    onClick={openProductModal}
                    className="px-6 py-3 rounded-lg text-xl font-medium bg-pos-panel border border-pos-border text-pos-text hover:bg-pos-bg hover:border-white/30 transition-colors disabled:opacity-50"
                  >
                    {tr('control.products.new', 'New Product')}
                  </button>
                  <button
                    type="button"
                    onClick={openProductPositioningModal}
                    className="px-6 py-3 rounded-lg text-xl font-medium bg-pos-panel border border-pos-border text-pos-text hover:bg-pos-bg hover:border-white/30 transition-colors disabled:opacity-50"
                  >
                    {tr('control.products.positioning', 'Positioning')}
                  </button>
                  <input
                    type="text"
                    readOnly
                    value={productSearch}
                    placeholder={tr('control.products.searchPlaceholder', 'Search products')}
                    onClick={() => setShowProductSearchKeyboard(true)}
                    onFocus={() => setShowProductSearchKeyboard(true)}
                    className="px-4 py-2 rounded-lg bg-pos-bg border border-pos-border text-pos-text text-xl min-w-[200px] placeholder:text-pos-muted cursor-pointer"
                  />
                </div>
                {/* Category tabs: horizontal, scrollable, selected with underline */}
                {categories.length > 0 && (
                  <div className="flex items-center gap-2 mb-4 overflow-hidden">
                    <button
                      type="button"
                      className="p-2 rounded text-pos-text hover:bg-pos-bg shrink-0"
                      onClick={() => {
                        const el = document.getElementById('products-category-scroll');
                        if (el) el.scrollBy({ left: -200, behavior: 'smooth' });
                      }}
                      aria-label="Scroll left"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <div id="products-category-scroll" className="flex gap-4 overflow-x-auto flex-1 min-w-0 scrollbar-thin">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          className={`px-5 py-3 text-xl font-medium whitespace-nowrap shrink-0 transition-colors border-b-2 ${selectedCategoryId === cat.id
                            ? 'bg-pos-bg/80 text-pos-text border-green-500'
                            : 'text-pos-muted hover:text-pos-text bg-transparent border-transparent hover:bg-pos-panel/50'
                            }`}
                          onClick={() => { setSelectedCategoryId(cat.id); setSelectedProductId(null); }}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="p-2 rounded text-pos-text hover:bg-pos-bg shrink-0"
                      onClick={() => {
                        const el = document.getElementById('products-category-scroll');
                        if (el) el.scrollBy({ left: 200, behavior: 'smooth' });
                      }}
                      aria-label="Scroll right"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </div>
                )}
                {/* Product list: name (left), Subproducts (center), Edit/Delete (right) */}
                <div className="flex-1 overflow-auto border border-pos-border rounded-lg bg-pos-bg">
                  {!selectedCategoryId ? (
                    <p className="text-pos-muted text-xl p-6 text-center">{tr('control.products.selectCategoryHint', 'Select a category or add one in Categories.')}</p>
                  ) : productsLoading ? (
                    <p className="text-pos-muted text-xl p-6">{tr('control.products.loading', 'Loading products...')}</p>
                  ) : filteredProducts.length === 0 ? (
                    <p className="text-pos-muted text-xl p-6 text-center">{tr('control.products.emptyInCategory', 'No products in this category yet.')}</p>
                  ) : (
                    <ul className="w-full">
                      {paginatedProducts.map((product) => (
                        <li
                          key={product.id}
                          className={`flex items-center px-10 w-full py-3 border-b border-pos-border text-pos-text text-xl last:border-b-0 cursor-pointer ${selectedProductId === product.id ? 'bg-pos-panel/70' : 'bg-pos-bg hover:bg-pos-panel/40'}`}
                          onClick={(e) => { if (!e.target.closest('button')) setSelectedProductId(product.id); }}
                        >
                          <span className="min-w-[30%] text-left font-medium truncate" title={product.name}>
                            {product.name}
                          </span>
                          <span className="flex-shrink-0 min-w-[30%] text-center text-pos-muted text-xl">
                            <button
                              type="button"
                              className="px-3 py-1 rounded text-pos-muted hover:text-pos-text hover:bg-pos-panel"
                              onClick={(e) => {
                                e.stopPropagation();
                                openProductSubproductsModal(product);
                              }}
                            >
                              {tr('control.products.subproductsColumn', 'Subproducts')}
                            </button>
                          </span>
                          <div className="flex items-center justify-end min-w-[40%] gap-10 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              className="p-2 rounded text-pos-text hover:bg-pos-panel"
                              onClick={() => openEditProductModal(product)}
                              aria-label="Edit"
                            >
                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                            <button
                              type="button"
                              className="p-2 rounded text-pos-text hover:bg-pos-panel"
                              onClick={() => setDeleteConfirmProductId(product.id)}
                              aria-label="Delete"
                            >
                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {selectedCategoryId && filteredProducts.length > 0 && (
                  <PaginationArrows
                    canPrev={canPrevProducts}
                    canNext={canNextProducts}
                    onPrev={() => setProductsPage((p) => Math.max(0, p - 1))}
                    onNext={() => setProductsPage((p) => Math.min(totalProductsPages - 1, p + 1))}
                  />
                )}
              </div>
            );
          })() : topNavId === 'categories-products' && subNavId === 'Subproducts' ? (() => {
            const SUBPRODUCTS_PER_PAGE = 10;
            const totalSubproductsPages = Math.max(1, Math.ceil(subproducts.length / SUBPRODUCTS_PER_PAGE));
            const subPage = Math.min(subproductsPage, totalSubproductsPages - 1);
            const paginatedSubproducts = subproducts.slice(subPage * SUBPRODUCTS_PER_PAGE, (subPage + 1) * SUBPRODUCTS_PER_PAGE);
            const canPrevSub = subPage > 0;
            const canNextSub = subPage < totalSubproductsPages - 1;
            return (
              <div className="relative rounded-xl border border-pos-border bg-pos-panel/30 p-8 min-h-[880px] flex flex-col pb-24">
                <div className="flex items-center justify-around mb-4">
                  <button
                    type="button"
                    className="px-6 py-3 rounded-lg text-xl font-medium bg-pos-panel border border-pos-border text-pos-text hover:bg-pos-bg hover:border-white/30 transition-colors disabled:opacity-50"
                    disabled={subproductsLoading}
                    onClick={openSubproductModal}
                  >
                    {tr('control.subproducts.new', 'New subproduct')}
                  </button>
                  <button
                    type="button"
                    className="px-6 py-3 rounded-lg text-xl font-medium bg-pos-panel border border-pos-border text-pos-text hover:bg-pos-bg hover:border-white/30 transition-colors"
                    onClick={() => setShowManageGroupsModal(true)}
                  >
                    {tr('control.subproducts.manageGroups', 'Manage Groups')}
                  </button>
                </div>
                {subproductGroups.length > 0 && (
                  <div className="flex items-center gap-2 mb-4 overflow-hidden">
                    <button
                      type="button"
                      className="p-2 rounded bg-pos-bg border border-pos-border text-pos-text hover:bg-pos-panel shrink-0"
                      onClick={() => { const el = document.getElementById('subproducts-group-scroll'); if (el) el.scrollBy({ left: -200, behavior: 'smooth' }); }}
                      aria-label="Scroll left"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <div id="subproducts-group-scroll" className="flex gap-2 overflow-x-auto flex-1 min-w-0 py-2 px-1 rounded-lg">
                      {subproductGroups.map((grp) => (
                        <button
                          key={grp.id}
                          type="button"
                          className={`px-7 py-4 rounded-lg text-2xl font-medium whitespace-nowrap shrink-0 transition-colors ${selectedSubproductGroupId === grp.id ? 'bg-pos-panel text-pos-text border border-pos-border' : 'text-pos-muted hover:text-pos-text bg-pos-panel/50 border border-transparent'}`}
                          onClick={() => setSelectedSubproductGroupId(grp.id)}
                        >
                          {grp.name}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="p-2 rounded bg-pos-bg border border-pos-border text-pos-text hover:bg-pos-panel shrink-0"
                      onClick={() => { const el = document.getElementById('subproducts-group-scroll'); if (el) el.scrollBy({ left: 200, behavior: 'smooth' }); }}
                      aria-label="Scroll right"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </div>
                )}
                <div className="flex-1 overflow-auto border border-gray-400 rounded-lg min-h-[200px]">
                  {!selectedSubproductGroupId ? (
                    <p className="text-pos-muted text-xl p-6 text-center">{tr('control.subproducts.selectGroupHint', 'Select a group or add one via Manage Groups.')}</p>
                  ) : subproductGroupsLoading ? (
                    <p className="text-pos-muted text-xl p-6">{tr('control.subproducts.loadingGroups', 'Loading groups...')}</p>
                  ) : subproductsLoading ? (
                    <p className="text-pos-muted text-xl p-6">{tr('control.subproducts.loading', 'Loading subproducts...')}</p>
                  ) : subproducts.length === 0 ? (
                    <p className="text-pos-muted text-xl p-6 text-center">{tr('control.subproducts.empty', 'No subproducts in this group yet.')}</p>
                  ) : (
                    <ul className="w-full">
                      {paginatedSubproducts.map((sp) => (
                        <li
                          key={sp.id}
                          className={`flex items-center  w-full px-10 py-3 text-pos-text text-xl cursor-pointer ${selectedSubproductId === sp.id ? 'bg-pos-panel/70' : 'hover:bg-pos-panel/40'}`}
                          onClick={(e) => { if (!e.target.closest('button')) setSelectedSubproductId(sp.id); }}
                        >
                          <span className="flex-1 font-medium">{sp.name}</span>
                          <button type="button" className="p-2 pr-20 rounded text-pos-text hover:bg-pos-bg" onClick={(e) => { e.stopPropagation(); openEditSubproductModal(sp); }} aria-label="Edit">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                          <button type="button" className="p-2 rounded text-pos-text hover:bg-pos-bg" onClick={(e) => { e.stopPropagation(); setDeleteConfirmSubproductId(sp.id); }} aria-label="Delete">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {subproducts.length > 0 && (
                  <PaginationArrows
                    canPrev={canPrevSub}
                    canNext={canNextSub}
                    onPrev={() => setSubproductsPage((p) => Math.max(0, p - 1))}
                    onNext={() => setSubproductsPage((p) => Math.min(totalSubproductsPages - 1, p + 1))}
                  />
                )}
              </div>
            );
          })() : topNavId === 'categories-products' && subNavId === 'Kitchen messages' ? (() => {
            const KITCHEN_MESSAGES_PER_PAGE = 10;
            const totalKmPages = Math.max(1, Math.ceil(kitchenMessages.length / KITCHEN_MESSAGES_PER_PAGE));
            const kmPage = Math.min(kitchenMessagesPage, totalKmPages - 1);
            const paginatedKitchenMessages = kitchenMessages.slice(kmPage * KITCHEN_MESSAGES_PER_PAGE, (kmPage + 1) * KITCHEN_MESSAGES_PER_PAGE);
            const canPrevKm = kmPage > 0;
            const canNextKm = kmPage < totalKmPages - 1;
            return (
              <div className="relative rounded-xl border border-pos-border bg-pos-panel/30 p-8 min-h-[880px] pb-24">
                <div className="flex items-center justify-center mb-6">
                  <button
                    type="button"
                    className="px-6 py-3 rounded-lg text-xl font-medium bg-pos-panel border border-pos-border text-pos-text hover:bg-pos-bg hover:border-white/30 transition-colors"
                    onClick={openNewKitchenMessageModal}
                  >
                    New kitchen message
                  </button>
                </div>
                {kitchenMessages.length === 0 ? (
                  <p className="text-pos-muted text-xl py-14 text-center">{tr('control.kitchenMessages.empty', 'No kitchen messages yet.')}</p>
                ) : (
                  <>
                    <ul className="w-full flex flex-col border rounded-lg border-pos-border overflow-hidden bg-pos-bg/50">
                      {paginatedKitchenMessages.map((m) => (
                        <li
                          key={m.id}
                          className="flex items-center w-full px-20 py-4 border-b border-pos-border last:border-b-0 bg-pos-panel/30 hover:bg-pos-panel/50 transition-colors"
                        >
                          <span className="flex-1 text-pos-text text-xl font-medium">{m.name || '—'}</span>
                          <button
                            type="button"
                            className="p-2 rounded text-pos-text mr-10 hover:bg-pos-bg"
                            onClick={() => openEditKitchenMessageModal(m)}
                            aria-label="Edit"
                          >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                          <button
                            type="button"
                            className="p-2 rounded text-pos-text hover:bg-pos-bg"
                            onClick={() => setDeleteConfirmKitchenMessageId(m.id)}
                            aria-label="Delete"
                          >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                    <PaginationArrows
                      canPrev={canPrevKm}
                      canNext={canNextKm}
                      onPrev={() => setKitchenMessagesPage((p) => Math.max(0, p - 1))}
                      onNext={() => setKitchenMessagesPage((p) => Math.min(totalKmPages - 1, p + 1))}
                    />
                  </>
                )}
              </div>
            );
          })() : topNavId === 'categories-products' && subNavId === 'Discounts' ? (() => {
            const DISCOUNTS_PER_PAGE = 10;
            const totalDiscountsPages = Math.max(1, Math.ceil(discounts.length / DISCOUNTS_PER_PAGE));
            const discPage = Math.min(discountsPage, totalDiscountsPages - 1);
            const paginatedDiscounts = discounts.slice(discPage * DISCOUNTS_PER_PAGE, (discPage + 1) * DISCOUNTS_PER_PAGE);
            const canPrevDisc = discPage > 0;
            const canNextDisc = discPage < totalDiscountsPages - 1;
            return (
              <div className="relative rounded-xl border border-pos-border bg-pos-panel/30 p-8 min-h-[880px] pb-24">
                <div className="flex items-center justify-center mb-6">
                  <button
                    type="button"
                    className="px-6 py-3 rounded-lg text-xl font-medium bg-pos-panel border border-pos-border text-pos-text hover:bg-pos-bg hover:border-white/30 transition-colors"
                    onClick={openNewDiscountModal}
                  >
                    {tr('control.discounts.new', 'New discount')}
                  </button>
                </div>
                {discounts.length === 0 ? (
                  <p className="text-pos-muted text-xl py-8 text-center">{tr('control.discounts.empty', 'No discounts yet.')}</p>
                ) : (
                  <>
                    <ul className="w-full flex flex-col border border-pos-border rounded-xl overflow-hidden bg-pos-bg/50">
                      {paginatedDiscounts.map((d) => (
                        <li
                          key={d.id}
                          className="flex items-center w-full px-6 py-4 border-b border-pos-border last:border-b-0 bg-pos-panel/30 hover:bg-pos-panel/50 transition-colors"
                        >
                          <span className="flex-1 text-pos-text text-xl font-medium">{d.name || '—'}</span>
                          <button
                            type="button"
                            className="p-2 rounded pr-20 text-pos-text hover:bg-pos-bg"
                            onClick={() => openEditDiscountModal(d)}
                            aria-label="Edit"
                          >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                          <button
                            type="button"
                            className="p-2 rounded text-pos-text hover:bg-pos-bg"
                            onClick={() => setDeleteConfirmDiscountId(d.id)}
                            aria-label="Delete"
                          >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                    <PaginationArrows
                      canPrev={canPrevDisc}
                      canNext={canNextDisc}
                      onPrev={() => setDiscountsPage((p) => Math.max(0, p - 1))}
                      onNext={() => setDiscountsPage((p) => Math.min(totalDiscountsPages - 1, p + 1))}
                    />
                  </>
                )}
              </div>
            );
          })() : topNavId === 'categories-products' ? (
            <div className="rounded-xl border border-pos-border bg-pos-panel/30 p-8 min-h-[300px] flex items-center justify-center">
              <p className="text-pos-muted text-xl">
                Select a section above to manage {subNavId.toLowerCase()}.
              </p>
            </div>
          ) : topNavId === 'external-devices' ? (
            <div className="rounded-xl border border-pos-border bg-pos-panel/30 p-8 min-h-[820px]">
              {subNavId === 'Printer' && (
                <div className="flex flex-col min-h-[300px]">
                  <div className="flex justify-around mb-6 shrink-0">
                    {PRINTER_TABS.map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        className={`px-4 py-3 text-xl font-medium border-b-2 transition-colors ${printerTab === tab ? 'border-blue-500 text-pos-text' : 'border-transparent text-pos-muted hover:text-pos-text'}`}
                        onClick={() => setPrinterTab(tab)}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                  {printerTab === 'General' && (
                    <div className="relative flex flex-col min-h-[750px] pb-24">
                      <div className="flex items-center justify-center mb-6">
                        <button
                          type="button"
                          className="px-6 py-3 rounded-lg text-xl font-medium bg-pos-panel border border-pos-border text-pos-text hover:bg-pos-bg hover:border-white/30 transition-colors"
                          onClick={openNewPrinterModal}
                        >
                          Add printer
                        </button>
                      </div>
                      {(() => {
                        const sorted = [...printers].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
                        const total = sorted.length;
                        const totalPages = Math.max(1, Math.ceil(total / PRINTERS_PAGE_SIZE));
                        const page = Math.min(printersPage, totalPages - 1);
                        const start = page * PRINTERS_PAGE_SIZE;
                        const paginated = sorted.slice(start, start + PRINTERS_PAGE_SIZE);
                        const canPrev = page > 0;
                        const canNext = page < totalPages - 1;
                        return (
                          <>
                            <ul className="w-full flex flex-col border border-pos-border rounded-xl overflow-hidden bg-pos-bg/50 max-h-[680px] overflow-auto">
                              {paginated.map((p) => (
                                <li key={p.id} className="flex items-center w-full px-6 py-4 border-b border-pos-border last:border-b-0 bg-pos-panel/30 hover:bg-pos-panel/50 transition-colors">
                                  <button type="button" className="p-2 rounded text-pos-text hover:bg-pos-bg shrink-0" onClick={() => setDefaultPrinter(p.id)} aria-label={p.isDefault ? 'Default printer' : 'Set as default'}>
                                    {p.isDefault ? (
                                      <span className="w-8 h-8 inline-flex justify-center items-center text-green-500 text-2xl">{'\u2713'}</span>
                                    ) : (
                                      <span className="w-8 h-8 inline-block rounded-full border-2 border-pos-muted" />
                                    )}
                                  </button>
                                  <span className="flex-1 text-pos-text text-xl font-medium ml-2">{p.name}</span>
                                  <button type="button" className="p-2 rounded text-pos-text hover:bg-pos-bg" onClick={() => openEditPrinterModal(p)} aria-label="Edit">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                  </button>
                                  <button type="button" className="p-2 rounded text-pos-text hover:bg-pos-bg ml-2" onClick={() => setDeleteConfirmPrinterId(p.id)} aria-label="Delete">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                  </button>
                                </li>
                              ))}
                            </ul>
                            <div className='fixed z-50 top-[97%] ml-[750px]'>
                              <PaginationArrows
                                canPrev={canPrev}
                                canNext={canNext}
                                onPrev={() => setPrintersPage((p) => Math.max(0, p - 1))}
                                onNext={() => setPrintersPage((p) => Math.min(totalPages - 1, p + 1))}
                              />
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}
                  {printerTab === 'Final tickets' && (
                    <div className="flex flex-col min-h-[400px] max-h-[750px] items-center justify-between">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 mb-6">
                        <div className="flex flex-col gap-4">
                          <div className='flex items-start gap-2'>
                            <label className="block text-pos-text text-xl font-medium mb-1 min-w-[180px] max-w-[180px]">Company data:</label>
                            <div className='grid grid-cols-2 items-start gap-4'>
                              <input type="text" readOnly value={finalTicketsCompanyData1} className="px-4 flex py-3 bg-pos-panel border border-pos-border rounded-lg justify-start items-start text-pos-text text-xl" onClick={() => setFinalTicketsActiveField('companyData1')} />
                              {[2, 3, 4, 5].map((i) => (
                                <div key={i}>
                                  <input type="text" readOnly value={i === 2 ? finalTicketsCompanyData2 : i === 3 ? finalTicketsCompanyData3 : i === 4 ? finalTicketsCompanyData4 : finalTicketsCompanyData5} className="px-4 py-3 bg-pos-panel border border-pos-border rounded-lg text-pos-text text-xl" onClick={() => setFinalTicketsActiveField('companyData' + i)} placeholder="" />
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className='flex items-center gap-2'>
                            <label className="block text-pos-text text-xl font-medium mb-1 min-w-[180px] max-w-[180px]">Thank text:</label>
                            <input type="text" readOnly value={finalTicketsThankText} className="px-4 py-3 bg-pos-panel border border-pos-border rounded-lg text-pos-text text-xl" onClick={() => setFinalTicketsActiveField('thankText')} />
                          </div>
                        </div>
                        <div className="flex flex-col gap-4">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <span className="text-pos-text text-xl min-w-[250px] max-w-[250px]">Proforma ticket:</span>
                            <input type="checkbox" checked={finalTicketsProforma} onChange={(e) => setFinalTicketsProforma(e.target.checked)} className="w-10 h-10 rounded border-gray-400" />
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <span className="text-pos-text text-xl min-w-[250px] max-w-[250px]">Print payment type:</span>
                            <input type="checkbox" checked={finalTicketsPrintPaymentType} onChange={(e) => setFinalTicketsPrintPaymentType(e.target.checked)} className="w-10 h-10 rounded border-gray-400" />
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <span className="text-pos-text text-xl min-w-[250px] max-w-[250px]">Ticket tearable:</span>
                            <input type="checkbox" checked={finalTicketsTicketTearable} onChange={(e) => setFinalTicketsTicketTearable(e.target.checked)} className="w-10 h-10 rounded border-gray-400" />
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <span className="text-pos-text text-xl min-w-[250px] max-w-[250px]">Print logo:</span>
                            <input type="checkbox" checked={finalTicketsPrintLogo} onChange={(e) => setFinalTicketsPrintLogo(e.target.checked)} className="w-10 h-10 rounded border-gray-400" />
                          </label>
                          <div className="flex items-center gap-3">
                            <span className="text-pos-text text-xl min-w-[250px] max-w-[250px] shrink-0">Printing order of ticket:</span>
                            <Dropdown options={PRINTING_ORDER_OPTIONS} value={finalTicketsPrintingOrder} onChange={setFinalTicketsPrintingOrder} placeholder="Select" className="text-xl min-w-[200px]" />
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-center">
                        <button type="button" className="flex items-center gap-2 px-6 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 text-xl" disabled={savingFinalTickets} onClick={handleSaveFinalTickets}>
                          <svg fill="currentColor" width="24" height="24" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M-5.732,2.97-7.97.732a2.474,2.474,0,0,0-1.483-.7A.491.491,0,0,0-9.591,0H-18.5A2.5,2.5,0,0,0-21,2.5v11A2.5,2.5,0,0,0-18.5,16h11A2.5,2.5,0,0,0-5,13.5V4.737A2.483,2.483,0,0,0-5.732,2.97ZM-13,1V5.455h-3.591V1Zm-4.272,14V10.545h8.544V15ZM-6,13.5A1.5,1.5,0,0,1-7.5,15h-.228V10.045a.5.5,0,0,0-.5-.5h-9.544a.5.5,0,0,0-.5.5V15H-18.5A1.5,1.5,0,0,1-20,13.5V2.5A1.5,1.5,0,0,1-18.5,1h.909V5.955a.5.5,0,0,0,.5.5h7.5a.5.5,0,0,0,.5-.5v-4.8a1.492,1.492,0,0,1,.414.285l2.238,2.238A1.511,1.511,0,0,1-6,4.737Z" transform="translate(21)" /></svg>
                          Save
                        </button>
                      </div>
                      <div className="shrink-0 pt-4">
                        <KeyboardWithNumpad value={finalTicketsKeyboardValue} onChange={finalTicketsKeyboardOnChange} />
                      </div>
                    </div>
                  )}
                  {printerTab === 'Production Tickets' && (
                    <div className="flex flex-col min-h-[750px] max-h-[750px]">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 mb-6">
                        <div className="flex flex-col gap-6">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <span className="text-pos-text text-xl min-w-[360px] max-w-[360px]">Display categories on production ticket:</span>
                            <input type="checkbox" checked={prodTicketsDisplayCategories} onChange={(e) => setProdTicketsDisplayCategories(e.target.checked)} className="w-10 h-10 rounded border-gray-400" />
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <span className="text-pos-text text-xl min-w-[360px] max-w-[360px]">Space above ticket:</span>
                            <input type="checkbox" checked={prodTicketsSpaceAbove} onChange={(e) => setProdTicketsSpaceAbove(e.target.checked)} className="w-10 h-10 rounded border-gray-400" />
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <span className="text-pos-text text-xl min-w-[360px] max-w-[360px]">Ticket tearable:</span>
                            <input type="checkbox" checked={prodTicketsTicketTearable} onChange={(e) => setProdTicketsTicketTearable(e.target.checked)} className="w-10 h-10 rounded border-gray-400" />
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <span className="text-pos-text text-xl min-w-[360px] max-w-[360px]">Keukenprinter buzzer:</span>
                            <input type="checkbox" checked={prodTicketsKeukenprinterBuzzer} onChange={(e) => setProdTicketsKeukenprinterBuzzer(e.target.checked)} className="w-10 h-10 rounded border-gray-400" />
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <span className="text-pos-text text-xl min-w-[360px] max-w-[360px]">Producten individueel afdrukken:</span>
                            <input type="checkbox" checked={prodTicketsProductenIndividueel} onChange={(e) => setProdTicketsProductenIndividueel(e.target.checked)} className="w-10 h-10 rounded border-gray-400" />
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <span className="text-pos-text text-xl min-w-[360px] max-w-[360px]">Eat in / Take out onderaan afdrukken:</span>
                            <input type="checkbox" checked={prodTicketsEatInTakeOutOnderaan} onChange={(e) => setProdTicketsEatInTakeOutOnderaan(e.target.checked)} className="w-10 h-10 rounded border-gray-400" />
                          </label>
                        </div>
                        <div className="flex flex-col gap-6">
                          <div className="flex items-center gap-3">
                            <span className="text-pos-text text-xl shrink-0 min-w-[360px] max-w-[360px]">Next course printer 1:</span>
                            <Dropdown options={productionTicketsPrinterOptions} value={prodTicketsNextCoursePrinter1} onChange={setProdTicketsNextCoursePrinter1} placeholder="Disabled" className="text-xl min-w-[220px]" />
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-pos-text text-xl shrink-0 min-w-[360px] max-w-[360px]">Next course printer 2:</span>
                            <Dropdown options={productionTicketsPrinterOptions} value={prodTicketsNextCoursePrinter2} onChange={setProdTicketsNextCoursePrinter2} placeholder="Disabled" className="text-xl min-w-[220px]" />
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-pos-text text-xl shrink-0 min-w-[360px] max-w-[360px]">Next course printer 3:</span>
                            <Dropdown options={productionTicketsPrinterOptions} value={prodTicketsNextCoursePrinter3} onChange={setProdTicketsNextCoursePrinter3} placeholder="Disabled" className="text-xl min-w-[220px]" />
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-pos-text text-xl shrink-0 min-w-[360px] max-w-[360px]">Next course printer 4:</span>
                            <Dropdown options={productionTicketsPrinterOptions} value={prodTicketsNextCoursePrinter4} onChange={setProdTicketsNextCoursePrinter4} placeholder="Disabled" className="text-xl min-w-[220px]" />
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-pos-text text-xl shrink-0 min-w-[360px] max-w-[360px]">Printing order of production ticket:</span>
                            <Dropdown options={PRINTING_ORDER_OPTIONS} value={prodTicketsPrintingOrder} onChange={setProdTicketsPrintingOrder} placeholder="Select" className="text-xl min-w-[220px]" />
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-pos-text text-xl shrink-0 min-w-[360px] max-w-[360px]">Grouping receipt:</span>
                            <Dropdown options={GROUPING_RECEIPT_OPTIONS} value={prodTicketsGroupingReceipt} onChange={setProdTicketsGroupingReceipt} placeholder="Select" className="text-xl min-w-[220px]" />
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-pos-text text-xl shrink-0 min-w-[360px] max-w-[360px]">Transfer printer:</span>
                            <Dropdown options={productionTicketsPrinterOptions} value={prodTicketsPrinterOverboeken} onChange={setProdTicketsPrinterOverboeken} placeholder="Disabled" className="text-xl min-w-[220px]" />
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-center mt-[180px]">
                        <button type="button" className="flex items-center gap-4 px-6 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 text-2xl" disabled={savingProdTickets} onClick={handleSaveProductionTickets}>
                          <svg fill="currentColor" width="24" height="24" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M-5.732,2.97-7.97.732a2.474,2.474,0,0,0-1.483-.7A.491.491,0,0,0-9.591,0H-18.5A2.5,2.5,0,0,0-21,2.5v11A2.5,2.5,0,0,0-18.5,16h11A2.5,2.5,0,0,0-5,13.5V4.737A2.483,2.483,0,0,0-5.732,2.97ZM-13,1V5.455h-3.591V1Zm-4.272,14V10.545h8.544V15ZM-6,13.5A1.5,1.5,0,0,1-7.5,15h-.228V10.045a.5.5,0,0,0-.5-.5h-9.544a.5.5,0,0,0-.5.5V15H-18.5A1.5,1.5,0,0,1-20,13.5V2.5A1.5,1.5,0,0,1-18.5,1h.909V5.955a.5.5,0,0,0,.5.5h7.5a.5.5,0,0,0,.5-.5v-4.8a1.492,1.492,0,0,1,.414.285l2.238,2.238A1.511,1.511,0,0,1-6,4.737Z" transform="translate(21)" /></svg>
                          Save
                        </button>
                      </div>
                    </div>
                  )}
                  {printerTab === 'Labels' && (() => {
                    const LABELS_PER_PAGE = 8;
                    const sortedLabels = [...labelsList].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
                    const totalLabelsPages = Math.max(1, Math.ceil(sortedLabels.length / LABELS_PER_PAGE));
                    const page = Math.min(labelsListPage, totalLabelsPages - 1);
                    const paginatedLabels = sortedLabels.slice(page * LABELS_PER_PAGE, (page + 1) * LABELS_PER_PAGE);
                    const canPrev = page > 0;
                    const canNext = page < totalLabelsPages - 1;
                    return (
                      <div className="relative flex flex-col min-h-[750px] max-h-[750px] pb-24">
                        <div className="flex flex-wrap items-center justify-around w-full gap-4 mb-6">
                          <Dropdown options={LABELS_TYPE_OPTIONS} value={labelsType} onChange={(v) => saveLabelsSettings({ type: v })} placeholder="Select" className="text-xl min-w-[250px]" />
                          <Dropdown options={labelsPrinterOptions} value={labelsPrinter} onChange={(v) => saveLabelsSettings({ printer: v })} placeholder="Select printer" className="text-xl min-w-[250px]" />
                          <button type="button" className="px-6 py-3 rounded-lg text-xl font-medium bg-pos-panel border border-pos-border text-pos-text hover:bg-pos-bg hover:border-white/30 transition-colors" onClick={openNewLabelModal}>
                            New label
                          </button>
                        </div>
                        <ul className="w-full flex flex-col border-y border-gray-400 overflow-hidden bg-pos-panel">
                          {paginatedLabels.map((item) => (
                            <li key={item.id} className="flex items-center w-full px-6 py-4 border-b border-gray-400 last:border-b-0 bg-pos-panel/30">
                              <span className="flex-1 text-pos-text text-xl font-medium">{item.sizeLabel || item.name || ''}</span>
                              <button type="button" className="p-2 rounded text-pos-text hover:bg-pos-bg" onClick={() => openEditLabelModal(item)} aria-label="Edit">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                              </button>
                              <button type="button" className="p-2 rounded text-pos-text hover:bg-pos-bg ml-2" onClick={() => setDeleteConfirmLabelId(item.id)} aria-label="Delete">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </li>
                          ))}
                        </ul>
                        <div className='fixed z-50 top-[97%] ml-[750px]'>
                          <PaginationArrows
                            canPrev={canPrev}
                            canNext={canNext}
                            onPrev={() => setLabelsListPage((p) => Math.max(0, p - 1))}
                            onNext={() => setLabelsListPage((p) => Math.min(totalLabelsPages - 1, p + 1))}
                          />
                        </div>
                      </div>
                    );
                  })()}
                  {printerTab !== 'General' && printerTab !== 'Final tickets' && printerTab !== 'Production Tickets' && printerTab !== 'Labels' && (
                    <p className="text-pos-muted text-xl py-4">Settings for &quot;{printerTab}&quot; will be available here.</p>
                  )}
                </div>
              )}
              {subNavId === 'Price Display' && (
                <div className="flex flex-col min-h-[820px] justify-between items-center">
                  <div className="flex flex-col gap-6 mb-6 mt-[50px]">
                    <div className="flex items-center gap-10">
                      <label className="block text-pos-text text-xl font-medium shrink-0">Type:</label>
                      <Dropdown options={PRICE_DISPLAY_TYPE_OPTIONS} value={priceDisplayType} onChange={setPriceDisplayType} placeholder="Disabled" className="text-xl min-w-[220px]" />
                    </div>
                    <div className="flex justify-center mt-[100px]">
                      <button type="button" className="flex items-center gap-4 px-6 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 text-2xl" disabled={savingPriceDisplay} onClick={handleSavePriceDisplay}>
                        <svg fill="currentColor" width="24" height="24" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M-5.732,2.97-7.97.732a2.474,2.474,0,0,0-1.483-.7A.491.491,0,0,0-9.591,0H-18.5A2.5,2.5,0,0,0-21,2.5v11A2.5,2.5,0,0,0-18.5,16h11A2.5,2.5,0,0,0-5,13.5V4.737A2.483,2.483,0,0,0-5.732,2.97ZM-13,1V5.455h-3.591V1Zm-4.272,14V10.545h8.544V15ZM-6,13.5A1.5,1.5,0,0,1-7.5,15h-.228V10.045a.5.5,0,0,0-.5-.5h-9.544a.5.5,0,0,0-.5.5V15H-18.5A1.5,1.5,0,0,1-20,13.5V2.5A1.5,1.5,0,0,1-18.5,1h.909V5.955a.5.5,0,0,0,.5.5h7.5a.5.5,0,0,0,.5-.5v-4.8a1.492,1.492,0,0,1,.414.285l2.238,2.238A1.511,1.511,0,0,1-6,4.737Z" transform="translate(21)" /></svg>
                        Save
                      </button>
                    </div>
                  </div>
                  <div className="shrink-0 pt-4">
                    <KeyboardWithNumpad value={priceDisplayKeyboardValue} onChange={setPriceDisplayKeyboardValue} />
                  </div>
                </div>
              )}
              {subNavId === 'RFID Reader' && (
                <div className="flex flex-col min-h-[820px] justify-between items-center">
                  <div className="flex flex-col gap-6 mb-6 mt-[50px]">
                    <div className="flex items-center gap-10">
                      <label className="block text-pos-text text-xl font-medium shrink-0">Type:</label>
                      <Dropdown options={RFID_READER_TYPE_OPTIONS} value={rfidReaderType} onChange={setRfidReaderType} placeholder="Disabled" className="text-xl min-w-[220px]" />
                    </div>
                    <div className="flex justify-center mt-[100px]">
                      <button type="button" className="flex items-center gap-4 px-6 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 text-2xl" disabled={savingRfidReader} onClick={handleSaveRfidReader}>
                        <svg fill="currentColor" width="24" height="24" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M-5.732,2.97-7.97.732a2.474,2.474,0,0,0-1.483-.7A.491.491,0,0,0-9.591,0H-18.5A2.5,2.5,0,0,0-21,2.5v11A2.5,2.5,0,0,0-18.5,16h11A2.5,2.5,0,0,0-5,13.5V4.737A2.483,2.483,0,0,0-5.732,2.97ZM-13,1V5.455h-3.591V1Zm-4.272,14V10.545h8.544V15ZM-6,13.5A1.5,1.5,0,0,1-7.5,15h-.228V10.045a.5.5,0,0,0-.5-.5h-9.544a.5.5,0,0,0-.5.5V15H-18.5A1.5,1.5,0,0,1-20,13.5V2.5A1.5,1.5,0,0,1-18.5,1h.909V5.955a.5.5,0,0,0,.5.5h7.5a.5.5,0,0,0,.5-.5v-4.8a1.492,1.492,0,0,1,.414.285l2.238,2.238A1.511,1.511,0,0,1-6,4.737Z" transform="translate(21)" /></svg>
                        Save
                      </button>
                    </div>
                  </div>
                  <div className="shrink-0 pt-4">
                    <KeyboardWithNumpad value={rfidReaderKeyboardValue} onChange={setRfidReaderKeyboardValue} />
                  </div>
                </div>
              )}
              {subNavId === 'Barcode Scanner' && (
                <div className="flex flex-col min-h-[820px] justify-between items-center">
                  <div className="flex flex-col gap-6 mb-6 mt-[50px]">
                    <div className="flex items-center gap-3">
                      <label className="block text-pos-text text-xl min-w-[100px] max-w-[100px] font-medium shrink-0">Type:</label>
                      <Dropdown options={BARCODE_SCANNER_TYPE_OPTIONS} value={barcodeScannerType} onChange={setBarcodeScannerType} placeholder="Disabled" className="text-xl min-w-[220px]" />
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="block text-pos-text text-xl font-medium shrink-0 min-w-[100px] max-w-[100px]">Port:</label>
                      <Dropdown options={BARCODE_SCANNER_PORT_OPTIONS} value={barcodeScannerPort} onChange={setBarcodeScannerPort} placeholder="COM 1" className="text-xl min-w-[220px]" />
                    </div>
                    <div className="flex justify-center mt-[50px]">
                      <button type="button" className="flex items-center gap-4 px-6 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 text-2xl" disabled={savingBarcodeScanner} onClick={handleSaveBarcodeScanner}>
                        <svg fill="currentColor" width="24" height="24" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M-5.732,2.97-7.97.732a2.474,2.474,0,0,0-1.483-.7A.491.491,0,0,0-9.591,0H-18.5A2.5,2.5,0,0,0-21,2.5v11A2.5,2.5,0,0,0-18.5,16h11A2.5,2.5,0,0,0-5,13.5V4.737A2.483,2.483,0,0,0-5.732,2.97ZM-13,1V5.455h-3.591V1Zm-4.272,14V10.545h8.544V15ZM-6,13.5A1.5,1.5,0,0,1-7.5,15h-.228V10.045a.5.5,0,0,0-.5-.5h-9.544a.5.5,0,0,0-.5.5V15H-18.5A1.5,1.5,0,0,1-20,13.5V2.5A1.5,1.5,0,0,1-18.5,1h.909V5.955a.5.5,0,0,0,.5.5h7.5a.5.5,0,0,0,.5-.5v-4.8a1.492,1.492,0,0,1,.414.285l2.238,2.238A1.511,1.511,0,0,1-6,4.737Z" transform="translate(21)" /></svg>
                        Save
                      </button>
                    </div>
                  </div>
                  <div className="shrink-0 pt-4">
                    <KeyboardWithNumpad value={barcodeScannerKeyboardValue} onChange={setBarcodeScannerKeyboardValue} />
                  </div>
                </div>
              )}
              {subNavId === 'Credit Card' && (
                <div className="flex flex-col min-h-[820px] justify-between items-center">
                  <div className="flex flex-col gap-6 mb-6 mt-[50px]">
                    <div className="flex items-center gap-10">
                      <label className="block text-pos-text text-xl font-medium shrink-0">Type:</label>
                      <Dropdown options={CREDIT_CARD_TYPE_OPTIONS} value={creditCardType} onChange={setCreditCardType} placeholder="Disabled" className="text-xl min-w-[220px]" />
                    </div>
                    <div className="flex justify-center mt-[100px]">
                      <button type="button" className="flex items-center gap-2 px-6 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 text-xl" disabled={savingCreditCard} onClick={handleSaveCreditCard}>
                        <svg fill="currentColor" width="24" height="24" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M-5.732,2.97-7.97.732a2.474,2.474,0,0,0-1.483-.7A.491.491,0,0,0-9.591,0H-18.5A2.5,2.5,0,0,0-21,2.5v11A2.5,2.5,0,0,0-18.5,16h11A2.5,2.5,0,0,0-5,13.5V4.737A2.483,2.483,0,0,0-5.732,2.97ZM-13,1V5.455h-3.591V1Zm-4.272,14V10.545h8.544V15ZM-6,13.5A1.5,1.5,0,0,1-7.5,15h-.228V10.045a.5.5,0,0,0-.5-.5h-9.544a.5.5,0,0,0-.5.5V15H-18.5A1.5,1.5,0,0,1-20,13.5V2.5A1.5,1.5,0,0,1-18.5,1h.909V5.955a.5.5,0,0,0,.5.5h7.5a.5.5,0,0,0,.5-.5v-4.8a1.492,1.492,0,0,1,.414.285l2.238,2.238A1.511,1.511,0,0,1-6,4.737Z" transform="translate(21)" /></svg>
                        Save
                      </button>
                    </div>
                  </div>
                  <div className="shrink-0 pt-4">
                    <KeyboardWithNumpad value={creditCardKeyboardValue} onChange={setCreditCardKeyboardValue} />
                  </div>
                </div>
              )}
              {subNavId === 'Libra' && (
                <div className="flex flex-col min-h-[820px] justify-between items-center">
                  <div className="flex flex-col gap-6 mb-6 mt-[50px]">
                    <div className="flex items-center gap-3">
                      <label className="block text-pos-text text-xl font-medium shrink-0 min-w-[200px] max-w-[200px]">Protocol / Type:</label>
                      <Dropdown options={SCALE_TYPE_OPTIONS} value={scaleType} onChange={setScaleType} placeholder="Disabled" className="text-xl min-w-[220px]" />
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="block text-pos-text min-w-[200px] max-w-[200px] text-xl font-medium shrink-0">Port:</label>
                      <Dropdown options={SCALE_PORT_OPTIONS} value={scalePort} onChange={setScalePort} placeholder="Select port" className="text-xl min-w-[220px]" />
                    </div>
                    <div className="flex justify-center mt-[50px]">
                      <button type="button" className="flex items-center gap-4 px-6 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 text-2xl" disabled={savingScale} onClick={handleSaveScale}>
                        <svg fill="currentColor" width="24" height="24" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M-5.732,2.97-7.97.732a2.474,2.474,0,0,0-1.483-.7A.491.491,0,0,0-9.591,0H-18.5A2.5,2.5,0,0,0-21,2.5v11A2.5,2.5,0,0,0-18.5,16h11A2.5,2.5,0,0,0-5,13.5V4.737A2.483,2.483,0,0,0-5.732,2.97ZM-13,1V5.455h-3.591V1Zm-4.272,14V10.545h8.544V15ZM-6,13.5A1.5,1.5,0,0,1-7.5,15h-.228V10.045a.5.5,0,0,0-.5-.5h-9.544a.5.5,0,0,0-.5.5V15H-18.5A1.5,1.5,0,0,1-20,13.5V2.5A1.5,1.5,0,0,1-18.5,1h.909V5.955a.5.5,0,0,0,.5.5h7.5a.5.5,0,0,0,.5-.5v-4.8a1.492,1.492,0,0,1,.414.285l2.238,2.238A1.511,1.511,0,0,1-6,4.737Z" transform="translate(21)" /></svg>
                        Save
                      </button>
                    </div>
                  </div>
                  <div className="shrink-0 pt-4">
                    <KeyboardWithNumpad value={scaleKeyboardValue} onChange={setScaleKeyboardValue} />
                  </div>
                </div>
              )}
              {subNavId === 'Cashmatic' && (
                <div className="flex flex-col min-h-[820px] justify-between relative">
                  <div className="flex flex-col gap-6 mb-6 mt-[30px] px-[200px]">
                    <div className="flex items-center gap-8">
                      <label className="block text-pos-text text-xl font-medium shrink-0 w-[160px]">Name *</label>
                      <input
                        type="text"
                        value={cashmaticName}
                        onChange={(e) => setCashmaticName(e.target.value)}
                        onFocus={() => setCashmaticActiveField('name')}
                        onClick={() => setCashmaticActiveField('name')}
                        className="min-w-[280px] px-4 py-3 text-xl rounded bg-pos-panel border border-pos-border text-pos-text placeholder-pos-muted focus:outline-none focus:border-green-500"
                      />
                    </div>
                    <div className="flex items-center gap-8">
                      <label className="block text-pos-text text-xl font-medium shrink-0 w-[160px]">Connection type *</label>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          className={`px-8 py-3 text-2xl font-medium ${cashmaticConnectionType === 'tcp' ? 'bg-cyan-500 text-white' : 'bg-pos-panel text-pos-text'}`}
                          onClick={() => setCashmaticConnectionType('tcp')}
                        >
                          TCP/IP
                        </button>
                        <button
                          type="button"
                          className={`px-8 py-3 text-2xl font-medium ${cashmaticConnectionType === 'api' ? 'bg-cyan-500 text-white' : 'bg-pos-panel text-pos-text'}`}
                          onClick={() => setCashmaticConnectionType('api')}
                        >
                          API
                        </button>
                      </div>
                    </div>
                    {cashmaticConnectionType === 'tcp' ? (
                      <>
                        <div className="flex-col flex gap-8">
                          <div className="flex items-center gap-8">
                            <div className="flex items-center gap-8">
                              <label className="block text-pos-text text-xl font-medium shrink-0 w-[160px]">IP address *</label>
                              <input
                                type="text"
                                value={cashmaticIpAddress}
                                onChange={(e) => setCashmaticIpAddress(e.target.value)}
                                onFocus={() => setCashmaticActiveField('ip')}
                                onClick={() => setCashmaticActiveField('ip')}
                                className="min-w-[280px] px-4 py-3 text-xl rounded bg-pos-panel border border-pos-border text-pos-text placeholder-pos-muted focus:outline-none focus:border-green-500"
                              />
                            </div>
                            <div className="flex items-center gap-8">
                              <label className="block text-pos-text text-xl font-medium shrink-0 w-[160px]">Port *</label>
                              <input
                                type="text"
                                value={cashmaticPort}
                                onChange={(e) => setCashmaticPort(e.target.value)}
                                onFocus={() => setCashmaticActiveField('port')}
                                onClick={() => setCashmaticActiveField('port')}
                                className="min-w-[280px] px-4 py-3 text-xl rounded bg-pos-panel border border-pos-border text-pos-text placeholder-pos-muted focus:outline-none focus:border-green-500"
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-8">
                            <div className="flex items-center gap-8">
                              <label className="block text-pos-text text-xl font-medium shrink-0 w-[160px]">Username</label>
                              <input
                                type="text"
                                value={cashmaticUsername}
                                onChange={(e) => setCashmaticUsername(e.target.value)}
                                onFocus={() => setCashmaticActiveField('username')}
                                onClick={() => setCashmaticActiveField('username')}
                                placeholder="Optional"
                                className="min-w-[280px] px-4 py-3 text-xl rounded bg-pos-panel border border-pos-border text-pos-text placeholder-pos-muted focus:outline-none focus:border-green-500"
                              />
                            </div>
                            <div className="flex items-center gap-8">
                              <label className="block text-pos-text text-xl font-medium shrink-0 w-[160px]">Password</label>
                              <input
                                type="text"
                                value={cashmaticPassword}
                                onChange={(e) => setCashmaticPassword(e.target.value)}
                                onFocus={() => setCashmaticActiveField('password')}
                                onClick={() => setCashmaticActiveField('password')}
                                placeholder="Optional"
                                className="min-w-[280px] px-4 py-3 text-xl rounded bg-pos-panel border border-pos-border text-pos-text placeholder-pos-muted focus:outline-none focus:border-green-500"
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-8">
                        <label className="block text-pos-text text-xl font-medium shrink-0 w-[160px]">URL *</label>
                        <input
                          type="text"
                          value={cashmaticUrl}
                          onChange={(e) => setCashmaticUrl(e.target.value)}
                          onFocus={() => setCashmaticActiveField('url')}
                          onClick={() => setCashmaticActiveField('url')}
                          placeholder="https://api.example.com"
                          className="min-w-[280px] px-4 py-3 text-xl rounded bg-pos-panel border border-pos-border text-pos-text placeholder-pos-muted focus:outline-none focus:border-green-500"
                        />
                      </div>
                    )}
                    <div className="flex justify-center mt-[10px]">
                      <button type="button" className="flex items-center text-2xl gap-4 px-6 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50" disabled={savingCashmatic} onClick={handleSaveCashmatic}>
                        <svg fill="currentColor" width="24" height="24" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M-5.732,2.97-7.97.732a2.474,2.474,0,0,0-1.483-.7A.491.491,0,0,0-9.591,0H-18.5A2.5,2.5,0,0,0-21,2.5v11A2.5,2.5,0,0,0-18.5,16h11A2.5,2.5,0,0,0-5,13.5V4.737A2.483,2.483,0,0,0-5.732,2.97ZM-13,1V5.455h-3.591V1Zm-4.272,14V10.545h8.544V15ZM-6,13.5A1.5,1.5,0,0,1-7.5,15h-.228V10.045a.5.5,0,0,0-.5-.5h-9.544a.5.5,0,0,0-.5.5V15H-18.5A1.5,1.5,0,0,1-20,13.5V2.5A1.5,1.5,0,0,1-18.5,1h.909V5.955a.5.5,0,0,0,.5.5h7.5a.5.5,0,0,0,.5-.5v-4.8a1.492,1.492,0,0,1,.414.285l2.238,2.238A1.511,1.511,0,0,1-6,4.737Z" transform="translate(21)" /></svg>
                        Save
                      </button>
                    </div>
                  </div>
                  <div className="shrink-0 w-full justify-center flex absolute bottom-0 left-0 right-0 -mb-10">
                    <KeyboardWithNumpad value={cashmaticKeyboardValue} onChange={cashmaticKeyboardOnChange} />
                  </div>
                </div>
              )}
              {subNavId === 'Payworld' && (
                <div className="flex flex-col min-h-[820px] justify-between relative">
                  <div className="flex flex-col gap-6 mb-6 mt-[30px] w-full justify-center items-center">
                    <div className="flex items-center gap-8">
                      <label className="block text-pos-text text-xl font-medium shrink-0 w-[160px]">Name *</label>
                      <input
                        type="text"
                        value={payworldName}
                        onChange={(e) => setPayworldName(e.target.value)}
                        onFocus={() => setPayworldActiveField('name')}
                        onClick={() => setPayworldActiveField('name')}
                        className="min-w-[280px] px-4 py-3 text-xl rounded bg-pos-panel border border-pos-border text-pos-text placeholder-pos-muted focus:outline-none focus:border-green-500"
                      />
                    </div>
                    <div className="flex items-center gap-8">
                      <label className="block text-pos-text text-xl font-medium shrink-0 w-[160px]">IP address *</label>
                      <input
                        type="text"
                        value={payworldIpAddress}
                        onChange={(e) => setPayworldIpAddress(e.target.value)}
                        onFocus={() => setPayworldActiveField('ip')}
                        onClick={() => setPayworldActiveField('ip')}
                        placeholder="e.g. 192.168.1.60"
                        className="min-w-[280px] px-4 py-3 text-xl rounded bg-pos-panel border border-pos-border text-pos-text placeholder-pos-muted focus:outline-none focus:border-green-500"
                      />
                    </div>
                    <div className="flex items-center gap-8">
                      <label className="block text-pos-text text-xl font-medium shrink-0 w-[160px]">Port *</label>
                      <input
                        type="text"
                        value={payworldPort}
                        onChange={(e) => setPayworldPort(e.target.value)}
                        onFocus={() => setPayworldActiveField('port')}
                        onClick={() => setPayworldActiveField('port')}
                        placeholder="5015"
                        className="min-w-[280px] px-4 py-3 text-xl rounded bg-pos-panel border border-pos-border text-pos-text placeholder-pos-muted focus:outline-none focus:border-green-500"
                      />
                    </div>
                    <div className="flex justify-center mt-[10px]">
                      <button type="button" className="flex items-center text-2xl gap-4 px-6 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50" disabled={savingPayworld} onClick={handleSavePayworld}>
                        <svg fill="currentColor" width="24" height="24" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M-5.732,2.97-7.97.732a2.474,2.474,0,0,0-1.483-.7A.491.491,0,0,0-9.591,0H-18.5A2.5,2.5,0,0,0-21,2.5v11A2.5,2.5,0,0,0-18.5,16h11A2.5,2.5,0,0,0-5,13.5V4.737A2.483,2.483,0,0,0-5.732,2.97ZM-13,1V5.455h-3.591V1Zm-4.272,14V10.545h8.544V15ZM-6,13.5A1.5,1.5,0,0,1-7.5,15h-.228V10.045a.5.5,0,0,0-.5-.5h-9.544a.5.5,0,0,0-.5.5V15H-18.5A1.5,1.5,0,0,1-20,13.5V2.5A1.5,1.5,0,0,1-18.5,1h.909V5.955a.5.5,0,0,0,.5.5h7.5a.5.5,0,0,0,.5-.5v-4.8a1.492,1.492,0,0,1,.414.285l2.238,2.238A1.511,1.511,0,0,1-6,4.737Z" transform="translate(21)" /></svg>
                        Save
                      </button>
                    </div>
                  </div>
                  <div className="shrink-0 w-full justify-center flex absolute bottom-0 left-0 right-0 -mb-10">
                    <KeyboardWithNumpad value={payworldKeyboardValue} onChange={payworldKeyboardOnChange} />
                  </div>
                </div>
              )}
            </div>
          ) : topNavId === 'tables' ? (() => {
            const TABLE_LOCATIONS_PER_PAGE = 11;
            const totalTableLocationsPages = Math.max(1, Math.ceil(tableLocations.length / TABLE_LOCATIONS_PER_PAGE));
            const tlPage = Math.min(tableLocationsPage, totalTableLocationsPages - 1);
            const paginatedTableLocations = tableLocations.slice(tlPage * TABLE_LOCATIONS_PER_PAGE, (tlPage + 1) * TABLE_LOCATIONS_PER_PAGE);
            const canPrevTl = tlPage > 0;
            const canNextTl = tlPage < totalTableLocationsPages - 1;
            return (
              <div className="relative rounded-xl border border-pos-border bg-pos-panel/30 p-8 min-h-[950px] pb-24">
                <div className="flex items-center w-full justify-center mb-6">
                  <button
                    type="button"
                    className="px-6 py-3 rounded-lg text-xl font-medium bg-pos-panel border border-pos-border text-pos-text hover:bg-pos-bg hover:border-white/30 transition-colors disabled:opacity-50"
                    disabled={tableLocationsLoading}
                    onClick={openTableLocationModal}
                  >
                    {tr('control.tables.new', 'New table setting')}
                  </button>
                </div>
                <ul className="w-full flex flex-col">
                  {tableLocationsLoading ? (
                    <li className="text-pos-muted text-xl py-4">{tr('control.tables.loading', 'Loading table locations...')}</li>
                  ) : tableLocations.length === 0 ? (
                    <li className="text-pos-muted text-xl py-6 text-center">{tr('control.tables.empty', 'No table locations yet.')}</li>
                  ) : (
                    paginatedTableLocations.map((loc) => {
                      const hasSavedLayout = (() => {
                        try {
                          if (loc?.layoutJson == null || loc.layoutJson === '') return false;
                          const parsed = JSON.parse(loc.layoutJson);
                          return Array.isArray(parsed?.tables) && parsed.tables.length > 0;
                        } catch {
                          return false;
                        }
                      })();
                      return (
                      <li
                        key={loc.id}
                        className="flex justify-between items-center w-full px-10 py-3 bg-pos-bg border-b border-pos-border text-pos-text text-xl"
                      >
                        <span className="font-medium">{loc.name}</span>
                        <div className="flex absolute left-1/2 justify-center">
                          <button
                            type="button"
                            className={`w-full text-center px-4 py-2 rounded-lg text-xl hover:bg-pos-panel ${
                              hasSavedLayout ? 'text-white' : 'text-pos-muted hover:text-pos-text'
                            }`}
                            onClick={() => openSetTablesModal(loc)}
                          >
                            {tr('control.tables.setTables', 'Set tables')}
                          </button>
                        </div>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            className="p-2 rounded text-pos-text hover:bg-pos-panel"
                            onClick={() => openEditTableLocationModal(loc)}
                            aria-label="Edit"
                          >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                          <button
                            type="button"
                            className="p-2 rounded text-pos-text hover:bg-pos-panel"
                            onClick={() => setDeleteConfirmTableLocationId(loc.id)}
                            aria-label="Delete"
                          >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </li>
                      );
                    })
                  )}
                </ul>
                {tableLocations.length > 0 && (
                  <PaginationArrows
                    canPrev={canPrevTl}
                    canNext={canNextTl}
                    onPrev={() => setTableLocationsPage((p) => Math.max(0, p - 1))}
                    onNext={() => setTableLocationsPage((p) => Math.min(totalTableLocationsPages - 1, p + 1))}
                  />
                )}
              </div>
            );
          })() : null}
        </main>
      </div>

      <DeleteConfirmModal
        open={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => handleDeletePriceGroup(deleteConfirmId)}
        message={tr('control.confirm.deletePriceGroup', 'Are you sure you want to delete this price group?')}
      />
      <DeleteConfirmModal
        open={deleteConfirmCategoryId !== null}
        onClose={() => setDeleteConfirmCategoryId(null)}
        onConfirm={() => handleDeleteCategory(deleteConfirmCategoryId)}
        message={tr('control.confirm.deleteCategory', 'Are you sure you want to delete this category?')}
      />
      <DeleteConfirmModal
        open={deleteConfirmProductId !== null}
        onClose={() => setDeleteConfirmProductId(null)}
        onConfirm={() => handleDeleteProduct(deleteConfirmProductId)}
        message={tr('control.confirm.deleteProduct', 'Are you sure you want to delete this product?')}
      />
      <DeleteConfirmModal
        open={deleteConfirmSubproductId !== null}
        onClose={() => setDeleteConfirmSubproductId(null)}
        onConfirm={() => handleDeleteSubproduct(deleteConfirmSubproductId)}
        message={tr('control.confirm.deleteSubproduct', 'Are you sure you want to delete this subproduct?')}
      />
      <DeleteConfirmModal
        open={deleteConfirmGroupId !== null}
        onClose={() => setDeleteConfirmGroupId(null)}
        onConfirm={() => handleDeleteGroup(deleteConfirmGroupId)}
        message={tr('control.confirm.deleteGroup', 'Are you sure you want to delete this group? Subproducts in it will also be deleted.')}
      />
      <DeleteConfirmModal
        open={deleteConfirmTableLocationId !== null}
        onClose={() => setDeleteConfirmTableLocationId(null)}
        onConfirm={() => handleDeleteTableLocation(deleteConfirmTableLocationId)}
        message={tr('control.confirm.deleteTableLocation', 'Are you sure you want to delete this table location?')}
      />
      <DeleteConfirmModal
        open={deleteConfirmProductionMessageId !== null}
        onClose={() => setDeleteConfirmProductionMessageId(null)}
        onConfirm={() => handleDeleteProductionMessage(deleteConfirmProductionMessageId)}
        message={tr('control.confirm.deleteProductionMessage', 'Are you sure you want to delete this production message?')}
      />
      <DeleteConfirmModal
        open={deleteConfirmPrinterId !== null}
        onClose={() => setDeleteConfirmPrinterId(null)}
        onConfirm={() => handleDeletePrinter(deleteConfirmPrinterId)}
        message={tr('control.confirm.deletePrinter', 'Are you sure you want to delete this printer?')}
      />
      <DeleteConfirmModal
        open={deleteConfirmLabelId !== null}
        onClose={() => setDeleteConfirmLabelId(null)}
        onConfirm={() => handleDeleteLabel(deleteConfirmLabelId)}
        message={tr('control.confirm.deleteLabel', 'Are you sure you want to delete this label?')}
      />
      <DeleteConfirmModal
        open={deleteConfirmUserId !== null}
        onClose={() => setDeleteConfirmUserId(null)}
        onConfirm={() => handleDeleteUser(deleteConfirmUserId)}
        message={tr('control.confirm.deleteUser', 'Are you sure you want to delete this user?')}
      />
      <DeleteConfirmModal
        open={deleteConfirmDiscountId !== null}
        onClose={() => setDeleteConfirmDiscountId(null)}
        onConfirm={() => handleDeleteDiscount(deleteConfirmDiscountId)}
        message={tr('control.confirm.deleteDiscount', 'Are you sure you want to delete this discount?')}
      />
      <DeleteConfirmModal
        open={deleteConfirmKitchenMessageId !== null}
        onClose={() => setDeleteConfirmKitchenMessageId(null)}
        onConfirm={() => handleDeleteKitchenMessage(deleteConfirmKitchenMessageId)}
        message={tr('control.confirm.deleteKitchenMessage', 'Are you sure you want to delete this kitchen message?')}
      />

      {/* New / Edit user modal — General + Privileges tabs, keyboard like other modals */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative bg-pos-bg rounded-xl border border-pos-border shadow-2xl max-w-[1430px] w-full h-[1050px] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="absolute top-4 right-4 z-10 p-2 rounded text-pos-muted hover:text-pos-text hover:bg-pos-panel" onClick={closeUserModal} aria-label="Close">
              <svg className="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="flex justify-around mt-[50px] shrink-0">
              <button type="button" className={`px-8 py-4 text-xl font-medium border-b-2 transition-colors ${userModalTab === 'general' ? 'border-blue-500 text-blue-500 bg-pos-panel/50' : 'border-transparent text-pos-text hover:bg-pos-panel/30'}`} onClick={() => setUserModalTab('general')}>{tr('control.userModal.general', 'General')}</button>
              <button type="button" className={`px-8 py-4 text-xl font-medium border-b-2 transition-colors ${userModalTab === 'privileges' ? 'border-blue-500 text-blue-500 bg-pos-panel/50' : 'border-transparent text-pos-text hover:bg-pos-panel/30'}`} onClick={() => setUserModalTab('privileges')}>{tr('control.userModal.privileges', 'Privileges')}</button>
            </div>
            <div className="flex-1 overflow-hidden px-14 py-8">
              {userModalTab === 'general' ? (
                <div className="grid grid-cols-2 gap-16 max-w-[1100px] mx-auto">
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-6">
                      <label className="text-pos-text text-xl font-medium shrink-0 w-[200px]">{tr('name', 'Name')}:</label>
                      <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        onFocus={() => setUserModalActiveField('name')}
                        placeholder=""
                        className="flex-1 px-4 py-3 rounded-lg bg-pos-panel border border-pos-border text-pos-text placeholder-pos-muted focus:outline-none focus:border-green-500 text-xl"
                      />
                    </div>
                    <div className="flex items-center gap-6">
                      <label className="text-pos-text text-xl font-medium shrink-0 w-[200px]">{tr('control.userModal.pincode', 'Pincode')}:</label>
                      <input
                        type="text"
                        value={userPin}
                        onChange={(e) => setUserPin(e.target.value)}
                        onFocus={() => setUserModalActiveField('pincode')}
                        placeholder=""
                        className="flex-1 px-4 py-3 rounded-lg bg-pos-panel border border-pos-border text-pos-text placeholder-pos-muted focus:outline-none focus:border-green-500 text-xl"
                        autoComplete="new-password"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="text-pos-text text-xl font-medium mb-2">{tr('control.userModal.privileges', 'Privileges')}</div>
                    <div className="grid grid-cols-3 gap-4">
                      {USER_PRIVILEGE_AVATAR_COLORS.map((color, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className={`w-20 h-20 rounded-full border-4 transition-colors ${userAvatarColorIndex === idx ? 'border-gray-400 ring-2 ring-offset-2 ring-offset-pos-bg ring-gray-300' : 'border-transparent hover:opacity-90'}`}
                          style={{ backgroundColor: color }}
                          onClick={() => setUserAvatarColorIndex(idx)}
                          aria-label={`Avatar color ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="">
                  <div className="grid grid-cols-3 gap-x-12 w-full gap-y-10">
                    {USER_PRIVILEGE_OPTIONS.map((p) => (
                      <label key={p.id} className="flex items-center gap-3 cursor-pointer">
                        <span className="text-pos-text min-w-[350px] max-w-[300px] text-xl">{p.label}</span>
                        <input
                          type="checkbox"
                          checked={!!userPrivileges[p.id]}
                          onChange={(e) => setUserPrivileges((prev) => ({ ...prev, [p.id]: e.target.checked }))}
                          className="w-10 h-10 rounded border-pos-border bg-pos-panel text-green-600 focus:ring-green-500"
                        />
                      </label>
                    ))}
                  </div>
                  <div className="flex justify-center mt-20">
                    <button type="button" className="flex items-center gap-4 px-6 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 text-2xl" disabled={savingUser} onClick={handleSaveUser}>
                      <svg fill="currentColor" width="24" height="24" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M-5.732,2.97-7.97.732a2.474,2.474,0,0,0-1.483-.7A.491.491,0,0,0-9.591,0H-18.5A2.5,2.5,0,0,0-21,2.5v11A2.5,2.5,0,0,0-18.5,16h11A2.5,2.5,0,0,0-5,13.5V4.737A2.483,2.483,0,0,0-5.732,2.97ZM-13,1V5.455h-3.591V1Zm-4.272,14V10.545h8.544V15ZM-6,13.5A1.5,1.5,0,0,1-7.5,15h-.228V10.045a.5.5,0,0,0-.5-.5h-9.544a.5.5,0,0,0-.5.5V15H-18.5A1.5,1.5,0,0,1-20,13.5V2.5A1.5,1.5,0,0,1-18.5,1h.909V5.955a.5.5,0,0,0,.5.5h7.5a.5.5,0,0,0,.5-.5v-4.8a1.492,1.492,0,0,1,.414.285l2.238,2.238A1.511,1.511,0,0,1-6,4.737Z" transform="translate(21)" /></svg>
                      Save
                    </button>
                  </div>
                </div>
              )}
              {userModalTab === 'general' && (
                <div className="flex justify-center mt-14">
                  <button type="button" className="flex items-center gap-4 px-6 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 text-2xl" disabled={savingUser} onClick={handleSaveUser}>
                    <svg fill="currentColor" width="24" height="24" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M-5.732,2.97-7.97.732a2.474,2.474,0,0,0-1.483-.7A.491.491,0,0,0-9.591,0H-18.5A2.5,2.5,0,0,0-21,2.5v11A2.5,2.5,0,0,0-18.5,16h11A2.5,2.5,0,0,0-5,13.5V4.737A2.483,2.483,0,0,0-5.732,2.97ZM-13,1V5.455h-3.591V1Zm-4.272,14V10.545h8.544V15ZM-6,13.5A1.5,1.5,0,0,1-7.5,15h-.228V10.045a.5.5,0,0,0-.5-.5h-9.544a.5.5,0,0,0-.5.5V15H-18.5A1.5,1.5,0,0,1-20,13.5V2.5A1.5,1.5,0,0,1-18.5,1h.909V5.955a.5.5,0,0,0,.5.5h7.5a.5.5,0,0,0,.5-.5v-4.8a1.492,1.492,0,0,1,.414.285l2.238,2.238A1.511,1.511,0,0,1-6,4.737Z" transform="translate(21)" /></svg>
                    Save
                  </button>
                </div>
              )}
            </div>
            <div className="shrink-0 w-full flex justify-center">
              <KeyboardWithNumpad value={userModalKeyboardValue} onChange={userModalKeyboardOnChange} />
            </div>
          </div>
        </div>
      )}

      {/* New / Edit discount modal */}
      {showDiscountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative bg-pos-bg rounded-xl border border-pos-border shadow-2xl max-w-[1430px] w-full min-h-[1050px] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="absolute top-4 right-4 z-10 p-2 rounded text-pos-muted hover:text-pos-text hover:bg-pos-panel" onClick={closeDiscountModal} aria-label="Close">
              <svg className="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="flex-1 overflow-auto px-14 mt-[110px]">
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="flex flex-col col-span-2 gap-6">
                  <div className='flex gap-10'>
                    <div className='flex items-center gap-24'>
                      <label className="block text-pos-text text-xl font-medium mb-1">Name:</label>
                      <input type="text" value={discountName} onChange={(e) => setDiscountName(e.target.value)} placeholder="Discount name" className="w-full px-4 py-3 rounded-lg bg-pos-panel border border-pos-border text-pos-text placeholder-pos-muted focus:outline-none focus:border-green-500 text-xl" />
                    </div>
                    <div className='flex items-center gap-10'>
                      <label className="block text-pos-text text-xl font-medium mb-1">Discount on:</label>
                      <div className="flex gap-2 items-center">
                        <Dropdown options={DISCOUNT_ON_OPTIONS} value={discountOn} onChange={setDiscountOn} placeholder="Products" className="text-xl min-w-[250px]" />
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center gap-10'>
                    <div className='flex items-center gap-[80px]'>
                      <label className="block text-pos-text text-xl font-medium mb-1">Trigger:</label>
                      <Dropdown options={DISCOUNT_TRIGGER_OPTIONS} value={discountTrigger} onChange={setDiscountTrigger} placeholder="Number" className="w-full min-w-[250px] text-xl" />
                    </div>
                    <div className='flex items-center gap-10'>
                      <div className="flex items-center gap-4">
                        <input type="text" value={discountPieces} onChange={(e) => setDiscountPieces(e.target.value)} placeholder="" className="max-w-[100px] px-4 py-3 rounded-lg bg-pos-panel border border-pos-border text-pos-text text-xl" />
                        <label className="block text-pos-text text-xl font-medium mb-1">Piece(s)</label>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={discountCombinable} onChange={(e) => setDiscountCombinable(e.target.checked)} className="w-10 h-8 rounded border-pos-border bg-pos-bg text-green-600" />
                        <span className="text-pos-text text-xl">Combinable</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex items-center gap-10">
                    <div className="flex gap-[66px] items-center">
                      <label className="block text-pos-text text-xl font-medium mb-1">Discount:</label>
                      <Dropdown options={DISCOUNT_TYPE_OPTIONS} value={discountType} onChange={setDiscountType} placeholder="Amount" className="w-full min-w-[250px] text-xl" />
                    </div>
                    <div className="flex items-center gap-4">
                      <input type="text" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} placeholder="0" className="max-w-[100px] px-3 py-3 rounded-lg bg-pos-panel border border-pos-border text-pos-text text-xl" />
                      <span className="text-pos-text text-xl">euro</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <label className="block text-pos-text text-xl font-medium mb-1">Starting date:</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={discountStartDate ? (() => { const d = new Date(discountStartDate); return isNaN(d.getTime()) ? discountStartDate : d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }); })() : ''}
                        placeholder="MM/DD/YYYY"
                        className="px-4 py-3 rounded-lg bg-pos-panel border border-pos-border text-pos-text text-xl min-w-[180px] cursor-pointer"
                        onClick={() => setDiscountCalendarField('start')}
                      />
                      <button type="button" className="p-2 rounded-lg bg-pos-panel border border-pos-border text-pos-text hover:bg-pos-bg" onClick={() => setDiscountCalendarField('start')} aria-label="Open calendar">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-[65px]">
                    <label className="block text-pos-text text-xl font-medium mb-1">End date:</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={discountEndDate ? (() => { const d = new Date(discountEndDate); return isNaN(d.getTime()) ? discountEndDate : d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }); })() : ''}
                        placeholder="MM/DD/YYYY"
                        className="px-4 py-3 rounded-lg bg-pos-panel border border-pos-border text-pos-text text-xl min-w-[180px] cursor-pointer"
                        onClick={() => setDiscountCalendarField('end')}
                      />
                      <button type="button" className="p-2 rounded-lg bg-pos-panel border border-pos-border text-pos-text hover:bg-pos-bg" onClick={() => setDiscountCalendarField('end')} aria-label="Open calendar">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <div className='flex items-center justify-center'>
                    <Dropdown options={[{ value: 'a', label: 'a' }]} value="a" onChange={() => { }} placeholder="a" className="min-w-[200px] max-w-12 w-full text-xl" />
                  </div>
                  <div className="flex-1 min-h-[320px] rounded-lg border border-pos-border bg-white/5 mt-2" />
                  <div className='flex justify-center items-center gap-10'>
                    <button type="button" className="p-3 rounded-lg bg-pos-panel border border-pos-border text-pos-text hover:bg-pos-bg" aria-label="Up">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                    </button>
                    <button type="button" className="p-3 rounded-lg bg-pos-panel border border-pos-border text-pos-text hover:bg-pos-bg" aria-label="Down">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                  </div>
                </div>
              </div>
              <div className="absolute right-0 left-0 top-[50%] flex justify-center">
                <button type="button" className="flex items-center gap-2 px-6 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 text-2xl" disabled={savingDiscount} onClick={handleSaveDiscount}>
                  <svg fill="currentColor" width="24" height="24" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M-5.732,2.97-7.97.732a2.474,2.474,0,0,0-1.483-.7A.491.491,0,0,0-9.591,0H-18.5A2.5,2.5,0,0,0-21,2.5v11A2.5,2.5,0,0,0-18.5,16h11A2.5,2.5,0,0,0-5,13.5V4.737A2.483,2.483,0,0,0-5.732,2.97ZM-13,1V5.455h-3.591V1Zm-4.272,14V10.545h8.544V15ZM-6,13.5A1.5,1.5,0,0,1-7.5,15h-.228V10.045a.5.5,0,0,0-.5-.5h-9.544a.5.5,0,0,0-.5.5V15H-18.5A1.5,1.5,0,0,1-20,13.5V2.5A1.5,1.5,0,0,1-18.5,1h.909V5.955a.5.5,0,0,0,.5.5h7.5a.5.5,0,0,0,.5-.5v-4.8a1.492,1.492,0,0,1,.414.285l2.238,2.238A1.511,1.511,0,0,1-6,4.737Z" transform="translate(21)" /></svg>
                  {tr('control.save', 'Save')}
                </button>
              </div>
            </div>
            {discountCalendarField && (
              <CalendarModal
                open
                onClose={() => setDiscountCalendarField(null)}
                value={discountCalendarField === 'start' ? discountStartDate : discountEndDate}
                onChange={(date) => {
                  const yyyy = date.getFullYear();
                  const mm = String(date.getMonth() + 1).padStart(2, '0');
                  const dd = String(date.getDate()).padStart(2, '0');
                  const iso = `${yyyy}-${mm}-${dd}`;
                  if (discountCalendarField === 'start') setDiscountStartDate(iso);
                  else setDiscountEndDate(iso);
                }}
              />
            )}
            <div className="shrink-0 w-full justify-center flex">
              <KeyboardWithNumpad value={discountKeyboardValue} onChange={setDiscountKeyboardValue} />
            </div>
          </div>
        </div>
      )}

      {/* New / Edit kitchen message modal */}
      {showKitchenMessageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative justify-between bg-pos-bg rounded-xl border border-pos-border shadow-2xl max-w-[1430px] h-[1000px] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="absolute top-4 right-4 z-10 p-2 rounded text-pos-muted hover:text-pos-text hover:bg-pos-panel" onClick={closeKitchenMessageModal} aria-label="Close">
              <svg className="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="p-6 flex flex-col gap-4 mt-[220px]">
              <div className="flex items-center w-full justify-center gap-20">
                <label className="block text-pos-text text-xl font-medium shrink-0">Name :</label>
                <input
                  type="text"
                  value={kitchenMessageName}
                  onChange={(e) => setKitchenMessageName(e.target.value)}
                  placeholder=""
                  className="flex-1 max-w-[200px] px-4 py-3 rounded-lg bg-pos-panel border border-pos-border text-pos-text placeholder-pos-muted focus:outline-none focus:border-green-500 text-xl"
                />
              </div>
              <div className="flex justify-center absolute left-0 right-0 top-[50%]">
                <button
                  type="button"
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 text-2xl"
                  disabled={savingKitchenMessage}
                  onClick={handleSaveKitchenMessage}
                >
                  <svg fill="currentColor" width="24" height="24" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M-5.732,2.97-7.97.732a2.474,2.474,0,0,0-1.483-.7A.491.491,0,0,0-9.591,0H-18.5A2.5,2.5,0,0,0-21,2.5v11A2.5,2.5,0,0,0-18.5,16h11A2.5,2.5,0,0,0-5,13.5V4.737A2.483,2.483,0,0,0-5.732,2.97ZM-13,1V5.455h-3.591V1Zm-4.272,14V10.545h8.544V15ZM-6,13.5A1.5,1.5,0,0,1-7.5,15h-.228V10.045a.5.5,0,0,0-.5-.5h-9.544a.5.5,0,0,0-.5.5V15H-18.5A1.5,1.5,0,0,1-20,13.5V2.5A1.5,1.5,0,0,1-18.5,1h.909V5.955a.5.5,0,0,0,.5.5h7.5a.5.5,0,0,0,.5-.5v-4.8a1.492,1.492,0,0,1,.414.285l2.238,2.238A1.511,1.511,0,0,1-6,4.737Z" transform="translate(21)" /></svg>
                  Save
                </button>
              </div>
            </div>
            <div className="shrink-0 ">
              <KeyboardWithNumpad value={kitchenMessageName} onChange={setKitchenMessageName} />
            </div>
          </div>
        </div>
      )}

      {/* New / Edit table location modal */}
      {showTableLocationModal && topNavId === 'tables' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative flex flex-col bg-pos-bg rounded-xl border border-pos-border justify-between items-center shadow-2xl max-w-[1430px] w-full overflow-hidden h-[1000px]" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="absolute top-4 right-4 z-10 p-2 rounded text-pos-muted hover:text-pos-text hover:bg-pos-panel" onClick={closeTableLocationModal} aria-label="Close">
              <svg className="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="p-6 overflow-auto flex-1 flex flex-col gap-10 mt-[100px]">
              <div className="flex items-center gap-3">
                <span className="text-pos-text text-xl font-medium shrink-0 w-[160px]">Table Name:</span>
                <input
                  type="text"
                  ref={tableLocationNameInputRef}
                  value={tableLocationName}
                  onChange={(e) => setTableLocationName(e.target.value)}
                  onClick={(e) => {
                    setTableLocationSelectionStart(e.target.selectionStart ?? 0);
                    setTableLocationSelectionEnd(e.target.selectionEnd ?? 0);
                  }}
                  onKeyUp={(e) => {
                    setTableLocationSelectionStart(e.target.selectionStart ?? 0);
                    setTableLocationSelectionEnd(e.target.selectionEnd ?? 0);
                  }}
                  onSelect={(e) => {
                    setTableLocationSelectionStart(e.target.selectionStart ?? 0);
                    setTableLocationSelectionEnd(e.target.selectionEnd ?? 0);
                  }}
                  placeholder="e.g. room 1"
                  className="flex-1 min-w-0 px-4 py-3 rounded-lg bg-pos-panel border border-pos-border text-pos-text caret-white text-xl focus:outline-none focus:border-green-500"
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-pos-text text-xl font-medium shrink-0 w-[160px]">Background:</span>
                <Dropdown
                  options={TABLE_LOCATION_BACKGROUND_OPTIONS}
                  value={tableLocationBackground}
                  onChange={setTableLocationBackground}
                  placeholder="Default"
                  className="flex-1 text-xl min-w-0 max-w-[280px]"
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-pos-text text-xl font-medium shrink-0 w-[160px]">Text color:</span>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="tableLocationTextColor" checked={tableLocationTextColor === 'light'} onChange={() => setTableLocationTextColor('light')} className="w-6 h-6" />
                    <span className="text-pos-text text-xl">light</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="tableLocationTextColor" checked={tableLocationTextColor === 'dark'} onChange={() => setTableLocationTextColor('dark')} className="w-6 h-6" />
                    <span className="text-pos-text text-xl">dark</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-center pt-16">
                <button
                  type="button"
                  className="flex items-center gap-4 px-6 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 text-2xl"
                  disabled={savingTableLocation}
                  onClick={handleSaveTableLocation}
                >
                  <svg fill="currentColor" width="24" height="24" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M-5.732,2.97-7.97.732a2.474,2.474,0,0,0-1.483-.7A.491.491,0,0,0-9.591,0H-18.5A2.5,2.5,0,0,0-21,2.5v11A2.5,2.5,0,0,0-18.5,16h11A2.5,2.5,0,0,0-5,13.5V4.737A2.483,2.483,0,0,0-5.732,2.97ZM-13,1V5.455h-3.591V1Zm-4.272,14V10.545h8.544V15ZM-6,13.5A1.5,1.5,0,0,1-7.5,15h-.228V10.045a.5.5,0,0,0-.5-.5h-9.544a.5.5,0,0,0-.5.5V15H-18.5A1.5,1.5,0,0,1-20,13.5V2.5A1.5,1.5,0,0,1-18.5,1h.909V5.955a.5.5,0,0,0,.5.5h7.5a.5.5,0,0,0,.5-.5v-4.8a1.492,1.492,0,0,1,.414.285l2.238,2.238A1.511,1.511,0,0,1-6,4.737Z" transform="translate(21)" /></svg>
                  Save
                </button>
              </div>
            </div>
            <div className="shrink-0">
              <KeyboardWithNumpad
                value={tableLocationName}
                onChange={setTableLocationName}
                selectionStart={tableLocationSelectionStart}
                selectionEnd={tableLocationSelectionEnd}
                onSelectionChange={(start, end) => {
                  setTableLocationSelectionStart(start);
                  setTableLocationSelectionEnd(end);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {showSetTablesModal && topNavId === 'tables' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative bg-pos-bg rounded-xl border border-pos-border shadow-2xl max-w-[1600px] w-full h-[1040px] overflow-hidden flex">
            <button
              type="button"
              className="absolute top-4 right-4 z-20 p-2 rounded text-pos-muted hover:text-pos-text hover:bg-pos-panel"
              onClick={closeSetTablesModal}
              aria-label="Close"
            >
              <svg className="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="w-[420px] shrink-0 border-r border-pos-border bg-black px-6 py-8 overflow-auto">
              <h3 className="text-pos-text text-2xl font-semibold mb-6">
                {tr('control.tables.setTables', 'Set tables')} - {setTablesLocationName || 'Restaurant'}
              </h3>

              <div className="space-y-4 text-pos-text text-xl">
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button type="button" className="px-3 py-3 rounded border border-pos-border bg-pos-panel hover:bg-pos-bg" onClick={addSetTable}>
                    + {tr('control.tables.table', 'table')}
                  </button>
                  <button type="button" className="px-3 py-2 rounded border border-pos-border bg-pos-panel hover:bg-pos-bg" onClick={removeSetTable}>
                    - {tr('control.tables.table', 'table')}
                  </button>
                  <button
                    type="button"
                    className="px-3 py-2 rounded border border-pos-border bg-pos-panel hover:bg-pos-bg"
                    onClick={handleAddBoard}
                    disabled={!setTablesSelectedTableId}
                  >
                    + {tr('control.tables.board', 'board')}
                  </button>
                  <button
                    type="button"
                    className="px-3 py-2 rounded border border-pos-border bg-pos-panel hover:bg-pos-bg"
                    onClick={handleRemoveBoard}
                    disabled={!setTablesSelectedTableId || boards.length === 0}
                  >
                    - {tr('control.tables.board', 'board')}
                  </button>
                  <button
                    type="button"
                    className="px-3 py-2 rounded border border-pos-border bg-pos-panel hover:bg-pos-bg"
                    onClick={handleAddFlowerPot}
                    disabled={!setTablesSelectedTableId}
                  >
                    + flower pot
                  </button>
                  <button
                    type="button"
                    className="px-3 py-2 rounded border border-pos-border bg-pos-panel hover:bg-pos-bg"
                    onClick={handleRemoveFlowerPot}
                    disabled={!setTablesSelectedTableId || flowerPots.length === 0}
                  >
                    - flower pot
                  </button>
                </div>
                <div className="h-px bg-pos-border my-3" />

                {!selectedSetBoard && !selectedSetFlowerPot ? (
                  <>
                    <div className="flex items-center gap-3">
                      <span className="w-[120px] shrink-0">{tr('name', 'Name')}</span>
                      <input
                        type="text"
                        value={selectedSetTable?.name || ''}
                        onChange={(e) => updateSelectedSetTable({ name: e.target.value })}
                        className="flex-1 px-3 py-2 rounded bg-pos-panel border border-pos-border text-pos-text"
                      />
                    </div>

                    {[
                      { key: 'x', label: 'x' },
                      { key: 'y', label: 'y' },
                      { key: 'width', label: tr('control.tables.width', 'Width') },
                      ...(!selectedSetTable?.round ? [{ key: 'height', label: tr('control.tables.height', 'Height') }] : [])
                    ].map((field) => (
                      <div key={field.key} className="flex items-center gap-3">
                        <span className="w-[120px] shrink-0">{field.label}</span>
                        <input
                          type="number"
                          value={selectedSetTable ? selectedSetTable[field.key] : 0}
                          onChange={(e) => {
                            const nextVal = Number(e.target.value);
                            const safe = Number.isFinite(nextVal) ? nextVal : 0;
                            if (field.key === 'width') updateSelectedSetTable({ width: Math.max(60, safe) });
                            else if (field.key === 'height') updateSelectedSetTable({ height: Math.max(40, safe) });
                            else updateSelectedSetTable({ [field.key]: safe });
                          }}
                          className="w-[120px] px-3 py-2 rounded bg-pos-panel border border-pos-border text-pos-text"
                        />
                        <button
                          type="button"
                          className="w-10 h-10 rounded bg-pos-panel border border-pos-border hover:bg-pos-bg"
                          onClick={() => {
                            const current = Number(selectedSetTable?.[field.key]) || 0;
                            const nextVal = current - 10;
                            if (field.key === 'width') updateSelectedSetTable({ width: Math.max(60, nextVal) });
                            else if (field.key === 'height') updateSelectedSetTable({ height: Math.max(40, nextVal) });
                            else updateSelectedSetTable({ [field.key]: nextVal });
                          }}
                        >
                          -
                        </button>
                        <button
                          type="button"
                          className="w-10 h-10 rounded bg-pos-panel border border-pos-border hover:bg-pos-bg"
                          onClick={() => {
                            const current = Number(selectedSetTable?.[field.key]) || 0;
                            const nextVal = current + 10;
                            if (field.key === 'width') updateSelectedSetTable({ width: Math.max(60, nextVal) });
                            else if (field.key === 'height') updateSelectedSetTable({ height: Math.max(40, nextVal) });
                            else updateSelectedSetTable({ [field.key]: nextVal });
                          }}
                        >
                          +
                        </button>
                      </div>
                    ))}

                    <div className="flex items-center gap-3 w-full justify-between">
                      <span className="w-[120px] shrink-0">{tr('control.tables.rotation', 'Rotation')}</span>
                      <input
                        type="range"
                        min={0}
                        max={360}
                        value={selectedSetTable?.rotation ?? 0}
                        onChange={(e) => updateSelectedSetTable({ rotation: Number(e.target.value) || 0 })}
                        className="flex-1"
                      />
                      <input
                        type="number"
                        min={0}
                        max={360}
                        value={selectedSetTable?.rotation ?? 0}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          const clamped = Number.isFinite(v) ? Math.min(360, Math.max(0, v)) : 0;
                          updateSelectedSetTable({ rotation: clamped });
                        }}
                        className="min-w-[40px] max-w-[80px] px-2 py-2 rounded bg-pos-panel border border-pos-border text-pos-text text-left"
                      />
                    </div>

                    <label className="flex items-center gap-3">
                      <span className="w-[120px] shrink-0">{tr('control.tables.round', 'Round')}</span>
                      <input
                        type="checkbox"
                        checked={!!selectedSetTable?.round}
                        onChange={(e) => updateSelectedSetTable({ round: e.target.checked })}
                        className="w-7 h-7"
                      />
                    </label>

                    <div className="h-px bg-pos-border my-3" />
                  </>
                ) : null}

                {selectedSetBoard ? (
                  <div className="space-y-3 pt-2">
                    {[
                      { key: 'x', label: 'board x' },
                      { key: 'y', label: 'board y' },
                      { key: 'width', label: tr('control.tables.width', 'Width') },
                      { key: 'height', label: tr('control.tables.height', 'Height') }
                    ].map((field) => (
                      <div key={`board-${field.key}`} className="flex items-center gap-3">
                        <span className="w-[120px] shrink-0">{field.label}</span>
                        <input
                          type="number"
                          value={selectedSetBoard[field.key]}
                          onChange={(e) => {
                            const nextVal = Number(e.target.value);
                            const safe = Number.isFinite(nextVal) ? nextVal : 0;
                            if (field.key === 'width') updateSelectedSetBoard({ width: Math.max(10, safe) });
                            else if (field.key === 'height') updateSelectedSetBoard({ height: Math.max(10, safe) });
                            else updateSelectedSetBoard({ [field.key]: safe });
                          }}
                          className="w-[120px] px-3 py-2 rounded bg-pos-panel border border-pos-border text-pos-text"
                        />
                        <button
                          type="button"
                          className="w-10 h-10 rounded bg-pos-panel border border-pos-border hover:bg-pos-bg"
                          onClick={() => {
                            const current = Number(selectedSetBoard[field.key]) || 0;
                            const nextVal = current - 10;
                            if (field.key === 'width') updateSelectedSetBoard({ width: Math.max(10, nextVal) });
                            else if (field.key === 'height') updateSelectedSetBoard({ height: Math.max(10, nextVal) });
                            else updateSelectedSetBoard({ [field.key]: nextVal });
                          }}
                        >
                          -
                        </button>
                        <button
                          type="button"
                          className="w-10 h-10 rounded bg-pos-panel border border-pos-border hover:bg-pos-bg"
                          onClick={() => {
                            const current = Number(selectedSetBoard[field.key]) || 0;
                            const nextVal = current + 10;
                            if (field.key === 'width') updateSelectedSetBoard({ width: Math.max(10, nextVal) });
                            else if (field.key === 'height') updateSelectedSetBoard({ height: Math.max(10, nextVal) });
                            else updateSelectedSetBoard({ [field.key]: nextVal });
                          }}
                        >
                          +
                        </button>
                      </div>
                    ))}
                    <div className="flex items-center gap-3">
                      <span className="w-[120px] shrink-0">{tr('control.tables.rotation', 'Rotation')}</span>
                      <input
                        type="range"
                        min={0}
                        max={360}
                        value={selectedSetBoard.rotation ?? 0}
                        onChange={(e) => updateSelectedSetBoard({ rotation: Number(e.target.value) || 0 })}
                        className="flex-1"
                      />
                      <input
                        type="number"
                        min={0}
                        max={360}
                        value={selectedSetBoard.rotation ?? 0}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          const clamped = Number.isFinite(v) ? Math.min(360, Math.max(0, v)) : 0;
                          updateSelectedSetBoard({ rotation: clamped });
                        }}
                        className="min-w-[40px] max-w-[80px] px-2 py-2 rounded bg-pos-panel border border-pos-border text-pos-text text-left"
                      />
                    </div>
                  </div>
                ) : null}

                {selectedSetFlowerPot ? (
                  <div className="space-y-3 pt-2">
                    <div className="text-pos-text font-medium">{tr('control.tables.flowerPot', 'Flower pot')}</div>
                    {[
                      { key: 'x', label: 'flower pot x' },
                      { key: 'y', label: 'flower pot y' },
                      { key: 'width', label: tr('control.tables.width', 'Width') },
                      { key: 'height', label: tr('control.tables.height', 'Height') }
                    ].map((field) => (
                      <div key={`flowerpot-${field.key}`} className="flex items-center gap-3">
                        <span className="w-[120px] shrink-0">{field.label}</span>
                        <input
                          type="number"
                          value={selectedSetFlowerPot[field.key]}
                          onChange={(e) => {
                            const nextVal = Number(e.target.value);
                            const safe = Number.isFinite(nextVal) ? nextVal : 0;
                            if (field.key === 'width') updateSelectedSetFlowerPot({ width: Math.max(10, safe) });
                            else if (field.key === 'height') updateSelectedSetFlowerPot({ height: Math.max(10, safe) });
                            else updateSelectedSetFlowerPot({ [field.key]: safe });
                          }}
                          className="w-[120px] px-3 py-2 rounded bg-pos-panel border border-pos-border text-pos-text"
                        />
                        <button
                          type="button"
                          className="w-10 h-10 rounded bg-pos-panel border border-pos-border hover:bg-pos-bg"
                          onClick={() => {
                            const current = Number(selectedSetFlowerPot[field.key]) || 0;
                            const nextVal = current - 10;
                            if (field.key === 'width') updateSelectedSetFlowerPot({ width: Math.max(10, nextVal) });
                            else if (field.key === 'height') updateSelectedSetFlowerPot({ height: Math.max(10, nextVal) });
                            else updateSelectedSetFlowerPot({ [field.key]: nextVal });
                          }}
                        >
                          -
                        </button>
                        <button
                          type="button"
                          className="w-10 h-10 rounded bg-pos-panel border border-pos-border hover:bg-pos-bg"
                          onClick={() => {
                            const current = Number(selectedSetFlowerPot[field.key]) || 0;
                            const nextVal = current + 10;
                            if (field.key === 'width') updateSelectedSetFlowerPot({ width: Math.max(10, nextVal) });
                            else if (field.key === 'height') updateSelectedSetFlowerPot({ height: Math.max(10, nextVal) });
                            else updateSelectedSetFlowerPot({ [field.key]: nextVal });
                          }}
                        >
                          +
                        </button>
                      </div>
                    ))}
                    <div className="flex items-center gap-3">
                      <span className="w-[120px] shrink-0">{tr('control.tables.rotation', 'Rotation')}</span>
                      <input
                        type="range"
                        min={0}
                        max={360}
                        value={selectedSetFlowerPot.rotation ?? 0}
                        onChange={(e) => updateSelectedSetFlowerPot({ rotation: Number(e.target.value) || 0 })}
                        className="flex-1"
                      />
                      <input
                        type="number"
                        min={0}
                        max={360}
                        value={selectedSetFlowerPot.rotation ?? 0}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          const clamped = Number.isFinite(v) ? Math.min(360, Math.max(0, v)) : 0;
                          updateSelectedSetFlowerPot({ rotation: clamped });
                        }}
                        className="min-w-[40px] max-w-[80px] px-2 py-2 rounded bg-pos-panel border border-pos-border text-pos-text text-left"
                      />
                    </div>
                  </div>
                ) : null}

                <div className="pt-4 flex gap-3 w-full justify-center">
                  <button
                    type="button"
                    className="px-5 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                    onClick={saveSetTablesLayout}
                  >
                    {tr('control.save', 'Save')}
                  </button>
                  <button
                    type="button"
                    className="px-5 py-2 rounded-lg bg-pos-panel border border-pos-border text-pos-text hover:bg-pos-bg"
                    onClick={closeSetTablesModal}
                  >
                    {tr('cancel', 'Cancel')}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 min-w-0 bg-[#1f2b36] p-6">
              <div ref={setTablesCanvasRef} className="w-full h-full rounded-lg border border-pos-border bg-[#2f3e50] relative overflow-hidden">
                {setTablesDraft.tables.map((table) => {
                  const template = TABLE_TEMPLATE_OPTIONS.find((item) => item.id === table.templateType) || null;
                  const sizeStyle = table.round
                    ? { width: `${Math.max(70, table.width)}px`, height: `${Math.max(70, table.width)}px` }
                    : { width: `${table.width}px`, height: `${table.height}px` };
                  return (
                    <button
                      key={table.id}
                      type="button"
                      className={`absolute flex items-center justify-center font-semibold border-2 text-white transition-colors overflow-hidden ${table.round
                        ? 'rounded-full border-transparent bg-transparent'
                        : 'rounded-md border-transparent bg-transparent'
                        } ${setTablesSelectedTableId === table.id && selectedSetBoardIndex == null && selectedSetFlowerPotIndex == null ? 'ring-4 ring-yellow-400' : ''} ${setTablesDraggingId === table.id ? 'cursor-grabbing' : 'cursor-grab'}`}
                      style={{
                        left: `${Math.max(0, table.x)}px`,
                        top: `${Math.max(0, table.y)}px`,
                        transform: `rotate(${table.rotation || 0}deg)`,
                        zIndex: 20,
                        ...sizeStyle
                      }}
                      onClick={() => {
                        setSetTablesSelectedTableId(table.id);
                        setSetTablesSelectedBoardIndex(null);
                        setSetTablesSelectedFlowerPotIndex(null);
                      }}
                      onMouseDown={(event) => startSetTableDrag(event, table)}
                    >
                      {template ? (
                        <img src={template.src} alt={table.name} className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
                      ) : null}
                      <span className="relative z-10 drop-shadow-[0_1px_1px_rgba(0,0,0,0.7)]">{table.name}</span>
                    </button>
                  );
                })}
                {setTablesDraft.tables.flatMap((table) =>
                  (Array.isArray(table.boards) ? table.boards : []).map((board, idx) => {
                    const isSelected = setTablesSelectedTableId === table.id && setTablesSelectedBoardIndex === idx;
                    const isDraggingBoard = setTablesDraggingId === table.id && setTablesDraggingType === 'board' && setTablesDragRef.current?.boardIndex === idx;
                    return (
                      <button
                        key={board.id || `board-${table.id}-${idx}`}
                        type="button"
                        className={`absolute border-2 ${isSelected ? 'border-yellow-300' : 'border-transparent'} ${isDraggingBoard ? 'cursor-grabbing' : 'cursor-grab'}`}
                        style={{
                          left: `${Math.max(0, Number(board.x) || 0)}px`,
                          top: `${Math.max(0, Number(board.y) || 0)}px`,
                          width: `${Math.max(10, Number(board.width) || 10)}px`,
                          height: `${Math.max(10, Number(board.height) || 10)}px`,
                          transform: `rotate(${Number(board.rotation) || 0}deg)`,
                          zIndex: 10,
                          backgroundColor: board.color || '#facc15',
                          opacity: 0.55
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSetTablesSelectedTableId(table.id);
                          setSetTablesSelectedBoardIndex(idx);
                          setSetTablesSelectedFlowerPotIndex(null);
                        }}
                        onMouseDown={(event) => startSetBoardDrag(event, table, idx)}
                      />
                    );
                  })
                )}
                {setTablesDraft.tables.flatMap((table) =>
                  (Array.isArray(table.flowerPots) ? table.flowerPots : []).map((fp, idx) => {
                    const isSelected = setTablesSelectedTableId === table.id && setTablesSelectedFlowerPotIndex === idx;
                    const isDragging = setTablesDraggingId === table.id && setTablesDraggingType === 'flowerPot' && setTablesDragRef.current?.flowerPotIndex === idx;
                    return (
                      <button
                        key={fp.id || `flowerpot-${table.id}-${idx}`}
                        type="button"
                        className={`absolute border-2 ${isSelected ? 'border-yellow-300' : 'border-transparent'} ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                        style={{
                          left: `${Math.max(0, Number(fp.x) || 0)}px`,
                          top: `${Math.max(0, Number(fp.y) || 0)}px`,
                          width: `${Math.max(10, Number(fp.width) || 10)}px`,
                          height: `${Math.max(10, Number(fp.height) || 10)}px`,
                          transform: `rotate(${Number(fp.rotation) || 0}deg)`,
                          zIndex: 15
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSetTablesSelectedTableId(table.id);
                          setSetTablesSelectedBoardIndex(null);
                          setSetTablesSelectedFlowerPotIndex(idx);
                        }}
                        onMouseDown={(event) => startSetFlowerPotDrag(event, table, idx)}
                      >
                        <img src="/flowerpot.svg" alt="Flower pot" className="w-full h-full object-contain pointer-events-none" />
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showSetTableTypeModal && showSetTablesModal && topNavId === 'tables' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-pos-bg rounded-xl border border-pos-border shadow-2xl max-w-[900px] w-full p-8">
            <div className="grid grid-cols-3 gap-6">
              {TABLE_TEMPLATE_OPTIONS.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  className="rounded-xl border border-pos-border bg-pos-panel hover:bg-pos-bg p-5 flex flex-col items-center gap-4"
                  onClick={() => addSetTableWithTemplate(template.id)}
                >
                  <img src={template.src} alt={template.id} className="w-[170px] h-[170px] object-contain" />
                </button>
              ))}
            </div>
            <div className="flex justify-center mt-8">
              <button
                type="button"
                className="px-6 py-3 rounded-lg bg-pos-panel border border-pos-border text-pos-text hover:bg-pos-bg text-xl"
                onClick={() => setShowSetTableTypeModal(false)}
              >
                {tr('cancel', 'Cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSetBoardColorModal && showSetTablesModal && topNavId === 'tables' && (
        <div className="fixed inset-0 z-[61] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-pos-bg rounded-xl border border-pos-border shadow-2xl max-w-[640px] w-full p-8">
            <h3 className="text-pos-text text-3xl font-semibold text-center mb-8">
              {tr('control.tables.chooseBoardColor', 'Choose board color')}
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {TABLE_BOARD_COLOR_OPTIONS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className="h-16 rounded-lg border-2 border-pos-border"
                  style={{ backgroundColor: color }}
                  onClick={() => handleSelectBoardColor(color)}
                  aria-label={`Board color ${color}`}
                />
              ))}
            </div>
            <div className="flex justify-center mt-8 gap-3">
              <button
                type="button"
                className="px-6 py-3 rounded-lg bg-pos-panel border border-pos-border text-pos-text hover:bg-pos-bg text-xl"
                onClick={() => setShowSetBoardColorModal(false)}
              >
                {tr('cancel', 'Cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Device Settings modal */}
      {showDeviceSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative text-2xl bg-pos-bg rounded-xl shadow-2xl max-w-[1430px] h-[1000px] w-full mx-4 overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="absolute top-4 right-4 z-10 p-2 rounded text-pos-muted hover:text-pos-text hover:bg-pos-panel" onClick={() => setShowDeviceSettingsModal(false)} aria-label="Close">
              <svg className="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="flex mt-[70px] mb-14 px-28 w-full justify-around text-2xl shrink-0 overflow-x-auto">
              {DEVICE_SETTINGS_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`px-4 py-3 font-medium whitespace-nowrap border-b-2 transition-colors ${deviceSettingsTab === tab ? 'border-blue-500 text-pos-text' : 'border-transparent text-pos-muted hover:text-pos-text'}`}
                  onClick={() => setDeviceSettingsTab(tab)}
                >
                  {tr(DEVICE_SETTINGS_TAB_LABEL_KEYS[tab], tab)}
                </button>
              ))}
            </div>
            <div className="p-6 overflow-auto flex-1">
              {deviceSettingsTab === 'General' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                  <div className="flex flex-col gap-8">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <span className="text-pos-text w-[500px]">Use of subproducts:</span>
                      <input type="checkbox" checked={deviceUseSubproducts} onChange={(e) => setDeviceUseSubproducts(e.target.checked)} className="w-10 h-10 rounded border-gray-400" />
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <span className="text-pos-text w-[500px]">Automatically log out after transaction:</span>
                      <input type="checkbox" checked={deviceAutoLogoutAfterTransaction} onChange={(e) => setDeviceAutoLogoutAfterTransaction(e.target.checked)} className="w-10 h-10 rounded border-gray-400" />
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <span className="text-pos-text w-[500px]">Automatically return to table plan:</span>
                      <input type="checkbox" checked={deviceAutoReturnToTablePlan} onChange={(e) => setDeviceAutoReturnToTablePlan(e.target.checked)} className="w-10 h-10 rounded border-gray-400" />
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <span className="text-pos-text w-[500px]">Disable cash button in payment popup:</span>
                      <input type="checkbox" checked={deviceDisableCashButtonInPayment} onChange={(e) => setDeviceDisableCashButtonInPayment(e.target.checked)} className="w-10 h-10 rounded border-gray-400" />
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <span className="text-pos-text w-[500px]">Open price without popup and without comma:</span>
                      <input type="checkbox" checked={deviceOpenPriceWithoutPopup} onChange={(e) => setDeviceOpenPriceWithoutPopup(e.target.checked)} className="w-10 h-10 rounded border-gray-400" />
                    </label>
                  </div>
                  <div className="flex flex-col gap-8">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <span className="text-pos-text w-[400px]">Open cash drawer after order:</span>
                      <input type="checkbox" checked={deviceOpenCashDrawerAfterOrder} onChange={(e) => setDeviceOpenCashDrawerAfterOrder(e.target.checked)} className="w-10 h-10 rounded border-gray-400" />
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <span className="text-pos-text w-[400px]">Automatically return to counter sale:</span>
                      <input type="checkbox" checked={deviceAutoReturnToCounterSale} onChange={(e) => setDeviceAutoReturnToCounterSale(e.target.checked)} className="w-10 h-10 rounded border-gray-400" />
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <span className="text-pos-text w-[400px]">Ask to send to the kitchen screen:</span>
                      <input type="checkbox" checked={deviceAskSendToKitchen} onChange={(e) => setDeviceAskSendToKitchen(e.target.checked)} className="w-10 h-10 rounded border-gray-400" />
                    </label>
                    <div className="flex items-center gap-3">
                      <span className="text-pos-text w-[400px] shrink-0">Toogverkoop btw:</span>
                      <Dropdown options={VAT_OPTIONS} value={deviceCounterSaleVat} onChange={setDeviceCounterSaleVat} placeholder="Select" className="text-xl min-w-[180px]" />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-pos-text w-[400px] shrink-0">Tafelverkoop btw:</span>
                      <Dropdown options={VAT_OPTIONS} value={deviceTableSaleVat} onChange={setDeviceTableSaleVat} placeholder="Select" className="text-xl min-w-[180px]" />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-pos-text w-[400px] shrink-0">Timeout log out:</span>
                      <div className="flex items-center gap-2">
                        <button type="button" className="p-1 px-3 rounded bg-pos-panel border border-pos-border text-pos-text hover:bg-pos-bg text-3xl" onClick={() => setDeviceTimeoutLogout((n) => Math.max(0, n - 1))}>−</button>
                        <input type="number" min={0} value={deviceTimeoutLogout} onChange={(e) => setDeviceTimeoutLogout(Number(e.target.value) || 0)} className="w-20 px-3 py-2 bg-pos-panel border border-pos-border rounded text-pos-text text-xl text-center" />
                        <button type="button" className="p-1 px-3 rounded bg-pos-panel border border-pos-border text-pos-text hover:bg-pos-bg text-3xl" onClick={() => setDeviceTimeoutLogout((n) => n + 1)}>+</button>
                      </div>
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <span className="text-pos-text w-[400px]">Fixed edge: (Windows)</span>
                      <input type="checkbox" checked={deviceFixedBorder} onChange={(e) => setDeviceFixedBorder(e.target.checked)} className="w-10 h-10 rounded border-gray-400" />
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <span className="text-pos-text w-[400px]">Always in the foreground: (Windows)</span>
                      <input type="checkbox" checked={deviceAlwaysOnTop} onChange={(e) => setDeviceAlwaysOnTop(e.target.checked)} className="w-10 h-10 rounded border-gray-400" />
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-3 cursor-pointer shrink-0">
                        <span className="text-pos-text w-[400px]">Ask a question about an invoice or ticket</span>
                        <input type="checkbox" checked={deviceAskInvoiceOrTicket} onChange={(e) => setDeviceAskInvoiceOrTicket(e.target.checked)} className="w-10 h-10 rounded border-gray-400" />
                      </label>
                      <Dropdown options={[{ value: '-', label: '-' }]} value="-" onChange={() => { }} placeholder="-" className="text-xl min-w-[120px] opacity-60 pointer-events-none" disabled />
                    </div>
                  </div>
                </div>
              )}
              {deviceSettingsTab === 'Printer' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                  <div className="flex flex-col gap-8">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <span className="text-pos-text w-[500px]">Grouping products on the ticket:</span>
                      <input type="checkbox" checked={devicePrinterGroupingProducts} onChange={(e) => setDevicePrinterGroupingProducts(e.target.checked)} className="w-10 h-10 rounded border-gray-400" />
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <span className="text-pos-text w-[500px]">Display error screen on printer error:</span>
                      <input type="checkbox" checked={devicePrinterShowErrorScreen} onChange={(e) => setDevicePrinterShowErrorScreen(e.target.checked)} className="w-10 h-10 rounded border-gray-400" />
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <span className="text-pos-text w-[500px]">Print production message on VAT ticket:</span>
                      <input type="checkbox" checked={devicePrinterProductionMessageOnVat} onChange={(e) => setDevicePrinterProductionMessageOnVat(e.target.checked)} className="w-10 h-10 rounded border-gray-400" />
                    </label>
                    <div className="flex items-center gap-3">
                      <span className="text-pos-text w-[500px] shrink-0">Next course order:</span>
                      <Dropdown options={PRINTING_ORDER_OPTIONS} value={devicePrinterNextCourseOrder} onChange={setDevicePrinterNextCourseOrder} placeholder="Print order" className="text-xl min-w-[180px]" />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-pos-text w-[500px] shrink-0">Standard mode ticket printing:</span>
                      <Dropdown options={GROUPING_RECEIPT_OPTIONS} value={devicePrinterStandardMode} onChange={setDevicePrinterStandardMode} placeholder="Enable" className="text-xl min-w-[180px]" />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-pos-text w-[500px] shrink-0">QR order printer:</span>
                      <Dropdown
                        options={[{ value: '', label: 'Disabled' }, ...printers.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)).map((p) => ({ value: p.id, label: p.name }))]}
                        value={devicePrinterQROrderPrinter}
                        onChange={setDevicePrinterQROrderPrinter}
                        placeholder="Select printer"
                        className="text-xl min-w-[180px]"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-8">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <span className="text-pos-text w-[400px]">Reprint products with next course:</span>
                      <input type="checkbox" checked={devicePrinterReprintWithNextCourse} onChange={(e) => setDevicePrinterReprintWithNextCourse(e.target.checked)} className="w-10 h-10 rounded border-gray-400" />
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <span className="text-pos-text w-[400px]">Print 0 euro tickets:</span>
                      <input type="checkbox" checked={devicePrinterPrintZeroTickets} onChange={(e) => setDevicePrinterPrintZeroTickets(e.target.checked)} className="w-10 h-10 rounded border-gray-400" />
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <span className="text-pos-text w-[400px]">Print gift voucher at minimum amount:</span>
                      <input type="checkbox" checked={devicePrinterGiftVoucherAtMin} onChange={(e) => setDevicePrinterGiftVoucherAtMin(e.target.checked)} className="w-10 h-10 rounded border-gray-400" />
                    </label>
                  </div>
                </div>
              )}
              {deviceSettingsTab === 'Category display' && (
                <div className="grid grid-cols-1 px-20 md:grid-cols-3 lg:grid-cols-4 gap-x-12 gap-4">
                  {categoriesLoading ? (
                    <p className="text-pos-muted text-xl col-span-full">Loading categories…</p>
                  ) : (
                    categories.map((cat) => {
                      const isChecked = deviceCategoryDisplayIds.length === 0 || deviceCategoryDisplayIds.includes(cat.id);
                      return (
                        <label key={cat.id} className="flex items-center gap-5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setDeviceCategoryDisplayIds((prev) => {
                                const allIds = categories.map((c) => c.id);
                                if (prev.length === 0) return allIds.filter((id) => id !== cat.id);
                                if (prev.includes(cat.id)) return prev.filter((id) => id !== cat.id);
                                return [...prev, cat.id];
                              });
                            }}
                            className="w-10 h-10 rounded border-gray-400"
                          />
                          <span className="text-pos-text w-[280px] truncate">{cat.name || cat.id}</span>
                        </label>
                      );
                    })
                  )}
                </div>
              )}
              {deviceSettingsTab === 'Orders in waiting' && (
                <div className="grid px-20 grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                  <div className="flex flex-col gap-8">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <span className="text-pos-text w-[500px]">Confirm on hold orders:</span>
                      <input type="checkbox" checked={deviceOrdersConfirmOnHold} onChange={(e) => setDeviceOrdersConfirmOnHold(e.target.checked)} className="w-10 h-10 rounded border-gray-400" />
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <span className="text-pos-text w-[500px]">Print barcode ticket after order creation:</span>
                      <input type="checkbox" checked={deviceOrdersPrintBarcodeAfterCreate} onChange={(e) => setDeviceOrdersPrintBarcodeAfterCreate(e.target.checked)} className="w-10 h-10 rounded border-gray-400" />
                    </label>
                  </div>
                  <div className="flex flex-col gap-8">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <span className="text-pos-text w-[500px]">Customer on hold order can be modified:</span>
                      <input type="checkbox" checked={deviceOrdersCustomerCanBeModified} onChange={(e) => setDeviceOrdersCustomerCanBeModified(e.target.checked)} className="w-10 h-10 rounded border-gray-400" />
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <span className="text-pos-text w-[500px]">Book table to waiting order:</span>
                      <input type="checkbox" checked={deviceOrdersBookTableToWaiting} onChange={(e) => setDeviceOrdersBookTableToWaiting(e.target.checked)} className="w-10 h-10 rounded border-gray-400" />
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <span className="text-pos-text w-[500px]">Fast customer name on hold orders:</span>
                      <input type="checkbox" checked={deviceOrdersFastCustomerName} onChange={(e) => setDeviceOrdersFastCustomerName(e.target.checked)} className="w-10 h-10 rounded border-gray-400" />
                    </label>
                  </div>
                </div>
              )}
              {deviceSettingsTab === 'Scheduled orders' && (
                <div className="grid grid-cols-1 md:grid-cols-2 px-20 gap-x-12 gap-y-4">
                  <div className="flex flex-col gap-8">
                    <div className="flex items-center gap-5">
                      <span className="text-pos-text w-[350px] shrink-0">Scheduled orders printer:</span>
                      <Dropdown
                        options={[{ value: '', label: 'Disabled' }, ...printers.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)).map((p) => ({ value: p.id, label: p.name }))]}
                        value={deviceScheduledPrinter}
                        onChange={setDeviceScheduledPrinter}
                        placeholder="Select printer"
                        className="text-xl min-w-[200px] max-w-[200px]"
                      />
                    </div>
                    <div className="flex items-center gap-5">
                      <span className="text-pos-text w-[350px] shrink-0">Scheduled orders production ticket flow:</span>
                      <Dropdown options={SCHEDULED_ORDERS_PRODUCTION_FLOW_OPTIONS} value={deviceScheduledProductionFlow} onChange={setDeviceScheduledProductionFlow} placeholder="Select" className="text-xl min-w-[200px] max-w-[200px]" />
                    </div>
                    <div className="flex items-center gap-5">
                      <span className="text-pos-text w-[350px] shrink-0">Scheduled orders loading:</span>
                      <Dropdown options={SCHEDULED_ORDERS_LOADING_OPTIONS} value={deviceScheduledLoading} onChange={setDeviceScheduledLoading} placeholder="Select" className="text-xl min-w-[200px] max-w-[200px]" />
                    </div>
                    <div className="flex items-center gap-5">
                      <span className="text-pos-text w-[350px] shrink-0">Scheduled order mode:</span>
                      <Dropdown options={SCHEDULED_ORDERS_MODE_OPTIONS} value={deviceScheduledMode} onChange={setDeviceScheduledMode} placeholder="Select" className="text-xl min-w-[200px] max-w-[200px]" />
                    </div>
                    <div className="flex items-center gap-5">
                      <span className="text-pos-text w-[350px] shrink-0">Scheduled order invoice layout:</span>
                      <Dropdown options={SCHEDULED_ORDERS_INVOICE_LAYOUT_OPTIONS} value={deviceScheduledInvoiceLayout} onChange={setDeviceScheduledInvoiceLayout} placeholder="Select" className="text-xl min-w-[200px] max-w-[200px]" />
                    </div>
                    <div className="flex items-center gap-5">
                      <span className="text-pos-text w-[350px] shrink-0">Scheduled order checkout at:</span>
                      <Dropdown options={SCHEDULED_ORDERS_CHECKOUT_AT_OPTIONS} value={deviceScheduledCheckoutAt} onChange={setDeviceScheduledCheckoutAt} placeholder="Select" className="text-xl min-w-[200px] max-w-[200px]" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-8">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <span className="text-pos-text w-[400px]">Print barcode label:</span>
                      <input type="checkbox" checked={deviceScheduledPrintBarcodeLabel} onChange={(e) => setDeviceScheduledPrintBarcodeLabel(e.target.checked)} className="w-10 h-10 rounded border-gray-400" />
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <span className="text-pos-text w-[400px]">Add delivery note to turnover when printing:</span>
                      <input type="checkbox" checked={deviceScheduledDeliveryNoteToTurnover} onChange={(e) => setDeviceScheduledDeliveryNoteToTurnover(e.target.checked)} className="w-10 h-10 rounded border-gray-400" />
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <span className="text-pos-text w-[400px]">When new planning order print production receipt:</span>
                      <input type="checkbox" checked={deviceScheduledPrintProductionReceipt} onChange={(e) => setDeviceScheduledPrintProductionReceipt(e.target.checked)} className="w-10 h-10 rounded border-gray-400" />
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <span className="text-pos-text w-[400px]">When new planning order print customer production receipt:</span>
                      <input type="checkbox" checked={deviceScheduledPrintCustomerProductionReceipt} onChange={(e) => setDeviceScheduledPrintCustomerProductionReceipt(e.target.checked)} className="w-10 h-10 rounded border-gray-400" />
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <span className="text-pos-text w-[400px]">Automatically print scheduled web order production slip:</span>
                      <input type="checkbox" checked={deviceScheduledWebOrderAutoPrint} onChange={(e) => setDeviceScheduledWebOrderAutoPrint(e.target.checked)} className="w-10 h-10 rounded border-gray-400" />
                    </label>
                  </div>
                </div>
              )}
              {deviceSettingsTab === 'Option buttons' && (
                <div className="px-4 py-2">
                  <div className="mx-auto max-w-[1320px] flex gap-8">
                    <div className="flex-1 border border-[#aeb3bf] bg-[#d7d8de] px-3 py-5">
                      <div className="grid grid-cols-7 gap-3">
                        {Array.from({ length: OPTION_BUTTON_SLOT_COUNT }).map((_, slotIndex) => {
                          const assignedId = optionButtonSlots[slotIndex];
                          const assignedLabel = getOptionButtonLabel(assignedId);
                          const isSelected = selectedOptionButtonSlotIndex === slotIndex;
                          return (
                            <button
                              key={`option-slot-${slotIndex}`}
                              type="button"
                              draggable={!!assignedId && assignedId !== OPTION_BUTTON_LOCKED_ID}
                              onDragStart={(event) => handleOptionButtonDragStartFromSlot(event, slotIndex)}
                              onClick={() => setSelectedOptionButtonSlotIndex(slotIndex)}
                              onDragOver={(event) => event.preventDefault()}
                              onDrop={(event) => handleOptionButtonDropOnSlot(event, slotIndex)}
                              className={`h-[74px] max-w-[120px] min-w-[120px] border px-2 text-center text-[18px] leading-[1.2] whitespace-pre-line transition-colors ${assignedId ? 'bg-[#b7b9c2] text-[#31353d]' : 'bg-[#dde0e7] text-transparent'
                                } ${isSelected ? 'border-blue-500' : 'border-[#bcc0ca]'} hover:brightness-95`}
                            >
                              {assignedLabel || ' '}
                            </button>
                          );
                        })}
                      </div>
                      <div className="mt-10 text-center">
                        <button
                          type="button"
                          onClick={handleRemoveOptionButtonFromSlot}
                          disabled={!hasSelectedRemovableOptionButton}
                          className={`text-[20px] ${hasSelectedRemovableOptionButton
                            ? 'text-[#858d99] hover:text-[#5c6370]'
                            : 'text-[#9ca3af] opacity-60 cursor-not-allowed'
                            }`}
                        >
                          {tr('control.optionButtons.removeFromPlace', 'Remove from place')}
                        </button>
                      </div>
                    </div>
                    <div className="w-[380px] border border-[#aeb3bf] bg-[#d7d8de] px-6 py-5 flex flex-col">
                      <div className="flex-1 overflow-auto space-y-4 text-center">
                        {unassignedOptionButtons.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            draggable
                            onDragStart={(event) => handleOptionButtonDragStart(event, item.id)}
                            className="w-full text-[16px] min-w-[250px] leading-[1.15] whitespace-pre-line text-[#4a505c] hover:text-[#2e333c] cursor-grab active:cursor-grabbing"
                          >
                            {tr(item.labelKey, item.fallbackLabel)}
                          </button>
                        ))}
                        {unassignedOptionButtons.length === 0 ? (
                          <div className="text-[32px] text-[#8a919e]">-</div>
                        ) : null}
                      </div>
                      <div className="pt-4 flex items-center justify-around text-[24px] text-[#596170]">
                        <span aria-hidden>↑</span>
                        <span aria-hidden>↓</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {deviceSettingsTab === 'Function buttons' && (
                <div className="px-8 py-2">
                  <div className="mx-auto max-w-[1300px] rounded-sm bg-[#7f7f84] p-6">
                    <div className="grid grid-cols-4 gap-6">
                      <button
                        type="button"
                        className="h-[62px] border border-[#a8a8ad] bg-transparent text-3xl text-white"
                      >
                        19:00
                      </button>
                      {Array.from({ length: FUNCTION_BUTTON_SLOT_COUNT }).map((_, slotIndex) => {
                        const assignedId = functionButtonSlots[slotIndex];
                        const assignedLabel = getFunctionButtonLabel(assignedId);
                        const isSelected = selectedFunctionButtonSlotIndex === slotIndex;
                        return (
                          <button
                            key={`function-slot-${slotIndex}`}
                            type="button"
                            onClick={() => setSelectedFunctionButtonSlotIndex(slotIndex)}
                            onDragOver={(event) => event.preventDefault()}
                            onDrop={(event) => handleFunctionButtonDropOnSlot(event, slotIndex)}
                            className={`h-[62px] border bg-transparent text-3xl text-white transition-colors ${isSelected ? 'border-blue-400' : 'border-[#a8a8ad]'
                              } hover:bg-white/10`}
                          >
                            {assignedLabel}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="mx-auto mt-8 max-w-[1030px] border border-[#9d9da3] bg-transparent py-6">
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={handleRemoveFunctionButtonFromSlot}
                        disabled={!hasSelectedFunctionButton}
                        className={`text-[30px] ${hasSelectedFunctionButton
                          ? 'text-[#8e959d] hover:text-[#b2b8be]'
                          : 'text-[#646d76] opacity-50 cursor-not-allowed'
                          }`}
                      >
                        {tr('control.functionButtons.removeFromPlace', 'Remove from place')}
                      </button>
                    </div>
                    <div className="mt-4 space-y-8 text-center flex flex-col">
                      {FUNCTION_BUTTON_ITEMS.filter((item) => !assignedFunctionButtonIds.has(item.id)).map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          draggable
                          onDragStart={(event) => handleFunctionButtonDragStart(event, item.id)}
                          className="text-[30px] text-gray hover:text-[#4b5d68] cursor-grab active:cursor-grabbing"
                        >
                          {tr(item.labelKey, item.fallbackLabel)}
                        </button>
                      ))}
                      {FUNCTION_BUTTON_ITEMS.filter((item) => !assignedFunctionButtonIds.has(item.id)).length === 0 ? (
                        <div className="text-[28px] text-[#54616b]">-</div>
                      ) : null}
                    </div>
                  </div>
                </div>
              )}
              {deviceSettingsTab !== 'General' && deviceSettingsTab !== 'Printer' && deviceSettingsTab !== 'Category display' && deviceSettingsTab !== 'Orders in waiting' && deviceSettingsTab !== 'Scheduled orders' && deviceSettingsTab !== 'Option buttons' && deviceSettingsTab !== 'Function buttons' && (
                <p className="text-pos-muted text-xl py-4">Settings for “{deviceSettingsTab}” will be available here.</p>
              )}
            </div>
            <div className="w-full flex items-center px-6 py-8 justify-center shrink-0">
              <button
                type="button"
                className="flex items-center gap-4 px-6 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 text-2xl"
                disabled={savingDeviceSettings}
                onClick={handleSaveDeviceSettings}
              >
                <svg fill="currentColor" width="24" height="24" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M-5.732,2.97-7.97.732a2.474,2.474,0,0,0-1.483-.7A.491.491,0,0,0-9.591,0H-18.5A2.5,2.5,0,0,0-21,2.5v11A2.5,2.5,0,0,0-18.5,16h11A2.5,2.5,0,0,0-5,13.5V4.737A2.483,2.483,0,0,0-5.732,2.97ZM-13,1V5.455h-3.591V1Zm-4.272,14V10.545h8.544V15ZM-6,13.5A1.5,1.5,0,0,1-7.5,15h-.228V10.045a.5.5,0,0,0-.5-.5h-9.544a.5.5,0,0,0-.5.5V15H-18.5A1.5,1.5,0,0,1-20,13.5V2.5A1.5,1.5,0,0,1-18.5,1h.909V5.955a.5.5,0,0,0,.5.5h7.5a.5.5,0,0,0,.5-.5v-4.8a1.492,1.492,0,0,1,.414.285l2.238,2.238A1.511,1.511,0,0,1-6,4.737Z" transform="translate(21)" /></svg>
                {tr('control.save', 'Save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* System Settings modal */}
      {showSystemSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative px-20 text-2xl bg-pos-bg rounded-xl shadow-2xl max-w-[1430px] h-[1000px] w-full mx-4 overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="absolute top-4 right-4 z-10 p-2 rounded text-pos-muted hover:text-pos-text hover:bg-pos-panel" onClick={() => setShowSystemSettingsModal(false)} aria-label="Close">
              <svg className="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="flex mt-[70px] mb-14 px-28 w-full justify-around text-2xl shrink-0 overflow-x-auto">
              {SYSTEM_SETTINGS_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`px-4 py-3 font-medium whitespace-nowrap border-b-2 transition-colors ${systemSettingsTab === tab ? 'border-blue-500 text-pos-text' : 'border-transparent text-pos-muted hover:text-pos-text'}`}
                  onClick={() => setSystemSettingsTab(tab)}
                >
                  {tr(SYSTEM_SETTINGS_TAB_LABEL_KEYS[tab], tab)}
                </button>
              ))}
            </div>
            <div className="p-6 overflow-auto flex-1">
              {systemSettingsTab === 'General' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                  <div className="flex flex-col gap-8">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <span className="text-pos-text w-[420px]">Use of stock management:</span>
                      <input type="checkbox" checked={sysUseStockManagement} onChange={(e) => setSysUseStockManagement(e.target.checked)} className="w-10 h-10 rounded border-gray-400" />
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <span className="text-pos-text w-[420px]">Use of price groups:</span>
                      <input type="checkbox" checked={sysUsePriceGroups} onChange={(e) => setSysUsePriceGroups(e.target.checked)} className="w-10 h-10 rounded border-gray-400" />
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <span className="text-pos-text w-[420px]">Log in without code:</span>
                      <input type="checkbox" checked={sysLoginWithoutCode} onChange={(e) => setSysLoginWithoutCode(e.target.checked)} className="w-10 h-10 rounded border-gray-400" />
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <span className="text-pos-text w-[420px]">Categories per register:</span>
                      <input type="checkbox" checked={sysCategorieenPerKassa} onChange={(e) => setSysCategorieenPerKassa(e.target.checked)} className="w-10 h-10 rounded border-gray-400" />
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <span className="text-pos-text w-[420px]">Automatically accept QR orders:</span>
                      <input type="checkbox" checked={sysAutoAcceptQROrders} onChange={(e) => setSysAutoAcceptQROrders(e.target.checked)} className="w-10 h-10 rounded border-gray-400" />
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <span className="text-pos-text w-[420px]">QR orders auto checkout:</span>
                      <input type="checkbox" checked={sysQrOrdersAutomatischAfrekenen} onChange={(e) => setSysQrOrdersAutomatischAfrekenen(e.target.checked)} className="w-10 h-10 rounded border-gray-400" />
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <span className="text-pos-text w-[420px]">Send only QR orders to kitchen screen:</span>
                      <input type="checkbox" checked={sysEnkelQROrdersKeukenscherm} onChange={(e) => setSysEnkelQROrdersKeukenscherm(e.target.checked)} className="w-10 h-10 rounded border-gray-400" />
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <span className="text-pos-text w-[420px]">16:9 aspect (Windows):</span>
                      <input type="checkbox" checked={sysAspect169Windows} onChange={(e) => setSysAspect169Windows(e.target.checked)} className="w-10 h-10 rounded border-gray-400" />
                    </label>
                    <div className="flex items-center gap-3">
                      <span className="text-pos-text w-[420px] shrink-0">VAT rate of various products:</span>
                      <Dropdown options={VAT_PERCENT_OPTIONS.filter((o) => o.value !== '')} value={sysVatRateVariousProducts} onChange={setSysVatRateVariousProducts} placeholder="Select" className="text-xl min-w-[130px]" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-8">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <span className="text-pos-text w-[400px]">Arrange products manually:</span>
                      <input type="checkbox" checked={sysArrangeProductsManually} onChange={(e) => setSysArrangeProductsManually(e.target.checked)} className="w-10 h-10 rounded border-gray-400" />
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <span className="text-pos-text w-[400px]">Limit one user per table:</span>
                      <input type="checkbox" checked={sysLimitOneUserPerTable} onChange={(e) => setSysLimitOneUserPerTable(e.target.checked)} className="w-10 h-10 rounded border-gray-400" />
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <span className="text-pos-text w-[400px]">One waiting order per customer:</span>
                      <input type="checkbox" checked={sysOneWachtorderPerKlant} onChange={(e) => setSysOneWachtorderPerKlant(e.target.checked)} className="w-10 h-10 rounded border-gray-400" />
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <span className="text-pos-text w-[400px]">Cash button visible with multiple payment options:</span>
                      <input type="checkbox" checked={sysCashButtonVisibleMultiplePayment} onChange={(e) => setSysCashButtonVisibleMultiplePayment(e.target.checked)} className="w-10 h-10 rounded border-gray-400" />
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <span className="text-pos-text w-[400px]">Use of place settings:</span>
                      <input type="checkbox" checked={sysUsePlaceSettings} onChange={(e) => setSysUsePlaceSettings(e.target.checked)} className="w-10 h-10 rounded border-gray-400" />
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <span className="text-pos-text w-[400px]">Auto load credit:</span>
                      <input type="checkbox" checked={sysTegoedAutomatischInladen} onChange={(e) => setSysTegoedAutomatischInladen(e.target.checked)} className="w-10 h-10 rounded border-gray-400" />
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <span className="text-pos-text w-[400px]">Use latest price:</span>
                      <input type="checkbox" checked={sysNieuwstePrijsGebruiken} onChange={(e) => setSysNieuwstePrijsGebruiken(e.target.checked)} className="w-10 h-10 rounded border-gray-400" />
                    </label>
                    <div className="flex items-center gap-3">
                      <span className="text-pos-text w-[400px] shrink-0">Deposit return:</span>
                      <Dropdown options={LEEGGOED_OPTIONS} value={sysLeeggoedTerugname} onChange={setSysLeeggoedTerugname} placeholder="Select" className="text-xl min-w-[130px] max-w-[200px]" />
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <span className="text-pos-text w-[400px]">Print customer details on QR:</span>
                      <input type="checkbox" checked={sysKlantgegevensQRAfdrukken} onChange={(e) => setSysKlantgegevensQRAfdrukken(e.target.checked)} className="w-10 h-10 rounded border-gray-400" />
                    </label>
                  </div>
                </div>
              )}
              {systemSettingsTab === 'Prices' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                  <div className="flex flex-col border border-gray-400 rounded-lg p-6 gap-8">
                    <p className="text-pos-text font-medium text-2xl flex justify-center items-center mb-5">Standard price group</p>
                    <div className="flex items-center gap-10">
                      <span className="text-pos-text w-[300px] shrink-0">Take-away meals of selected customer:</span>
                      <Dropdown
                        options={[{ value: '', label: '—' }, ...(priceGroups || []).sort((a, b) => (a.name || '').localeCompare(b.name || '')).map((pg) => ({ value: pg.id, label: pg.name || pg.id }))]}
                        value={sysPriceTakeAway}
                        onChange={setSysPriceTakeAway}
                        placeholder="Select"
                        className="text-xl min-w-[180px]"
                      />
                    </div>
                    <div className="flex items-center gap-10">
                      <span className="text-pos-text w-[300px] shrink-0">Delivery of selected customer:</span>
                      <Dropdown
                        options={[{ value: '', label: '—' }, ...(priceGroups || []).sort((a, b) => (a.name || '').localeCompare(b.name || '')).map((pg) => ({ value: pg.id, label: pg.name || pg.id }))]}
                        value={sysPriceDelivery}
                        onChange={setSysPriceDelivery}
                        placeholder="Select"
                        className="text-xl min-w-[180px]"
                      />
                    </div>
                    <div className="flex items-center gap-10">
                      <span className="text-pos-text w-[300px] shrink-0">Counter sale:</span>
                      <Dropdown
                        options={[{ value: '', label: '—' }, ...(priceGroups || []).sort((a, b) => (a.name || '').localeCompare(b.name || '')).map((pg) => ({ value: pg.id, label: pg.name || pg.id }))]}
                        value={sysPriceCounterSale}
                        onChange={setSysPriceCounterSale}
                        placeholder="Select"
                        className="text-xl min-w-[180px]"
                      />
                    </div>
                    <div className="flex items-center gap-10">
                      <span className="text-pos-text w-[300px] shrink-0">Table sale:</span>
                      <Dropdown
                        options={[{ value: '', label: '—' }, ...(priceGroups || []).sort((a, b) => (a.name || '').localeCompare(b.name || '')).map((pg) => ({ value: pg.id, label: pg.name || pg.id }))]}
                        value={sysPriceTableSale}
                        onChange={setSysPriceTableSale}
                        placeholder="Select"
                        className="text-xl min-w-[180px]"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col border border-gray-400 rounded-lg p-6 gap-8">
                    <p className="text-pos-text font-medium text-2xl flex justify-center items-center mb-5">Customer savings card settings</p>
                    <div className="flex items-center gap-3">
                      <span className="text-pos-text w-[300px] shrink-0">Points / euro:</span>
                      <div className="flex items-center gap-2">
                        <button type="button" className="p-1 px-3 rounded bg-pos-panel border border-pos-border text-pos-text hover:bg-pos-bg text-3xl" onClick={() => setSysSavingsPointsPerEuro((n) => Math.max(0, n - 1))}>−</button>
                        <input type="number" min={0} value={sysSavingsPointsPerEuro} onChange={(e) => setSysSavingsPointsPerEuro(Number(e.target.value) || 0)} className="w-20 px-3 py-2 bg-pos-panel border border-pos-border rounded text-pos-text text-xl text-center" />
                        <button type="button" className="p-1 px-3 rounded bg-pos-panel border border-pos-border text-pos-text hover:bg-pos-bg text-3xl" onClick={() => setSysSavingsPointsPerEuro((n) => n + 1)}>+</button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-pos-text w-[300px] shrink-0">Points / discount:</span>
                      <div className="flex items-center gap-2">
                        <button type="button" className="p-1 px-3 rounded bg-pos-panel border border-pos-border text-pos-text hover:bg-pos-bg text-3xl" onClick={() => setSysSavingsPointsPerDiscount((n) => Math.max(0, n - 1))}>−</button>
                        <input type="number" min={0} value={sysSavingsPointsPerDiscount} onChange={(e) => setSysSavingsPointsPerDiscount(Number(e.target.value) || 0)} className="w-20 px-3 py-2 bg-pos-panel border border-pos-border rounded text-pos-text text-xl text-center" />
                        <button type="button" className="p-1 px-3 rounded bg-pos-panel border border-pos-border text-pos-text hover:bg-pos-bg text-3xl" onClick={() => setSysSavingsPointsPerDiscount((n) => n + 1)}>+</button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-pos-text w-[300px] shrink-0">Discount:</span>
                      <Dropdown options={SAVINGS_DISCOUNT_OPTIONS} value={sysSavingsDiscount} onChange={setSysSavingsDiscount} placeholder="Disabled" className="text-xl min-w-[180px]" />
                    </div>
                  </div>
                </div>
              )}
              {systemSettingsTab === 'Ticket' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                  <div className="flex flex-col gap-8">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <span className="text-pos-text w-[400px]">Ask for VAT ticket printer:</span>
                      <input type="checkbox" checked={sysUsePlaceSettings} onChange={(e) => setSysUsePlaceSettings(e.target.checked)} className="w-10 h-10 rounded border-gray-400" />
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <span className="text-pos-text w-[400px]">Production printer cascade:</span>
                      <input type="checkbox" checked={sysTegoedAutomatischInladen} onChange={(e) => setSysTegoedAutomatischInladen(e.target.checked)} className="w-10 h-10 rounded border-gray-400" />
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <span className="text-pos-text w-[400px]">Display sub-products without price on VAT ticket:</span>
                      <input type="checkbox" checked={sysNieuwstePrijsGebruiken} onChange={(e) => setSysNieuwstePrijsGebruiken(e.target.checked)} className="w-10 h-10 rounded border-gray-400" />
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <span className="text-pos-text w-[400px]">Price per kilo prints:</span>
                      <input type="checkbox" checked={sysNieuwstePrijsGebruiken} onChange={(e) => setSysNieuwstePrijsGebruiken(e.target.checked)} className="w-10 h-10 rounded border-gray-400" />
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <span className="text-pos-text w-[400px]">Print unit price:</span>
                      <input type="checkbox" checked={sysKlantgegevensQRAfdrukken} onChange={(e) => setSysKlantgegevensQRAfdrukken(e.target.checked)} className="w-10 h-10 rounded border-gray-400" />
                    </label>
                    <div className="flex items-center gap-3">
                      <span className="text-pos-text w-[400px] shrink-0">Type barcode of generated barcode:</span>
                      <Dropdown options={BARCODE_TYPE_OPTIONS} value={sysBarcodeType} onChange={setSysBarcodeType} placeholder="Code39" className="text-xl min-w-[180px]" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-8">
                    <div className="flex items-center gap-3">
                      <span className="text-pos-text w-[400px] shrink-0">Validity period voucher:</span>
                      <Dropdown options={TICKET_VOUCHER_VALIDITY_OPTIONS} value={sysTicketVoucherValidity} onChange={setSysTicketVoucherValidity} placeholder="Select" className="text-xl min-w-[180px]" />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-pos-text w-[400px] shrink-0">Scheduled orders print mode:</span>
                      <Dropdown options={TICKET_SCHEDULED_PRINT_MODE_OPTIONS} value={sysTicketScheduledPrintMode} onChange={setSysTicketScheduledPrintMode} placeholder="Select" className="text-xl min-w-[180px]" />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-pos-text w-[400px] shrink-0">Scheduled orders customer sort:</span>
                      <Dropdown options={TICKET_SCHEDULED_CUSTOMER_SORT_OPTIONS} value={sysTicketScheduledCustomerSort} onChange={setSysTicketScheduledCustomerSort} placeholder="Select" className="text-xl min-w-[180px]" />
                    </div>
                  </div>
                </div>
              )}
              {systemSettingsTab !== 'General' && systemSettingsTab !== 'Prices' && systemSettingsTab !== 'Ticket' && (
                <p className="text-pos-muted text-xl py-4">Settings for “{systemSettingsTab}” will be available here.</p>
              )}
            </div>
            <div className="w-full flex items-center px-6 py-8 justify-center shrink-0">
              <button
                type="button"
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 text-xl"
                disabled={savingSystemSettings}
                onClick={handleSaveSystemSettings}
              >
                <svg fill="currentColor" width="24" height="24" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M-5.732,2.97-7.97.732a2.474,2.474,0,0,0-1.483-.7A.491.491,0,0,0-9.591,0H-18.5A2.5,2.5,0,0,0-21,2.5v11A2.5,2.5,0,0,0-18.5,16h11A2.5,2.5,0,0,0-5,13.5V4.737A2.483,2.483,0,0,0-5.732,2.97ZM-13,1V5.455h-3.591V1Zm-4.272,14V10.545h8.544V15ZM-6,13.5A1.5,1.5,0,0,1-7.5,15h-.228V10.045a.5.5,0,0,0-.5-.5h-9.544a.5.5,0,0,0-.5.5V15H-18.5A1.5,1.5,0,0,1-20,13.5V2.5A1.5,1.5,0,0,1-18.5,1h.909V5.955a.5.5,0,0,0,.5.5h7.5a.5.5,0,0,0,.5-.5v-4.8a1.492,1.492,0,0,1,.414.285l2.238,2.238A1.511,1.511,0,0,1-6,4.737Z" transform="translate(21)" /></svg>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New / Edit payment type modal */}
      {showPaymentTypeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative flex flex-col bg-pos-bg justify-between items-center rounded-xl border border-pos-border shadow-2xl max-w-[1430px] w-full h-[1000px] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="absolute top-4 right-4 z-10 p-2 rounded text-pos-muted hover:text-pos-text hover:bg-pos-panel" onClick={closePaymentTypeModal} aria-label="Close">
              <svg className="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="p-6 flex flex-col gap-6 mt-[200px]">
              <div className="flex items-center gap-4">
                <span className="text-pos-text text-xl font-medium shrink-0 w-[120px]">Name :</span>
                <input
                  type="text"
                  value={paymentTypeName}
                  onChange={(e) => setPaymentTypeName(e.target.value)}
                  placeholder="e.g. Cash, Bancontact"
                  className="flex-1 max-w-[320px] px-4 py-3 rounded-lg bg-pos-panel border border-pos-border text-pos-text placeholder-pos-muted focus:outline-none focus:border-green-500 text-xl"
                />
              </div>
              <div className="flex items-center gap-4">
                <span className="text-pos-text text-xl font-medium shrink-0 w-[120px]">Active :</span>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={paymentTypeActive} onChange={(e) => setPaymentTypeActive(e.target.checked)} className="w-10 h-10 rounded border-gray-400" />
                </label>
              </div>
              <div className="flex justify-center right-0 left-0 top-[50%] absolute">
                <button
                  type="button"
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 text-xl"
                  disabled={savingPaymentType || !(paymentTypeName || '').trim()}
                  onClick={handleSavePaymentType}
                >
                  <svg fill="currentColor" width="24" height="24" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M-5.732,2.97-7.97.732a2.474,2.474,0,0,0-1.483-.7A.491.491,0,0,0-9.591,0H-18.5A2.5,2.5,0,0,0-21,2.5v11A2.5,2.5,0,0,0-18.5,16h11A2.5,2.5,0,0,0-5,13.5V4.737A2.483,2.483,0,0,0-5.732,2.97ZM-13,1V5.455h-3.591V1Zm-4.272,14V10.545h8.544V15ZM-6,13.5A1.5,1.5,0,0,1-7.5,15h-.228V10.045a.5.5,0,0,0-.5-.5h-9.544a.5.5,0,0,0-.5.5V15H-18.5A1.5,1.5,0,0,1-20,13.5V2.5A1.5,1.5,0,0,1-18.5,1h.909V5.955a.5.5,0,0,0,.5.5h7.5a.5.5,0,0,0,.5-.5v-4.8a1.492,1.492,0,0,1,.414.285l2.238,2.238A1.511,1.511,0,0,1-6,4.737Z" transform="translate(21)" /></svg>
                  Save
                </button>
              </div>
            </div>
            <div className="shrink-0">
              <KeyboardWithNumpad value={paymentTypeName} onChange={setPaymentTypeName} />
            </div>
          </div>
        </div>
      )}

      {toast ? (
        <div className="fixed top-6 right-6 z-[100] pointer-events-none">
          <div
            className={`min-w-[320px] max-w-[520px] px-4 py-3 rounded-lg shadow-xl border text-xl ${toast.type === 'success'
              ? 'bg-emerald-700/90 border-emerald-500 text-emerald-100'
              : 'bg-rose-700/90 border-rose-500 text-rose-100'
              }`}
          >
            {toast.text}
          </div>
        </div>
      ) : null}

      <PrinterModal
        open={showPrinterModal}
        initialPrinter={editingPrinterId ? (printers.find((p) => p.id === editingPrinterId) ?? null) : null}
        onClose={closePrinterModal}
        onSave={handleSavePrinterPayload}
        onNotify={showToast}
      />

      {/* New / Edit label modal */}
      {showLabelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative flex flex-col bg-pos-bg rounded-xl border border-pos-border shadow-2xl max-w-[1430px] w-full h-[1000px] justify-center items-between items-center overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="absolute top-4 right-4 z-10 p-2 rounded text-pos-muted hover:text-pos-text hover:bg-pos-panel" onClick={closeLabelModal} aria-label="Close">
              <svg className="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="p-6 overflow-auto flex-1 mt-[100px]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-4">
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-3">
                    <span className="text-pos-text text-xl shrink-0 w-[140px]">Name:</span>
                    <input type="text" value={labelName} onChange={(e) => setLabelName(e.target.value)} placeholder="e.g. 5.6cm x 3.5cm" className="flex-1 min-w-0 px-4 py-3 rounded-lg bg-pos-panel border border-pos-border text-pos-text text-xl" />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-pos-text text-xl shrink-0 w-[140px]">Hoogte:</span>
                    <input type="text" value={labelHeight} onChange={(e) => setLabelHeight(e.target.value)} className="w-32 px-4 py-3 rounded-lg bg-pos-panel border border-pos-border text-pos-text text-xl" />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-pos-text text-xl shrink-0 w-[140px]">Breedte:</span>
                    <input type="text" value={labelWidth} onChange={(e) => setLabelWidth(e.target.value)} className="w-32 px-4 py-3 rounded-lg bg-pos-panel border border-pos-border text-pos-text text-xl" />
                  </div>
                </div>
                <div className="flex flex-col gap-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <span className="text-pos-text text-xl shrink-0 w-[140px]">Standard:</span>
                    <input type="checkbox" checked={labelStandard} onChange={(e) => setLabelStandard(e.target.checked)} className="w-8 h-8 rounded border-gray-400" />
                  </label>
                </div>
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-3">
                    <span className="text-pos-text text-xl shrink-0 w-[140px]">Marge links:</span>
                    <input type="text" inputMode="numeric" value={labelMarginLeft} onChange={(e) => setLabelMarginLeft(e.target.value)} className="w-24 px-4 py-3 rounded-lg bg-pos-panel border border-pos-border text-pos-text text-xl" />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-pos-text text-xl shrink-0 w-[140px]">Marge rechts:</span>
                    <input type="text" inputMode="numeric" value={labelMarginRight} onChange={(e) => setLabelMarginRight(e.target.value)} className="w-24 px-4 py-3 rounded-lg bg-pos-panel border border-pos-border text-pos-text text-xl" />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-pos-text text-xl shrink-0 w-[140px]">Marge onder:</span>
                    <input type="text" inputMode="numeric" value={labelMarginBottom} onChange={(e) => setLabelMarginBottom(e.target.value)} className="w-24 px-4 py-3 rounded-lg bg-pos-panel border border-pos-border text-pos-text text-xl" />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-pos-text text-xl shrink-0 w-[140px]">Marge boven:</span>
                    <input type="text" inputMode="numeric" value={labelMarginTop} onChange={(e) => setLabelMarginTop(e.target.value)} className="w-24 px-4 py-3 rounded-lg bg-pos-panel border border-pos-border text-pos-text text-xl" />
                  </div>
                </div>
              </div>
              <div className="flex justify-center mt-16">
                <button type="button" className="flex items-center gap-4 px-6 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 text-2xl" disabled={!(labelName || '').trim()} onClick={handleSaveLabel}>
                  <svg fill="currentColor" width="24" height="24" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M-5.732,2.97-7.97.732a2.474,2.474,0,0,0-1.483-.7A.491.491,0,0,0-9.591,0H-18.5A2.5,2.5,0,0,0-21,2.5v11A2.5,2.5,0,0,0-18.5,16h11A2.5,2.5,0,0,0-5,13.5V4.737A2.483,2.483,0,0,0-5.732,2.97ZM-13,1V5.455h-3.591V1Zm-4.272,14V10.545h8.544V15ZM-6,13.5A1.5,1.5,0,0,1-7.5,15h-.228V10.045a.5.5,0,0,0-.5-.5h-9.544a.5.5,0,0,0-.5.5V15H-18.5A1.5,1.5,0,0,1-20,13.5V2.5A1.5,1.5,0,0,1-18.5,1h.909V5.955a.5.5,0,0,0,.5.5h7.5a.5.5,0,0,0,.5-.5v-4.8a1.492,1.492,0,0,1,.414.285l2.238,2.238A1.511,1.511,0,0,1-6,4.737Z" transform="translate(21)" /></svg>
                  Save
                </button>
              </div>
            </div>
            <div className="shrink-0">
              <KeyboardWithNumpad value={labelName} onChange={setLabelName} />
            </div>
          </div>
        </div>
      )}

      {/* Production messages modal */}
      {showProductionMessagesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative bg-pos-bg rounded-xl shadow-2xl max-w-[1430px] justify-center items-center w-full mx-4 overflow-hidden flex flex-col h-[1000px]" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="absolute top-4 right-4 z-10 p-2 rounded text-pos-muted hover:text-pos-text hover:bg-pos-panel" onClick={() => { setShowProductionMessagesModal(false); setProductionMessagesPage(0); cancelEditProductionMessage(); }} aria-label="Close">
              <svg className="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="w-full flex items-center justify-center mt-[50px] px-6 gap-4 py-4 shrink-0 pr-14">
              <div className="flex gap-2 items-center gap-[100px]">
                <input
                  type="text"
                  readOnly
                  value={productionMessageInput}
                  placeholder="New message"
                  className="px-4 py-3 bg-pos-panel border border-pos-border rounded-lg min-w-[400px] text-pos-text text-xl"
                  onClick={() => { }}
                />
                <button
                  type="button"
                  className="px-6 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 text-xl shrink-0"
                  disabled={!(productionMessageInput || '').trim()}
                  onClick={handleAddOrUpdateProductionMessage}
                >
                  {editingProductionMessageId ? 'Update' : 'Add'}
                </button>
              </div>
            </div>
            <div className="flex-1 flex flex-col rounded-xl p-6 w-full min-h-0 overflow-hidden pb-24">
              {(() => {
                const sorted = [...productionMessages].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
                const total = sorted.length;
                const totalPages = Math.max(1, Math.ceil(total / PRODUCTION_MESSAGES_PAGE_SIZE));
                const page = Math.min(productionMessagesPage, totalPages - 1);
                const start = page * PRODUCTION_MESSAGES_PAGE_SIZE;
                const paginated = sorted.slice(start, start + PRODUCTION_MESSAGES_PAGE_SIZE);
                const canPrev = page > 0;
                const canNext = page < totalPages - 1;
                return (
                  <>
                    <ul className="overflow-auto min-h-[300px] mx-10 border border-gray-400 rounded-xl relative p-2">
                      {paginated.map((m) => (
                        <li key={m.id} className="flex items-center px-4 py-3 border-b border-gray-400 last:border-b-0">
                          <span className="flex-1 text-pos-text text-xl truncate">{m.text || ''}</span>
                          <button type="button" className="p-2 pr-20 rounded text-pos-text hover:bg-pos-bg" onClick={() => startEditProductionMessage(m)} aria-label="Edit">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                          <button type="button" className="p-2 rounded text-pos-text hover:bg-pos-bg" onClick={() => setDeleteConfirmProductionMessageId(m.id)} aria-label="Delete">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className='fixed top-[56%] right-0 left-0'>
                      <PaginationArrows
                        canPrev={canPrev}
                        canNext={canNext}
                        onPrev={() => setProductionMessagesPage((p) => Math.max(0, p - 1))}
                        onNext={() => setProductionMessagesPage((p) => Math.min(totalPages - 1, p + 1))}
                      />
                    </div>
                  </>
                );
              })()}
            </div>
            <div className="shrink-0">
              <KeyboardWithNumpad value={productionMessageInput} onChange={setProductionMessageInput} />
            </div>
          </div>
        </div>
      )}

      {/* New price group modal */}
      {showPriceGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative bg-pos-bg rounded-xl shadow-2xl max-w-[1450px] w-full justify-center items-center mx-4 overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="absolute top-4 right-4 z-10 p-2 rounded text-pos-muted hover:text-pos-text hover:bg-pos-panel" onClick={closePriceGroupModal} aria-label="Close">
              <svg className="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="p-6 flex flex-col space-y-6 w-full justify-center items-center pt-14">
              <div className='w-full flex flex-col h-[400px] justify-center items-center gap-10'>
                <div className="flex gap-2 w-full items-center justify-center h-[100px]">
                  <label className="block text-3xl pr-[50px] font-medium text-gray-200 mb-2">{tr('name', 'Name')} : </label>
                  <input
                    type="text"
                    readOnly
                    value={priceGroupName}
                    placeholder={tr('control.enterName', 'Enter name')}
                    className="px-4 w-[300px] bg-pos-panel h-[60px] py-3 text-xl border border-gray-300 rounded-lg text-gray-200"
                  />
                </div>
                <div className="flex gap-2 w-full items-center justify-center h-[100px]">
                  <label className="block text-3xl pr-[80px] font-medium text-gray-200 mb-2">{tr('control.vat', 'VAT')} : </label>
                  <Dropdown
                    options={VAT_OPTIONS.map((o) => ({ ...o, label: tr(`vatOption.${o.value}`, o.label) }))}
                    value={priceGroupTax}
                    onChange={setPriceGroupTax}
                    placeholder={tr('control.selectVat', 'Select VAT')}
                    className="text-xl min-w-[300px]"
                  />
                </div>
              </div>
              <div className="flex justify-center">
                <button
                  type="button"
                  className="flex items-center text-4xl gap-4 px-6 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50"
                  disabled={savingPriceGroup}
                  onClick={handleSavePriceGroup}
                >
                  <svg fill="#ffffff" width="30px" height="30px" viewBox="0 0 16 16" id="save-16px" xmlns="http://www.w3.org/2000/svg">
                    <path id="Path_42" data-name="Path 42" d="M-5.732,2.97-7.97.732a2.474,2.474,0,0,0-1.483-.7A.491.491,0,0,0-9.591,0H-18.5A2.5,2.5,0,0,0-21,2.5v11A2.5,2.5,0,0,0-18.5,16h11A2.5,2.5,0,0,0-5,13.5V4.737A2.483,2.483,0,0,0-5.732,2.97ZM-13,1V5.455h-3.591V1Zm-4.272,14V10.545h8.544V15ZM-6,13.5A1.5,1.5,0,0,1-7.5,15h-.228V10.045a.5.5,0,0,0-.5-.5h-9.544a.5.5,0,0,0-.5.5V15H-18.5A1.5,1.5,0,0,1-20,13.5V2.5A1.5,1.5,0,0,1-18.5,1h.909V5.955a.5.5,0,0,0,.5.5h7.5a.5.5,0,0,0,.5-.5v-4.8a1.492,1.492,0,0,1,.414.285l2.238,2.238A1.511,1.511,0,0,1-6,4.737Z" transform="translate(21)" />
                  </svg>
                  {tr('control.save', 'Save')}
                </button>
              </div>
            </div>
            <KeyboardWithNumpad value={priceGroupName} onChange={setPriceGroupName} />
          </div>
        </div>
      )}

      {/* Add / Edit category modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative bg-pos-bg rounded-xl shadow-2xl max-w-[1380px] h-[980px] w-full justify-center items-center mx-4 overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="absolute top-4 right-4 z-10 p-2 rounded text-pos-muted hover:text-pos-text hover:bg-pos-panel" onClick={closeCategoryModal} aria-label="Close">
              <svg className="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="p-6 flex flex-col space-y-6 w-full justify-center items-center overflow-auto pt-14">
              <div className="w-full flex flex-col justify-center items-center gap-6 max-w-2xl">
                <div className="flex gap-2 w-full items-center mt-8">
                  <label className="block text-3xl w-[200px] font-medium text-gray-200 shrink-0">{tr('name', 'Name')} :</label>
                  <input
                    type="text"
                    readOnly
                    value={categoryName}
                    className="flex-1 px-4 bg-pos-panel h-[60px] py-3 text-xl border border-gray-300 rounded-lg text-gray-200"
                    onFocus={() => setCategoryActiveField('name')}
                    onClick={() => setCategoryActiveField('name')}
                  />
                </div>
                <div className="flex gap-2 w-full items-center">
                  <label className="block text-3xl w-[200px] font-medium text-gray-200 shrink-0">{tr('control.inWebshop', 'In webshop')} :</label>
                  <input
                    type="checkbox"
                    checked={categoryInWebshop}
                    onChange={(e) => setCategoryInWebshop(e.target.checked)}
                    className="w-8 h-8 rounded border-gray-300"
                  />
                </div>
                <div className="flex gap-2 w-full items-center">
                  <label className="block text-3xl w-[200px] font-medium text-gray-200 shrink-0">{tr('control.displayOnThisCashRegister', 'Display on this cash register')} :</label>
                  <input
                    type="checkbox"
                    checked={categoryDisplayOnCashRegister}
                    onChange={(e) => setCategoryDisplayOnCashRegister(e.target.checked)}
                    className="w-8 h-8 rounded border-gray-300"
                  />
                </div>
                <div className="flex gap-2 w-full items-center">
                  <label className="block text-3xl w-[200px] font-medium text-gray-200 shrink-0">{tr('nextCourse', 'Next course')} :</label>
                  <input
                    type="text"
                    readOnly
                    value={categoryNextCourse}
                    className="flex-1 px-4 bg-pos-panel h-[60px] py-3 text-xl border border-gray-300 rounded-lg text-gray-200"
                    onFocus={() => setCategoryActiveField('nextCourse')}
                    onClick={() => setCategoryActiveField('nextCourse')}
                  />
                </div>
              </div>
              <div className="flex justify-center">
                <button
                  type="button"
                  className="flex items-center mt-20 text-4xl gap-4 px-6 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50"
                  disabled={savingCategory}
                  onClick={handleSaveCategory}
                >
                  <svg fill="#ffffff" width="30px" height="30px" viewBox="0 0 16 16" id="save-16px" xmlns="http://www.w3.org/2000/svg">
                    <path id="Path_42" data-name="Path 42" d="M-5.732,2.97-7.97.732a2.474,2.474,0,0,0-1.483-.7A.491.491,0,0,0-9.591,0H-18.5A2.5,2.5,0,0,0-21,2.5v11A2.5,2.5,0,0,0-18.5,16h11A2.5,2.5,0,0,0-5,13.5V4.737A2.483,2.483,0,0,0-5.732,2.97ZM-13,1V5.455h-3.591V1Zm-4.272,14V10.545h8.544V15ZM-6,13.5A1.5,1.5,0,0,1-7.5,15h-.228V10.045a.5.5,0,0,0-.5-.5h-9.544a.5.5,0,0,0-.5.5V15H-18.5A1.5,1.5,0,0,1-20,13.5V2.5A1.5,1.5,0,0,1-18.5,1h.909V5.955a.5.5,0,0,0,.5.5h7.5a.5.5,0,0,0,.5-.5v-4.8a1.492,1.492,0,0,1,.414.285l2.238,2.238A1.511,1.511,0,0,1-6,4.737Z" transform="translate(21)" />
                  </svg>
                  {tr('control.save', 'Save')}
                </button>
              </div>
            </div>
            <KeyboardWithNumpad
              value={categoryActiveField === 'name' ? categoryName : categoryNextCourse}
              onChange={categoryActiveField === 'name' ? setCategoryName : setCategoryNextCourse}
            />
          </div>
        </div>
      )}

      {/* New / Edit product modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative bg-pos-bg rounded-xl shadow-2xl max-w-[1380px] h-[1050px] w-full mx-4 overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="absolute top-4 right-4 z-10 p-2 rounded text-pos-muted hover:text-pos-text hover:bg-pos-panel" onClick={closeProductModal} aria-label="Close">
              <svg className="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="flex gap-1 w-full justify-around px-4 py-2 py-5 shrink-0 pr-14">
              {[
                { id: 'general', label: tr('control.productModal.tab.general', 'General') },
                { id: 'advanced', label: tr('control.productModal.tab.advanced', 'Advanced') },
                { id: 'extra_prices', label: tr('control.productModal.tab.extraPrices', 'Extra prices') },
                { id: 'purchase_stock', label: tr('control.productModal.tab.purchaseStock', 'Purchase and stock') },
                { id: 'webshop', label: tr('control.productModal.tab.webshop', 'Webshop') },
                { id: 'kiosk', label: tr('control.productModal.tab.kiosk', 'Kiosk') },
              ].map((tab) => {
                const isLocked = tab.id !== 'general' && !productTabsUnlocked;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    disabled={isLocked}
                    className={`px-4 py-2 rounded-lg text-xl font-medium transition-colors ${productTab === tab.id ? 'bg-green-600 text-white border border-b-0 border-pos-border' : isLocked ? 'text-pos-muted opacity-50 cursor-not-allowed' : 'text-white hover:text-pos-text'}`}
                    onClick={() => !isLocked && setProductTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
            {/* Single scrollable area for all tabs so keyboard stays fixed at bottom */}
            <div className="flex-1 min-h-0 overflow-auto">
              {productTab === 'general' && (
                <div className="p-6 pb-0">
                  <div className="grid grid-cols-3 gap-6">
                    <div className="flex text-xl flex-col gap-4">
                      <div className="flex items-center gap-1">
                        <label className="text-xl font-medium text-gray-200 w-[300px]">{tr('name', 'Name')}:</label>
                        <input type="text" readOnly value={productName} className={`w-full px-4 py-3 border rounded-lg text-pos-text text-xl ${productFieldErrors.name ? 'bg-rose-500/40 border-rose-400' : 'bg-pos-panel border-pos-border'}`} onFocus={() => setProductActiveField('name')} onClick={() => setProductActiveField('name')} />
                      </div>
                      <div className="flex items-center gap-1">
                        <label className="w-[300px] font-medium text-gray-200">{tr('control.productModal.testName', 'Test name')}:</label>
                        <input type="text" readOnly value={productKeyName} className={`w-full px-4 py-3 border rounded-lg text-pos-text text-xl ${productFieldErrors.keyName ? 'bg-rose-500/40 border-rose-400' : 'bg-pos-panel border-pos-border'}`} onFocus={() => setProductActiveField('keyName')} onClick={() => setProductActiveField('keyName')} />
                      </div>
                      <div className="flex items-center gap-1">
                        <label className="w-[300px] font-medium text-gray-200">{tr('control.productModal.productionName', 'Production name')}:</label>
                        <input type="text" readOnly value={productProductionName} className={`w-full px-4 py-3 border rounded-lg text-pos-text text-xl ${productFieldErrors.productionName ? 'bg-rose-500/40 border-rose-400' : 'bg-pos-panel border-pos-border'}`} onFocus={() => setProductActiveField('productionName')} onClick={() => setProductActiveField('productionName')} />
                      </div>
                      <div className="flex items-center gap-1">
                        <label className="w-[170px] font-medium text-gray-200">{tr('control.productModal.price', 'Price')}:</label>
                        <input type="text" readOnly value={productPrice} className="w-full px-4 py-3 bg-pos-panel border border-pos-border rounded-lg text-pos-text text-xl max-w-[150px]" onFocus={() => setProductActiveField('price')} onClick={() => setProductActiveField('price')} />
                      </div>
                      <div className="flex items-center gap-1">
                        <label className="min-w-[170px] font-medium text-gray-200">{tr('control.productModal.vatTakeOut', 'VAT Take out')}:</label>
                        <Dropdown options={VAT_PERCENT_OPTIONS} value={productVatTakeOut} onChange={(v) => { setProductVatTakeOut(v); setProductFieldErrors((e) => ({ ...e, vatTakeOut: false })); }} placeholder="--" className={`text-xl min-w-[150px] ${productFieldErrors.vatTakeOut ? '!bg-rose-500/40 !border-rose-400' : ''}`} />
                      </div>
                      <div className="flex items-center gap-1">
                        <label className="min-w-[170px] font-medium text-gray-200">{tr('control.productModal.vatEatIn', 'VAT Eat in')}:</label>
                        <Dropdown options={VAT_PERCENT_OPTIONS} value={productVatEatIn} onChange={(v) => { setProductVatEatIn(v); setProductFieldErrors((e) => ({ ...e, vatEatIn: false })); }} placeholder="--" className={`text-xl min-w-[150px] ${productFieldErrors.vatEatIn ? '!bg-rose-500/40 !border-rose-400' : ''}`} />
                      </div>
                      {productTabsUnlocked ? (
                        <div className="flex items-center gap-1 h-[50px]">
                          <label className="min-w-[170px] font-medium text-gray-200">Id:</label>
                          <span className="text-pos-text text-xl">{productDisplayNumber != null ? productDisplayNumber : '—'}</span>
                        </div>
                      )
                        : (
                          <div className="flex items-center gap-1 h-[50px]">
                          </div>
                        )
                      }
                    </div>
                    <div className='flex flex-col gap-4'>
                      {(() => {
                        const ids = [...productCategoryIds];
                        let numVisible = 1;
                        if (productTabsUnlocked && categories.length > 0) {
                          for (let i = 0; i < categories.length; i++) {
                            const prevId = i > 0 ? ids[i - 1] : '';
                            if (i > 0 && !prevId) break;
                            const selectedIds = ids.slice(0, i + 1);
                            const optionsForNext = categories.filter((c) => !selectedIds.includes(c.id));
                            if (!ids[i]) {
                              numVisible = i + 1;
                              break;
                            }
                            if (optionsForNext.length < 1) {
                              numVisible = i + 1;
                              break;
                            }
                            numVisible = i + 2;
                          }
                        }
                        while (ids.length < numVisible) ids.push('');
                        return Array.from({ length: numVisible }, (_, i) => {
                          const prevIds = ids.slice(0, i);
                          const optionsForI = i === 0 ? categories : categories.filter((c) => !prevIds.includes(c.id));
                          return (
                            <div key={i} className="flex gap-1 w-full h-[50px]">
                              <label className="pr-5 font-medium text-xl items-center justify-center flex h-[50px] text-gray-200">{tr('control.productModal.category', 'Category')}:</label>
                              <Dropdown
                                options={optionsForI.map((c) => ({ value: c.id, label: c.name }))}
                                value={ids[i] || ''}
                                onChange={(v) => {
                                  setProductCategoryIds((prev) => {
                                    const next = [...prev];
                                    while (next.length <= i) next.push('');
                                    next[i] = v;
                                    for (let j = i + 1; j < next.length; j++) next[j] = '';
                                    return next;
                                  });
                                }}
                                placeholder="--"
                                inline
                                className="text-xl w-full min-w-[320px]"
                              />
                            </div>
                          );
                        });
                      })()}
                    </div>
                    <div className="flex flex-col gap-4">
                      <div className="flex gap-1 items-center w-full">
                        <label className="w-[100px] font-medium text-xl text-gray-200">{tr('control.productModal.addition', 'Addition')}:</label>
                        <Dropdown options={[{ value: 'Subproducts', label: tr('control.productModal.subproducts', 'Subproducts') }]} value={productAddition} onChange={setProductAddition} placeholder="--" className="text-xl w-full min-w-[320px]" />
                      </div>
                      <div className="flex gap-1 items-center">
                        <label className="min-w-[100px] font-medium text-xl text-gray-200">{tr('control.productModal.barcode', 'Barcode')}:</label>
                        <div className="flex gap-2 items-center w-full">
                          <input type="text" readOnly value={productBarcode} className="flex-1 px-4 py-3 bg-pos-panel border border-pos-border rounded-lg text-pos-text text-xl " onFocus={() => setProductActiveField('barcode')} onClick={() => setProductActiveField('barcode')} />
                          <button type="button" className="p-2 rounded-full bg-pos-panel border border-pos-border text-pos-text hover:bg-pos-bg disabled:opacity-70" aria-label="Generate barcode" onClick={handleGenerateBarcode}>
                            <svg className={`w-6 h-6 ${barcodeButtonSpinning ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                          </button>
                        </div>
                      </div>
                      <div className="flex gap-1 items-center">
                        <label className="w-[100px] font-medium text-xl text-gray-200">{tr('control.productModal.printer1', 'Printer 1')}:</label>
                        <Dropdown
                          options={getUniqueProductPrinterOptions(productPrinter1, [productPrinter2, productPrinter3])}
                          value={productPrinter1}
                          onChange={setProductPrinter1}
                          className="text-xl w-full min-w-[320px]"
                        />
                      </div>
                      <div className="flex gap-1 items-center">
                        <label className="w-[100px] font-medium text-xl text-gray-200">{tr('control.productModal.printer2', 'Printer 2')}:</label>
                        <Dropdown
                          options={getUniqueProductPrinterOptions(productPrinter2, [productPrinter1, productPrinter3])}
                          value={productPrinter2}
                          onChange={setProductPrinter2}
                          className="text-xl w-full min-w-[320px]"
                        />
                      </div>
                      <div className="flex gap-1 items-center">
                        <label className="w-[100px] font-medium text-xl text-gray-200">{tr('control.productModal.printer3', 'Printer 3')}:</label>
                        <Dropdown
                          options={getUniqueProductPrinterOptions(productPrinter3, [productPrinter1, productPrinter2])}
                          value={productPrinter3}
                          onChange={setProductPrinter3}
                          className="text-xl w-full min-w-[320px]"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex w-full justify-center gap-4">
                    <button type="button" className="flex items-center gap-2 px-5 py-3 rounded-lg bg-pos-panel border border-pos-border text-pos-text font-medium hover:bg-pos-bg text-xl" onClick={async () => {
                      if (!validateProductRequired()) return;
                      setProductTabsUnlocked(true);
                      if (!editingProductId) {
                        try {
                          const res = await fetch(`${API}/products/next-number`);
                          const data = await res.json();
                          if (data.nextNumber != null) setProductDisplayNumber(data.nextNumber);
                        } catch { /* keep — */ }
                      }
                    }}>
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      {tr('control.productModal.completeFurther', 'Complete further')}
                    </button>
                    <button type="button" className="flex items-center gap-2 px-5 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 text-xl" disabled={savingProduct} onClick={handleSaveProduct}>
                      <svg fill="#ffffff" width="24" height="24" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M-5.732,2.97-7.97.732a2.474,2.474,0,0,0-1.483-.7A.491.491,0,0,0-9.591,0H-18.5A2.5,2.5,0,0,0-21,2.5v11A2.5,2.5,0,0,0-18.5,16h11A2.5,2.5,0,0,0-5,13.5V4.737A2.483,2.483,0,0,0-5.732,2.97ZM-13,1V5.455h-3.591V1Zm-4.272,14V10.545h8.544V15ZM-6,13.5A1.5,1.5,0,0,1-7.5,15h-.228V10.045a.5.5,0,0,0-.5-.5h-9.544a.5.5,0,0,0-.5.5V15H-18.5A1.5,1.5,0,0,1-20,13.5V2.5A1.5,1.5,0,0,1-18.5,1h.909V5.955a.5.5,0,0,0,.5.5h7.5a.5.5,0,0,0,.5-.5v-4.8a1.492,1.492,0,0,1,.414.285l2.238,2.238A1.511,1.511,0,0,1-6,4.737Z" transform="translate(21)" /></svg>
                      {tr('control.productModal.addAndClose', 'Add and close')}
                    </button>
                  </div>
                </div>
              )}
              {productTab === 'advanced' && (
                <div className="p-6 pb-0 flex flex-col gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col gap-4">
                      <label className="flex items-center text-xl gap-2 text-pos-text">
                        Open price:
                        <input type="checkbox" checked={advancedOpenPrice} onChange={(e) => setAdvancedOpenPrice(e.target.checked)} className="rounded border-pos-border w-8 h-8 text-xl  mt-1 mb-1 ml-[120px]" />
                      </label>
                      <label className="flex items-center text-xl gap-2 text-pos-text">
                        Libra:
                        <input type="checkbox" checked={advancedWeegschaal} onChange={(e) => setAdvancedWeegschaal(e.target.checked)} className="rounded border-pos-border w-8 h-8 text-xl mt-1 mb-1 ml-[170px]" />
                      </label>
                      <label className="flex items-center text-xl gap-2 text-pos-text">
                        Subproduct requires :
                        <input type="checkbox" checked={advancedSubproductRequires} onChange={(e) => setAdvancedSubproductRequires(e.target.checked)} className="rounded border-pos-border w-8 h-8 text-xl mt-1 ml-[37px]" />
                      </label>
                      <div className="flex items-center gap-1">
                        <label className="block text-pos-text mb-1 text-xl min-w-[220px]">Empty price:</label>
                        <input type="text" value={advancedLeeggoedPrijs} onChange={(e) => setAdvancedLeeggoedPrijs(e.target.value)} onFocus={() => setProductActiveField('leeggoedPrijs')} className="w-full border border-pos-border rounded-lg px-3 py-2 bg-pos-bg text-pos-text text-xl max-w-[180px]" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-4">
                      <label className="flex items-center text-xl gap-2 text-pos-text">
                        Pager required:
                        <input type="checkbox" checked={advancedPagerVerplicht} onChange={(e) => setAdvancedPagerVerplicht(e.target.checked)} className="rounded border-pos-border w-8 h-8 text-xl mt-1 mb-1 ml-[120px]" />
                      </label>
                      <label className="flex items-center text-xl gap-2 text-pos-text">
                        Bold print:
                        <input type="checkbox" checked={advancedBoldPrint} onChange={(e) => setAdvancedBoldPrint(e.target.checked)} className="rounded border-pos-border w-8 h-8 text-xl mt-1 mb-1 ml-[160px]" />
                      </label>
                      <label className="flex items-center text-xl gap-2 text-pos-text">
                        Grouping receipt:
                        <input type="checkbox" checked={advancedGroupingReceipt} onChange={(e) => setAdvancedGroupingReceipt(e.target.checked)} className="rounded border-pos-border w-8 h-8 text-xl mt-1 mb-1 ml-[100px]" />
                      </label>
                    </div>
                    <div className="flex flex-col gap-4">
                      <div className="flex text-xl items-center gap-1">
                        <label className="block min-w-[170px] mr-3 text-pos-text mb-1">Label extra info:</label>
                        <input type="text" value={advancedLabelExtraInfo} onChange={(e) => setAdvancedLabelExtraInfo(e.target.value)} onFocus={() => setProductActiveField('labelExtraInfo')} className="w-full border border-pos-border rounded-lg px-3 py-2 bg-pos-bg text-pos-text text-xl max-w-[320px]" />
                      </div>
                      <div className="flex text-xl items-center gap-3">
                        <label className="block min-w-[170px] mr-1.5 text-pos-text mb-1">Cash register photo:</label>
                        <div className="flex items-center gap-3">
                          {!advancedKassaPhotoPreview ? (
                            <label className="px-4 py-2 border border-pos-border rounded-lg text-pos-text hover:bg-pos-panel cursor-pointer shrink-0 text-xl">
                              Select
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file && file.type.startsWith('image/')) {
                                    const dataUrl = await new Promise((resolve, reject) => {
                                      const reader = new FileReader();
                                      reader.onload = () => resolve(String(reader.result || ''));
                                      reader.onerror = () => reject(reader.error);
                                      reader.readAsDataURL(file);
                                    }).catch(() => '');
                                    if (dataUrl) setAdvancedKassaPhotoPreview(dataUrl);
                                  }
                                  e.target.value = '';
                                }}
                              />
                            </label>
                          ) : (
                            <>
                              <img src={advancedKassaPhotoPreview} alt="Cash register" className="w-[100px] h-[100px] object-cover rounded-lg border border-pos-border shrink-0" />
                              <button
                                type="button"
                                className="px-4 py-2 border border-pos-border rounded-lg text-pos-text hover:bg-rose-500/30 text-xl shrink-0"
                                onClick={() => {
                                  setAdvancedKassaPhotoPreview(null);
                                }}
                              >
                                Remove
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex text-xl items-center gap-1">
                        <label className="block min-w-[180px] text-pos-text mb-1">Pre-pack expiry type:</label>
                        <Dropdown options={VERVALTYPE_OPTIONS} value={advancedVoorverpakVervaltype} onChange={setAdvancedVoorverpakVervaltype} placeholder="Select…" className="w-full border border-pos-border rounded-lg px-3 py-2 bg-pos-bg text-pos-text text-xl min-w-[247px]" />
                      </div>
                      <div className="flex text-xl items-center gap-1">
                        <label className="block min-w-[180px] text-pos-text mb-1">Shelf life:</label>
                        <input type="text" value={advancedHoudbareDagen} onChange={(e) => setAdvancedHoudbareDagen(e.target.value)} onFocus={() => setProductActiveField('houdbareDagen')} className="w-full border border-pos-border rounded-lg px-3 py-2 bg-pos-bg text-pos-text" />
                      </div>
                      <div className="flex text-xl gap-1">
                        <label className="block min-w-[180px] text-pos-text mb-1">Storage, use:</label>
                        <textarea value={advancedBewarenGebruik} onChange={(e) => setAdvancedBewarenGebruik(e.target.value)} onFocus={() => setProductActiveField('bewarenGebruik')} rows={4} className="w-full border border-pos-border rounded-lg px-3 py-2 bg-pos-bg text-pos-text resize-none" />
                      </div>
                    </div>
                  </div>
                  <div className="flex text-2xl justify-center absolute top-[50%] left-0 right-0">
                    <button type="button" className="flex items-center gap-2 px-5 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700" onClick={handleSaveProduct} disabled={savingProduct}>
                      <svg fill="#ffffff" width="20" height="20" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M-5.732,2.97-7.97.732a2.474,2.474,0,0,0-1.483-.7A.491.491,0,0,0-9.591,0H-18.5A2.5,2.5,0,0,0-21,2.5v11A2.5,2.5,0,0,0-18.5,16h11A2.5,2.5,0,0,0-5,13.5V4.737A2.483,2.483,0,0,0-5.732,2.97ZM-13,1V5.455h-3.591V1Zm-4.272,14V10.545h8.544V15ZM-6,13.5A1.5,1.5,0,0,1-7.5,15h-.228V10.045a.5.5,0,0,0-.5-.5h-9.544a.5.5,0,0,0-.5.5V15H-18.5A1.5,1.5,0,0,1-20,13.5V2.5A1.5,1.5,0,0,1-18.5,1h.909V5.955a.5.5,0,0,0,.5.5h7.5a.5.5,0,0,0,.5-.5v-4.8a1.492,1.492,0,0,1,.414.285l2.238,2.238A1.511,1.511,0,0,1-6,4.737Z" transform="translate(21)" /></svg>
                      {tr('control.save', 'Save')}
                    </button>
                  </div>
                </div>
              )}
              {productTab === 'extra_prices' && (
                <div className="p-6 flex flex-col gap-5">
                  <div className="overflow-x-auto">
                    <div className="flex gap-4 text-xl w-full justify-around mb-5 text-pos-text">
                      <div className="font-medium">Pricegroup</div>
                      <div className="font-medium">Other name</div>
                      <div className="font-medium">Other printer</div>
                      <div className="font-medium">Other price</div>
                    </div>
                    <table className="w-full h-[300px] border-collapse border border-pos-border rounded-lg text-pos-text text-xl">
                      <tbody className='h-[50px] flex flex-col w-full'>
                        {extraPricesRows.map((row, idx) => (
                          <tr key={idx} className="bg-pos-bg">
                            <td className="w-[323px] px-4 py-2">
                              <span className="px-3 py-2 block flex justify-center rounded-lg text-pos-text text-xl">{row.priceGroupLabel}</span>
                            </td>
                            <td className="w-[330px] px-4 py-2">
                              <input
                                type="text"
                                value={row.otherName}
                                onChange={(e) => setExtraPricesRows((prev) => prev.map((r, i) => i === idx ? { ...r, otherName: e.target.value } : r))}
                                onFocus={() => { setExtraPricesSelectedIndex(idx); setProductActiveField('extraOtherName'); }}
                                className="w-full max-w-[150px] ml-[80px] rounded-lg px-3 py-2 border border-pos-border flex justify-center bg-pos-panel text-pos-text"
                              />
                            </td>
                            <td className="w-[350px] px-4 py-2">
                              <Dropdown
                                options={EXTRA_PRICE_PRINTER_OPTIONS}
                                value={row.otherPrinter}
                                onChange={(v) => setExtraPricesRows((prev) => prev.map((r, i) => i === idx ? { ...r, otherPrinter: v } : r))}
                                placeholder="--"
                                className="w-full rounded-lg px-3 py-2 bg-pos-bg text-pos-text"
                              />
                            </td>
                            <td className="w-[320px] px-4 py-2">
                              <input
                                type="text"
                                value={row.otherPrice}
                                onChange={(e) => setExtraPricesRows((prev) => prev.map((r, i) => i === idx ? { ...r, otherPrice: e.target.value } : r))}
                                onFocus={() => { setExtraPricesSelectedIndex(idx); setProductActiveField('extraOtherPrice'); }}
                                className="w-full rounded-lg ml-[100px] max-w-[120px] px-3 py-2 border border-pos-border bg-pos-panel text-pos-text"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-center justify-around px-[400px]">
                    <button type="button" className="p-2 rounded-lg text-white hover:bg-pos-panel disabled:opacity-50 text-3xl" disabled={extraPricesSelectedIndex <= 0} onClick={() => { if (extraPricesSelectedIndex > 0) { setExtraPricesRows((prev) => { const next = [...prev]; const t = next[extraPricesSelectedIndex]; next[extraPricesSelectedIndex] = next[extraPricesSelectedIndex - 1]; next[extraPricesSelectedIndex - 1] = t; return next; }); setExtraPricesSelectedIndex((i) => i - 1); } }} aria-label="Move up">↑</button>
                    <button type="button" className="p-2 rounded-lg text-white hover:bg-pos-panel disabled:opacity-50 text-3xl" disabled={extraPricesSelectedIndex >= extraPricesRows.length - 1} onClick={() => { if (extraPricesSelectedIndex < extraPricesRows.length - 1) { setExtraPricesRows((prev) => { const next = [...prev]; const t = next[extraPricesSelectedIndex]; next[extraPricesSelectedIndex] = next[extraPricesSelectedIndex + 1]; next[extraPricesSelectedIndex + 1] = t; return next; }); setExtraPricesSelectedIndex((i) => i + 1); } }} aria-label="Move down">↓</button>
                  </div>
                  <div className="flex justify-center">
                    <button type="button" className="flex items-center gap-4 px-5 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 text-2xl" onClick={handleSaveProduct} disabled={savingProduct}>
                      <svg fill="#ffffff" width="24" height="24" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M-5.732,2.97-7.97.732a2.474,2.474,0,0,0-1.483-.7A.491.491,0,0,0-9.591,0H-18.5A2.5,2.5,0,0,0-21,2.5v11A2.5,2.5,0,0,0-18.5,16h11A2.5,2.5,0,0,0-5,13.5V4.737A2.483,2.483,0,0,0-5.732,2.97ZM-13,1V5.455h-3.591V1Zm-4.272,14V10.545h8.544V15ZM-6,13.5A1.5,1.5,0,0,1-7.5,15h-.228V10.045a.5.5,0,0,0-.5-.5h-9.544a.5.5,0,0,0-.5.5V15H-18.5A1.5,1.5,0,0,1-20,13.5V2.5A1.5,1.5,0,0,1-18.5,1h.909V5.955a.5.5,0,0,0,.5.5h7.5a.5.5,0,0,0,.5-.5v-4.8a1.492,1.492,0,0,1,.414.285l2.238,2.238A1.511,1.511,0,0,1-6,4.737Z" transform="translate(21)" /></svg>
                      {tr('control.save', 'Save')}
                    </button>
                  </div>
                </div>
              )}
              {productTab === 'purchase_stock' && (
                <div className="p-6 flex flex-col gap-6 text-xl">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col gap-6">
                      <div className='flex items-center gap-2'>
                        <label className="block text-pos-text mb-1 mr-[65px]">Purchase VAT:</label>
                        <Dropdown options={VAT_PERCENT_OPTIONS} value={purchaseVat} onChange={setPurchaseVat} placeholder="--" className="border min-w-[150px] border-pos-border rounded-lg px-3 py-2 bg-pos-bg text-pos-text" />
                      </div>
                      <div className='flex items-center gap-2'>
                        <label className="block text-pos-text mb-1 mr-[20px]">Purchase price excl:</label>
                        <input type="text" value={purchasePriceExcl} onChange={(e) => setPurchasePriceExcl(e.target.value)} onFocus={() => setProductActiveField('purchasePriceExcl')} className="border max-w-[220px] border-pos-border rounded-lg px-3 py-2 bg-pos-bg text-pos-text" />
                      </div>
                      <div className='flex items-center gap-2'>
                        <label className="block text-pos-text mb-1 mr-[20px]">Purchase price incl.:</label>
                        <input type="text" value={purchasePriceIncl} onChange={(e) => setPurchasePriceIncl(e.target.value)} onFocus={() => setProductActiveField('purchasePriceIncl')} className="border max-w-[220px] border-pos-border rounded-lg px-3 py-2 bg-pos-bg text-pos-text" />
                      </div>
                      <div className='flex items-center gap-2'>
                        <label className="block text-pos-text mb-1 mr-[35px]">Profit percentage:</label>
                        <input type="text" value={profitPct} onChange={(e) => setProfitPct(e.target.value)} onFocus={() => setProductActiveField('profitPct')} className="border border-pos-border rounded-lg px-3 max-w-[220px] py-2 bg-pos-bg text-pos-text" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-6">
                      <div className='flex items-center gap-2'>
                        <label className="block text-pos-text mb-1 mr-[75px]">Unit:</label>
                        <Dropdown options={PURCHASE_UNIT_OPTIONS} value={purchaseUnit} onChange={setPurchaseUnit} placeholder="--" className="border border-pos-border min-w-[150px] rounded-lg px-3 py-2 bg-pos-bg text-pos-text" />
                      </div>
                      <div className='flex items-center gap-2'>
                        <label className="block text-pos-text mb-1 mr-[10px]">Unit content:</label>
                        <input type="text" value={unitContent} onChange={(e) => setUnitContent(e.target.value)} onFocus={() => setProductActiveField('unitContent')} className="border border-pos-border rounded-lg px-3 py-2 bg-pos-bg text-pos-text" />
                      </div>
                      <div className='flex items-center gap-2'>
                        <label className="block text-pos-text mb-1 mr-[70px]">Stock:</label>
                        <input type="text" value={stock} onChange={(e) => setStock(e.target.value)} onFocus={() => setProductActiveField('stock')} className="border border-pos-border rounded-lg px-3 py-2 bg-pos-bg text-pos-text" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-6">
                      <div className='flex items-center gap-28'>
                        <label className="block text-pos-text pr-3 mb-1">Supplier:</label>
                        <Dropdown options={PURCHASE_SUPPLIER_OPTIONS} value={purchaseSupplier} onChange={setPurchaseSupplier} placeholder="--" className="border min-w-[150px] border-pos-border rounded-lg px-3 py-2 bg-pos-bg text-pos-text" />
                      </div>
                      <div className='flex items-center gap-16'>
                        <label className="block text-pos-text pr-3 mb-1">Supplier code:</label>
                        <input type="text" value={supplierCode} onChange={(e) => setSupplierCode(e.target.value)} onFocus={() => setProductActiveField('supplierCode')} className="border max-w-[200px] border-pos-border rounded-lg px-3 py-2 bg-pos-bg text-pos-text" />
                      </div>
                      <label className="flex items-center gap-12 text-pos-text">
                        Stock notification
                        <input type="checkbox" checked={stockNotification} onChange={(e) => setStockNotification(e.target.checked)} className="rounded w-8 h-8 border-pos-border" />
                      </label>
                      <div className='flex items-center gap-2'>
                        <label className="block text-pos-text mb-1 pr-[55px]">Expiration date:</label>
                        <input type="text" value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)} onFocus={() => setProductActiveField('expirationDate')} className="border border-pos-border max-w-[200px] rounded-lg px-3 py-2 bg-pos-bg text-pos-text" placeholder="" />
                      </div>
                      <div className='flex items-center gap-2'>
                        <label className="block text-pos-text pr-[10px] mb-1">Declaration of expiry:</label>
                        <div className="flex items-center gap-2">
                          <input type="text" value={declarationExpiryDays} onChange={(e) => setDeclarationExpiryDays(e.target.value)} onFocus={() => setProductActiveField('declarationExpiryDays')} className="border max-w-[80px] border-pos-border rounded-lg px-3 py-2 bg-pos-bg text-pos-text max-w-[120px]" />
                          <span className="text-pos-text text-md">days in advance</span>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <label className="block text-pos-text mb-1 pr-[10px]">Notification sold out:</label>
                        <div className="flex items-center gap-2">
                          <input type="text" value={notificationSoldOutPieces} onChange={(e) => setNotificationSoldOutPieces(e.target.value)} onFocus={() => setProductActiveField('notificationSoldOutPieces')} className="border max-w-[80px] border-pos-border rounded-lg px-3 py-2 bg-pos-bg text-pos-text max-w-[120px]" />
                          <span className="text-pos-text text-md">pieces in advance</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center absolute top-[50%] left-0 right-0">
                    <button type="button" className="flex text-2xl items-center gap-4 px-5 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700" onClick={handleSaveProduct} disabled={savingProduct}>
                      <svg fill="#ffffff" width="20" height="20" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M-5.732,2.97-7.97.732a2.474,2.474,0,0,0-1.483-.7A.491.491,0,0,0-9.591,0H-18.5A2.5,2.5,0,0,0-21,2.5v11A2.5,2.5,0,0,0-18.5,16h11A2.5,2.5,0,0,0-5,13.5V4.737A2.483,2.483,0,0,0-5.732,2.97ZM-13,1V5.455h-3.591V1Zm-4.272,14V10.545h8.544V15ZM-6,13.5A1.5,1.5,0,0,1-7.5,15h-.228V10.045a.5.5,0,0,0-.5-.5h-9.544a.5.5,0,0,0-.5.5V15H-18.5A1.5,1.5,0,0,1-20,13.5V2.5A1.5,1.5,0,0,1-18.5,1h.909V5.955a.5.5,0,0,0,.5.5h7.5a.5.5,0,0,0,.5-.5v-4.8a1.492,1.492,0,0,1,.414.285l2.238,2.238A1.511,1.511,0,0,1-6,4.737Z" transform="translate(21)" /></svg>
                      {tr('control.save', 'Save')}
                    </button>
                  </div>
                </div>
              )}
              {productTab === 'webshop' && (
                <div className="p-6 flex flex-col gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex text-xl flex-col gap-4">
                      <label className="flex items-center gap-2 text-pos-text">
                        In webshop:
                        <input type="checkbox" checked={productInWebshop} onChange={(e) => setProductInWebshop(e.target.checked)} className="w-8 h-8 ml-[100px] rounded border-pos-border" />
                      </label>
                      <label className="flex items-center gap-2 text-pos-text">
                        Online orderable:
                        <input type="checkbox" checked={webshopOnlineOrderable} onChange={(e) => setWebshopOnlineOrderable(e.target.checked)} className="w-8 h-8 ml-[57px] rounded border-pos-border" />
                      </label>
                      <div className='flex items-center gap-2'>
                        <label className="block text-pos-text mb-1 mr-[65px]">Website remark:</label>
                        <input type="text" value={websiteRemark} onChange={(e) => setWebsiteRemark(e.target.value)} onFocus={() => setProductActiveField('websiteRemark')} className="border max-w-[220px] border-pos-border rounded-lg px-3 py-2 bg-pos-bg text-pos-text" />
                      </div>
                      <div className='flex items-center gap-2'>
                        <label className="block text-pos-text mb-1 mr-[75px]">Website order:</label>
                        <input type="text" value={websiteOrder} onChange={(e) => setWebsiteOrder(e.target.value)} onFocus={() => setProductActiveField('websiteOrder')} className="border max-w-[220px] border-pos-border rounded-lg px-3 py-2 bg-pos-bg text-pos-text" />
                      </div>
                    </div>
                    <div className="flex text-xl flex-col gap-4">
                      <div className='flex items-center gap-2'>
                        <label className="block text-pos-text mb-1 mr-[70px]">Short web text:</label>
                        <input type="text" value={shortWebText} onChange={(e) => setShortWebText(e.target.value)} onFocus={() => setProductActiveField('shortWebText')} className="border max-w-[220px] border-pos-border rounded-lg px-3 py-2 bg-pos-bg text-pos-text" />
                      </div>
                      <div className='flex items-center gap-2'>
                        <label className="block text-pos-text mb-1 mr-[70px]">Website photo:</label>
                        <div className="flex items-center gap-2">
                          <label className="px-4 py-2 border border-pos-border rounded-lg text-pos-text hover:bg-pos-panel cursor-pointer shrink-0">
                            Choose File
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => setWebsitePhotoFileName(e.target.files?.[0]?.name ?? '')} />
                          </label>
                          <span className="text-pos-muted text-xl">{websitePhotoFileName || 'No file chosen'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <button type="button" className="flex items-center gap-2 px-5 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700" onClick={handleSaveProduct} disabled={savingProduct}>
                      <svg fill="#ffffff" width="20" height="20" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M-5.732,2.97-7.97.732a2.474,2.474,0,0,0-1.483-.7A.491.491,0,0,0-9.591,0H-18.5A2.5,2.5,0,0,0-21,2.5v11A2.5,2.5,0,0,0-18.5,16h11A2.5,2.5,0,0,0-5,13.5V4.737A2.483,2.483,0,0,0-5.732,2.97ZM-13,1V5.455h-3.591V1Zm-4.272,14V10.545h8.544V15ZM-6,13.5A1.5,1.5,0,0,1-7.5,15h-.228V10.045a.5.5,0,0,0-.5-.5h-9.544a.5.5,0,0,0-.5.5V15H-18.5A1.5,1.5,0,0,1-20,13.5V2.5A1.5,1.5,0,0,1-18.5,1h.909V5.955a.5.5,0,0,0,.5.5h7.5a.5.5,0,0,0,.5-.5v-4.8a1.492,1.492,0,0,1,.414.285l2.238,2.238A1.511,1.511,0,0,1-6,4.737Z" transform="translate(21)" /></svg>
                      {tr('control.save', 'Save')}
                    </button>
                  </div>
                </div>
              )}
              {productTab === 'kiosk' && (
                <div className="p-6 flex flex-col  gap-6">
                  <div className="grid grid-cols-2 gap-4 text-xl">
                    <div className='flex flex-col gap-5'>
                      <div className='flex items-center gap-2'>
                        <label className="block w-[150px] text-pos-text mb-1">Kiosk info:</label>
                        <input type="text" value={kioskInfo} onChange={(e) => setKioskInfo(e.target.value)} onFocus={() => setProductActiveField('kioskInfo')} className="border border-pos-border rounded-lg px-3 py-2 bg-pos-bg text-pos-text" />
                      </div>
                      <label className="flex items-center gap-2 text-pos-text">
                        Kiosk take away:
                        <input type="checkbox" checked={kioskTakeAway} onChange={(e) => setKioskTakeAway(e.target.checked)} className="w-8 h-8 ml-4 rounded border-pos-border" />
                      </label>
                      <div className='flex items-center gap-2'>
                        <label className="block w-[150px] text-pos-text mb-1">Kiosk eat in:</label>
                        <input type="text" value={kioskEatIn} onChange={(e) => setKioskEatIn(e.target.value)} onFocus={() => setProductActiveField('kioskEatIn')} className="border border-pos-border rounded-lg px-3 py-2 bg-pos-bg text-pos-text max-w-md" />
                      </div>
                      <div className='flex items-center gap-2'>
                        <label className="block w-[150px] text-pos-text mb-1">Kiosk subtitle:</label>
                        <input type="text" value={kioskSubtitle} onChange={(e) => setKioskSubtitle(e.target.value)} onFocus={() => setProductActiveField('kioskSubtitle')} className="border border-pos-border rounded-lg px-3 py-2 bg-pos-bg text-pos-text" />
                      </div>
                      <div className='flex items-center gap-2'>
                        <label className="block text-pos-text w-[150px] mb-1">Kiosk min. subs:</label>
                        <Dropdown options={KIOSK_SUBS_OPTIONS} value={kioskMinSubs} onChange={setKioskMinSubs} className="min-w-[200px] border border-pos-border rounded-lg px-3 py-2 bg-pos-bg text-pos-text" />
                      </div>
                      <div className='flex items-center gap-2'>
                        <label className="block text-pos-text w-[150px] mb-1">Kiosk max. subs:</label>
                        <Dropdown options={KIOSK_SUBS_OPTIONS} value={kioskMaxSubs} onChange={setKioskMaxSubs} className="min-w-[200px]  border border-pos-border rounded-lg px-3 py-2 bg-pos-bg text-pos-text" />
                      </div>
                    </div>
                    <div className='flex items-start gap-2'>
                      <div className='flex items-center'>
                        <label className="block text-pos-text mb-1 pr-10">Kiosk picture:</label>
                        <div className="flex items-center gap-2">
                          <label className="px-4 py-2 border border-pos-border rounded-lg text-pos-text hover:bg-pos-panel cursor-pointer shrink-0">
                            Choose File
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => setKioskPictureFileName(e.target.files?.[0]?.name ?? '')} />
                          </label>
                          <span className="text-pos-muted text-xl pl-5">{kioskPictureFileName || 'No file chosen'}</span>
                        </div>

                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <button type="button" className="flex items-center gap-2 px-5 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700" onClick={handleSaveProduct} disabled={savingProduct}>
                      <svg fill="#ffffff" width="20" height="20" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M-5.732,2.97-7.97.732a2.474,2.474,0,0,0-1.483-.7A.491.491,0,0,0-9.591,0H-18.5A2.5,2.5,0,0,0-21,2.5v11A2.5,2.5,0,0,0-18.5,16h11A2.5,2.5,0,0,0-5,13.5V4.737A2.483,2.483,0,0,0-5.732,2.97ZM-13,1V5.455h-3.591V1Zm-4.272,14V10.545h8.544V15ZM-6,13.5A1.5,1.5,0,0,1-7.5,15h-.228V10.045a.5.5,0,0,0-.5-.5h-9.544a.5.5,0,0,0-.5.5V15H-18.5A1.5,1.5,0,0,1-20,13.5V2.5A1.5,1.5,0,0,1-18.5,1h.909V5.955a.5.5,0,0,0,.5.5h7.5a.5.5,0,0,0,.5-.5v-4.8a1.492,1.492,0,0,1,.414.285l2.238,2.238A1.511,1.511,0,0,1-6,4.737Z" transform="translate(21)" /></svg>
                      {tr('control.save', 'Save')}
                    </button>
                  </div>
                </div>
              )}
            </div>
            {/* Keyboard fixed at bottom in every tab */}
            <div className="shrink-0">
              <KeyboardWithNumpad value={productKeyboardValue} onChange={productKeyboardOnChange} />
            </div>
          </div>
        </div>
      )}

      {/* Product positioning modal */}
      {showProductPositioningModal && (() => {
        const GRID_COLUMNS = 5;
        const GRID_ROWS = 5;
        const PAGE_SIZE = GRID_COLUMNS * GRID_ROWS;
        const positionCategoryId = positioningCategoryId || selectedCategoryId || categories[0]?.id || null;
        const positioningProducts = products
          .filter((p) => p.categoryId === positionCategoryId)
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
          .map((p) => ({ ...p, type: 'product', _positioningId: `p:${p.id}` }));
        const allItems = [...positioningProducts, ...positioningSubproducts];
        const itemMap = new Map(allItems.map((it) => [it._positioningId, it]));
        const hasStoredLayout = Array.isArray(positioningLayoutByCategory[positionCategoryId]);
        let cells = [];
        if (hasStoredLayout) {
          const existingLayout = positioningLayoutByCategory[positionCategoryId].slice(0, PAGE_SIZE);
          while (existingLayout.length < PAGE_SIZE) existingLayout.push(null);
          cells = existingLayout.map((id) => (id && itemMap.has(id) ? id : null));
        } else {
          // No auto-placement: keep grid empty until user drags items from sidebar.
          cells = Array.from({ length: PAGE_SIZE }, () => null);
        }
        const pages = 1;
        const categoryColors = positioningColorByCategory[positionCategoryId] || {};
        const categoryIndex = categories.findIndex((c) => c.id === positionCategoryId);
        const canPrevCategory = categoryIndex > 0;
        const canNextCategory = categoryIndex >= 0 && categoryIndex < categories.length - 1;
        const COLOR_OPTIONS = [
          { id: 'green', className: 'bg-green-500 text-white' },
          { id: 'blue', className: 'bg-blue-700 text-white' },
          { id: 'pink', className: 'bg-pink-300 text-white' },
          { id: 'orange', className: 'bg-orange-300 text-white' },
          { id: 'yellow', className: 'bg-yellow-300 text-white' },
          { id: 'gray', className: 'bg-gray-400 text-white' },
        ];
        const tileClassByColorId = (colorId, fallbackType) => {
          const found = COLOR_OPTIONS.find((c) => c.id === colorId);
          if (found) return found.className;
          return fallbackType === 'subproduct' ? 'bg-amber-500 text-white' : 'bg-green-500 text-white';
        };
        const updateLayout = (nextCells) => {
          if (!positionCategoryId) return;
          const normalized = Array.from({ length: PAGE_SIZE }, (_, i) => nextCells[i] || null);
          setPositioningLayoutByCategory((prev) => ({ ...prev, [positionCategoryId]: normalized }));
        };
        const removeFromPlace = () => {
          let idx = Number.isInteger(positioningSelectedCellIndex) ? positioningSelectedCellIndex : -1;
          if (idx < 0 || idx >= PAGE_SIZE) {
            if (positioningSelectedProductId) {
              idx = cells.findIndex((id) => {
                const item = id ? itemMap.get(id) : null;
                return item?.id === positioningSelectedProductId;
              });
            }
          }
          if (idx < 0 || idx >= PAGE_SIZE) return;
          const next = [...cells];
          next[idx] = null;
          updateLayout(next);
          if (positionCategoryId) {
            setPositioningColorByCategory((prev) => {
              const byCategory = { ...(prev[positionCategoryId] || {}) };
              delete byCategory[String(idx)];
              return { ...prev, [positionCategoryId]: byCategory };
            });
          }
          setPositioningSelectedProductId(null);
          setPositioningSelectedCellIndex(null);
        };
        const applyColorToSelectedCell = (colorId) => {
          if (!positionCategoryId) return;
          if (!Number.isInteger(positioningSelectedCellIndex) || positioningSelectedCellIndex < 0 || positioningSelectedCellIndex >= PAGE_SIZE) return;
          setPositioningColorByCategory((prev) => {
            const byCategory = { ...(prev[positionCategoryId] || {}) };
            byCategory[String(positioningSelectedCellIndex)] = colorId;
            return { ...prev, [positionCategoryId]: byCategory };
          });
        };
        const handleDragStartFromPool = (event, itemId) => {
          event.dataTransfer.setData('text/plain', JSON.stringify({ itemId, source: 'pool' }));
          event.dataTransfer.effectAllowed = 'move';
        };
        const handleDragStartFromCell = (event, index, itemId) => {
          event.dataTransfer.setData('text/plain', JSON.stringify({ itemId, source: 'cell', index }));
          event.dataTransfer.effectAllowed = 'move';
        };
        const handleDropOnCell = (event, targetIndex) => {
          event.preventDefault();
          let payload = null;
          try {
            payload = JSON.parse(event.dataTransfer.getData('text/plain') || '{}');
          } catch {
            return;
          }
          const itemId = payload?.itemId;
          if (!itemId || !itemMap.has(itemId)) return;
          const next = [...cells];
          const sourceIndex = next.findIndex((id) => id === itemId);
          const movingFromCell = sourceIndex >= 0;
          const targetItemBeforeMove = next[targetIndex];
          if (sourceIndex >= 0) next[sourceIndex] = null;
          if (payload?.source === 'cell' && Number.isInteger(payload?.index) && payload.index >= 0 && payload.index < PAGE_SIZE && payload.index !== targetIndex) {
            const targetItem = next[targetIndex];
            if (targetItem) next[payload.index] = targetItem;
          }
          next[targetIndex] = itemId;
          updateLayout(next);
          if (positionCategoryId) {
            setPositioningColorByCategory((prev) => {
              const byCategory = { ...(prev[positionCategoryId] || {}) };
              const sourceKey = String(sourceIndex);
              const targetKey = String(targetIndex);
              const sourceColor = movingFromCell ? byCategory[sourceKey] : undefined;
              const targetColor = byCategory[targetKey];

              if (movingFromCell && sourceIndex !== targetIndex) {
                if (sourceColor) byCategory[targetKey] = sourceColor; else delete byCategory[targetKey];
                if (targetItemBeforeMove && targetColor) byCategory[sourceKey] = targetColor; else delete byCategory[sourceKey];
              } else if (!movingFromCell) {
                // Item comes from pool: target cell gets item without inheriting previous tile color.
                delete byCategory[targetKey];
              }
              return { ...prev, [positionCategoryId]: byCategory };
            });
          }
        };
        const handleDropOnPool = (event) => {
          event.preventDefault();
          let payload = null;
          try {
            payload = JSON.parse(event.dataTransfer.getData('text/plain') || '{}');
          } catch {
            return;
          }
          const itemId = payload?.itemId;
          if (!itemId || !itemMap.has(itemId)) return;
          const next = cells.map((id) => (id === itemId ? null : id));
          updateLayout(next);
        };

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="relative bg-gray-100 rounded-xl shadow-2xl w-full max-w-[1320px] h-[850px] overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="absolute top-4 right-4 z-10 p-2 rounded text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                onClick={closeProductPositioningModal}
                aria-label="Close positioning modal"
              >
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>

              <div className="h-full p-8 flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <button
                    type="button"
                    className="p-2 rounded text-gray-700 hover:bg-gray-200 disabled:opacity-40"
                    disabled={!canPrevCategory}
                    onClick={() => {
                      if (!canPrevCategory) return;
                      setPositioningCategoryId(categories[categoryIndex - 1].id);
                      setPositioningSelectedProductId(null);
                      setPositioningSelectedCellIndex(null);
                    }}
                    aria-label="Previous category"
                  >
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <div className="flex-1 overflow-x-auto">
                    <div className="flex min-w-max border-b border-gray-300">
                      {categories.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => { setPositioningCategoryId(c.id); setPositioningSelectedProductId(null); setPositioningSelectedCellIndex(null); }}
                          className={`px-10 py-4 text-3xl border-r border-gray-300 ${c.id === positionCategoryId ? 'bg-blue-400 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                          {(c.name || '').toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="p-2 rounded text-gray-700 hover:bg-gray-200 disabled:opacity-40"
                    disabled={!canNextCategory}
                    onClick={() => {
                      if (!canNextCategory) return;
                      setPositioningCategoryId(categories[categoryIndex + 1].id);
                      setPositioningSelectedProductId(null);
                      setPositioningSelectedCellIndex(null);
                    }}
                    aria-label="Next category"
                  >
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>

                <div className="flex justify-center gap-8 mb-4">
                  {Array.from({ length: pages }, (_, i) => (
                    <span key={i} className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-gray-800' : 'bg-gray-400'}`} />
                  ))}
                </div>

                <div className="flex-1 grid grid-cols-[280px_1fr] gap-8">
                  <div
                    className="border border-gray-300 bg-white p-3 overflow-y-auto"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDropOnPool}
                  >
                    <div className="grid grid-cols-1 gap-2">
                      {allItems
                        .filter((it) => !cells.includes(it._positioningId))
                        .map((item) => (
                          <button
                            key={item._positioningId}
                            type="button"
                            draggable
                            onDragStart={(e) => handleDragStartFromPool(e, item._positioningId)}
                            className={`text-left px-3 py-2 rounded border text-sm ${item.type === 'product' ? 'bg-green-500/90 text-white border-green-600' : 'bg-amber-500/90 text-white border-amber-600'
                              }`}
                          >
                            <div className="truncate">{item.name}</div>
                            <div className="text-xs opacity-90">€{Number(item._positioningPrice ?? item.price ?? 0).toFixed(2)} · {item.type}</div>
                          </button>
                        ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-0 border border-gray-300 bg-white">
                    {cells.map((itemId, idx) => {
                      const item = itemId ? itemMap.get(itemId) : null;
                      const selected = item && positioningSelectedProductId === item.id && positioningSelectedCellIndex === idx;
                      const selectedColorId = categoryColors[String(idx)];
                      const tileClass = item
                        ? tileClassByColorId(selectedColorId, item.type)
                        : 'bg-gray-100';
                      return (
                        <div
                          key={item?.id || `empty-${idx}`}
                          className={`h-[82px] border border-gray-300 px-2 text-center text-xl ${tileClass} ${selected ? 'ring-2 ring-black' : ''}`}
                          style={selected ? { boxShadow: 'inset 0 0 0 2px #111827' } : undefined}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => handleDropOnCell(e, idx)}
                        >
                          {item ? (
                            <button
                              type="button"
                              draggable
                              onDragStart={(e) => handleDragStartFromCell(e, idx, item._positioningId)}
                              onClick={() => {
                                setPositioningSelectedProductId(item.id);
                                setPositioningSelectedCellIndex(idx);
                              }}
                              className="w-full h-full"
                            >
                              <div className="truncate">{item.name}</div>
                              <div className="text-lg">€{Number(item._positioningPrice ?? item.price ?? 0).toFixed(2)}</div>
                            </button>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-center gap-8">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="px-8 py-3 rounded border border-gray-300 text-2xl text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                      disabled={!Number.isInteger(positioningSelectedCellIndex)}
                      onClick={removeFromPlace}
                    >
                      {tr('control.functionButtons.removeFromPlace', 'Remove from place')}
                    </button>
                  </div>
                  <div className="flex gap-3">
                    {COLOR_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        disabled={!Number.isInteger(positioningSelectedCellIndex)}
                        onClick={() => applyColorToSelectedCell(option.id)}
                        className={`w-24 h-12 rounded border border-gray-300 ${option.className} ${Number.isInteger(positioningSelectedCellIndex) &&
                          categoryColors[String(positioningSelectedCellIndex)] === option.id
                          ? 'ring-2 ring-black'
                          : ''
                          }`}
                        aria-label={`Set tile color ${option.id}`}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    className="px-8 py-3 rounded border border-emerald-700 text-2xl text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
                    disabled={savingPositioningLayout}
                    onClick={saveProductPositioningLayout}
                  >
                    {savingPositioningLayout ? tr('control.saving', 'Saving...') : tr('control.save', 'Save')}
                  </button>
                </div>
                {positioningLayoutSaveMessage ? (
                  <div className="mt-2 text-center text-xl text-gray-700">{positioningLayoutSaveMessage}</div>
                ) : null}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Product search keyboard modal */}
      {showProductSearchKeyboard && subNavId === 'Products' && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="relative bg-pos-bg rounded-t-xl shadow-2xl w-full max-w-[1415px] overflow-hidden flex flex-col max-h-[70vh]" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="absolute top-4 right-4 z-10 p-2 rounded text-pos-muted hover:text-pos-text hover:bg-pos-panel" onClick={() => setShowProductSearchKeyboard(false)} aria-label="Close">
              <svg className="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="p-4 shrink-0 pt-20">
              <KeyboardWithNumpad value={productSearch} onChange={setProductSearch} />
            </div>
          </div>
        </div>
      )}

      {/* Product row -> Subproducts modal */}
      {showProductSubproductsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative bg-pos-bg rounded-xl shadow-2xl min-w-[1200px] max-w-[1200px] min-h-[820px] p-10" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="absolute top-4 right-4 p-2 rounded text-gray-600 hover:bg-gray-200 hover:text-gray-900" onClick={closeProductSubproductsModal} aria-label="Close">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div className="grid grid-cols-[360px_1fr] gap-10 mt-10">
              <div className="space-y-5">
                <Dropdown
                  options={[
                    { value: '', label: 'Zonder groep' },
                    ...subproductGroups.map((g) => ({ value: g.id, label: g.name }))
                  ]}
                  value={productSubproductsGroupId}
                  onChange={setProductSubproductsGroupId}
                  className="w-full text-xl"
                />
                <Dropdown
                  options={[
                    { value: '', label: '---' },
                    ...productSubproductsOptions
                      .filter((sp) => !productSubproductsLinked.some((link) => link.subproductId === sp.id))
                      .map((sp) => ({ value: sp.id, label: sp.name }))
                  ]}
                  value={productSubproductsSelectedId}
                  onChange={setProductSubproductsSelectedId}
                  className="w-full text-xl"
                />
                <button
                  type="button"
                  className="inline-flex items-center gap-2 text-gray-500 w-full justify-center hover:text-gray-700 disabled:opacity-50"
                  onClick={handleAddProductSubproductLink}
                  disabled={!productSubproductsSelectedId}
                >
                  <svg className="w-10 h-10 border border-gray-500 rounded-full p-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  <span className="text-2xl">Add</span>
                </button>
              </div>

              <div className="rounded-lg border border-pos-border bg-pos-panel/30 min-h-[560px] p-3 overflow-y-auto">
                {loadingProductSubproductsLinked ? (
                  <div className="text-pos-muted text-xl px-3 py-2">Loading...</div>
                ) : productSubproductsLinked.length === 0 ? (
                  <div className="text-pos-muted text-xl px-3 py-2">No subproducts linked yet.</div>
                ) : (
                  <ul className="space-y-2">
                    {productSubproductsLinked.map((link, idx) => (
                      <li key={link.subproductId} className="flex items-center justify-between px-4 py-2 rounded bg-pos-bg text-pos-text text-3xl">
                        <span className="truncate pr-4">{link.subproductName}</span>
                        <div className="flex items-center gap-4 shrink-0">
                          <button
                            type="button"
                            className="p-1 rounded hover:bg-pos-panel disabled:opacity-40"
                            onClick={() => moveProductSubproductLink(idx, 1)}
                            disabled={idx >= productSubproductsLinked.length - 1}
                            aria-label="Move down"
                          >
                            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m0 0l-6-6m6 6l6-6" /></svg>
                          </button>
                          <button
                            type="button"
                            className="p-1 rounded hover:bg-pos-panel disabled:opacity-40"
                            onClick={() => moveProductSubproductLink(idx, -1)}
                            disabled={idx <= 0}
                            aria-label="Move up"
                          >
                            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m0 0l6 6m-6-6l-6 6" /></svg>
                          </button>
                          <button
                            type="button"
                            className="p-1 rounded hover:bg-pos-panel"
                            onClick={() => removeProductSubproductLink(link.subproductId)}
                            aria-label="Delete"
                          >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                className="px-8 py-3 rounded-lg bg-green-600 text-white text-2xl font-medium hover:bg-green-700 disabled:opacity-50"
                onClick={handleSaveProductSubproducts}
                disabled={savingProductSubproducts || !productSubproductsProduct}
              >
                {savingProductSubproducts ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New / Edit subproduct modal */}
      {showSubproductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative bg-pos-bg rounded-xl border border-pos-border shadow-2xl max-w-[1430px] w-full h-[1050px] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="absolute top-4 right-4 z-10 p-2 rounded text-pos-muted hover:text-pos-text hover:bg-pos-panel" onClick={closeSubproductModal} aria-label="Close">
              <svg className="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="flex-1 overflow-hidden p-6 pb-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 mt-20">
                <div className="md:col-span-1 flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <label className="block text-pos-text text-xl font-medium w-36 shrink-0">Name:</label>
                    <input
                      type="text"
                      value={subproductName}
                      onChange={(e) => handleSubproductNameChange(e.target.value)}
                      onFocus={() => setSubproductActiveField('name')}
                      placeholder=""
                      className="flex-1 px-4 py-3 rounded-lg bg-pos-panel border border-pos-border text-pos-text text-xl"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="block text-pos-text text-xl font-medium w-36 shrink-0">Key name:</label>
                    <input
                      type="text"
                      value={subproductKeyName}
                      onChange={(e) => setSubproductKeyName(e.target.value)}
                      onFocus={() => setSubproductActiveField('keyName')}
                      placeholder=""
                      className="flex-1 px-4 py-3 rounded-lg bg-pos-panel border border-pos-border text-pos-text text-xl"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="block text-pos-text text-xl font-medium w-36 shrink-0">Production name:</label>
                    <input
                      type="text"
                      value={subproductProductionName}
                      onChange={(e) => setSubproductProductionName(e.target.value)}
                      onFocus={() => setSubproductActiveField('productionName')}
                      placeholder=""
                      className="flex-1 px-4 py-3 rounded-lg bg-pos-panel border border-pos-border text-pos-text text-xl"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="block text-pos-text text-xl font-medium w-36 shrink-0">Price:</label>
                    <input
                      type="text"
                      value={subproductPrice}
                      onChange={(e) => setSubproductPrice(e.target.value)}
                      onFocus={() => setSubproductActiveField('price')}
                      placeholder=""
                      className="w-32 px-4 py-3 rounded-lg bg-pos-panel border border-pos-border text-pos-text text-xl"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="block text-pos-text text-xl font-medium w-36 shrink-0">VAT Take out:</label>
                    <Dropdown options={SUBPRODUCT_VAT_OPTIONS} value={subproductVatTakeOut} onChange={setSubproductVatTakeOut} placeholder="--" className="flex-1 min-w-[120px] text-xl" />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="block text-pos-text text-xl font-medium w-36 shrink-0">VAT Eat in:</label>
                    <Dropdown options={SUBPRODUCT_VAT_OPTIONS} value={subproductVatEatIn} onChange={setSubproductVatEatIn} placeholder="--" className="flex-1 min-w-[120px] text-xl" />
                  </div>
                </div>
                <div className="md:col-span-1 flex flex-col gap-4">
                  <div className="flex items-center gap-3 w-full">
                    <label className="block text-pos-text text-xl font-medium w-28 shrink-0">Group:</label>
                    <Dropdown
                      options={subproductGroups.map((g) => ({ value: g.id, label: g.name }))}
                      value={subproductModalGroupId}
                      onChange={setSubproductModalGroupId}
                      placeholder="--"
                      className="flex-1 text-xl min-w-[300px]"
                    />
                  </div>
                  <div className="flex items-center w-full gap-3">
                    <label className="block text-pos-text text-xl font-medium shrink-0">Kiosk picture:</label>
                    {!subproductKioskPicture ? (
                      <label className="px-4 py-2 border border-pos-border rounded-lg text-pos-text hover:bg-pos-panel cursor-pointer shrink-0 text-xl">
                        Select
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file && file.type.startsWith('image/')) {
                              const dataUrl = await new Promise((resolve, reject) => {
                                const reader = new FileReader();
                                reader.onload = () => resolve(String(reader.result || ''));
                                reader.onerror = () => reject(reader.error);
                                reader.readAsDataURL(file);
                              }).catch(() => '');
                              if (dataUrl) setSubproductKioskPicture(dataUrl);
                            }
                            e.target.value = '';
                          }}
                        />
                      </label>
                    ) : (
                      <div className="flex items-center gap-3">
                        <img src={subproductKioskPicture} alt="Kiosk" className="w-[76px] h-[76px] object-cover rounded border border-pos-border" />
                        <button
                          type="button"
                          className="px-3 py-2 border border-pos-border rounded-lg text-pos-text hover:bg-rose-500/30 text-xl"
                          onClick={() => setSubproductKioskPicture('')}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-pos-text text-xl flex w-full justify-center font-medium mb-5">Attach To</label>
                    <div className="border border-pos-border rounded-lg bg-white/5 h-[350px] overflow-y-auto">
                      <ul className="p-2">
                        {categories.length === 0 ? (
                          <li className="text-pos-muted text-lg py-2">No categories available</li>
                        ) : (
                          categories.map((c) => {
                            const attached = subproductAttachToCategoryIds.includes(c.id);
                            const toggle = () => setSubproductAttachToCategoryIds((prev) => attached ? prev.filter((id) => id !== c.id) : [...prev, c.id]);
                            return (
                              <li
                                key={c.id}
                                role="button"
                                tabIndex={0}
                                className={`text-xl py-1.5 px-2 flex items-center gap-2 cursor-pointer rounded select-none ${attached ? 'text-pos-text font-medium bg-pos-panel' : 'text-pos-muted'} hover:bg-pos-panel/70`}
                                onClick={toggle}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } }}
                                aria-label={attached ? `Attached to ${c.name}. Click to detach.` : `Click to attach to ${c.name}`}
                              >
                                <span className="uppercase font-medium truncate flex-1 min-w-0">{(c.name || '').toUpperCase()}</span>
                                <input
                                  type="checkbox"
                                  checked={attached}
                                  onChange={() => { }}
                                  onClick={(e) => { e.stopPropagation(); toggle(); }}
                                  className="w-6 h-6 rounded border-2 border-pos-border bg-pos-bg text-green-600 focus:ring-green-500 cursor-pointer shrink-0"
                                  aria-label={attached ? `Detach from ${c.name}` : `Attach to ${c.name}`}
                                />
                              </li>
                            );
                          })
                        )}
                      </ul>
                    </div>
                    <div className="flex w-full flex justify-around gap-2 items-center mt-10">
                      <button type="button" className="p-2 rounded bg-pos-bg border border-pos-border text-pos-text hover:bg-pos-panel" aria-label="Move attached list up" onClick={() => setSubproductAttachToCategoryIds((prev) => prev.length < 2 ? prev : [prev[prev.length - 1], ...prev.slice(0, -1)])}><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg></button>
                      <button type="button" className="p-2 rounded bg-pos-bg border border-pos-border text-pos-text hover:bg-pos-panel" aria-label="Move attached list down" onClick={() => setSubproductAttachToCategoryIds((prev) => prev.length < 2 ? prev : [...prev.slice(1), prev[0]])}><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-center absolute top-[50%] left-0 right-0">
                <button type="button" className="flex text-2xl items-center gap-4 px-6 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50" disabled={savingSubproduct} onClick={handleSaveSubproduct}>
                  <svg fill="currentColor" width="24" height="24" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M-5.732,2.97-7.97.732a2.474,2.474,0,0,0-1.483-.7A.491.491,0,0,0-9.591,0H-18.5A2.5,2.5,0,0,0-21,2.5v11A2.5,2.5,0,0,0-18.5,16h11A2.5,2.5,0,0,0-5,13.5V4.737A2.483,2.483,0,0,0-5.732,2.97ZM-13,1V5.455h-3.591V1Zm-4.272,14V10.545h8.544V15ZM-6,13.5A1.5,1.5,0,0,1-7.5,15h-.228V10.045a.5.5,0,0,0-.5-.5h-9.544a.5.5,0,0,0-.5.5V15H-18.5A1.5,1.5,0,0,1-20,13.5V2.5A1.5,1.5,0,0,1-18.5,1h.909V5.955a.5.5,0,0,0,.5.5h7.5a.5.5,0,0,0,.5-.5v-4.8a1.492,1.492,0,0,1,.414.285l2.238,2.238A1.511,1.511,0,0,1-6,4.737Z" transform="translate(21)" /></svg>
                  Save
                </button>
              </div>
            </div>
            <div className="shrink-0 pt-4 px-4 pb-4">
              <KeyboardWithNumpad value={subproductKeyboardValue} onChange={subproductKeyboardOnChange} />
            </div>
          </div>
        </div>
      )}

      {/* Manage Groups modal */}
      {showManageGroupsModal && (() => {
        const sortedGroups = [...subproductGroups].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
        const selectedIdx = selectedManageGroupId ? sortedGroups.findIndex((g) => g.id === selectedManageGroupId) : -1;
        const canMoveUp = selectedIdx > 0;
        const canMoveDown = selectedIdx >= 0 && selectedIdx < sortedGroups.length - 1;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="relative bg-pos-bg rounded-xl shadow-2xl max-w-[1430px] w-full h-[1000px] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <button type="button" className="absolute top-4 right-4 z-10 p-2 rounded text-pos-muted hover:text-pos-text hover:bg-pos-panel" onClick={() => { setShowManageGroupsModal(false); setSelectedManageGroupId(null); }} aria-label="Close">
                <svg className="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <div className="w-full flex items-center justify-around mt-10 px-[300px] gap-3 py-4 shrink-0 pr-14">
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="New group name"
                  className="flex-1 max-w-[350px] px-4 py-3 rounded-lg bg-pos-panel text-pos-text placeholder-pos-muted text-xl focus:outline-none focus:border-green-500"
                />
                <button type="button" className="px-5 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 text-xl shrink-0" disabled={savingGroup} onClick={handleAddGroup}>Add</button>
              </div>
              <div className="flex-1 overflow-auto m-10 p-5 py-1 px-20">
                <table className="w-full border-collapse">
                  <tbody>
                    {sortedGroups.map((grp) => (
                      <tr
                        key={grp.id}
                        className={`border-b w-full items-center h-[50px] flex justify-between border-gray-300 ${selectedManageGroupId === grp.id ? 'bg-pos-panel/70' : ''} hover:bg-pos-panel/50`}
                        onClick={(e) => { if (!e.target.closest('button')) setSelectedManageGroupId(grp.id); }}
                      >
                        <td className="w-full">
                          {editingGroupId === grp.id ? (
                            <div className="flex items-center w-full justify-between gap-2 h-[50px] flex-wrap">
                              <input
                                type="text"
                                value={editingGroupName}
                                onChange={(e) => setEditingGroupName(e.target.value)}
                                className="flex min-w-[200px] px-3 py-2 bg-pos-bg border border-gray-300 rounded-lg text-pos-text text-xl"
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                              />
                              <div className="flex items-center gap-2 shrink-0">
                                <button type="button" className="px-3 py-2 mr-5 rounded-lg bg-green-600 text-white text-xl font-medium disabled:opacity-50 shrink-0" disabled={savingGroup} onClick={(e) => { e.stopPropagation(); handleSaveEditGroup(); }}>Save</button>
                                <button type="button" className="px-3 py-2 rounded-lg bg-pos-bg border border-gray-300 text-pos-text text-xl shrink-0" onClick={(e) => { e.stopPropagation(); setEditingGroupId(null); setEditingGroupName(''); }}>Cancel</button>
                              </div>
                            </div>
                          ) : (
                            <span className="font-medium text-xl">{grp.name}</span>
                          )}
                        </td>
                        {editingGroupId !== grp.id && (
                          <td className="py-3 px-4 text-right flex">
                            <>
                              <button type="button" className="p-2 pr-20 rounded text-pos-text hover:bg-pos-bg inline-flex align-middle" onClick={(e) => { e.stopPropagation(); setEditingGroupId(grp.id); setEditingGroupName(grp.name || ''); }} aria-label="Edit">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                              </button>
                              <button type="button" className="p-2 rounded text-pos-text hover:bg-pos-bg inline-flex align-middle" onClick={(e) => { e.stopPropagation(); setDeleteConfirmGroupId(grp.id); }} aria-label="Delete">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-center w-full justify-around px-[200px] gap-3 pt-4">
                <button type="button" className="p-3 rounded-lg bg-pos-bg border border-pos-border text-pos-text hover:bg-pos-panel disabled:opacity-40 disabled:pointer-events-none" disabled={!selectedManageGroupId || savingGroup || !canMoveUp} onClick={() => selectedManageGroupId && handleMoveGroup(selectedManageGroupId, 'up')} aria-label="Move up">
                  <img src="/arrow-up.svg" alt="" className="w-6 h-6 invert opacity-90" />
                </button>
                <button type="button" className="p-3 rounded-lg bg-pos-bg border border-pos-border text-pos-text hover:bg-pos-panel disabled:opacity-40 disabled:pointer-events-none" disabled={!selectedManageGroupId || savingGroup || !canMoveDown} onClick={() => selectedManageGroupId && handleMoveGroup(selectedManageGroupId, 'down')} aria-label="Move down">
                  <img src="/arrow-down.svg" alt="" className="w-6 h-6 invert opacity-90" />
                </button>
              </div>
              <div className="shrink-0 pt-4 px-4 pb-4">
                <KeyboardWithNumpad
                  value={editingGroupId ? editingGroupName : newGroupName}
                  onChange={editingGroupId ? setEditingGroupName : setNewGroupName}
                />
              </div>
            </div>
          </div>
        );
      })()}

      {/* Logout confirmation modal — same style as delete modal */}
      <DeleteConfirmModal
        open={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
        message={tr('logoutConfirm', 'Are you sure you want to log out?')}
      />
    </div>
  );
}
