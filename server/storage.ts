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
  type InsertSpendingHistory,
  type Conversation,
  type InsertConversation,
  type Message,
  type InsertMessage
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

  // Conversations
  getConversations(): Promise<Conversation[]>;
  getConversation(id: string): Promise<Conversation | undefined>;
  getConversationsByType(type: string): Promise<Conversation[]>;
  getConversationsByApplicationId(applicationId: string): Promise<Conversation[]>;
  createConversation(conv: InsertConversation): Promise<Conversation>;
  updateConversation(id: string, conv: Partial<InsertConversation>): Promise<Conversation | undefined>;
  deleteConversation(id: string): Promise<boolean>;

  // Messages
  getMessages(conversationId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
}

export class MemStorage implements IStorage {
  private applications: Map<string, Application>;
  private licenses: Map<string, License>;
  private renewals: Map<string, Renewal>;
  private recommendations: Map<string, Recommendation>;
  private spendingHistory: Map<string, SpendingHistory>;
  private conversations: Map<string, Conversation>;
  private messages: Map<string, Message>;

  constructor() {
    this.applications = new Map();
    this.licenses = new Map();
    this.renewals = new Map();
    this.recommendations = new Map();
    this.spendingHistory = new Map();
    this.conversations = new Map();
    this.messages = new Map();
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

  // Conversations
  async getConversations(): Promise<Conversation[]> {
    return Array.from(this.conversations.values()).sort((a, b) => {
      const aTime = a.lastMessageAt || a.createdAt;
      const bTime = b.lastMessageAt || b.createdAt;
      return bTime.getTime() - aTime.getTime();
    });
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async getConversationsByType(type: string): Promise<Conversation[]> {
    return Array.from(this.conversations.values())
      .filter(c => c.type === type && c.status === 'active')
      .sort((a, b) => {
        const aTime = a.lastMessageAt || a.createdAt;
        const bTime = b.lastMessageAt || b.createdAt;
        return bTime.getTime() - aTime.getTime();
      });
  }

  async getConversationsByApplicationId(applicationId: string): Promise<Conversation[]> {
    return Array.from(this.conversations.values())
      .filter(c => c.applicationId === applicationId && c.status === 'active');
  }

  async createConversation(insertConv: InsertConversation): Promise<Conversation> {
    const id = randomUUID();
    const conversation: Conversation = { 
      ...insertConv,
      applicationId: insertConv.applicationId ?? null,
      vendorName: insertConv.vendorName ?? null,
      status: insertConv.status ?? 'active',
      lastMessageAt: insertConv.lastMessageAt ?? null,
      id,
      createdAt: new Date()
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async updateConversation(id: string, updates: Partial<InsertConversation>): Promise<Conversation | undefined> {
    const conversation = this.conversations.get(id);
    if (!conversation) return undefined;
    
    const updated = { ...conversation, ...updates };
    this.conversations.set(id, updated);
    return updated;
  }

  async deleteConversation(id: string): Promise<boolean> {
    return this.conversations.delete(id);
  }

  // Messages
  async getMessages(conversationId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(m => m.conversationId === conversationId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = { 
      ...insertMessage,
      messageType: insertMessage.messageType ?? 'text',
      metadata: insertMessage.metadata ?? null,
      id,
      createdAt: new Date()
    };
    this.messages.set(id, message);
    
    // Update conversation lastMessageAt
    const conversation = this.conversations.get(insertMessage.conversationId);
    if (conversation) {
      conversation.lastMessageAt = message.createdAt;
      this.conversations.set(conversation.id, conversation);
    }
    
    return message;
  }
}

export const storage = new MemStorage();
