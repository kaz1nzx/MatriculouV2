import type { Metadata } from "next";
import ResetPasswordPage from "../../components/auth/ResetPasswordPage";

export const metadata: Metadata = {
  title: "Nova senha",
  robots: { index: false },
};

export default function Page() {
  return <ResetPasswordPage />;
}
