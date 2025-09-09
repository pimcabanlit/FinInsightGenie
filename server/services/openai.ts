import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}`,
  defaultQuery: { 'api-version': '2024-10-21' },
  defaultHeaders: {
    'api-key': process.env.AZURE_OPENAI_API_KEY,
  },
});

export interface FinancialInsight {
  type: 'positive' | 'warning' | 'info';
  title: string;
  description: string;
  severity?: 'low' | 'medium' | 'high';
}

export interface AnalysisResult {
  statementType: 'balance_sheet' | 'income_statement';
  insights: FinancialInsight[];
  recommendations: string[];
  keyMetrics: Record<string, any>;
  variances: Array<{
    item: string;
    change: number;
    type: 'revenue' | 'expense' | 'asset' | 'liability';
    severity: 'low' | 'medium' | 'high';
  }>;
}

export async function analyzeFinancialData(
  data: any[],
  analysisDepth: string
): Promise<AnalysisResult> {
  try {
    const prompt = createAnalysisPrompt(data, analysisDepth);
    
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a senior financial analyst with expertise in financial statement analysis. Analyze the provided financial data and generate insights in JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 2000,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return validateAnalysisResult(result);
  } catch (error) {
    console.error('OpenAI analysis error:', error);
    throw new Error(`Failed to analyze financial data: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function createAnalysisPrompt(data: any[], analysisDepth: string): string {
  const dataString = JSON.stringify(data, null, 2);
  
  const depthInstructions = {
    basic: "Focus on key metrics, major trends, and significant variances (>10%). Provide 2-3 main insights.",
    detailed: "Provide comprehensive analysis including ratios, horizontal/vertical analysis, trend analysis, and detailed variance explanation. Include 4-6 insights.",
    executive: "Create a high-level executive summary focusing on strategic implications, key risks, and opportunities. Provide 2-4 strategic insights."
  };

  return `
Analyze this financial statement data and provide insights based on ${analysisDepth} analysis depth.

Financial Data:
${dataString}

Analysis Requirements:
1. Determine if this is a Balance Sheet or Income Statement
2. ${depthInstructions[analysisDepth as keyof typeof depthInstructions]}
3. Identify variances exceeding 10% threshold
4. Calculate relevant financial ratios where possible
5. Provide actionable recommendations

Return analysis in this JSON format:
{
  "statementType": "balance_sheet" | "income_statement",
  "insights": [
    {
      "type": "positive" | "warning" | "info",
      "title": "Insight Title",
      "description": "Detailed explanation",
      "severity": "low" | "medium" | "high"
    }
  ],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "keyMetrics": {
    "totalRevenue": number,
    "netIncome": number,
    "totalAssets": number,
    "currentRatio": number,
    "debtToEquity": number,
    "grossMargin": number,
    "netMargin": number
  },
  "variances": [
    {
      "item": "Line item name",
      "change": percentage_change,
      "type": "revenue" | "expense" | "asset" | "liability",
      "severity": "low" | "medium" | "high"
    }
  ]
}
`;
}

function validateAnalysisResult(result: any): AnalysisResult {
  // Provide default structure if AI response is incomplete
  return {
    statementType: result.statementType || 'income_statement',
    insights: result.insights || [],
    recommendations: result.recommendations || [],
    keyMetrics: result.keyMetrics || {},
    variances: result.variances || []
  };
}

export async function detectStatementType(data: any[]): Promise<'balance_sheet' | 'income_statement'> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a financial analyst. Determine if the provided data represents a Balance Sheet or Income Statement."
        },
        {
          role: "user",
          content: `Analyze this financial data and determine the statement type. Look for characteristic line items like Assets/Liabilities/Equity for Balance Sheet or Revenue/Expenses for Income Statement.

Data: ${JSON.stringify(data.slice(0, 20))}

Respond with JSON: {"statementType": "balance_sheet" | "income_statement", "confidence": number}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 100,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result.statementType || 'income_statement';
  } catch (error) {
    console.error('Statement type detection error:', error);
    return 'income_statement'; // Default fallback
  }
}
