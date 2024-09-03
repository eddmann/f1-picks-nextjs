"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import makePickAction from "./makePickAction";
import SubmitButton from "@/components/SubmitButton";
import { Type } from "@prisma/client";

type Props = {
  year: number;
  round: number;
  type: Type;
  pick: { driver1Id: number | undefined; driver2Id: number | undefined; driver3Id: number | undefined };
  drivers: { id: number; name: string }[];
};

const initialState = {
  error: "",
};

export default function PickForm({ year, round, type, pick, drivers }: Props) {
  const makePickActionForRound = makePickAction.bind(null, year, round, type);
  const [state, formAction] = useFormState(makePickActionForRound, initialState);
  const [selected, setSelected] = useState(pick);

  return (
    <form action={formAction}>
      <div style={{ display: "flex", gap: 10 }}>
        <div>
          <label htmlFor="driver1Id">Driver 1:</label>{" "}
          <select
            name="driver1Id"
            id="driver1Id"
            onChange={(e) => setSelected({ ...selected, driver1Id: +e.target.value })}
            defaultValue={pick.driver1Id}
          >
            <option value="">Pick a driver</option>
            {drivers.map((driver) => (
              <option
                key={driver.id}
                value={driver.id}
                disabled={selected.driver2Id == driver.id || selected.driver3Id == driver.id}
              >
                {driver.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="driver2Id">Driver 2:</label>{" "}
          <select
            name="driver2Id"
            id="driver2Id"
            onChange={(e) => setSelected({ ...selected, driver2Id: +e.target.value })}
            defaultValue={pick.driver2Id}
          >
            <option value="">Pick a driver</option>
            {drivers.map((driver) => (
              <option
                key={driver.id}
                value={driver.id}
                disabled={selected.driver1Id == driver.id || selected.driver3Id == driver.id}
              >
                {driver.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="driver3Id">Driver 3:</label>{" "}
          <select
            name="driver3Id"
            id="driver3Id"
            onChange={(e) => setSelected({ ...selected, driver3Id: +e.target.value })}
            defaultValue={pick.driver3Id}
          >
            <option value="">Pick a driver</option>
            {drivers.map((driver) => (
              <option
                key={driver.id}
                value={driver.id}
                disabled={selected.driver1Id == driver.id || selected.driver2Id == driver.id}
              >
                {driver.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {state?.error && <p>{state.error}</p>}

      <SubmitButton />
    </form>
  );
}
