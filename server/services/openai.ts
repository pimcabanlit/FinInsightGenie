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
  
  if (analysisDepth === 'basic') {
    return `
You are performing a BASIC ANALYSIS for a finance team. Keep this simple and focused on the most important numbers.

Financial Data:
${dataString}

BASIC ANALYSIS REQUIREMENTS:
1. Determine if this is a Balance Sheet or Income Statement
2. Focus ONLY on the 3 most important financial metrics
3. Identify ONLY variances above 15% (not 10%)
4. Provide exactly 2 main insights - keep them simple and actionable
5. Give 2 basic recommendations that non-financial managers can understand

Return this JSON format:
{
  "statementType": "balance_sheet" | "income_statement",
  "insights": [
    {
      "type": "positive" | "warning" | "info",
      "title": "Simple insight title (max 6 words)",
      "description": "Plain language explanation (max 50 words)",
      "severity": "low" | "medium" | "high"
    }
  ],
  "recommendations": ["Simple action 1", "Simple action 2"],
  "keyMetrics": {
    "totalRevenue": number_or_null,
    "netIncome": number_or_null,
    "totalAssets": number_or_null
  },
  "variances": [
    {
      "item": "Line item name",
      "change": percentage_change,
      "type": "revenue" | "expense" | "asset" | "liability",
      "severity": "medium" | "high"
    }
  ]
}
`;
  } else if (analysisDepth === 'detailed') {
    return `
You are performing a DETAILED ANALYSIS for experienced finance professionals. Include comprehensive technical analysis.

Financial Data:
${dataString}

DETAILED ANALYSIS REQUIREMENTS:
1. Determine if this is a Balance Sheet or Income Statement
2. Calculate and analyze ALL relevant financial ratios (current ratio, debt-to-equity, ROA, ROE, gross margin, net margin, asset turnover)
3. Perform horizontal analysis (period-over-period changes)
4. Perform vertical analysis (components as % of total)
5. Identify variances above 5% threshold
6. Provide exactly 5-6 technical insights with detailed explanations
7. Include trend analysis and ratio benchmarking
8. Give 4-5 specific technical recommendations

Return this JSON format:
{
  "statementType": "balance_sheet" | "income_statement",
  "insights": [
    {
      "type": "positive" | "warning" | "info", 
      "title": "Technical insight title",
      "description": "Detailed technical explanation with specific numbers and ratios (100-150 words)",
      "severity": "low" | "medium" | "high"
    }
  ],
  "recommendations": ["Technical recommendation 1", "Technical recommendation 2", "Technical recommendation 3", "Technical recommendation 4"],
  "keyMetrics": {
    "totalRevenue": number_or_null,
    "netIncome": number_or_null,
    "totalAssets": number_or_null,
    "currentRatio": number_or_null,
    "debtToEquity": number_or_null,
    "grossMargin": number_or_null,
    "netMargin": number_or_null,
    "roa": number_or_null,
    "roe": number_or_null,
    "assetTurnover": number_or_null
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
  } else { // executive
    return `
You are preparing an EXECUTIVE SUMMARY for C-level executives and board members. Focus on strategic business implications.

Financial Data:
${dataString}

EXECUTIVE SUMMARY REQUIREMENTS:
1. Determine if this is a Balance Sheet or Income Statement
2. Focus on strategic business performance and competitive positioning
3. Identify key business risks and opportunities 
4. Analyze cash flow implications and capital allocation efficiency
5. Provide exactly 3 strategic insights focused on business direction
6. Include market context and industry implications where relevant
7. Give 3 board-level strategic recommendations

Return this JSON format:
{
  "statementType": "balance_sheet" | "income_statement",
  "insights": [
    {
      "type": "positive" | "warning" | "info",
      "title": "Strategic insight title",
      "description": "Business strategy focused explanation discussing market position, competitive advantage, or strategic risk (75-100 words)",
      "severity": "low" | "medium" | "high"
    }
  ],
  "recommendations": ["Strategic recommendation 1", "Strategic recommendation 2", "Strategic recommendation 3"], 
  "keyMetrics": {
    "totalRevenue": number_or_null,
    "netIncome": number_or_null,
    "totalAssets": number_or_null,
    "currentRatio": number_or_null,
    "debtToEquity": number_or_null,
    "grossMargin": number_or_null,
    "netMargin": number_or_null
  },
  "variances": [
    {
      "item": "Line item name", 
      "change": percentage_change,
      "type": "revenue" | "expense" | "asset" | "liability",
      "severity": "medium" | "high"
    }
  ]
}
`;
  }
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
