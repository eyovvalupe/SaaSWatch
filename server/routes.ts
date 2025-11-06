import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { seedDemoDataForOrganization } from "./seed";
import {
  insertApplicationSchema,
  insertLicenseSchema,
  insertRenewalSchema,
  insertRecommendationSchema,
  insertSpendingHistorySchema,
  insertConversationSchema,
  insertMessageSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  await setupAuth(app);

  // Auth route to get current user
  app.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Public endpoint to get demo organization data (no auth required)
  app.get("/api/demo-data", async (req, res) => {
    try {
      // Find the demo organization
      const organizations = await storage.getAllOrganizations();
      const demoOrg = organizations.find(
        (org) => org.name === "Demo Organization",
      );

      if (!demoOrg) {
        return res.status(404).json({ error: "Demo organization not found" });
      }

      // Fetch all demo data
      const [
        applications,
        licenses,
        renewals,
        recommendations,
        spendingHistory,
      ] = await Promise.all([
        storage.getApplications(demoOrg.id),
        storage.getLicenses(demoOrg.id),
        storage.getRenewals(demoOrg.id),
        storage.getRecommendations(demoOrg.id),
        storage.getSpendingHistory(demoOrg.id),
      ]);

      // Calculate stats
      const totalApplications = applications.length;
      const totalLicenses = licenses.reduce(
        (sum, l) => sum + l.totalLicenses,
        0,
      );
      const totalActiveLicenses = licenses.reduce(
        (sum, l) => sum + l.activeUsers,
        0,
      );
      const monthlySpend = applications.reduce(
        (sum, app) => sum + Number(app.monthlyCost),
        0,
      );
      const potentialSavings = recommendations
        .filter((r) => r.currentCost && r.potentialCost)
        .reduce(
          (sum, r) => sum + (Number(r.currentCost) - Number(r.potentialCost)),
          0,
        );

      res.json({
        applications,
        licenses,
        renewals,
        recommendations,
        spendingHistory,
        stats: {
          totalApplications,
          totalLicenses,
          totalActiveLicenses,
          monthlySpend,
          potentialSavings,
        },
      });
    } catch (error) {
      console.error("Error fetching demo data:", error);
      res.status(500).json({ error: "Failed to fetch demo data" });
    }
  });

  // Initialize account - create organization for user
  app.post("/api/initialize-account", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check if user already has an organization
      if (user.organizationId) {
        return res
          .status(400)
          .json({ error: "User already has an organization" });
      }

      // Create new organization for the user
      const userName =
        user.firstName || (user.email ? user.email.split("@")[0] : "User");
      const organization = await storage.createOrganization({
        name: `${userName}'s Organization`,
        plan: "free",
      });

      // Update user with organization ID
      const updatedUser = await storage.upsertUser({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        organizationId: organization.id,
      });

      res.json({
        message: "Account initialized successfully",
        user: updatedUser,
        organization,
      });
    } catch (error) {
      console.error("Error initializing account:", error);
      res.status(500).json({ error: "Failed to initialize account" });
    }
  });

  // Seed demo data for the current user's organization
  app.post("/api/seed-demo", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const user = await storage.getUser(userId);
      if (!user || !user.organizationId) {
        return res
          .status(400)
          .json({ error: "User not associated with an organization" });
      }

      await seedDemoDataForOrganization(user.organizationId);
      res.json({ message: "Demo data seeded successfully" });
    } catch (error) {
      console.error("Error seeding demo data:", error);
      res.status(500).json({ error: "Failed to seed demo data" });
    }
  });

  // Integrations (global catalog, no auth required)
  app.get("/api/integrations", isAuthenticated, async (req, res) => {
    try {
      const integrations = await storage.getAllIntegrations();
      res.json(integrations);
    } catch (error) {
      console.error("Error fetching integrations:", error);
      res.status(500).json({ error: "Failed to fetch integrations" });
    }
  });

  // Get organizations using a specific integration
  app.get(
    "/api/integrations/:id/organizations",
    isAuthenticated,
    async (req, res) => {
      try {
        const organizations = await storage.getOrganizationsByIntegrationId(
          req.params.id,
        );
        res.json(organizations);
      } catch (error) {
        console.error("Error fetching organizations by integration:", error);
        res.status(500).json({ error: "Failed to fetch organizations" });
      }
    },
  );

  // Get users using a specific integration
  app.get("/api/integrations/:id/users", isAuthenticated, async (req, res) => {
    try {
      const users = await storage.getUsersByIntegrationId(req.params.id);
      console.log(
        "users searched by integration: ",
        users,
        "integration id: ",
        req.params.id,
      );
      res.json(users);
    } catch (error) {
      console.error("Error fetching users by integration:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Analytics - Get user counts for applications
  app.get("/api/analytics/user-counts", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const user = await storage.getUser(userId);
      if (!user || !user.organizationId) {
        return res
          .status(400)
          .json({ error: "User not associated with an organization" });
      }

      // Get all applications for the organization
      const applications = await storage.getApplications(user.organizationId);

      // For each application, count users who have added that integration
      const userCounts = await Promise.all(
        applications.map(async (app) => {
          if (!app.integrationId) {
            return {
              applicationId: app.id,
              totalUsers: 0,
              activeUsers: 0,
              idleUsers: 0,
              inactiveUsers: 0,
              billableUsers: 0,
            };
          }

          const users = await storage.getUsersByIntegrationId(
            app.integrationId,
          );
          const totalUsers = users.length;

          return {
            applicationId: app.id,
            totalUsers,
            activeUsers: totalUsers,
            idleUsers: 0,
            inactiveUsers: 0,
            billableUsers: totalUsers,
          };
        }),
      );

      res.json(userCounts);
    } catch (error) {
      console.error("Error fetching analytics user counts:", error);
      res.status(500).json({ error: "Failed to fetch analytics user counts" });
    }
  });

  // Applications
  app.get("/api/applications", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const user = await storage.getUser(userId);
      if (!user || !user.organizationId) {
        return res
          .status(400)
          .json({ error: "User not associated with an organization" });
      }
      const search = req.query.search as string | undefined;
      const applications = await storage.getApplications(
        user.organizationId,
        search,
      );
      res.json(applications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch applications" });
    }
  });

  app.get("/api/applications/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const user = await storage.getUser(userId);
      if (!user || !user.organizationId) {
        return res
          .status(400)
          .json({ error: "User not associated with an organization" });
      }
      const application = await storage.getApplication(
        req.params.id,
        user.organizationId,
      );
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      res.json(application);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch application" });
    }
  });

  app.post("/api/applications", isAuthenticated, async (req, res) => {
    let createdApplication = null;
    try {
      const userId = (req.user as any).claims.sub;
      const user = await storage.getUser(userId);
      if (!user || !user.organizationId) {
        return res
          .status(400)
          .json({ error: "User not associated with an organization" });
      }
      const validatedData = insertApplicationSchema.parse(req.body);
      createdApplication = await storage.createApplication({
        ...validatedData,
        organizationId: user.organizationId,
      });

      // Check if a team chat conversation already exists for this integration
      // Only create a new conversation if one doesn't exist for this integration in this organization
      if (createdApplication.integrationId) {
        const existingConversation =
          await storage.getConversationByIntegrationId(
            createdApplication.integrationId,
            user.organizationId,
          );

        if (!existingConversation) {
          try {
            // Get the integration name for the conversation title
            const integration = await storage.getIntegration(
              createdApplication.integrationId,
            );
            const conversationTitle = integration
              ? `${integration.name} Team Discussion`
              : `${createdApplication.name} Team Discussion`;

            await storage.createConversation({
              type: "internal",
              integrationId: createdApplication.integrationId,
              title: conversationTitle,
              status: "active",
              organizationId: user.organizationId,
            });
          } catch (convError) {
            // Rollback: delete the application we just created
            await storage.deleteApplication(
              createdApplication.id,
              user.organizationId,
            );
            throw new Error("Failed to create team chat conversation");
          }
        }
      }

      res.status(201).json(createdApplication);
    } catch (error) {
      console.error("Error creating application:", error);
      res.status(400).json({
        error: "Invalid application data",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.patch("/api/applications/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const user = await storage.getUser(userId);
      if (!user || !user.organizationId) {
        return res
          .status(400)
          .json({ error: "User not associated with an organization" });
      }
      const application = await storage.updateApplication(
        req.params.id,
        user.organizationId,
        req.body,
      );
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      res.json(application);
    } catch (error) {
      res.status(500).json({ error: "Failed to update application" });
    }
  });

  app.delete("/api/applications/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const user = await storage.getUser(userId);
      if (!user || !user.organizationId) {
        return res
          .status(400)
          .json({ error: "User not associated with an organization" });
      }
      const deleted = await storage.deleteApplication(
        req.params.id,
        user.organizationId,
      );
      if (!deleted) {
        return res.status(404).json({ error: "Application not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete application" });
    }
  });

  // Get users by application
  app.get("/api/applications/:id/users", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const user = await storage.getUser(userId);
      if (!user || !user.organizationId) {
        return res
          .status(400)
          .json({ error: "User not associated with an organization" });
      }
      const search = req.query.search as string | undefined;
      const users = await storage.getUsersByApplicationId(
        req.params.id,
        user.organizationId,
        search,
      );
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Licenses
  app.get("/api/licenses", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const user = await storage.getUser(userId);
      if (!user || !user.organizationId) {
        return res
          .status(400)
          .json({ error: "User not associated with an organization" });
      }
      const licenses = await storage.getLicenses(user.organizationId);
      res.json(licenses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch licenses" });
    }
  });

  app.get(
    "/api/licenses/application/:applicationId",
    isAuthenticated,
    async (req, res) => {
      try {
        const userId = (req.user as any).claims.sub;
        const user = await storage.getUser(userId);
        if (!user || !user.organizationId) {
          return res
            .status(400)
            .json({ error: "User not associated with an organization" });
        }
        const license = await storage.getLicensesByApplicationId(
          req.params.applicationId,
          user.organizationId,
        );
        if (!license) {
          return res.status(404).json({ error: "License not found" });
        }
        res.json(license);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch license" });
      }
    },
  );

  app.post("/api/licenses", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const user = await storage.getUser(userId);
      if (!user || !user.organizationId) {
        return res
          .status(400)
          .json({ error: "User not associated with an organization" });
      }
      const validatedData = insertLicenseSchema.parse(req.body);
      const license = await storage.createLicense({
        ...validatedData,
        organizationId: user.organizationId,
      });
      res.status(201).json(license);
    } catch (error) {
      res.status(400).json({ error: "Invalid license data" });
    }
  });

  app.patch("/api/licenses/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const user = await storage.getUser(userId);
      if (!user || !user.organizationId) {
        return res
          .status(400)
          .json({ error: "User not associated with an organization" });
      }
      const license = await storage.updateLicense(
        req.params.id,
        user.organizationId,
        req.body,
      );
      if (!license) {
        return res.status(404).json({ error: "License not found" });
      }
      res.json(license);
    } catch (error) {
      res.status(500).json({ error: "Failed to update license" });
    }
  });

  app.delete("/api/licenses/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const user = await storage.getUser(userId);
      if (!user || !user.organizationId) {
        return res
          .status(400)
          .json({ error: "User not associated with an organization" });
      }
      const deleted = await storage.deleteLicense(
        req.params.id,
        user.organizationId,
      );
      if (!deleted) {
        return res.status(404).json({ error: "License not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete license" });
    }
  });

  // Renewals
  app.get("/api/renewals", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const user = await storage.getUser(userId);
      if (!user || !user.organizationId) {
        return res
          .status(400)
          .json({ error: "User not associated with an organization" });
      }
      const renewals = await storage.getRenewals(user.organizationId);
      res.json(renewals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch renewals" });
    }
  });

  app.get("/api/renewals/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const user = await storage.getUser(userId);
      if (!user || !user.organizationId) {
        return res
          .status(400)
          .json({ error: "User not associated with an organization" });
      }
      const renewal = await storage.getRenewal(
        req.params.id,
        user.organizationId,
      );
      if (!renewal) {
        return res.status(404).json({ error: "Renewal not found" });
      }
      res.json(renewal);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch renewal" });
    }
  });

  app.get(
    "/api/renewals/application/:applicationId",
    isAuthenticated,
    async (req, res) => {
      try {
        const userId = (req.user as any).claims.sub;
        const user = await storage.getUser(userId);
        if (!user || !user.organizationId) {
          return res
            .status(400)
            .json({ error: "User not associated with an organization" });
        }
        const renewals = await storage.getRenewalsByApplicationId(
          req.params.applicationId,
          user.organizationId,
        );
        res.json(renewals);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch renewals" });
      }
    },
  );

  app.post("/api/renewals", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const user = await storage.getUser(userId);
      if (!user || !user.organizationId) {
        return res
          .status(400)
          .json({ error: "User not associated with an organization" });
      }
      const validatedData = insertRenewalSchema.parse(req.body);
      const renewal = await storage.createRenewal({
        ...validatedData,
        organizationId: user.organizationId,
      });
      res.status(201).json(renewal);
    } catch (error) {
      res.status(400).json({ error: "Invalid renewal data" });
    }
  });

  app.patch("/api/renewals/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const user = await storage.getUser(userId);
      if (!user || !user.organizationId) {
        return res
          .status(400)
          .json({ error: "User not associated with an organization" });
      }
      const renewal = await storage.updateRenewal(
        req.params.id,
        user.organizationId,
        req.body,
      );
      if (!renewal) {
        return res.status(404).json({ error: "Renewal not found" });
      }
      res.json(renewal);
    } catch (error) {
      res.status(500).json({ error: "Failed to update renewal" });
    }
  });

  app.delete("/api/renewals/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const user = await storage.getUser(userId);
      if (!user || !user.organizationId) {
        return res
          .status(400)
          .json({ error: "User not associated with an organization" });
      }
      const deleted = await storage.deleteRenewal(
        req.params.id,
        user.organizationId,
      );
      if (!deleted) {
        return res.status(404).json({ error: "Renewal not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete renewal" });
    }
  });

  // Recommendations
  app.get("/api/recommendations", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const user = await storage.getUser(userId);
      if (!user || !user.organizationId) {
        return res
          .status(400)
          .json({ error: "User not associated with an organization" });
      }
      const recommendations = await storage.getRecommendations(
        user.organizationId,
      );
      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recommendations" });
    }
  });

  app.get("/api/recommendations/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const user = await storage.getUser(userId);
      if (!user || !user.organizationId) {
        return res
          .status(400)
          .json({ error: "User not associated with an organization" });
      }
      const recommendation = await storage.getRecommendation(
        req.params.id,
        user.organizationId,
      );
      if (!recommendation) {
        return res.status(404).json({ error: "Recommendation not found" });
      }
      res.json(recommendation);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recommendation" });
    }
  });

  app.post("/api/recommendations", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const user = await storage.getUser(userId);
      if (!user || !user.organizationId) {
        return res
          .status(400)
          .json({ error: "User not associated with an organization" });
      }
      const validatedData = insertRecommendationSchema.parse(req.body);
      const recommendation = await storage.createRecommendation({
        ...validatedData,
        organizationId: user.organizationId,
      });
      res.status(201).json(recommendation);
    } catch (error) {
      res.status(400).json({ error: "Invalid recommendation data" });
    }
  });

  app.patch("/api/recommendations/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const user = await storage.getUser(userId);
      if (!user || !user.organizationId) {
        return res
          .status(400)
          .json({ error: "User not associated with an organization" });
      }
      const recommendation = await storage.updateRecommendation(
        req.params.id,
        user.organizationId,
        req.body,
      );
      if (!recommendation) {
        return res.status(404).json({ error: "Recommendation not found" });
      }
      res.json(recommendation);
    } catch (error) {
      res.status(500).json({ error: "Failed to update recommendation" });
    }
  });

  app.delete("/api/recommendations/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const user = await storage.getUser(userId);
      if (!user || !user.organizationId) {
        return res
          .status(400)
          .json({ error: "User not associated with an organization" });
      }
      const deleted = await storage.deleteRecommendation(
        req.params.id,
        user.organizationId,
      );
      if (!deleted) {
        return res.status(404).json({ error: "Recommendation not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete recommendation" });
    }
  });

  // Spending History
  app.get("/api/spending-history", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const user = await storage.getUser(userId);
      if (!user || !user.organizationId) {
        return res
          .status(400)
          .json({ error: "User not associated with an organization" });
      }
      const history = await storage.getSpendingHistory(user.organizationId);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch spending history" });
    }
  });

  app.post("/api/spending-history", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const user = await storage.getUser(userId);
      if (!user || !user.organizationId) {
        return res
          .status(400)
          .json({ error: "User not associated with an organization" });
      }
      const validatedData = insertSpendingHistorySchema.parse(req.body);
      const history = await storage.createSpendingHistory({
        ...validatedData,
        organizationId: user.organizationId,
      });
      res.status(201).json(history);
    } catch (error) {
      res.status(400).json({ error: "Invalid spending history data" });
    }
  });

  // Dashboard statistics endpoint
  app.get("/api/dashboard/stats", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const user = await storage.getUser(userId);
      if (!user || !user.organizationId) {
        return res
          .status(400)
          .json({ error: "User not associated with an organization" });
      }
      const applications = await storage.getApplications(user.organizationId);
      const integrations = await storage.getAllIntegrations();
      const licenses = await storage.getLicenses(user.organizationId);
      const recommendations = await storage.getRecommendations(
        user.organizationId,
      );

      const totalApplications = integrations.length;
      const totalLicenses = licenses.reduce(
        (sum, l) => sum + l.totalLicenses,
        0,
      );
      const totalActiveLicenses = applications.length;
      const monthlySpend = applications.reduce(
        (sum, app) => sum + Number(app.monthlyCost),
        0,
      );

      const potentialSavings = recommendations
        .filter((r) => r.currentCost && r.potentialCost)
        .reduce(
          (sum, r) => sum + (Number(r.currentCost) - Number(r.potentialCost)),
          0,
        );

      // res.json({
      //   totalApplications,
      //   totalLicenses,
      //   totalActiveLicenses,
      //   monthlySpend,
      //   potentialSavings,
      // });
      res.json({
        totalApplications: 51,
        totalLicenses: 541,
        totalActiveLicenses: 322,
        monthlySpend: 38472,
        potentialSavings: 7580,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  // Conversations
  app.get("/api/conversations", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const user = await storage.getUser(userId);
      if (!user || !user.organizationId) {
        return res
          .status(400)
          .json({ error: "User not associated with an organization" });
      }
      const { type } = req.query;
      const conversations = type
        ? await storage.getConversationsByType(
            type as string,
            user.organizationId,
          )
        : await storage.getConversations(user.organizationId);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.get("/api/conversations/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const user = await storage.getUser(userId);
      if (!user || !user.organizationId) {
        return res
          .status(400)
          .json({ error: "User not associated with an organization" });
      }
      const conversation = await storage.getConversation(
        req.params.id,
        user.organizationId,
      );
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      res.json(conversation);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conversation" });
    }
  });

  app.post("/api/conversations", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const user = await storage.getUser(userId);
      if (!user || !user.organizationId) {
        return res
          .status(400)
          .json({ error: "User not associated with an organization" });
      }
      const validatedData = insertConversationSchema.parse(req.body);
      const conversation = await storage.createConversation({
        ...validatedData,
        organizationId: user.organizationId,
      });
      res.status(201).json(conversation);
    } catch (error) {
      res.status(400).json({ error: "Invalid conversation data" });
    }
  });

  app.patch("/api/conversations/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const user = await storage.getUser(userId);
      if (!user || !user.organizationId) {
        return res
          .status(400)
          .json({ error: "User not associated with an organization" });
      }
      const conversation = await storage.updateConversation(
        req.params.id,
        user.organizationId,
        req.body,
      );
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      res.json(conversation);
    } catch (error) {
      res.status(500).json({ error: "Failed to update conversation" });
    }
  });

  app.delete("/api/conversations/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const user = await storage.getUser(userId);
      if (!user || !user.organizationId) {
        return res
          .status(400)
          .json({ error: "User not associated with an organization" });
      }
      const deleted = await storage.deleteConversation(
        req.params.id,
        user.organizationId,
      );
      if (!deleted) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete conversation" });
    }
  });

  // Messages
  app.get(
    "/api/conversations/:integrationId/messages",
    isAuthenticated,
    async (req, res) => {
      try {
        const userId = (req.user as any).claims.sub;
        const user = await storage.getUser(userId);
        if (!user || !user.organizationId) {
          return res
            .status(400)
            .json({ error: "User not associated with an organization" });
        }

        const messages = await storage.getMessages(req.params.integrationId);
        console.log("============>", messages);
        res.json(messages);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch messages" });
      }
    },
  );

  const httpServer = createServer(app);

  // WebSocket Server for real-time messaging with room-based subscriptions
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  // Track which clients are subscribed to which conversations
  // Map<conversationId, Set<WebSocket>>
  const conversationRooms = new Map<string, Set<WebSocket>>();

  // Helper function to broadcast to a specific conversation room
  function broadcastToConversation(conversationId: string, data: any) {
    const room = conversationRooms.get(conversationId);
    if (room) {
      const message = JSON.stringify(data);
      room.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }
  }

  app.post(
    "/api/conversations/:integrationId/messages",
    isAuthenticated,
    async (req, res) => {
      try {
        const userId = (req.user as any).claims.sub;
        const user = await storage.getUser(userId);
        if (!user || !user.organizationId) {
          return res
            .status(400)
            .json({ error: "User not associated with an organization" });
        }

        // Fetch the conversation to get its integrationId
        const conversation = await storage.getConversation(
          req.params.integrationId,
          user.organizationId,
        );
        if (!conversation) {
          return res.status(404).json({ error: "Conversation not found" });
        }

        const validatedData = insertMessageSchema.parse({
          ...req.body,
          conversationId: conversation.id,
          organizationId: user.organizationId,
          integrationId: conversation.integrationId,
        });
        const message = await storage.createMessage(validatedData);

        // Broadcast message only to WebSocket clients in this conversation room
        broadcastToConversation(req.params.integrationId, {
          type: "new_message",
          integrationId: req.params.integrationId,
          message,
        });

        res.status(201).json(message);
      } catch (error) {
        console.error("Error creating message:", error);
        res.status(400).json({
          error: "Invalid message data",
          details: error instanceof Error ? error.message : "Unknown error",
        });
      }
    },
  );

  wss.on("connection", (ws: any) => {
    console.log("WebSocket client connected");

    // Track which conversations this client is subscribed to
    ws.subscribedConversations = new Set<string>();

    ws.on("message", async (data: any) => {
      try {
        const payload = JSON.parse(data.toString());

        if (payload.type === "subscribe") {
          // Subscribe to a conversation room
          const { integrationId } = payload;

          if (!conversationRooms.has(integrationId)) {
            conversationRooms.set(integrationId, new Set());
          }

          conversationRooms.get(integrationId)!.add(ws);
          ws.subscribedConversations.add(integrationId);

          console.log(`Client subscribed to conversation: ${integrationId}`);

          // Send acknowledgment
          ws.send(
            JSON.stringify({
              type: "subscribed",
              integrationId,
            }),
          );
        } else if (payload.type === "unsubscribe") {
          // Unsubscribe from a conversation room
          const { integrationId } = payload;

          const room = conversationRooms.get(integrationId);
          if (room) {
            room.delete(ws);
            if (room.size === 0) {
              conversationRooms.delete(integrationId);
            }
          }

          ws.subscribedConversations.delete(integrationId);
          console.log(
            `Client unsubscribed from conversation: ${integrationId}`,
          );
        } else if (payload.type === "send_message") {
          // Fetch the conversation to get its integrationId
          const conversation = await storage.getConversation(
            payload.conversationId,
            payload.organizationId,
          );

          const message = await storage.createMessage({
            conversationId: payload.conversationId,
            senderName: payload.senderName,
            senderRole: payload.senderRole,
            content: payload.content,
            messageType: payload.messageType || "text",
            organizationId: payload.organizationId,
            integrationId: conversation?.integrationId,
          });

          // Broadcast only to clients in this conversation room
          broadcastToConversation(payload.conversationId, {
            type: "new_message",
            conversationId: payload.conversationId,
            message,
          });
        }
      } catch (error) {
        console.error("WebSocket error:", error);
      }
    });

    ws.on("close", () => {
      console.log("WebSocket client disconnected");

      // Clean up: remove client from all conversation rooms
      ws.subscribedConversations.forEach((conversationId: string) => {
        const room = conversationRooms.get(conversationId);
        if (room) {
          room.delete(ws);
          if (room.size === 0) {
            conversationRooms.delete(conversationId);
          }
        }
      });
    });
  });

  return httpServer;
}
