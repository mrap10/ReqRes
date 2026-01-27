"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { Bar, BarChart, XAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import type { DailyActiveUsersData } from "@/lib/types/metrics";

const chartConfig = {
  value: {
    label: "Active Users",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

interface DefaultBarChartProps {
  data: DailyActiveUsersData[];
  isLoading?: boolean;
  trendPercentage?: number;
}

export function DefaultBarChart({
  data,
  isLoading = false,
  trendPercentage = 0,
}: DefaultBarChartProps) {
  const trendUp = trendPercentage >= 0;
  const trendText = trendUp ? `+${trendPercentage.toFixed(1)}%` : `${trendPercentage.toFixed(1)}%`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Daily Active Users
          <Badge
            variant="outline"
            className={`${trendUp ? "text-green-500 bg-green-500/10" : "text-red-500 bg-red-500/10"} border-none ml-2`}
          >
            {trendUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span>{trendText}</span>
          </Badge>
        </CardTitle>
        <CardDescription>Last 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[200px] flex items-center justify-center">
            <div className="animate-pulse bg-zinc-800 rounded w-full h-full" />
          </div>
        ) : (
          <ChartContainer config={chartConfig}>
            <BarChart accessibilityLayer data={data}>
              <rect x="0" y="0" width="100%" height="85%" fill="url(#default-pattern-dots)" />
              <defs>
                <DottedBackgroundPattern />
              </defs>
              <XAxis
                dataKey="dayLabel"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value: string) => value.slice(0, 3)}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Bar dataKey="value" fill="var(--color-value)" radius={4} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

const DottedBackgroundPattern = () => {
  return (
    <pattern
      id="default-pattern-dots"
      x="0"
      y="0"
      width="10"
      height="10"
      patternUnits="userSpaceOnUse"
    >
      <circle className="dark:text-muted/40 text-muted" cx="2" cy="2" r="1" fill="currentColor" />
    </pattern>
  );
};
