import {
  LayoutDashboard,
  TrendingUp,
  Database,
  FileEdit,
  Bell,
  Settings,
  Send,
  Newspaper,
  Shield,
  LogOut,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUnreadCount } from "@/hooks/use-notifications";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

const mainNav = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Trending Topics", url: "/trending", icon: TrendingUp },
  { title: "AI Drafts", url: "/drafts", icon: FileEdit },
  { title: "Published", url: "/published", icon: Send },
];

const manageNav = [
  { title: "Sources", url: "/sources", icon: Database },
  { title: "Activity Log", url: "/activity-log", icon: Shield },
  { title: "Notifications", url: "/notifications", icon: Bell, badge: true },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const { data: unreadCount } = useUnreadCount();
  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const initials = profile?.display_name
    ? profile.display_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : profile?.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "??";

  const displayName = profile?.display_name || profile?.full_name || "User";
  const displayTitle = profile?.title || "Reporter";

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-foreground">
            <Newspaper className="h-4 w-4 text-background" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-sm font-serif font-bold text-foreground tracking-tight">
                News2Flow AI
              </h1>
              <p className="text-[10px] font-body text-muted-foreground uppercase tracking-[0.15em]">
                Content Manager
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-body font-semibold">
            Newsroom
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="hover:bg-accent font-body"
                      activeClassName="bg-accent text-foreground font-semibold"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-body font-semibold">
            Manage
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {manageNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink
                      to={item.url}
                      className="hover:bg-accent font-body"
                      activeClassName="bg-accent text-foreground font-semibold"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && (
                        <span className="flex items-center justify-between w-full">
                          {item.title}
                          {item.badge && (unreadCount ?? 0) > 0 && (
                            <Badge variant="default" className="h-5 min-w-5 text-[10px] px-1.5">
                              {unreadCount}
                            </Badge>
                          )}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 space-y-2">
        {!collapsed && (
          <>
            <NavLink to="/profile" className="flex items-center gap-3 rounded-md p-1 hover:bg-accent transition-colors" activeClassName="bg-accent">
              <div className="h-8 w-8 rounded-full bg-foreground flex items-center justify-center text-xs font-bold text-background">
                {initials}
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground font-body">{displayName}</p>
                <p className="text-[10px] text-muted-foreground font-body">{displayTitle}</p>
              </div>
            </NavLink>
            <Button variant="ghost" size="sm" className="w-full justify-start text-xs text-muted-foreground font-body" onClick={handleSignOut}>
              <LogOut className="mr-2 h-3 w-3" /> Sign Out
            </Button>
          </>
        )}
        {collapsed && (
          <div className="space-y-2">
            <NavLink to="/profile" className="flex justify-center" activeClassName="">
              <div className="h-8 w-8 rounded-full bg-foreground flex items-center justify-center text-xs font-bold text-background">
                {initials}
              </div>
            </NavLink>
            <Button variant="ghost" size="icon" className="w-full" onClick={handleSignOut}>
              <LogOut className="h-3 w-3" />
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
