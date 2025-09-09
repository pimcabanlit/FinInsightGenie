import { Card, CardContent } from "@/components/ui/card";

interface FinancialRatiosProps {
  ratios?: any;
}

export default function FinancialRatios({ ratios }: FinancialRatiosProps) {
  const defaultRatios = {
    currentRatio: 2.34,
    debtToEquity: 0.43,
    roa: 8.7,
    roe: 15.2,
    assetTurnover: 1.28
  };

  const displayRatios = ratios || defaultRatios;

  const ratioItems = [
    { label: 'Current Ratio', value: displayRatios.currentRatio, format: 'decimal' },
    { label: 'Debt-to-Equity', value: displayRatios.debtToEquity, format: 'decimal' },
    { label: 'ROA', value: displayRatios.roa, format: 'percentage' },
    { label: 'ROE', value: displayRatios.roe, format: 'percentage' },
    { label: 'Asset Turnover', value: displayRatios.assetTurnover, format: 'decimal' }
  ];

  const formatValue = (value: number, format: string) => {
    if (format === 'percentage') {
      return `${value.toFixed(1)}%`;
    }
    return value.toFixed(2);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Financial Ratios</h3>
        <div className="space-y-4">
          {ratioItems.map((item, index) => (
            <div key={index} className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
              <span className="text-sm text-muted-foreground">{item.label}</span>
              <span 
                className="text-sm font-medium text-foreground"
                data-testid={`ratio-${item.label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              >
                {formatValue(item.value, item.format)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
