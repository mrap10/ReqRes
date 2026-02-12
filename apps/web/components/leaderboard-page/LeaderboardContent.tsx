"use client";

import { getLeaderboard } from "@/actions";
import { useAuth } from "@/lib/providers/AuthProvider";
import { LeaderboardDTO } from "@reqres/types";
import { useEffect, useState } from "react";
import { LeaderboardHeader, LeaderboardTable } from "./index";

export default function LeaderboardContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardDTO[]>([]);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    async function fetchLeaderboard() {
      setIsLoading(true);
      const data = await getLeaderboard();
      setLeaderboardData(data);
      setIsLoading(false);
    }
    fetchLeaderboard();
  }, []);

  const top10 = leaderboardData.slice(0, 10);
  const totalPlayers = leaderboardData.length;
  const topXP = leaderboardData[0]?.totalScore ?? 0;
  const userEntry = user ? leaderboardData.find((u) => u.userId === user.id) : null;
  const isUserInTop10 = userEntry ? userEntry.globalRank <= 10 : false;

  return (
    <>
      <LeaderboardHeader
        totalPlayers={totalPlayers}
        topXP={topXP}
        userRank={userEntry?.globalRank ?? null}
        isAuthenticated={isAuthenticated}
        isLoading={isLoading}
      />

      <div className="mt-6">
        <LeaderboardTable
          leaderboardData={top10}
          isLoading={isLoading}
          currentUserId={user?.id ?? null}
          userEntry={userEntry && !isUserInTop10 ? userEntry : null}
        />
      </div>
    </>
  );
}
