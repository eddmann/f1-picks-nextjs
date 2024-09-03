"use server";

import { isNotThreeUniqueDrivers } from "@/common";
import db from "@/db";
import { Type } from "@prisma/client";
import { getAuthenticatedUserId } from "@/auth";
import { revalidatePath } from "next/cache";

export default async function makePick(year: number, round: number, type: Type, _: any, formData: FormData) {
  const driver1Id = +(formData.get("driver1Id") || 0);
  const driver2Id = +(formData.get("driver2Id") || 0);
  const driver3Id = +(formData.get("driver3Id") || 0);

  if (await isNotThreeUniqueDrivers([driver1Id, driver2Id, driver3Id])) {
    return { error: "You must select three different drivers" };
  }

  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return { error: "You must be logged in to make a pick" };
  }

  await db.pick.upsert({
    where: {
      pickId: {
        userId,
        year,
        round,
        type,
      },
    },
    update: {
      driver1Id,
      driver2Id,
      driver3Id,
      updatedAt: new Date(),
    },
    create: {
      userId,
      year,
      round,
      type,
      driver1Id,
      driver2Id,
      driver3Id,
    },
  });

  revalidatePath(`/rounds/${year}/${round}`);
}
