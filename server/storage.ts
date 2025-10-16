import { 
  type Application, 
  type InsertApplication,
  type License,
  type InsertLicense,
  type Renewal,
  type InsertRenewal,
  type Recommendation,
  type InsertRecommendation,
  type SpendingHistory,
  type InsertSpendingHistory
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Applications
  getApplications(): Promise<Application[]>;
  getApplication(id: string): Promise<Application | undefined>;
  createApplication(app: InsertApplication): Promise<Application>;
  updateApplication(id: string, app: Partial<InsertApplication>): Promise<Application | undefined>;
  deleteApplication(id: string): Promise<boolean>;

  // Licenses
  getLicenses(): Promise<License[]>;
  getLicensesByApplicationId(applicationId: string): Promise<License | undefined>;
  createLicense(license: InsertLicense): Promise<License>;
  updateLicense(id: string, license: Partial<InsertLicense>): Promise<License | undefined>;
  deleteLicense(id: string): Promise<boolean>;

  // Renewals
  getRenewals(): Promise<Renewal[]>;
  getRenewal(id: string): Promise<Renewal | undefined>;
  getRenewalsByApplicationId(applicationId: string): Promise<Renewal[]>;
  createRenewal(renewal: InsertRenewal): Promise<Renewal>;
  updateRenewal(id: string, renewal: Partial<InsertRenewal>): Promise<Renewal | undefined>;
  deleteRenewal(id: string): Promise<boolean>;

  // Recommendations
  getRecommendations(): Promise<Recommendation[]>;
  getRecommendation(id: string): Promise<Recommendation | undefined>;
  createRecommendation(rec: InsertRecommendation): Promise<Recommendation>;
  updateRecommendation(id: string, rec: Partial<InsertRecommendation>): Promise<Recommendation | undefined>;
  deleteRecommendation(id: string): Promise<boolean>;

  // Spending History
  getSpendingHistory(): Promise<SpendingHistory[]>;
  createSpendingHistory(history: InsertSpendingHistory): Promise<SpendingHistory>;
}

export class MemStorage implements IStorage {
  private applications: Map<string, Application>;
  private licenses: Map<string, License>;
  private renewals: Map<string, Renewal>;
  private recommendations: Map<string, Recommendation>;
  private spendingHistory: Map<string, SpendingHistory>;

  constructor() {
    this.applications = new Map();
    this.licenses = new Map();
    this.renewals = new Map();
    this.recommendations = new Map();
    this.spendingHistory = new Map();
  }

  // Applications
  async getApplications(): Promise<Application[]> {
    return Array.from(this.applications.values());
  }

  async getApplication(id: string): Promise<Application | undefined> {
    return this.applications.get(id);
  }

  async createApplication(insertApp: InsertApplication): Promise<Application> {
    const id = randomUUID();
    const app: Application = { 
      ...insertApp,
      vendor: insertApp.vendor ?? null,
      description: insertApp.description ?? null,
      logoUrl: insertApp.logoUrl ?? null,
      status: insertApp.status ?? "approved",
      id,
      createdAt: new Date()
    };
    this.applications.set(id, app);
    return app;
  }

  async updateApplication(id: string, updates: Partial<InsertApplication>): Promise<Application | undefined> {
    const app = this.applications.get(id);
    if (!app) return undefined;
    
    const updated = { ...app, ...updates };
    this.applications.set(id, updated);
    return updated;
  }

  async deleteApplication(id: string): Promise<boolean> {
    return this.applications.delete(id);
  }

  // Licenses
  async getLicenses(): Promise<License[]> {
    return Array.from(this.licenses.values());
  }

  async getLicensesByApplicationId(applicationId: string): Promise<License | undefined> {
    return Array.from(this.licenses.values()).find(l => l.applicationId === applicationId);
  }

  async createLicense(insertLicense: InsertLicense): Promise<License> {
    const id = randomUUID();
    const license: License = { 
      ...insertLicense,
      activeUsers: insertLicense.activeUsers ?? 0,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.licenses.set(id, license);
    return license;
  }

  async updateLicense(id: string, updates: Partial<InsertLicense>): Promise<License | undefined> {
    const license = this.licenses.get(id);
    if (!license) return undefined;
    
    const updated = { ...license, ...updates, updatedAt: new Date() };
    this.licenses.set(id, updated);
    return updated;
  }

  async deleteLicense(id: string): Promise<boolean> {
    return this.licenses.delete(id);
  }

  // Renewals
  async getRenewals(): Promise<Renewal[]> {
    return Array.from(this.renewals.values());
  }

  async getRenewal(id: string): Promise<Renewal | undefined> {
    return this.renewals.get(id);
  }

  async getRenewalsByApplicationId(applicationId: string): Promise<Renewal[]> {
    return Array.from(this.renewals.values()).filter(r => r.applicationId === applicationId);
  }

  async createRenewal(insertRenewal: InsertRenewal): Promise<Renewal> {
    const id = randomUUID();
    const renewal: Renewal = { 
      ...insertRenewal,
      contractValue: insertRenewal.contractValue ?? null,
      autoRenew: insertRenewal.autoRenew ?? true,
      notified: insertRenewal.notified ?? false,
      id,
      createdAt: new Date()
    };
    this.renewals.set(id, renewal);
    return renewal;
  }

  async updateRenewal(id: string, updates: Partial<InsertRenewal>): Promise<Renewal | undefined> {
    const renewal = this.renewals.get(id);
    if (!renewal) return undefined;
    
    const updated = { ...renewal, ...updates };
    this.renewals.set(id, updated);
    return updated;
  }

  async deleteRenewal(id: string): Promise<boolean> {
    return this.renewals.delete(id);
  }

  // Recommendations
  async getRecommendations(): Promise<Recommendation[]> {
    return Array.from(this.recommendations.values()).filter(r => !r.dismissed);
  }

  async getRecommendation(id: string): Promise<Recommendation | undefined> {
    return this.recommendations.get(id);
  }

  async createRecommendation(insertRec: InsertRecommendation): Promise<Recommendation> {
    const id = randomUUID();
    const recommendation: Recommendation = { 
      ...insertRec,
      currentCost: insertRec.currentCost ?? null,
      potentialCost: insertRec.potentialCost ?? null,
      currentUsers: insertRec.currentUsers ?? null,
      activeUsers: insertRec.activeUsers ?? null,
      contractValue: insertRec.contractValue ?? null,
      renewalDate: insertRec.renewalDate ?? null,
      dismissed: insertRec.dismissed ?? false,
      priority: insertRec.priority ?? "medium",
      id,
      createdAt: new Date()
    };
    this.recommendations.set(id, recommendation);
    return recommendation;
  }

  async updateRecommendation(id: string, updates: Partial<InsertRecommendation>): Promise<Recommendation | undefined> {
    const recommendation = this.recommendations.get(id);
    if (!recommendation) return undefined;
    
    const updated = { ...recommendation, ...updates };
    this.recommendations.set(id, updated);
    return updated;
  }

  async deleteRecommendation(id: string): Promise<boolean> {
    return this.recommendations.delete(id);
  }

  // Spending History
  async getSpendingHistory(): Promise<SpendingHistory[]> {
    return Array.from(this.spendingHistory.values()).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
    });
  }

  async createSpendingHistory(insertHistory: InsertSpendingHistory): Promise<SpendingHistory> {
    const id = randomUUID();
    const history: SpendingHistory = { 
      ...insertHistory, 
      id,
      createdAt: new Date()
    };
    this.spendingHistory.set(id, history);
    return history;
  }
}

export const storage = new MemStorage();
