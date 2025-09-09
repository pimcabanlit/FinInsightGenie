import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, real, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const financialAnalyses = pgTable("financial_analyses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  filename: text("filename").notNull(),
  fileSize: integer("file_size").notNull(),
  analysisDepth: text("analysis_depth").notNull(), // 'basic' | 'detailed' | 'executive'
  statementType: text("statement_type"), // 'balance_sheet' | 'income_statement'
  status: text("status").notNull().default("processing"), // 'processing' | 'completed' | 'failed'
  rawData: jsonb("raw_data"), // Parsed Excel data
  metrics: jsonb("metrics"), // Key financial metrics
  insights: jsonb("insights"), // AI-generated insights
  chartData: jsonb("chart_data"), // Data for visualizations
  variances: jsonb("variances"), // Variance analysis
  ratios: jsonb("ratios"), // Financial ratios
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertAnalysisSchema = createInsertSchema(financialAnalyses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  status: z.string().default("processing"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
export type FinancialAnalysis = typeof financialAnalyses.$inferSelect;

// Zod schemas for API validation
export const uploadFileSchema = z.object({
  analysisDepth: z.enum(['basic', 'detailed', 'executive']),
});

export const analysisProgressSchema = z.object({
  id: z.string(),
  status: z.enum(['processing', 'completed', 'failed']),
  progress: z.number().min(0).max(100),
  currentStep: z.string().optional(),
});
