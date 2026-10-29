import type { Metadata } from "next";
import LegalPage from "../../components/LegalPages";

export const metadata: Metadata = {
  title: "Seus direitos (LGPD)",
  description:
    "Exerça os direitos previstos na Lei Geral de Proteção de Dados.",
};

export default function Page() {
  return <LegalPage view="lgpd" />;
}
