import type { Metadata } from "next";
import LegalPage from "../../components/LegalPages";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description:
    "Regras de uso do site e das informações do catálogo do Matriculou.",
};

export default function Page() {
  return <LegalPage view="termos-uso" />;
}
