import { NavLink, useLocation } from "react-router-dom";
import {
  Home, LayoutDashboard, Star, Gift, CircleDot, Users, TrendingUp,
  Cake, BarChart3, MessageCircle, Calendar, Image, Receipt
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Home", url: "/home", icon: Home },
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Reviews", url: "/reviews", icon: Star },
  { title: "Loyalty Program", url: "/loyalty", icon: Gift },
  { title: "Wheel", url: "/wheel", icon: CircleDot },
  { title: "CRM", url: "/crm", icon: Users },
  { title: "Lead Summary", url: "/", icon: TrendingUp },
  { title: "All Leads / Inquiries", url: "/leads", icon: Users },
  { title: "Birthday Template", url: "/birthday", icon: Cake },
  { title: "Google Analytics", url: "/analytics", icon: BarChart3 },
  { title: "WhatsApp Campaign", url: "/whatsapp", icon: MessageCircle },
  { title: "Calendar", url: "/calendar", icon: Calendar },
  { title: "Social Media", url: "/social", icon: Image },
  { title: "Invoice", url: "/invoice", icon: Receipt },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent className="bg-sidebar">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-sidebar-border">
          {!collapsed ? (
            <div className="flex items-baseline">
              <span className="text-2xl font-bold tracking-tight text-foreground">Grow</span>
              <span className="text-2xl font-bold tracking-tight text-primary">via</span>
            </div>
          ) : (
            <div className="text-2xl font-bold text-primary text-center">G</div>
          )}
        </div>

        {/* Workspace pill */}
        {!collapsed && (
          <div className="px-3 pt-4">
            <div className="flex items-center gap-3 rounded-lg p-3 text-primary-foreground shadow-[var(--shadow-pop)]" style={{ background: "var(--gradient-primary)" }}>
              <div className="h-9 w-9 rounded-md bg-white/20 grid place-items-center text-sm font-bold">TR</div>
              <div className="text-sm font-semibold">Tulsi Restaurant</div>
            </div>
          </div>
        )}

        <SidebarGroup className="pt-3">
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}
                      className={isActive
                        ? "!bg-primary !text-primary-foreground hover:!bg-primary/90 font-medium"
                        : "hover:bg-sidebar-accent text-sidebar-foreground"
                      }>
                      <NavLink to={item.url} className="flex items-center gap-3">
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span className="truncate">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
