# Example Components

This directory contains reference implementations and examples of UI patterns optimized for cross-browser compatibility, particularly iOS Safari.

## Available Examples

### IOSSafariModalExample

A complete implementation of a modal component that works correctly on iOS Safari.

**Key Features:**
- Backdrop uses `position: absolute` instead of `position: fixed`
- Body positioning is managed automatically
- Modal content uses `position: sticky` to stay in viewport
- Scroll position is preserved
- Fully accessible with ARIA attributes

**Usage:**

```tsx
import { IOSSafariModalExample } from "@/app/components/examples/IOSSafariModalExample";
import { useState } from "react";

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Open Modal
      </button>
      
      <IOSSafariModalExample
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Example Modal"
      >
        <p>Modal content goes here</p>
      </IOSSafariModalExample>
    </>
  );
}
```

**When to Use:**
- When you need a full-page modal/dialog
- When targeting iOS Safari users
- As a reference for implementing similar patterns

**When NOT to Use:**
- For production code (use a UI library like Radix UI instead)
- For simple dropdowns (they don't need backdrops)

## Related Documentation

- [iOS Safari Optimization Guide](/docs/ios-safari-optimization.md) - Complete documentation of the optimization strategy
- [Radix UI Overrides](/app/styles/radix-overrides.css) - CSS implementations for Radix UI components

## Contributing

When adding new example components to this directory:

1. Include comprehensive inline documentation
2. Demonstrate a specific pattern or technique
3. Include usage examples in comments
4. Follow accessibility best practices
5. Test on target browsers/devices
