import type { Metadata } from "next";
import { AboutPage } from "../../components/pages/InfoPages";

export const metadata: Metadata = {
  title: "Sobre a BIJK",
  description:
    "Quem desenvolve o Matriculou e os princípios que guiam o produto.",
};

export default function Page() {
  return <AboutPage />;
}
