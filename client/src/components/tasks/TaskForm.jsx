
"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TaskSchema } from "../../lib/zodSchemas";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { useToast } from "../../hooks/use-toast";
import { Loader2, CalendarIcon } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "../../lib/utils";

export function TaskForm({ task, projectId, onSave, onCancel, isInline = false }) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = React.useState(false);

  const form = useForm({
    resolver: zodResolver(TaskSchema),
    defaultValues: {
      task_name: task?.task_name || "",
      priority: task?.priority || "medium",
      due_date: task?.due_date ? parseISO(task.due_date) : undefined,
      is_completed: task?.is_completed || false,
    },
  });

  useEffect(() => {
    form.reset({
      task_name: task?.task_name || "",
      priority: task?.priority || "medium",
      due_date: task?.due_date ? parseISO(task.due_date) : undefined,
      is_completed: task?.is_completed || false,
    });
  }, [task, form]);

  async function onSubmit(data) {
    setIsSaving(true);
    try {
      // Create a clean payload with only the necessary fields
      const payload = {
        task_name: data.task_name,
        priority: data.priority || 'medium',
        // If due_date exists, format it properly without timezone issues
        due_date: data.due_date ? new Date(data.due_date.getTime() + (12 * 60 * 60 * 1000)).toISOString().split('T')[0] : undefined,
        // Add project_id if provided
        project_id: projectId || task?.project_id,
        // Convert is_completed to match backend expectations
        is_completed: !!data.is_completed
      };
      
      console.log("Submitting task data:", payload);
      await onSave(payload, task?.id); 
      toast({
        title: task ? "Task Updated" : "Task Created",
        description: `Task "${data.task_name}" has been successfully ${task ? 'updated' : 'added'}.`,
      });
      if (!isInline) onCancel(); // Close dialog if not inline
      form.reset(); // Reset form for next inline add or if dialog reopens
    } catch (error) {
      console.error("Task save error:", error);
      toast({
        title: "Error",
        description: `Failed to ${task ? 'update' : 'create'} task: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }
  
  const formLayoutClasses = isInline ? "flex items-start gap-2 p-2 border rounded-md" : "space-y-4 py-2";
  const buttonLayoutClasses = isInline ? "flex gap-2 items-center mt-0" : "flex justify-end gap-2 pt-4";
  const inputSizeClass = isInline ? "h-9" : "h-10";


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={formLayoutClasses}>
        <FormField
          control={form.control}
          name="task_name"
          render={({ field }) => (
            <FormItem className={cn(isInline && "flex-grow")}>
              {!isInline && <FormLabel>Task Name</FormLabel>}
              <FormControl>
                <Input placeholder="e.g., Draft blog post" {...field} className={inputSizeClass} />
              </FormControl>
              {!isInline && <FormMessage />}
            </FormItem>
          )}
        />
        <div className={cn("flex gap-2 flex-wrap", isInline && "items-center")}>
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem className={cn(isInline && "w-32")}>
                {!isInline && <FormLabel>Priority</FormLabel>}
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className={inputSizeClass}>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                {!isInline && <FormMessage />}
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="due_date"
            render={({ field }) => (
              <FormItem className={cn("flex flex-col", isInline && "w-auto")}>
                {!isInline && <FormLabel>Due Date (Optional)</FormLabel>}
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                           inputSizeClass,
                           isInline && "w-auto px-3 min-w-[120px]"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        // Ensure we're working with a date at noon to avoid timezone issues
                        if (date) {
                          const adjustedDate = new Date(date);
                          adjustedDate.setHours(12, 0, 0, 0);
                          field.onChange(adjustedDate);
                        } else {
                          field.onChange(date);
                        }
                      }}
                      disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} // Disable past dates
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {!isInline && <FormMessage />}
              </FormItem>
            )}
          />
        </div>
        {!isInline && (
             <FormField
            control={form.control}
            name="is_completed"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 shadow-sm">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    id={`completed-${task?.id || 'new'}`}
                  />
                </FormControl>
                <Label htmlFor={`completed-${task?.id || 'new'}`} className="font-normal cursor-pointer">
                  Mark as completed
                </Label>
              </FormItem>
            )}
          />
        )}
       
        <div className={buttonLayoutClasses}>
          {!isInline && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
              Cancel
            </Button>
          )}
           {isInline && task && ( // Show cancel only for inline edit
            <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={isSaving}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSaving} size={isInline ? "sm" : "default"}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {task && isInline ? "Save" : task ? "Save Changes" : isInline ? "Add" : "Create Task"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
