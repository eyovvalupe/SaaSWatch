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
  insertMessageSchema
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

  // Seed demo data for the current user's organization
  app.post("/api/seed-demo", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const user = await storage.getUser(userId);
      if (!user || !user.organizationId) {
        return res.status(400).json({ error: "User not associated with an organization" });
      }
      
      await seedDemoDataForOrganization(user.organizationId);
      res.json({ message: "Demo data seeded successfully" });
    } catch (error) {
      console.error("Error seeding demo data:", error);
      res.status(500).json({ error: "Failed to seed demo data" });
    }
  });

  // Applications
  app.get("/api/applications", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const user = await storage.getUser(userId);
      if (!user || !user.organizationId) {
        return res.status(400).json({ error: "User not associated with an organization" });
      }
      const applications = await storage.getApplications(user.organizationId);
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
        return res.status(400).json({ error: "User not associated with an organization" });
      }
      const application = await storage.getApplication(req.params.id, user.organizationId);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      res.json(application);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch application" });
    }
  });

  app.post("/api/applications", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const user = await storage.getUser(userId);
      if (!user || !user.organizationId) {
        return res.status(400).json({ error: "User not associated with an organization" });
      }
      const validatedData = insertApplicationSchema.parse(req.body);
      const application = await storage.createApplication({
        ...validatedData,
        organizationId: user.organizationId
      });
      res.status(201).json(application);
    } catch (error) {
      res.status(400).json({ error: "Invalid application data" });
    }
  });

  app.patch("/api/applications/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const user = await storage.getUser(userId);
      if (!user || !user.organizationId) {
        return res.status(400).json({ error: "User not associated with an organization" });
      }
      const application = await storage.updateApplication(req.params.id, user.organizationId, req.body);
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
        return res.status(400).json({ error: "User not associated with an organization" });
      }
      const deleted = await storage.deleteApplication(req.params.id, user.organizationId);
      if (!deleted) {
        return res.status(404).json({ error: "Application not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete application" });
    }
  });

  // Licenses
  app.get("/api/licenses", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const user = await storage.getUser(userId);
      if (!user || !user.organizationId) {
        return res.status(400).json({ error: "User not associated with an organization" });
      }
      const licenses = await storage.getLicenses(user.organizationId);
      res.json(licenses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch licenses" });
    }
  });

  app.get("/api/licenses/application/:applicationId", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const user = await storage.getUser(userId);
      if (!user || !user.organizationId) {
        return res.status(400).json({ error: "User not associated with an organization" });
      }
      const license = await storage.getLicensesByApplicationId(req.params.applicationId, user.organizationId);
      if (!license) {
        return res.status(404).json({ error: "License not found" });
      }
      res.json(license);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch license" });
    }
  });

  app.post("/api/licenses", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const user = await storage.getUser(userId);
      if (!user || !user.organizationId) {
        return res.status(400).json({ error: "User not associated with an organization" });
      }
      const validatedData = insertLicenseSchema.parse(req.body);
      const license = await storage.createLicense({
        ...validatedData,
        organizationId: user.organizationId
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
        return res.status(400).json({ error: "User not associated with an organization" });
      }
      const license = await storage.updateLicense(req.params.id, user.organizationId, req.body);
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
        return res.status(400).json({ error: "User not associated with an organization" });
      }
      const deleted = await storage.deleteLicense(req.params.id, user.organizationId);
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
        return res.status(400).json({ error: "User not associated with an organization" });
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
        return res.status(400).json({ error: "User not associated with an organization" });
      }
      const renewal = await storage.getRenewal(req.params.id, user.organizationId);
      if (!renewal) {
        return res.status(404).json({ error: "Renewal not found" });
      }
      res.json(renewal);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch renewal" });
    }
  });

  app.get("/api/renewals/application/:applicationId", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const user = await storage.getUser(userId);
      if (!user || !user.organizationId) {
        return res.status(400).json({ error: "User not associated with an organization" });
      }
      const renewals = await storage.getRenewalsByApplicationId(req.params.applicationId, user.organizationId);
      res.json(renewals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch renewals" });
    }
  });

  app.post("/api/renewals", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const user = await storage.getUser(userId);
      if (!user || !user.organizationId) {
        return res.status(400).json({ error: "User not associated with an organization" });
      }
      const validatedData = insertRenewalSchema.parse(req.body);
      const renewal = await storage.createRenewal({
        ...validatedData,
        organizationId: user.organizationId
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
        return res.status(400).json({ error: "User not associated with an organization" });
      }
      const renewal = await storage.updateRenewal(req.params.id, user.organizationId, req.body);
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
        return res.status(400).json({ error: "User not associated with an organization" });
      }
      const deleted = await storage.deleteRenewal(req.params.id, user.organizationId);
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
        return res.status(400).json({ error: "User not associated with an organization" });
      }
      const recommendations = await storage.getRecommendations(user.organizationId);
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
        return res.status(400).json({ error: "User not associated with an organization" });
      }
      const recommendation = await storage.getRecommendation(req.params.id, user.organizationId);
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
        return res.status(400).json({ error: "User not associated with an organization" });
      }
      const validatedData = insertRecommendationSchema.parse(req.body);
      const recommendation = await storage.createRecommendation({
        ...validatedData,
        organizationId: user.organizationId
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
        return res.status(400).json({ error: "User not associated with an organization" });
      }
      const recommendation = await storage.updateRecommendation(req.params.id, user.organizationId, req.body);
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
        return res.status(400).json({ error: "User not associated with an organization" });
      }
      const deleted = await storage.deleteRecommendation(req.params.id, user.organizationId);
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
        return res.status(400).json({ error: "User not associated with an organization" });
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
        return res.status(400).json({ error: "User not associated with an organization" });
      }
      const validatedData = insertSpendingHistorySchema.parse(req.body);
      const history = await storage.createSpendingHistory({
        ...validatedData,
        organizationId: user.organizationId
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
        return res.status(400).json({ error: "User not associated with an organization" });
      }
      const applications = await storage.getApplications(user.organizationId);
      const licenses = await storage.getLicenses(user.organizationId);
      const recommendations = await storage.getRecommendations(user.organizationId);
      
      const totalApplications = applications.length;
      const totalLicenses = licenses.reduce((sum, l) => sum + l.totalLicenses, 0);
      const totalActiveLicenses = licenses.reduce((sum, l) => sum + l.activeUsers, 0);
      const monthlySpend = applications.reduce((sum, app) => sum + Number(app.monthlyCost), 0);
      
      const potentialSavings = recommendations
        .filter(r => r.currentCost && r.potentialCost)
        .reduce((sum, r) => sum + (Number(r.currentCost) - Number(r.potentialCost)), 0);

      res.json({
        totalApplications,
        totalLicenses,
        totalActiveLicenses,
        monthlySpend,
        potentialSavings,
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
        return res.status(400).json({ error: "User not associated with an organization" });
      }
      const { type } = req.query;
      const conversations = type 
        ? await storage.getConversationsByType(type as string, user.organizationId)
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
        return res.status(400).json({ error: "User not associated with an organization" });
      }
      const conversation = await storage.getConversation(req.params.id, user.organizationId);
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
        return res.status(400).json({ error: "User not associated with an organization" });
      }
      const validatedData = insertConversationSchema.parse(req.body);
      const conversation = await storage.createConversation({
        ...validatedData,
        organizationId: user.organizationId
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
        return res.status(400).json({ error: "User not associated with an organization" });
      }
      const conversation = await storage.updateConversation(req.params.id, user.organizationId, req.body);
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
        return res.status(400).json({ error: "User not associated with an organization" });
      }
      const deleted = await storage.deleteConversation(req.params.id, user.organizationId);
      if (!deleted) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete conversation" });
    }
  });

  // Messages
  app.get("/api/conversations/:conversationId/messages", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const user = await storage.getUser(userId);
      if (!user || !user.organizationId) {
        return res.status(400).json({ error: "User not associated with an organization" });
      }
      const messages = await storage.getMessages(req.params.conversationId, user.organizationId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/conversations/:conversationId/messages", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const user = await storage.getUser(userId);
      if (!user || !user.organizationId) {
        return res.status(400).json({ error: "User not associated with an organization" });
      }
      const validatedData = insertMessageSchema.parse({
        ...req.body,
        conversationId: req.params.conversationId
      });
      const message = await storage.createMessage({
        ...validatedData,
        organizationId: user.organizationId
      });
      
      // Broadcast message to all WebSocket clients in this conversation
      const data = JSON.stringify({
        type: 'new_message',
        conversationId: req.params.conversationId,
        message
      });
      
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(data);
        }
      });
      
      res.status(201).json(message);
    } catch (error) {
      res.status(400).json({ error: "Invalid message data" });
    }
  });

  const httpServer = createServer(app);
  
  // WebSocket Server for real-time messaging (auth will be added later)
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');

    ws.on('message', async (data) => {
      try {
        const payload = JSON.parse(data.toString());
        
        if (payload.type === 'send_message') {
          const message = await storage.createMessage({
            conversationId: payload.conversationId,
            senderName: payload.senderName,
            senderRole: payload.senderRole,
            content: payload.content,
            messageType: payload.messageType || 'text',
            organizationId: payload.organizationId
          });

          // Broadcast to all clients
          const broadcastData = JSON.stringify({
            type: 'new_message',
            conversationId: payload.conversationId,
            message
          });

          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(broadcastData);
            }
          });
        }
      } catch (error) {
        console.error('WebSocket error:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  return httpServer;
}
