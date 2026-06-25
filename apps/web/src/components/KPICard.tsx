"use client";

import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "slate";
}

export default function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  variant = "default"
}: KPICardProps) {
  const variantStyles = {
    default: "bg-primary/10 text-primary",
    success: "bg-green-500/10 text-green-600 dark:text-green-400",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    danger: "bg-red-500/10 text-red-600 dark:text-red-400",
    info: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    slate: "bg-slate-500/10 text-slate-600 dark:text-slate-300"
  };

  const accentStyles = {
    default: "from-primary to-slate-500",
    success: "from-emerald-500 to-teal-500",
    warning: "from-amber-500 to-orange-500",
    danger: "from-red-500 to-rose-500",
    info: "from-sky-500 to-cyan-500",
    slate: "from-slate-500 to-zinc-500"
  };

  return (
    <Card className="group relative overflow-hidden border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-card">
      <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", accentStyles[variant])} />
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
          {trend && trendValue && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={cn(
                  "text-xs font-medium",
                  trend === "up" && "text-green-600 dark:text-green-400",
                  trend === "down" && "text-red-600 dark:text-red-400",
                  trend === "neutral" && "text-muted-foreground"
                )}
              >
                {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trendValue}
              </span>
              <span className="text-xs text-muted-foreground">vs. anterior</span>
            </div>
          )}
        </div>
        <div className={cn("rounded-xl p-3 transition-transform group-hover:scale-105", variantStyles[variant])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );
}
