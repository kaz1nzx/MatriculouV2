"use client";

import Image from "next/image";
import { memo, useState } from "react";
import { Badge, Icon } from "../ui";
import { illustrationFor } from "../../lib/illustrations";
import {
  mecLabel,
  networkLabel,
  placeholderImage,
  priceLabel,
  typeLabel,
} from "../../lib/format";
import type { Institution } from "../../lib/types";

export function InstitutionImage({
  i,
  className,
  sizes = "(max-width: 700px) 92vw, 420px",
  priority,
}: {
  i: Institution;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const art = i.image ? null : i.illustration || illustrationFor(i.id, i.type);
  const src = i.image || art!.src;
  const alt = i.image ? `Foto de ${i.name}` : `Imagem ilustrativa: ${art!.alt}`;
  if (failed || !src.startsWith("/")) {
    return (
      <img
        className={className}
        src={failed ? placeholderImage(i.name) : src}
        alt={failed ? `${i.name} (sem foto disponível)` : alt}
        width={960}
        height={640}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <Image
      className={className}
      src={src}
      alt={alt}
      width={960}
      height={640}
      sizes={sizes}
      quality={70}
      priority={priority}
      onError={() => setFailed(true)}
    />
  );
}

// Licenças livres (CC BY / CC BY-SA) exigem autor, licença e fonte junto da foto.
export function ImageCredit({ i }: { i: Institution }) {
  if (!i.image) {
    const art = i.illustration || illustrationFor(i.id, i.type);
    return (
      <p className="imageCredit">
        <b>Imagem ilustrativa</b>: não mostra {i.name}. Foto: {art.author} ·{" "}
        {art.license} ·{" "}
        <a href={art.source} target="_blank" rel="noopener noreferrer">
          fonte
        </a>
      </p>
    );
  }
  if (!i.imageCredit) return null;
  const { author, license, source } = i.imageCredit;
  return (
    <p className="imageCredit">
      Foto: {author}
      {license && <> · {license} (adaptada)</>}
      {source && (
        <>
          {" "}
          ·{" "}
          <a href={source} target="_blank" rel="noopener noreferrer">
            Wikimedia Commons
          </a>
        </>
      )}
    </p>
  );
}

function InstitutionCard({
  i,
  courses,
  liked,
  comparing,
  onLike,
  onCompare,
  onOpen,
}: {
  i: Institution;
  courses?: number;
  liked: boolean;
  comparing: boolean;
  onLike: () => void;
  onCompare: () => void;
  onOpen: () => void;
}) {
  return (
    <article className="instCard" data-cinema-tilt>
      <div className="instMedia">
        <InstitutionImage i={i} />
        <div className="instTags">
          <Badge tone={i.network === "publica" ? "info" : "neutral"}>
            {networkLabel(i.network)}
          </Badge>
          {i.enrollmentOpen && <Badge tone="success">Inscrições abertas</Badge>}
          {!i.image && <Badge>Ilustrativa</Badge>}
        </div>
        <button
          type="button"
          className={`likeButton ${liked ? "isLiked" : ""}`}
          aria-label={
            liked ? `Remover ${i.name} das favoritas` : `Favoritar ${i.name}`
          }
          aria-pressed={liked}
          onClick={onLike}
        >
          <Icon name="heart" size={19} />
        </button>
      </div>
      <div className="instBody">
        <span className="instType">{typeLabel(i.type)}</span>
        <h3>
          <button type="button" className="linkish" onClick={onOpen}>
            {i.name}
          </button>
        </h3>
        <p className="instPlace">
          <Icon name="pin" size={15} /> {i.city}, {i.state}
        </p>
        <dl className="instFacts">
          <div>
            <dt>Mensalidade</dt>
            <dd>{priceLabel(i)}</dd>
          </div>
          <div>
            <dt>Conceito MEC</dt>
            <dd>{mecLabel(i)}</dd>
          </div>
          <div>
            <dt>Cursos</dt>
            <dd>{courses ? courses : "—"}</dd>
          </div>
        </dl>
        <div className="instActions">
          <button
            type="button"
            className={`btn ghost ${comparing ? "isOn" : ""}`}
            aria-pressed={comparing}
            onClick={onCompare}
          >
            <Icon name={comparing ? "check" : "compare"} size={16} />
            {comparing ? "No comparador" : "Comparar"}
          </button>
          <button type="button" className="btn primary" onClick={onOpen}>
            Ver detalhes <Icon name="arrow" size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}

export default memo(InstitutionCard);
