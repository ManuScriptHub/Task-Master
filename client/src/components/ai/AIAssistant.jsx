import { useState, useEffect, memo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { AISummary as OriginalAISummary } from './AISummary';
import { AIChat } from './AIChat';
import { Bot, BarChart } from 'lucide-react';
import { useAIStore } from '../../stores/aiStore';

// Memoize the AISummary component to prevent unnecessary re-renders
const AISummary = memo(OriginalAISummary);

export const AIAssistant = ({ projectId }) => {
  const [activeTab, setActiveTab] = useState('summary');
  const { clearChat } = useAIStore();
  
  // Clear chat history when component mounts
  useEffect(() => {
    clearChat(projectId);
  }, [projectId, clearChat]);
  
  return (
    <div className="w-full">
      <Tabs 
        defaultValue="summary" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="summary" className="flex items-center">
            <BarChart className="h-4 w-4 mr-2" />
            Summary
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center">
            <Bot className="h-4 w-4 mr-2" />
            Chat Assistant
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary" className="mt-4">
          <AISummary projectId={projectId} />
        </TabsContent>
        
        <TabsContent value="chat" className="mt-4">
          <AIChat projectId={projectId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};