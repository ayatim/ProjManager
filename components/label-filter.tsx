"use client";

import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, X } from "lucide-react";

interface Label {
  id: string;
  name: string;
  color: string;
  _count?: {
    tasks: number;
  };
}

interface LabelFilterProps {
  selectedLabels: string[];
  onLabelsChange: (labels: string[]) => void;
}

export function LabelFilter({ selectedLabels, onLabelsChange }: LabelFilterProps) {
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLabels();
  }, []);

  const fetchLabels = async () => {
    try {
      const response = await fetch("/api/labels");
      if (response.ok) {
        const data = await response.json();
        setLabels(data);
      }
    } catch (error) {
      console.error("Failed to fetch labels:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLabel = (labelName: string) => {
    if (selectedLabels.includes(labelName)) {
      onLabelsChange(selectedLabels.filter((l) => l !== labelName));
    } else {
      onLabelsChange([...selectedLabels, labelName]);
    }
  };

  const clearFilters = () => {
    onLabelsChange([]);
  };

  const selectedLabelObjects = labels.filter((l) => 
    selectedLabels.includes(l.name)
  );

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            <Filter className="mr-2 h-4 w-4" />
            Labels
            {selectedLabels.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {selectedLabels.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Filter by Labels</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {loading ? (
            <div className="px-2 py-4 text-sm text-muted-foreground">
              Loading labels...
            </div>
          ) : labels.length === 0 ? (
            <div className="px-2 py-4 text-sm text-muted-foreground">
              No labels available
            </div>
          ) : (
            labels.map((label) => (
              <DropdownMenuCheckboxItem
                key={label.id}
                checked={selectedLabels.includes(label.name)}
                onCheckedChange={() => toggleLabel(label.name)}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: label.color }}
                  />
                  <span>{label.name}</span>
                  {label._count && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      {label._count.tasks}
                    </span>
                  )}
                </div>
              </DropdownMenuCheckboxItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {selectedLabelObjects.length > 0 && (
        <>
          <div className="flex flex-wrap gap-1">
            {selectedLabelObjects.map((label) => (
              <Badge
                key={label.id}
                variant="secondary"
                className="text-xs"
                style={{
                  backgroundColor: `${label.color}20`,
                  borderColor: label.color,
                  color: label.color,
                }}
              >
                {label.name}
                <button
                  className="ml-1 hover:opacity-70"
                  onClick={() => toggleLabel(label.name)}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={clearFilters}
          >
            Clear all
          </Button>
        </>
      )}
    </div>
  );
}