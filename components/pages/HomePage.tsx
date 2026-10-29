"use client";

import { useMemo, useState } from "react";
import { useApp } from "../app/AppProvider";
import CinematicHome from "../cinema/CinematicHome";
import InstitutionCard from "../institutions/InstitutionCard";
import InstitutionDetail from "../institutions/InstitutionDetail";
import type { Institution } from "../../lib/types";

export default function HomePage() {
  const {
    institutions,
    offers,
    catalogStatus,
    liked,
    toggleLike,
    compareIds,
    toggleCompare,
  } = useApp();
  const [open, setOpen] = useState<Institution | null>(null);
  const courses = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const o of offers) {
      if (!map.has(o.institution_id)) map.set(o.institution_id, new Set());
      map.get(o.institution_id)!.add(o.course_name);
    }
    return map;
  }, [offers]);
  // Destaques: inscrições abertas e mais cursos primeiro, para a vitrine mostrar opções completas.
  const featured = useMemo(
    () =>
      [...institutions].sort(
        (a, b) =>
          Number(b.enrollmentOpen) - Number(a.enrollmentOpen) ||
          Number(!!b.image) - Number(!!a.image) ||
          (courses.get(b.id)?.size || 0) - (courses.get(a.id)?.size || 0),
      ),
    [courses, institutions],
  );

  return (
    <>
      <CinematicHome
        institutions={featured}
        loading={catalogStatus === "loading"}
        demo={catalogStatus === "demo"}
        renderInstitution={(i) => (
          <InstitutionCard
            i={i}
            courses={courses.get(i.id)?.size}
            liked={liked.includes(i.id)}
            comparing={compareIds.includes(i.id)}
            onLike={() => toggleLike(i.id)}
            onCompare={() => toggleCompare(i.id)}
            onOpen={() => setOpen(i)}
          />
        )}
      />
      {open && <InstitutionDetail i={open} onClose={() => setOpen(null)} />}
    </>
  );
}
