import { Link } from "react-router-dom";
import { Building2, ListChecks } from "lucide-react";

export const SectionSwitcher = ({
  current,
}: {
  current: "questions" | "client";
}) => (
  <div className="inline-flex items-center gap-1 rounded-xl border border-border bg-secondary/40 p-1">
    <Link
      to="/admin/system-behavior"
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
        current === "questions"
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <ListChecks className="h-3.5 w-3.5" />
      Chat questions
    </Link>
    <Link
      to="/admin/client-fields"
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
        current === "client"
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <Building2 className="h-3.5 w-3.5" />
      Client questions
    </Link>
  </div>
);
