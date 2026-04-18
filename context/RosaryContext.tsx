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
  // Exposto para permitir restauração externa de estado (ex: salvar progresso)
  setActive: React.Dispatch<React.SetStateAction<boolean[]>>;
  // Exposto para restaurar a posição atual da conta destacada
  setCurrent: React.Dispatch<React.SetStateAction<number>>;
};

const RosaryContext = createContext({} as ContextType);

export function RosaryProvider({ children }: any) {
  // buildBeadArray() garante que o array de contas exposto pelo contexto
  // tem a MESMA ordem esperada pelo RealisticRosary:
  //   índices 0–53  → laço (oval)
  //   índices 54–58 → pendente (abaixo da medalha)
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
      if (prev < beads.length) {
        setActive((a) => {
          const updated = [...a];
          updated[prev] = true;
          return updated;
        });
        return prev + 1;
      }
      return prev;
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
