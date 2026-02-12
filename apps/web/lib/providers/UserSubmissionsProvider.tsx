"use client";

import { getUsersSubmission } from "@/actions";
import { useAuth } from "./AuthProvider";
import { SubmissionListDTO } from "@reqres/types";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const FIRST_SUBMISSION_BONUS = 25;

interface DifficultyStats {
  easy: number;
  medium: number;
  hard: number;
}

interface UserSubmissionsContextType {
  submissions: SubmissionListDTO[];
  isLoading: boolean;
  totalSolved: number;
  difficultyCounts: DifficultyStats;
  baseXp: number;
  bonusXp: number;
  refetch: () => Promise<void>;
}

const UserSubmissionsContext = createContext<UserSubmissionsContextType | null>(null);

export default function UserSubmissionsProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [submissions, setSubmissions] = useState<SubmissionListDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fetchedForUserRef = useRef<string | null>(null);

  const fetchSubmissions = useCallback(async () => {
    if (!isAuthenticated || !user?.id) return;

    if (fetchedForUserRef.current === user.id && submissions.length > 0) return;

    setIsLoading(true);
    try {
      const data = await getUsersSubmission({ id: user.id });
      setSubmissions(data ?? []);
      fetchedForUserRef.current = user.id;
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id]);

  const refetch = useCallback(async () => {
    if (!isAuthenticated || !user?.id) return;
    fetchedForUserRef.current = null;
    setIsLoading(true);
    try {
      const data = await getUsersSubmission({ id: user.id });
      setSubmissions(data ?? []);
      fetchedForUserRef.current = user.id;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  useEffect(() => {
    if (!isAuthenticated) {
      setSubmissions([]);
      fetchedForUserRef.current = null;
    }
  }, [isAuthenticated]);

  const uniqueSolved = React.useMemo(() => {
    const seen = new Set<string>();
    return submissions.filter((s) => {
      if (s.status !== "PASSED") return false;
      if (seen.has(s.problemId)) return false;
      seen.add(s.problemId);
      return true;
    });
  }, [submissions]);

  const totalSolved = uniqueSolved.length;

  const difficultyCounts: DifficultyStats = uniqueSolved.reduce(
    (acc, s) => {
      const key = s.difficulty.toLowerCase() as keyof DifficultyStats;
      if (key in acc) acc[key]++;
      return acc;
    },
    { easy: 0, medium: 0, hard: 0 }
  );

  const totalXpFromSubmissions = uniqueSolved.reduce((sum, s) => sum + (s.xpEarned || 0), 0);
  const firstTryCount = uniqueSolved.filter((s) => s.isFirstTryBonus).length;
  const bonusXp = firstTryCount * FIRST_SUBMISSION_BONUS;
  const baseXp = totalXpFromSubmissions - bonusXp;

  return (
    <UserSubmissionsContext.Provider
      value={{
        submissions,
        isLoading,
        totalSolved,
        difficultyCounts,
        baseXp,
        bonusXp,
        refetch,
      }}
    >
      {children}
    </UserSubmissionsContext.Provider>
  );
}

export function useUserSubmissions() {
  const context = useContext(UserSubmissionsContext);
  if (!context) {
    throw new Error("useUserSubmissions must be used within a UserSubmissionsProvider");
  }
  return context;
}
