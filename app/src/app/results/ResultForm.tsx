"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { titleizeType } from "@/common";
import recordResultAction from "./recordResultAction";
import SubmitButton from "@/components/SubmitButton";
import { Type } from "@prisma/client";

type Props = {
  rounds: { year: number; round: number; name: string }[];
  drivers: { id: number; name: string }[];
};

const initialState = {
  error: "",
};

export default function ResultForm({ rounds, drivers }: Props) {
  const [formState, formAction] = useFormState(recordResultAction, initialState);
  const [selected, setSelected] = useState({ driver1Id: 0, driver2Id: 0, driver3Id: 0 });

  return (
    <form action={formAction}>
      <div>
        <label htmlFor="roundId">Round:</label>{" "}
        <select name="roundId" id="roundId">
          <option value="">Pick a round</option>
          {rounds.map((round) => (
            <option key={`${round.year}-${round.round}`} value={`${round.year}-${round.round}`}>
              {round.year}: {round.round} {round.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="type">Type:</label>{" "}
        <select name="type" id="type">
          <option value="">Pick a type</option>
          {Object.values(Type).map((type) => (
            <option key={type} value={type}>
              {titleizeType(type)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="driver1Id">Driver 1:</label>{" "}
        <select
          name="driver1Id"
          id="driver1Id"
          onChange={(e) => setSelected({ ...selected, driver1Id: +e.target.value })}
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

      {formState?.error && <p>{formState.error}</p>}

      <SubmitButton />
    </form>
  );
}
