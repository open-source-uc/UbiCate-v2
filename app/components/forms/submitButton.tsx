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
      className="w-full p-3 text-foreground bg-transparent border border-border rounded-lg hover:bg-accent/10 focus:ring-primary focus:outline-hidden focus:ring-2"
      disabled={pending}
    >
      {pending ? fallback : children}
    </button>
  );
}
