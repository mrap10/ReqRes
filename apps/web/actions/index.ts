import { LeaderboardDTO, ProblemDetailDTO, ProblemListDTO } from "@reqres/types";

let leaderboardCache: { data: LeaderboardDTO[]; timestamp: number } | null = null;
const LEADERBOARD_CACHE_TTL = 2 * 60 * 1000;

export async function getProblems(): Promise<ProblemListDTO[]> {
  try {
    const problems = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/problems`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!problems.ok) {
      console.error("Failed to fetch problems");
      return [];
    }

    const data = await problems.json();
    return data.problems;
  } catch (error) {
    console.error("Error fetching problems:", error);
    return [];
  }
}

export async function getProblemDetail(slug: string): Promise<ProblemDetailDTO | null> {
  try {
    const problemDetail = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/problems/${slug}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!problemDetail.ok) {
      console.error("Failed to fetch problem detail");
      return null;
    }

    const data = await problemDetail.json();
    return data.problem || null;
  } catch (error) {
    console.error("Error fetching problem detail:", error);
    return null;
  }
}

export async function getLeaderboard(): Promise<LeaderboardDTO[]> {
  if (leaderboardCache && Date.now() - leaderboardCache.timestamp < LEADERBOARD_CACHE_TTL) {
    return leaderboardCache.data;
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/submissions/leaderboard`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error("Failed to fetch leaderboard data");
      return leaderboardCache?.data ?? [];
    }

    const data = await response.json();
    leaderboardCache = { data: data.leaderboard, timestamp: Date.now() };
    return data.leaderboard;
  } catch (error) {
    console.error("Error fetching leaderboard data:", error);
    return leaderboardCache?.data ?? [];
  }
}

export async function getUsersSubmission({ id }: { id: string }) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/submissions/user/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Failed to fetch user's submissions");
      return [];
    }

    const data = await response.json();
    return data.submissions;
  } catch (error) {
    console.error("Error fetching user's submissions:", error);
    return [];
  }
}
