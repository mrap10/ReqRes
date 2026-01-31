const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "numeric",
};

// e.g., "Jan 31, 2026"
export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", DATE_FORMAT_OPTIONS);
}

// YYYY-MM-DD
export function toISODateString(date: Date): string {
  return date.toISOString().split("T")[0] ?? "";
}

// e.g., "2 hours ago", "just now"
export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;

  return formatDate(date);
}

// in milliseconds to human-readable string
export function formatExecutionTime(ms: number): string {
  if (ms < 1) return "<1 ms";
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

// Format memory usage to human-readable string
export function formatMemory(mb: number): string {
  if (mb < 1) return `${Math.round(mb * 1024)} KB`;
  return `${mb.toFixed(2)} MB`;
}
