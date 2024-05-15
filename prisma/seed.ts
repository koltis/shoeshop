import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  const email = process.env.ADMIN_EMAIL as string;

  // cleanup the existing database
  await prisma.user.delete({ where: { email } }).catch(() => {
    // no worries if it doesn't exist yet
  });

  const hashedPassword = await bcrypt.hash(
    process.env.ADMIN_PASSWORD as string,
    10,
  );

  const user = await prisma.user.create({
    data: {
      email,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });

  await prisma.color.createMany({
    data: [
      {
        name: "blue",
      },
      {
        name: "gray",
      },
      {
        name: "red",
      },
      {
        name: "orange",
      },
      {
        name: "yellow",
      },
      {
        name: "green",
      },
      {
        name: "cyan",
      },
      {
        name: "purple",
      },
      {
        name: "pink",
      },
      {
        name: "white",
      },
      {
        name: "black",
      },
    ],
    skipDuplicates: true,
  });
  await prisma.size.createMany({
    data: [
      { size: "S" },
      { size: "M" },
      { size: "L" },
      { size: "XL" },
      { size: "17" },
      { size: "18" },
      { size: "23" },
      { size: "25" },
      { size: "27.5" },
      { size: "28.5" },
      { size: "38 2/3" },
    ],
    skipDuplicates: true,
  });

  await prisma.brand.createMany({
    data: [
      {
        name: "Converse",
      },
      {
        name: "Puma",
      },
      {
        name: "Buffalo",
      },
      {
        name: "DC",
      },
      {
        name: "Crocs",
      },
      {
        name: "Fila",
      },
      {
        name: "JORDAN",
      },
      {
        name: "Lacoste",
      },
      {
        name: "Polo Ralph Lauren",
      },
      {
        name: "Nike",
      },
      {
        name: "Nike Nocta",
      },
      {
        name: "Ralph Lauren",
      },
    ],
  });

  await prisma.category.create({
    data: {
      name: "zapatos",
      subCategories: {
        createMany: {
          data: [
            { name: "Sneakers" },
            { name: "Running" },
            { name: "Baloncesto" },
            { name: "Fashion Sneakers" },
            { name: "Cordones" },
            { name: "Plantillas" },
            { name: "Sandalias" },
            { name: "Slippers" },
          ],
        },
      },
    },
  });

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
