"use client";

import { createContext, useState, ReactNode, useCallback } from "react";

type NotificationCode = "locationError" | null;

interface NotificationContextType {
  component: ReactNode | null;
  setNotification: (component: ReactNode | null) => void;
  clearNotification: () => void;

  codes: Set<NotificationCode>;
  addCode: (code: NotificationCode) => void;
  removeCode: (code: NotificationCode) => void;
  clearAllCodes: () => void;
}

const defaultContextValue: NotificationContextType = {
  component: null,
  setNotification: () => null,
  clearNotification: () => null,
  codes: new Set<NotificationCode>(),
  addCode: () => null,
  removeCode: () => null,
  clearAllCodes: () => null,
};

export const NotificationContext = createContext<NotificationContextType>(defaultContextValue);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [component, setComponent] = useState<ReactNode | null>(null);
  const [codes, setCodes] = useState<Set<NotificationCode>>(new Set<NotificationCode>());

  const setNotification = useCallback((component: ReactNode | null) => {
    setComponent(component);
  }, []);

  const clearNotification = useCallback(() => {
    setComponent(null);
  }, []);

  const addCode = useCallback((code: NotificationCode): void => {
    setCodes((prevCodes) => {
      const newCodes = new Set(prevCodes);
      newCodes.add(code);
      return newCodes;
    });
  }, []);

  const removeCode = useCallback((code: NotificationCode): void => {
    setCodes((prevCodes) => {
      const newCodes = new Set(prevCodes);
      newCodes.delete(code);
      return newCodes;
    });
  }, []);

  const clearAllCodes = useCallback((): void => {
    setCodes(new Set<NotificationCode>());
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        component,
        setNotification,
        clearNotification,
        codes,
        addCode,
        removeCode,
        clearAllCodes,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
