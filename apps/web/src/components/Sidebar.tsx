"use client";

import { Link, useLocation } from "@/lib/router-shim";
import {
  Activity,
  Calendar,
  ClipboardCheck,
  DollarSign,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  TrendingUp,
  Users,
} from "lucide-react";
import { useAuth } from "@/lib/auth-shim";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Funcionarios", href: "/funcionarios", icon: Users },
  { label: "Cargos", href: "/cargos", icon: Settings },
  { label: "Escalas", href: "/escalas", icon: Calendar },
  { label: "Check-ins", href: "/checkins", icon: ClipboardCheck },
  { label: "Treinamentos", href: "/treinamentos", icon: GraduationCap },
  { label: "Indicadores", href: "/indicadores", icon: TrendingUp },
  { label: "BIQ", href: "/biq", icon: DollarSign },
  { label: "Auditoria", href: "/auditoria", icon: Activity },
  { label: "Administracao", href: "/admin", icon: Settings },
];

export default function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuth();

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = "/account/signin";
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className={cn("border-b border-sidebar-border", collapsed ? "p-3" : "p-6")}>
        <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-3")}>
          <div
            className={cn(
              "flex shrink-0 items-center justify-center rounded-md bg-white shadow-sm ring-1 ring-sidebar-border",
              collapsed ? "h-10 w-10 p-1" : "h-14 w-full px-3",
            )}
          >
            <img
              src="/prontoescala-logo.png"
              alt="ProntoEscala"
              className={cn("object-contain", collapsed ? "h-8 w-8 object-left" : "h-12 w-full")}
            />
          </div>
          {!collapsed && (
            <p className="sr-only">ProntoEscala - Gestao de escalas e plantoes</p>
          )}
        </div>

      </div>

      <nav className={cn("flex-1 space-y-1 overflow-y-auto", collapsed ? "p-2" : "p-4")}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              to={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center rounded-lg py-2.5 text-sm font-medium transition-colors",
                collapsed ? "justify-center px-0" : "gap-3 px-3",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>

      <div className={cn("space-y-2 border-t border-sidebar-border", collapsed ? "p-2" : "p-4")}>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className={cn(
            "w-full text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
            collapsed ? "justify-center px-0" : "justify-start gap-2",
          )}
          title={collapsed ? "Abrir menu" : "Recolher menu"}
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          {!collapsed && "Recolher menu"}
        </Button>

        <div className={cn("flex items-center py-2", collapsed ? "justify-center px-0" : "gap-3 px-3")}>
          {user?.google_user_data?.picture ? (
            <img
              src={user.google_user_data.picture}
              alt={user.google_user_data.name || "User"}
              className="h-8 w-8 rounded-full"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-primary/20">
              <span className="text-xs font-semibold text-sidebar-primary">
                {getInitials(user?.google_user_data?.name)}
              </span>
            </div>
          )}
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-sidebar-foreground">
                {user?.google_user_data?.name || "Usuario"}
              </p>
              <p className="truncate text-xs text-sidebar-foreground/60">{user?.email}</p>
            </div>
          )}
        </div>
        <Button
          onClick={handleLogout}
          variant="ghost"
          size="sm"
          className={cn(
            "w-full text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
            collapsed ? "justify-center px-0" : "justify-start gap-2",
          )}
          title="Sair"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && "Sair"}
        </Button>
      </div>
    </aside>
  );
}
