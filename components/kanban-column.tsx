"use client";

import { useDroppable } from "@dnd-kit/core";
import { Column } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  column: Column;
  color: string;
  onNewTask: () => void;
  children: React.ReactNode;
}

export function KanbanColumn({ column, color, onNewTask, children }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex h-full w-80 flex-col rounded-lg border bg-white transition-colors",
        isOver && "border-primary bg-primary/5"
      )}
    >
      <div className={cn("rounded-t-lg p-4", color)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">{column.title}</h3>
            <Badge variant="secondary" className="text-xs">
              {column.tasks.length}
            </Badge>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        {children}
      </ScrollArea>

      <div className="border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={onNewTask}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>
    </div>
  );
}