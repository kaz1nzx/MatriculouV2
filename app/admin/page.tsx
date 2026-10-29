import type { Metadata } from "next";
import { Suspense } from "react";
import AdminApp from "../../components/admin/AdminApp";

export const metadata: Metadata = {
  title: "Painel das instituições",
  description:
    "Gestão de dados, cursos, candidaturas, comunicados e equipe para instituições e redes de ensino.",
  robots: { index: false },
};

export default function Page() {
  return (
    <Suspense>
      <AdminApp />
    </Suspense>
  );
}
