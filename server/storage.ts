import { type User, type InsertUser, type FinancialAnalysis, type InsertAnalysis } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createAnalysis(analysis: InsertAnalysis): Promise<FinancialAnalysis>;
  getAnalysis(id: string): Promise<FinancialAnalysis | undefined>;
  updateAnalysis(id: string, updates: Partial<FinancialAnalysis>): Promise<FinancialAnalysis | undefined>;
  getUserAnalyses(userId: string): Promise<FinancialAnalysis[]>;
  deleteAnalysis(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private analyses: Map<string, FinancialAnalysis>;

  constructor() {
    this.users = new Map();
    this.analyses = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createAnalysis(insertAnalysis: InsertAnalysis): Promise<FinancialAnalysis> {
    const id = randomUUID();
    const now = new Date();
    const analysis: FinancialAnalysis = {
      ...insertAnalysis,
      id,
      status: insertAnalysis.status || "processing",
      insights: insertAnalysis.insights || null,
      metrics: insertAnalysis.metrics || null,
      chartData: insertAnalysis.chartData || null,
      variances: insertAnalysis.variances || null,
      ratios: insertAnalysis.ratios || null,
      rawData: insertAnalysis.rawData || null,
      createdAt: now,
      updatedAt: now,
    };
    this.analyses.set(id, analysis);
    return analysis;
  }

  async getAnalysis(id: string): Promise<FinancialAnalysis | undefined> {
    return this.analyses.get(id);
  }

  async updateAnalysis(id: string, updates: Partial<FinancialAnalysis>): Promise<FinancialAnalysis | undefined> {
    const existing = this.analyses.get(id);
    if (!existing) return undefined;

    const updated: FinancialAnalysis = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.analyses.set(id, updated);
    return updated;
  }

  async getUserAnalyses(userId: string): Promise<FinancialAnalysis[]> {
    return Array.from(this.analyses.values()).filter(
      (analysis) => analysis.userId === userId
    );
  }

  async deleteAnalysis(id: string): Promise<boolean> {
    return this.analyses.delete(id);
  }
}

export const storage = new MemStorage();
