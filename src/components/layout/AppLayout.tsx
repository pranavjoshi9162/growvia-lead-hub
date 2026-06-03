import { Outlet, useNavigate } from "react-router-dom";
import { Bell, LogOut } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AppLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate("/signin", { replace: true });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-secondary/40">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b border-border bg-background px-3 sm:px-4 sticky top-0 z-30">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="h-9 w-9" />
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                className="relative rounded-md p-2 hover:bg-secondary transition min-h-[44px] min-w-[44px] grid place-items-center"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-md px-1.5 py-1 hover:bg-secondary transition">
                    <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground grid place-items-center text-sm font-semibold">
                      {user?.initials ?? "?"}
                    </div>
                    <span className="text-sm font-medium hidden sm:inline">{user?.name ?? "User"}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-popover">
                  <DropdownMenuLabel>
                    <div className="font-medium text-foreground">{user?.name}</div>
                    <div className="text-xs text-muted-foreground font-normal">{user?.email}</div>
                    <div className="mt-1 inline-block text-[10px] font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                      {user?.role === "super_admin" ? "Super Admin" : "Sales Executive"}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                    <LogOut className="h-4 w-4 mr-2" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 overflow-x-hidden">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
