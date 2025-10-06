import { Button } from "./button";
import * as Icons from "./icons/icons";

/**
 * Button Component Usage Examples
 *
 * This file demonstrates how to use the Button component with different variants and configurations.
 */

export function ButtonExamples() {
  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold">Button Component Examples</h2>

      {/* Basic variants */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Basic Variants</h3>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary" text="Primary Button" />
          <Button variant="secondary" text="Secondary Button" />
          <Button variant="accent" text="Accent Button" />
          <Button variant="destructive" text="Destructive Button" />
          <Button variant="ghost" text="Ghost Button" />
        </div>
      </section>

      {/* Sizes */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Sizes</h3>
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="primary" size="sm" text="Small" />
          <Button variant="primary" size="md" text="Medium" />
          <Button variant="primary" size="lg" text="Large" />
        </div>
      </section>

      {/* Icon buttons */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Icon Buttons</h3>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary" size="icon" icon={<Icons.Search />} />
          <Button variant="accent" size="icon" icon={<Icons.Map />} />
          <Button variant="secondary" size="icon" icon={<Icons.Palette />} />
        </div>
      </section>

      {/* Icon with text */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Icon with Text</h3>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary" icon={<Icons.Search />} text="Search" />
          <Button variant="accent" icon={<Icons.Map />} text="Campus" />
          <Button variant="secondary" icon={<Icons.Palette />} text="Themes" />
        </div>
      </section>

      {/* Sidebar buttons */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Sidebar Buttons</h3>
        <div className="flex flex-col w-52 space-y-2">
          <Button variant="ghost" size="sidebar" icon={<Icons.Search />} text="Buscar" isActive={false} />
          <Button variant="ghost" size="sidebar" icon={<Icons.Map />} text="Campus" isActive={true} />
          <Button variant="ghost" size="sidebar" icon={<Icons.Palette />} text="Temas" isActive={false} />
        </div>
      </section>

      {/* Collapsed sidebar buttons */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Collapsed Sidebar Buttons</h3>
        <div className="flex flex-col w-20 space-y-2">
          <Button variant="ghost" size="sidebar-collapsed" icon={<Icons.Search />} isActive={false} />
          <Button variant="ghost" size="sidebar-collapsed" icon={<Icons.Map />} isActive={true} />
          <Button variant="ghost" size="sidebar-collapsed" icon={<Icons.Palette />} isActive={false} />
        </div>
      </section>

      {/* Custom children */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Custom Content</h3>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary">
            <span className="flex items-center space-x-2">
              <Icons.Search className="w-4 h-4" />
              <span>Custom Content</span>
            </span>
          </Button>
        </div>
      </section>
    </div>
  );
}
