import type { Product } from "@prisma/client";

import { prisma } from "~/db.server";
import { NewProductSchema } from "~/routes/admin.products.new";

export function getProduct({ id }: Pick<Product, "id">) {
  return prisma.product.findFirst({
    where: { id },
  });
}

export function getProductListItems() {
  return prisma.product.findMany();
}

export function createProduct({
  color: colors,
  gender,
  brand,
  category,
  subCategory,
  size: sizes,
  discount,
  price,
  name,
  manufacturerID,
  seoNames,
  imagesInfo,
}: NewProductSchema) {
  return prisma.product.create({
    data: {
      colors: {
        connect: colors.map((id) => {
          return { id: id };
        }),
      },
      gender: { connect: { id: gender } },
      brand: {
        connectOrCreate: {
          where: { name: brand },
          create: { name: brand },
        },
      },
      category: {
        connectOrCreate: {
          where: { name: category },
          create: { name: category },
        },
      },
      subCategory: {
        connectOrCreate: {
          where: { name: subCategory },
          create: {
            name: subCategory,
            category: { connect: { name: category } },
          },
        },
      },
      units: {
        create: sizes.map((size) => {
          return {
            stock: size.units,
            size: {
              connectOrCreate: {
                where: { size: size.size },
                create: { size: size.size },
              },
            },
          };
        }),
      },
      discount,
      price,
      name,
      manufacturerID,
      seoNames: {
        connectOrCreate: seoNames.map((seoName) => {
          return {
            where: { name: seoName },
            create: { name: seoName },
          };
        }),
      },
      images: {
        create: imagesInfo.map((imagesInfo) => {
          return {
            url: imagesInfo.url,
          };
        }),
      },
    },
  });
}

export function deleteProduct({ id }: Pick<Product, "id">) {
  return prisma.product.delete({
    where: { id },
  });
}
