import { useEffect } from 'react';
import { useAIStore } from '../../stores/aiStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import { RefreshCw, Lightbulb, Sparkles } from 'lucide-react';

export const AISummary = ({ projectId }) => {
  const { summary, insights, suggestions, isLoading, error, fetchSummary } = useAIStore();
  
  useEffect(() => {
    if (projectId) {
      fetchSummary(projectId);
    }
  }, [projectId, fetchSummary]);
  
  const handleRefresh = () => {
    fetchSummary(projectId);
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-purple-500" />
            AI Project Summary
          </CardTitle>
          <CardDescription>
            AI-generated insights about your project
          </CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      
      <CardContent>
        {error ? (
          <div className="text-red-500 mb-4">
            Error: {error}
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="mb-4">
              <h3 className="font-medium mb-2">Summary</h3>
              <p className="text-muted-foreground">{summary}</p>
            </div>
            
            {insights && insights.length > 0 && (
              <>
                <Separator className="my-4" />
                <div className="mb-4">
                  <h3 className="font-medium mb-2 flex items-center">
                    <Lightbulb className="h-4 w-4 mr-2 text-amber-500" />
                    Insights
                  </h3>
                  <ul className="space-y-2">
                    {insights.map((insight, index) => (
                      <li key={index} className="text-muted-foreground">
                        • {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
            
            {suggestions && suggestions.length > 0 && (
              <>
                <Separator className="my-4" />
                <div>
                  <h3 className="font-medium mb-2 flex items-center">
                    <Sparkles className="h-4 w-4 mr-2 text-blue-500" />
                    Suggestions
                  </h3>
                  <ul className="space-y-2">
                    {suggestions.map((suggestion, index) => (
                      <li key={index} className="text-muted-foreground">
                        • {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};