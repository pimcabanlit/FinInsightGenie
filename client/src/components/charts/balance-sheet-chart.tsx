import { useEffect, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import Chart from 'chart.js/auto';

interface BalanceSheetChartProps {
  chartData?: any;
}

export default function BalanceSheetChart({ chartData }: BalanceSheetChartProps) {
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
      type: 'bar',
      data: {
        labels: chartData.labels || ['Assets', 'Liabilities', 'Equity'],
        datasets: [{
          label: 'Current Period',
          data: chartData.datasets?.[0]?.data || [5200000, 2800000, 2400000],
          backgroundColor: [
            'hsl(212 95% 55%)',  // Assets - Blue
            'hsl(0 84% 60%)',     // Liabilities - Red  
            'hsl(142 76% 36%)'    // Equity - Green
          ],
          borderColor: [
            'hsl(212 95% 45%)',
            'hsl(0 84% 50%)', 
            'hsl(142 76% 26%)'
          ],
          borderWidth: 2
        }, {
          label: 'Previous Period',
          data: chartData.datasets?.[1]?.data || [4900000, 2600000, 2300000],
          backgroundColor: [
            'hsla(212 95% 55% / 0.5)',
            'hsla(0 84% 60% / 0.5)',
            'hsla(142 76% 36% / 0.5)'
          ],
          borderColor: [
            'hsl(212 95% 45%)',
            'hsl(0 84% 50%)',
            'hsl(142 76% 26%)'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'hsl(214 32% 91%)'
            },
            ticks: {
              callback: function(value) {
                return '$' + (Number(value) / 1000000).toFixed(1) + 'M';
              }
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
        <h3 className="text-lg font-semibold text-foreground mb-4">Balance Sheet Composition</h3>
        <div className="chart-container relative h-[300px] w-full">
          <canvas ref={chartRef} data-testid="balance-sheet-chart"></canvas>
        </div>
        <div className="mt-4 flex items-center justify-center text-sm">
          <span className="text-muted-foreground">Assets = Liabilities + Equity</span>
        </div>
      </CardContent>
    </Card>
  );
}