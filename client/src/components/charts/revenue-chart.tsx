import { useEffect, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import Chart from 'chart.js/auto';

interface RevenueChartProps {
  chartData?: any;
}

export default function RevenueChart({ chartData }: RevenueChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || !chartData) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartData.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'Revenue',
          data: chartData.datasets?.[0]?.data || [1.8, 1.9, 2.1, 2.0, 2.2, 2.1, 2.3, 2.2, 2.4, 2.3, 2.5, 2.6],
          borderColor: 'hsl(212 95% 55%)',
          backgroundColor: 'hsla(212 95% 55% / 0.1)',
          tension: 0.4,
          fill: true
        }, {
          label: 'Net Income',
          data: [0.25, 0.28, 0.31, 0.29, 0.33, 0.30, 0.35, 0.32, 0.34, 0.33, 0.36, 0.38],
          borderColor: 'hsl(142 76% 36%)',
          backgroundColor: 'hsla(142 76% 36% / 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'hsl(214 32% 91%)'
            }
          },
          x: {
            grid: {
              display: false
            }
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
        <h3 className="text-lg font-semibold text-foreground mb-4">Revenue Trend Analysis</h3>
        <div className="chart-container relative h-[300px] w-full">
          <canvas ref={chartRef} data-testid="revenue-chart"></canvas>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">12-month period</span>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-chart-1 rounded-full mr-2"></div>
              <span className="text-muted-foreground">Revenue</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-chart-2 rounded-full mr-2"></div>
              <span className="text-muted-foreground">Net Income</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
