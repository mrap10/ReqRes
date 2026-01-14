import { ProblemListDTO } from "@reqres/types";

export async function getProblems(): Promise<ProblemListDTO[]> {
  try {
    const problems = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/problems`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
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
