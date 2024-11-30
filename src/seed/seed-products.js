const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const seedProducts = async () => {
  const products = [
    {
      name: "Sample Product 1",
      description: "This is a description for product 1.",
      price: 99.99,
      imageUrl:
        "https://backend.orbitvu.com/sites/default/files/styles/webp/public/image/shoe-photography-cover-min.jpg.webp",
    },
    {
      name: "Sample Product 2",
      description: "This is a description for product 2.",
      price: 49.99,
      imageUrl:
        "https://backend.orbitvu.com/sites/default/files/styles/webp/public/image/shoe-photography-cover-min.jpg.webp",
    },
    {
      name: "Sample Product 3",
      description: "This is a description for product 3.",
      price: 149.99,
      imageUrl:
        "https://backend.orbitvu.com/sites/default/files/styles/webp/public/image/shoe-photography-cover-min.jpg.webp",
    },
    {
      name: "Sample Product 4",
      description: "This is a description for product 4.",
      price: 19.99,
      imageUrl:
        "https://backend.orbitvu.com/sites/default/files/styles/webp/public/image/shoe-photography-cover-min.jpg.webp",
    },
  ];

  try {
    console.log("Seeding products...");

    for (const product of products) {
      await prisma.product.create({
        data: product,
      });
    }

    console.log("Seeding complete!");
  } catch (error) {
    console.error("Error seeding products:", error);
  } finally {
    await prisma.$disconnect();
  }
};

seedProducts();
