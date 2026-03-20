"use client";

import React from "react";
import { Button } from "./button";

export interface AnnouncementProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  onClose: () => void;
  onDontShowToday?: () => void;
  isOpen: boolean;
}

const Announcement = React.forwardRef<HTMLDivElement, AnnouncementProps>(
  ({ title, description, actionLabel = "Aceptar", onAction, actionHref, onClose, onDontShowToday, isOpen }, ref) => {
    const [dontShowToday, setDontShowToday] = React.useState(false);
    
    const handleDontShowChange = () => {
      const newValue = !dontShowToday;
      setDontShowToday(newValue);
      if (newValue && onDontShowToday) {
        onDontShowToday();
      }
    };
    if (!isOpen) return null;

    return (
      <>
        {/* Backdrop with smooth transition */}
        <div
          className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity duration-300"
          onClick={onClose}
          role="presentation"
        />

        {/* Modal */}
        <div
          ref={ref}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 relative">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-all duration-200 z-10"
              aria-label="Cerrar anuncio"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Content */}
            <div className="p-8 text-center space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                {title}
              </h2>
              <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                {description}
              </p>

              {/* Actions */}
              <div className="flex justify-center">
                {actionHref ? (
                  <a
                    href={actionHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg"
                  >
                    {actionLabel}
                  </a>
                ) : (
                  <button
                    onClick={onAction || onClose}
                    className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg"
                  >
                    {actionLabel}
                  </button>
                )}
              </div>

              {/* Checkbox */}
              <div className="flex items-center justify-center gap-2">
                <input
                  type="checkbox"
                  id="dont-show-today"
                  checked={dontShowToday}
                  onChange={handleDontShowChange}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"
                />
                <label htmlFor="dont-show-today" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                  No volver a mostrar
                </label>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  },
);

Announcement.displayName = "Announcement";

export { Announcement };
