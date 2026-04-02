import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  fetchLiturgy,
  LiturgyData,
  getDailyPhrase,
  getDailyVerse,
} from "@/services/liturgiaService";

interface LiturgyContextValue {
  liturgy: LiturgyData | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  dailyPhrase: string;
  dailyVerse: { verse: string; text: string };
}

const LiturgyContext = createContext<LiturgyContextValue | null>(null);

export function LiturgyProvider({ children }: { children: ReactNode }) {
  const [liturgy, setLiturgy] = useState<LiturgyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dailyPhrase] = useState(getDailyPhrase());
  const [dailyVerse] = useState(getDailyVerse());

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchLiturgy();
      setLiturgy(data);
    } catch {
      setError("Não foi possível carregar a liturgia.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <LiturgyContext.Provider
      value={{ liturgy, isLoading, error, refresh, dailyPhrase, dailyVerse }}
    >
      {children}
    </LiturgyContext.Provider>
  );
}

export function useLiturgy() {
  const ctx = useContext(LiturgyContext);
  if (!ctx) {
    throw new Error("useLiturgy must be used inside LiturgyProvider");
  }
  return ctx;
}
