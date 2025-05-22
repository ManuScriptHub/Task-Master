"use client";

import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { TaskList } from "@/components/tasks/TaskList";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, AlertTriangle, Pin } from "lucide-react";
import { Link } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format, parseISO } from "date-fns"; // Assuming tasks may have dates

// Helper to get project color, assuming it's defined elsewhere or we define a local version
import { getProjectColor } from "@/lib/constants";


export default function ProjectDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const projectId = params.id;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: project, isLoading: isLoadingProject, error: projectError } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => api.get(`/project/${projectId}`),
    enabled: !!projectId && !!user,
  });

  // Tasks are assumed to be part of the project data based on API spec or fetched separately.
  // If tasks are fetched separately:
  const { data: tasksData, isLoading: isLoadingTasks, refetch: refetchTasks } = useQuery({
     queryKey: ["tasks", projectId],
     queryFn: () => api.get(`/tasks?project_id=${projectId}`), // Assuming API supports this query
     enabled: !!projectId && !!user,
  });
  const tasks = tasksData || project?.tasks || [];


  const createTaskMutation = useMutation({
    mutationFn: (newTaskData) => api.post("/tasks", { ...newTaskData, project_id: projectId }),
    onSuccess: (newTask) => {
      queryClient.setQueryData(["tasks", projectId], (oldTasks = []) => [...oldTasks, newTask]);
      // Optionally invalidate project query if it contains task aggregates
      queryClient.invalidateQueries({ queryKey: ["project", projectId] }); 
      toast({ title: "Task Created", description: `Task "${newTask.task_name}" added.` });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create task.", variant: "destructive" });
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }) => api.put(`/task/${taskId}`, data),
    onSuccess: (updatedTask) => {
      queryClient.setQueryData(["tasks", projectId], (oldTasks = []) =>
        oldTasks.map((t) => (t.id === updatedTask.id ? updatedTask : t))
      );
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      toast({ title: "Task Updated", description: `Task "${updatedTask.task_name}" updated.` });
    },
     onError: () => {
      toast({ title: "Error", description: "Failed to update task.", variant: "destructive" });
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId) => api.delete(`/task/${taskId}`),
    onSuccess: (_, taskId) => {
      queryClient.setQueryData(["tasks", projectId], (oldTasks = []) =>
        oldTasks.filter((t) => t.id !== taskId)
      );
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      toast({ title: "Task Deleted", description: "Task removed successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete task.", variant: "destructive" });
    }
  });

  if (isLoadingProject || (isLoadingTasks && !project?.tasks)) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-15rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (projectError || !project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-15rem)] text-center">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Project Not Found</h2>
        <p className="text-muted-foreground mb-6">
          {projectError ? projectError.message : "The project you are looking for does not exist or you do not have permission to view it."}
        </p>
        <Button asChild variant="outline">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back to Dashboard
          </Link>
        </Button>
      </div>
    );
  }
  
  const projectBgColor = getProjectColor(project.id);

  return (
    <div className="space-y-8">
      <div>
        <Button variant="outline" size="sm" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
        </Button>
      
        <Card className={`overflow-hidden shadow-lg ${projectBgColor}`}>
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <CardTitle className="text-3xl font-bold">{project.title}</CardTitle>
              {project.pinned && <Badge variant="secondary" className="flex items-center gap-1"><Pin className="h-3.5 w-3.5"/> Pinned</Badge>}
            </div>
            {project.description && (
              <CardDescription className="text-base pt-2 text-foreground/80">{project.description}</CardDescription>
            )}
          </CardHeader>
          {/* If you have metadata like created_at or user info for the project, display here */}
          {/* <CardContent> <p className="text-sm text-muted-foreground">Created by: {project.user_id}</p> </CardContent> */}
        </Card>
      </div>

      <Separator />

      <div>
        <h2 className="text-2xl font-semibold mb-6">Tasks for {project.title}</h2>
        <TaskList
          tasks={tasks}
          projectId={projectId}
          isLoading={isLoadingTasks}
          onCreateTask={createTaskMutation.mutateAsync}
          onUpdateTask={async (taskId, data) => updateTaskMutation.mutateAsync({ taskId, data })}
          onDeleteTask={deleteTaskMutation.mutateAsync}
          isTaskUpdating={updateTaskMutation.isPending || deleteTaskMutation.isPending}
          updatingTaskId={ (updateTaskMutation.isPending && updateTaskMutation.variables?.taskId) || (deleteTaskMutation.isPending && deleteTaskMutation.variables) || null}
        />
      </div>
    </div>
  );
}
