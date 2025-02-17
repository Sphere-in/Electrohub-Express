import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Seeding Categories (Ensuring Uniqueness)
  const categoryNames = new Set<string>();
  while (categoryNames.size < 5) {
    categoryNames.add(faker.commerce.department());
  }

  const categories = await Promise.all(
    Array.from(categoryNames).map((name) =>
      prisma.category.upsert({
        where: { name },
        update: {},
        create: { name, imageUrl: faker.image.url() },
      })
    )
  );

  // Seeding Sellers (Avoid Duplicate Emails)
  const sellers = await Promise.all(
    Array.from({ length: 40 }).map(() =>
      prisma.seller.upsert({
        where: { email: faker.internet.email() },
        update: {},
        create: {
          name: faker.company.name(),
          email: faker.internet.email(),
          password: faker.internet.password(),
          address: faker.location.streetAddress(),
          pfp: faker.image.avatar(),
          phone: faker.phone.number(),
        },
      })
    )
  );

  // Seeding Users (Avoid Duplicate Emails)
  const users = await Promise.all(
    Array.from({ length: 60 }).map(() =>
      prisma.user.upsert({
        where: { email: faker.internet.email() },
        update: {},
        create: {
          name: faker.person.fullName(),
          email: faker.internet.email(),
          password: faker.internet.password(),
          address: faker.location.streetAddress(),
          phone: faker.phone.number(),
          pfp: faker.image.avatar(),
        },
      })
    )
  );

  // Seeding Products
  const products = await Promise.all(
    Array.from({ length: 100 }).map((_, i) =>
      prisma.product.create({
        data: {
          name: faker.commerce.productName(),
          price: parseFloat(faker.commerce.price()),
          description: faker.commerce.productDescription(),
          stock: faker.number.int({ min: 1, max: 500 }),
          category: { connect: { name: categories[i % categories.length].name } },
          seller: { connect: { id: sellers[i % sellers.length].id } },
          productInfo: {
            create: {
              brand: faker.company.name(),
              details: JSON.stringify({ warranty: "1 year", material: "Plastic" }),
            },
          },
        },
      })
    )
  );

  // Seeding Orders & Order Items
  await Promise.all(
    users.map(async (user) => {
      for (let i = 0; i < 3; i++) { // Change 3 to desired number of orders per user
        const order = await prisma.order.create({
          data: {
            user: { connect: { id: user.id } },
            total: faker.number.float({ min: 10, max: 500 }),
          },
        });
  
        // Increase order items inside each order
        await prisma.orderItem.createMany({
          data: products.slice(0, 5).map((product) => ({ // Change 5 to desired items per order
            orderId: order.id,
            productId: product.id,
            quantity: faker.number.int({ min: 1, max: 5 }),
          })),
        });
      }
    })
  );

  // Seeding Reviews
  await Promise.all(
    users.map((user) => {
      return Promise.all(
        Array.from({ length: 3 }).map(() => // Change 3 to desired number of reviews per user
          prisma.review.create({
            data: {
              content: faker.lorem.sentences(),
              rating: faker.number.int({ min: 1, max: 5 }),
              user: { connect: { id: user.id } },
              product: { connect: { id: products[faker.number.int({ min: 0, max: products.length - 1 })].id } },
            },
          })
        )
      );
    })
  );
  

  console.log("✅ Database seeding complete!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
