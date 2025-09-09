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
You are performing a BASIC BALANCE SHEET ANALYSIS for a finance team. Focus on balance sheet health and liquidity.

Financial Data:
${dataString}

BASIC BALANCE SHEET ANALYSIS REQUIREMENTS:
1. Determine if this is a Balance Sheet or Income Statement (prioritize balance sheet metrics)
2. Focus on the 3 most important BALANCE SHEET metrics: Current Ratio, Total Assets, and Working Capital
3. Analyze liquidity position and financial stability
4. Identify ONLY balance sheet variances above 15% (assets, liabilities, equity changes)
5. Provide exactly 2 main insights about balance sheet health - keep them simple
6. Give 2 basic recommendations for improving balance sheet position

Return this JSON format:
{
  "statementType": "balance_sheet" | "income_statement",
  "insights": [
    {
      "type": "positive" | "warning" | "info",
      "title": "Balance sheet insight (max 6 words)",
      "description": "Plain language explanation about assets, liabilities, or liquidity (max 50 words)",
      "severity": "low" | "medium" | "high"
    }
  ],
  "recommendations": ["Balance sheet action 1", "Balance sheet action 2"],
  "keyMetrics": {
    "totalAssets": number_or_null,
    "currentRatio": number_or_null,
    "workingCapital": number_or_null,
    "totalLiabilities": number_or_null,
    "totalEquity": number_or_null
  },
  "variances": [
    {
      "item": "Balance sheet line item name",
      "change": percentage_change,
      "type": "asset" | "liability" | "equity",
      "severity": "medium" | "high"
    }
  ]
}
`;
  } else if (analysisDepth === 'detailed') {
    return `
You are performing a DETAILED BALANCE SHEET ANALYSIS for experienced finance professionals. Focus on comprehensive balance sheet health assessment.

Financial Data:
${dataString}

DETAILED BALANCE SHEET ANALYSIS REQUIREMENTS:
1. Determine if this is a Balance Sheet or Income Statement (prioritize balance sheet analysis)
2. Calculate and analyze ALL balance sheet ratios: Current Ratio, Quick Ratio, Cash Ratio, Debt-to-Equity, Debt-to-Assets, Equity Ratio, Asset Turnover, Working Capital Ratio
3. Perform horizontal analysis on balance sheet items (period-over-period asset, liability, equity changes)
4. Perform vertical analysis (each balance sheet component as % of total assets)
5. Identify balance sheet variances above 5% threshold (focus on asset/liability/equity movements)
6. Provide exactly 5-6 technical insights about balance sheet structure and liquidity position
7. Include balance sheet trend analysis and liquidity benchmarking
8. Give 4-5 specific technical recommendations for balance sheet optimization

Return this JSON format:
{
  "statementType": "balance_sheet" | "income_statement",
  "insights": [
    {
      "type": "positive" | "warning" | "info", 
      "title": "Balance sheet technical insight",
      "description": "Detailed explanation of balance sheet ratios, liquidity position, capital structure, or asset composition with specific numbers (100-150 words)",
      "severity": "low" | "medium" | "high"
    }
  ],
  "recommendations": ["Balance sheet technical recommendation 1", "Capital structure recommendation 2", "Liquidity improvement recommendation 3", "Asset optimization recommendation 4"],
  "keyMetrics": {
    "totalAssets": number_or_null,
    "totalLiabilities": number_or_null,
    "totalEquity": number_or_null,
    "currentRatio": number_or_null,
    "quickRatio": number_or_null,
    "debtToEquity": number_or_null,
    "debtToAssets": number_or_null,
    "workingCapital": number_or_null,
    "cashRatio": number_or_null,
    "equityRatio": number_or_null
  },
  "variances": [
    {
      "item": "Balance sheet line item name",
      "change": percentage_change,
      "type": "asset" | "liability" | "equity", 
      "severity": "low" | "medium" | "high"
    }
  ]
}
`;
  } else { // executive
    return `
You are preparing an EXECUTIVE BALANCE SHEET SUMMARY for C-level executives and board members. Focus on strategic balance sheet implications and financial positioning.

Financial Data:
${dataString}

EXECUTIVE BALANCE SHEET SUMMARY REQUIREMENTS:
1. Determine if this is a Balance Sheet or Income Statement (focus on balance sheet strategic position)
2. Focus on strategic balance sheet strength, capital structure, and financial resilience
3. Identify key balance sheet risks and opportunities (liquidity risks, leverage concerns, asset efficiency)
4. Analyze capital allocation strategy and balance sheet optimization opportunities
5. Provide exactly 3 strategic insights focused on balance sheet positioning and competitive advantage
6. Include market context regarding capital structure and industry balance sheet benchmarks
7. Give 3 board-level strategic recommendations for balance sheet management

Return this JSON format:
{
  "statementType": "balance_sheet" | "income_statement",
  "insights": [
    {
      "type": "positive" | "warning" | "info",
      "title": "Strategic balance sheet insight",
      "description": "Strategic explanation of balance sheet position, capital structure efficiency, liquidity strategy, or competitive financial positioning (75-100 words)",
      "severity": "low" | "medium" | "high"
    }
  ],
  "recommendations": ["Strategic balance sheet recommendation 1", "Capital structure strategy 2", "Financial positioning strategy 3"], 
  "keyMetrics": {
    "totalAssets": number_or_null,
    "totalLiabilities": number_or_null,
    "totalEquity": number_or_null,
    "currentRatio": number_or_null,
    "debtToEquity": number_or_null,
    "workingCapital": number_or_null,
    "cashPosition": number_or_null
  },
  "variances": [
    {
      "item": "Strategic balance sheet item", 
      "change": percentage_change,
      "type": "asset" | "liability" | "equity",
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
