import { headers } from "next/headers";
import { redirect } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

interface Session {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

async function getSession(): Promise<Session | null> {
  try {
    const headersList = await headers();
    const cookie = headersList.get("cookie") || "";

    const response = await fetch(`${API_BASE_URL}/api/auth/get-session`, {
      headers: {
        cookie,
      },
      cache: "no-store",
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data as Session;
  } catch {
    return null;
  }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session?.user) {
    redirect("/signin");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return <>{children}</>;
}
