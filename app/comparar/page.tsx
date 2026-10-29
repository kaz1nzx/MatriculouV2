import type { Metadata } from "next";
import ComparePage from "../../components/compare/ComparePage";

export const metadata: Metadata = {
  title: "Comparar instituições",
  description:
    "Compare até quatro instituições e veja o melhor de cada uma para as suas prioridades.",
};

export default function Page() {
  return <ComparePage />;
}
