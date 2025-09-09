import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ExportPanelProps {
  analysisId: string;
}

export default function ExportPanel({ analysisId }: ExportPanelProps) {
  const { toast } = useToast();

  const handleExportPDF = async () => {
    try {
      // TODO: Implement PDF export
      toast({
        title: "Export not available",
        description: "PDF export feature is coming soon.",
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export PDF report.",
        variant: "destructive",
      });
    }
  };

  const handleExportExcel = async () => {
    try {
      // TODO: Implement Excel export
      toast({
        title: "Export not available",
        description: "Excel export feature is coming soon.",
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export Excel file.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Financial Analysis Report',
          text: 'Check out this financial analysis report',
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied",
          description: "Analysis link copied to clipboard.",
        });
      }
    } catch (error) {
      toast({
        title: "Share failed",
        description: "Failed to share analysis.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Export Analysis</h3>
            <p className="text-sm text-muted-foreground">Download your financial analysis report</p>
          </div>
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={handleExportPDF}
              data-testid="button-export-pdf"
            >
              <i className="fas fa-file-pdf mr-2"></i>
              PDF Report
            </Button>
            <Button 
              variant="outline" 
              onClick={handleExportExcel}
              data-testid="button-export-excel"
            >
              <i className="fas fa-file-excel mr-2"></i>
              Excel Export
            </Button>
            <Button 
              onClick={handleShare}
              data-testid="button-share"
            >
              <i className="fas fa-share mr-2"></i>
              Share
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
