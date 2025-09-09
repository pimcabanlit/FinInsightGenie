import { Card, CardContent } from "@/components/ui/card";

interface VarianceAnalysisProps {
  variances?: any[];
}

export default function VarianceAnalysis({ variances }: VarianceAnalysisProps) {
  const defaultVariances = [
    { item: 'COGS', change: 15.3, type: 'expense', severity: 'high' },
    { item: 'Sales', change: 12.5, type: 'revenue', severity: 'medium' },
    { item: 'OpEx', change: 3.1, type: 'expense', severity: 'low' }
  ];

  const displayVariances = variances || defaultVariances;

  const getVarianceIcon = (change: number, severity: string) => {
    if (severity === 'high') return 'fas fa-exclamation-triangle text-destructive';
    if (change > 0 && severity === 'medium') return 'fas fa-check-circle text-accent';
    return 'fas fa-info-circle text-primary';
  };

  const getVarianceColor = (change: number) => {
    if (Math.abs(change) > 10) return 'text-destructive';
    if (change > 0) return 'text-accent';
    return 'text-foreground';
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Variance Analysis</h3>
        <div className="space-y-3">
          {displayVariances.map((variance, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
              data-testid={`variance-${index}`}
            >
              <div className="flex items-center space-x-3">
                <i className={getVarianceIcon(variance.change, variance.severity)}></i>
                <div>
                  <p className="text-sm font-medium text-foreground">{variance.item}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {variance.type} {variance.change > 0 ? 'increase' : 'decrease'}
                  </p>
                </div>
              </div>
              <span className={`text-sm font-bold ${getVarianceColor(variance.change)}`}>
                {variance.change > 0 ? '+' : ''}{variance.change.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
