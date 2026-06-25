"use client";

import type { ComponentType } from "react";
import nextDynamic from "next/dynamic";
import AppShell from "@/components/AppShell";


type RouteComponentProps = Record<string, unknown>;
type RouteComponent = ComponentType<RouteComponentProps>;

const TabletCheckin = nextDynamic<RouteComponentProps>(
  () =>
    import("@/views/TabletCheckin").then(
      (mod) => mod.default as unknown as RouteComponent
    ),
  {
    ssr: false,
  }
);

export default function ClientPage() {
  return (
    <AppShell defaultCollapsed>
      <TabletCheckin />
    </AppShell>
  );
}
