import { create } from 'zustand';
import { api } from '../lib/api';
import { getUserIdFromToken } from '../lib/utils';

export const useTasksStore = create((set, get) => ({
  tasks: [],
  currentTask: null,
  isLoading: false,
  error: null,
  
  fetchTasks: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      // Get the current user ID from the JWT token
      const userId = getUserIdFromToken();
      
      // Fetch tasks, either for a specific project or all tasks
      const endpoint = projectId ? `/tasks/${projectId}` : '/tasks';
      const tasks = await api.get(endpoint);
      
      // Filter tasks by user ID on the client side
      // This is done by filtering tasks that belong to projects owned by the user
      const filteredTasks = userId && tasks.length > 0
        ? tasks.filter(task => {
            // If we have project information in the task, filter by project's user_id
            if (task.project && task.project.user_id) {
              return task.project.user_id === userId;
            }
            // Otherwise, we need to check if the task's project_id belongs to the user
            // This would require additional API calls, so for now we'll include all tasks
            return true;
          })
        : tasks;
        
      set({ tasks: filteredTasks, isLoading: false });
      return filteredTasks;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.message || 'Failed to fetch tasks' 
      });
      return [];
    }
  },
  
  fetchTaskById: async (taskId) => {
    set({ isLoading: true, error: null });
    try {
      const task = await api.get(`/task/${taskId}`);
      set({ currentTask: task, isLoading: false });
      return task;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.message || 'Failed to fetch task' 
      });
      return null;
    }
  },
  
  createTask: async (taskData) => {
    set({ isLoading: true, error: null });
    try {
      // Ensure the task has a project_id
      if (!taskData.project_id) {
        throw new Error('Task must be associated with a project');
      }
      
      const newTask = await api.post('/tasks', taskData);
      set({ 
        tasks: [...get().tasks, newTask],
        isLoading: false 
      });
      return newTask;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.message || 'Failed to create task' 
      });
      return null;
    }
  },
  
  updateTask: async (taskId, taskData) => {
    set({ isLoading: true, error: null });
    try {
      const updatedTask = await api.put(`/task/${taskId}`, taskData);
      
      set({ 
        tasks: get().tasks.map(t => 
          t.id === updatedTask.id ? updatedTask : t
        ),
        currentTask: get().currentTask?.id === updatedTask.id 
          ? updatedTask 
          : get().currentTask,
        isLoading: false 
      });
      
      return updatedTask;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.message || 'Failed to update task' 
      });
      return null;
    }
  },
  
  deleteTask: async (taskId) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/task/${taskId}`);
      
      set({ 
        tasks: get().tasks.filter(t => t.id !== taskId),
        currentTask: get().currentTask?.id === taskId 
          ? null 
          : get().currentTask,
        isLoading: false 
      });
      
      return true;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.message || 'Failed to delete task' 
      });
      return false;
    }
  },
  
  clearError: () => {
    set({ error: null });
  }
}));