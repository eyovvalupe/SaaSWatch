import { storage } from "./storage";

export async function seedData() {
  // Check if data already exists
  const existingApps = await storage.getApplications();
  if (existingApps.length > 0) {
    console.log("Data already seeded, skipping...");
    return;
  }

  console.log("Seeding initial data...");

  // Create applications
  const slack = await storage.createApplication({
    name: "Slack",
    category: "Communication",
    vendor: "Slack Technologies",
    status: "approved",
    monthlyCost: "800",
    description: "Team communication platform",
    logoUrl: "/assets/generated_images/Slack_app_icon_a668dc5a.png"
  });

  const salesforce = await storage.createApplication({
    name: "Salesforce",
    category: "CRM",
    vendor: "Salesforce Inc.",
    status: "approved",
    monthlyCost: "1500",
    description: "Customer relationship management",
    logoUrl: "/assets/generated_images/Salesforce_app_icon_0d18cc45.png"
  });

  const zoom = await storage.createApplication({
    name: "Zoom",
    category: "Video Conferencing",
    vendor: "Zoom Video Communications",
    status: "trial",
    monthlyCost: "300",
    description: "Video meetings and webinars",
    logoUrl: "/assets/generated_images/Zoom_app_icon_3be960fb.png"
  });

  const github = await storage.createApplication({
    name: "GitHub",
    category: "Development",
    vendor: "GitHub Inc.",
    status: "approved",
    monthlyCost: "840",
    description: "Code hosting and collaboration",
    logoUrl: "/assets/generated_images/GitHub_app_icon_40d531dd.png"
  });

  const figma = await storage.createApplication({
    name: "Figma",
    category: "Design",
    vendor: "Figma Inc.",
    status: "approved",
    monthlyCost: "300",
    description: "Collaborative design tool",
    logoUrl: "/assets/generated_images/Figma_app_icon_91c3879c.png"
  });

  const notion = await storage.createApplication({
    name: "Notion",
    category: "Productivity",
    vendor: "Notion Labs",
    status: "shadow",
    monthlyCost: "80",
    description: "All-in-one workspace",
    logoUrl: "/assets/generated_images/Notion_app_icon_9574a133.png"
  });

  // Create licenses
  await storage.createLicense({
    applicationId: slack.id,
    totalLicenses: 50,
    activeUsers: 45,
    costPerLicense: "16"
  });

  await storage.createLicense({
    applicationId: salesforce.id,
    totalLicenses: 30,
    activeUsers: 28,
    costPerLicense: "50"
  });

  await storage.createLicense({
    applicationId: zoom.id,
    totalLicenses: 25,
    activeUsers: 15,
    costPerLicense: "12"
  });

  await storage.createLicense({
    applicationId: github.id,
    totalLicenses: 40,
    activeUsers: 38,
    costPerLicense: "21"
  });

  await storage.createLicense({
    applicationId: figma.id,
    totalLicenses: 20,
    activeUsers: 12,
    costPerLicense: "15"
  });

  // Create renewals
  const today = new Date();
  
  await storage.createRenewal({
    applicationId: salesforce.id,
    renewalDate: new Date(today.getFullYear(), today.getMonth() + 1, 15),
    annualCost: "18000",
    contractValue: "18000",
    autoRenew: true
  });

  await storage.createRenewal({
    applicationId: github.id,
    renewalDate: new Date(today.getFullYear(), today.getMonth() + 2, 20),
    annualCost: "10080",
    contractValue: "10080",
    autoRenew: true
  });

  await storage.createRenewal({
    applicationId: slack.id,
    renewalDate: new Date(today.getFullYear(), today.getMonth() + 3, 10),
    annualCost: "9600",
    contractValue: "9600",
    autoRenew: true
  });

  await storage.createRenewal({
    applicationId: zoom.id,
    renewalDate: new Date(today.getFullYear(), today.getMonth() + 4, 5),
    annualCost: "3600",
    contractValue: "3600",
    autoRenew: false
  });

  // Create recommendations
  await storage.createRecommendation({
    applicationId: zoom.id,
    type: "downgrade",
    title: "Downgrade to lower tier",
    description: "Current usage patterns suggest a lower tier plan would suffice. Save money without losing essential features.",
    priority: "medium",
    actionLabel: "Review Downgrade",
    currentCost: "300",
    potentialCost: "180",
    currentUsers: 25,
    activeUsers: 15
  });

  await storage.createRecommendation({
    applicationId: salesforce.id,
    type: "renew",
    title: "Contract renewal approaching",
    description: "Annual contract expires in 30 days. Review terms and negotiate better rates before auto-renewal.",
    priority: "high",
    actionLabel: "Review Renewal",
    renewalDate: "Dec 15, 2024",
    contractValue: "18000"
  });

  await storage.createRecommendation({
    applicationId: slack.id,
    type: "track-users",
    title: "Monitor user activity",
    description: "10 users inactive for 30+ days. Track usage patterns to optimize license allocation.",
    priority: "low",
    actionLabel: "View Users",
    currentUsers: 50,
    activeUsers: 40
  });

  await storage.createRecommendation({
    applicationId: figma.id,
    type: "cost-review",
    title: "Cost per signed agreement review",
    description: "Actual spend deviates from signed agreement. Review contract terms and billing.",
    priority: "high",
    actionLabel: "Review Cost",
    currentCost: "450",
    potentialCost: "300",
    contractValue: "3600"
  });

  // Create spending history
  const currentYear = new Date().getFullYear();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const spendValues = [7200, 7500, 7800, 8100, 8000, 8420];

  for (let i = 0; i < months.length; i++) {
    await storage.createSpendingHistory({
      month: months[i],
      year: currentYear,
      totalSpend: spendValues[i].toString()
    });
  }

  // Create conversations - Internal team chat
  const slackChat = await storage.createConversation({
    type: "internal",
    applicationId: slack.id,
    title: "Slack Usage Discussion",
    status: "active"
  });

  await storage.createMessage({
    conversationId: slackChat.id,
    senderName: "Sarah Chen",
    senderRole: "user",
    content: "Has anyone noticed the new Slack features in the latest update?",
    messageType: "text"
  });

  await storage.createMessage({
    conversationId: slackChat.id,
    senderName: "Mike Johnson",
    senderRole: "user",
    content: "Yes! The new workflow automation is really helpful for our team.",
    messageType: "text"
  });

  const githubChat = await storage.createConversation({
    type: "internal",
    applicationId: github.id,
    title: "GitHub License Optimization",
    status: "active"
  });

  await storage.createMessage({
    conversationId: githubChat.id,
    senderName: "Alex Torres",
    senderRole: "admin",
    content: "Team, we have 5 inactive licenses on GitHub. Let's review who needs access.",
    messageType: "text"
  });

  await storage.createMessage({
    conversationId: githubChat.id,
    senderName: "Emma Davis",
    senderRole: "user",
    content: "I can help audit the team members. Some folks from the old project might not need access anymore.",
    messageType: "text"
  });

  // Create conversations - Vendor CRM
  const salesforceCRM = await storage.createConversation({
    type: "vendor",
    applicationId: salesforce.id,
    title: "Salesforce License Negotiation",
    vendorName: "Salesforce Account Team",
    status: "active"
  });

  await storage.createMessage({
    conversationId: salesforceCRM.id,
    senderName: "Admin",
    senderRole: "admin",
    content: "Hi team, we're looking to optimize our Salesforce licenses. We currently have 30 licenses but only 28 active users. Can we discuss reducing our plan?",
    messageType: "text"
  });

  await storage.createMessage({
    conversationId: salesforceCRM.id,
    senderName: "Jennifer Smith - Salesforce",
    senderRole: "vendor",
    content: "Thank you for reaching out! I'd be happy to review your usage. Let me pull up your account details and we can discuss options for right-sizing your subscription.",
    messageType: "text"
  });

  await storage.createMessage({
    conversationId: salesforceCRM.id,
    senderName: "Admin",
    senderRole: "admin",
    content: "That would be great. We're also approaching our renewal date and want to make sure we're getting the best value.",
    messageType: "text"
  });

  const zoomCRM = await storage.createConversation({
    type: "vendor",
    applicationId: zoom.id,
    title: "Zoom Plan Downgrade Discussion",
    vendorName: "Zoom Sales Team",
    status: "active"
  });

  await storage.createMessage({
    conversationId: zoomCRM.id,
    senderName: "Admin",
    senderRole: "admin",
    content: "Hello, our team is considering downgrading from our current Zoom plan. We have 25 licenses but only 15 active users. What options do we have?",
    messageType: "text"
  });

  await storage.createMessage({
    conversationId: zoomCRM.id,
    senderName: "David Park - Zoom",
    senderRole: "vendor",
    content: "Hi there! I can definitely help you find a better fit. Based on your usage, we have a Business plan that would work well for 15-20 users. This could save you approximately $120/month.",
    messageType: "text"
  });

  console.log("Data seeded successfully!");
}
