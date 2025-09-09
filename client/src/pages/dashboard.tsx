import { useState } from "react";
import FileUpload from "@/components/file-upload";
import AnalysisProgress from "@/components/analysis-progress";
import MetricsOverview from "@/components/metrics-overview";
import AiInsights from "@/components/ai-insights";
import BalanceSheetChart from "@/components/charts/balance-sheet-chart";
import FinancialRatios from "@/components/financial-ratios";
import VarianceAnalysis from "@/components/variance-analysis";
import ExportPanel from "@/components/export-panel";
import { useQuery } from "@tanstack/react-query";

interface Analysis {
  id: string;
  status: 'processing' | 'completed' | 'failed';
  filename: string;
  fileSize: number;
  statementType: string | null;
  insights?: any[];
  chartData?: {
    balanceSheetChart?: any;
  };
  ratios?: any;
  variances?: any[];
  metrics?: any;
}

interface DashboardProps {}

export default function Dashboard({}: DashboardProps) {
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null);

  const { data: analysis, isLoading } = useQuery<Analysis>({
    queryKey: ['/api/analysis', currentAnalysisId],
    enabled: !!currentAnalysisId,
    refetchInterval: (query) => {
      // Stop polling when analysis is complete or failed
      return query.state.data?.status === 'processing' ? 2000 : false;
    },
  });

  const handleAnalysisStarted = (analysisId: string) => {
    setCurrentAnalysisId(analysisId);
  };

  const showResults = analysis?.status === 'completed';

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <i className="fas fa-chart-line text-primary text-2xl"></i>
                <h1 className="text-2xl font-bold text-foreground">FinanceAI</h1>
              </div>
              <span className="text-sm text-muted-foreground bg-secondary px-2 py-1 rounded-full">Beta</span>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-foreground hover:text-primary transition-colors">Dashboard</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">History</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Settings</a>
            </nav>
            <div className="flex items-center space-x-3">
              <button className="p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors">
                <i className="fas fa-bell"></i>
              </button>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground text-sm font-medium">JD</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <FileUpload onAnalysisStarted={handleAnalysisStarted} />
          </div>
          <div className="lg:col-span-1">
            <AnalysisProgress analysisId={currentAnalysisId} />
          </div>
        </div>

        {/* Results Dashboard */}
        {showResults && (
          <div className="space-y-8">
            <MetricsOverview analysis={analysis} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <AiInsights insights={analysis.insights || []} />
              <BalanceSheetChart chartData={analysis.chartData?.balanceSheetChart} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <FinancialRatios ratios={analysis.ratios} />
              <VarianceAnalysis variances={analysis.variances} />
            </div>

            <ExportPanel analysisId={analysis.id} />
          </div>
        )}
      </div>
    </div>
  );
}
