import { create } from 'zustand';
import { api } from '../lib/api';
import { getUserIdFromToken } from '../lib/utils';

export const useProjectsStore = create((set, get) => ({
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,
  
  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      // Get the current user ID from the JWT token
      const userId = getUserIdFromToken();
      
      // If we have a user ID, filter projects by user
      const endpoint = userId ? `/projects?userId=${userId}` : '/projects';
      const projects = await api.get(endpoint);
      
      // Filter projects by user ID on the client side as well
      // This is a fallback in case the server doesn't filter properly
      const filteredProjects = userId 
        ? projects.filter(project => project.user_id === userId)
        : projects;
        
      set({ projects: filteredProjects, isLoading: false });
      return filteredProjects;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.message || 'Failed to fetch projects' 
      });
      return [];
    }
  },
  
  fetchProjectById: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      const project = await api.get(`/project/${projectId}`);
      set({ currentProject: project, isLoading: false });
      return project;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.message || 'Failed to fetch project' 
      });
      return null;
    }
  },
  
  createProject: async (projectData) => {
    set({ isLoading: true, error: null });
    try {
      // Get the current user ID from the JWT token
      const userId = getUserIdFromToken();
      
      // Add the user ID to the project data
      const projectWithUserId = {
        ...projectData,
        user_id: userId
      };
      
      const newProject = await api.post('/projects', projectWithUserId);
      set({ 
        projects: [...get().projects, newProject],
        isLoading: false 
      });
      return newProject;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.message || 'Failed to create project' 
      });
      return null;
    }
  },
  
  updateProject: async (projectId, projectData) => {
    set({ isLoading: true, error: null });
    try {
      const updatedProject = await api.put(`/project/${projectId}`, projectData);
      
      set({ 
        projects: get().projects.map(p => 
          p.id === updatedProject.id ? updatedProject : p
        ),
        currentProject: get().currentProject?.id === updatedProject.id 
          ? updatedProject 
          : get().currentProject,
        isLoading: false 
      });
      
      return updatedProject;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.message || 'Failed to update project' 
      });
      return null;
    }
  },
  
  deleteProject: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/project/${projectId}`);
      
      set({ 
        projects: get().projects.filter(p => p.id !== projectId),
        currentProject: get().currentProject?.id === projectId 
          ? null 
          : get().currentProject,
        isLoading: false 
      });
      
      return true;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.message || 'Failed to delete project' 
      });
      return false;
    }
  },
  
  clearError: () => {
    set({ error: null });
  }
}));