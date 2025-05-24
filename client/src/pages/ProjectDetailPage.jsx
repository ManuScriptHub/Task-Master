import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectsStore } from '../stores/projectsStore';
import { useTasksStore } from '../stores/tasksStore';
import { useToast } from '../hooks/use-toast';
import { api } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { ProjectForm } from '../components/projects/ProjectForm';
import { TaskForm } from '../components/tasks/TaskForm';
import { TaskList } from '../components/tasks/TaskList';
import { Checkbox } from '../components/ui/checkbox';
import { Edit, Trash2, Plus } from 'lucide-react';

const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { currentProject, fetchProjectById, updateProject, deleteProject, isLoading: projectLoading } = useProjectsStore();
  const { tasks, fetchTasks, createTask, updateTask, deleteTask, isLoading: tasksLoading } = useTasksStore();
  
  const [isEditProjectDialogOpen, setIsEditProjectDialogOpen] = useState(false);
  const [isDeleteProjectDialogOpen, setIsDeleteProjectDialogOpen] = useState(false);
  const [isCreateTaskDialogOpen, setIsCreateTaskDialogOpen] = useState(false);
  const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = useState(false);
  const [isDeleteTaskDialogOpen, setIsDeleteTaskDialogOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  
  useEffect(() => {
    if (projectId) {
      fetchProjectById(projectId);
      fetchTasks(projectId);
    }
  }, [projectId, fetchProjectById, fetchTasks]);
  
  const handleDeleteProject = async () => {
    const success = await deleteProject(projectId);
    if (success) {
      toast({
        title: "Project Deleted",
        description: `Project "${currentProject.title}" has been successfully deleted.`
      });
      navigate('/projects');
    } else {
      toast({
        title: "Error",
        description: "Failed to delete project.",
        variant: "destructive"
      });
    }
  };

  const handleCreateTask = async (taskData) => {
    // Make sure we're sending the correct data format to the server
    const newTaskData = {
      task_name: taskData.task_name,
      priority: taskData.priority || 'medium',
      due_date: taskData.due_date, // Keep the original due_date string
      is_completed: taskData.is_completed || false,
      project_id: projectId
    };
    
    await createTask(newTaskData);
    setIsCreateTaskDialogOpen(false);
  };

  const handleEditTask = (task) => {
    setCurrentTask(task);
    setIsEditTaskDialogOpen(true);
  };

  const handleUpdateTask = async (taskData) => {
    // Make sure we're sending the correct data format to the server
    const updatedTaskData = {
      task_name: taskData.task_name,
      priority: taskData.priority || 'medium',
      due_date: taskData.due_date, // Keep the original due_date string
      is_completed: taskData.is_completed || false,
      project_id: projectId
    };
    
    await updateTask(currentTask.id, updatedTaskData);
    setIsEditTaskDialogOpen(false);
    setCurrentTask(null);
  };

  const handleDeleteTask = (task) => {
    setTaskToDelete(task);
    setIsDeleteTaskDialogOpen(true);
  };

  const confirmDeleteTask = async () => {
    if (taskToDelete) {
      try {
        const success = await deleteTask(taskToDelete.id);
        if (success) {
          toast({
            title: "Task Deleted",
            description: `Task "${taskToDelete.task_name}" has been successfully deleted.`
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to delete task.",
            variant: "destructive"
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: `Failed to delete task: ${error.message}`,
          variant: "destructive"
        });
      } finally {
        setTaskToDelete(null);
        setIsDeleteTaskDialogOpen(false);
      }
    }
  };

  const handleToggleTaskCompletion = async (taskId, isCompleted) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      try {
        // Use the PATCH endpoint directly with minimal data
        const updatedTask = await api.patch(`/task/${taskId}/toggle-completion`, {
          is_completed: !isCompleted
        });
        
        if (updatedTask) {
          // Update the task in the local state
          const updatedTasks = tasks.map(t => 
            t.id === updatedTask.id ? updatedTask : t
          );
          useTasksStore.setState({ tasks: updatedTasks });
          
          const newStatus = !isCompleted ? "completed" : "incomplete";
          toast({
            title: `Task ${newStatus === "completed" ? "Completed" : "Marked as Incomplete"}`,
            description: `"${task.task_name}" is marked as ${newStatus}.`
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to update task status.",
            variant: "destructive"
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: `Failed to update task status: ${error.message}`,
          variant: "destructive"
        });
      }
    }
  };
  
  if (projectLoading || !currentProject) {
    return <div>Loading project...</div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{currentProject.title}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditProjectDialogOpen(true)}>
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button variant="destructive" onClick={() => setIsDeleteProjectDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">{currentProject.description || "No description provided."}</p>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="tasks">
        <TabsList>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tasks" className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Project Tasks</h2>
            <Button onClick={() => setIsCreateTaskDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Task
            </Button>
          </div>
          
          {tasksLoading ? (
            <div>Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-10">
              <h2 className="text-xl font-semibold mb-2">No tasks yet</h2>
              <p className="text-muted-foreground mb-4">
                Create your first task for this project
              </p>
              <Button onClick={() => setIsCreateTaskDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Create Task
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map(task => (
                <Card key={task.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Checkbox 
                          checked={task.is_completed} 
                          onCheckedChange={() => handleToggleTaskCompletion(task.id, task.is_completed)}
                          className="mt-1"
                        />
                        <div className={task.is_completed ? "line-through text-muted-foreground" : ""}>
                          <h3 className="font-medium">{task.task_name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {task.due_date && (
                              <span className="mr-3">Due: {new Date(task.due_date).toLocaleDateString()}</span>
                            )}
                            {task.priority && (
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                task.priority === 'high' 
                                  ? 'bg-red-100 text-red-800' 
                                  : task.priority === 'medium' 
                                  ? 'bg-yellow-100 text-yellow-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {task.priority}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditTask(task)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteTask(task)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="details" className="mt-4">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Created At</h3>
              <p className="text-muted-foreground">
                {currentProject.created_at ? new Date(currentProject.created_at).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Edit Project Dialog */}
      <Dialog open={isEditProjectDialogOpen} onOpenChange={setIsEditProjectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          <ProjectForm 
            project={currentProject} 
            onSave={(projectData) => updateProject(projectId, projectData)} 
            closeDialog={() => setIsEditProjectDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>
      
      {/* Create Task Dialog */}
      <Dialog open={isCreateTaskDialogOpen} onOpenChange={setIsCreateTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <TaskForm 
            projectId={projectId}
            onSave={handleCreateTask}
            onCancel={() => setIsCreateTaskDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Task Dialog */}
      <Dialog open={isEditTaskDialogOpen} onOpenChange={setIsEditTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <TaskForm 
            task={currentTask}
            projectId={projectId}
            onSave={handleUpdateTask}
            onCancel={() => {
              setIsEditTaskDialogOpen(false);
              setCurrentTask(null);
            }}
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Project Dialog */}
      <AlertDialog open={isDeleteProjectDialogOpen} onOpenChange={setIsDeleteProjectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project
              and all associated tasks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProject}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Task Dialog */}
      <AlertDialog open={isDeleteTaskDialogOpen} onOpenChange={setIsDeleteTaskDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
              {taskToDelete && <p className="font-medium mt-2">"{taskToDelete.task_name}"</p>}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTaskToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteTask}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProjectDetailPage;