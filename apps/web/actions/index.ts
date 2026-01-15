import { ProblemDetailDTO, ProblemListDTO } from "@reqres/types";

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
