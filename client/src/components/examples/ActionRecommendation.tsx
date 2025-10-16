import { ActionRecommendation } from '../ActionRecommendation';

export default function ActionRecommendationExample() {
  return (
    <div className="grid gap-4 p-4">
      <ActionRecommendation
        id="1"
        type="downgrade"
        appName="Zoom"
        title="Downgrade to lower tier"
        description="Current usage patterns suggest a lower tier plan would suffice. Save money without losing essential features."
        priority="medium"
        actionLabel="Review Downgrade"
        metadata={{
          currentCost: 300,
          potentialCost: 180,
          currentUsers: 25,
          activeUsers: 15
        }}
        onAction={() => console.log('Review downgrade')}
      />
      
      <ActionRecommendation
        id="2"
        type="renew"
        appName="Salesforce"
        title="Contract renewal approaching"
        description="Annual contract expires in 30 days. Review terms and negotiate better rates before auto-renewal."
        priority="high"
        actionLabel="Review Renewal"
        metadata={{
          renewalDate: "Dec 15, 2024",
          contractValue: 18000
        }}
        onAction={() => console.log('Review renewal')}
      />
      
      <ActionRecommendation
        id="3"
        type="track-users"
        appName="Slack"
        title="Monitor user activity"
        description="10 users inactive for 30+ days. Track usage patterns to optimize license allocation."
        priority="low"
        actionLabel="View Users"
        metadata={{
          currentUsers: 50,
          activeUsers: 40
        }}
        onAction={() => console.log('Track users')}
      />
      
      <ActionRecommendation
        id="4"
        type="review-renewal"
        appName="GitHub"
        title="Review renewal terms"
        description="Renewal date in 45 days. Current agreement may have better alternatives available."
        priority="medium"
        actionLabel="Review Agreement"
        metadata={{
          renewalDate: "Jan 20, 2025",
          currentCost: 840,
          contractValue: 10080
        }}
        onAction={() => console.log('Review agreement')}
      />
      
      <ActionRecommendation
        id="5"
        type="cost-review"
        appName="Figma"
        title="Cost per signed agreement review"
        description="Actual spend deviates from signed agreement. Review contract terms and billing."
        priority="high"
        actionLabel="Review Cost"
        metadata={{
          currentCost: 450,
          potentialCost: 300,
          contractValue: 3600
        }}
        onAction={() => console.log('Review cost')}
      />
    </div>
  );
}
