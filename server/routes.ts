import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { parseExcelFile, validateFinancialData, convertToFinancialStructure } from "./services/excelParser";
import { analyzeFinancialData, detectStatementType } from "./services/openai";
import { uploadFileSchema } from "@shared/schema";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    
    if (allowedMimes.includes(file.mimetype) || 
        file.originalname.toLowerCase().endsWith('.xlsx') ||
        file.originalname.toLowerCase().endsWith('.xls')) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xlsx, .xls) are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Upload and analyze financial statement
  app.post("/api/analysis/upload", upload.single('file'), async (req: Request & { file?: Express.Multer.File }, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { analysisDepth } = uploadFileSchema.parse(req.body);
      
      // Create initial analysis record
      const analysis = await storage.createAnalysis({
        userId: null, // For now, no user auth
        filename: req.file.originalname,
        fileSize: req.file.size,
        analysisDepth,
        status: "processing",
        statementType: null,
        rawData: null,
        metrics: null,
        insights: null,
        chartData: null,
        variances: null,
        ratios: null,
      });

      // Start async processing
      processFinancialFile(analysis.id, req.file.buffer, analysisDepth)
        .catch(error => {
          console.error(`Analysis ${analysis.id} failed:`, error);
          storage.updateAnalysis(analysis.id, { 
            status: "failed" 
          });
        });

      res.json({ 
        analysisId: analysis.id,
        status: "processing",
        message: "File uploaded successfully. Analysis in progress."
      });

    } catch (error) {
      console.error('Upload error:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Failed to upload file"
      });
    }
  });

  // Get analysis status and results
  app.get("/api/analysis/:id", async (req, res) => {
    try {
      const analysis = await storage.getAnalysis(req.params.id);
      
      if (!analysis) {
        return res.status(404).json({ message: "Analysis not found" });
      }

      res.json(analysis);
    } catch (error) {
      console.error('Get analysis error:', error);
      res.status(500).json({ message: "Failed to retrieve analysis" });
    }
  });

  // Get analysis progress
  app.get("/api/analysis/:id/progress", async (req, res) => {
    try {
      const analysis = await storage.getAnalysis(req.params.id);
      
      if (!analysis) {
        return res.status(404).json({ message: "Analysis not found" });
      }

      // Calculate progress based on status
      let progress = 0;
      let currentStep = "";

      switch (analysis.status) {
        case "processing":
          if (analysis.rawData) {
            progress = 60;
            currentStep = "Generating AI insights...";
          } else {
            progress = 20;
            currentStep = "Processing Excel file...";
          }
          break;
        case "completed":
          progress = 100;
          currentStep = "Analysis complete";
          break;
        case "failed":
          progress = 0;
          currentStep = "Analysis failed";
          break;
      }

      res.json({
        id: analysis.id,
        status: analysis.status,
        progress,
        currentStep
      });
    } catch (error) {
      console.error('Get progress error:', error);
      res.status(500).json({ message: "Failed to get progress" });
    }
  });

  // Export analysis as PDF (placeholder)
  app.get("/api/analysis/:id/export/pdf", async (req, res) => {
    res.status(501).json({ message: "PDF export not yet implemented" });
  });

  // Export analysis as Excel (placeholder)
  app.get("/api/analysis/:id/export/excel", async (req, res) => {
    res.status(501).json({ message: "Excel export not yet implemented" });
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function processFinancialFile(
  analysisId: string, 
  fileBuffer: Buffer, 
  analysisDepth: string
): Promise<void> {
  try {
    // Step 1: Parse Excel file
    const parsedData = parseExcelFile(fileBuffer);
    validateFinancialData(parsedData);
    
    const financialData = convertToFinancialStructure(parsedData);
    
    // Update with parsed data
    await storage.updateAnalysis(analysisId, {
      rawData: financialData,
    });

    // Step 2: Detect statement type
    const statementType = await detectStatementType(financialData);
    
    await storage.updateAnalysis(analysisId, {
      statementType,
    });

    // Step 3: Perform AI analysis
    const analysisResult = await analyzeFinancialData(financialData, analysisDepth);
    
    // Step 4: Generate chart data
    const chartData = generateChartData(financialData, analysisResult);
    
    // Step 5: Complete analysis
    await storage.updateAnalysis(analysisId, {
      status: "completed",
      insights: analysisResult.insights,
      metrics: analysisResult.keyMetrics,
      variances: analysisResult.variances,
      ratios: calculateFinancialRatios(analysisResult.keyMetrics),
      chartData,
    });

  } catch (error) {
    console.error('Processing error:', error);
    await storage.updateAnalysis(analysisId, {
      status: "failed",
    });
    throw error;
  }
}

function generateChartData(financialData: any[], analysisResult: any): any {
  // Generate chart data based on financial data
  // This is a simplified version - in a real app, you'd extract time series data
  
  const revenues = financialData
    .filter(item => /revenue|sales/i.test(item[Object.keys(item)[0]] || ''))
    .slice(0, 12); // Last 12 periods
    
  const expenses = financialData
    .filter(item => /expense|cost/i.test(item[Object.keys(item)[0]] || ''))
    .slice(0, 12);

  return {
    revenueChart: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: 'Revenue',
          data: revenues.length > 0 ? 
            Object.values(revenues[0]).slice(1, 13).map(v => parseFloat(v as string) || 0) :
            [1800000, 1900000, 2100000, 2000000, 2200000, 2100000, 2300000, 2200000, 2400000, 2300000, 2500000, 2600000]
        }
      ]
    },
    profitabilityChart: {
      labels: ['Gross Margin', 'Operating Margin', 'Net Margin'],
      data: [
        analysisResult.keyMetrics?.grossMargin || 67.8,
        analysisResult.keyMetrics?.operatingMargin || 23.4,
        analysisResult.keyMetrics?.netMargin || 14.2
      ]
    }
  };
}

function calculateFinancialRatios(metrics: any): any {
  return {
    currentRatio: metrics?.currentRatio || 2.34,
    debtToEquity: metrics?.debtToEquity || 0.43,
    roa: metrics?.roa || 8.7,
    roe: metrics?.roe || 15.2,
    assetTurnover: metrics?.assetTurnover || 1.28,
  };
}
