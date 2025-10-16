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
  type InsertMessage,
  type User,
  type UpsertUser,
  type Organization,
  type InsertOrganization,
  applications,
  licenses,
  renewals,
  recommendations,
  spendingHistory,
  conversations,
  messages,
  users,
  organizations,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, and, desc, asc } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Organization operations
  getOrganization(id: string): Promise<Organization | undefined>;
  createOrganization(org: InsertOrganization): Promise<Organization>;
  
  // Applications (with organizationId filtering)
  getApplications(organizationId: string): Promise<Application[]>;
  getApplication(id: string, organizationId: string): Promise<Application | undefined>;
  createApplication(app: InsertApplication): Promise<Application>;
  updateApplication(id: string, organizationId: string, app: Partial<InsertApplication>): Promise<Application | undefined>;
  deleteApplication(id: string, organizationId: string): Promise<boolean>;

  // Licenses (with organizationId filtering)
  getLicenses(organizationId: string): Promise<License[]>;
  getLicensesByApplicationId(applicationId: string, organizationId: string): Promise<License | undefined>;
  createLicense(license: InsertLicense): Promise<License>;
  updateLicense(id: string, organizationId: string, license: Partial<InsertLicense>): Promise<License | undefined>;
  deleteLicense(id: string, organizationId: string): Promise<boolean>;

  // Renewals (with organizationId filtering)
  getRenewals(organizationId: string): Promise<Renewal[]>;
  getRenewal(id: string, organizationId: string): Promise<Renewal | undefined>;
  getRenewalsByApplicationId(applicationId: string, organizationId: string): Promise<Renewal[]>;
  createRenewal(renewal: InsertRenewal): Promise<Renewal>;
  updateRenewal(id: string, organizationId: string, renewal: Partial<InsertRenewal>): Promise<Renewal | undefined>;
  deleteRenewal(id: string, organizationId: string): Promise<boolean>;

  // Recommendations (with organizationId filtering)
  getRecommendations(organizationId: string): Promise<Recommendation[]>;
  getRecommendation(id: string, organizationId: string): Promise<Recommendation | undefined>;
  createRecommendation(rec: InsertRecommendation): Promise<Recommendation>;
  updateRecommendation(id: string, organizationId: string, rec: Partial<InsertRecommendation>): Promise<Recommendation | undefined>;
  deleteRecommendation(id: string, organizationId: string): Promise<boolean>;

  // Spending History (with organizationId filtering)
  getSpendingHistory(organizationId: string): Promise<SpendingHistory[]>;
  createSpendingHistory(history: InsertSpendingHistory): Promise<SpendingHistory>;

  // Conversations (with organizationId filtering)
  getConversations(organizationId: string): Promise<Conversation[]>;
  getConversation(id: string, organizationId: string): Promise<Conversation | undefined>;
  getConversationsByType(type: string, organizationId: string): Promise<Conversation[]>;
  getConversationsByApplicationId(applicationId: string, organizationId: string): Promise<Conversation[]>;
  createConversation(conv: InsertConversation): Promise<Conversation>;
  updateConversation(id: string, organizationId: string, conv: Partial<InsertConversation>): Promise<Conversation | undefined>;
  deleteConversation(id: string, organizationId: string): Promise<boolean>;

  // Messages (with organizationId filtering)
  getMessages(conversationId: string, organizationId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async upsertUser(user: UpsertUser): Promise<User> {
    const result = await db
      .insert(users)
      .values(user)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result[0];
  }

  // Organization operations
  async getOrganization(id: string): Promise<Organization | undefined> {
    const result = await db.select().from(organizations).where(eq(organizations.id, id)).limit(1);
    return result[0];
  }

  async createOrganization(org: InsertOrganization): Promise<Organization> {
    const result = await db.insert(organizations).values(org).returning();
    return result[0];
  }

  // Applications
  async getApplications(organizationId: string): Promise<Application[]> {
    return await db
      .select()
      .from(applications)
      .where(eq(applications.organizationId, organizationId))
      .orderBy(asc(applications.name));
  }

  async getApplication(id: string, organizationId: string): Promise<Application | undefined> {
    const result = await db
      .select()
      .from(applications)
      .where(and(eq(applications.id, id), eq(applications.organizationId, organizationId)))
      .limit(1);
    return result[0];
  }

  async createApplication(app: InsertApplication): Promise<Application> {
    const result = await db.insert(applications).values(app).returning();
    return result[0];
  }

  async updateApplication(id: string, organizationId: string, app: Partial<InsertApplication>): Promise<Application | undefined> {
    const result = await db
      .update(applications)
      .set(app)
      .where(and(eq(applications.id, id), eq(applications.organizationId, organizationId)))
      .returning();
    return result[0];
  }

  async deleteApplication(id: string, organizationId: string): Promise<boolean> {
    const result = await db
      .delete(applications)
      .where(and(eq(applications.id, id), eq(applications.organizationId, organizationId)))
      .returning();
    return result.length > 0;
  }

  // Licenses
  async getLicenses(organizationId: string): Promise<License[]> {
    return await db
      .select()
      .from(licenses)
      .where(eq(licenses.organizationId, organizationId))
      .orderBy(desc(licenses.createdAt));
  }

  async getLicensesByApplicationId(applicationId: string, organizationId: string): Promise<License | undefined> {
    const result = await db
      .select()
      .from(licenses)
      .where(and(eq(licenses.applicationId, applicationId), eq(licenses.organizationId, organizationId)))
      .limit(1);
    return result[0];
  }

  async createLicense(license: InsertLicense): Promise<License> {
    const result = await db.insert(licenses).values(license).returning();
    return result[0];
  }

  async updateLicense(id: string, organizationId: string, license: Partial<InsertLicense>): Promise<License | undefined> {
    const result = await db
      .update(licenses)
      .set({ ...license, updatedAt: new Date() })
      .where(and(eq(licenses.id, id), eq(licenses.organizationId, organizationId)))
      .returning();
    return result[0];
  }

  async deleteLicense(id: string, organizationId: string): Promise<boolean> {
    const result = await db
      .delete(licenses)
      .where(and(eq(licenses.id, id), eq(licenses.organizationId, organizationId)))
      .returning();
    return result.length > 0;
  }

  // Renewals
  async getRenewals(organizationId: string): Promise<Renewal[]> {
    return await db
      .select()
      .from(renewals)
      .where(eq(renewals.organizationId, organizationId))
      .orderBy(asc(renewals.renewalDate));
  }

  async getRenewal(id: string, organizationId: string): Promise<Renewal | undefined> {
    const result = await db
      .select()
      .from(renewals)
      .where(and(eq(renewals.id, id), eq(renewals.organizationId, organizationId)))
      .limit(1);
    return result[0];
  }

  async getRenewalsByApplicationId(applicationId: string, organizationId: string): Promise<Renewal[]> {
    return await db
      .select()
      .from(renewals)
      .where(and(eq(renewals.applicationId, applicationId), eq(renewals.organizationId, organizationId)))
      .orderBy(asc(renewals.renewalDate));
  }

  async createRenewal(renewal: InsertRenewal): Promise<Renewal> {
    const result = await db.insert(renewals).values(renewal).returning();
    return result[0];
  }

  async updateRenewal(id: string, organizationId: string, renewal: Partial<InsertRenewal>): Promise<Renewal | undefined> {
    const result = await db
      .update(renewals)
      .set(renewal)
      .where(and(eq(renewals.id, id), eq(renewals.organizationId, organizationId)))
      .returning();
    return result[0];
  }

  async deleteRenewal(id: string, organizationId: string): Promise<boolean> {
    const result = await db
      .delete(renewals)
      .where(and(eq(renewals.id, id), eq(renewals.organizationId, organizationId)))
      .returning();
    return result.length > 0;
  }

  // Recommendations
  async getRecommendations(organizationId: string): Promise<Recommendation[]> {
    return await db
      .select()
      .from(recommendations)
      .where(and(eq(recommendations.organizationId, organizationId), eq(recommendations.dismissed, false)))
      .orderBy(desc(recommendations.createdAt));
  }

  async getRecommendation(id: string, organizationId: string): Promise<Recommendation | undefined> {
    const result = await db
      .select()
      .from(recommendations)
      .where(and(eq(recommendations.id, id), eq(recommendations.organizationId, organizationId)))
      .limit(1);
    return result[0];
  }

  async createRecommendation(rec: InsertRecommendation): Promise<Recommendation> {
    const result = await db.insert(recommendations).values(rec).returning();
    return result[0];
  }

  async updateRecommendation(id: string, organizationId: string, rec: Partial<InsertRecommendation>): Promise<Recommendation | undefined> {
    const result = await db
      .update(recommendations)
      .set(rec)
      .where(and(eq(recommendations.id, id), eq(recommendations.organizationId, organizationId)))
      .returning();
    return result[0];
  }

  async deleteRecommendation(id: string, organizationId: string): Promise<boolean> {
    const result = await db
      .delete(recommendations)
      .where(and(eq(recommendations.id, id), eq(recommendations.organizationId, organizationId)))
      .returning();
    return result.length > 0;
  }

  // Spending History
  async getSpendingHistory(organizationId: string): Promise<SpendingHistory[]> {
    const results = await db
      .select()
      .from(spendingHistory)
      .where(eq(spendingHistory.organizationId, organizationId))
      .orderBy(asc(spendingHistory.year));
    
    // Sort by year and month
    return results.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
    });
  }

  async createSpendingHistory(history: InsertSpendingHistory): Promise<SpendingHistory> {
    const result = await db.insert(spendingHistory).values(history).returning();
    return result[0];
  }

  // Conversations
  async getConversations(organizationId: string): Promise<Conversation[]> {
    const results = await db
      .select()
      .from(conversations)
      .where(eq(conversations.organizationId, organizationId))
      .orderBy(desc(conversations.lastMessageAt));
    
    // Sort by lastMessageAt or createdAt
    return results.sort((a, b) => {
      const aTime = a.lastMessageAt || a.createdAt;
      const bTime = b.lastMessageAt || b.createdAt;
      return bTime.getTime() - aTime.getTime();
    });
  }

  async getConversation(id: string, organizationId: string): Promise<Conversation | undefined> {
    const result = await db
      .select()
      .from(conversations)
      .where(and(eq(conversations.id, id), eq(conversations.organizationId, organizationId)))
      .limit(1);
    return result[0];
  }

  async getConversationsByType(type: string, organizationId: string): Promise<Conversation[]> {
    const results = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.type, type),
          eq(conversations.organizationId, organizationId),
          eq(conversations.status, 'active')
        )
      )
      .orderBy(desc(conversations.lastMessageAt));
    
    // Sort by lastMessageAt or createdAt
    return results.sort((a, b) => {
      const aTime = a.lastMessageAt || a.createdAt;
      const bTime = b.lastMessageAt || b.createdAt;
      return bTime.getTime() - aTime.getTime();
    });
  }

  async getConversationsByApplicationId(applicationId: string, organizationId: string): Promise<Conversation[]> {
    return await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.applicationId, applicationId),
          eq(conversations.organizationId, organizationId),
          eq(conversations.status, 'active')
        )
      )
      .orderBy(desc(conversations.createdAt));
  }

  async createConversation(conv: InsertConversation): Promise<Conversation> {
    const result = await db.insert(conversations).values(conv).returning();
    return result[0];
  }

  async updateConversation(id: string, organizationId: string, conv: Partial<InsertConversation>): Promise<Conversation | undefined> {
    const result = await db
      .update(conversations)
      .set(conv)
      .where(and(eq(conversations.id, id), eq(conversations.organizationId, organizationId)))
      .returning();
    return result[0];
  }

  async deleteConversation(id: string, organizationId: string): Promise<boolean> {
    const result = await db
      .delete(conversations)
      .where(and(eq(conversations.id, id), eq(conversations.organizationId, organizationId)))
      .returning();
    return result.length > 0;
  }

  // Messages
  async getMessages(conversationId: string, organizationId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(and(eq(messages.conversationId, conversationId), eq(messages.organizationId, organizationId)))
      .orderBy(asc(messages.createdAt));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const result = await db.insert(messages).values(message).returning();
    const createdMessage = result[0];
    
    // Update conversation lastMessageAt
    await db
      .update(conversations)
      .set({ lastMessageAt: createdMessage.createdAt })
      .where(eq(conversations.id, message.conversationId));
    
    return createdMessage;
  }
}

// Export DatabaseStorage as default
export const storage = new DatabaseStorage();

/*
// MemStorage kept for reference - commented out
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
*/
