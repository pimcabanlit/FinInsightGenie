import { Card, CardContent } from "@/components/ui/card";

interface AiInsightsProps {
  insights: any[];
}

export default function AiInsights({ insights }: AiInsightsProps) {
  if (!insights || insights.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <i className="fas fa-robot text-primary"></i>
            <h3 className="text-lg font-semibold text-foreground">AI-Generated Insights</h3>
            <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">Azure OpenAI</span>
          </div>
          <div className="text-center py-8">
            <i className="fas fa-brain text-4xl text-muted-foreground mb-4"></i>
            <p className="text-muted-foreground">No insights available yet. Complete the analysis to see AI-generated insights.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getInsightStyle = (type: string) => {
    switch (type) {
      case 'positive':
        return 'bg-accent/5 border-accent';
      case 'warning':
        return 'bg-yellow-50 border-yellow-400';
      case 'info':
      default:
        return 'bg-muted/30 border-primary';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive':
        return 'fas fa-check-circle text-accent';
      case 'warning':
        return 'fas fa-exclamation-triangle text-yellow-600';
      case 'info':
      default:
        return 'fas fa-info-circle text-primary';
    }
  };

  const getInsightTextColor = (type: string) => {
    switch (type) {
      case 'positive':
        return 'text-accent';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
      default:
        return 'text-primary';
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <i className="fas fa-robot text-primary"></i>
          <h3 className="text-lg font-semibold text-foreground">AI-Generated Insights</h3>
          <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">Azure OpenAI</span>
        </div>
        
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div 
              key={index} 
              className={`border-l-4 p-4 rounded-r-md ${getInsightStyle(insight.type)}`}
              data-testid={`insight-${index}`}
            >
              <h4 className={`font-medium mb-2 ${getInsightTextColor(insight.type)}`}>
                <i className={`${getInsightIcon(insight.type)} mr-2`}></i>
                {insight.title}
              </h4>
              <p className={`text-sm ${insight.type === 'warning' ? 'text-yellow-800' : 'text-foreground'}`}>
                {insight.description}
              </p>
              {insight.severity && (
                <span className={`
                  inline-block mt-2 px-2 py-1 rounded text-xs font-medium
                  ${insight.severity === 'high' ? 'bg-destructive/10 text-destructive' :
                    insight.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-muted text-muted-foreground'}
                `}>
                  {insight.severity.toUpperCase()} PRIORITY
                </span>
              )}
            </div>
          ))}

          {/* Recommendations section */}
          <div className="pt-4 border-t border-border">
            <h4 className="font-medium text-foreground mb-2">Key Recommendations</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Monitor cost structure to address margin pressure</li>
              <li>• Consider supply chain optimization initiatives</li>
              <li>• Leverage strong cash position for strategic investments</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
