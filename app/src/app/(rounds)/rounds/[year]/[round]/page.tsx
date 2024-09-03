import db from "@/db";
import { notFound } from "next/navigation";
import { Fragment } from "react";
import LocalDateTime from "@/components/LocalDateTime";
import { titleizeType } from "@/common";
import { Round, Type } from "@prisma/client";
import { getAuthenticatedUserId } from "@/auth";
import PickForm from "./PickForm";
import { addHours, subDays, subMinutes } from "date-fns";

type Props = {
  params: {
    year: string;
    round: string;
  };
};

export default async function Page({ params }: Props) {
  const round = await findRound(+params.year, +params.round);

  if (!round) {
    return notFound();
  }

  const userId = await getAuthenticatedUserId();
  const racesGroupedByType = await findRacesGroupedByType(round);

  return (
    <>
      <h2>
        {round.year} - Round {round.round}: {round.name}
      </h2>

      {racesGroupedByType.map((type) => (
        <Fragment key={type.name}>
          <h3>{titleizeType(type.name)}</h3>

          <p>
            <strong>Start:</strong> <LocalDateTime date={type.at} />
            <br />
            <strong>Picks:</strong> <LocalDateTime date={type.pickWindow[0]} /> -{" "}
            <LocalDateTime date={type.pickWindow[1]} /> <br />
            {type.result && (
              <>
                <strong>Result:</strong> {type.result.driver1.name}, {type.result.driver2.name},{" "}
                {type.result.driver3.name}
              </>
            )}
          </p>

          {userId && type.isOpenForPicks && (
            <PickForm userId={userId} year={round.year} round={round.round} type={type.name} />
          )}

          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Picks</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {type.picks.length ? (
                type.picks.map((pick) => (
                  <tr key={pick.userId}>
                    <td>{pick.user.name}</td>
                    <td>
                      {pick.driver1.name}, {pick.driver2.name}, {pick.driver3.name}
                    </td>
                    <td>{pick.score}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3}>No picks</td>
                </tr>
              )}
            </tbody>
          </table>
        </Fragment>
      ))}
    </>
  );
}

async function findRound(year: number, round: number) {
  return db.round.findUnique({
    where: {
      roundId: {
        year,
        round,
      },
    },
  });
}

async function findRacesGroupedByType(round: Round) {
  const grouped = Object.values(Type).map(async (type) => {
    const at = getTypeAt(round, type);
    const pickWindow = calculatePickWindow(round, type);

    if (!at || !pickWindow) {
      return null;
    }

    const result = await db.result.findUnique({
      where: {
        resultId: {
          year: round.year,
          round: round.round,
          type,
        },
      },
      include: {
        driver1: { select: { name: true } },
        driver2: { select: { name: true } },
        driver3: { select: { name: true } },
      },
    });

    const picks = await db.pick.findMany({
      where: { year: round.year, round: round.round, type },
      orderBy: { score: "desc" },
      include: {
        user: { select: { name: true } },
        driver1: { select: { name: true } },
        driver2: { select: { name: true } },
        driver3: { select: { name: true } },
      },
    });

    return {
      name: type,
      at,
      pickWindow,
      isOpenForPicks: isOpenForPicks(round, type),
      picks,
      result,
    };
  });

  return (await Promise.all(grouped)).filter((type) => type !== null);
}

function getTypeAt(round: Round, type: Type) {
  switch (type) {
    case "SPRINT_QUALIFYING":
      return round.sprintQualifyingAt;
    case "SPRINT_RACE":
      return round.sprintRaceAt;
    case "RACE_QUALIFYING":
      return round.raceQualifyingAt;
    case "RACE":
      return round.raceAt;
  }
}

function calculatePickWindow(round: Round, type: Type): [Date, Date] | null {
  switch (type) {
    case "SPRINT_QUALIFYING":
      if (!round.sprintQualifyingAt) return null;
      return [subDays(round.sprintQualifyingAt, 1), subMinutes(round.sprintQualifyingAt, 5)];
    case "SPRINT_RACE":
      if (!round.sprintQualifyingAt || !round.sprintRaceAt) return null;
      return [addHours(round.sprintQualifyingAt, 1), subMinutes(round.sprintRaceAt, 5)];
    case "RACE_QUALIFYING":
      return [
        round.sprintRaceAt ? addHours(round.sprintRaceAt, 1) : subDays(round.raceQualifyingAt, 1),
        subMinutes(round.raceQualifyingAt, 5),
      ];
    case "RACE":
      return [addHours(round.raceQualifyingAt, 1), subMinutes(round.raceAt, 5)];
  }
}

function isOpenForPicks(round: Round, type: Type) {
  const window = calculatePickWindow(round, type);
  if (!window) return false;
  const [from, to] = window;
  const now = new Date();
  return now > from && now < to;
}
