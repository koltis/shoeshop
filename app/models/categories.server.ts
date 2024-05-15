import { prisma } from "~/db.server";

export const getCategories = () => {
  return prisma.category.findMany({
    orderBy: { name: "desc" },
    include: {
      subCategories: { orderBy: { name: "desc" } },
    },
  });
};
