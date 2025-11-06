import { storage } from "./storage";

const SUPPORTED_INTEGRATIONS = [
  { name: "Google Workspace", iconUrl: "/assets/generated_images/google_1761955119053.png" },
  { name: "Entro SSO", iconUrl: "/assets/generated_images/entra_1761955119056.png" },
  { name: "Microsoft Office", iconUrl: "/assets/generated_images/office_1761955490846.png" },
  { name: "Okta", iconUrl: "/assets/generated_images/okta_1761955490846.png" },
  { name: "1Password", iconUrl: "/assets/generated_images/1password_1761954600237.png" },
  { name: "Adobe Creative", iconUrl: "/assets/generated_images/adobe_1761954824365.png" },
  { name: "Shared drives", iconUrl: "/assets/generated_images/drives_1761955119056.png" },
  { name: "Dropbox", iconUrl: "/assets/generated_images/dropbox_1761955119056.png" },
  { name: "Box Business", iconUrl: "/assets/generated_images/box_1761954903368.png" },
  { name: "LastPass", iconUrl: "/assets/generated_images/lastpass_1761955119055.png" },
  { name: "Share File for Business", iconUrl: "/assets/generated_images/sharefile_1761956815290.png" },
  { name: "Asana", iconUrl: "/assets/generated_images/asana_1761954903371.png" },
  { name: "Github", iconUrl: "/assets/generated_images/github_1761955119057.png" },
  { name: "GitLab", iconUrl: "/assets/generated_images/gitlab_1761955119057.png" },
  { name: "Hubspot", iconUrl: "/assets/generated_images/hubspot_1761955119054.png" },
  { name: "Luma", iconUrl: "/assets/generated_images/luma_1761955490851.png" },
  { name: "OpenVPN", iconUrl: "/assets/generated_images/openvpn_1761955490847.png" },
  { name: "Notion", iconUrl: "/assets/generated_images/notion_1761955490846.png" },
  { name: "Tailscale", iconUrl: "/assets/generated_images/tailscale_1761955490849.png" },
  { name: "Bitbucket", iconUrl: "/assets/generated_images/bitbucket_1761954903367.png" },
  { name: "OneLogin", iconUrl: "/assets/generated_images/onelogin_1761955490847.png" },
  { name: "Teamwork", iconUrl: "/assets/generated_images/teamwork_1761955490849.png" },
  { name: "Atlassian", iconUrl: "/assets/generated_images/attlasian_1761954903372.png" },
  { name: "DOCUSIGN", iconUrl: "/assets/generated_images/docusign_1761955119056.png" },
  { name: "Confluence", iconUrl: "/assets/generated_images/confluence_1761954903370.png" },
  { name: "Jira", iconUrl: "/assets/generated_images/jira_1761955119054.png" },
  { name: "ClickUp", iconUrl: "/assets/generated_images/clickup_1761954903370.png" },
  { name: "Zendesk", iconUrl: "/assets/generated_images/zendesk_1761955662563.png" },
  { name: "SendGrid", iconUrl: "/assets/generated_images/sendgrid_1761955490848.png" },
  { name: "Calendly", iconUrl: "/assets/generated_images/calendly_1761954903369.png" },
  { name: "PandaDoc", iconUrl: "/assets/generated_images/pandadoc_1761955490847.png" },
  { name: "Cursor", iconUrl: "/assets/generated_images/cursor_1761954903371.png" },
  { name: "Instantly", iconUrl: "/assets/generated_images/instantly_1761956801748.png" },
  { name: "Mailchimp", iconUrl: "/assets/generated_images/mailchimp_1761955490851.png" },
  { name: "Vimeo", iconUrl: "/assets/generated_images/vemeo_1761955662563.png" },
  { name: "Linkedin", iconUrl: "/assets/generated_images/linkedin_1761955119055.png" },
  { name: "Terraform", iconUrl: "/assets/generated_images/terraform_1761955490850.png" },
  { name: "SmartBear", iconUrl: "/assets/generated_images/smartbear_1761955490849.png" },
  { name: "Thinkific", iconUrl: "/assets/generated_images/thinkfic_1761955490850.png" },
  { name: "Coderbyte", iconUrl: "/assets/generated_images/coderbyte_1761956782092.png" },
  { name: "Brillium", iconUrl: "/assets/generated_images/brillium_1761956763069.png" },
  { name: "Insightful", iconUrl: "/assets/generated_images/insightful_1761956791527.png" },
  { name: "Slack", iconUrl: "/assets/generated_images/slack_1761955490848.png" },
  { name: "Microsoft Teams", iconUrl: "/assets/generated_images/teams_1761955490849.png" },
  { name: "Google Chat", iconUrl: "/assets/generated_images/google chat_1761955119057.png" },
  { name: "Zoom", iconUrl: "/assets/generated_images/zoom_1761955662564.png" },
  { name: "Kapa AI", iconUrl: "/assets/generated_images/kapa_1761955976409.png" },
  { name: "Mural", iconUrl: "/assets/generated_images/mural_1761955490845.png" },
  { name: "Miro", iconUrl: "/assets/generated_images/miro_1761955490851.png" },
  { name: "Figma", iconUrl: "/assets/generated_images/figma_1761955119057.png" },
  { name: "Salesforce", iconUrl: "/assets/generated_images/salesforce_1761955490848.png" },
];

export async function seedData() {
  // Seed integrations (global, not per-organization)
  await seedIntegrations();

  // Check if demo organization already exists
  const allOrgs = await storage.getAllOrganizations();
  let demoOrg = allOrgs.find((org) => org.name === "Demo Organization");

  if (demoOrg) {
    console.log("Demo organization already exists, using existing one...");
  } else {
    console.log("Creating demo organization...");
    demoOrg = await storage.createOrganization({
      name: "Demo Organization",
      plan: "professional",
    });
  }

  // Check if data already exists for this organization
  const existingApps = await storage.getApplications(demoOrg.id);
  if (existingApps.length > 0) {
    console.log("Data already seeded for this organization, skipping...");
    return;
  }

  console.log("Seeding initial data...");
  await seedDemoDataForOrganization(demoOrg.id);
}

async function seedIntegrations() {
  // Check if integrations already exist
  const existingIntegrations = await storage.getAllIntegrations();
  if (existingIntegrations.length > 0) {
    console.log("Integrations already seeded, skipping...");
    return;
  }

  console.log("Seeding integrations...");
  for (const integration of SUPPORTED_INTEGRATIONS) {
    await storage.createIntegration({
      name: integration.name,
      description: `Integration for ${integration.name}`,
      iconUrl: integration.iconUrl,
    });
  }
  console.log(`Seeded ${SUPPORTED_INTEGRATIONS.length} integrations`);
}

export async function seedDemoDataForOrganization(organizationId: string) {
  // Check if data already exists for this organization
  const existingApps = await storage.getApplications(organizationId);
  if (existingApps.length > 0) {
    console.log("Data already seeded for this organization, skipping...");
    return;
  }

  // Get all integrations to link applications
  const integrations = await storage.getAllIntegrations();
  const findIntegrationId = (name: string) => {
    const integration = integrations.find(
      (i) => i.name.toLowerCase() === name.toLowerCase(),
    );
    return integration?.id;
  };

  // Helper function to get integration iconUrl
  const getIntegrationIconUrl = (name: string) => {
    const integration = integrations.find(
      (i) => i.name.toLowerCase() === name.toLowerCase(),
    );
    return integration?.iconUrl || "";
  };

  // Create applications with integration links
  const slack = await storage.createApplication({
    name: "Slack",
    category: "Communication",
    vendor: "Slack Technologies",
    status: "approved",
    monthlyCost: "800",
    description: "Team communication platform",
    logoUrl: getIntegrationIconUrl("Slack"),
    organizationId,
    integrationId: findIntegrationId("Slack"),
  });

  const salesforce = await storage.createApplication({
    name: "Salesforce",
    category: "CRM",
    vendor: "Salesforce Inc.",
    status: "approved",
    monthlyCost: "1500",
    description: "Customer relationship management",
    logoUrl: getIntegrationIconUrl("Salesforce"),
    organizationId,
    integrationId: findIntegrationId("Salesforce"),
  });

  const zoom = await storage.createApplication({
    name: "Zoom",
    category: "Video Conferencing",
    vendor: "Zoom Video Communications",
    status: "trial",
    monthlyCost: "350",
    description: "Video meetings and webinars",
    logoUrl: getIntegrationIconUrl("Zoom"),
    organizationId,
    integrationId: findIntegrationId("Zoom"),
  });

  const github = await storage.createApplication({
    name: "GitHub",
    category: "Development",
    vendor: "GitHub Inc.",
    status: "approved",
    monthlyCost: "840",
    description: "Code hosting and collaboration",
    logoUrl: getIntegrationIconUrl("Github"),
    organizationId,
    integrationId: findIntegrationId("Github"),
  });

  const figma = await storage.createApplication({
    name: "Figma",
    category: "Design",
    vendor: "Figma Inc.",
    status: "approved",
    monthlyCost: "300",
    description: "Collaborative design tool",
    logoUrl: getIntegrationIconUrl("Figma"),
    organizationId,
    integrationId: findIntegrationId("Figma"),
  });

  const notion = await storage.createApplication({
    name: "Notion",
    category: "Productivity",
    vendor: "Notion Labs",
    status: "shadow",
    monthlyCost: "80",
    description: "All-in-one workspace",
    logoUrl: getIntegrationIconUrl("Notion"),
    organizationId,
    integrationId: findIntegrationId("Notion"),
  });

  // Create licenses
  await storage.createLicense({
    applicationId: slack.id,
    totalLicenses: 50,
    activeUsers: 42,
    idleUsers: 3,
    inactiveUsers: 5,
    billableUsers: 50,
    costPerLicense: "16",
    organizationId,
  });

  await storage.createLicense({
    applicationId: salesforce.id,
    totalLicenses: 30,
    activeUsers: 25,
    idleUsers: 3,
    inactiveUsers: 2,
    billableUsers: 30,
    costPerLicense: "50",
    organizationId,
  });

  await storage.createLicense({
    applicationId: zoom.id,
    totalLicenses: 25,
    activeUsers: 12,
    idleUsers: 3,
    inactiveUsers: 10,
    billableUsers: 15,
    costPerLicense: "12",
    organizationId,
  });

  await storage.createLicense({
    applicationId: github.id,
    totalLicenses: 40,
    activeUsers: 35,
    idleUsers: 3,
    inactiveUsers: 2,
    billableUsers: 40,
    costPerLicense: "21",
    organizationId,
  });

  await storage.createLicense({
    applicationId: figma.id,
    totalLicenses: 20,
    activeUsers: 10,
    idleUsers: 2,
    inactiveUsers: 8,
    billableUsers: 12,
    costPerLicense: "15",
    organizationId,
  });

  await storage.createLicense({
    applicationId: notion.id,
    totalLicenses: 15,
    activeUsers: 8,
    idleUsers: 2,
    inactiveUsers: 5,
    billableUsers: 10,
    costPerLicense: "8",
    organizationId,
  });

  // Create renewals
  const today = new Date();

  await storage.createRenewal({
    applicationId: salesforce.id,
    renewalDate: new Date(today.getFullYear(), today.getMonth() + 1, 15),
    annualCost: "18000",
    contractValue: "18000",
    autoRenew: true,
    organizationId,
  });

  await storage.createRenewal({
    applicationId: github.id,
    renewalDate: new Date(today.getFullYear(), today.getMonth() + 2, 20),
    annualCost: "10080",
    contractValue: "10080",
    autoRenew: true,
    organizationId,
  });

  await storage.createRenewal({
    applicationId: slack.id,
    renewalDate: new Date(today.getFullYear(), today.getMonth() + 3, 10),
    annualCost: "9600",
    contractValue: "9600",
    autoRenew: true,
    organizationId,
  });

  await storage.createRenewal({
    applicationId: zoom.id,
    renewalDate: new Date(today.getFullYear(), today.getMonth() + 4, 5),
    annualCost: "3600",
    contractValue: "3600",
    autoRenew: false,
    organizationId,
  });

  // Create recommendations
  await storage.createRecommendation({
    applicationId: zoom.id,
    type: "downgrade",
    title: "Downgrade to lower tier",
    description:
      "Current usage patterns suggest a lower tier plan would suffice. Save money without losing essential features.",
    priority: "medium",
    actionLabel: "Review Downgrade",
    currentCost: "300",
    potentialCost: "180",
    currentUsers: 25,
    activeUsers: 15,
    organizationId,
  });

  await storage.createRecommendation({
    applicationId: salesforce.id,
    type: "renew",
    title: "Contract renewal approaching",
    description:
      "Annual contract expires in 30 days. Review terms and negotiate better rates before auto-renewal.",
    priority: "high",
    actionLabel: "Review Renewal",
    renewalDate: "Dec 15, 2024",
    contractValue: "18000",
    organizationId,
  });

  await storage.createRecommendation({
    applicationId: slack.id,
    type: "track-users",
    title: "Monitor user activity",
    description:
      "10 users inactive for 30+ days. Track usage patterns to optimize license allocation.",
    priority: "low",
    actionLabel: "View Users",
    currentUsers: 50,
    activeUsers: 40,
    organizationId,
  });

  await storage.createRecommendation({
    applicationId: figma.id,
    type: "cost-review",
    title: "Cost per signed agreement review",
    description:
      "Actual spend deviates from signed agreement. Review contract terms and billing.",
    priority: "high",
    actionLabel: "Review Cost",
    currentCost: "450",
    potentialCost: "300",
    contractValue: "3600",
    organizationId,
  });

  // Create spending history
  const currentYear = new Date().getFullYear();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const spendValues = [7200, 7500, 7800, 8100, 8000, 8420];

  for (let i = 0; i < months.length; i++) {
    await storage.createSpendingHistory({
      month: months[i],
      year: currentYear,
      totalSpend: spendValues[i].toString(),
      organizationId,
    });
  }

  // Create team chat conversations for ALL applications by integrationId
  const allApps = [slack, zoom, github, figma, notion, salesforce];
  
  for (const app of allApps) {
    if (app.integrationId) {
      await storage.createConversation({
        type: "internal",
        integrationId: app.integrationId,
        title: `${app.name} Team Discussion`,
        status: "active",
        organizationId,
      });
    }
  }

  // Add sample messages to Slack conversation
  const slackChat = slack.integrationId 
    ? await storage.getConversationByIntegrationId(slack.integrationId, organizationId)
    : undefined;
  
  if (slackChat) {
    await storage.createMessage({
      conversationId: slackChat.id,
      senderName: "Sarah Chen",
      senderRole: "user",
      content: "Has anyone noticed the new Slack features in the latest update?",
      messageType: "text",
      organizationId,
    });

    await storage.createMessage({
      conversationId: slackChat.id,
      senderName: "Mike Johnson",
      senderRole: "user",
      content: "Yes! The new workflow automation is really helpful for our team.",
      messageType: "text",
      organizationId,
    });
  }

  // Add sample messages to GitHub conversation
  const githubChat = github.integrationId 
    ? await storage.getConversationByIntegrationId(github.integrationId, organizationId)
    : undefined;
  
  if (githubChat) {
    await storage.createMessage({
      conversationId: githubChat.id,
      senderName: "Alex Torres",
      senderRole: "admin",
      content:
        "Team, we have 5 inactive licenses on GitHub. Let's review who needs access.",
      messageType: "text",
      organizationId,
    });

    await storage.createMessage({
      conversationId: githubChat.id,
      senderName: "Emma Davis",
      senderRole: "user",
      content:
        "I can help audit the team members. Some folks from the old project might not need access anymore.",
      messageType: "text",
      organizationId,
    });
  }

  // Create conversations - Vendor CRM
  const salesforceCRM = await storage.createConversation({
    type: "vendor",
    integrationId: salesforce.integrationId ?? undefined,
    title: "Salesforce License Negotiation",
    vendorName: "Salesforce Account Team",
    status: "active",
    organizationId,
  });

  await storage.createMessage({
    conversationId: salesforceCRM.id,
    senderName: "Admin",
    senderRole: "admin",
    content:
      "Hi team, we're looking to optimize our Salesforce licenses. We currently have 30 licenses but only 28 active users. Can we discuss reducing our plan?",
    messageType: "text",
    organizationId,
  });

  await storage.createMessage({
    conversationId: salesforceCRM.id,
    senderName: "Jennifer Smith - Salesforce",
    senderRole: "vendor",
    content:
      "Thank you for reaching out! I'd be happy to review your usage. Let me pull up your account details and we can discuss options for right-sizing your subscription.",
    messageType: "text",
    organizationId,
  });

  await storage.createMessage({
    conversationId: salesforceCRM.id,
    senderName: "Admin",
    senderRole: "admin",
    content:
      "That would be great. We're also approaching our renewal date and want to make sure we're getting the best value.",
    messageType: "text",
    organizationId,
  });

  const zoomCRM = await storage.createConversation({
    type: "vendor",
    integrationId: zoom.integrationId ?? undefined,
    title: "Zoom Plan Downgrade Discussion",
    vendorName: "Zoom Sales Team",
    status: "active",
    organizationId,
  });

  await storage.createMessage({
    conversationId: zoomCRM.id,
    senderName: "Admin",
    senderRole: "admin",
    content:
      "Hello, our team is considering downgrading from our current Zoom plan. We have 25 licenses but only 15 active users. What options do we have?",
    messageType: "text",
    organizationId,
  });

  await storage.createMessage({
    conversationId: zoomCRM.id,
    senderName: "David Park - Zoom",
    senderRole: "vendor",
    content:
      "Hi there! I can definitely help you find a better fit. Based on your usage, we have a Business plan that would work well for 15-20 users. This could save you approximately $120/month.",
    messageType: "text",
    organizationId,
  });

  console.log("Data seeded successfully!");
}
