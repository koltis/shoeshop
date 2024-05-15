import { prisma } from "~/db.server";

export const getColors = () => {
  return prisma.color.findMany({ orderBy: { name: "desc" } });
};
