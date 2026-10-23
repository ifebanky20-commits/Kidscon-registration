import { House, School } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import { ChartTooltip } from "@/components/admin/charts/ChartContent";
import { Card, CardContent } from "@/components/ui/Card";

interface SchoolRegistrationsChartProps {
  monthlyRegData: { name: string; Schools: number; sortKey: string; }[];
}

export function SchoolRegistrationsChart({
  monthlyRegData,
}: SchoolRegistrationsChartProps) {
  return (
    <Card className="rounded-2xl border border-brand-line bg-brand-surface shadow-sm">
      <CardContent className="p-6 md:p-8">
        <h3 className="text-sm font-medium text-brand-muted uppercase tracking-wider mb-6 flex items-center gap-2">
          <House size={16} /> Schools Over Time
        </h3>
        <div className="h-[300px] w-full">
          {monthlyRegData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyRegData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRegs" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      className="[stop-color:#007C43]"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      className="[stop-color:#007C43]"
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
                      "stroke-[#007C43] stroke-1 [stroke-dasharray:5_5]",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="Schools"
                  className="[&_.recharts-area-curve]:stroke-[#007C43] [&_.recharts-area-curve]:stroke-[4]"
                  fillOpacity={1}
                  fill="url(#colorRegs)"
                  activeDot={{
                    r: 6,
                    className: "fill-[#007C43] stroke-white stroke-2",
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-brand-muted/50 font-medium">
              No data matching filters
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
