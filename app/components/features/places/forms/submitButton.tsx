"use client";

import { useFormStatus } from "react-dom";

interface SubmitButtonProps {
  children: string;
  fallback?: string;
  variant?: "default" | "primary";
}

export function SubmitButton({ children, fallback = "Procesando...", variant = "default" }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  const baseClass =
    "w-full p-3 rounded-lg focus:ring-primary focus:outline-hidden focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variantClass =
    variant === "primary"
      ? "bg-primary text-primary-foreground hover:bg-secondary"
      : "text-foreground bg-transparent border border-border hover:bg-accent/10";

  return (
    <button type="submit" className={`${baseClass} ${variantClass}`} disabled={pending}>
      {pending ? fallback : children}
    </button>
  );
}
