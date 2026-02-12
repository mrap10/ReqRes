"use client";

import { RadialBar, RadialBarChart, Cell } from "recharts";
import React from "react";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";

interface DifficultyStats {
  easy: number;
  medium: number;
  hard: number;
}

interface GlowingRadialChartProps {
  difficultyCounts: DifficultyStats;
  totalSolved: number;
  isLoading?: boolean;
}

const chartConfig = {
  solved: {
    label: "Solved",
  },
  easy: {
    label: "Easy",
    color: "var(--chart-2)",
  },
  medium: {
    label: "Medium",
    color: "var(--chart-3)",
  },
  hard: {
    label: "Hard",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

type ActiveDifficulty = "easy" | "medium" | "hard" | null;

export function GlowingRadialChart({
  difficultyCounts,
  totalSolved,
  isLoading,
}: GlowingRadialChartProps) {
  const [activeDifficulty, setActiveDifficulty] = React.useState<ActiveDifficulty>(null);

  const chartData = [
    { difficulty: "easy", solved: difficultyCounts.easy, fill: "var(--color-easy)" },
    { difficulty: "medium", solved: difficultyCounts.medium, fill: "var(--color-medium)" },
    { difficulty: "hard", solved: difficultyCounts.hard, fill: "var(--color-hard)" },
  ];

  return (
    <Card className="flex flex-col border-white/10 bg-[#0b0b10]">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-xl text-white">Solved Problems</CardTitle>
        <CardDescription className="text-white/50">
          {isLoading ? "Loading..." : `${totalSolved} problems solved across all difficulties`}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-52">
          <RadialBarChart
            data={chartData}
            innerRadius={30}
            outerRadius={110}
            onMouseMove={(data) => {
              if (data && data.activePayload && data.activePayload[0]) {
                setActiveDifficulty(data.activePayload[0].payload.difficulty);
              }
            }}
            onMouseLeave={() => setActiveDifficulty(null)}
          >
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel nameKey="difficulty" />}
            />
            <RadialBar
              cornerRadius={10}
              dataKey="solved"
              background={{ fill: "rgba(255,255,255,0.04)" }}
              className="drop-shadow-lg"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.fill}
                  filter={
                    activeDifficulty === entry.difficulty
                      ? `url(#radial-glow-${entry.difficulty})`
                      : undefined
                  }
                  opacity={
                    activeDifficulty === null || activeDifficulty === entry.difficulty ? 1 : 0.3
                  }
                />
              ))}
            </RadialBar>
            <defs>
              {chartData.map((entry) => (
                <filter
                  key={`filter-${entry.difficulty}`}
                  id={`radial-glow-${entry.difficulty}`}
                  x="-50%"
                  y="-50%"
                  width="200%"
                  height="200%"
                >
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              ))}
            </defs>
          </RadialBarChart>
        </ChartContainer>

        <div className="mt-1 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg border border-white/8 bg-white/3 px-2 py-2">
            <p className="text-xs text-white/45">Easy</p>
            <p className="mt-0.5 text-sm font-semibold text-emerald-400">{difficultyCounts.easy}</p>
          </div>
          <div className="rounded-lg border border-white/8 bg-white/3 px-2 py-2">
            <p className="text-xs text-white/45">Medium</p>
            <p className="mt-0.5 text-sm font-semibold text-amber-400">{difficultyCounts.medium}</p>
          </div>
          <div className="rounded-lg border border-white/8 bg-white/3 px-2 py-2">
            <p className="text-xs text-white/45">Hard</p>
            <p className="mt-0.5 text-sm font-semibold text-rose-400">{difficultyCounts.hard}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
