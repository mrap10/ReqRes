"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, TrendingUp } from "lucide-react";
import React from "react";
import type { HourlySubmissionData } from "@/lib/types/metrics";

// Change it to your needs
const animationConfig = {
  glowWidth: 300,
};

const chartConfig = {
  created: {
    label: "Submissions",
    color: "var(--chart-1)",
  },
  completed: {
    label: "Completed",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

interface AnimatedHighlightedAreaChartProps {
  data: HourlySubmissionData[];
  isLoading?: boolean;
  trendPercentage?: number;
}

export function AnimatedHighlightedAreaChart({
  data,
  isLoading = false,
  trendPercentage = 0,
}: AnimatedHighlightedAreaChartProps) {
  const [xAxis, setXAxis] = React.useState<number | null>(null);

  const trendUp = trendPercentage >= 0;
  const trendText = trendUp ? `+${trendPercentage.toFixed(1)}%` : `${trendPercentage.toFixed(1)}%`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Submission Volume
          <Badge
            variant="outline"
            className={`${trendUp ? "text-green-500 bg-green-500/10" : "text-red-500 bg-red-500/10"} border-none ml-2`}
          >
            {trendUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span>{trendText}</span>
          </Badge>
        </CardTitle>
        <CardDescription>Hourly throughput - Created vs Completed (24h)</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[200px] flex items-center justify-center">
            <div className="animate-pulse bg-zinc-800 rounded w-full h-full" />
          </div>
        ) : (
          <ChartContainer config={chartConfig}>
            <AreaChart
              accessibilityLayer
              data={data}
              onMouseMove={(e) => setXAxis(e.chartX as number)}
              onMouseLeave={() => setXAxis(null)}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="hourLabel"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value: string) => value.slice(0, 5)}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <defs>
                <linearGradient id="animated-highlighted-mask-grad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="transparent" />
                  <stop offset="50%" stopColor="white" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
                <linearGradient id="animated-highlighted-grad-created" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-created)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--color-created)" stopOpacity={0} />
                </linearGradient>
                <linearGradient
                  id="animated-highlighted-grad-completed"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="var(--color-completed)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--color-completed)" stopOpacity={0} />
                </linearGradient>
                {xAxis && (
                  <mask id="animated-highlighted-mask">
                    <rect
                      x={xAxis - animationConfig.glowWidth / 2}
                      y={0}
                      width={animationConfig.glowWidth}
                      height="100%"
                      fill="url(#animated-highlighted-mask-grad)"
                    />
                  </mask>
                )}
              </defs>
              <Area
                dataKey="completed"
                type="natural"
                fill={"url(#animated-highlighted-grad-completed)"}
                fillOpacity={0.4}
                stroke="var(--color-completed)"
                stackId="a"
                strokeWidth={0.8}
                mask="url(#animated-highlighted-mask)"
              />
              <Area
                dataKey="created"
                type="natural"
                fill={"url(#animated-highlighted-grad-created)"}
                fillOpacity={0.4}
                stroke="var(--color-created)"
                stackId="a"
                strokeWidth={0.8}
                mask="url(#animated-highlighted-mask)"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
