export type ChangelogChangeType = "new" | "improved" | "fixed";

export interface ChangelogChange {
  type: ChangelogChangeType;
  text: string;
}

export interface ChangelogEntry {
  id: string;
  version: string;
  // Fecha ISO (YYYY-MM-DD o ISO completa).
  date: string;
  title: string;
  description?: string;
  changes: ChangelogChange[];
}
