import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, decimal, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const applications = pgTable("applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(),
  vendor: text("vendor"),
  status: text("status").notNull().default("approved"), // approved, shadow, trial
  monthlyCost: decimal("monthly_cost", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  logoUrl: text("logo_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const licenses = pgTable("licenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  applicationId: varchar("application_id").notNull().references(() => applications.id, { onDelete: "cascade" }),
  totalLicenses: integer("total_licenses").notNull(),
  activeUsers: integer("active_users").notNull().default(0),
  costPerLicense: decimal("cost_per_license", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const renewals = pgTable("renewals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  applicationId: varchar("application_id").notNull().references(() => applications.id, { onDelete: "cascade" }),
  renewalDate: timestamp("renewal_date").notNull(),
  annualCost: decimal("annual_cost", { precision: 10, scale: 2 }).notNull(),
  contractValue: decimal("contract_value", { precision: 10, scale: 2 }),
  autoRenew: boolean("auto_renew").default(true),
  notified: boolean("notified").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const recommendations = pgTable("recommendations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  applicationId: varchar("application_id").notNull().references(() => applications.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // downgrade, renew, track-users, review-renewal, cost-review
  title: text("title").notNull(),
  description: text("description").notNull(),
  priority: text("priority").notNull().default("medium"), // high, medium, low
  actionLabel: text("action_label").notNull(),
  currentCost: decimal("current_cost", { precision: 10, scale: 2 }),
  potentialCost: decimal("potential_cost", { precision: 10, scale: 2 }),
  currentUsers: integer("current_users"),
  activeUsers: integer("active_users"),
  contractValue: decimal("contract_value", { precision: 10, scale: 2 }),
  renewalDate: text("renewal_date"),
  dismissed: boolean("dismissed").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const spendingHistory = pgTable("spending_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  month: text("month").notNull(),
  year: integer("year").notNull(),
  totalSpend: decimal("total_spend", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert Schemas
export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  createdAt: true,
});

export const insertLicenseSchema = createInsertSchema(licenses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRenewalSchema = createInsertSchema(renewals).omit({
  id: true,
  createdAt: true,
});

export const insertRecommendationSchema = createInsertSchema(recommendations).omit({
  id: true,
  createdAt: true,
});

export const insertSpendingHistorySchema = createInsertSchema(spendingHistory).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applications.$inferSelect;

export type InsertLicense = z.infer<typeof insertLicenseSchema>;
export type License = typeof licenses.$inferSelect;

export type InsertRenewal = z.infer<typeof insertRenewalSchema>;
export type Renewal = typeof renewals.$inferSelect;

export type InsertRecommendation = z.infer<typeof insertRecommendationSchema>;
export type Recommendation = typeof recommendations.$inferSelect;

export type InsertSpendingHistory = z.infer<typeof insertSpendingHistorySchema>;
export type SpendingHistory = typeof spendingHistory.$inferSelect;
