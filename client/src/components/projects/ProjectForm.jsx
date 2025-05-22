
"use client";

import React, { useEffect, useContext } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProjectSchema } from "../../lib/zodSchemas";
import { AuthContext } from "../../contexts/AuthContext";
import { getUserIdFromToken } from "../../lib/utils";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { useToast } from "../../hooks/use-toast";
import { Loader2, Sparkles, Pin, PinOff } from "lucide-react";
// AI feature temporarily disabled
// import { generateProjectDescription } from "@/ai/flows/generate-project-description";

export function ProjectForm({ project, onSave, closeDialog }) {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  const [isSaving, setIsSaving] = React.useState(false);
  // AI feature temporarily disabled
  // const [isGeneratingDesc, setIsGeneratingDesc] = React.useState(false);

  const form = useForm({
    resolver: zodResolver(ProjectSchema),
    defaultValues: {
      title: project?.title || "",
      description: project?.description || "",
      pinned: project?.pinned || false,
    },
  });

  useEffect(() => {
    if (project) {
      form.reset({
        title: project.title,
        description: project.description || "",
        pinned: project.pinned || project.is_pinned || false,
      });
    } else {
       form.reset({
        title: "",
        description: "",
        pinned: false,
      });
    }
  }, [project, form]);

  // AI feature temporarily disabled
  const handleGenerateDescription = async () => {
    toast({
      title: "AI Feature Disabled",
      description: "The AI description generation feature is temporarily disabled.",
      variant: "default",
    });
  };

  async function onSubmit(data) {
    setIsSaving(true);
    try {
      // Add user_id to the project data
      const userId = user?.id || getUserIdFromToken();
      if (!userId) {
        throw new Error("User ID not found. Please log in again.");
      }
      
      // Convert pinned to is_pinned for the backend
      const projectData = {
        ...data,
        user_id: userId,
        is_pinned: data.pinned // Backend expects is_pinned, not pinned
      };
      
      await onSave(projectData, project?.id);
      toast({
        title: project ? "Project Updated" : "Project Created",
        description: `Project "${data.title}" has been successfully ${project ? 'updated' : 'created'}.`,
      });
      closeDialog();
    } catch (error) {
      console.error("Project save error:", error);
      toast({
        title: "Error",
        description: `Failed to ${project ? 'update' : 'create'} project: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{project ? "Edit Project" : "Create New Project"}</DialogTitle>
        <DialogDescription>
          {project ? "Update the details of your project." : "Fill in the details to create a new project."}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Marketing Campaign Q3" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Description (Optional)</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateDescription}
                    className="text-xs"
                  >
                    <Sparkles className="mr-1 h-3 w-3" />
                    AI Assist
                  </Button>
                </div>
                <FormControl>
                  <Textarea placeholder="Describe your project..." {...field} rows={4} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="pinned"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 shadow-sm">
                 <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    id="pinned"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel htmlFor="pinned" className="flex items-center cursor-pointer">
                    {field.value ? <Pin className="mr-2 h-4 w-4 text-primary" /> : <PinOff className="mr-2 h-4 w-4 text-muted-foreground" />}
                     Pin Project
                  </FormLabel>
                  <FormDescription>
                    Pinned projects appear at the top of your dashboard.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {project ? "Save Changes" : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
