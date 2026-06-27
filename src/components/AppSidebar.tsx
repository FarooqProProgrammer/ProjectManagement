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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useState } from "react";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Projects", href: "/dashboard/projects", icon: KanbanSquare },
  { name: "My Tasks", href: "/dashboard/tasks", icon: CheckSquare },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { workspaces, activeWorkspace, setActiveWorkspace, addWorkspace, loading } = useWorkspace();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;
    
    setIsCreating(true);
    try {
      await addWorkspace(newWorkspaceName);
      setNewWorkspaceName("");
      setIsDialogOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Sidebar variant="inset" className="border-r border-slate-800 bg-slate-950/50 backdrop-blur-xl">
      <SidebarHeader className="p-4 border-b border-slate-800">
        <SidebarMenu>
          <SidebarMenuItem>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton size="lg" className="data-[state=open]:bg-slate-800 data-[state=open]:text-white w-full hover:bg-slate-800 transition-colors">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg shrink-0">
                        {activeWorkspace ? activeWorkspace.name.charAt(0).toUpperCase() : 'P'}
                      </div>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold text-white">
                          {loading ? "Loading..." : activeWorkspace ? activeWorkspace.name : "No Workspace"}
                        </span>
                        <span className="truncate text-xs text-slate-400">Pro Plan</span>
                      </div>
                    </div>
                    <ChevronsUpDown className="ml-auto w-4 h-4 text-slate-400" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-56 bg-slate-900 border-slate-800 text-slate-200" align="start" sideOffset={4}>
                  <DropdownMenuLabel className="text-xs text-slate-500 font-medium">Workspaces</DropdownMenuLabel>
                  
                  {workspaces.map((ws) => (
                    <DropdownMenuItem 
                      key={ws.id} 
                      onClick={() => setActiveWorkspace(ws)}
                      className="gap-2 p-2 hover:bg-slate-800 focus:bg-slate-800 focus:text-white cursor-pointer text-white"
                    >
                      <div className="flex w-6 h-6 items-center justify-center rounded-md border border-slate-700 bg-slate-800 font-medium">
                        {ws.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="flex-1 truncate">{ws.name}</span>
                    </DropdownMenuItem>
                  ))}

                  <DropdownMenuSeparator className="bg-slate-800 my-1" />
                  <DialogTrigger asChild>
                    <DropdownMenuItem className="gap-2 p-2 hover:bg-slate-800 focus:bg-slate-800 focus:text-white cursor-pointer text-slate-300">
                      <div className="flex w-6 h-6 items-center justify-center rounded-md bg-slate-800 border border-slate-700">
                        <Plus className="w-4 h-4" />
                      </div>
                      <div className="font-medium">Add Workspace</div>
                    </DropdownMenuItem>
                  </DialogTrigger>
                </DropdownMenuContent>
              </DropdownMenu>

              <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create new workspace</DialogTitle>
                  <DialogDescription className="text-slate-400">
                    Add a new workspace to organize your projects and team members.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateWorkspace}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="name" className="text-right text-sm font-medium text-slate-300">
                        Name
                      </label>
                      <input
                        id="name"
                        value={newWorkspaceName}
                        onChange={(e) => setNewWorkspaceName(e.target.value)}
                        placeholder="e.g. Acme Corp"
                        className="col-span-3 flex h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <button
                      type="button"
                      onClick={() => setIsDialogOpen(false)}
                      className="px-4 py-2 bg-transparent text-slate-300 hover:text-white font-medium rounded-lg transition-colors mr-2"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isCreating}
                      className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50"
                    >
                      {isCreating ? "Creating..." : "Create"}
                    </button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
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
