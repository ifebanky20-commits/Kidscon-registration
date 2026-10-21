import { CheckCircle2, FileSpreadsheet, FileText, Loader2 } from "lucide-react";

import { Card, CardContent } from "@/shared/components/ui/Card";

interface ExportCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: "primary" | "secondary" | "tertiary";
  loading: boolean;
  done: boolean;
  onExport: () => void;
  disabled: boolean;
  format?: string;
}

export function ExportCard({
  icon,
  title,
  description,
  color,
  loading,
  done,
  onExport,
  disabled,
  format = "xlsx",
}: ExportCardProps) {
  const colorMap = {
    primary: "bg-md-primary/10 text-md-primary",
    secondary: "bg-md-secondary-container text-md-on-secondary-container",
    tertiary: "bg-md-tertiary/10 text-md-tertiary",
  };

  const FormatIcon = format === "docx" ? FileText : FileSpreadsheet;

  return (
    <Card className="rounded-[28px] border border-md-outline/5 bg-md-surface-container-low shadow-none hover:shadow-md transition-shadow duration-300">
      <CardContent className="p-7 flex flex-col gap-5">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorMap[color] || colorMap.primary}`}
        >
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-bold text-md-on-background">{title}</h3>
          <p className="text-sm text-md-on-surface-variant font-medium mt-0.5">
            {description}
          </p>
        </div>
        <button
          onClick={onExport}
          disabled={loading || disabled}
          className={`flex items-center justify-center gap-2 w-full h-11 rounded-full font-semibold text-sm transition-all ${
            done
              ? "bg-green-100 text-green-700"
              : disabled
                ? "bg-md-surface-container text-md-on-surface-variant/40 cursor-not-allowed"
                : "bg-md-secondary-container text-md-on-secondary-container hover:bg-md-primary hover:text-md-on-primary active:scale-95"
          }`}
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : done ? (
            <CheckCircle2 size={16} />
          ) : (
            <FormatIcon size={16} />
          )}
          {loading
            ? "Preparing…"
            : done
              ? "Downloaded!"
              : `Download ${format.toUpperCase()}`}
        </button>
      </CardContent>
    </Card>
  );
}
