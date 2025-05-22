
"use client";

import React from "react";
import { ProjectCard } from "./ProjectCard";
import { Inbox } from "lucide-react";

export function ProjectList({
  projects,
  isLoading,
  onTogglePin,
  onEditProject,
  onDeleteProject,
  isOptimisticPinning
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-4 animate-pulse">
            <div className="h-6 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
            <div className="h-1.5 bg-muted rounded-full w-full mt-2"></div>
            <div className="flex justify-end space-x-2 pt-4">
              <div className="h-8 bg-muted rounded w-20"></div>
              <div className="h-8 bg-muted rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12 border-2 border-dashed rounded-lg">
        <Inbox className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold text-muted-foreground">No Projects Yet</h3>
        <p className="text-muted-foreground mt-1">
          Create your first project to start managing your tasks.
        </p>
      </div>
    );
  }

  // Handle both pinned and is_pinned properties for compatibility
  const pinnedProjects = projects.filter(p => p.pinned || p.is_pinned);
  const unpinnedProjects = projects.filter(p => !p.pinned && !p.is_pinned);

  return (
    <div className="space-y-8">
      {pinnedProjects.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-primary">Pinned Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pinnedProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onTogglePin={onTogglePin}
                onEdit={onEditProject}
                onDelete={onDeleteProject}
                isPinning={isOptimisticPinning}
              />
            ))}
          </div>
        </div>
      )}
      {unpinnedProjects.length > 0 && (
         <div>
          {pinnedProjects.length > 0 && <hr className="my-8"/>}
          <h2 className="text-xl font-semibold mb-4">Other Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {unpinnedProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onTogglePin={onTogglePin}
                onEdit={onEditProject}
                onDelete={onDeleteProject}
                isPinning={isOptimisticPinning}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
