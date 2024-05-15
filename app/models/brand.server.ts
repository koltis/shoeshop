import { prisma } from "~/db.server";

export const getBrands = () => {
  return prisma.brand.findMany({ orderBy: { name: "desc" } });
};
