"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";

export function SubmitButton({
  children,
  className,
  pendingText = "Enviando…",
  "aria-pressed": pressionado,
}: {
  children: ReactNode;
  className: string;
  pendingText?: string;
  "aria-pressed"?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className} aria-pressed={pressionado}>
      {pending ? pendingText : children}
    </button>
  );
}
