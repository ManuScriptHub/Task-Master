import { getAllTasks, getTasksByProjectId } from '../models/taskModel.js';
import { getProjectById } from '../models/projectModel.js';
import { generateProjectSummary, createChatSession, sendMessageToGemini, listAvailableModels } from '../services/geminiService.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize the Gemini API with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Define the working model name
const WORKING_MODEL = "gemini-1.5-flash";

// Test the API connection when the server starts
(async () => {
  console.log("Testing Gemini API connection...");
  const isConnected = await listAvailableModels();
  console.log(`Gemini API connection ${isConnected ? 'successful' : 'failed'}`);
  if (isConnected) {
    console.log(`Using model: ${WORKING_MODEL}`);
  }
})();

// Store chat sessions for each project
const chatSessions = {};

// Test endpoint for Gemini API
export const testGeminiAPI = async (req, res) => {
  try {
    console.log("Testing Gemini API connection...");
    
    // Try different model formats
    const modelNames = ["gemini-pro", "gemini-1.0-pro", "gemini-1.5-flash"];
    let success = false;
    let responseText = "";
    let workingModel = "";
    
    for (const modelName of modelNames) {
      try {
        console.log(`Trying model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello, can you respond with a simple 'Hello, I am working!' message?");
        const response = result.response;
        responseText = response.text();
        
        console.log(`Gemini API test response with ${modelName}:`, responseText);
        success = true;
        workingModel = modelName;
        break;
      } catch (modelError) {
        console.error(`Error with model ${modelName}:`, modelError.message);
      }
    }
    
    if (success) {
      res.json({ 
        success: true, 
        message: `Gemini API connection successful with model: ${workingModel}`, 
        response: responseText,
        workingModel
      });
    } else {
      throw new Error("All model formats failed");
    }
  } catch (error) {
    console.error("Gemini API test error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Gemini API connection failed with all model formats", 
      error: error.message 
    });
  }
};

// Function to generate a fallback summary without using Gemini
const generateFallbackSummary = (project, tasks) => {
  // Prepare data for processing
  const completedTasks = tasks.filter(task => task.is_completed);
  const pendingTasks = tasks.filter(task => !task.is_completed);
  
  // Calculate basic statistics
  const totalTasks = tasks.length;
  const completionRate = Math.round((completedTasks.length / totalTasks) * 100);
  
  // Group tasks by priority
  const highPriorityTasks = tasks.filter(task => task.priority === 'high');
  const mediumPriorityTasks = tasks.filter(task => task.priority === 'medium');
  const lowPriorityTasks = tasks.filter(task => task.priority === 'low');
  
  // Find overdue tasks
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdueTasks = pendingTasks.filter(task => {
    if (!task.due_date) return false;
    const dueDate = new Date(task.due_date);
    return dueDate < today;
  });
  
  // Generate a summary
  const summary = `Project "${project.title}" has ${totalTasks} tasks, with ${completedTasks.length} completed (${completionRate}% completion rate) and ${pendingTasks.length} pending. There are ${highPriorityTasks.length} high priority, ${mediumPriorityTasks.length} medium priority, and ${lowPriorityTasks.length} low priority tasks. ${overdueTasks.length} tasks are overdue.`;
  
  // Generate insights
  const insights = [];
  
  if (overdueTasks.length > 0) {
    insights.push(`You have ${overdueTasks.length} overdue tasks that need attention.`);
  }
  
  if (highPriorityTasks.filter(t => !t.is_completed).length > 0) {
    insights.push(`There are ${highPriorityTasks.filter(t => !t.is_completed).length} high priority tasks that are not completed yet.`);
  }
  
  if (completionRate > 75) {
    insights.push(`Great progress! You've completed ${completionRate}% of tasks in this project.`);
  } else if (completionRate < 25 && totalTasks > 5) {
    insights.push(`This project has a low completion rate (${completionRate}%). Consider focusing on completing some tasks.`);
  }
  
  // Generate suggestions
  const suggestions = [];
  
  if (overdueTasks.length > 0) {
    suggestions.push(`Focus on completing the ${overdueTasks.length} overdue tasks first.`);
  }
  
  if (highPriorityTasks.filter(t => !t.is_completed).length > 0) {
    suggestions.push(`Prioritize the ${highPriorityTasks.filter(t => !t.is_completed).length} incomplete high-priority tasks.`);
  }
  
  if (pendingTasks.length > 10) {
    suggestions.push("Consider breaking down some tasks into smaller, more manageable pieces.");
  }
  
  if (completedTasks.length === 0 && pendingTasks.length > 0) {
    suggestions.push("Try completing a few simple tasks to build momentum.");
  }
  
  return {
    summary,
    insights,
    suggestions
  };
};

// Function to summarize tasks for a project using Gemini
export const summarizeTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Get project details
    const projectResult = await getProjectById(projectId);
    if (projectResult.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }
    const project = projectResult.rows[0];
    
    // Get all tasks for the project
    const tasksResult = await getTasksByProjectId(projectId);
    const tasks = tasksResult.rows;
    
    if (tasks.length === 0) {
      return res.json({ 
        summary: "There are no tasks in this project yet.",
        insights: [],
        suggestions: ["Consider adding some tasks to get started."]
      });
    }
    
    // Try to use Gemini to generate a summary, insights, and suggestions
    try {
      console.log(`Using model ${WORKING_MODEL} to generate project summary`);
      const aiResponse = await generateProjectSummary(project, tasks);
      
      // Log the response for debugging
      console.log("Gemini response received:", JSON.stringify(aiResponse).substring(0, 200) + "...");
      
      // Return the AI-generated response
      res.json(aiResponse);
    } catch (geminiError) {
      console.error('Gemini API error, using fallback:', geminiError);
      
      // Use fallback summary generation
      console.log("Using fallback summary generation");
      const fallbackResponse = generateFallbackSummary(project, tasks);
      res.json(fallbackResponse);
    }
  } catch (err) {
    console.error('AI summary error:', err);
    
    // Provide a more user-friendly error message
    let errorMessage = 'Failed to generate summary';
    if (err.message.includes('Model not found')) {
      errorMessage = 'AI model configuration issue. Please check server logs.';
    } else if (err.message.includes('Authentication error')) {
      errorMessage = 'AI authentication issue. Please check your API key.';
    }
    
    res.status(500).json({ 
      message: errorMessage,
      error: err.message
    });
  }
};

// Function to handle AI chat with context of tasks using Gemini
export const chatWithAI = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { message, resetChat } = req.body;
    
    if (!message && !resetChat) {
      return res.status(400).json({ message: 'Message is required' });
    }
    
    // Get project details
    const projectResult = await getProjectById(projectId);
    if (projectResult.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }
    const project = projectResult.rows[0];
    
    // Get all tasks for the project
    const tasksResult = await getTasksByProjectId(projectId);
    const tasks = tasksResult.rows;
    
    // Reset chat if requested
    if (resetChat) {
      delete chatSessions[projectId];
      return res.json({ response: "Chat history has been reset." });
    }
    
    // Create or retrieve a chat session for this project
    if (!chatSessions[projectId]) {
      try {
        chatSessions[projectId] = await createChatSession();
        console.log(`Created new chat session for project ${projectId}`);
      } catch (error) {
        console.error('Error creating chat session:', error);
        return res.status(500).json({ 
          message: 'Failed to create chat session',
          error: error.message
        });
      }
    }
    
    // Try to send the message to Gemini with project context
    try {
      console.log(`Using model ${WORKING_MODEL} for chat`);
      const response = await sendMessageToGemini(
        chatSessions[projectId],
        message,
        project,
        tasks
      );
      
      res.json({ response });
    } catch (geminiError) {
      console.error('Gemini API error, using fallback response:', geminiError);
      
      // Generate a fallback response
      let fallbackResponse = "";
      
      // Check for common questions and provide appropriate responses
      if (message.toLowerCase().includes("overdue")) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const overdueTasks = tasks.filter(task => {
          if (!task.is_completed && task.due_date) {
            const dueDate = new Date(task.due_date);
            return dueDate < today;
          }
          return false;
        });
        
        if (overdueTasks.length > 0) {
          fallbackResponse = `You have ${overdueTasks.length} overdue tasks:\n`;
          overdueTasks.forEach(task => {
            fallbackResponse += `- ${task.task_name} (due: ${new Date(task.due_date).toLocaleDateString()})\n`;
          });
        } else {
          fallbackResponse = "You don't have any overdue tasks. Great job staying on schedule!";
        }
      } 
      else if (message.toLowerCase().includes("high priority")) {
        const highPriorityTasks = tasks.filter(task => !task.is_completed && task.priority === 'high');
        
        if (highPriorityTasks.length > 0) {
          fallbackResponse = `You have ${highPriorityTasks.length} high priority tasks:\n`;
          highPriorityTasks.forEach(task => {
            const dueDate = task.due_date ? new Date(task.due_date).toLocaleDateString() : "No due date";
            fallbackResponse += `- ${task.task_name} (due: ${dueDate})\n`;
          });
        } else {
          fallbackResponse = "You don't have any high priority tasks at the moment.";
        }
      }
      else if (message.toLowerCase().includes("progress") || message.toLowerCase().includes("status")) {
        const completedTasks = tasks.filter(task => task.is_completed);
        const pendingTasks = tasks.filter(task => !task.is_completed);
        const totalTasks = tasks.length;
        const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;
        
        fallbackResponse = `Project "${project.title}" is ${completionRate}% complete with ${completedTasks.length} out of ${totalTasks} tasks finished.`;
        
        if (pendingTasks.length > 0) {
          fallbackResponse += ` You have ${pendingTasks.length} tasks remaining.`;
        }
      }
      else if (message.toLowerCase().includes("next task") || message.toLowerCase().includes("what should i do")) {
        const pendingTasks = tasks.filter(task => !task.is_completed);
        // Find the highest priority task that's not completed
        const highPriorityTasks = pendingTasks.filter(task => task.priority === 'high');
        
        if (highPriorityTasks.length > 0) {
          const nextTask = highPriorityTasks[0];
          const dueDate = nextTask.due_date ? `due on ${new Date(nextTask.due_date).toLocaleDateString()}` : "with no due date";
          fallbackResponse = `I suggest working on "${nextTask.task_name}" next. It's a high priority task ${dueDate}.`;
        } else if (pendingTasks.length > 0) {
          const nextTask = pendingTasks[0];
          const dueDate = nextTask.due_date ? `due on ${new Date(nextTask.due_date).toLocaleDateString()}` : "with no due date";
          fallbackResponse = `I suggest working on "${nextTask.task_name}" next. It's ${dueDate}.`;
        } else {
          fallbackResponse = "You've completed all tasks in this project! Consider adding new tasks or starting a new project.";
        }
      }
      else {
        // Default response
        const completedTasks = tasks.filter(task => task.is_completed);
        const pendingTasks = tasks.filter(task => !task.is_completed);
        fallbackResponse = `I'm your project assistant for "${project.title}". You have ${pendingTasks.length} pending tasks and ${completedTasks.length} completed tasks. How can I help you manage your project better?`;
      }
      
      res.json({ response: fallbackResponse });
    }
    
  } catch (err) {
    console.error('AI chat error:', err);
    
    // Provide a more user-friendly error message
    let errorMessage = 'Failed to process chat message';
    if (err.message.includes('Model not found')) {
      errorMessage = 'AI model configuration issue. Please check server logs.';
    } else if (err.message.includes('Authentication error')) {
      errorMessage = 'AI authentication issue. Please check your API key.';
    }
    
    res.status(500).json({ 
      message: errorMessage,
      error: err.message
    });
  }
};