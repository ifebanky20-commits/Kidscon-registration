import { CheckCircle2, FileSpreadsheet, FileText, Loader2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/Card";

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
    primary: "bg-brand-tint text-brand-primary",
    secondary: "bg-brand-tint text-brand-primary",
    tertiary: "bg-md-tertiary/10 text-md-tertiary",
  };

  const FormatIcon = format === "docx" ? FileText : FileSpreadsheet;

  return (
    <Card className="rounded-2xl border border-brand-line bg-brand-surface shadow-none hover:shadow-none transition-shadow duration-300">
      <CardContent className="p-7 flex flex-col gap-5">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorMap[color] || colorMap.primary}`}
        >
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-medium text-brand-ink">{title}</h3>
          <p className="text-sm text-brand-muted font-medium mt-0.5">
            {description}
          </p>
        </div>
        <button
          onClick={onExport}
          disabled={loading || disabled}
          className={`flex items-center justify-center gap-2 w-full h-11 rounded-xl font-semibold text-sm transition-all ${
            done
              ? "bg-brand-tint text-brand-primary"
              : disabled
                ? "bg-brand-wash text-brand-muted/40 cursor-not-allowed"
                : "bg-brand-tint text-brand-primary hover:bg-md-primary hover:text-md-on-primary active:scale-95"
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
