import { Activity } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import { ChartTooltip } from "@/features/admin/components/charts/ChartContent";
import { Card, CardContent } from "@/shared/components/ui/Card";

interface DailyRegistrationsChartProps {
  dailyRegData: { name: string; Schools: number; sortKey: string; }[];
}

export function DailyRegistrationsChart({
  dailyRegData,
}: DailyRegistrationsChartProps) {
  return (
    <Card className="rounded-[32px] border border-md-outline/10 bg-md-surface-container-lowest shadow-sm lg:col-span-2">
      <CardContent className="p-6 md:p-8">
        <h3 className="text-sm font-bold text-md-on-surface-variant uppercase tracking-wider mb-6 flex items-center gap-2">
          <Activity size={16} /> Daily Registration Trend
        </h3>
        <div className="h-[300px] w-full">
          {dailyRegData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={dailyRegData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorDaily" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      className="[stop-color:#BA1720]"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      className="[stop-color:#BA1720]"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  className="[&_line]:stroke-[#e0e0e0]"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ className: "text-xs fill-gray-500" }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ className: "text-xs fill-gray-500" }}
                  allowDecimals={false}
                />
                <RechartsTooltip
                  content={ChartTooltip}
                  cursor={{
                    className:
                      "stroke-[#BA1720] stroke-1 [stroke-dasharray:5_5]",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="Schools"
                  className="[&_.recharts-area-curve]:stroke-[#BA1720] [&_.recharts-area-curve]:stroke-[3]"
                  fillOpacity={1}
                  fill="url(#colorDaily)"
                  activeDot={{
                    r: 6,
                    className: "fill-[#BA1720] stroke-white stroke-2",
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-md-on-surface-variant/50 font-medium">
              No data matching filters
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
