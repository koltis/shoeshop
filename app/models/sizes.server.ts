import { prisma } from "~/db.server";

export const getSizes = () => {
  return prisma.size.findMany({ orderBy: { size: "desc" } });
};
