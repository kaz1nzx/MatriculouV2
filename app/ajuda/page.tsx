import type { Metadata } from "next";
import HelpPage from "../../components/pages/HelpPage";

export const metadata: Metadata = {
  title: "Central de ajuda",
  description:
    "Perguntas frequentes, suporte e canais de atendimento do Matriculou.",
};

export default function Page() {
  return <HelpPage />;
}
