"use client";

import { useFormStatus } from "react-dom";

interface SubmitButtonProps {
  children: string;
  fallback?: string;
}

export function SubmitButton({ children, fallback = "Procesando..." }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="w-full p-3 text-content-primary bg-transparent border border-border rounded-lg hover:bg-interactive-accent/10 focus:ring-interactive-primary focus:outline-hidden focus:ring-2"
      disabled={pending}
    >
      {pending ? fallback : children}
    </button>
  );
}
