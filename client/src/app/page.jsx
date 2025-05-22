
"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ProjectList } from "@/components/projects/ProjectList";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, X, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { getProjectColor } from "@/lib/constants";


export default function DashboardPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOptimisticPinning, setIsOptimisticPinning] = useState(false);

  const { data: projectsData, isLoading: isLoadingProjects } = useQuery({
    queryKey: ["projects", user?.id],
    queryFn: () => api.get(`/projects`), // Assumes API filters by authenticated user
    enabled: !!user,
    select: (data) => data.map(p => ({...p, displayColor: getProjectColor(p.id)}))
  });

  const projects = projectsData || [];

  const createProjectMutation = useMutation({
    mutationFn: (newProject) => api.post("/projects", { ...newProject, user_id: user?.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", user?.id] });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/project/${id}`, data),
    onSuccess: (updatedProject) => {
      queryClient.setQueryData(["projects", user?.id], (oldData) =>
        oldData?.map((p) => (p.id === updatedProject.id ? {...updatedProject, displayColor: getProjectColor(updatedProject.id)} : p)) || []
      );
    },
  });
  
  const deleteProjectMutation = useMutation({
    mutationFn: (projectId) => api.delete(`/project/${projectId}`),
    onSuccess: (_, projectId) => {
      queryClient.setQueryData(["projects", user?.id], (oldData) =>
        oldData?.filter((p) => p.id !== projectId) || []
      );
      toast({ title: "Project Deleted", description: "The project has been successfully deleted." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete project.", variant: "destructive" });
    }
  });

  const handleSaveProject = async (data, id) => {
    if (id) { // Editing existing project
      await updateProjectMutation.mutateAsync({ id, data });
    } else { // Creating new project
      await createProjectMutation.mutateAsync(data);
    }
  };

  const handleTogglePin = async (projectId, currentPinStatus) => {
    setIsOptimisticPinning(true);
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    // Optimistic update
    const originalProjects = queryClient.getQueryData(["projects", user?.id]);
    queryClient.setQueryData(["projects", user?.id], (oldData) =>
      oldData?.map(p => p.id === projectId ? { ...p, pinned: !currentPinStatus } : p)
    );

    try {
      await updateProjectMutation.mutateAsync({ id: projectId, data: { ...project, title: project.title, description: project.description, pinned: !currentPinStatus } });
      toast({
        title: `Project ${!currentPinStatus ? "Pinned" : "Unpinned"}`,
        description: `Project "${project.title}" has been ${!currentPinStatus ? "pinned" : "unpinned"}.`,
      });
    } catch (error) {
      // Revert optimistic update on error
      queryClient.setQueryData(["projects", user?.id], originalProjects);
      toast({ title: "Error", description: "Failed to update pin status.", variant: "destructive" });
    } finally {
      setIsOptimisticPinning(false);
    }
  };
  
  const openEditProjectForm = (project) => {
    setEditingProject(project);
    setIsProjectFormOpen(true);
  };

  const openCreateProjectForm = () => {
    setEditingProject(null);
    setIsProjectFormOpen(true);
  };

  const closeProjectForm = () => {
    setIsProjectFormOpen(false);
    setEditingProject(null);
  };

  const filteredProjects = useMemo(() => {
    if (!searchTerm) return projects;
    return projects.filter(project =>
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [projects, searchTerm]);


  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">My Projects</h1>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search projects..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setSearchTerm("")}
              >
                <X className="h-4 w-4"/>
              </Button>
            )}
          </div>
          <Dialog open={isProjectFormOpen} onOpenChange={setIsProjectFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateProjectForm} className="shrink-0">
                <PlusCircle className="mr-2 h-5 w-5" /> Create Project
              </Button>
            </DialogTrigger>
            {isProjectFormOpen && ( /* Conditionally render to reset form state on open */
              <ProjectForm
                project={editingProject}
                onSave={handleSaveProject}
                closeDialog={closeProjectForm}
              />
            )}
          </Dialog>
        </div>
      </div>

      <ProjectList
        projects={filteredProjects}
        isLoading={isLoadingProjects || createProjectMutation.isPending || updateProjectMutation.isPending}
        onTogglePin={handleTogglePin}
        onEditProject={openEditProjectForm}
        onDeleteProject={(id) => setProjectToDelete(id)}
        isOptimisticPinning={isOptimisticPinning}
      />

      {projects.length === 0 && !isLoadingProjects && (
        <div className="text-center py-10">
          <p className="text-lg text-muted-foreground">
            You have no projects yet. Click &quot;Create Project&quot; to get started!
          </p>
        </div>
      )}
      
      <AlertDialog open={!!projectToDelete} onOpenChange={() => setProjectToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project and all its tasks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProjectToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (projectToDelete) {
                  await deleteProjectMutation.mutateAsync(projectToDelete);
                  setProjectToDelete(null);
                }
              }}
              disabled={deleteProjectMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteProjectMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
