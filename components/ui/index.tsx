"use client";

import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useRef,
  type ReactElement,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { CinemaIcon } from "../cinema/CinemaIcon";

export function Icon({
  name,
  size = 18,
  label,
}: {
  name: string;
  size?: number;
  label?: string;
}) {
  return (
    <span className="icon" role={label ? "img" : undefined} aria-label={label}>
      <CinemaIcon name={name} size={size} />
    </span>
  );
}

const focusable =
  'a[href],button:not(:disabled),input:not(:disabled):not([type="hidden"]),select:not(:disabled),textarea:not(:disabled),[tabindex]:not([tabindex="-1"])';

// Diálogo modal: prende o foco, fecha com Esc ou clique fora e devolve o foco a quem abriu.
export function Modal({
  title,
  eyebrow,
  onClose,
  children,
  size = "md",
  footer,
  describedBy,
}: {
  title: ReactNode;
  eyebrow?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  footer?: ReactNode;
  describedBy?: string;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  const titleId = useId();

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const first =
      panel.current?.querySelector<HTMLElement>("[data-autofocus]") ||
      panel.current?.querySelector<HTMLElement>(focusable);
    first?.focus({ preventScroll: true });
    const keyboard = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close.current();
      }
      if (e.key !== "Tab" || !panel.current) return;
      const items = [
        ...panel.current.querySelectorAll<HTMLElement>(focusable),
      ].filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const [head, tail] = [items[0], items[items.length - 1]];
      if (e.shiftKey && document.activeElement === head) {
        e.preventDefault();
        tail.focus();
      } else if (!e.shiftKey && document.activeElement === tail) {
        e.preventDefault();
        head.focus();
      }
    };
    document.addEventListener("keydown", keyboard);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", keyboard);
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, []);

  // Renderizado direto no body, acima da navegação fixa e de qualquer camada da página.
  return createPortal(
    <div
      className="modalLayer"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={panel}
        className={`modalPanel modal-${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={describedBy}
      >
        <header className="modalHead">
          <div>
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}
            <h2 id={titleId}>{title}</h2>
          </div>
          <button
            type="button"
            className="iconButton"
            onClick={onClose}
            aria-label="Fechar"
          >
            <Icon name="close" size={20} />
          </button>
        </header>
        <div className="modalBody">{children}</div>
        {footer && <footer className="modalFoot">{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
}

// Rótulo, dica e erro ligados ao campo por aria-describedby, para leitores de tela.
export function Field({
  label,
  hint,
  error,
  children,
  optional,
  className = "",
}: {
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  children: ReactElement;
  optional?: boolean;
  className?: string;
}) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const control = isValidElement(children)
    ? cloneElement(children as ReactElement<Record<string, unknown>>, {
        id: (children.props as { id?: string }).id || id,
        "aria-describedby":
          [hintId, errorId].filter(Boolean).join(" ") || undefined,
        "aria-invalid": error ? true : undefined,
      })
    : children;
  return (
    <div className={`field ${error ? "hasError" : ""} ${className}`}>
      <label htmlFor={(children.props as { id?: string }).id || id}>
        {label}
        {optional && <small> (opcional)</small>}
      </label>
      {control}
      {hint && !error && (
        <p className="fieldHint" id={hintId}>
          {hint}
        </p>
      )}
      {error && (
        <p className="fieldError" id={errorId} role="alert">
          <Icon name="alert" size={14} /> {error}
        </p>
      )}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  children,
  action,
  heading,
}: {
  icon: string;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  heading?: "h1" | "h2";
}) {
  const Title = heading || "b";
  return (
    <div className="emptyState">
      <span className="emptyIcon">
        <Icon name={icon} size={26} />
      </span>
      <Title className="emptyTitle">{title}</Title>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "info" | "success" | "warning" | "danger" | "accent";
}) {
  return <span className={`badge tone-${tone}`}>{children}</span>;
}

export function Spinner({ label = "Carregando" }: { label?: string }) {
  return <span className="spinner" role="status" aria-label={label} />;
}

export function SkeletonCards({ count = 6 }: { count?: number }) {
  return (
    <div className="cardGrid" aria-busy="true" aria-label="Carregando">
      {Array.from({ length: count }, (_, i) => (
        <div className="skeletonCard" key={i}>
          <div />
          <i />
          <i />
          <i />
        </div>
      ))}
    </div>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string; count?: number }[];
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div className="segmented" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
          {option.count !== undefined && <small>{option.count}</small>}
        </button>
      ))}
    </div>
  );
}

export function DataNotice() {
  return (
    <p className="dataNotice">
      <Icon name="info" size={15} />
      Informações de referência, sujeitas a alteração. Confirme valores, bolsas
      e conceitos com a instituição e no{" "}
      <a
        href="https://emec.mec.gov.br"
        target="_blank"
        rel="noopener noreferrer"
      >
        e-MEC
      </a>
      .
    </p>
  );
}

// Confirmação acessível que substitui o window.confirm.
export function ConfirmDialog({
  title,
  children,
  confirmLabel,
  danger,
  busy,
  disabled,
  onConfirm,
  onClose,
}: {
  title: string;
  children: ReactNode;
  confirmLabel: string;
  danger?: boolean;
  busy?: boolean;
  disabled?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal
      title={title}
      onClose={onClose}
      size="sm"
      footer={
        <>
          <button
            type="button"
            className="btn ghost"
            onClick={onClose}
            data-autofocus
          >
            Cancelar
          </button>
          <button
            type="button"
            className={`btn ${danger ? "danger" : "primary"}`}
            onClick={onConfirm}
            disabled={busy || disabled}
          >
            {busy ? "Aguarde…" : confirmLabel}
          </button>
        </>
      }
    >
      <div className="confirmText">{children}</div>
    </Modal>
  );
}
