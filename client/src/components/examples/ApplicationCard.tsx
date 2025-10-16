import { ApplicationCard } from '../ApplicationCard';
import slackLogo from '@assets/generated_images/Slack_app_icon_a668dc5a.png';
import salesforceLogo from '@assets/generated_images/Salesforce_app_icon_0d18cc45.png';
import zoomLogo from '@assets/generated_images/Zoom_app_icon_3be960fb.png';

export default function ApplicationCardExample() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-4">
      <ApplicationCard
        id="slack"
        name="Slack"
        category="Communication"
        monthlyCost={800}
        status="approved"
        logo={slackLogo}
        onClick={() => console.log('Slack clicked')}
      />
      <ApplicationCard
        id="salesforce"
        name="Salesforce"
        category="CRM"
        monthlyCost={1500}
        status="approved"
        logo={salesforceLogo}
        onClick={() => console.log('Salesforce clicked')}
      />
      <ApplicationCard
        id="zoom"
        name="Zoom"
        category="Video Conferencing"
        monthlyCost={300}
        status="trial"
        logo={zoomLogo}
        onClick={() => console.log('Zoom clicked')}
      />
    </div>
  );
}
