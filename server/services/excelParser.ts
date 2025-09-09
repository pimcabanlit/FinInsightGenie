import * as XLSX from 'xlsx';

export interface ParsedFinancialData {
  headers: string[];
  rows: any[][];
  metadata: {
    sheetName: string;
    rowCount: number;
    columnCount: number;
    periods: string[];
  };
}

export function parseExcelFile(buffer: Buffer): ParsedFinancialData {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON with header row
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      defval: '',
      raw: false 
    }) as any[][];

    if (jsonData.length === 0) {
      throw new Error('Excel file contains no data');
    }

    // Extract headers (first non-empty row)
    let headerRowIndex = 0;
    let headers: string[] = [];
    
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (row.some(cell => cell && cell.toString().trim())) {
        headers = row.map(cell => cell ? cell.toString().trim() : '');
        headerRowIndex = i;
        break;
      }
    }

    if (headers.length === 0) {
      throw new Error('Could not find valid headers in Excel file');
    }

    // Extract data rows (skip empty rows)
    const dataRows = jsonData
      .slice(headerRowIndex + 1)
      .filter(row => row.some(cell => cell && cell.toString().trim()))
      .map(row => {
        // Ensure row has same length as headers
        const normalizedRow = new Array(headers.length).fill('');
        for (let i = 0; i < Math.min(row.length, headers.length); i++) {
          normalizedRow[i] = row[i] || '';
        }
        return normalizedRow;
      });

    // Detect potential period columns (columns with date-like headers)
    const periods = headers.filter(header => 
      /\d{4}|Q[1-4]|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/i.test(header)
    );

    return {
      headers,
      rows: dataRows,
      metadata: {
        sheetName,
        rowCount: dataRows.length,
        columnCount: headers.length,
        periods
      }
    };
  } catch (error) {
    console.error('Excel parsing error:', error);
    throw new Error(`Failed to parse Excel file: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function validateFinancialData(data: ParsedFinancialData): void {
  const { headers, rows, metadata } = data;

  // Check minimum requirements
  if (headers.length < 2) {
    throw new Error('Excel file must have at least 2 columns (account names and values)');
  }

  if (rows.length < 3) {
    throw new Error('Excel file must have at least 3 data rows');
  }

  // Check for numeric data in value columns
  const hasNumericData = rows.some(row =>
    row.slice(1).some(cell => {
      const cleaned = cell.toString().replace(/[$,()]/g, '');
      return !isNaN(parseFloat(cleaned)) && isFinite(parseFloat(cleaned));
    })
  );

  if (!hasNumericData) {
    throw new Error('Excel file must contain numeric financial data');
  }

  // Check for potential financial statement indicators
  const firstColumn = rows.map(row => row[0]?.toString().toLowerCase() || '');
  const hasFinancialTerms = firstColumn.some(item =>
    /revenue|sales|income|expense|asset|liability|equity|cash|cost|profit|loss/i.test(item)
  );

  if (!hasFinancialTerms) {
    console.warn('Warning: File may not contain recognizable financial statement data');
  }
}

export function convertToFinancialStructure(data: ParsedFinancialData): any[] {
  const { headers, rows } = data;
  
  return rows.map(row => {
    const item: any = {};
    headers.forEach((header, index) => {
      let value = row[index];
      
      // Convert numeric strings to numbers
      if (typeof value === 'string' && index > 0) {
        const cleaned = value.replace(/[$,()]/g, '');
        const numValue = parseFloat(cleaned);
        if (!isNaN(numValue) && isFinite(numValue)) {
          // Handle negative numbers in parentheses
          value = value.includes('(') ? -Math.abs(numValue) : numValue;
        }
      }
      
      item[header] = value;
    });
    return item;
  });
}
