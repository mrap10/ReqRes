import { Suspense } from "react";
import { redirect } from "next/navigation";
import VerifyEmailContent from "../../../components/VerifyEmailContent";

interface VerifyEmailPageProps {
  searchParams: Promise<{
    token?: string;
    error?: string;
  }>;
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const params = await searchParams;

  if (!params.token && !params.error) {
    redirect("/signin");
  }

  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
