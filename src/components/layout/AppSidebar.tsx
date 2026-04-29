import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, Star, Gift, CircleDot, UserCog,
  Cake, BarChart3, MessageCircle, Calendar, Image, Receipt, Lock
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const activeItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "All Leads / Inquiries", url: "/leads", icon: Users },
];

const disabledItems = [
  { title: "Reviews", icon: Star },
  { title: "Loyalty Program", icon: Gift },
  { title: "Wheel", icon: CircleDot },
  { title: "CRM", icon: UserCog },
  { title: "Birthday Template", icon: Cake },
  { title: "Google Analytics", icon: BarChart3 },
  { title: "WhatsApp Campaign", icon: MessageCircle },
  { title: "Calendar", icon: Calendar },
  { title: "Social Media", icon: Image },
  { title: "Invoice", icon: Receipt },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent className="bg-sidebar">
        {/* Logo */}
        <div className="px-5 py-4 border-b border-sidebar-border">
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
          <div className="px-3 pt-3">
            <div className="flex items-center gap-3 rounded-lg p-2.5 text-primary-foreground shadow-[var(--shadow-pop)]" style={{ background: "var(--gradient-primary)" }}>
              <div className="h-8 w-8 rounded-md bg-white/20 grid place-items-center text-xs font-bold">TR</div>
              <div className="text-sm font-semibold">Tulsi Restaurant</div>
            </div>
          </div>
        )}

        <SidebarGroup className="pt-2">
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {activeItems.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}
                      className={isActive
                        ? "!bg-primary !text-primary-foreground hover:!bg-primary/90 font-medium h-9"
                        : "hover:bg-sidebar-accent text-sidebar-foreground h-9"
                      }>
                      <NavLink to={item.url} className="flex items-center gap-3">
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span className="truncate text-sm">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}

              {/* Divider */}
              {!collapsed && (
                <div className="px-3 pt-4 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                  Coming Soon
                </div>
              )}

              {disabledItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    disabled
                    aria-disabled="true"
                    className={cn(
                      "h-9 cursor-not-allowed opacity-50 hover:!bg-transparent",
                      "text-muted-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="truncate text-sm flex-1">{item.title}</span>
                          <Lock className="h-3 w-3 shrink-0 opacity-60" />
                        </>
                      )}
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
