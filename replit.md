# Overview

FinanceAI is a balance sheet analysis application that combines AI-powered insights with data visualization. Users upload Excel-based balance sheets, and the system provides automated analysis focusing specifically on balance sheet metrics including liquidity ratios, capital structure analysis, asset composition, variance analysis, AI-generated balance sheet insights, and interactive charts. The application uses Azure OpenAI for intelligent balance sheet analysis and provides a modern dashboard interface for viewing results.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React with TypeScript**: Single-page application using functional components and hooks
- **Vite Build System**: Development server with hot module replacement and optimized production builds
- **Shadcn/UI Components**: Modern component library with Radix UI primitives and Tailwind CSS styling
- **TanStack React Query**: State management for server data with automatic caching, background updates, and error handling
- **Wouter Router**: Lightweight client-side routing solution
- **Chart.js Integration**: Canvas-based charts for financial data visualization
- **File Upload Interface**: Drag-and-drop Excel file upload with real-time progress tracking

## Backend Architecture
- **Express.js Server**: RESTful API with middleware for file uploads, logging, and error handling
- **Multer File Processing**: Handles Excel file uploads with size limits and type validation
- **Excel Parsing Service**: Uses xlsx library to extract and validate financial data from spreadsheets
- **Azure OpenAI Integration**: GPT-5 model for financial statement analysis and insight generation
- **Memory Storage Layer**: In-memory data store with interface design for future database migration
- **Vite Development Integration**: Seamless development experience with HMR and static file serving

## Data Processing Pipeline
- **Multi-step Analysis Workflow**: Upload → Parse → Validate → AI Analysis → Generate Insights
- **Financial Data Validation**: Ensures data integrity and identifies statement types automatically
- **Real-time Progress Tracking**: WebSocket-style polling for analysis status updates
- **Structured Output Generation**: Converts AI responses into standardized financial metrics and insights

## AI Analysis Engine
- **Azure OpenAI Service**: Uses latest GPT-5 model with custom financial analysis prompts
- **Dynamic Analysis Depth**: Three levels of analysis (basic, detailed, executive) with different prompt strategies
- **Financial Ratio Calculations**: Automated computation of key financial ratios and metrics
- **Variance Analysis**: Period-over-period comparison with severity classification
- **Insight Generation**: AI-powered recommendations with categorized insights (positive, warning, info)

# External Dependencies

## Core Infrastructure
- **Azure OpenAI**: Primary AI service for financial analysis using GPT-5 model
- **Neon Database**: PostgreSQL database configured via Drizzle ORM (though currently using memory storage)
- **Vite Development Platform**: Build tooling and development server
- **Replit Integration**: Development environment with custom error handling and cartographer plugins

## Data Processing
- **XLSX Library**: Excel file parsing and data extraction
- **Drizzle ORM**: Database schema definition and query builder for PostgreSQL
- **Multer**: Multipart form data and file upload handling
- **Zod Validation**: Runtime type checking and schema validation

## UI and Visualization
- **Shadcn/UI Component System**: Complete UI component library with Radix UI primitives
- **Tailwind CSS**: Utility-first styling framework with custom design tokens
- **Chart.js**: Interactive financial charts and data visualization
- **React Hook Form**: Form validation and management with Zod resolvers
- **React Dropzone**: Drag-and-drop file upload interface

## Development Tools
- **TypeScript**: Static type checking across frontend and backend
- **ESBuild**: Fast bundling for production server builds
- **PostCSS with Autoprefixer**: CSS processing and vendor prefixing
- **Font Awesome**: Icon library for UI elements