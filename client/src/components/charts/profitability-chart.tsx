import { useEffect, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import Chart from 'chart.js/auto';

interface ProfitabilityChartProps {
  chartData?: any;
}

export default function ProfitabilityChart({ chartData }: ProfitabilityChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const data = chartData?.data || [67.8, 23.4, 14.2];
    const labels = ['Gross Margin', 'Operating Margin', 'Net Margin'];

    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: [
            'hsl(212 95% 55%)',
            'hsl(142 76% 36%)',
            'hsl(38 92% 50%)'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [chartData]);

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Profitability Analysis</h3>
        <div className="chart-container relative h-[300px] w-full">
          <canvas ref={chartRef} data-testid="profitability-chart"></canvas>
        </div>
      </CardContent>
    </Card>
  );
}
