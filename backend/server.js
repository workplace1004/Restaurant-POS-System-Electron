import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import os from 'os';
import net from 'net';
import { execFile } from 'child_process';
import { SerialPort } from 'serialport';
import { createCashmaticService } from './services/cashmaticService.js';
import { createPayworldService } from './services/payworldService.js';

const prisma = new PrismaClient();
const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  // Allow browser + mobile clients (RN/installed APK) to connect from LAN IPs.
  cors: { origin: true, methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] }
});

app.use(cors());
app.use(express.json());

function serverLog(scope, message, meta = undefined) {
  const prefix = `[${new Date().toISOString()}] [${scope}]`;
  if (meta === undefined) {
    console.log(`${prefix} ${message}`);
    return;
  }
  console.log(`${prefix} ${message}`, meta);
}

function summarizeCashmaticConnection(connectionString) {
  const raw = String(connectionString || '').trim();
  if (!raw) return { configured: false };
  try {
    const parsed = JSON.parse(raw);
    const url = parsed?.url ? String(parsed.url) : '';
    let urlHost = '';
    let urlPort = '';
    if (url) {
      try {
        const u = new URL(url);
        urlHost = u.hostname || '';
        urlPort = u.port || '';
      } catch {
        // ignore invalid URL
      }
    }
    return {
      configured: true,
      ip: parsed?.ip || parsed?.ipAddress || '',
      port: parsed?.port || '',
      urlHost,
      urlPort,
      hasUsername: !!(parsed?.username || parsed?.userName || parsed?.user || parsed?.login),
      hasPassword: !!(parsed?.password || parsed?.pass || parsed?.pwd || parsed?.secret),
    };
  } catch {
    return { configured: true, raw };
  }
}

function summarizePayworldConnection(connectionString) {
  const raw = String(connectionString || '').trim();
  if (!raw) return { configured: false };
  try {
    const parsed = JSON.parse(raw);
    return {
      configured: true,
      ip: parsed?.ip || parsed?.ipAddress || '',
      port: parsed?.port || '',
      posId: parsed?.posId || '',
      currencyCode: parsed?.currencyCode || '',
      timeoutMs: parsed?.timeoutMs || '',
    };
  } catch {
    if (raw.startsWith('tcp://')) {
      const match = raw.match(/tcp:\/\/([^:]+):?(\d+)?/i);
      return {
        configured: true,
        ip: match?.[1] || '',
        port: match?.[2] || '',
      };
    }
    return { configured: true, raw };
  }
}

const SETTING_KEY_PRODUCT_SUBPRODUCT_LINKS = 'product_subproduct_links';

async function loadProductSubproductLinksMap() {
  const row = await prisma.appSetting.findUnique({ where: { key: SETTING_KEY_PRODUCT_SUBPRODUCT_LINKS } });
  if (!row?.value) return {};
  try {
    const parsed = JSON.parse(row.value);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function normalizeProductSubproductLinks(list) {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  const normalized = [];
  for (const raw of list) {
    const subproductId = raw?.subproductId != null ? String(raw.subproductId).trim() : '';
    if (!subproductId || seen.has(subproductId)) continue;
    seen.add(subproductId);
    normalized.push({
      subproductId,
      groupId: raw?.groupId != null ? String(raw.groupId).trim() : ''
    });
  }
  return normalized;
}

// REST: categories
app.get('/api/categories', async (req, res) => {
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: 'asc' }, include: { products: true } });
  res.json(categories);
});

app.post('/api/categories', async (req, res) => {
  try {
    const { name, inWebshop, displayOnCashRegister, nextCourse } = req.body;
    const count = await prisma.category.count();
    const created = await prisma.category.create({
      data: {
        name: name != null && String(name).trim() !== '' ? String(name).trim() : 'New category',
        inWebshop: inWebshop !== false,
        displayOnCashRegister: displayOnCashRegister !== false,
        nextCourse: nextCourse != null && String(nextCourse).trim() !== '' ? String(nextCourse).trim() : null,
        sortOrder: count + 1
      }
    });
    res.status(201).json(created);
  } catch (err) {
    console.error('POST /api/categories', err);
    res.status(500).json({ error: err.message || 'Failed to create category' });
  }
});

app.patch('/api/categories/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { name, inWebshop, displayOnCashRegister, nextCourse, sortOrder } = req.body;
    const data = {};
    if (name !== undefined) data.name = String(name).trim() || 'New category';
    if (inWebshop !== undefined) data.inWebshop = inWebshop !== false;
    if (displayOnCashRegister !== undefined) data.displayOnCashRegister = displayOnCashRegister !== false;
    if (nextCourse !== undefined) data.nextCourse = nextCourse != null && String(nextCourse).trim() !== '' ? String(nextCourse).trim() : null;
    if (typeof sortOrder === 'number') data.sortOrder = sortOrder;
    const updated = await prisma.category.update({ where: { id }, data });
    res.json(updated);
  } catch (err) {
    console.error('PATCH /api/categories/:id', err);
    res.status(500).json({ error: err.message || 'Failed to update category' });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    await prisma.category.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    console.error('DELETE /api/categories/:id', err);
    res.status(500).json({ error: err.message || 'Failed to delete category' });
  }
});

// REST: products by category
app.get('/api/categories/:id/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { categoryId: req.params.id },
      orderBy: { sortOrder: 'asc' }
    });
    res.json(products);
  } catch (err) {
    console.error('GET /api/categories/:id/products', err);
    res.status(500).json({ error: err.message || 'Failed to load products' });
  }
});

// Subproducts for a product (by product.addition = subproduct group name or id)
app.get('/api/products/:id/subproducts', async (req, res) => {
  try {
    const linksMap = await loadProductSubproductLinksMap();
    const links = normalizeProductSubproductLinks(linksMap?.[req.params.id]);
    const idOrder = new Map(links.map((l, idx) => [l.subproductId, idx]));
    const ids = links.map((l) => l.subproductId);
    if (ids.length === 0) return res.json([]);
    const items = await prisma.subproduct.findMany({
      where: { id: { in: ids } }
    });
    const sorted = items
      .filter((sp) => idOrder.has(sp.id))
      .sort((a, b) => idOrder.get(a.id) - idOrder.get(b.id));
    res.json(sorted);
  } catch (err) {
    console.error('GET /api/products/:id/subproducts', err);
    res.status(500).json({ error: err.message || 'Failed to load subproducts' });
  }
});

// Next product number (unique numeric id for display)
app.get('/api/products/next-number', async (req, res) => {
  try {
    const max = await prisma.product.aggregate({ _max: { number: true } });
    const next = (max._max.number ?? 0) + 1;
    res.json({ nextNumber: next });
  } catch (err) {
    console.error('GET /api/products/next-number', err);
    res.status(500).json({ error: err.message || 'Failed to get next number' });
  }
});

// Build product payload from body (for POST create; optional fields)
function productDataFromBody(body, forCreate = false) {
  const str = (v) => (v != null && v !== '' ? String(v) : null);
  const num = (v) => (typeof v === 'number' ? v : typeof v === 'string' && v !== '' ? parseFloat(v) : null);
  const bool = (v) => (typeof v === 'boolean' ? v : v === 'true' || v === 1);
  const data = {};
  if (body.name !== undefined) data.name = String(body.name).trim() || 'New product';
  if (body.price !== undefined) data.price = typeof body.price === 'number' ? body.price : parseFloat(body.price) || 0;
  if (body.categoryId !== undefined) data.categoryId = body.categoryId || undefined;
  if (body.sortOrder !== undefined && typeof body.sortOrder === 'number') data.sortOrder = body.sortOrder;
  // General
  if (body.keyName !== undefined) data.keyName = str(body.keyName);
  if (body.productionName !== undefined) data.productionName = str(body.productionName);
  if (body.vatTakeOut !== undefined) data.vatTakeOut = str(body.vatTakeOut);
  if (body.vatEatIn !== undefined) data.vatEatIn = str(body.vatEatIn);
  if (body.barcode !== undefined) data.barcode = str(body.barcode);
  if (body.printer1 !== undefined) data.printer1 = str(body.printer1);
  if (body.printer2 !== undefined) data.printer2 = str(body.printer2);
  if (body.printer3 !== undefined) data.printer3 = str(body.printer3);
  if (body.addition !== undefined) data.addition = str(body.addition);
  if (body.categoryIdsJson !== undefined) data.categoryIdsJson = typeof body.categoryIdsJson === 'string' ? body.categoryIdsJson : JSON.stringify(body.categoryIds || []);
  // Advanced
  if (body.openPrice !== undefined) data.openPrice = bool(body.openPrice);
  if (body.weegschaal !== undefined) data.weegschaal = bool(body.weegschaal);
  if (body.subproductRequires !== undefined) data.subproductRequires = bool(body.subproductRequires);
  if (body.leeggoedPrijs !== undefined) data.leeggoedPrijs = str(body.leeggoedPrijs);
  if (body.pagerVerplicht !== undefined) data.pagerVerplicht = bool(body.pagerVerplicht);
  if (body.boldPrint !== undefined) data.boldPrint = bool(body.boldPrint);
  if (body.groupingReceipt !== undefined) data.groupingReceipt = bool(body.groupingReceipt);
  if (body.labelExtraInfo !== undefined) data.labelExtraInfo = str(body.labelExtraInfo);
  if (body.kassaPhotoPath !== undefined) data.kassaPhotoPath = str(body.kassaPhotoPath);
  if (body.voorverpakVervaltype !== undefined) data.voorverpakVervaltype = str(body.voorverpakVervaltype);
  if (body.houdbareDagen !== undefined) data.houdbareDagen = str(body.houdbareDagen);
  if (body.bewarenGebruik !== undefined) data.bewarenGebruik = str(body.bewarenGebruik);
  // Extra prices
  if (body.extraPricesJson !== undefined) data.extraPricesJson = typeof body.extraPricesJson === 'string' ? body.extraPricesJson : JSON.stringify(body.extraPrices || []);
  // Purchase and stock
  if (body.purchaseVat !== undefined) data.purchaseVat = str(body.purchaseVat);
  if (body.purchasePriceExcl !== undefined) data.purchasePriceExcl = str(body.purchasePriceExcl);
  if (body.purchasePriceIncl !== undefined) data.purchasePriceIncl = str(body.purchasePriceIncl);
  if (body.profitPct !== undefined) data.profitPct = str(body.profitPct);
  if (body.unit !== undefined) data.unit = str(body.unit);
  if (body.unitContent !== undefined) data.unitContent = str(body.unitContent);
  if (body.stock !== undefined) data.stock = str(body.stock);
  if (body.supplierCode !== undefined) data.supplierCode = str(body.supplierCode);
  if (body.stockNotification !== undefined) data.stockNotification = bool(body.stockNotification);
  if (body.expirationDate !== undefined) data.expirationDate = str(body.expirationDate);
  if (body.declarationExpiryDays !== undefined) data.declarationExpiryDays = str(body.declarationExpiryDays);
  if (body.notificationSoldOutPieces !== undefined) data.notificationSoldOutPieces = str(body.notificationSoldOutPieces);
  // Webshop
  if (body.inWebshop !== undefined) data.inWebshop = bool(body.inWebshop);
  if (body.onlineOrderable !== undefined) data.onlineOrderable = bool(body.onlineOrderable);
  if (body.websiteRemark !== undefined) data.websiteRemark = str(body.websiteRemark);
  if (body.websiteOrder !== undefined) data.websiteOrder = str(body.websiteOrder);
  if (body.shortWebText !== undefined) data.shortWebText = str(body.shortWebText);
  if (body.websitePhotoPath !== undefined) data.websitePhotoPath = str(body.websitePhotoPath);
  // Kiosk
  if (body.kioskInfo !== undefined) data.kioskInfo = str(body.kioskInfo);
  if (body.kioskTakeAway !== undefined) data.kioskTakeAway = bool(body.kioskTakeAway);
  if (body.kioskEatIn !== undefined) data.kioskEatIn = str(body.kioskEatIn);
  if (body.kioskSubtitle !== undefined) data.kioskSubtitle = str(body.kioskSubtitle);
  if (body.kioskMinSubs !== undefined) data.kioskMinSubs = str(body.kioskMinSubs);
  if (body.kioskMaxSubs !== undefined) data.kioskMaxSubs = str(body.kioskMaxSubs);
  if (body.kioskPicturePath !== undefined) data.kioskPicturePath = str(body.kioskPicturePath);
  return data;
}

// REST: products CRUD
app.post('/api/products', async (req, res) => {
  try {
    const body = req.body;
    const categoryId = (body.categoryId || body.category || '').toString().trim();
    if (!categoryId) {
      return res.status(400).json({ error: 'categoryId is required' });
    }
    const max = await prisma.product.aggregate({ _max: { number: true } });
    const nextNumber = (max._max.number ?? 0) + 1;
    const count = await prisma.product.count({ where: { categoryId } });
    const data = productDataFromBody(body, true);
    data.number = nextNumber;
    data.name = (data.name || 'New product').toString().trim();
    data.price = typeof data.price === 'number' ? data.price : parseFloat(data.price) || 0;
    data.categoryId = categoryId;
    data.sortOrder = count;
    // Only pass defined values so Prisma doesn't receive undefined
    const createData = {};
    for (const [k, v] of Object.entries(data)) {
      if (v !== undefined) createData[k] = v;
    }
    const created = await prisma.product.create({ data: createData });
    res.status(201).json(created);
  } catch (err) {
    console.error('POST /api/products', err);
    res.status(500).json({ error: err.message || 'Failed to create product' });
  }
});

app.patch('/api/products/:id', async (req, res) => {
  try {
    const data = productDataFromBody(req.body);
    if (Object.keys(data).length === 0) return res.status(400).json({ error: 'No fields to update' });
    const updated = await prisma.product.update({ where: { id: req.params.id }, data });
    res.json(updated);
  } catch (err) {
    console.error('PATCH /api/products/:id', err);
    res.status(500).json({ error: err.message || 'Failed to update product' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    console.error('DELETE /api/products/:id', err);
    res.status(500).json({ error: err.message || 'Failed to delete product' });
  }
});

// REST: subproduct groups
app.get('/api/subproduct-groups', async (req, res) => {
  const groups = await prisma.subproductGroup.findMany({ orderBy: { sortOrder: 'asc' } });
  res.json(groups);
});

app.post('/api/subproduct-groups', async (req, res) => {
  try {
    const { name } = req.body;
    const count = await prisma.subproductGroup.count();
    const created = await prisma.subproductGroup.create({
      data: { name: name != null && String(name).trim() !== '' ? String(name).trim() : 'New group', sortOrder: count }
    });
    res.status(201).json(created);
  } catch (err) {
    console.error('POST /api/subproduct-groups', err);
    res.status(500).json({ error: err.message || 'Failed to create group' });
  }
});

app.patch('/api/subproduct-groups/:id', async (req, res) => {
  try {
    const { name, sortOrder } = req.body;
    const data = {};
    if (name !== undefined) data.name = String(name).trim() || 'New group';
    if (typeof sortOrder === 'number') data.sortOrder = sortOrder;
    const updated = await prisma.subproductGroup.update({ where: { id: req.params.id }, data });
    res.json(updated);
  } catch (err) {
    console.error('PATCH /api/subproduct-groups/:id', err);
    res.status(500).json({ error: err.message || 'Failed to update group' });
  }
});

app.delete('/api/subproduct-groups/:id', async (req, res) => {
  try {
    await prisma.subproductGroup.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    console.error('DELETE /api/subproduct-groups/:id', err);
    res.status(500).json({ error: err.message || 'Failed to delete group' });
  }
});

// REST: subproducts by group
app.get('/api/subproduct-groups/:id/subproducts', async (req, res) => {
  const subproducts = await prisma.subproduct.findMany({
    where: { groupId: req.params.id },
    orderBy: { sortOrder: 'asc' }
  });
  res.json(subproducts);
});

app.post('/api/subproducts', async (req, res) => {
  try {
    const { name, groupId, price } = req.body;
    if (!groupId) return res.status(400).json({ error: 'groupId required' });
    const count = await prisma.subproduct.count({ where: { groupId } });
    const data = {
      name: name != null && String(name).trim() !== '' ? String(name).trim() : 'New subproduct',
      groupId,
      sortOrder: count
    };
    if (price != null && typeof price === 'number' && !Number.isNaN(price)) data.price = price;
    const created = await prisma.subproduct.create({ data });
    res.status(201).json(created);
  } catch (err) {
    console.error('POST /api/subproducts', err);
    res.status(500).json({ error: err.message || 'Failed to create subproduct' });
  }
});

app.patch('/api/subproducts/:id', async (req, res) => {
  try {
    const { name, sortOrder, price } = req.body;
    const data = {};
    if (name !== undefined) data.name = String(name).trim() || 'New subproduct';
    if (typeof sortOrder === 'number') data.sortOrder = sortOrder;
    if (price !== undefined) data.price = price != null && typeof price === 'number' && !Number.isNaN(price) ? price : null;
    const updated = await prisma.subproduct.update({ where: { id: req.params.id }, data });
    res.json(updated);
  } catch (err) {
    console.error('PATCH /api/subproducts/:id', err);
    res.status(500).json({ error: err.message || 'Failed to update subproduct' });
  }
});

app.delete('/api/subproducts/:id', async (req, res) => {
  try {
    await prisma.subproduct.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    console.error('DELETE /api/subproducts/:id', err);
    res.status(500).json({ error: err.message || 'Failed to delete subproduct' });
  }
});

// REST: kitchen messages
app.get('/api/kitchen-messages', async (req, res) => {
  try {
    const list = await prisma.kitchenMessage.findMany({ orderBy: { name: 'asc' } });
    res.json(list);
  } catch (err) {
    console.error('GET /api/kitchen-messages', err);
    res.status(500).json({ error: err.message || 'Failed to fetch kitchen messages' });
  }
});

app.post('/api/kitchen-messages', async (req, res) => {
  try {
    const name = req.body?.name != null && String(req.body.name).trim() !== '' ? String(req.body.name).trim() : 'New message';
    const created = await prisma.kitchenMessage.create({ data: { name } });
    res.status(201).json(created);
  } catch (err) {
    console.error('POST /api/kitchen-messages', err);
    res.status(500).json({ error: err.message || 'Failed to create kitchen message' });
  }
});

app.patch('/api/kitchen-messages/:id', async (req, res) => {
  try {
    const name = req.body?.name != null && String(req.body.name).trim() !== '' ? String(req.body.name).trim() : 'New message';
    const updated = await prisma.kitchenMessage.update({
      where: { id: req.params.id },
      data: { name }
    });
    res.json(updated);
  } catch (err) {
    console.error('PATCH /api/kitchen-messages/:id', err);
    res.status(500).json({ error: err.message || 'Failed to update kitchen message' });
  }
});

app.delete('/api/kitchen-messages/:id', async (req, res) => {
  try {
    await prisma.kitchenMessage.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/kitchen-messages/:id', err);
    res.status(500).json({ error: err.message || 'Failed to delete kitchen message' });
  }
});

// REST: discounts
app.get('/api/discounts', async (req, res) => {
  try {
    const list = await prisma.discount.findMany({ orderBy: { name: 'asc' } });
    res.json(list);
  } catch (err) {
    console.error('GET /api/discounts', err);
    res.status(500).json({ error: err.message || 'Failed to fetch discounts' });
  }
});

app.post('/api/discounts', async (req, res) => {
  try {
    const body = req.body || {};
    const today = new Date().toISOString().slice(0, 10);
    const created = await prisma.discount.create({
      data: {
        name: body.name != null && String(body.name).trim() !== '' ? String(body.name).trim() : 'New discount',
        trigger: body.trigger != null ? String(body.trigger) : 'number',
        type: body.type != null ? String(body.type) : 'amount',
        value: body.value != null ? String(body.value) : null,
        startDate: body.startDate != null ? String(body.startDate) : today,
        endDate: body.endDate != null ? String(body.endDate) : today,
        discountOn: body.discountOn != null ? String(body.discountOn) : 'products',
        pieces: body.pieces != null ? String(body.pieces) : null,
        combinable: body.combinable === true,
      }
    });
    res.status(201).json(created);
  } catch (err) {
    console.error('POST /api/discounts', err);
    res.status(500).json({ error: err.message || 'Failed to create discount' });
  }
});

app.patch('/api/discounts/:id', async (req, res) => {
  try {
    const body = req.body || {};
    const data = {};
    if (body.name !== undefined) data.name = String(body.name ?? '').trim() || 'New discount';
    if (body.trigger !== undefined) data.trigger = String(body.trigger);
    if (body.type !== undefined) data.type = String(body.type);
    if (body.value !== undefined) data.value = body.value != null ? String(body.value) : null;
    if (body.startDate !== undefined) data.startDate = body.startDate != null ? String(body.startDate) : null;
    if (body.endDate !== undefined) data.endDate = body.endDate != null ? String(body.endDate) : null;
    if (body.discountOn !== undefined) data.discountOn = body.discountOn != null ? String(body.discountOn) : null;
    if (body.pieces !== undefined) data.pieces = body.pieces != null ? String(body.pieces) : null;
    if (body.combinable !== undefined) data.combinable = body.combinable === true;
    const updated = await prisma.discount.update({
      where: { id: req.params.id },
      data
    });
    res.json(updated);
  } catch (err) {
    console.error('PATCH /api/discounts/:id', err);
    res.status(500).json({ error: err.message || 'Failed to update discount' });
  }
});

app.delete('/api/discounts/:id', async (req, res) => {
  try {
    await prisma.discount.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/discounts/:id', err);
    res.status(500).json({ error: err.message || 'Failed to delete discount' });
  }
});

// REST: app settings (e.g. language)
const SETTING_KEY_LANGUAGE = 'language';
const SETTING_KEY_PRODUCT_POSITIONING_LAYOUT = 'product_positioning_layout';
const SETTING_KEY_PRODUCT_POSITIONING_COLORS = 'product_positioning_colors';
const SETTING_KEY_TABLE_SAVED_ORDER_IDS = 'table_saved_order_ids';
const SETTING_KEY_FUNCTION_BUTTONS_LAYOUT = 'function_buttons_layout';
const SETTING_KEY_TABLE_LAYOUTS = 'table_layouts';
const FUNCTION_BUTTON_LAYOUT_ALLOWED_IDS = [
  'tables',
  'weborders',
  'in-wacht',
  'geplande-orders',
  'reservaties',
  'verkopers'
];
const FUNCTION_BUTTON_LAYOUT_SLOT_COUNT = 3;
const normalizeFunctionButtonsLayout = (value) => {
  if (!Array.isArray(value)) return Array(FUNCTION_BUTTON_LAYOUT_SLOT_COUNT).fill('');
  const next = Array(FUNCTION_BUTTON_LAYOUT_SLOT_COUNT).fill('');
  const used = new Set();
  for (let i = 0; i < FUNCTION_BUTTON_LAYOUT_SLOT_COUNT; i += 1) {
    const candidate = String(value[i] || '').trim();
    if (!candidate) continue;
    if (!FUNCTION_BUTTON_LAYOUT_ALLOWED_IDS.includes(candidate)) continue;
    if (used.has(candidate)) continue;
    next[i] = candidate;
    used.add(candidate);
  }
  return next;
};
const normalizeSavedTableOrderEntries = (value) => {
  if (!Array.isArray(value)) return [];
  const byOrderId = new Map();
  for (const raw of value) {
    if (raw == null) continue;
    if (typeof raw === 'string') {
      const orderId = String(raw).trim();
      if (!orderId) continue;
      byOrderId.set(orderId, { orderId, cashierName: '', savedAt: null });
      continue;
    }
    if (typeof raw === 'object') {
      const orderId = String(raw.orderId ?? raw.id ?? '').trim();
      if (!orderId) continue;
      const cashierName = String(raw.cashierName ?? raw.userName ?? raw.name ?? '').trim();
      const savedAtRaw = raw.savedAt != null ? String(raw.savedAt).trim() : '';
      const parsedSavedAt = savedAtRaw ? new Date(savedAtRaw) : null;
      const savedAt = parsedSavedAt && !Number.isNaN(parsedSavedAt.getTime()) ? parsedSavedAt.toISOString() : null;
      byOrderId.set(orderId, { orderId, cashierName, savedAt });
    }
  }
  return Array.from(byOrderId.values());
};

app.get('/api/settings/language', async (req, res) => {
  try {
    const row = await prisma.appSetting.findUnique({ where: { key: SETTING_KEY_LANGUAGE } });
    res.json({ value: row ? row.value : 'en' });
  } catch (err) {
    console.error('GET /api/settings/language', err);
    res.status(500).json({ error: err.message || 'Failed to get language' });
  }
});

app.put('/api/settings/language', async (req, res) => {
  try {
    const value = req.body?.value != null ? String(req.body.value) : 'en';
    const allowed = ['en', 'nl', 'fr', 'tr'];
    const safe = allowed.includes(value) ? value : 'en';
    await prisma.appSetting.upsert({
      where: { key: SETTING_KEY_LANGUAGE },
      create: { key: SETTING_KEY_LANGUAGE, value: safe },
      update: { value: safe }
    });
    res.json({ value: safe });
  } catch (err) {
    console.error('PUT /api/settings/language', err);
    res.status(500).json({ error: err.message || 'Failed to save language' });
  }
});

app.get('/api/settings/product-positioning-layout', async (req, res) => {
  try {
    const row = await prisma.appSetting.findUnique({ where: { key: SETTING_KEY_PRODUCT_POSITIONING_LAYOUT } });
    if (!row?.value) {
      res.json({ value: {} });
      return;
    }
    const parsed = JSON.parse(row.value);
    res.json({ value: parsed && typeof parsed === 'object' ? parsed : {} });
  } catch (err) {
    console.error('GET /api/settings/product-positioning-layout', err);
    res.status(500).json({ error: err.message || 'Failed to get product positioning layout' });
  }
});

app.put('/api/settings/product-positioning-layout', async (req, res) => {
  try {
    const incoming = req.body?.value;
    const safeValue = incoming && typeof incoming === 'object' ? incoming : {};
    const serialized = JSON.stringify(safeValue);
    await prisma.appSetting.upsert({
      where: { key: SETTING_KEY_PRODUCT_POSITIONING_LAYOUT },
      create: { key: SETTING_KEY_PRODUCT_POSITIONING_LAYOUT, value: serialized },
      update: { value: serialized }
    });
    res.json({ value: safeValue });
  } catch (err) {
    console.error('PUT /api/settings/product-positioning-layout', err);
    res.status(500).json({ error: err.message || 'Failed to save product positioning layout' });
  }
});

app.get('/api/settings/product-positioning-colors', async (req, res) => {
  try {
    const row = await prisma.appSetting.findUnique({ where: { key: SETTING_KEY_PRODUCT_POSITIONING_COLORS } });
    if (!row?.value) {
      res.json({ value: {} });
      return;
    }
    const parsed = JSON.parse(row.value);
    res.json({ value: parsed && typeof parsed === 'object' ? parsed : {} });
  } catch (err) {
    console.error('GET /api/settings/product-positioning-colors', err);
    res.status(500).json({ error: err.message || 'Failed to get product positioning colors' });
  }
});

app.put('/api/settings/product-positioning-colors', async (req, res) => {
  try {
    const incoming = req.body?.value;
    const safeValue = incoming && typeof incoming === 'object' ? incoming : {};
    const serialized = JSON.stringify(safeValue);
    await prisma.appSetting.upsert({
      where: { key: SETTING_KEY_PRODUCT_POSITIONING_COLORS },
      create: { key: SETTING_KEY_PRODUCT_POSITIONING_COLORS, value: serialized },
      update: { value: serialized }
    });
    res.json({ value: safeValue });
  } catch (err) {
    console.error('PUT /api/settings/product-positioning-colors', err);
    res.status(500).json({ error: err.message || 'Failed to save product positioning colors' });
  }
});

app.get('/api/settings/table-saved-orders', async (req, res) => {
  try {
    const row = await prisma.appSetting.findUnique({ where: { key: SETTING_KEY_TABLE_SAVED_ORDER_IDS } });
    if (!row?.value) {
      res.json({ value: [] });
      return;
    }
    const parsed = JSON.parse(row.value);
    const safeValue = normalizeSavedTableOrderEntries(parsed);
    res.json({ value: safeValue });
  } catch (err) {
    console.error('GET /api/settings/table-saved-orders', err);
    res.status(500).json({ error: err.message || 'Failed to get saved table orders' });
  }
});

app.put('/api/settings/table-saved-orders', async (req, res) => {
  try {
    const incoming = req.body?.value;
    const safeValue = normalizeSavedTableOrderEntries(incoming);
    const serialized = JSON.stringify(safeValue);
    await prisma.appSetting.upsert({
      where: { key: SETTING_KEY_TABLE_SAVED_ORDER_IDS },
      create: { key: SETTING_KEY_TABLE_SAVED_ORDER_IDS, value: serialized },
      update: { value: serialized }
    });
    res.json({ value: safeValue });
  } catch (err) {
    console.error('PUT /api/settings/table-saved-orders', err);
    res.status(500).json({ error: err.message || 'Failed to save table orders' });
  }
});

app.get('/api/settings/function-buttons-layout', async (req, res) => {
  try {
    const row = await prisma.appSetting.findUnique({ where: { key: SETTING_KEY_FUNCTION_BUTTONS_LAYOUT } });
    if (!row?.value) {
      res.json({ value: normalizeFunctionButtonsLayout([]) });
      return;
    }
    const parsed = JSON.parse(row.value);
    res.json({ value: normalizeFunctionButtonsLayout(parsed) });
  } catch (err) {
    console.error('GET /api/settings/function-buttons-layout', err);
    res.status(500).json({ error: err.message || 'Failed to get function buttons layout' });
  }
});

app.put('/api/settings/function-buttons-layout', async (req, res) => {
  try {
    const incoming = req.body?.value;
    const safeValue = normalizeFunctionButtonsLayout(incoming);
    const serialized = JSON.stringify(safeValue);
    await prisma.appSetting.upsert({
      where: { key: SETTING_KEY_FUNCTION_BUTTONS_LAYOUT },
      create: { key: SETTING_KEY_FUNCTION_BUTTONS_LAYOUT, value: serialized },
      update: { value: serialized }
    });
    res.json({ value: safeValue });
  } catch (err) {
    console.error('PUT /api/settings/function-buttons-layout', err);
    res.status(500).json({ error: err.message || 'Failed to save function buttons layout' });
  }
});

app.get('/api/settings/table-layouts', async (req, res) => {
  try {
    const row = await prisma.appSetting.findUnique({ where: { key: SETTING_KEY_TABLE_LAYOUTS } });
    if (!row?.value) {
      res.json({ value: {} });
      return;
    }
    const parsed = JSON.parse(row.value);
    res.json({ value: parsed && typeof parsed === 'object' ? parsed : {} });
  } catch (err) {
    console.error('GET /api/settings/table-layouts', err);
    res.status(500).json({ error: err.message || 'Failed to get table layouts' });
  }
});

app.put('/api/settings/table-layouts', async (req, res) => {
  try {
    const incoming = req.body?.value;
    const safeValue = incoming && typeof incoming === 'object' ? incoming : {};
    const serialized = JSON.stringify(safeValue);
    await prisma.appSetting.upsert({
      where: { key: SETTING_KEY_TABLE_LAYOUTS },
      create: { key: SETTING_KEY_TABLE_LAYOUTS, value: serialized },
      update: { value: serialized }
    });
    res.json({ value: safeValue });
  } catch (err) {
    console.error('PUT /api/settings/table-layouts', err);
    res.status(500).json({ error: err.message || 'Failed to save table layouts' });
  }
});

app.get('/api/products/:id/subproduct-links', async (req, res) => {
  try {
    const linksMap = await loadProductSubproductLinksMap();
    const links = normalizeProductSubproductLinks(linksMap?.[req.params.id]);
    const groupIds = [...new Set(links.map((l) => l.groupId).filter(Boolean))];
    const subproductIds = links.map((l) => l.subproductId);
    const [groups, subproducts] = await Promise.all([
      groupIds.length
        ? prisma.subproductGroup.findMany({ where: { id: { in: groupIds } } })
        : Promise.resolve([]),
      subproductIds.length
        ? prisma.subproduct.findMany({ where: { id: { in: subproductIds } } })
        : Promise.resolve([])
    ]);
    const groupMap = new Map(groups.map((g) => [g.id, g]));
    const subMap = new Map(subproducts.map((s) => [s.id, s]));
    const expanded = links
      .map((l) => {
        const sub = subMap.get(l.subproductId);
        if (!sub) return null;
        const group = groupMap.get(l.groupId);
        return {
          subproductId: sub.id,
          subproductName: sub.name,
          groupId: group?.id || sub.groupId || '',
          groupName: group?.name || ''
        };
      })
      .filter(Boolean);
    res.json(expanded);
  } catch (err) {
    console.error('GET /api/products/:id/subproduct-links', err);
    res.status(500).json({ error: err.message || 'Failed to load product subproduct links' });
  }
});

app.put('/api/products/:id/subproduct-links', async (req, res) => {
  try {
    const links = normalizeProductSubproductLinks(req.body?.links);
    const linksMap = await loadProductSubproductLinksMap();
    linksMap[req.params.id] = links;
    await prisma.appSetting.upsert({
      where: { key: SETTING_KEY_PRODUCT_SUBPRODUCT_LINKS },
      create: { key: SETTING_KEY_PRODUCT_SUBPRODUCT_LINKS, value: JSON.stringify(linksMap) },
      update: { value: JSON.stringify(linksMap) }
    });
    res.json({ links });
  } catch (err) {
    console.error('PUT /api/products/:id/subproduct-links', err);
    res.status(500).json({ error: err.message || 'Failed to save product subproduct links' });
  }
});

// REST: orders (current/open)
app.get('/api/orders', async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { status: { in: ['open', 'in_planning'] } },
    include: { items: { include: { product: true } }, table: true, customer: true }
  });
  res.json(orders);
});

// REST: create order
app.post('/api/orders', async (req, res) => {
  const { tableId, items } = req.body;
  const order = await prisma.order.create({
    data: {
      tableId: tableId || null,
      status: 'open',
      total: 0,
      items: items?.length
        ? {
            create: items.map(({ productId, quantity, price, notes }) => ({
              productId,
              quantity,
              price,
              notes: notes || null
            }))
          }
        : undefined
    },
    include: { items: { include: { product: true } }, table: true }
  });
  if (order.items?.length) {
    const total = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
    await prisma.order.update({ where: { id: order.id }, data: { total } });
    order.total = total;
  }
  io.emit('order:updated', order);
  res.json(order);
});

// REST: update order (add/remove items, set table, status)
app.patch('/api/orders/:id', async (req, res) => {
  const { tableId, status, items } = req.body;
  const updates = {};
  if (tableId !== undefined) updates.tableId = tableId;
  if (status !== undefined) updates.status = status;
  if (items !== undefined) {
    await prisma.orderItem.deleteMany({ where: { orderId: req.params.id } });
    if (items.length) {
      await prisma.orderItem.createMany({
        data: items.map(({ productId, quantity, price, notes }) => ({
          orderId: req.params.id,
          productId,
          quantity,
          price,
          notes: notes || null
        }))
      });
    }
    const orderWithItems = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: true }
    });
    updates.total = orderWithItems?.items?.reduce((s, i) => s + i.price * i.quantity, 0) ?? 0;
  }
  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: updates,
    include: { items: { include: { product: true } }, table: true }
  });
  io.emit('order:updated', order);
  res.json(order);
});

// REST: add item to order
app.post('/api/orders/:id/items', async (req, res) => {
  const { productId, quantity = 1, price, notes } = req.body;
  const item = await prisma.orderItem.create({
    data: { orderId: req.params.id, productId, quantity, price, notes: notes || null },
    include: { product: true }
  });
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { items: { include: { product: true } }, table: true }
  });
  const total = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  await prisma.order.update({ where: { id: req.params.id }, data: { total } });
  const updated = { ...order, total };
  io.emit('order:updated', updated);
  res.json(updated);
});

// REST: update order item quantity
app.patch('/api/orders/:id/items/:itemId', async (req, res) => {
  try {
    const orderId = req.params.id;
    const itemId = req.params.itemId;

    const item = await prisma.orderItem.findFirst({
      where: { id: itemId, orderId }
    });
    if (!item) {
      return res.status(404).json({ error: 'Order item not found' });
    }

    const patchData = {};
    if (req.body?.quantity !== undefined) {
      patchData.quantity = Math.max(1, Math.floor(Number(req.body?.quantity)) || 1);
    }
    if (req.body?.notes !== undefined) {
      const notes = String(req.body.notes ?? '').trim();
      patchData.notes = notes ? notes : null;
    }
    if (req.body?.price !== undefined) {
      const parsedPrice = Number(req.body.price);
      if (!Number.isFinite(parsedPrice)) {
        return res.status(400).json({ error: 'Invalid price value' });
      }
      patchData.price = Math.max(0, parsedPrice);
    }
    if (Object.keys(patchData).length === 0) {
      return res.status(400).json({ error: 'No item fields to update' });
    }

    await prisma.orderItem.update({
      where: { id: itemId },
      data: patchData
    });
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } }, table: true }
    });
    const total = order?.items?.reduce((s, i) => s + i.price * i.quantity, 0) ?? 0;
    await prisma.order.update({ where: { id: orderId }, data: { total } });
    const updated = { ...order, total };
    io.emit('order:updated', updated);
    res.json(updated);
  } catch (err) {
    console.error('PATCH /api/orders/:id/items/:itemId', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// REST: remove order item
app.delete('/api/orders/:id/items/:itemId', async (req, res) => {
  await prisma.orderItem.delete({ where: { id: req.params.itemId } });
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { items: { include: { product: true } }, table: true }
  });
  const total = order?.items?.reduce((s, i) => s + i.price * i.quantity, 0) ?? 0;
  await prisma.order.update({ where: { id: req.params.id }, data: { total } });
  const updated = { ...order, total };
  io.emit('order:updated', updated);
  res.json(updated);
});

// REST: delete single order (OrderItem cascades)
app.delete('/api/orders/:id', async (req, res) => {
  await prisma.order.delete({ where: { id: req.params.id } });
  io.emit('order:deleted', { id: req.params.id });
  res.json({ ok: true });
});

// REST: delete all orders (open + in_planning); OrderItem cascades
app.delete('/api/orders', async (req, res) => {
  await prisma.order.deleteMany({
    where: { status: { in: ['open', 'in_planning'] } }
  });
  io.emit('orders:cleared');
  res.json({ ok: true });
});

// REST: tables (table locations / areas). Optional ?roomId= to filter by room.
app.get('/api/tables', async (req, res) => {
  try {
    const roomId = req.query.roomId != null ? String(req.query.roomId).trim() || undefined : undefined;
    const tables = await prisma.table.findMany({
      where: roomId != null ? { roomId } : undefined,
      include: { orders: { where: { status: 'open' } }, room: true },
      orderBy: { name: 'asc' }
    });
    res.json(tables);
  } catch (err) {
    console.error('GET /api/tables', err);
    res.status(500).json({ error: err.message || 'Failed to load tables' });
  }
});

app.post('/api/tables', async (req, res) => {
  try {
    const name = req.body.name != null ? String(req.body.name).trim() : 'New location';
    const roomId = req.body.roomId != null ? String(req.body.roomId).trim() || null : null;
    const created = await prisma.table.create({
      data: { name: name || 'New location', status: 'available', roomId }
    });
    res.status(201).json(created);
  } catch (err) {
    console.error('POST /api/tables', err);
    res.status(500).json({ error: err.message || 'Failed to create table location' });
  }
});

app.patch('/api/tables/:id', async (req, res) => {
  try {
    const name = req.body.name != null ? String(req.body.name).trim() : undefined;
    const roomId = req.body.roomId !== undefined ? (req.body.roomId != null ? String(req.body.roomId).trim() || null : null) : undefined;
    const data = {};
    if (name !== undefined) data.name = name || 'New location';
    if (roomId !== undefined) data.roomId = roomId;
    if (Object.keys(data).length === 0) return res.status(400).json({ error: 'No fields to update' });
    const updated = await prisma.table.update({
      where: { id: req.params.id },
      data
    });
    res.json(updated);
  } catch (err) {
    console.error('PATCH /api/tables/:id', err);
    res.status(500).json({ error: err.message || 'Failed to update table location' });
  }
});

app.delete('/api/tables/:id', async (req, res) => {
  try {
    await prisma.table.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    console.error('DELETE /api/tables/:id', err);
    res.status(500).json({ error: err.message || 'Failed to delete table location' });
  }
});

// Sync table names from Set tables layout: ensure each name has a Table record for this room (create if missing)
app.post('/api/tables/sync', async (req, res) => {
  try {
    const roomId = req.body?.roomId != null ? String(req.body.roomId).trim() || null : null;
    const raw = req.body?.names;
    const names = Array.isArray(raw) ? raw.map((n) => String(n ?? '').trim()).filter(Boolean) : [];
    const seen = new Set();
    const created = [];
    for (const name of names) {
      if (seen.has(name)) continue;
      seen.add(name);
      const existing = await prisma.table.findFirst({
        where: { name, roomId: roomId ?? null }
      });
      if (!existing) {
        const t = await prisma.table.create({
          data: { name, status: 'available', roomId }
        });
        created.push(t);
      }
    }
    res.json({ ok: true, created: created.length });
  } catch (err) {
    console.error('POST /api/tables/sync', err);
    res.status(500).json({ error: err.message || 'Failed to sync tables' });
  }
});

// REST: rooms (floor/area settings for table layouts)
app.get('/api/rooms', async (req, res) => {
  try {
    const rooms = await prisma.room.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }]
    });
    res.json(rooms);
  } catch (err) {
    console.error('GET /api/rooms', err);
    res.status(500).json({ error: err.message || 'Failed to load rooms' });
  }
});

app.post('/api/rooms', async (req, res) => {
  try {
    const name = req.body?.name != null ? String(req.body.name).trim() : 'New room';
    const background = req.body?.background != null ? String(req.body.background) : '';
    const textColor = req.body?.textColor === 'dark' ? 'dark' : 'light';
    const created = await prisma.room.create({
      data: { name: name || 'New room', background, textColor }
    });
    res.status(201).json(created);
  } catch (err) {
    console.error('POST /api/rooms', err);
    res.status(500).json({ error: err.message || 'Failed to create room' });
  }
});

app.patch('/api/rooms/:id', async (req, res) => {
  try {
    const name = req.body?.name != null ? String(req.body.name).trim() : undefined;
    const background = req.body?.background != null ? String(req.body.background) : undefined;
    const textColor = req.body?.textColor != null ? (req.body.textColor === 'dark' ? 'dark' : 'light') : undefined;
    const layoutJson = req.body?.layoutJson !== undefined ? (req.body.layoutJson == null ? null : String(req.body.layoutJson)) : undefined;
    const data = {};
    if (name !== undefined) data.name = name || 'New room';
    if (background !== undefined) data.background = background;
    if (textColor !== undefined) data.textColor = textColor;
    if (layoutJson !== undefined) data.layoutJson = layoutJson;
    if (Object.keys(data).length === 0) return res.status(400).json({ error: 'No fields to update' });
    const updated = await prisma.room.update({
      where: { id: req.params.id },
      data
    });
    res.json(updated);
  } catch (err) {
    console.error('PATCH /api/rooms/:id', err);
    res.status(500).json({ error: err.message || 'Failed to update room' });
  }
});

app.delete('/api/rooms/:id', async (req, res) => {
  try {
    await prisma.room.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    console.error('DELETE /api/rooms/:id', err);
    res.status(500).json({ error: err.message || 'Failed to delete room' });
  }
});

// REST: weborders list (source weborder, open/in_planning) for modal
app.get('/api/weborders', async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { source: 'weborder', status: { in: ['open', 'in_planning'] } },
    include: { customer: true, items: { include: { product: true } } },
    orderBy: { createdAt: 'asc' }
  });
  res.json(orders);
});

// REST: weborders count (orders with source weborder, open/in_planning)
app.get('/api/weborders/count', async (req, res) => {
  const count = await prisma.order.count({ where: { source: 'weborder', status: { in: ['open', 'in_planning'] } } });
  res.json({ count });
});

// REST: in-planning count
app.get('/api/orders/in-planning/count', async (req, res) => {
  const count = await prisma.order.count({ where: { status: 'in_planning' } });
  res.json({ count });
});

// REST: order history (paid orders, newest settlement first)
app.get('/api/orders/history', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { status: 'paid' },
      include: { table: true },
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }]
    });
    res.json(orders);
  } catch (err) {
    console.error('GET /api/orders/history', err);
    res.status(500).json({ error: err.message || 'Failed to fetch order history' });
  }
});

// REST: users (for login screen and control view)
app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({ orderBy: { name: 'asc' } });
    res.json(users.map((u) => ({ id: u.id, name: u.name, label: u.name })));
  } catch (err) {
    console.error('GET /api/users', err);
    res.status(500).json({ error: err.message || 'Failed to fetch users' });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user.id, name: user.name, label: user.name, pin: user.pin });
  } catch (err) {
    console.error('GET /api/users/:id', err);
    res.status(500).json({ error: err.message || 'Failed to fetch user details' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { name, pin } = req.body;
    const created = await prisma.user.create({
      data: {
        name: name != null && String(name).trim() !== '' ? String(name).trim() : 'New user',
        role: 'waiter',
        pin: pin != null ? String(pin) : '1234'
      }
    });
    res.status(201).json({ id: created.id, name: created.name, label: created.name });
  } catch (err) {
    console.error('POST /api/users', err);
    res.status(500).json({ error: err.message || 'Failed to create user' });
  }
});

app.patch('/api/users/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { name, pin } = req.body;
    const data = {};
    if (name !== undefined) data.name = String(name).trim() || 'New user';
    if (pin !== undefined) data.pin = String(pin);
    const updated = await prisma.user.update({ where: { id }, data });
    res.json({ id: updated.id, name: updated.name, label: updated.name });
  } catch (err) {
    console.error('PATCH /api/users/:id', err);
    res.status(500).json({ error: err.message || 'Failed to update user' });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    console.error('DELETE /api/users/:id', err);
    res.status(500).json({ error: err.message || 'Failed to delete user' });
  }
});

// REST: login (validate user + PIN)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { userId, pin } = req.body;
    if (!userId || pin === undefined) {
      return res.status(400).json({ error: 'userId and pin required' });
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.pin !== String(pin)) {
      return res.status(401).json({ error: 'Wrong PIN' });
    }
    res.json({ id: user.id, name: user.name, label: user.name });
  } catch (err) {
    console.error('POST /api/auth/login', err);
    res.status(500).json({ error: err.message || 'Login failed' });
  }
});

// REST: price groups
app.get('/api/price-groups', async (req, res) => {
  try {
    const list = await prisma.priceGroup.findMany({ orderBy: { sortOrder: 'asc' } });
    res.json(list);
  } catch (err) {
    console.error('GET /api/price-groups', err);
    res.status(500).json({ error: err.message || 'Failed to fetch price groups' });
  }
});

app.post('/api/price-groups', async (req, res) => {
  try {
    const { name, tax } = req.body;
    const count = await prisma.priceGroup.count();
    const taxValue = tax != null && String(tax).trim() !== '' ? String(tax).trim() : null;
    const created = await prisma.priceGroup.create({
      data: {
        name: name != null && String(name).trim() !== '' ? String(name).trim() : 'New price group',
        tax: taxValue,
        sortOrder: count + 1
      }
    });
    res.status(201).json(created);
  } catch (err) {
    console.error('POST /api/price-groups', err);
    res.status(500).json({ error: err.message || 'Failed to create price group' });
  }
});

app.patch('/api/price-groups/:id', async (req, res) => {
  try {
    const { name, tax } = req.body;
    const data = {};
    if (name !== undefined) data.name = String(name ?? '').trim() || 'New price group';
    if (tax !== undefined) data.tax = tax != null && String(tax).trim() !== '' ? String(tax).trim() : null;
    const updated = await prisma.priceGroup.update({
      where: { id: req.params.id },
      data
    });
    res.json(updated);
  } catch (err) {
    console.error('PATCH /api/price-groups/:id', err);
    res.status(500).json({ error: err.message || 'Failed to update price group' });
  }
});

app.delete('/api/price-groups/:id', async (req, res) => {
  try {
    await prisma.priceGroup.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/price-groups/:id', err);
    res.status(500).json({ error: err.message || 'Failed to delete price group' });
  }
});

// ---------- Payment terminals (Cashmatic / Bancontact) – same API as 123 ----------
function paymentTerminalToApi(t) {
  if (!t) return t;
  return {
    id: t.id,
    name: t.name,
    type: t.type,
    connection_type: t.connectionType,
    connection_string: t.connectionString,
    enabled: t.enabled,
    is_main: t.isMain ?? 0,
  };
}

app.get('/api/payment-terminals', async (req, res) => {
  try {
    const list = await prisma.paymentTerminal.findMany({ orderBy: [{ isMain: 'desc' }, { createdAt: 'desc' }] });
    res.json({ data: list.map(paymentTerminalToApi) });
  } catch (err) {
    console.error('GET /api/payment-terminals', err);
    res.status(500).json({ error: err.message || 'Failed to fetch payment terminals' });
  }
});

app.get('/api/payment-terminals/:id', async (req, res) => {
  try {
    const t = await prisma.paymentTerminal.findUnique({ where: { id: req.params.id } });
    if (!t) return res.status(404).json({ error: 'Payment terminal not found' });
    res.json(paymentTerminalToApi(t));
  } catch (err) {
    console.error('GET /api/payment-terminals/:id', err);
    res.status(500).json({ error: err.message || 'Failed to fetch terminal' });
  }
});

app.post('/api/payment-terminals', async (req, res) => {
  try {
    const { name, type, connection_type, connection_string, enabled, is_main } = req.body;
    if (!name || type == null) return res.status(400).json({ error: 'name and type are required' });
    if (is_main) await prisma.paymentTerminal.updateMany({ data: { isMain: 0 } });
    const created = await prisma.paymentTerminal.create({
      data: {
        name: String(name).trim(),
        type: String(type).trim(),
        connectionType: (connection_type != null ? connection_type : 'tcp').toString().trim(),
        connectionString: connection_string != null ? String(connection_string).trim() : '',
        enabled: enabled === 0 || enabled === false ? 0 : 1,
        isMain: is_main ? 1 : 0,
      },
    });
    res.status(201).json(paymentTerminalToApi(created));
  } catch (err) {
    console.error('POST /api/payment-terminals', err);
    res.status(500).json({ error: err.message || 'Failed to create payment terminal' });
  }
});

app.put('/api/payment-terminals/:id', async (req, res) => {
  try {
    const { name, type, connection_type, connection_string, enabled, is_main } = req.body;
    const id = req.params.id;
    const data = {};
    if (name !== undefined) data.name = String(name).trim();
    if (type !== undefined) data.type = String(type).trim();
    if (connection_type !== undefined) data.connectionType = String(connection_type).trim();
    if (connection_string !== undefined) data.connectionString = String(connection_string).trim();
    if (enabled !== undefined) data.enabled = enabled === 0 || enabled === false ? 0 : 1;
    if (is_main !== undefined) {
      if (is_main) await prisma.paymentTerminal.updateMany({ where: { id: { not: id } }, data: { isMain: 0 } });
      data.isMain = is_main ? 1 : 0;
    }
    const updated = await prisma.paymentTerminal.update({
      where: { id },
      data,
    });
    res.json(paymentTerminalToApi(updated));
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Payment terminal not found' });
    console.error('PUT /api/payment-terminals/:id', err);
    res.status(500).json({ error: err.message || 'Failed to update payment terminal' });
  }
});

app.delete('/api/payment-terminals/:id', async (req, res) => {
  try {
    await prisma.paymentTerminal.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Payment terminal not found' });
    console.error('DELETE /api/payment-terminals/:id', err);
    res.status(500).json({ error: err.message || 'Failed to delete payment terminal' });
  }
});

app.post('/api/payment-terminals/:id/test', async (req, res) => {
  try {
    const t = await prisma.paymentTerminal.findUnique({ where: { id: req.params.id } });
    if (!t) return res.status(404).json({ success: false, error: 'Payment terminal not found' });
    if (t.type === 'cashmatic') {
      const service = createCashmaticService({ connection_string: t.connectionString });
      const result = await service.testConnection();
      if (result.success) res.json({ success: true, message: result.message });
      else res.status(500).json({ success: false, error: result.message });
    } else if (t.type === 'payworld' || t.type === 'bancontact' || t.type === 'payword') {
      const service = createPayworldService({ connection_string: t.connectionString });
      const result = await service.testConnection();
      if (result.success) res.json({ success: true, message: result.message });
      else res.status(500).json({ success: false, error: result.message });
    } else {
      res.json({ success: true, message: 'Terminal test not implemented for this type' });
    }
  } catch (err) {
    console.error('POST /api/payment-terminals/:id/test', err);
    res.status(500).json({ success: false, error: err.message || 'Test failed' });
  }
});

// ---------- Payment methods (Control + checkout) ----------
app.get('/api/payment-methods', async (req, res) => {
  try {
    const activeOnly =
      req.query.active === '1' ||
      req.query.active === 'true' ||
      req.query.activeOnly === '1' ||
      req.query.activeOnly === 'true';
    const list = await prisma.paymentMethod.findMany({
      where: activeOnly ? { active: true } : undefined,
      orderBy: { sortOrder: 'asc' },
    });
    res.json({ data: list.map(paymentMethodToApi) });
  } catch (err) {
    console.error('GET /api/payment-methods', err);
    res.status(500).json({ error: err.message || 'Failed to fetch payment methods' });
  }
});

app.post('/api/payment-methods', async (req, res) => {
  try {
    const name = String(req.body?.name || '').trim();
    if (!name) return res.status(400).json({ error: 'name is required' });
    const integration = normalizePaymentIntegration(req.body?.integration);
    const active = !(req.body?.active === false || req.body?.active === 0);
    const maxRow = await prisma.paymentMethod.aggregate({ _max: { sortOrder: true } });
    const sortOrder = Number.isFinite(Number(req.body?.sortOrder))
      ? Number(req.body.sortOrder)
      : (maxRow._max.sortOrder ?? -1) + 1;
    const created = await prisma.paymentMethod.create({
      data: { name, integration, active, sortOrder },
    });
    res.status(201).json({ data: paymentMethodToApi(created) });
  } catch (err) {
    console.error('POST /api/payment-methods', err);
    res.status(500).json({ error: err.message || 'Failed to create payment method' });
  }
});

app.put('/api/payment-methods/reorder', async (req, res) => {
  try {
    const ids = req.body?.orderedIds || req.body?.ids;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'orderedIds array is required' });
    }
    await prisma.$transaction(
      ids.map((id, i) =>
        prisma.paymentMethod.update({
          where: { id: String(id) },
          data: { sortOrder: i },
        }),
      ),
    );
    const list = await prisma.paymentMethod.findMany({ orderBy: { sortOrder: 'asc' } });
    res.json({ data: list.map(paymentMethodToApi) });
  } catch (err) {
    console.error('PUT /api/payment-methods/reorder', err);
    res.status(500).json({ error: err.message || 'Failed to reorder payment methods' });
  }
});

app.put('/api/payment-methods/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const data = {};
    if (req.body.name !== undefined) {
      const name = String(req.body.name).trim();
      if (!name) return res.status(400).json({ error: 'name cannot be empty' });
      data.name = name;
    }
    if (req.body.active !== undefined) data.active = !(req.body.active === false || req.body.active === 0);
    if (req.body.integration !== undefined) data.integration = normalizePaymentIntegration(req.body.integration);
    if (req.body.sortOrder !== undefined) data.sortOrder = Number(req.body.sortOrder);
    const updated = await prisma.paymentMethod.update({ where: { id }, data });
    res.json({ data: paymentMethodToApi(updated) });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Payment method not found' });
    console.error('PUT /api/payment-methods/:id', err);
    res.status(500).json({ error: err.message || 'Failed to update payment method' });
  }
});

app.delete('/api/payment-methods/:id', async (req, res) => {
  try {
    await prisma.paymentMethod.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Payment method not found' });
    console.error('DELETE /api/payment-methods/:id', err);
    res.status(500).json({ error: err.message || 'Failed to delete payment method' });
  }
});

// ---------- Printers – same API as 123 ----------
function printerToApi(p) {
  if (!p) return p;
  return {
    id: p.id,
    name: p.name,
    type: p.type,
    connection_string: p.connectionString ?? '',
    baud_rate: p.baudRate,
    data_bits: p.dataBits,
    parity: p.parity,
    stop_bits: p.stopBits,
    is_main: p.isMain,
    enabled: p.enabled,
  };
}

function validatePrinterConnection(type, connectionString) {
  const safeType = String(type || '').trim().toLowerCase();
  const safeConnection = String(connectionString || '').trim();
  if (!safeConnection) return { ok: false, error: 'connection_string is required' };

  if (safeType === 'serial') {
    if (!safeConnection.startsWith('serial://') && !safeConnection.startsWith('\\\\.\\')) {
      return { ok: false, error: 'Invalid serial printer connection string' };
    }
    return { ok: true };
  }

  if (safeType === 'windows') {
    if (safeConnection.startsWith('tcp://')) {
      const [ip, port] = safeConnection.substring(6).split(':');
      if (!ip || !port) return { ok: false, error: 'Invalid network printer address' };
      return { ok: true };
    }
    return { ok: true };
  }

  return { ok: false, error: 'Unsupported printer type' };
}

function formatEuroAmount(value) {
  return `€${(Math.round((Number(value) || 0) * 100) / 100).toFixed(2)}`;
}

const PAYMENT_INTEGRATIONS = new Set(['manual_cash', 'cashmatic', 'payworld', 'generic']);

function normalizePaymentIntegration(value) {
  const v = String(value || '').trim().toLowerCase();
  return PAYMENT_INTEGRATIONS.has(v) ? v : 'generic';
}

function paymentMethodToApi(m) {
  if (!m) return m;
  return {
    id: m.id,
    name: m.name,
    active: !!m.active,
    sortOrder: m.sortOrder ?? 0,
    integration: m.integration || 'generic',
  };
}

/** Build paid total and receipt lines from new `amounts` map or legacy cash/bancontact/visa/payworld. */
async function resolveReceiptPaymentBreakdown(paymentBreakdown, dbTotal) {
  const raw = paymentBreakdown || {};
  const amounts = raw.amounts && typeof raw.amounts === 'object' ? raw.amounts : null;

  if (amounts && Object.keys(amounts).length > 0) {
    const ids = Object.keys(amounts).filter((id) => Math.max(0, Number(amounts[id]) || 0) > 0.0001);
    if (ids.length === 0) {
      return { paidTotal: 0, paymentMethodLines: [], paymentMethodsSummary: {} };
    }
    const methods = await prisma.paymentMethod.findMany({ where: { id: { in: ids } } });
    const byId = new Map(methods.map((m) => [m.id, m]));
    let paidTotalRaw = 0;
    const paymentMethodLines = [];
    const paymentMethodsSummary = {};
    for (const id of ids) {
      const amt = Math.round(Math.max(0, Number(amounts[id]) || 0) * 100) / 100;
      if (amt <= 0) continue;
      paidTotalRaw += amt;
      const m = byId.get(id);
      const label = m?.name ? String(m.name).toUpperCase() : 'METHOD';
      paymentMethodLines.push(`${label}: ${formatEuroAmount(amt)}`);
      paymentMethodsSummary[id] = { name: m?.name || id, amount: amt, integration: m?.integration || 'generic' };
    }
    const paidTotal = Math.round(paidTotalRaw * 100) / 100;
    return { paidTotal, paymentMethodLines, paymentMethodsSummary };
  }

  const cash = Math.max(0, Number(raw.cash) || 0);
  const bancontact = Math.max(0, Number(raw.bancontact) || 0);
  const visa = Math.max(0, Number(raw.visa) || 0);
  const payworld = Math.max(0, Number(raw.payworld) || 0);
  const paidTotalRaw = cash + bancontact + visa + payworld;
  const paidTotal = Math.round((paidTotalRaw > 0 ? paidTotalRaw : dbTotal) * 100) / 100;
  const paymentMethodLines = [
    cash > 0 ? `CASHMATIC: ${formatEuroAmount(cash)}` : null,
    bancontact > 0 ? `BANCONTACT: ${formatEuroAmount(bancontact)}` : null,
    visa > 0 ? `VISA: ${formatEuroAmount(visa)}` : null,
    payworld > 0 ? `PAYWORLD: ${formatEuroAmount(payworld)}` : null,
  ].filter(Boolean);
  return {
    paidTotal,
    paymentMethodLines,
    paymentMethodsSummary: { cash, bancontact, visa, payworld },
  };
}

async function ensureDefaultPaymentMethods() {
  const count = await prisma.paymentMethod.count();
  if (count > 0) return;
  await prisma.paymentMethod.createMany({
    data: [
      { name: 'Cash', integration: 'manual_cash', active: true, sortOrder: 0 },
      { name: 'Cashmatic', integration: 'cashmatic', active: true, sortOrder: 1 },
      { name: 'Card (Payworld)', integration: 'payworld', active: true, sortOrder: 2 },
      { name: 'Bancontact', integration: 'generic', active: true, sortOrder: 3 },
      { name: 'Visa', integration: 'generic', active: false, sortOrder: 4 },
    ],
  });
  serverLog('payment-methods', 'Seeded default payment methods');
}

function parseTcpTarget(connectionString) {
  const s = String(connectionString || '').trim();
  if (!s.startsWith('tcp://')) {
    throw new Error('Printer connection_string is not tcp:// format.');
  }
  const [host = '', port = '9100'] = s.substring(6).split(':');
  const safeHost = host.trim();
  const safePort = Number.parseInt(String(port || '9100').trim(), 10);
  if (!safeHost || !Number.isInteger(safePort) || safePort <= 0 || safePort > 65535) {
    throw new Error(`Invalid TCP printer target: ${s}`);
  }
  return { host: safeHost, port: safePort };
}

function parseSerialPath(connectionString) {
  const s = String(connectionString || '').trim();
  if (!s) throw new Error('Serial printer connection string is empty.');
  if (s.startsWith('serial://')) return (s.substring(9).split('?')[0] || '').trim();
  if (s.startsWith('\\\\.\\')) return s;
  return s;
}

function buildEscPosPayload(receiptLines) {
  const text = `${Array.isArray(receiptLines) ? receiptLines.join('\n') : String(receiptLines || '')}\n`;
  const init = Buffer.from([0x1b, 0x40]); // ESC @ (initialize)
  const body = Buffer.from(text, 'ascii'); // keep ASCII for broad ESC/POS compatibility
  const feed = Buffer.from([0x1b, 0x64, 0x04]); // ESC d n (feed 4 lines)
  const cut = Buffer.from([0x1d, 0x56, 0x00]); // GS V 0 (full cut)
  return Buffer.concat([init, body, feed, cut]);
}

function sendTcpPrint(connectionString, payload) {
  const { host, port } = parseTcpTarget(connectionString);
  const payloadBuffer = Buffer.isBuffer(payload) ? payload : Buffer.from(payload || '');
  return new Promise((resolve, reject) => {
    let settled = false;
    let receivedBytes = 0;
    const socket = net.createConnection({ host, port });
    const finish = (err, details = undefined) => {
      if (settled) return;
      settled = true;
      if (err) reject(err);
      else resolve(details);
    };
    socket.setTimeout(7000);
    socket.on('connect', () => {
      serverLog('printer', 'TCP connected', { host, port });
      serverLog('printer', 'TCP send command', {
        host,
        port,
        bytes: payloadBuffer.length,
        previewHex: payloadBuffer.subarray(0, Math.min(64, payloadBuffer.length)).toString('hex'),
      });
      socket.write(payloadBuffer, (err) => {
        if (err) {
          socket.destroy();
          return finish(err);
        }
        socket.end();
      });
    });
    socket.on('data', (chunk) => {
      receivedBytes += chunk.length;
      serverLog('printer', 'TCP receive response', { host, port, bytes: chunk.length });
    });
    socket.on('timeout', () => {
      socket.destroy();
      finish(new Error(`Printer TCP timeout (${host}:${port})`));
    });
    socket.on('error', (err) => {
      finish(err);
    });
    socket.on('close', (hadError) => {
      serverLog('printer', 'TCP connection closed', { host, port, hadError, receivedBytes });
      if (!hadError) {
        finish(null, { transport: 'tcp', host, port, sentBytes: payloadBuffer.length, receivedBytes });
      }
    });
  });
}

function sendSerialPrint(connectionString, baudRate, payload) {
  const path = parseSerialPath(connectionString);
  const baud = Number.parseInt(String(baudRate || 9600), 10) || 9600;
  const payloadBuffer = Buffer.isBuffer(payload) ? payload : Buffer.from(payload || '');
  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (err, details = undefined) => {
      if (settled) return;
      settled = true;
      if (err) reject(err);
      else resolve(details);
    };
    const serial = new SerialPort({ path, baudRate: baud, autoOpen: false });
    serial.on('open', () => {
      serverLog('printer', 'Serial connected', { path, baudRate: baud });
      serverLog('printer', 'Serial send command', {
        path,
        bytes: payloadBuffer.length,
        previewHex: payloadBuffer.subarray(0, Math.min(64, payloadBuffer.length)).toString('hex'),
      });
      serial.write(payloadBuffer, (writeErr) => {
        if (writeErr) {
          serial.close(() => finish(writeErr));
          return;
        }
        serial.drain((drainErr) => {
          serial.close((closeErr) => {
            if (drainErr) return finish(drainErr);
            if (closeErr) return finish(closeErr);
            finish(null, { transport: 'serial', path, baudRate: baud, sentBytes: payloadBuffer.length, receivedBytes: 0 });
          });
        });
      });
    });
    serial.on('data', (chunk) => {
      serverLog('printer', 'Serial receive response', { path, bytes: chunk.length });
    });
    serial.on('error', (err) => {
      finish(err);
    });
    serial.open((err) => {
      if (err) finish(err);
    });
  });
}

async function sendToPrinter(printer, receiptLines) {
  const safeType = String(printer?.type || '').trim().toLowerCase();
  const connectionString = String(printer?.connectionString || '').trim();
  const payload = buildEscPosPayload(receiptLines);
  if (safeType === 'serial') {
    return sendSerialPrint(connectionString, printer?.baudRate, payload);
  }
  if (safeType === 'windows') {
    if (connectionString.startsWith('tcp://')) {
      return sendTcpPrint(connectionString, payload);
    }
    const printerName = connectionString;
    if (!printerName) throw new Error('Windows printer name is empty.');
    if (process.platform !== 'win32') {
      throw new Error(`Windows printer-name transport is only supported on Windows host. Current platform: ${process.platform}`);
    }
    const text = `${Array.isArray(receiptLines) ? receiptLines.join('\n') : String(receiptLines || '')}\n\n\n`;
    const escapedPrinterName = printerName.replace(/'/g, "''");
    const script =
      `$printerName = '${escapedPrinterName}';\n` +
      `$text = @'\n${text}\n'@;\n` +
      `$text | Out-Printer -Name $printerName`;
    serverLog('printer', 'Windows queue send command', { printerName, bytes: Buffer.byteLength(text, 'utf8') });
    await new Promise((resolve, reject) => {
      execFile(
        'powershell',
        ['-NoProfile', '-Command', script],
        { timeout: 12000, windowsHide: true },
        (err, stdout, stderr) => {
          if (stdout) serverLog('printer', 'Windows queue stdout', { printerName, stdout: String(stdout).trim() });
          if (stderr) serverLog('printer', 'Windows queue stderr', { printerName, stderr: String(stderr).trim() });
          if (err) {
            reject(new Error(`Out-Printer failed for "${printerName}": ${err.message}`));
            return;
          }
          resolve();
        }
      );
    });
    return { transport: 'windows-queue', printerName, sentBytes: Buffer.byteLength(text, 'utf8'), receivedBytes: 0 };
  }
  throw new Error(`Unsupported printer type for send: ${safeType}`);
}

app.get('/api/printers', async (req, res) => {
  try {
    const list = await prisma.printer.findMany({
      orderBy: [{ isMain: 'desc' }, { createdAt: 'asc' }],
    });
    res.json({ data: list.map(printerToApi) });
  } catch (err) {
    console.error('GET /api/printers', err);
    res.status(500).json({ error: err.message || 'Failed to fetch printers' });
  }
});

app.get('/api/printers/defaults', async (req, res) => {
  try {
    const main = await prisma.printer.findFirst({ where: { isMain: 1 } });
    const defaults = {
      serial: { com_port: '', baud_rate: '', data_bits: '', parity: '', stop_bits: '' },
      windows: { windows_ip: '', windows_port: '', printer_name: '' },
    };
    if (main && main.connectionString) {
      if (main.type === 'serial') {
        const s = main.connectionString;
        if (s.startsWith('serial://')) {
          const [portPart] = s.substring(9).split('?');
          defaults.serial.com_port = portPart || '';
        } else if (s.startsWith('\\\\.\\')) defaults.serial.com_port = s.substring(4);
        else defaults.serial.com_port = s;
        defaults.serial.baud_rate = String(main.baudRate ?? '');
        defaults.serial.data_bits = String(main.dataBits ?? '');
        defaults.serial.parity = String(main.parity ?? '');
        defaults.serial.stop_bits = String(main.stopBits ?? '');
      } else if (main.type === 'windows') {
        if (main.connectionString.startsWith('tcp://')) {
          const parts = main.connectionString.substring(6).split(':');
          defaults.windows.windows_ip = parts[0] || '';
          defaults.windows.windows_port = parts[1] || '';
        } else defaults.windows.printer_name = main.connectionString;
      }
    }
    res.json({ data: defaults });
  } catch (err) {
    console.error('GET /api/printers/defaults', err);
    res.status(500).json({ error: err.message || 'Failed to get printer defaults' });
  }
});

app.get('/api/printers/:id', async (req, res) => {
  try {
    const p = await prisma.printer.findUnique({ where: { id: req.params.id } });
    if (!p) return res.status(404).json({ error: 'Printer not found' });
    res.json(printerToApi(p));
  } catch (err) {
    console.error('GET /api/printers/:id', err);
    res.status(500).json({ error: err.message || 'Failed to fetch printer' });
  }
});

app.post('/api/printers', async (req, res) => {
  try {
    const body = req.body;
    if (!body.name || body.type == null) return res.status(400).json({ error: 'name and type are required' });
    if (body.is_main) await prisma.printer.updateMany({ data: { isMain: 0 } });
    const created = await prisma.printer.create({
      data: {
        name: String(body.name).trim(),
        type: String(body.type).trim(),
        connectionString: body.connection_string != null ? String(body.connection_string).trim() : null,
        baudRate: body.baud_rate != null ? parseInt(body.baud_rate, 10) : null,
        dataBits: body.data_bits != null ? parseInt(body.data_bits, 10) : null,
        parity: body.parity != null ? String(body.parity) : null,
        stopBits: body.stop_bits != null ? parseInt(body.stop_bits, 10) : null,
        isMain: body.is_main ? 1 : 0,
        enabled: body.enabled === 0 || body.enabled === false ? 0 : 1,
      },
    });
    res.status(201).json(printerToApi(created));
  } catch (err) {
    console.error('POST /api/printers', err);
    res.status(500).json({ error: err.message || 'Failed to create printer' });
  }
});

app.put('/api/printers/:id', async (req, res) => {
  try {
    const body = req.body;
    const id = req.params.id;
    if (body.is_main) await prisma.printer.updateMany({ where: { id: { not: id } }, data: { isMain: 0 } });
    const data = {};
    if (body.name !== undefined) data.name = String(body.name).trim();
    if (body.type !== undefined) data.type = String(body.type).trim();
    if (body.connection_string !== undefined) data.connectionString = body.connection_string != null ? String(body.connection_string).trim() : null;
    if (body.baud_rate !== undefined) data.baudRate = body.baud_rate != null ? parseInt(body.baud_rate, 10) : null;
    if (body.data_bits !== undefined) data.dataBits = body.data_bits != null ? parseInt(body.data_bits, 10) : null;
    if (body.parity !== undefined) data.parity = body.parity != null ? String(body.parity) : null;
    if (body.stop_bits !== undefined) data.stopBits = body.stop_bits != null ? parseInt(body.stop_bits, 10) : null;
    if (body.is_main !== undefined) data.isMain = body.is_main ? 1 : 0;
    if (body.enabled !== undefined) data.enabled = body.enabled === 0 || body.enabled === false ? 0 : 1;
    const updated = await prisma.printer.update({ where: { id }, data });
    res.json(printerToApi(updated));
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Printer not found' });
    console.error('PUT /api/printers/:id', err);
    res.status(500).json({ error: err.message || 'Failed to update printer' });
  }
});

app.delete('/api/printers/:id', async (req, res) => {
  try {
    await prisma.printer.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Printer not found' });
    console.error('DELETE /api/printers/:id', err);
    res.status(500).json({ error: err.message || 'Failed to delete printer' });
  }
});

app.post('/api/printers/receipt', async (req, res) => {
  try {
    const orderId = String(req.body?.orderId || '').trim();
    if (!orderId) return res.status(400).json({ error: 'orderId is required' });
    serverLog('printer', 'Receipt print requested', { orderId });

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } }, table: true, customer: true }
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (!Array.isArray(order.items) || order.items.length === 0) {
      return res.status(400).json({ error: 'Order has no items to print' });
    }

    const dbTotal = Math.round(order.items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0) * 100) / 100;
    const paymentBreakdown = req.body?.paymentBreakdown || {};
    const { paidTotal, paymentMethodLines, paymentMethodsSummary } = await resolveReceiptPaymentBreakdown(paymentBreakdown, dbTotal);
    if (Math.abs(paidTotal - dbTotal) > 0.009) {
      return res.status(400).json({ error: `Paid total (${formatEuroAmount(paidTotal)}) must match order total (${formatEuroAmount(dbTotal)}).` });
    }

    const requestedPrinterId = req.body?.printerId ? String(req.body.printerId).trim() : null;
    const enabledPrinters = await prisma.printer.findMany({
      where: { enabled: 1 },
      orderBy: [{ isMain: 'desc' }, { createdAt: 'asc' }]
    });
    if (!enabledPrinters.length) {
      return res.status(400).json({ error: 'No enabled printer configured for receipt printing.' });
    }
    const printersById = new Map(enabledPrinters.map((p) => [p.id, p]));
    const defaultPrinter = requestedPrinterId
      ? printersById.get(requestedPrinterId) || null
      : enabledPrinters[0] || null;
    if (requestedPrinterId && !defaultPrinter) {
      return res.status(400).json({ error: 'Requested printer is not enabled or not found.' });
    }
    if (!defaultPrinter) {
      return res.status(400).json({ error: 'No fallback printer available.' });
    }
    serverLog('printer', 'Receipt default/fallback printer selected', {
      orderId,
      printerId: defaultPrinter.id,
      printerName: defaultPrinter.name,
      printerType: defaultPrinter.type,
      requestedPrinterId: requestedPrinterId || null,
    });

    const itemLines = order.items.map((item) => {
      const productName = item?.product?.name || 'Unknown item';
      const note = item?.notes ? ` (${String(item.notes).trim()})` : '';
      const qty = Math.max(1, Number(item.quantity) || 1);
      const unitPrice = Math.round((Number(item.price) || 0) * 100) / 100;
      const lineTotal = Math.round(unitPrice * qty * 100) / 100;
      const preferredPrinterId = String(item?.product?.printer1 || '').trim();
      return {
        product: `${productName}${note}`,
        quantity: qty,
        unitPrice,
        lineTotal,
        preferredPrinterId
      };
    });

    const printedAt = new Date().toISOString();
    const groupedByPrinterId = new Map();
    for (const line of itemLines) {
      const preferred = line.preferredPrinterId;
      const targetPrinter = (preferred && printersById.get(preferred)) || defaultPrinter;
      if (!groupedByPrinterId.has(targetPrinter.id)) groupedByPrinterId.set(targetPrinter.id, []);
      groupedByPrinterId.get(targetPrinter.id).push(line);
    }

    const printJobs = [];
    for (const [printerId, lines] of groupedByPrinterId.entries()) {
      const printer = printersById.get(printerId) || defaultPrinter;
      const validation = validatePrinterConnection(printer.type, printer.connectionString);
      if (!validation.ok) return res.status(400).json({ error: validation.error });
      const groupSubtotal = Math.round(lines.reduce((sum, line) => sum + (Number(line.lineTotal) || 0), 0) * 100) / 100;
      const receiptLines = [
        `Receipt ${order.id}`,
        `Printed at ${printedAt}`,
        `Table: ${order.table?.name || '-'}`,
        `Customer: ${order.customer?.name || '-'}`,
        `Printer: ${printer.name || printer.id}`,
        '------------------------------',
        ...lines.map((line) => `${line.quantity}x ${line.product}  ${formatEuroAmount(line.lineTotal)}`),
        '------------------------------',
        `SUBTOTAL: ${formatEuroAmount(groupSubtotal)}`,
        `TOTAL: ${formatEuroAmount(dbTotal)}`,
        `PAID: ${formatEuroAmount(paidTotal)}`,
        ...paymentMethodLines
      ];
      const sendResult = await sendToPrinter(printer, receiptLines);
      printJobs.push({
        printerId: printer.id,
        printerName: printer.name,
        items: lines.length,
        subtotal: groupSubtotal,
        receipt_text: receiptLines.join('\n'),
        ...sendResult
      });
      serverLog('printer', 'Receipt sent to printer', {
        orderId: order.id,
        printerId: printer.id,
        printerName: printer.name,
        items: lines.length,
        transport: sendResult?.transport || 'unknown',
        sentBytes: sendResult?.sentBytes ?? 0,
        receivedBytes: sendResult?.receivedBytes ?? 0,
      });
    }
    serverLog('printer', 'Receipt payload prepared', {
      orderId: order.id,
      items: itemLines.length,
      total: dbTotal,
      paidTotal,
      paymentMethods: paymentMethodsSummary,
    });
    return res.json({
      success: true,
      message: `Receipt print request sent for order "${order.id}"`,
      data: {
        orderId: order.id,
        printerId: defaultPrinter.id,
        printerName: defaultPrinter.name,
        total: dbTotal,
        paidTotal,
        paymentMethods: paymentMethodsSummary,
        items: itemLines,
        printJobs,
        printed: true,
      }
    });
  } catch (err) {
    console.error('POST /api/printers/receipt', err);
    return res.status(500).json({ error: err.message || 'Failed to print receipt' });
  }
});

app.post('/api/printers/test', async (req, res) => {
  try {
    const body = req.body || {};
    const name = String(body.name || '').trim();
    const type = String(body.type || '').trim().toLowerCase();
    const connectionString = String(body.connection_string || '').trim();
    if (!name || !type) return res.status(400).json({ error: 'name and type are required' });
    const validation = validatePrinterConnection(type, connectionString);
    if (!validation.ok) return res.status(400).json({ error: validation.error });

    const receiptLines = [
      `TEST PRINT - ${name}`,
      `Type: ${type}`,
      `Time: ${new Date().toISOString()}`,
      '------------------------------',
      'If this is printed, printer transport works.',
    ];
    const sendResult = await sendToPrinter({ type, connectionString, baudRate: body.baud_rate }, receiptLines);
    serverLog('printer', 'Test print sent', { name, type, connectionString, ...sendResult });
    return res.json({
      success: true,
      message: `Test print sent for "${name}"`,
      data: { printed: true, ...sendResult },
    });
  } catch (err) {
    console.error('POST /api/printers/test', err);
    return res.status(500).json({ error: err.message || 'Failed to test printer' });
  }
});

// ---------- Cashmatic payment – same API as 123 ----------
app.post('/api/cashmatic/start', async (req, res) => {
  try {
    const amount = req.body?.amount;
    if (!amount || amount <= 0) return res.status(400).json({ error: 'amount should be greater than 0' });
    serverLog('cashmatic', 'Start payment requested', { amount });
    const terminal = await prisma.paymentTerminal.findFirst({ where: { type: 'cashmatic', enabled: 1 }, orderBy: { isMain: 'desc' } });
    if (!terminal) {
      return res.status(503).json({ error: 'Cashmatic terminal not configured or not enabled.' });
    }
    serverLog('cashmatic', 'Using terminal configuration', {
      terminalId: terminal.id,
      terminalName: terminal.name,
      connectionType: terminal.connectionType,
      connection: summarizeCashmaticConnection(terminal.connectionString),
    });
    const terminalForService = { connection_string: terminal.connectionString };
    const service = createCashmaticService(terminalForService);
    const result = await service.createSession(amount);
    if (!result?.success) {
      return res.status(500).json({ error: result?.message || 'Failed to start Cashmatic payment' });
    }
    serverLog('cashmatic', 'Payment session started', { sessionId: result.sessionId, amount });
    res.json({ data: { sessionId: result.sessionId } });
  } catch (err) {
    console.error('POST /api/cashmatic/start', err);
    const networkErrorCodes = new Set(['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'ENETUNREACH', 'EHOSTUNREACH', 'EAI_AGAIN']);
    const code = networkErrorCodes.has(err.code) ? 503 : 500;
    const isNetworkError = networkErrorCodes.has(err.code);
    const message = isNetworkError
      ? `Unable to connect to Cashmatic terminal. Please verify IP/port and network connectivity. (${err.message || err.code})`
      : (err.message || 'Failed to start Cashmatic payment');
    serverLog('cashmatic', 'Start payment failed', { code: err.code || 'UNKNOWN', message: err.message || String(err) });
    res.status(code).json({ error: message });
  }
});

app.get('/api/cashmatic/status/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const terminal = await prisma.paymentTerminal.findFirst({ where: { type: 'cashmatic', enabled: 1 }, orderBy: { isMain: 'desc' } });
    if (!terminal) {
      return res.status(503).json({ success: false, error: 'Cashmatic terminal not configured or not enabled.' });
    }
    const service = createCashmaticService({ connection_string: terminal.connectionString });
    const result = await service.getSessionStatus(sessionId);
    if (!result?.success) {
      serverLog('cashmatic', 'Status lookup failed', { sessionId, message: result?.message || 'Session not found' });
      return res.status(404).json({ success: false, error: result?.message || 'Session not found' });
    }
    if (['PAID', 'FINISHED', 'FINISHED_MANUAL', 'CANCELLED', 'ERROR'].includes(String(result.state || '').toUpperCase())) {
      serverLog('cashmatic', 'Status update', {
        sessionId,
        state: result.state,
        requestedAmount: result.requestedAmount ?? 0,
        insertedAmount: result.insertedAmount ?? 0,
      });
    }
    res.json({
      success: true,
      data: {
        state: result.state,
        requestedAmount: result.requestedAmount ?? 0,
        insertedAmount: result.insertedAmount ?? 0,
        dispensedAmount: result.dispensedAmount ?? 0,
        notDispensedAmount: result.notDispensedAmount ?? 0,
      },
    });
  } catch (err) {
    console.error('GET /api/cashmatic/status/:sessionId', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to get payment status' });
  }
});

app.post('/api/cashmatic/finish/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    serverLog('cashmatic', 'Finish payment requested', { sessionId });
    const terminal = await prisma.paymentTerminal.findFirst({ where: { type: 'cashmatic', enabled: 1 }, orderBy: { isMain: 'desc' } });
    if (!terminal) {
      return res.status(503).json({ success: false, error: 'Cashmatic terminal not configured or not enabled.' });
    }
    const service = createCashmaticService({ connection_string: terminal.connectionString });
    const result = await service.commitAndRemoveSession(sessionId);
    if (!result?.success) {
      return res.status(404).json({ success: false, error: result?.message || 'Session not found' });
    }
    serverLog('cashmatic', 'Finish payment succeeded', { sessionId });
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('POST /api/cashmatic/finish/:sessionId', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to finish payment' });
  }
});

app.post('/api/cashmatic/cancel/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    serverLog('cashmatic', 'Cancel payment requested', { sessionId });
    const terminal = await prisma.paymentTerminal.findFirst({ where: { type: 'cashmatic', enabled: 1 }, orderBy: { isMain: 'desc' } });
    if (!terminal) {
      return res.status(503).json({ success: false, error: 'Cashmatic terminal not configured or not enabled.' });
    }
    const service = createCashmaticService({ connection_string: terminal.connectionString });
    const result = await service.cancelSession(sessionId);
    serverLog('cashmatic', 'Cancel payment completed', { sessionId, state: result?.state || 'CANCELLED' });
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('POST /api/cashmatic/cancel/:sessionId', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to cancel payment' });
  }
});

// ---------- Payworld payment (session-based) ----------
app.post('/api/payworld/start', async (req, res) => {
  try {
    const amount = Number(req.body?.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ ok: false, error: 'Invalid amount for Payworld' });
    }

    const terminal = await prisma.paymentTerminal.findFirst({
      where: { type: { in: ['payworld', 'bancontact', 'payword'] }, enabled: 1 },
      orderBy: { isMain: 'desc' },
    });
    if (!terminal) {
      return res.status(503).json({
        ok: false,
        error: 'Payworld terminal not configured or not enabled.',
      });
    }

    serverLog('payworld', 'Start payment requested', {
      amount,
      terminalId: terminal.id,
      terminalName: terminal.name,
      connection: summarizePayworldConnection(terminal.connectionString),
    });

    const service = createPayworldService({ connection_string: terminal.connectionString });
    const result = service.createSession(amount);
    if (!result?.success) {
      return res.status(500).json({ ok: false, error: result?.message || 'Failed to start Payworld payment.' });
    }

    return res.json({
      ok: true,
      provider: 'payworld',
      sessionId: result.sessionId,
      state: result?.data?.state || 'IN_PROGRESS',
      message: result?.data?.message || 'Starting payment...',
      amountInCents: result?.data?.amountInCents,
    });
  } catch (err) {
    console.error('POST /api/payworld/start', err);
    return res.status(500).json({ ok: false, error: err.message || 'Failed to start Payworld payment' });
  }
});

app.get('/api/payworld/status/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    if (!sessionId) return res.status(400).json({ ok: false, error: 'No sessionId provided.' });

    const terminal = await prisma.paymentTerminal.findFirst({
      where: { type: { in: ['payworld', 'bancontact', 'payword'] }, enabled: 1 },
      orderBy: { isMain: 'desc' },
    });
    if (!terminal) {
      return res.status(503).json({ ok: false, error: 'Payworld terminal not configured or not enabled.' });
    }

    const service = createPayworldService({ connection_string: terminal.connectionString });
    const status = service.getSessionStatus(sessionId);
    if (!status?.success) return res.status(404).json({ ok: false, error: status?.message || 'Session not found' });
    return res.json(status);
  } catch (err) {
    console.error('GET /api/payworld/status/:sessionId', err);
    return res.status(500).json({ ok: false, error: err.message || 'Failed to get Payworld status' });
  }
});

app.post('/api/payworld/cancel/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    if (!sessionId) return res.status(400).json({ ok: false, error: 'No sessionId provided.' });

    const terminal = await prisma.paymentTerminal.findFirst({
      where: { type: { in: ['payworld', 'bancontact', 'payword'] }, enabled: 1 },
      orderBy: { isMain: 'desc' },
    });
    if (!terminal) {
      return res.status(503).json({ ok: false, error: 'Payworld terminal not configured or not enabled.' });
    }

    const service = createPayworldService({ connection_string: terminal.connectionString });
    const result = await service.cancelSession(sessionId);
    if (!result?.success) return res.status(400).json({ ok: false, error: result?.message || 'Cancel failed' });
    return res.json({ ok: true, message: result.message || 'Payment cancelled.' });
  } catch (err) {
    console.error('POST /api/payworld/cancel/:sessionId', err);
    return res.status(500).json({ ok: false, error: err.message || 'Failed to cancel Payworld payment' });
  }
});

app.get('/api/payworld/config', async (req, res) => {
  try {
    const terminal = await prisma.paymentTerminal.findFirst({
      where: { type: { in: ['payworld', 'bancontact', 'payword'] } },
      orderBy: { isMain: 'desc' },
    });
    if (!terminal) return res.json({ ok: true, config: {} });

    let config = {};
    try {
      config = JSON.parse(String(terminal.connectionString || '{}'));
    } catch {
      config = {};
    }
    return res.json({ ok: true, config });
  } catch (err) {
    console.error('GET /api/payworld/config', err);
    return res.status(500).json({ ok: false, error: err.message || 'Failed to load Payworld config' });
  }
});

app.post('/api/payworld/config', async (req, res) => {
  try {
    const cfg = req.body || {};
    const connectionString = JSON.stringify({
      ip: cfg.ip || '',
      port: cfg.port || '',
      posId: cfg.posId || '',
      currencyCode: cfg.currencyCode || '',
      timeoutMs: cfg.timeoutMs || 60000,
    });

    const existing = await prisma.paymentTerminal.findFirst({
      where: { type: { in: ['payworld', 'bancontact', 'payword'] } },
      orderBy: { isMain: 'desc' },
    });

    if (existing) {
      await prisma.paymentTerminal.update({
        where: { id: existing.id },
        data: {
          connectionString,
          connectionType: existing.connectionType || 'tcp',
          enabled: existing.enabled ?? 1,
        },
      });
    } else {
      await prisma.paymentTerminal.create({
        data: {
          name: 'Payworld Terminal',
          type: 'payworld',
          connectionType: 'tcp',
          connectionString,
          enabled: 1,
          isMain: 0,
        },
      });
    }

    return res.json({ ok: true, message: 'Payworld config saved.', config: cfg });
  } catch (err) {
    console.error('POST /api/payworld/config', err);
    return res.status(500).json({ ok: false, error: err.message || 'Failed to save Payworld config' });
  }
});

// REST: customers (list with optional search) - filter in memory for SQLite compatibility
app.get('/api/customers', async (req, res) => {
  try {
    const { companyName, name, street, phone } = req.query;
    const customers = await prisma.customer.findMany({ orderBy: { name: 'asc' } });
    const lower = (s) => (s == null || s === '' ? '' : String(s).toLowerCase());
    const matches = (value, filter) => !filter || lower(value).includes(lower(filter));
    const filtered = customers.filter(
      (c) =>
        matches(c.companyName, companyName) &&
        matches(c.name, name) &&
        matches(c.street, street) &&
        matches(c.phone, phone)
    );
    res.json(filtered);
  } catch (err) {
    console.error('GET /api/customers', err);
    res.status(500).json({ error: err.message || 'Failed to fetch customers' });
  }
});

// REST: create customer
app.post('/api/customers', async (req, res) => {
  const {
    companyName,
    firstName,
    lastName,
    name,
    street,
    postalCode,
    city,
    phone,
    email,
    discount,
    priceGroup,
    vatNumber,
    loyaltyCardBarcode,
    creditTag
  } = req.body;
  const toNullable = (value) => {
    if (value === undefined || value === null) return null;
    const normalized = String(value).trim();
    return normalized === '' ? null : normalized;
  };
  const customer = await prisma.customer.create({
    data: {
      companyName: toNullable(companyName),
      firstName: toNullable(firstName),
      lastName: toNullable(lastName),
      name: toNullable(name) || '',
      street: toNullable(street),
      postalCode: toNullable(postalCode),
      city: toNullable(city),
      phone: toNullable(phone),
      email: toNullable(email),
      discount: toNullable(discount),
      priceGroup: toNullable(priceGroup),
      vatNumber: toNullable(vatNumber),
      loyaltyCardBarcode: toNullable(loyaltyCardBarcode),
      creditTag: toNullable(creditTag)
    }
  });
  res.json(customer);
});

// REST: update customer
app.patch('/api/customers/:id', async (req, res) => {
  const {
    companyName,
    firstName,
    lastName,
    name,
    street,
    postalCode,
    city,
    phone,
    email,
    discount,
    priceGroup,
    vatNumber,
    loyaltyCardBarcode,
    creditTag
  } = req.body;
  const toNullable = (value) => {
    if (value === undefined || value === null) return null;
    const normalized = String(value).trim();
    return normalized === '' ? null : normalized;
  };
  const data = {};
  if (companyName !== undefined) data.companyName = toNullable(companyName);
  if (firstName !== undefined) data.firstName = toNullable(firstName);
  if (lastName !== undefined) data.lastName = toNullable(lastName);
  if (name !== undefined) data.name = toNullable(name) || '';
  if (street !== undefined) data.street = toNullable(street);
  if (postalCode !== undefined) data.postalCode = toNullable(postalCode);
  if (city !== undefined) data.city = toNullable(city);
  if (phone !== undefined) data.phone = toNullable(phone);
  if (email !== undefined) data.email = toNullable(email);
  if (discount !== undefined) data.discount = toNullable(discount);
  if (priceGroup !== undefined) data.priceGroup = toNullable(priceGroup);
  if (vatNumber !== undefined) data.vatNumber = toNullable(vatNumber);
  if (loyaltyCardBarcode !== undefined) data.loyaltyCardBarcode = toNullable(loyaltyCardBarcode);
  if (creditTag !== undefined) data.creditTag = toNullable(creditTag);
  const customer = await prisma.customer.update({
    where: { id: req.params.id },
    data
  });
  res.json(customer);
});

// Socket: join room for POS updates
io.on('connection', (socket) => {
  socket.on('pos:subscribe', () => {
    socket.join('pos');
  });
});

const PORT = Number(process.env.PORT || 5000);
const HOST = process.env.HOST || '0.0.0.0';

(async () => {
  try {
    await ensureDefaultPaymentMethods();
  } catch (e) {
    console.error('ensureDefaultPaymentMethods failed', e);
  }
  httpServer.listen(PORT, HOST, () => {
    const nets = os.networkInterfaces();
    const ipv4s = [];
    for (const items of Object.values(nets)) {
      for (const info of items || []) {
        if (info.family === 'IPv4' && !info.internal) ipv4s.push(info.address);
      }
    }
    console.log(`POS Backend running on ${HOST}:${PORT}`);
    console.log(`Local:  http://localhost:${PORT}`);
    if (ipv4s.length) {
      console.log('LAN URLs:');
      for (const ip of ipv4s) console.log(`- http://${ip}:${PORT}`);
    }
  });
})();
