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
    icon: TrendingUp,
    label: "Staking",
    href: "/dashboard/staking",
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
