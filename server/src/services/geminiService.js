import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize the Gemini API with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Function to list available models
export const listAvailableModels = async () => {
  try {
    // Try different model name formats
    try {
      console.log("Trying model: gemini-pro");
      const result = await genAI.getGenerativeModel({ model: "gemini-pro" }).generateContent("Test");
      console.log("API connection successful with model: gemini-pro");
      return true;
    } catch (error1) {
      console.log("Failed with gemini-pro, trying gemini-1.0-pro");
      try {
        const result = await genAI.getGenerativeModel({ model: "gemini-1.0-pro" }).generateContent("Test");
        console.log("API connection successful with model: gemini-1.0-pro");
        return true;
      } catch (error2) {
        console.log("Failed with gemini-1.0-pro, trying gemini-1.5-flash");
        try {
          const result = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }).generateContent("Test");
          console.log("API connection successful with model: gemini-1.5-flash");
          return true;
        } catch (error3) {
          throw new Error("All model name formats failed");
        }
      }
    }
  } catch (error) {
    console.error("Error testing API connection:", error);
    return false;
  }
};

// Create a chat session with history
export const createChatSession = async () => {
  try {
    // Use the working model name
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Start a chat session
    const chat = model.startChat({
      history: [],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1000,
      },
    });
    
    return chat;
  } catch (error) {
    console.error('Error creating chat session:', error);
    throw error;
  }
};

// Generate a project summary using Gemini
export const generateProjectSummary = async (project, tasks) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Prepare project data for the prompt
    const completedTasks = tasks.filter(task => task.is_completed);
    const pendingTasks = tasks.filter(task => !task.is_completed);
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
    
    // Log the project and tasks for debugging
    console.log("Generating summary for project:", project.title);
    console.log("Number of tasks:", tasks.length);
    
    // Create a detailed prompt for the AI
    const prompt = `
    You are an AI project assistant analyzing the following project:
    
    Project Title: ${project.title}
    Project Description: ${project.description || "No description provided"}
    Created At: ${new Date(project.created_at).toLocaleDateString()}
    
    Task Statistics:
    - Total Tasks: ${tasks.length}
    - Completed Tasks: ${completedTasks.length}
    - Pending Tasks: ${pendingTasks.length}
    - Completion Rate: ${tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}%
    - High Priority Tasks: ${highPriorityTasks.length}
    - Medium Priority Tasks: ${mediumPriorityTasks.length}
    - Low Priority Tasks: ${lowPriorityTasks.length}
    - Overdue Tasks: ${overdueTasks.length}
    
    Task Details:
    ${tasks.map(task => `
    - Task: ${task.task_name}
      Status: ${task.is_completed ? 'Completed' : 'Pending'}
      Priority: ${task.priority || 'Not set'}
      Due Date: ${task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
    `).join('')}
    
    Based on this information, please provide:
    1. A concise summary of the project's current status
    2. Key insights about task distribution, priorities, and deadlines
    3. Actionable suggestions to improve project management and task completion
    
    Format your response as a JSON object with the following structure:
    {
      "summary": "A paragraph summarizing the project status",
      "insights": ["Insight 1", "Insight 2", ...],
      "suggestions": ["Suggestion 1", "Suggestion 2", ...]
    }
    `;
    
    console.log("Sending prompt to Gemini...");
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    console.log("Raw response from Gemini:", text.substring(0, 200) + "...");
    
    // Extract the JSON from the response
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonResponse = JSON.parse(jsonMatch[0]);
        console.log("Successfully parsed JSON response");
        return jsonResponse;
      } else {
        // If no JSON found, try to create a structured response from the text
        console.log("No JSON found in response, creating structured response");
        
        // Split the text into sections
        const sections = text.split(/\n\n|\r\n\r\n/);
        
        // Extract summary (first paragraph)
        const summary = sections[0] || "Generated summary";
        
        // Extract insights and suggestions
        const insights = [];
        const suggestions = [];
        
        let currentSection = null;
        
        for (const section of sections) {
          if (section.toLowerCase().includes("insight") || section.toLowerCase().includes("key point")) {
            currentSection = "insights";
            continue;
          } else if (section.toLowerCase().includes("suggestion") || section.toLowerCase().includes("recommendation")) {
            currentSection = "suggestions";
            continue;
          }
          
          if (currentSection === "insights" && section.trim()) {
            // Extract bullet points or numbered items
            const points = section.split(/\n- |\n\d+\. /).filter(p => p.trim());
            insights.push(...points);
          } else if (currentSection === "suggestions" && section.trim()) {
            const points = section.split(/\n- |\n\d+\. /).filter(p => p.trim());
            suggestions.push(...points);
          }
        }
        
        return {
          summary,
          insights: insights.length > 0 ? insights : ["Project analysis complete"],
          suggestions: suggestions.length > 0 ? suggestions : ["Consider reviewing your project priorities"]
        };
      }
    } catch (parseError) {
      console.error("Error parsing Gemini response:", parseError);
      
      // Fallback in case JSON parsing fails
      return {
        summary: text.substring(0, 200) + "...",
        insights: ["AI generated insights are available"],
        suggestions: ["Consider reviewing your project tasks and priorities"]
      };
    }
  } catch (error) {
    console.error('Error generating project summary:', error);
    console.error('Error details:', error.message);
    
    // Return a more informative error message
    if (error.status === 404) {
      throw new Error(`Model not found: ${error.message}. Please check your API key and model name.`);
    } else if (error.status === 403) {
      throw new Error(`Authentication error: ${error.message}. Please check your API key.`);
    } else {
      throw error;
    }
  }
};

// Send a message to the Gemini chat model with project context
export const sendMessageToGemini = async (chat, message, project, tasks) => {
  try {
    console.log("Sending message to Gemini for project:", project.title);
    console.log("User message:", message);
    
    // Prepare project data for context
    const completedTasks = tasks.filter(task => task.is_completed);
    const pendingTasks = tasks.filter(task => !task.is_completed);
    
    // Add project context to the user's message
    const contextualizedMessage = `
    User's question: "${message}"
    
    Context about the project "${project.title}":
    - Project Description: ${project.description || "No description provided"}
    - Total Tasks: ${tasks.length}
    - Completed Tasks: ${completedTasks.length} (${tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}% completion rate)
    - Pending Tasks: ${pendingTasks.length}
    
    Pending Tasks:
    ${pendingTasks.map(task => `
    - Task: ${task.task_name}
      Priority: ${task.priority || 'Not set'}
      Due Date: ${task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
    `).join('')}
    
    Please answer the user's question based on this project information. Be helpful, concise, and provide actionable insights.
    `;
    
    console.log("Sending message to chat model...");
    
    // Send the message to the chat model
    const result = await chat.sendMessage(contextualizedMessage);
    const response = result.response;
    const text = response.text();
    
    console.log("Chat response received:", text.substring(0, 200) + "...");
    return text;
  } catch (error) {
    console.error('Error sending message to Gemini:', error);
    console.error('Error details:', error.message);
    
    // Return a more informative error message
    if (error.status === 404) {
      throw new Error(`Model not found: ${error.message}. Please check your API key and model name.`);
    } else if (error.status === 403) {
      throw new Error(`Authentication error: ${error.message}. Please check your API key.`);
    } else {
      throw error;
    }
  }
};