import type { Metadata } from "next";
import { Suspense } from "react";
import AuthPage from "../../components/auth/AuthPage";

export const metadata: Metadata = {
  title: "Criar conta",
  description:
    "Crie sua conta gratuita para guardar favoritas, comparar e se candidatar.",
};

export default function Page() {
  return (
    <Suspense>
      <AuthPage mode="cadastro" />
    </Suspense>
  );
}
