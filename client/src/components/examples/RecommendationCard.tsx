import { RecommendationCard } from '../RecommendationCard';

export default function RecommendationCardExample() {
  return (
    <div className="grid gap-4 p-4">
      <RecommendationCard
        id="1"
        type="underutilized"
        title="Zoom licenses underutilized"
        description="10 out of 25 Zoom licenses are unused. Consider reducing licenses."
        potentialSavings={120}
        onAction={() => console.log('Review Zoom licenses')}
      />
      <RecommendationCard
        id="2"
        type="duplicate"
        title="Duplicate design tools detected"
        description="Both Figma and Sketch are being used. Consolidating could save costs."
        potentialSavings={300}
        onAction={() => console.log('Review duplicate tools')}
      />
      <RecommendationCard
        id="3"
        type="unused"
        title="Unused Notion workspace"
        description="No activity in the last 30 days. Consider canceling the subscription."
        potentialSavings={80}
        onAction={() => console.log('Review Notion usage')}
      />
    </div>
  );
}
