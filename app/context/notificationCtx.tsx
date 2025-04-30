"use client";

import { createContext, useState } from "react";

type notificationType = "success" | "error" | "info" | "warning" | null | undefined;
type notificationCode = "locationError" | null | undefined;

export const NotificationContext = createContext<{
  message: string | null | undefined;
  setNotification: (message?: string | null, type?: notificationType, code?: notificationCode) => void;
  type: notificationType;
  code: notificationCode;
}>({
  message: null,
  setNotification: (message?: string | null, type?: notificationType) => null,
  type: null,
  code: null,
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null | undefined>(undefined);
  const [type, setType] = useState<notificationType>(undefined);
  const [code, setCode] = useState<notificationCode>(undefined);

  const setNotification = (message?: string | null | undefined, type?: notificationType, code?: notificationCode) => {
    if (message !== undefined) setMessage(message);
    if (type !== undefined) setType(type);
    if (code !== undefined) setCode(code);
  };

  return (
    <NotificationContext.Provider value={{ message, setNotification, type, code }}>
      {children}
    </NotificationContext.Provider>
  );
}
