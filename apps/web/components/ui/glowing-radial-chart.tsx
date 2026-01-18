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

const chartData = [
  { difficulty: "easy", solved: 200, fill: "var(--color-easy)" },
  { difficulty: "medium", solved: 187, fill: "var(--color-medium)" },
  { difficulty: "hard", solved: 90, fill: "var(--color-hard)" },
];

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

type ActiveBrowser = keyof typeof chartConfig | "all" | null;

export function GlowingRadialChart() {
  const [activeBrowser, setActiveBrowser] = React.useState<ActiveBrowser>(null);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-2xl">Solved Problems</CardTitle>
        <CardDescription>Hover over a segment to see your progress.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
          <RadialBarChart
            data={chartData}
            innerRadius={30}
            outerRadius={110}
            onMouseMove={(data) => {
              if (data && data.activePayload && data.activePayload[0]) {
                setActiveBrowser(data.activePayload[0].payload.difficulty);
              }
            }}
            onMouseLeave={() => setActiveBrowser(null)}
          >
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel nameKey="difficulty" />}
            />
            <RadialBar cornerRadius={10} dataKey="solved" background className="drop-shadow-lg">
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.fill}
                  filter={
                    activeBrowser === entry.difficulty
                      ? `url(#radial-glow-${entry.difficulty})`
                      : undefined
                  }
                  opacity={activeBrowser === null || activeBrowser === entry.difficulty ? 1 : 0.3}
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
      </CardContent>
    </Card>
  );
}
