import { Suspense } from "react";
import PasswordReset from "@/components/PasswordReset";

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <PasswordReset />
    </Suspense>
  );
}
