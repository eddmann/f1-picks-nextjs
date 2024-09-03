"use server";

import db from "@/db";
import { Pick, Result, Type } from "@prisma/client";
import { redirect } from "next/navigation";
import { isNotThreeUniqueDrivers } from "@/common";

export default async function recordResultAction(_: any, formData: FormData) {
  const [year, round] = parseRoundId(formData.get("roundId")?.toString());
  const type = parseType(formData.get("type")?.toString());
  const driver1Id = +(formData.get("driver1Id") || 0);
  const driver2Id = +(formData.get("driver2Id") || 0);
  const driver3Id = +(formData.get("driver3Id") || 0);

  if (!type) {
    return { error: "Invalid type of result" };
  }

  if (await isTypeNotPermittedForRound(type, year, round)) {
    return { error: "Type is not permitted for this round" };
  }

  if (await isNotThreeUniqueDrivers([driver1Id, driver2Id, driver3Id])) {
    return { error: "You must select three different drivers" };
  }

  const result = await db.result.upsert({
    where: {
      resultId: { year, round, type },
    },
    update: {
      driver1Id,
      driver2Id,
      driver3Id,
      updatedAt: new Date(),
    },
    create: {
      year,
      round,
      type,
      driver1Id,
      driver2Id,
      driver3Id,
    },
  });

  for (const pick of await db.pick.findMany({ where: { year, round, type } })) {
    await db.pick.update({
      where: {
        pickId: {
          year,
          round,
          type,
          userId: pick.userId,
        },
      },
      data: {
        score: calculateScore(result, pick),
        scoredAt: new Date(),
      },
    });
  }

  redirect(`/rounds/${year}/${round}`);
}

function parseRoundId(roundId: string | undefined): [number, number] {
  const [year, round] = roundId?.split("-") || [];
  return [+(year || "0"), +(round || "0")];
}

function parseType(type: string | undefined): Type | null {
  // @ts-ignore
  return Object.values(Type).includes(type) ? (type as Type) : null;
}

async function isTypeNotPermittedForRound(type: Type, year: number, round: number) {
  const row = await db.round.findUnique({
    where: { roundId: { year, round } },
    select: { sprintQualifyingAt: true, sprintRaceAt: true },
  });

  return (
    !row || (type === "SPRINT_QUALIFYING" && !row.sprintQualifyingAt) || (type === "SPRINT_RACE" && !row.sprintRaceAt)
  );
}

function calculateScore(result: Result, pick: Pick) {
  const resultDriverIds = [result.driver1Id, result.driver2Id, result.driver3Id];
  const pickDriverIds = [pick.driver1Id, pick.driver2Id, pick.driver3Id];

  return resultDriverIds.reduce((score, resultDriverId, position) => {
    if (resultDriverId === pickDriverIds[position]) return score + 2;
    if (pickDriverIds.includes(resultDriverId)) return score + 1;
    return score;
  }, 0);
}
