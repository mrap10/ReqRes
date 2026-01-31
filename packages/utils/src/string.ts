// String manipulation utilities

// slugify("Hello World!") => "hello-world"
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// truncate("Hello World", 8) => "Hello..."
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

export function capitalize(text: string): string {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Normalize whitespace in text (for comparing code outputs)
 * Trims, normalizes line endings, and removes trailing whitespace per line
 */
export function normalizeWhitespace(text: string): string {
  return text.trim().replace(/\r\n/g, "\n").replace(/\s+$/gm, "");
}
