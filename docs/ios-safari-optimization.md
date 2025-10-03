# iOS Safari Optimization Guide

## Overview

iOS Safari has known issues with `position: fixed` elements when the page is scrolled or when the virtual keyboard is open. This document outlines the recommended approaches for implementing modals, overlays, and dropdowns that work correctly on iOS Safari.

## The Problem

On iOS Safari:
- `position: fixed` elements don't stay fixed relative to the viewport when scrolling
- Fixed elements can disappear or jump when the virtual keyboard opens
- Overlays using fixed positioning may not cover the visible viewport correctly

## The Solution

Implement a three-part strategy for iOS Safari compatibility:

### 1. Use `position: absolute` for Backdrops/Overlays

Instead of `position: fixed`, use `position: absolute` for backdrop/overlay elements:

```css
.modal-backdrop {
  position: absolute; /* Not fixed! */
  inset: 0;
  min-height: 100vh; /* Ensure it covers full page height */
  min-height: 100dvh; /* Use dynamic viewport height if available */
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 40;
}
```

### 2. Make Body Position Relative

When a modal/dropdown is open, ensure the body has `position: relative` to contain the absolute-positioned backdrop:

```css
body:has(.modal-open) {
  position: relative;
}
```

Or in JavaScript:
```typescript
// When modal opens
document.body.style.position = 'relative';

// When modal closes
document.body.style.position = '';
```

### 3. Use `position: sticky` for Modal Content

Wrap modal content in a sticky container to keep it visible in the viewport regardless of scroll position:

```css
.modal-sticky-wrapper {
  position: sticky;
  top: 50vh;
  transform: translateY(-50%);
  z-index: 50;
  pointer-events: none; /* Allow clicks through wrapper */
}

.modal-content {
  pointer-events: auto; /* Re-enable clicks on actual content */
}
```

## Implementation Examples

### Example 1: Custom Modal Component

```tsx
"use client";

import { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, children }: ModalProps) {
  // Manage body positioning for iOS Safari
  useEffect(() => {
    if (isOpen) {
      // Store scroll position
      const scrollY = window.scrollY;
      
      // Set body to relative for iOS Safari
      document.body.style.position = 'relative';
      
      return () => {
        // Restore on close
        document.body.style.position = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - absolute positioning for iOS Safari */}
      <div
        className="modal-backdrop"
        style={{
          position: 'absolute',
          inset: 0,
          minHeight: '100vh',
          minHeight: '100dvh',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 40,
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sticky wrapper to keep modal visible */}
      <div
        style={{
          position: 'sticky',
          top: '50vh',
          transform: 'translateY(-50%)',
          zIndex: 50,
          pointerEvents: 'none',
        }}
      >
        {/* Modal content */}
        <div
          style={{ pointerEvents: 'auto' }}
          role="dialog"
          aria-modal="true"
        >
          {children}
        </div>
      </div>
    </>
  );
}
```

### Example 2: Radix UI Dropdown with Custom Backdrop

When using Radix UI components that don't provide a backdrop by default (like DropdownMenu), you can add one:

```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { useState, useEffect } from "react";

export function DropdownWithBackdrop({ trigger, children }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.position = 'relative';
    } else {
      document.body.style.position = '';
    }
  }, [isOpen]);

  return (
    <>
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            minHeight: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 40,
          }}
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger>{trigger}</DropdownMenuTrigger>
        <DropdownMenuContent>{children}</DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
```

## CSS Implementation

The project includes iOS Safari optimizations in `app/styles/radix-overrides.css`:

```css
/* Target iOS Safari specifically */
@supports (-webkit-overflow-scrolling: touch) {
  /* Make body relative when modals/dropdowns are open */
  body:has([data-radix-dropdown-menu-content][data-state="open"]) {
    position: relative;
  }
}
```

## Testing Checklist

When testing modal/overlay components on iOS Safari:

- [ ] Open modal and scroll the page - modal should stay visible
- [ ] Open virtual keyboard - modal should remain properly positioned
- [ ] Open modal when page is already scrolled down - modal should appear in viewport
- [ ] Close modal - page scroll position should be maintained
- [ ] Test on different iOS Safari versions (iOS 15+)
- [ ] Test in both portrait and landscape orientations
- [ ] Verify backdrop covers entire visible area

## References

- [Radix UI Portal Issue #1159](https://github.com/radix-ui/primitives/issues/1159)
- [Stack Overflow: iOS Safari position fixed not working](https://stackoverflow.com/questions/52937708/ios-safari-position-fixed-not-working)
- [WebKit Bug: position:fixed issues](https://bugs.webkit.org/show_bug.cgi?id=153852)

## Additional Notes

### When NOT to Use These Fixes

These fixes are specifically for modals and overlays that should cover the entire page. For components that should stay fixed to the viewport (like sticky headers or floating action buttons), continue using `position: fixed` as normal.

### Browser Compatibility

The `@supports (-webkit-overflow-scrolling: touch)` query specifically targets iOS Safari. These optimizations are safe to apply to all browsers but are primarily beneficial for iOS Safari.

### Performance Considerations

Changing `body` position to `relative` can cause a repaint. For optimal performance:
- Only apply when modals are actually open
- Remove the style immediately when modal closes
- Use CSS transitions sparingly on large overlay elements
