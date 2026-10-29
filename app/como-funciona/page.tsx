import type { Metadata } from "next";
import { HowItWorksPage } from "../../components/pages/InfoPages";

export const metadata: Metadata = {
  title: "Como funciona",
  description:
    "Pesquise, entenda os cursos, compare com inteligência e candidate-se.",
};

export default function Page() {
  return <HowItWorksPage />;
}
