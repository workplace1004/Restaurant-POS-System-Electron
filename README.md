# POS Restaurant (CloudPOS-style)

Point of Sale dashboard with **React** (frontend), **Node.js** (backend), **Socket.io** (real-time), **SQLite** and **Prisma**.

## Layout (matches reference)

- **Header**: Time, tabs (Tables, Weborders, In planning)
- **Left sidebar**: Categories (DRINKS, APPETIZER, TAPAS, MAIN COURSE, DESSERTS, KIDS), admin, Log out, Control
- **Center**: Product grid with pagination (arrows + dots)
- **Right**: Order list, Total, actions (In planning, Pay differently, €), numeric keypad
- **Footer**: CloudPOS brand, Let, Customers, History, Subtotal, Back name, More...

## Run the project

### Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

Backend runs at **http://localhost:3001** (API + Socket.io).

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173** and proxies `/api` and `/socket.io` to the backend.

## Tech stack

- **Frontend**: React (Vite), Socket.io client
- **Backend**: Express, Prisma, SQLite, Socket.io
- **Real-time**: Socket.io for order updates across clients

## API (main)

- `GET /api/categories` – list categories with products
- `GET /api/categories/:id/products` – products by category
- `GET /api/orders` – open/in_planning orders
- `POST /api/orders` – create order
- `PATCH /api/orders/:id` – update order (status, table, items)
- `POST /api/orders/:id/items` – add item
- `DELETE /api/orders/:id/items/:itemId` – remove item
- `GET /api/tables` – list tables
- `GET /api/weborders/count` – count weborders
- `GET /api/orders/in-planning/count` – count in-planning orders

Socket event: `order:updated` when an order is created/updated.
