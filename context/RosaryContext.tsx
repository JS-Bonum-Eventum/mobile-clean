import React, { createContext, useContext, useState } from "react";
import { buildBeadArray } from "@/utils/rosaryFlow";

type RosaryType = "ave" | "pai";

type ContextType = {
  beads: RosaryType[];
  active: boolean[];
  current: number;
  toggle: (i: number) => void;
  next: () => void;
  reset: () => void;
  setActive: React.Dispatch<React.SetStateAction<boolean[]>>;
  setCurrent: React.Dispatch<React.SetStateAction<number>>;
};

const RosaryContext = createContext({} as ContextType);

// ✅ Tipagem correta — sem "any"
export function RosaryProvider({ children }: { children: React.ReactNode }) {
  const beads = buildBeadArray();

  const [active, setActive] = useState<boolean[]>(
    new Array(beads.length).fill(false)
  );

  const [current, setCurrent] = useState(58);

  function toggle(i: number) {
    setActive((prev) => {
      const updated = [...prev];
      updated[i] = !updated[i];
      return updated;
    });
  }

  function next() {
    setCurrent((prev) => {
      // ✅ Corrigido: evita acesso fora do array (índice máximo = beads.length - 1)
      if (prev >= beads.length - 1) return prev;
      setActive((a) => {
        const updated = [...a];
        updated[prev] = true;
        return updated;
      });
      return prev + 1;
    });
  }

  function reset() {
    setActive(new Array(beads.length).fill(false));
    setCurrent(58);
  }

  return (
    <RosaryContext.Provider
      value={{ beads, active, current, toggle, next, reset, setActive, setCurrent }}
    >
      {children}
    </RosaryContext.Provider>
  );
}

export const useRosary = () => useContext(RosaryContext);
