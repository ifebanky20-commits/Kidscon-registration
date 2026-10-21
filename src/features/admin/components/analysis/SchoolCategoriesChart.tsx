import { PieChart as PieChartIcon } from "lucide-react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

import { CHART_FILLS, CHART_MARKERS } from "@/features/admin/components/analysis/chartPalette";
import { ChartLegend, ChartTooltip } from "@/features/admin/components/charts/ChartContent";
import { Card, CardContent } from "@/shared/components/ui/Card";

interface SchoolCategoriesChartProps {
  categoryData: { name: string; value: number; }[];
}

export function SchoolCategoriesChart({
  categoryData,
}: SchoolCategoriesChartProps) {
  return (
    <Card className="rounded-[32px] border border-md-outline/10 bg-md-surface-container-lowest shadow-sm">
      <CardContent className="p-6 md:p-8">
        <h3 className="text-sm font-bold text-md-on-surface-variant uppercase tracking-wider mb-6 flex items-center gap-2">
          <PieChartIcon size={16} /> School Categories
        </h3>
        <div className="h-[250px] w-full">
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      className={CHART_FILLS[index % CHART_FILLS.length]}
                    />
                  ))}
                </Pie>
                <RechartsTooltip
                  content={(props) => (
                    <ChartTooltip
                      {...props}
                      markers={Object.fromEntries(
                        categoryData.map((entry, index) => [
                          entry.name,
                          CHART_MARKERS[index % CHART_MARKERS.length],
                        ]),
                      )}
                    />
                  )}
                />
                <Legend
                  content={
                    <ChartLegend
                      items={categoryData.map((entry, index) => ({
                        name: entry.name,
                        markerClass:
                          CHART_MARKERS[index % CHART_MARKERS.length],
                      }))}
                    />
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-md-on-surface-variant/50 font-medium">
              No category data
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
