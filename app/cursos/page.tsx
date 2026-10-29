import type { Metadata } from "next";
import { Suspense } from "react";
import CoursesPage from "../../components/courses/CoursesPage";

export const metadata: Metadata = {
  title: "Cursos",
  description:
    "Duração, carga horária oficial, registro profissional, disciplinas, carreiras e onde estudar cada curso.",
};

export default function Page() {
  return (
    <Suspense>
      <CoursesPage />
    </Suspense>
  );
}
