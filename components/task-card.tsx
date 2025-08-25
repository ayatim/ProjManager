"use client";

import { Task } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, MessageSquare, Paperclip } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
}

export function TaskCard({ task, isDragging }: TaskCardProps) {
  const priorityColors = {
    low: "bg-blue-100 text-blue-700",
    medium: "bg-yellow-100 text-yellow-700",
    high: "bg-red-100 text-red-700",
  };

  return (
    <Card
      className={cn(
        "cursor-grab p-4 transition-all hover:shadow-md",
        isDragging && "opacity-50 rotate-3 scale-105"
      )}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="font-medium text-sm line-clamp-2">{task.title}</h3>
          <Badge
            variant="secondary"
            className={cn("text-xs", priorityColors[task.priority])}
          >
            {task.priority}
          </Badge>
        </div>

        {task.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}

        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {task.dueDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{format(task.dueDate, "MMM d")}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              <span>3</span>
            </div>
            <div className="flex items-center gap-1">
              <Paperclip className="h-3 w-3" />
              <span>2</span>
            </div>
          </div>

          {task.assignee && (
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">
                {task.assignee.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    </Card>
  );
}