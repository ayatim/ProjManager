"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { KanbanBoard } from "@/components/kanban-board";
import { ProjectModal } from "@/components/project-modal";
import { LabelFilter } from "@/components/label-filter";
import { Project, Task, TaskStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Search, 
  MoreHorizontal,
  Users,
  Plus,
  Calendar,
  RefreshCw
} from "lucide-react";

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId && selectedProjectId !== "dashboard") {
      fetchTasks();
    }
  }, [selectedProjectId, selectedLabels]);

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects");
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
        
        // Select first project if none selected
        if (!selectedProjectId && data.length > 0) {
          setSelectedProjectId(data[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    if (!selectedProjectId || selectedProjectId === "dashboard") return;
    
    setRefreshing(true);
    try {
      let url = `/api/tasks?projectId=${selectedProjectId}`;
      
      // Add label filter if any labels are selected
      if (selectedLabels.length > 0) {
        // For simplicity, we'll filter by the first label
        // You could enhance this to support multiple labels
        url += `&label=${encodeURIComponent(selectedLabels[0])}`;
      }
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId);
    setSelectedLabels([]); // Clear filters when switching projects
  };

  const handleNewProject = () => {
    setProjectModalOpen(true);
  };

  const handleProjectCreated = () => {
    fetchProjects();
  };

  const handleTaskMove = async (taskId: string, newStatus: TaskStatus) => {
    // Optimistically update UI
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));

    try {
      const response = await fetch(`/api/tasks/${taskId}/move`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        // Revert on error
        fetchTasks();
      }
    } catch (error) {
      console.error("Failed to move task:", error);
      // Revert on error
      fetchTasks();
    }
  };

  const handleNewTask = async (status: TaskStatus) => {
    if (!selectedProjectId || selectedProjectId === "dashboard") return;
    
    // For now, create a simple task
    // You could open a modal here for more detailed task creation
    const title = prompt("Enter task title:");
    if (!title) return;

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          projectId: selectedProjectId,
          status,
        }),
      });

      if (response.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);
  
  // Filter tasks by search query
  const filteredTasks = tasks.filter(task => {
    if (!searchQuery) return true;
    return task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           task.description?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading projects...</p>
        </div>
      </div>
    );
  }

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
              <Button 
                size="sm"
                onClick={() => handleNewTask("todo")}
                disabled={selectedProjectId === "dashboard"}
              >
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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <LabelFilter
                selectedLabels={selectedLabels}
                onLabelsChange={setSelectedLabels}
              />
              <Button variant="outline" size="sm">
                <Calendar className="mr-2 h-4 w-4" />
                Calendar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchTasks}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              </Button>
            </div>
            
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex-1 overflow-hidden bg-gray-50 p-6">
          {selectedProjectId === "dashboard" || !selectedProjectId ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Welcome to ProjManager</h2>
                <p className="text-muted-foreground mb-4">
                  {projects.length === 0 
                    ? "Create your first project to get started"
                    : "Select a project to view its tasks"}
                </p>
                {projects.length === 0 && (
                  <Button onClick={handleNewProject}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Project
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <KanbanBoard
              tasks={filteredTasks}
              onTaskMove={handleTaskMove}
              onNewTask={handleNewTask}
            />
          )}
        </div>
      </div>

      <ProjectModal
        open={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
}