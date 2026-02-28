import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: ['http://localhost:5173', 'http://localhost:3000'] }
});

app.use(cors());
app.use(express.json());

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
    const { name, groupId } = req.body;
    if (!groupId) return res.status(400).json({ error: 'groupId required' });
    const count = await prisma.subproduct.count({ where: { groupId } });
    const created = await prisma.subproduct.create({
      data: {
        name: name != null && String(name).trim() !== '' ? String(name).trim() : 'New subproduct',
        groupId,
        sortOrder: count
      }
    });
    res.status(201).json(created);
  } catch (err) {
    console.error('POST /api/subproducts', err);
    res.status(500).json({ error: err.message || 'Failed to create subproduct' });
  }
});

app.patch('/api/subproducts/:id', async (req, res) => {
  try {
    const { name, sortOrder } = req.body;
    const data = {};
    if (name !== undefined) data.name = String(name).trim() || 'New subproduct';
    if (typeof sortOrder === 'number') data.sortOrder = sortOrder;
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
    const quantity = Math.max(1, Math.floor(Number(req.body?.quantity)) || 1);

    const item = await prisma.orderItem.findFirst({
      where: { id: itemId, orderId }
    });
    if (!item) {
      return res.status(404).json({ error: 'Order item not found' });
    }

    await prisma.orderItem.update({
      where: { id: itemId },
      data: { quantity }
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

// REST: tables (table locations / areas)
app.get('/api/tables', async (req, res) => {
  try {
    const tables = await prisma.table.findMany({
      include: { orders: { where: { status: 'open' } } },
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
    const created = await prisma.table.create({
      data: { name: name || 'New location', status: 'available' }
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
    if (name === undefined) return res.status(400).json({ error: 'No fields to update' });
    const updated = await prisma.table.update({
      where: { id: req.params.id },
      data: { name: name || 'New location' }
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

// REST: order history (paid orders, newest first)
app.get('/api/orders/history', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { status: 'paid' },
      include: { table: true },
      orderBy: { createdAt: 'desc' }
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
    res.json(users.map((u) => ({ id: u.id, name: u.name, label: u.name, role: u.role })));
  } catch (err) {
    console.error('GET /api/users', err);
    res.status(500).json({ error: err.message || 'Failed to fetch users' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { name, role, pin } = req.body;
    const created = await prisma.user.create({
      data: {
        name: name != null && String(name).trim() !== '' ? String(name).trim() : 'New user',
        role: role === 'admin' || role === 'kitchen' || role === 'waiter' ? role : 'waiter',
        pin: pin != null ? String(pin) : '1234'
      }
    });
    res.status(201).json({ id: created.id, name: created.name, label: created.name, role: created.role });
  } catch (err) {
    console.error('POST /api/users', err);
    res.status(500).json({ error: err.message || 'Failed to create user' });
  }
});

app.patch('/api/users/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { name, role, pin } = req.body;
    const data = {};
    if (name !== undefined) data.name = String(name).trim() || 'New user';
    if (role !== undefined) data.role = role === 'admin' || role === 'kitchen' || role === 'waiter' ? role : undefined;
    if (pin !== undefined) data.pin = String(pin);
    const updated = await prisma.user.update({ where: { id }, data });
    res.json({ id: updated.id, name: updated.name, label: updated.name, role: updated.role });
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
    res.json({ id: user.id, name: user.name, label: user.name, role: user.role });
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
  const { companyName, name, street, phone } = req.body;
  const customer = await prisma.customer.create({
    data: { companyName: companyName || null, name: name || '', street: street || null, phone: phone || null }
  });
  res.json(customer);
});

// REST: update customer
app.patch('/api/customers/:id', async (req, res) => {
  const { companyName, name, street, phone } = req.body;
  const data = {};
  if (companyName !== undefined) data.companyName = companyName;
  if (name !== undefined) data.name = name;
  if (street !== undefined) data.street = street;
  if (phone !== undefined) data.phone = phone;
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

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`POS Backend running at http://localhost:${PORT}`);
});
