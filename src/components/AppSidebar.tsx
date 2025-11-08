import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Target,
  TrendingUp,
  BarChart3,
  LogOut,
  User,
} from 'lucide-react';

const navigationItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Portfolio Advisor',
    url: '/portfolio',
    icon: Target,
  },
  {
    title: 'Market Data',
    url: '/market',
    icon: BarChart3,
  },
];

export function AppSidebar() {
  const { state: sidebarState } = useSidebar();
  const location = useLocation();
  const { logout, state } = useAuth();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  const getNavClassName = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? 'bg-sidebar-accent text-sidebar-primary font-medium border-r-2 border-sidebar-primary' 
      : 'hover:bg-sidebar-accent/50 text-sidebar-foreground hover:text-sidebar-primary transition-colors';

  const isCollapsed = sidebarState === 'collapsed';

  return (
    <Sidebar className={isCollapsed ? 'w-16' : 'w-64'} collapsible="icon">
      <SidebarContent className="border-r border-sidebar-border">
        {/* Brand */}
        <div className="flex items-center space-x-2 p-4 border-b border-sidebar-border">
          <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-lg">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          {!isCollapsed && (
            <h2 className="text-lg font-bold text-sidebar-primary">InvestIQ</h2>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60">
            {!isCollapsed && 'Navigation'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavClassName}
                    >
                      <div className="flex items-center space-x-2">
                        <item.icon className="h-4 w-4" />
                        {!isCollapsed && <span>{item.title}</span>}
                      </div>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Section */}
        <div className="mt-auto border-t border-sidebar-border p-4 space-y-2">
          {!isCollapsed && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-sidebar-foreground">
                <User className="h-4 w-4" />
                <span className="truncate">{state.user?.email}</span>
              </div>
              {state.user?.isDemo && (
                <Badge variant="secondary" className="text-xs">
                  Demo Mode
                </Badge>
              )}
            </div>
          )}
          <Button
            variant="ghost"
            size={isCollapsed ? 'icon' : 'sm'}
            onClick={logout}
            className="w-full justify-start text-sidebar-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            {!isCollapsed && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}