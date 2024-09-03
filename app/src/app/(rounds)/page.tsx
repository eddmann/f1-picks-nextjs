import { simulateExpensiveOperation } from "@/common";
import db from "@/db";
import Link from "next/link";
import { Suspense } from "react";

export default async function Page() {
  const rounds = await db.round.findMany({ orderBy: { round: "asc" } });

  return (
    <>
      <table>
        <thead>
          <tr>
            <th>Round</th>
            <th>Grand Prix</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rounds.length ? (
            rounds.map((round) => (
              <tr key={`${round.year}-${round.round}`}>
                <td>{round.round}</td>
                <td>{round.name}</td>
                <td>
                  <Link href={`rounds/${round.year}/${round.round}`}>View</Link>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3}>No rounds</td>
            </tr>
          )}
        </tbody>
      </table>

      <h2>🏆 Scoreboard</h2>

      <Suspense fallback={<LoadingScoreboard />}>
        <Scoreboard />
      </Suspense>
    </>
  );
}

function LoadingScoreboard() {
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Score</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td colSpan={3}>Loading...</td>
        </tr>
      </tbody>
    </table>
  );
}

async function Scoreboard() {
  const users = await findUserTotalScores();

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Score</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {users.length ? (
          users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.score.toString()}</td>
              <td>
                <Link href={`/users/${user.id}`}>View</Link>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={3}>No users</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

async function findUserTotalScores() {
  await simulateExpensiveOperation();

  return db.$queryRaw<[{ id: number; name: string; score: number }]>`
    SELECT "User".id, "User".name, SUM("Pick".score) as score
    FROM "User"
    INNER JOIN "Pick" ON "User".id = "Pick"."userId"
    WHERE "Pick".score IS NOT NULL
    GROUP BY "User".id, "User".name
    ORDER BY score DESC
  `;
}
