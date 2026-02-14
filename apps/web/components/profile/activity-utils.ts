export type ContributionDay = {
  id: string;
  date: Date;
  isoDate: string;
  count: number;
};

export function toContributionDays(grid: Record<string, number>): ContributionDay[] {
  const keys = Object.keys(grid).sort();
  if (keys.length === 0) return [];

  const start = new Date(keys[0]! + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const result: ContributionDay[] = [];
  const current = new Date(start);

  while (current <= today) {
    const isoDate = current.toISOString().slice(0, 10);
    result.push({
      id: isoDate,
      date: new Date(current),
      isoDate,
      count: grid[isoDate] ?? 0,
    });
    current.setDate(current.getDate() + 1);
  }

  return result;
}

export function toWeekColumns(days: ContributionDay[]): (ContributionDay | null)[][] {
  if (days.length === 0) return [];

  const leading = Array.from<null>({ length: days[0]!.date.getDay() }).fill(null);
  const cells: (ContributionDay | null)[] = [...leading, ...days];
  const columns: (ContributionDay | null)[][] = [];

  for (let i = 0; i < cells.length; i += 7) {
    columns.push(cells.slice(i, i + 7));
  }

  return columns;
}

export function intensityClass(count: number): string {
  if (count === 0) return "border-white/8 bg-black/60";
  if (count <= 2) return "border-indigo-200/55 bg-indigo-300/35";
  if (count <= 4) return "border-indigo-200/70 bg-indigo-300/55";
  if (count <= 6) return "border-cyan-200/70 bg-cyan-300/60";
  return "border-cyan-100/85 bg-cyan-200/80";
}
