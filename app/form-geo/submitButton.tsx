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
      className="w-full p-3 text-white-ubi bg-transparent border border-brown-light rounded-lg hover:bg-brown-light/10 focus:ring-blue-location focus:outline-hidden focus:ring-2"
      disabled={pending}
    >
      {pending ? fallback : children}
    </button>
  );
}
