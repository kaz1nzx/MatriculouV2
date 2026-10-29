import type { Metadata } from "next";
import LegalPage from "../../components/LegalPages";

export const metadata: Metadata = {
  title: "Termos de Serviço",
  description: "Condições para criar e usar uma conta no Matriculou.",
};

export default function Page() {
  return <LegalPage view="termos-servico" />;
}
