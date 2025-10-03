"use client";

import { useEffect, useState } from "react";

/**
 * IOSSafariModalExample Component
 *
 * This is an example implementation of a modal that works correctly on iOS Safari.
 * It demonstrates the three-part optimization strategy:
 *
 * 1. Backdrop uses position: absolute (not fixed)
 * 2. Body gets position: relative when modal is open
 * 3. Modal content is wrapped in position: sticky container
 *
 * This component is provided as a reference implementation.
 * For production use, consider using a UI library like Radix UI with these optimizations.
 *
 * @see /docs/ios-safari-optimization.md for full documentation
 */

interface IOSSafariModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function IOSSafariModalExample({ isOpen, onClose, title, children }: IOSSafariModalProps) {
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    if (isOpen) {
      // Store current scroll position
      const currentScroll = window.scrollY || document.documentElement.scrollTop;
      setScrollPosition(currentScroll);

      // iOS Safari fix: Set body to position relative
      // This allows absolute-positioned backdrop to work correctly
      document.body.style.position = "relative";

      // Optional: Prevent body scroll while modal is open
      document.body.style.overflow = "hidden";

      return () => {
        // Cleanup: Restore body styles
        document.body.style.position = "";
        document.body.style.overflow = "";

        // Restore scroll position if needed
        if (scrollPosition) {
          window.scrollTo(0, scrollPosition);
        }
      };
    }
  }, [isOpen, scrollPosition]);

  if (!isOpen) return null;

  return (
    <>
      {/* 
        Part 1: Backdrop with position: absolute 
        - Not using position: fixed to avoid iOS Safari issues
        - min-height ensures it covers entire page, not just viewport
      */}
      <div
        className="ios-safari-modal-backdrop"
        style={{
          position: "absolute", // Key: absolute, not fixed!
          inset: 0,
          minHeight: "100vh",
          minHeight: "100dvh", // Use dynamic viewport height if available
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 40,
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 
        Part 3: Sticky wrapper for modal content
        - Keeps modal visible in viewport regardless of scroll position
        - position: sticky with top: 50vh centers in viewport
      */}
      <div
        className="ios-safari-modal-sticky-wrapper"
        style={{
          position: "sticky",
          top: "50vh",
          transform: "translateY(-50%)",
          zIndex: 50,
          pointerEvents: "none", // Allow clicks through wrapper
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "1rem",
        }}
      >
        {/* Modal content - re-enable pointer events */}
        <div
          className="ios-safari-modal-content"
          style={{ pointerEvents: "auto" }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? "modal-title" : undefined}
        >
          {/* Example modal styling - customize as needed */}
          <div className="bg-background rounded-lg shadow-xl p-6 max-w-lg w-full">
            {title ? (
              <div className="flex justify-between items-center mb-4">
                <h2 id="modal-title" className="text-xl font-bold text-foreground">
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className="text-foreground hover:text-accent"
                  aria-label="Close modal"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : null}
            <div className="text-foreground">{children}</div>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * Example usage:
 * 
 * ```tsx
 * import { IOSSafariModalExample } from "@/app/components/examples/IOSSafariModalExample";
 * import { useState } from "react";
 * 
 * function MyComponent() {
 *   const [isOpen, setIsOpen] = useState(false);
 *   
 *   return (
 *     <>
 *       <button onClick={() => setIsOpen(true)}>
 *         Open Modal
 *       </button>
 *       
 *       <IOSSafariModalExample
 *         isOpen={isOpen}
 *         onClose={() => setIsOpen(false)}
 *         title="Example Modal"
 *       >
 *         <p>This modal works correctly on iOS Safari!</p>
 *       </IOSSafariModalExample>
 *     </>
 *   );
 * }
 * ```
 */
