"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: ReactNode;
  defaultCollapsed?: boolean;
}

export default function AppShell({ children, defaultCollapsed = false }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
      <main className={cn("min-h-screen flex-1 transition-[padding] duration-200", collapsed ? "pl-16" : "pl-64")}>
        {children}
      </main>
    </div>
  );
}
