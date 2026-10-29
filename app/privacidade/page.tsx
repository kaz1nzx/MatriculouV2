import type { Metadata } from "next";
import LegalPage from "../../components/LegalPages";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Como o Matriculou trata e protege seus dados pessoais.",
};

export default function Page() {
  return <LegalPage view="privacidade" />;
}
