import { findDrivers } from "@/common";
import db from "@/db";
import { Type } from "@prisma/client";
import PickForm from "./PickForm";

type Props = {
  userId: string;
  year: number;
  round: number;
  type: Type;
};

export default async function WrappedPickForm({ userId, year, round, type }: Props) {
  const drivers = await findDrivers();
  const pick = await findExistingDriverPick(userId, year, round, type);

  return (
    <details>
      <summary>Pick</summary>
      <PickForm
        year={year}
        round={round}
        type={type}
        pick={{ driver1Id: pick?.driver1Id, driver2Id: pick?.driver2Id, driver3Id: pick?.driver3Id }}
        drivers={drivers}
      />
    </details>
  );
}

async function findExistingDriverPick(userId: string, year: number, round: number, type: Type) {
  return db.pick.findUnique({
    where: {
      pickId: {
        userId,
        year,
        round,
        type,
      },
    },
    select: {
      driver1Id: true,
      driver2Id: true,
      driver3Id: true,
    },
  });
}
