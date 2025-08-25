"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { KanbanBoard } from "@/components/kanban-board";
import { Project, Task, TaskStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Search, 
  Filter, 
  MoreHorizontal,
  Users,
  Plus,
  Calendar
} from "lucide-react";

// Mock data
const mockProjects: Project[] = [
  {
    id: "1",
    name: "Website Redesign",
    description: "Redesign company website",
    color: "#3B82F6",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    name: "Mobile App",
    description: "Build mobile application",
    color: "#10B981",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    name: "Marketing Campaign",
    description: "Q4 marketing campaign",
    color: "#F59E0B",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockTasks: Task[] = [
  {
    id: "1",
    title: "Design homepage mockup",
    description: "Create initial design concepts for the new homepage",
    status: "todo",
    projectId: "1",
    priority: "high",
    assignee: "JD",
    tags: ["design", "ui"],
    dueDate: new Date("2024-12-20"),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    title: "Implement authentication",
    description: "Set up user authentication system",
    status: "in-progress",
    projectId: "1",
    priority: "high",
    assignee: "AB",
    tags: ["backend", "security"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    title: "Write API documentation",
    description: "Document all API endpoints",
    status: "in-progress",
    projectId: "1",
    priority: "medium",
    assignee: "CD",
    tags: ["documentation"],
    dueDate: new Date("2024-12-15"),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "4",
    title: "Code review",
    description: "Review pull requests for feature branch",
    status: "review",
    projectId: "1",
    priority: "medium",
    assignee: "EF",
    tags: ["review"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "5",
    title: "Deploy to staging",
    description: "Deploy latest changes to staging environment",
    status: "done",
    projectId: "1",
    priority: "low",
    assignee: "GH",
    tags: ["deployment"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default function Home() {
  const [projects] = useState(mockProjects);
  const [tasks, setTasks] = useState(mockTasks);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("1");

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId);
  };

  const handleNewProject = () => {
    console.log("Create new project");
  };

  const handleTaskMove = (taskId: string, newStatus: TaskStatus) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  const handleNewTask = (status: TaskStatus) => {
    console.log("Create new task with status:", status);
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const projectTasks = tasks.filter(t => t.projectId === selectedProjectId);

  return (
    <div className="flex h-screen">
      <Sidebar
        projects={projects}
        selectedProjectId={selectedProjectId}
        onProjectSelect={handleProjectSelect}
        onNewProject={handleNewProject}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                {selectedProject?.name || "Dashboard"}
              </h1>
              {selectedProject?.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedProject.description}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {["JD", "AB", "CD", "EF"].map((initials) => (
                  <Avatar key={initials} className="h-8 w-8 border-2 border-white">
                    <AvatarFallback className="text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <Button size="sm" variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="border-b bg-white px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  className="w-64 pl-9"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Calendar className="mr-2 h-4 w-4" />
                Calendar
              </Button>
            </div>
            
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex-1 overflow-hidden bg-gray-50 p-6">
          {selectedProjectId === "dashboard" ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Welcome to ProjManager</h2>
                <p className="text-muted-foreground">Select a project to view its tasks</p>
              </div>
            </div>
          ) : (
            <KanbanBoard
              tasks={projectTasks}
              onTaskMove={handleTaskMove}
              onNewTask={handleNewTask}
            />
          )}
        </div>
      </div>
    </div>
  );
}