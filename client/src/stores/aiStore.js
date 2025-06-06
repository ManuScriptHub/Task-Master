import { create } from 'zustand';
import { api } from '../lib/api';

export const useAIStore = create((set, get) => ({
  summary: null,
  insights: [],
  suggestions: [],
  chatHistory: [],
  isLoading: false,
  error: null,
  currentProjectId: null,
  fetchInProgress: false,
  
  // Fetch AI summary for a project
  fetchSummary: async (projectId) => {
    // Prevent multiple simultaneous fetches
    if (get().fetchInProgress) {
      console.log("Fetch already in progress, skipping");
      return;
    }
    
    // Reset summary data when switching projects
    if (get().currentProjectId !== projectId) {
      set({ 
        summary: null, 
        insights: [], 
        suggestions: [], 
        currentProjectId: projectId 
      });
    }
    
    set({ isLoading: true, error: null, fetchInProgress: true });
    try {
      const data = await api.get(`/ai/summary/${projectId}`);
      set({ 
        summary: data.summary,
        insights: data.insights,
        suggestions: data.suggestions,
        isLoading: false,
        currentProjectId: projectId,
        fetchInProgress: false
      });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.message || 'Failed to fetch AI summary',
        fetchInProgress: false
      });
    }
  },
  
  // Send a message to the AI and get a response
  sendMessage: async (projectId, message) => {
    set({ isLoading: true, error: null });
    try {
      // Add user message to chat history
      const userMessage = { role: 'user', content: message };
      set({ chatHistory: [...get().chatHistory, userMessage] });
      
      // Send message to AI
      const data = await api.post(`/ai/chat/${projectId}`, { message });
      
      // Add AI response to chat history
      const aiMessage = { role: 'assistant', content: data.response };
      set({ 
        chatHistory: [...get().chatHistory, aiMessage],
        isLoading: false 
      });
      
      return data.response;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.message || 'Failed to send message to AI' 
      });
      return null;
    }
  },
  
  // Clear chat history (both client and server)
  clearChat: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      // Reset the chat session on the server
      if (projectId) {
        await api.post(`/ai/chat/${projectId}`, { resetChat: true });
      }
      
      // Clear the chat history on the client
      set({ 
        chatHistory: [],
        isLoading: false 
      });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.message || 'Failed to clear chat history' 
      });
    }
  }
}));