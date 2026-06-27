"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  KanbanSquare,
  CheckSquare,
  Settings,
  LogOut,
  ChevronsUpDown,
  Plus
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Projects", href: "/dashboard/projects", icon: KanbanSquare },
  { name: "My Tasks", href: "/dashboard/tasks", icon: CheckSquare },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <Sidebar variant="inset" className="border-r border-slate-800 bg-slate-950/50 backdrop-blur-xl">
      <SidebarHeader className="p-4 border-b border-slate-800">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="data-[state=open]:bg-slate-800 data-[state=open]:text-white w-full hover:bg-slate-800 transition-colors">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg shrink-0">
                      P
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold text-white">Projectify Inc.</span>
                      <span className="truncate text-xs text-slate-400">Pro Plan</span>
                    </div>
                  </div>
                  <ChevronsUpDown className="ml-auto w-4 h-4 text-slate-400" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-56 bg-slate-900 border-slate-800 text-slate-200" align="start" sideOffset={4}>
                <DropdownMenuLabel className="text-xs text-slate-500 font-medium">Workspaces</DropdownMenuLabel>
                <DropdownMenuItem className="gap-2 p-2 hover:bg-slate-800 focus:bg-slate-800 focus:text-white cursor-pointer text-white">
                  <div className="flex w-6 h-6 items-center justify-center rounded-md border border-slate-700 bg-slate-800 font-medium">
                    P
                  </div>
                  Projectify Inc.
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 p-2 hover:bg-slate-800 focus:bg-slate-800 focus:text-white cursor-pointer text-slate-400">
                  <div className="flex w-6 h-6 items-center justify-center rounded-md border border-slate-700 bg-slate-800 font-medium">
                    A
                  </div>
                  Acme Corp
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-800 my-1" />
                <DropdownMenuItem className="gap-2 p-2 hover:bg-slate-800 focus:bg-slate-800 focus:text-white cursor-pointer text-slate-300">
                  <div className="flex w-6 h-6 items-center justify-center rounded-md bg-slate-800 border border-slate-700">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div className="font-medium">Add Workspace</div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-500">Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild isActive={isActive} className="text-slate-300 hover:text-white hover:bg-white/10 data-[active=true]:bg-blue-600/20 data-[active=true]:text-blue-400">
                      <Link href={item.href}>
                        <item.icon className="w-4 h-4 mr-2" />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-slate-800">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleLogout}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
