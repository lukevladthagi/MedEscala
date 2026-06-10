"use client";

import type { ComponentType } from "react";
import nextDynamic from "next/dynamic";
import AppShell from "@/components/AppShell";


type RouteComponentProps = Record<string, unknown>;
type RouteComponent = ComponentType<RouteComponentProps>;

const Dashboard = nextDynamic<RouteComponentProps>(
  () =>
    import("@/views/Dashboard").then(
      (mod) => mod.default as unknown as RouteComponent
    ),
  {
    ssr: false,
  }
);

export default function ClientPage() {
  return (
    <AppShell>
      <Dashboard />
    </AppShell>
  );
}
