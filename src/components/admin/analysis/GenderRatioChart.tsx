import { PieChart as PieChartIcon } from "lucide-react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

import { ChartLegend, ChartTooltip } from "@/components/admin/charts/ChartContent";
import { Card, CardContent } from "@/components/ui/Card";

interface GenderRatioChartProps {
  genderData: { name: string; value: number; }[];
}

export function GenderRatioChart({
  genderData,
}: GenderRatioChartProps) {
  return (
    <Card className="rounded-2xl border border-brand-line bg-brand-surface shadow-sm">
      <CardContent className="p-6 md:p-8">
        <h3 className="text-sm font-medium text-brand-muted uppercase tracking-wider mb-6 flex items-center gap-2">
          <PieChartIcon size={16} /> Gender Ratio
        </h3>
        <div className="h-[250px] w-full">
          {genderData.reduce((a, b) => a + b.value, 0) > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  dataKey="value"
                  stroke="none"
                >
                  {genderData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      className={
                        entry.name === "Male"
                          ? "fill-[#346747]"
                          : "fill-[#BA1720]"
                      }
                    />
                  ))}
                </Pie>
                <RechartsTooltip content={ChartTooltip} />
                <Legend
                  content={
                    <ChartLegend
                      items={genderData.map((entry) => ({
                        name: entry.name,
                        markerClass:
                          entry.name === "Male"
                            ? "bg-[#346747]"
                            : "bg-[#BA1720]",
                      }))}
                    />
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-brand-muted/50 font-medium">
              No gender data
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
