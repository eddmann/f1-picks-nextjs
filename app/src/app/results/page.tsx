import db from "@/db";
import { redirect } from "next/navigation";
import ResultForm from "./ResultForm";
import { findDrivers } from "@/common";
import { isAuthenticatedAsAdmin } from "@/auth";

export default async function Page() {
  if (!(await isAuthenticatedAsAdmin())) {
    redirect("/");
  }

  const rounds = await db.round.findMany({ select: { year: true, round: true, name: true } });
  const drivers = await findDrivers();

  return (
    <>
      <h1>Record Result</h1>
      <ResultForm rounds={rounds} drivers={drivers} />
    </>
  );
}
