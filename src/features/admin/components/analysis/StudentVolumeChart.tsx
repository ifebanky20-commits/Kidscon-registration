import { Users } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import { ChartTooltip } from "@/features/admin/components/charts/ChartContent";
import { Card, CardContent } from "@/shared/components/ui/Card";

interface StudentVolumeChartProps {
  monthlyStudentData: { name: string; Students: number; sortKey: string; }[];
}

export function StudentVolumeChart({
  monthlyStudentData,
}: StudentVolumeChartProps) {
  return (
    <Card className="rounded-[32px] border border-md-outline/10 bg-md-surface-container-lowest shadow-sm">
      <CardContent className="p-6 md:p-8">
        <h3 className="text-sm font-bold text-md-on-surface-variant uppercase tracking-wider mb-6 flex items-center gap-2">
          <Users size={16} /> Students Volume Over Time
        </h3>
        <div className="h-[300px] w-full">
          {monthlyStudentData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyStudentData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
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
                  cursor={{ className: "fill-[#B65A0C] opacity-10" }}
                />
                <Bar
                  dataKey="Students"
                  className="[&_.recharts-rectangle]:fill-[#B65A0C]"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
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
