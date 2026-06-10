"use client";

import { Link, useLocation } from "@/lib/router-shim";
import {
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardCheck,
  GraduationCap,
  TrendingUp,
  DollarSign,
  Settings,
  Activity,
  LogOut
} from "lucide-react";
import { useAuth } from "@/lib/auth-shim";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Funcionários", href: "/funcionarios", icon: Users },
  { label: "Cargos", href: "/cargos", icon: Settings },
  { label: "Escalas", href: "/escalas", icon: Calendar },
  { label: "Check-ins", href: "/checkins", icon: ClipboardCheck },
  { label: "Treinamentos", href: "/treinamentos", icon: GraduationCap },
  { label: "Indicadores", href: "/indicadores", icon: TrendingUp },
  { label: "BIQ", href: "/biq", icon: DollarSign },
  { label: "Auditoria", href: "/auditoria", icon: Activity },
  { label: "Administração", href: "/admin", icon: Settings },
];

export default function Sidebar() {
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
    window.location.href = "/login";
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <Activity className="w-6 h-6 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-sidebar-foreground tracking-tight">MEDSCALE</h1>
            <p className="text-xs text-sidebar-foreground/60">Gestão Hospitalar</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border space-y-2">
        <div className="flex items-center gap-3 px-3 py-2">
          {user?.google_user_data?.picture ? (
            <img
              src={user.google_user_data.picture}
              alt={user.google_user_data.name || "User"}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center">
              <span className="text-xs font-semibold text-sidebar-primary">
                {getInitials(user?.google_user_data?.name)}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.google_user_data?.name || "Usuário"}
            </p>
            <p className="text-xs text-sidebar-foreground/60 truncate">{user?.email}</p>
          </div>
        </div>
        <Button
          onClick={handleLogout}
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </Button>
      </div>
    </aside>
  );
}
