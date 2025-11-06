import { storage } from "./storage";

const INTEGRATION_ICONS = {
  "Google Workspace": "/assets/google_workspace_1761955490844.png",
  "Entro SSO": "/assets/entro_1761955490844.png",
  "Microsoft Office": "/assets/office_1761955490846.png",
  "Okta": "/assets/okta_1761955490846.png",
  "1Password": "/assets/1password_1761955490842.png",
  "Adobe Creative": "/assets/adobe_1761955490842.png",
  "Dropbox": "/assets/dropbox_1761955490844.png",
  "Box Business": "/assets/box_1761955490843.png",
  "LastPass": "/assets/lastpass_1761955490845.png",
  "Share File for Business": "/assets/sharefile_1761955490848.png",
  "Asana": "/assets/asana_1761955490842.png",
  "Github": "/assets/github_1761955490844.png",
  "GitLab": "/assets/gitlab_1761955490844.png",
  "Hubspot": "/assets/hubspot_1761955490845.png",
  "Luma": "/assets/luma_1761955490851.png",
  "OpenVPN": "/assets/openvpn_1761955490847.png",
  "Notion": "/assets/notion_1761955490846.png",
  "Bitbucket": "/assets/bitbucket_1761955490843.png",
  "OneLogin": "/assets/onelogin_1761955490847.png",
  "Teamwork": "/assets/teamwork_1761955490849.png",
  "Atlassian": "/assets/atlassian_1761955490842.png",
  "DOCUSIGN": "/assets/docusign_1761955490844.png",
  "Confluence": "/assets/confluence_1761955490843.png",
  "Jira": "/assets/jira_1761955490845.png",
  "ClickUp": "/assets/clickup_1761955490843.png",
  "Zendesk": "/assets/zendesk_1761955662563.png",
  "SendGrid": "/assets/sendgrid_1761955490848.png",
  "Calendly": "/assets/calendly_1761955490843.png",
  "PandaDoc": "/assets/pandadoc_1761955490847.png",
  "Cursor": "/assets/cursor_1761955490843.png",
  "Mailchimp": "/assets/mailchimp_1761955490851.png",
  "Vimeo": "/assets/vemeo_1761955662563.png",
  "Linkedin": "/assets/linkedin_1761955490845.png",
  "Terraform": "/assets/terraform_1761955490850.png",
  "SmartBear": "/assets/smartbear_1761955490849.png",
  "Thinkific": "/assets/thinkfic_1761955490850.png",
  "Slack": "/assets/slack_1761955490848.png",
  "Microsoft Teams": "/assets/teams_1761955490849.png",
  "Google Chat": "/assets/google_chat_1761955490844.png",
  "Zoom": "/assets/zoom_1761955662564.png",
  "Kapa AI": "/assets/kapa_1761955976409.png",
  "Mural": "/assets/mural_1761955490845.png",
  "Miro": "/assets/miro_1761955490851.png",
  "Figma": "/assets/figma_1761955490844.png",
  "Salesforce": "/assets/salesforce_1761955490848.png",
};

async function migrateIcons() {
  console.log("Starting icon migration...");
  
  const integrations = await storage.getAllIntegrations();
  let updated = 0;
  
  for (const integration of integrations) {
    const iconUrl = INTEGRATION_ICONS[integration.name as keyof typeof INTEGRATION_ICONS];
    
    if (iconUrl && (!integration.iconUrl || integration.iconUrl === "")) {
      await storage.updateIntegration(integration.id, {
        iconUrl: iconUrl
      });
      console.log(`Updated ${integration.name} with icon`);
      updated++;
    }
  }
  
  console.log(`Migration complete! Updated ${updated} integrations with icons.`);
  process.exit(0);
}

migrateIcons().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
