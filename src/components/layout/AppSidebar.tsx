import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Users } from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";
import { useAuth, Role } from "@/context/AuthContext";

interface NavItem {
  title: string;
  url: string;
  icon: typeof Users;
  roles: Role[];
}

const NAV_ITEMS: NavItem[] = [
  { title: "Business Overview", url: "/", icon: LayoutDashboard, roles: ["super_admin"] },
  { title: "All Leads / Inquiries", url: "/leads", icon: Users, roles: ["super_admin", "sales_executive"] },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();
  const { user } = useAuth();

  const items = NAV_ITEMS.filter((i) => !user || i.roles.includes(user.role));

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent className="bg-sidebar">
        {/* Logo */}
        <div className="px-5 py-4 border-b border-sidebar-border">
          {!collapsed ? (
            <div>
              <div className="flex items-baseline">
                <span className="text-2xl font-bold tracking-tight text-foreground">Grow</span>
                <span className="text-2xl font-bold tracking-tight text-primary">via</span>
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mt-0.5">
                Sales CRM
              </div>
            </div>
          ) : (
            <div className="text-2xl font-bold text-primary text-center">G</div>
          )}
        </div>

        {/* Workspace pill */}
        {!collapsed && (
          <div className="px-3 pt-3">
            <div
              className="flex items-center gap-3 rounded-lg p-2.5 text-primary-foreground shadow-[var(--shadow-pop)]"
              style={{ background: "var(--gradient-primary)" }}
            >
              <div className="h-8 w-8 rounded-md bg-white/20 grid place-items-center text-xs font-bold">SW</div>
              <div className="text-sm font-semibold">Sales Workspace</div>
            </div>
          </div>
        )}

        <SidebarGroup className="pt-2">
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {items.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={
                        isActive
                          ? "!bg-primary !text-primary-foreground hover:!bg-primary/90 font-medium h-11 md:h-9"
                          : "hover:bg-sidebar-accent text-sidebar-foreground h-11 md:h-9"
                      }
                    >
                      <NavLink to={item.url} className="flex items-center gap-3">
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span className="truncate text-sm">{item.title}</span>}
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
