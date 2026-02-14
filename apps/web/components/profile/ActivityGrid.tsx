"use client";

import { useMemo, useState } from "react";
import {
  type ContributionDay,
  toContributionDays,
  toWeekColumns,
  intensityClass,
} from "./activity-utils";

interface ActivityGridProps {
  grid: Record<string, number>;
}

export default function ActivityGrid({ grid }: ActivityGridProps) {
  const [hoveredCell, setHoveredCell] = useState<ContributionDay | null>(null);

  const days = useMemo(() => toContributionDays(grid), [grid]);
  const columns = useMemo(() => toWeekColumns(days), [days]);

  const monthLabels = useMemo(() => {
    const markers: string[] = [];
    let lastMonth = "";

    columns.forEach((column) => {
      const day = column.find((cell): cell is ContributionDay => cell !== null);
      if (!day) {
        markers.push("");
        return;
      }

      const month = day.date.toLocaleDateString(undefined, { month: "short" });
      if (month !== lastMonth) {
        markers.push(month);
        lastMonth = month;
      } else {
        markers.push("");
      }
    });

    return markers;
  }, [columns]);

  const totalSubmissions = useMemo(() => days.reduce((sum, day) => sum + day.count, 0), [days]);

  const dateRange = useMemo(() => {
    if (days.length === 0) return "";
    const first = days[0]!.date.toLocaleDateString(undefined, { month: "long" });
    const last = days[days.length - 1]!.date.toLocaleDateString(undefined, { month: "long" });
    return first === last ? first : `${first} to ${last}`;
  }, [days]);

  const hoverText = hoveredCell
    ? `${hoveredCell.count} submission${hoveredCell.count === 1 ? "" : "s"} on ${hoveredCell.date.toLocaleDateString(
        undefined,
        { month: "short", day: "numeric", year: "numeric" }
      )}`
    : `${totalSubmissions} submission${totalSubmissions === 1 ? "" : "s"} in total`;

  if (days.length === 0) {
    return (
      <div className="rounded-3xl border border-white/15 bg-[#0e0e15] p-5 sm:p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-white/50">Activity Graph</p>
        <p className="mt-3 text-sm text-white/40">No activity data yet. Start solving problems!</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/15 bg-[#0e0e15] p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm tracking-wider text-white/50">Activity Graph</p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-white">
            {dateRange ? `Since ${dateRange}` : "Activity"}
          </h3>
        </div>
        <p className="rounded-lg border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/80">
          {hoverText}
        </p>
      </div>

      <div className="mt-4 overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="mb-1 flex gap-1 pl-6 text-[10px] text-white/55">
            {monthLabels.map((label, index) => (
              <span key={`${label}-${index}`} className="w-3 ml-2">
                {label}
              </span>
            ))}
          </div>

          <div className="flex gap-1">
            <div className="grid grid-rows-7 gap-1 pr-2 text-[10px] text-white/45">
              <span className="h-3 leading-3">Sun</span>
              <span className="h-3 leading-3" />
              <span className="h-3 leading-3">Tue</span>
              <span className="h-3 leading-3" />
              <span className="h-3 leading-3">Thu</span>
              <span className="h-3 leading-3" />
              <span className="h-3 leading-3">Sat</span>
            </div>

            <div className="flex gap-1">
              {columns.map((week, weekIndex) => (
                <div key={`week-${weekIndex}`} className="grid grid-rows-7 gap-1">
                  {Array.from({ length: 7 }, (_, dayIndex) => {
                    const cell = week[dayIndex] ?? null;

                    if (!cell) {
                      return (
                        <span
                          key={`empty-${weekIndex}-${dayIndex}`}
                          className="h-3 w-3 rounded-[3px]"
                        />
                      );
                    }

                    return (
                      <button
                        key={cell.id}
                        type="button"
                        title={`${cell.count} submission${cell.count === 1 ? "" : "s"} on ${cell.isoDate}`}
                        onMouseEnter={() => setHoveredCell(cell)}
                        onMouseLeave={() => setHoveredCell(null)}
                        className={`h-3 w-3 rounded-[3px] border transition ${intensityClass(cell.count)}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2 text-[11px] text-white/70">
        <span>Less</span>
        <span className="h-2.5 w-2.5 rounded-[2px] border border-white/8 bg-black/60" />
        <span className="h-2.5 w-2.5 rounded-[2px] border border-indigo-200/55 bg-indigo-300/35" />
        <span className="h-2.5 w-2.5 rounded-[2px] border border-indigo-200/70 bg-indigo-300/55" />
        <span className="h-2.5 w-2.5 rounded-[2px] border border-cyan-200/70 bg-cyan-300/60" />
        <span className="h-2.5 w-2.5 rounded-[2px] border border-cyan-100/85 bg-cyan-200/80" />
        <span>More</span>
      </div>
      <div className="flex items-center gap-2 mt-5">
        <div className="font-mono italic text-white/70 text-[8px] rounded-full bg-zinc-800 px-1 font-semibold py-0.5">
          i
        </div>
        <p className="text-[11px] text-white/50">
          Activity data is based on your problem submissions. It may take a few hours for new
          submissions to appear here. Keep solving to see your activity grow!
        </p>
      </div>
    </div>
  );
}
