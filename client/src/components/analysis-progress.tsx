import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

interface ProgressData {
  id: string;
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  currentStep?: string;
}

interface Analysis {
  id: string;
  filename: string;
  fileSize: number;
  statementType: string | null;
  status: 'processing' | 'completed' | 'failed';
}

interface AnalysisProgressProps {
  analysisId: string | null;
}

export default function AnalysisProgress({ analysisId }: AnalysisProgressProps) {
  const { data: progress } = useQuery<ProgressData>({
    queryKey: ['/api/analysis', analysisId, 'progress'],
    enabled: !!analysisId,
    refetchInterval: (data) => {
      return data?.status === 'processing' ? 1000 : false;
    },
  });

  const { data: analysis } = useQuery<Analysis>({
    queryKey: ['/api/analysis', analysisId],
    enabled: !!analysisId,
  });

  const steps = [
    { id: 'upload', label: 'File uploaded', icon: 'fas fa-check' },
    { id: 'processing', label: 'Processing data...', icon: 'fas fa-spinner fa-spin' },
    { id: 'analysis', label: 'AI analysis', icon: 'fas fa-robot' },
    { id: 'insights', label: 'Generate insights', icon: 'fas fa-lightbulb' }
  ];

  const getStepStatus = (stepIndex: number) => {
    if (!progress) return 'pending';
    
    if (progress.status === 'failed') return 'failed';
    if (progress.status === 'completed') return 'completed';
    
    const progressPercentage = progress.progress || 0;
    if (progressPercentage > stepIndex * 25) return 'completed';
    if (progressPercentage > (stepIndex - 1) * 25) return 'active';
    return 'pending';
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Analysis Status</h3>
        
        {/* Progress Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const status = getStepStatus(index);
            return (
              <div key={step.id} className="flex items-center space-x-3" data-testid={`step-${step.id}`}>
                <div className={`
                  w-6 h-6 rounded-full flex items-center justify-center
                  ${status === 'completed' ? 'bg-accent' : 
                    status === 'active' ? 'bg-primary animate-pulse' : 
                    status === 'failed' ? 'bg-destructive' : 'bg-muted'}
                `}>
                  {status === 'completed' ? (
                    <i className="fas fa-check text-accent-foreground text-xs"></i>
                  ) : status === 'active' ? (
                    <i className="fas fa-spinner fa-spin text-primary-foreground text-xs"></i>
                  ) : status === 'failed' ? (
                    <i className="fas fa-times text-destructive-foreground text-xs"></i>
                  ) : (
                    <span className="text-muted-foreground text-xs">{index + 1}</span>
                  )}
                </div>
                <span className={`text-sm font-medium ${
                  status === 'active' ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        {progress && (
          <div className="mt-6">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Progress</span>
              <span data-testid="progress-percentage">{progress.progress}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div 
                className="progress-bar bg-primary h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progress.progress}%` }}
                data-testid="progress-bar"
              ></div>
            </div>
          </div>
        )}

        {/* File Info */}
        {analysis && (
          <div className="mt-6 pt-6 border-t border-border">
            <h4 className="text-sm font-medium text-foreground mb-3">Current File</h4>
            <div className="flex items-center space-x-3">
              <i className="fas fa-file-excel text-accent text-lg"></i>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate" data-testid="file-name">
                  {analysis.filename}
                </p>
                <p className="text-xs text-muted-foreground" data-testid="file-info">
                  {(analysis.fileSize / 1024 / 1024).toFixed(1)} MB • {analysis.statementType || 'Processing...'}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
