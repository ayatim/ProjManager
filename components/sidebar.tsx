"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  FolderKanban,
  Plus,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Project } from "@/types";

interface SidebarProps {
  projects: Project[];
  selectedProjectId: string | null;
  onProjectSelect: (projectId: string) => void;
  onNewProject: () => void;
}

export function Sidebar({
  projects,
  selectedProjectId,
  onProjectSelect,
  onNewProject,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={cn(
        "relative flex h-screen flex-col border-r bg-gray-50/50 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <FolderKanban className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">ProjManager</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2 py-4">
        <div className="space-y-2">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start",
              collapsed && "justify-center"
            )}
            onClick={() => onProjectSelect("dashboard")}
          >
            <LayoutDashboard className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Dashboard</span>}
          </Button>

          {!collapsed && (
            <div className="px-2 py-2">
              <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                Projects
              </h3>
            </div>
          )}

          {projects.map((project) => (
            <Button
              key={project.id}
              variant={selectedProjectId === project.id ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                collapsed && "justify-center"
              )}
              onClick={() => onProjectSelect(project.id)}
            >
              <div
                className="h-4 w-4 rounded"
                style={{ backgroundColor: project.color }}
              />
              {!collapsed && (
                <span className="ml-2 truncate">{project.name}</span>
              )}
            </Button>
          ))}

          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-muted-foreground hover:text-foreground",
              collapsed && "justify-center"
            )}
            onClick={onNewProject}
          >
            <Plus className="h-4 w-4" />
            {!collapsed && <span className="ml-2">New Project</span>}
          </Button>
        </div>
      </ScrollArea>

      <Separator />
      
      <div className="p-2">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start",
            collapsed && "justify-center"
          )}
        >
          <Settings className="h-4 w-4" />
          {!collapsed && <span className="ml-2">Settings</span>}
        </Button>
      </div>
    </div>
  );
}