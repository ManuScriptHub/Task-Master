
"use client";

import React, { useState, useMemo } from "react";
import { TaskItem } from "./TaskItem";
import { TaskForm } from "./TaskForm";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, X, Inbox, Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const priorityOrder = { high: 0, medium: 1, low: 2 };

export function TaskList({
  tasks,
  projectId,
  isLoading,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  isTaskUpdating,
  updatingTaskId
}) {
  const [showCompleted, setShowCompleted] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("due_date");
  const [sortOrder, setSortOrder] = useState("asc");
  const [priorityFilter, setPriorityFilter] = useState("all");
  
  const [isAddingTask, setIsAddingTask] = useState(false);


  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      const matchesSearch = task.task_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCompleted = showCompleted ? true : !task.is_completed;
      const matchesPriority = priorityFilter === "all" ? true : task.priority === priorityFilter;
      return matchesSearch && matchesCompleted && matchesPriority;
    });

    return filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "priority") {
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
      } else if (sortBy === "due_date") {
        const dateA = a.due_date ? new Date(a.due_date).getTime() : Infinity;
        const dateB = b.due_date ? new Date(b.due_date).getTime() : Infinity;
        comparison = dateA - dateB;
      } else if (sortBy === "task_name") {
        comparison = a.task_name.localeCompare(b.task_name);
      } else if (sortBy === "is_completed") {
        comparison = (a.is_completed ? 1 : 0) - (b.is_completed ? 1 : 0);
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [tasks, searchTerm, showCompleted, sortBy, sortOrder, priorityFilter]);

  const handleCreateTask = async (data) => {
    await onCreateTask(data);
    // setIsAddingTask(false); // Keep inline form open for quick adds if needed, or close
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-3 px-4 py-3 border rounded-lg bg-card animate-pulse">
            <div className="flex items-center gap-3 flex-grow">
              <div className="h-5 w-5 bg-muted rounded-sm"></div>
              <div className="h-5 bg-muted rounded w-3/4"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-5 w-20 bg-muted rounded-full"></div>
              <div className="h-8 w-8 bg-muted rounded-md"></div>
              <div className="h-8 w-8 bg-muted rounded-md"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-card border rounded-lg p-4 space-y-4 shadow">
        <h3 className="text-lg font-semibold">Add New Task</h3>
         <TaskForm
            projectId={projectId}
            onSave={handleCreateTask}
            onCancel={() => {}} // Inline form doesn't need explicit cancel from here
            isInline={true}
          />
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 border rounded-lg bg-card shadow">
        <div className="relative w-full md:w-auto md:flex-grow max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            className="pl-10 h-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <Button variant="ghost" size="icon" className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8" onClick={() => setSearchTerm("")}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex gap-2 flex-wrap justify-center md:justify-end">
            <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
                <SelectTrigger className="h-9 w-full md:w-[130px] text-xs">
                    <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="due_date">Due Date</SelectItem>
                    <SelectItem value="priority">Priority</SelectItem>
                    <SelectItem value="task_name">Name</SelectItem>
                    <SelectItem value="is_completed">Status</SelectItem>
                </SelectContent>
            </Select>
            <Select value={sortOrder} onValueChange={(value) => setSortOrder(value)}>
                <SelectTrigger className="h-9 w-full md:w-[100px] text-xs">
                    <SelectValue placeholder="Order" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
            </Select>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-9 text-xs w-full md:w-auto">
                        <Filter className="mr-2 h-4 w-4" /> Filter
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Display Options</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem
                        checked={showCompleted}
                        onCheckedChange={setShowCompleted}
                    >
                        Show Completed Tasks
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
                    <DropdownMenuCheckboxItem
                        checked={priorityFilter === "all"}
                        onCheckedChange={() => setPriorityFilter("all")}
                    >
                        All Priorities
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                        checked={priorityFilter === "high"}
                        onCheckedChange={() => setPriorityFilter(priorityFilter === "high" ? "all" : "high")}
                    >
                        High
                    </DropdownMenuCheckboxItem>
                     <DropdownMenuCheckboxItem
                        checked={priorityFilter === "medium"}
                        onCheckedChange={() => setPriorityFilter(priorityFilter === "medium" ? "all" : "medium")}
                    >
                        Medium
                    </DropdownMenuCheckboxItem>
                     <DropdownMenuCheckboxItem
                        checked={priorityFilter === "low"}
                        onCheckedChange={() => setPriorityFilter(priorityFilter === "low" ? "all" : "low")}
                    >
                        Low
                    </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>
      
      {filteredAndSortedTasks.length > 0 ? (
        <ul className="space-y-3">
          {filteredAndSortedTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onUpdateTask={onUpdateTask}
              onDeleteTask={onDeleteTask}
              isUpdating={isTaskUpdating && updatingTaskId === task.id}
            />
          ))}
        </ul>
      ) : (
        <div className="text-center py-10 border-2 border-dashed rounded-lg">
           <Inbox className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            {tasks.length === 0 ? "No tasks in this project yet. Add one above!" : "No tasks match your current filters."}
          </p>
        </div>
      )}
    </div>
  );
}
