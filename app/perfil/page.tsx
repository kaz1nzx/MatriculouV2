import type { Metadata } from "next";
import { Suspense } from "react";
import ProfilePage from "../../components/account/ProfilePage";

export const metadata: Metadata = {
  title: "Meu perfil",
  description:
    "Favoritas, candidaturas, documentos e configurações da sua conta.",
  robots: { index: false },
};

export default function Page() {
  return (
    <Suspense>
      <ProfilePage />
    </Suspense>
  );
}
