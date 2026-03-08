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
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";

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
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Trending Topics", url: "/trending", icon: TrendingUp },
  { title: "AI Drafts", url: "/drafts", icon: FileEdit },
  { title: "Published", url: "/published", icon: Send },
];

const manageNav = [
  { title: "Sources", url: "/sources", icon: Database },
  { title: "Activity Log", url: "/activity-log", icon: Shield },
  { title: "Notifications", url: "/notifications", icon: Bell, badge: 3 },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

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
                Synthetic
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
                          {item.badge && (
                            <Badge variant="default" className="h-5 min-w-5 text-[10px] px-1.5">
                              {item.badge}
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

      <SidebarFooter className="p-4">
        {!collapsed && (
          <NavLink
            to="/profile"
            className="flex items-center gap-3 rounded p-1 -m-1 hover:bg-accent transition-colors"
            activeClassName="bg-accent"
          >
            <div className="h-8 w-8 rounded-full bg-foreground flex items-center justify-center text-xs font-bold text-background">
              JR
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground font-body">Jane Reporter</p>
              <p className="text-[10px] text-muted-foreground font-body">Senior Correspondent</p>
            </div>
          </NavLink>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
