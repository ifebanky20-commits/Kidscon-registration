import { PieChart as PieChartIcon } from "lucide-react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

import { CHART_FILLS, CHART_MARKERS } from "@/components/pages/admin/analysis/chartPalette";
import { ChartLegend, ChartTooltip } from "@/components/pages/admin/charts/ChartContent";
import { Card, CardContent } from "@/components/ui/Card";

interface SchoolCategoriesChartProps {
  categoryData: { name: string; value: number; }[];
}

export function SchoolCategoriesChart({
  categoryData,
}: SchoolCategoriesChartProps) {
  return (
    <Card className="rounded-2xl border border-brand-line bg-brand-surface shadow-sm">
      <CardContent className="p-6 md:p-8">
        <h3 className="text-sm font-medium text-brand-muted uppercase tracking-wider mb-6 flex items-center gap-2">
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
            <div className="flex items-center justify-center h-full text-brand-muted/50 font-medium">
              No category data
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
