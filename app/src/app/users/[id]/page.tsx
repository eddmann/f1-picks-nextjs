import db from "@/db";
import { simulateExpensiveOperation, titleizeType } from "@/common";
import { notFound } from "next/navigation";
import { Fragment } from "react";

type Props = {
  params: {
    id: string;
  };
};

export default async function Page({ params: { id } }: Props) {
  await simulateExpensiveOperation();

  const userName = await findUserName(id);

  if (!userName) {
    return notFound();
  }

  const picksByRound = await findPicksByRound(id);

  return (
    <>
      <h2>{userName}</h2>
      <>
        {Object.entries(picksByRound).map(([roundName, picksForRound]) => (
          <Fragment key={roundName}>
            <h3>{roundName}</h3>
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Picks</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {picksForRound.map((pick) => (
                  <tr key={`${pick.year}-${pick.round}-${pick.userId}`}>
                    <td>{titleizeType(pick.type)}</td>
                    <td>
                      {pick.driver1.name}, {pick.driver2.name}, {pick.driver3.name}
                    </td>
                    <td>{pick.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Fragment>
        ))}
      </>
    </>
  );
}

async function findPicksByRound(userId: string) {
  const picks = await db.pick.findMany({
    where: { userId },
    include: {
      roundRel: { select: { name: true } },
      driver1: { select: { name: true } },
      driver2: { select: { name: true } },
      driver3: { select: { name: true } },
    },
  });

  return picks.reduce((picks, pick) => {
    const { name } = pick.roundRel;
    return { ...picks, [name]: [...(picks[name] || []), pick] };
  }, {} as { [roundName: string]: (typeof picks)[0][] });
}

async function findUserName(userId: string) {
  const user = await db.user.findUnique({ where: { id: userId }, select: { name: true } });

  return user?.name ?? null;
}
