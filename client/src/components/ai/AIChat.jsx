import { useState } from 'react';
import { useAIStore } from '../../stores/aiStore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Send, Bot, User, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export const AIChat = ({ projectId }) => {
  const { chatHistory, isLoading, error, sendMessage, clearChat } = useAIStore();
  const [message, setMessage] = useState('');
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;
    
    const userMessage = message;
    setMessage('');
    await sendMessage(projectId, userMessage);
  };
  
  const handleClearChat = () => {
    clearChat(projectId);
  };
  
  // Suggested questions to help users get started
  const suggestedQuestions = [
    "What are my overdue tasks?",
    "Show me my high priority tasks",
    "What's my project progress?",
    "What should I work on next?"
  ];
  
  const handleSuggestedQuestion = (question) => {
    sendMessage(projectId, question);
  };
  
  return (
    <Card className="w-full flex flex-col h-[500px]">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl flex items-center">
            <Bot className="h-5 w-5 mr-2 text-blue-500" />
            Project Assistant
          </CardTitle>
          <CardDescription>
            Ask questions about your tasks and get AI assistance
          </CardDescription>
        </div>
        {chatHistory.length > 0 && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleClearChat}
            title="Clear chat history"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="flex-grow overflow-hidden p-0">
        <ScrollArea className="h-[350px] px-4">
          {chatHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <Bot className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-medium text-lg mb-2">How can I help you today?</h3>
              <p className="text-muted-foreground mb-6">
                Ask me about your tasks, project progress, or what to work on next.
              </p>
              
              <div className="grid grid-cols-1 gap-2 w-full max-w-md">
                {suggestedQuestions.map((question, index) => (
                  <Button 
                    key={index} 
                    variant="outline" 
                    className="justify-start text-left"
                    onClick={() => handleSuggestedQuestion(question)}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-4 space-y-4">
              {chatHistory.map((msg, index) => (
                <div 
                  key={index} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`flex max-w-[80%] ${
                      msg.role === 'user' 
                        ? 'bg-primary text-primary-foreground ml-auto' 
                        : 'bg-muted'
                    } rounded-lg px-4 py-2`}
                  >
                    <div className="mr-2 mt-1">
                      {msg.role === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                    <div className="markdown-content">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-4 py-2 flex items-center">
                    <Bot className="h-4 w-4 mr-2" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              {error && (
                <div className="flex justify-start">
                  <div className="bg-destructive/10 text-destructive rounded-lg px-4 py-2">
                    Error: {error}
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>
      
      <Separator />
      
      <CardFooter className="pt-4">
        <form onSubmit={handleSendMessage} className="flex w-full gap-2">
          <Input
            placeholder="Ask a question about your project..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isLoading}
            className="flex-grow"
          />
          <Button 
            type="submit" 
            disabled={!message.trim() || isLoading}
          >
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};