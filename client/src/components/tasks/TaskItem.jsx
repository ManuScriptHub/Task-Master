
"use client";

import React, { useState, useEffect } from "react";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import { PriorityBadge } from "./PriorityBadge";
import { Edit3, Trash2, CalendarDays, Loader2 } from "lucide-react";
import { format, parseISO, isPast } from "date-fns";
import { cn } from "../../lib/utils";
import { TaskForm } from "./TaskForm";

export function TaskItem({ task, onUpdateTask, onDeleteTask, isUpdating }) {
  const [isEditing, setIsEditing] = useState(false);
  const [optimisticCompleted, setOptimisticCompleted] = useState(task.is_completed);

  useEffect(() => {
    setOptimisticCompleted(task.is_completed);
  }, [task.is_completed]);

  const handleToggleComplete = async () => {
    const newCompletedStatus = !optimisticCompleted;
    setOptimisticCompleted(newCompletedStatus); // Optimistic update
    try {
      // Create a new object with only the necessary fields to avoid date manipulation issues
      const updateData = {
        task_name: task.task_name,
        priority: task.priority || 'medium',
        // Preserve the exact original due_date without any manipulation
        due_date: task.due_date ? task.due_date.split('T')[0] : null,
        is_completed: newCompletedStatus
      };
      await onUpdateTask(task.id, updateData);
    } catch (error) {
      setOptimisticCompleted(!newCompletedStatus); // Revert on error
      // Toast notification for error can be handled in parent component
    }
  };
  
  const handleSaveEdit = async (data) => {
    await onUpdateTask(task.id, data);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <li className="p-0"> {/* Remove padding for inline form */}
        <TaskForm 
          task={task} 
          projectId={task.project_id} 
          onSave={handleSaveEdit} 
          onCancel={() => setIsEditing(false)}
          isInline={true}
        />
      </li>
    );
  }

  const isDueDatePast = task.due_date && isPast(parseISO(task.due_date)) && !optimisticCompleted;

  return (
    <li className="flex items-center justify-between gap-3 px-4 py-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors duration-150">
      <div className="flex items-center gap-3 flex-grow min-w-0">
        <Checkbox
          id={`task-${task.id}`}
          checked={optimisticCompleted}
          onCheckedChange={handleToggleComplete}
          aria-labelledby={`task-label-${task.id}`}
          disabled={isUpdating}
        />
        <div className="flex-grow min-w-0">
          <label
            id={`task-label-${task.id}`}
            className={cn(
              "font-medium cursor-pointer break-words",
              optimisticCompleted && "line-through text-muted-foreground"
            )}
            onClick={handleToggleComplete} // Allow clicking label to toggle
          >
            {task.task_name}
          </label>
          {task.due_date && (
            <div className={cn("text-xs flex items-center mt-0.5", 
                isDueDatePast ? "text-red-600" : "text-muted-foreground")}>
              <CalendarDays className="h-3 w-3 mr-1" />
              {format(parseISO(task.due_date), "MMM d, yyyy")}
              {isDueDatePast && <span className="ml-1 font-semibold">(Overdue)</span>}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <PriorityBadge priority={task.priority} />
        <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)} disabled={isUpdating} aria-label="Edit task">
          <Edit3 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDeleteTask(task.id)} disabled={isUpdating} aria-label="Delete task">
          {isUpdating && task.id === (isUpdating)?.taskId ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
        </Button>
      </div>
    </li>
  );
}
