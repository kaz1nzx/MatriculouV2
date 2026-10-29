import type { Metadata } from "next";
import { Suspense } from "react";
import InstitutionsPage from "../../components/institutions/InstitutionsPage";

export const metadata: Metadata = {
  title: "Instituições",
  description:
    "Encontre universidades, faculdades, escolas técnicas e colégios por estado, rede, curso, modalidade e mensalidade.",
};

export default function Page() {
  return (
    <Suspense>
      <InstitutionsPage />
    </Suspense>
  );
}
