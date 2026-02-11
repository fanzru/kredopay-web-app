import {
  LayoutDashboard,
  ShieldCheck,
  History,
  Settings,
  Ghost,
  Send,
  Fingerprint,
  TrendingUp,
  CardSimIcon,
  HistoryIcon,
  Activity,
  Bot,
  Users,
} from "lucide-react";
import { TabName } from "../types";

export interface MenuItem {
  icon: any;
  label: string;
  id?: TabName;
  href?: string;
}

export const MENU_ITEMS: MenuItem[] = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    id: "overview",
    href: "/dashboard",
  },
  {
    icon: Fingerprint,
    label: "Identity",
    id: "identity",
    href: "/dashboard/identity",
  },
  {
    icon: Bot,
    label: "Agents",
    id: "agents",
    href: "/dashboard/agents",
  },
  {
    icon: TrendingUp,
    label: "Staking",
    id: "staking",
    href: "/dashboard/staking",
  },
  {
    icon: Users,
    label: "Community",
    id: "community",
    href: "/dashboard/community",
  },
  {
    icon: Send,
    label: "Intents",
    id: "intents",
    href: "/dashboard/intents",
  },
  {
    icon: ShieldCheck,
    label: "Permissions",
    id: "permissions",
    href: "/dashboard/permissions",
  },
  {
    icon: Ghost,
    label: "Fog",
    id: "fog",
    href: "/dashboard/fog",
  },
  {
    icon: Activity,
    label: "Security Terminal",
    id: "terminal",
    href: "/dashboard/terminal",
  },
  {
    icon: History,
    label: "History",
    id: "history",
    href: "/dashboard/history",
  },
  {
    icon: Settings,
    label: "Settings",
    id: "settings",
    href: "/dashboard/settings",
  },
  {
    icon: HistoryIcon,
    label: "Top-Ups",
    id: "topups",
    href: "/dashboard/topups",
  },
];
