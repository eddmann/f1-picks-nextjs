import db from "@/db";
import { Type } from "@prisma/client";

export const simulateExpensiveOperation = () => new Promise((res) => setTimeout(res, 1000));

export const titleizeType = (type: Type) =>
  type
    .toLowerCase()
    .split("_")
    .map((word) => word[0].toUpperCase() + word.substring(1))
    .join(" ");

export const isNotThreeUniqueDrivers = async (drivers: number[]) =>
  (await db.driver.count({ where: { id: { in: drivers } } })) !== 3;

export const findDrivers = (): Promise<{ id: number; name: string }[]> =>
  db.driver.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });
