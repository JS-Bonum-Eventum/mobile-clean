import React, { createContext, useContext, useState } from "react";

type RosaryType = "ave" | "pai";

type ContextType = {
  beads: RosaryType[];
  active: boolean[];
  current: number;
  toggle: (i: number) => void;
  next: () => void;
  reset: () => void;
};

const RosaryContext = createContext({} as ContextType);

function generateRosary(): RosaryType[] {
  const beads: RosaryType[] = [];

  // pendente
  beads.push("pai");
  beads.push("ave", "ave", "ave");
  beads.push("pai");

  // dezenas
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 10; j++) beads.push("ave");
    if (i < 4) beads.push("pai");
  }

  return beads;
}

export function RosaryProvider({ children }: any) {
  const beads = generateRosary();

  const [active, setActive] = useState(
    new Array(beads.length).fill(false)
  );

  const [current, setCurrent] = useState(0);

  function toggle(i: number) {
    const updated = [...active];
    updated[i] = !updated[i];
    setActive(updated);
  }

  function next() {
    if (current < beads.length) {
      const updated = [...active];
      updated[current] = true;
      setActive(updated);
      setCurrent(current + 1);
    }
  }

  function reset() {
    setActive(new Array(beads.length).fill(false));
    setCurrent(0);
  }

  return (
    <RosaryContext.Provider
      value={{ beads, active, current, toggle, next, reset }}
    >
      {children}
    </RosaryContext.Provider>
  );
}

export const useRosary = () => useContext(RosaryContext);