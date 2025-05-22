import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useProjectsStore } from '../stores/projectsStore';
import { useTasksStore } from '../stores/tasksStore';
import { AuthContext } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { ProjectList } from '../components/projects/ProjectList';
import { ProjectForm } from '../components/projects/ProjectForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';

const ProjectsPage = () => {
  const { user } = useContext(AuthContext);
  const { 
    projects, 
    fetchProjects, 
    createProject, 
    updateProject,
    deleteProject,
    isLoading 
  } = useProjectsStore();
  
  const { tasks, fetchTasks, isLoading: tasksLoading } = useTasksStore();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  useEffect(() => {
    if (user) {
      fetchProjects();
      fetchTasks();
    }
  }, [fetchProjects, fetchTasks, user]);
  
  // Filter projects by the current user
  const userProjects = user ? projects.filter(project => {
    return project.user_id === user.id || project.user_id === parseInt(user.id);
  }) : [];
  
  // Filter tasks by the current user's projects
  const userProjectIds = userProjects.map(project => project.id);
  const userTasks = user ? tasks.filter(task => userProjectIds.includes(task.project_id)) : [];
  
  // Associate tasks with their respective projects
  const projectsWithTasks = userProjects.map(project => {
    const projectTasks = userTasks.filter(task => task.project_id === project.id);
    return { ...project, tasks: projectTasks };
  });
  
  const handleCreateProject = async (projectData) => {
    await createProject(projectData);
    setIsDialogOpen(false);
  };
  
  const handleEditProject = (project) => {
    setCurrentProject(project);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };
  
  const handleUpdateProject = async (projectData, projectId) => {
    await updateProject(projectId, projectData);
    setIsDialogOpen(false);
    setCurrentProject(null);
    setIsEditMode(false);
  };
  
  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      await deleteProject(projectId);
    }
  };
  
  const handleTogglePin = async (projectId, isPinned) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      const updatedProject = {
        ...project,
        is_pinned: !isPinned
      };
      await updateProject(projectId, updatedProject);
    }
  };
  
  const closeDialog = () => {
    setIsDialogOpen(false);
    setCurrentProject(null);
    setIsEditMode(false);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
        <Button onClick={() => setIsDialogOpen(true)}>Create Project</Button>
      </div>
      
      {isLoading ? (
        <div>Loading projects...</div>
      ) : userProjects.length === 0 ? (
        <div className="text-center py-10">
          <h2 className="text-xl font-semibold mb-2">No projects yet</h2>
          <p className="text-muted-foreground mb-4">
            Create your first project to get started
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>Create Project</Button>
        </div>
      ) : (
        <ProjectList 
          projects={projectsWithTasks} 
          onTogglePin={handleTogglePin}
          onEditProject={handleEditProject}
          onDeleteProject={handleDeleteProject}
        />
      )}
      
      <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Project' : 'Create New Project'}</DialogTitle>
          </DialogHeader>
          <ProjectForm 
            project={currentProject} 
            onSave={isEditMode ? handleUpdateProject : handleCreateProject} 
            closeDialog={closeDialog} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectsPage;