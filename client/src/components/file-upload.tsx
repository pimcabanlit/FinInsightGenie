import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface FileUploadProps {
  onAnalysisStarted: (analysisId: string) => void;
}

export default function FileUpload({ onAnalysisStarted }: FileUploadProps) {
  const [selectedDepth, setSelectedDepth] = useState<'basic' | 'detailed' | 'executive'>('basic');
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    await handleFileUpload(file);
  }, [selectedDepth]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('analysisDepth', selectedDepth);

      const response = await apiRequest('POST', '/api/analysis/upload', formData);
      const result = await response.json();

      toast({
        title: "File uploaded successfully",
        description: "Analysis has started. Please wait for results.",
      });

      onAnalysisStarted(result.analysisId);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Upload Financial Statement</h2>
        
        {/* File Upload Area */}
        <div 
          {...getRootProps()} 
          className={`
            upload-dropzone rounded-lg p-8 text-center mb-6 cursor-pointer transition-all
            ${isDragActive ? 'border-primary bg-muted' : 'border-2 border-dashed border-border'}
            ${isUploading ? 'opacity-50 pointer-events-none' : ''}
          `}
          data-testid="file-upload-zone"
        >
          <input {...getInputProps()} data-testid="file-input" />
          <div className="flex flex-col items-center space-y-4">
            <i className="fas fa-file-excel text-4xl text-muted-foreground"></i>
            <div>
              <p className="text-lg font-medium text-foreground">
                {isDragActive ? 'Drop your Excel file here' : 'Drop your Excel file here'}
              </p>
              <p className="text-sm text-muted-foreground">or click to browse (.xlsx, .xls)</p>
            </div>
            <Button 
              type="button" 
              disabled={isUploading}
              data-testid="button-choose-file"
            >
              {isUploading ? 'Uploading...' : 'Choose File'}
            </Button>
            <div className="text-xs text-muted-foreground">
              <p>Supported: Balance Sheet, Income Statement</p>
              <p>Max file size: 10MB</p>
            </div>
          </div>
        </div>

        {/* Analysis Depth Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-3">Analysis Depth</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { value: 'basic', icon: 'fas fa-tachometer-alt', title: 'Basic Analysis', desc: 'Key metrics & trends' },
              { value: 'detailed', icon: 'fas fa-microscope', title: 'Detailed Analysis', desc: 'Comprehensive ratios' },
              { value: 'executive', icon: 'fas fa-presentation', title: 'Executive Summary', desc: 'High-level insights' }
            ].map((option) => (
              <label key={option.value} className="relative cursor-pointer">
                <input 
                  type="radio" 
                  name="depth" 
                  value={option.value}
                  checked={selectedDepth === option.value}
                  onChange={(e) => setSelectedDepth(e.target.value as any)}
                  className="sr-only"
                  data-testid={`radio-${option.value}`}
                />
                <div className={`
                  border-2 rounded-lg p-4 text-center transition-colors
                  ${selectedDepth === option.value 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                  }
                `}>
                  <i className={`${option.icon} text-lg mb-2 ${
                    selectedDepth === option.value ? 'text-primary' : 'text-muted-foreground'
                  }`}></i>
                  <p className={`font-medium ${
                    selectedDepth === option.value ? 'text-primary' : 'text-foreground'
                  }`}>{option.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{option.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button 
            className="flex-1" 
            disabled={isUploading}
            onClick={() => (document.querySelector('[data-testid="file-input"]') as HTMLInputElement)?.click()}
            data-testid="button-start-analysis"
          >
            <i className="fas fa-play mr-2"></i>
            {isUploading ? 'Processing...' : 'Start Analysis'}
          </Button>
          <Button variant="outline" className="px-6" data-testid="button-history">
            <i className="fas fa-history"></i>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
