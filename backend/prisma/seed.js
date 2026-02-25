import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Users for POS login
  const userData = [
    { id: 'user-admin', name: 'Admin', role: 'admin', pin: '1234' },
    { id: 'user-kitchen', name: 'Kitchen Staff', role: 'kitchen', pin: '1234' },
    { id: 'user-waiter', name: 'Waiter', role: 'waiter', pin: '1234' }
  ];
  for (const u of userData) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: {},
      create: u
    });
  }

  // Price groups (optional starter data)
  const priceGroupData = [
  ];
  for (const pg of priceGroupData) {
    await prisma.priceGroup.upsert({
      where: { id: pg.id },
      update: {},
      create: pg
    });
  }

  const catDrinks = await prisma.category.upsert({
    where: { id: 'cat-drinks' },
    update: {},
    create: { id: 'cat-drinks', name: 'DRINKS', sortOrder: 1 }
  });
  const catAppetizer = await prisma.category.upsert({
    where: { id: 'cat-appetizer' },
    update: {},
    create: { id: 'cat-appetizer', name: 'APPETIZER', sortOrder: 2 }
  });
  const catTapas = await prisma.category.upsert({
    where: { id: 'cat-tapas' },
    update: {},
    create: { id: 'cat-tapas', name: 'TAPAS', sortOrder: 3 }
  });
  const catMain = await prisma.category.upsert({
    where: { id: 'cat-main' },
    update: {},
    create: { id: 'cat-main', name: 'MAIN COURSE', sortOrder: 4 }
  });
  const catDesserts = await prisma.category.upsert({
    where: { id: 'cat-desserts' },
    update: {},
    create: { id: 'cat-desserts', name: 'DESSERTS', sortOrder: 5 }
  });
  const catKids = await prisma.category.upsert({
    where: { id: 'cat-kids' },
    update: {},
    create: { id: 'cat-kids', name: 'KIDS', sortOrder: 6 }
  });

  const categories = [catDrinks, catAppetizer, catTapas, catMain, catDesserts, catKids];
  const productData = [
    { categoryId: catDrinks.id, name: 'Cola', price: 2.5 },
    { categoryId: catDrinks.id, name: 'Water', price: 1.5 },
    { categoryId: catDrinks.id, name: 'Coffee', price: 2.8 },
    { categoryId: catAppetizer.id, name: 'Soup', price: 4.5 },
    { categoryId: catAppetizer.id, name: 'Salad', price: 5.0 },
    { categoryId: catTapas.id, name: 'Olives', price: 3.5 },
    { categoryId: catTapas.id, name: 'Bread', price: 2.0 },
    { categoryId: catMain.id, name: 'Steak', price: 18.0 },
    { categoryId: catMain.id, name: 'Pasta', price: 12.0 },
    { categoryId: catDesserts.id, name: 'Ice Cream', price: 5.0 },
    { categoryId: catKids.id, name: 'Kids Menu', price: 8.0 }
  ];

  for (const p of productData) {
    await prisma.product.upsert({
      where: { id: `prod-${p.name.toLowerCase().replace(/\s/g, '-')}` },
      update: {},
      create: { id: `prod-${p.name.toLowerCase().replace(/\s/g, '-')}`, ...p }
    });
  }

  for (let i = 1; i <= 8; i++) {
    await prisma.table.upsert({
      where: { id: `table-${i}` },
      update: {},
      create: { id: `table-${i}`, name: `Table ${i}`, status: 'available' }
    });
  }

  const existing = await prisma.customer.count();
  if (existing === 0) {
    await prisma.customer.createMany({
      data: [
        { companyName: 'pospoint', name: 'pospoint', street: 'Mezenstraat', phone: null },
        { companyName: 'TestCustomer', name: 'TestCustomer', street: 'Street NoTest.', phone: '123456789' }
      ]
    });
  }

  console.log('Seed done.');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
