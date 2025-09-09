import { Card, CardContent } from "@/components/ui/card";

interface MetricsOverviewProps {
  analysis: any;
}

export default function MetricsOverview({ analysis }: MetricsOverviewProps) {
  if (!analysis?.metrics) {
    return null;
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toLocaleString()}`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return 'fas fa-arrow-up';
    if (change < 0) return 'fas fa-arrow-down';
    return 'fas fa-minus';
  };

  const getChangeClass = (change: number) => {
    if (change > 0) return 'bg-accent/10 text-accent';
    if (change < 0) return 'bg-destructive/10 text-destructive';
    return 'bg-muted text-muted-foreground';
  };

  const metrics = [
    {
      label: 'Total Revenue',
      value: analysis.metrics.totalRevenue || 0,
      change: 12.5,
      format: 'currency'
    },
    {
      label: 'Net Income',
      value: analysis.metrics.netIncome || 0,
      change: 8.3,
      format: 'currency'
    },
    {
      label: 'Gross Margin',
      value: analysis.metrics.grossMargin || 0,
      change: -2.1,
      format: 'percentage'
    },
    {
      label: 'Total Assets',
      value: analysis.metrics.totalAssets || 0,
      change: 5.4,
      format: 'currency'
    }
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Key Financial Metrics</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Period:</span>
            <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-sm font-medium">
              Current vs Previous
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <div key={index} className="metric-card bg-muted/50 rounded-lg p-4 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <p className="text-2xl font-bold text-foreground" data-testid={`metric-${metric.label.toLowerCase().replace(/\s+/g, '-')}`}>
                    {metric.format === 'currency' 
                      ? formatCurrency(metric.value)
                      : formatPercentage(metric.value)
                    }
                  </p>
                </div>
                <div className="text-right">
                  <span className={`
                    inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                    ${getChangeClass(metric.change)}
                  `}>
                    <i className={`${getChangeIcon(metric.change)} mr-1`}></i>
                    {Math.abs(metric.change).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
