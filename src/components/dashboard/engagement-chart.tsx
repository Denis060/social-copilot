"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "#E1306C",
  youtube: "#FF0000",
  tiktok: "#000000",
  facebook: "#1877F2",
  linkedin: "#0A66C2",
  pinterest: "#BD081C",
  discord: "#5865F2",
  x: "#1DA1F2",
  slack: "#4A154B",
};

interface EngagementChartProps {
  data: Array<Record<string, unknown>>;
}

export function EngagementChart({ data }: EngagementChartProps) {
  // Extract platform names from the data
  const platforms = new Set<string>();
  for (const entry of data) {
    for (const key of Object.keys(entry)) {
      if (key !== "date") platforms.add(key);
    }
  }

  // Flatten platform objects to total engagement per platform per day
  const chartData = data.map((entry) => {
    const row: Record<string, unknown> = { date: entry.date };
    for (const platform of platforms) {
      const val = entry[platform];
      if (val && typeof val === "object") {
        const obj = val as { likes: number; comments: number; shares: number };
        row[platform] = obj.likes + obj.comments + obj.shares;
      }
    }
    return row;
  });

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Engagement Over Time</CardTitle>
        </CardHeader>
        <CardContent className="flex h-64 items-center justify-center text-sm text-muted-foreground">
          No engagement data yet
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Engagement Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              tickFormatter={(v) =>
                new Date(v).toLocaleDateString("en", {
                  month: "short",
                  day: "numeric",
                })
              }
              className="text-muted-foreground"
            />
            <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Legend />
            {[...platforms].map((platform) => (
              <Line
                key={platform}
                type="monotone"
                dataKey={platform}
                stroke={PLATFORM_COLORS[platform] || "#6366f1"}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
