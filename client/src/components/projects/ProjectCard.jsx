"use client";

import React from "react";
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pin, PinOff, CheckCircle, ListChecks } from "lucide-react";
import { getProjectColor } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

export function ProjectCard({ project, onTogglePin, onEdit, onDelete, isPinning }) {
  const bgColorClass = project.displayColor || getProjectColor(project.id);
  const tasks = project.tasks || [];
  const completedTasks = tasks.filter(task => task.is_completed).length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <Link 
      to={`/projects/${project.id}`} 
      className="block group"
    >
      <Card className={`flex flex-col overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 ${bgColorClass} cursor-pointer`}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors duration-200">
              {project.title}
            </CardTitle>
            {onTogglePin && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onTogglePin(project.id, project.pinned || project.is_pinned);
                }}
                disabled={isPinning}
                aria-label={(project.pinned || project.is_pinned) ? "Unpin project" : "Pin project"}
                className="text-muted-foreground hover:text-primary"
              >
                {(project.pinned || project.is_pinned) ? <Pin className="h-5 w-5 text-primary" /> : <PinOff className="h-5 w-5" />}
              </Button>
            )}
          </div>
          <CardDescription className="text-sm text-muted-foreground line-clamp-2 h-10 pt-1">
            {project.description || "No description provided."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-3 pt-2 pb-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center">
                  <ListChecks className="mr-1.5 h-4 w-4" />
                  <span>{completedTasks} / {totalTasks} tasks</span>
              </div>
              {totalTasks > 0 && (
                   <Badge variant={progress === 100 ? "default" : "secondary"} className={progress === 100 ? "bg-green-500/20 text-green-700 border-green-400" : ""}>
                      {progress === 100 ? <CheckCircle className="mr-1 h-3 w-3" /> : null}
                      {Math.round(progress)}% done
                  </Badge>
              )}
          </div>
          
          {totalTasks > 0 ? (
              <div className="w-full bg-muted rounded-full h-1.5">
                  <div className="bg-primary h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
              </div>
          ) : (
              // Add a spacer div with the same height as the progress bar to maintain consistent card height
              <div className="h-1.5 pb-3"></div>
          )}

        </CardContent>
      </Card>
    </Link>
  );
}
