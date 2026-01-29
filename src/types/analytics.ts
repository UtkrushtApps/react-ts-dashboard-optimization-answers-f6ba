export type TabId = "overview" | "scores" | "activity";

export interface OverviewMetric {
  id: string;
  label: string;
  value: number;
  /**
   * Percentage delta vs previous period.
   * Positive = improvement, negative = decline.
   */
  delta: number;
}

export interface ScoreRow {
  id: string;
  candidateName: string;
  assessmentName: string;
  score: number;
  percentile: number;
  submittedAt: string; // ISO string for simplicity
  durationMinutes: number;
}

export interface ActivityRow {
  id: string;
  candidateName: string;
  eventType: "start" | "submit" | "abandon" | "review";
  assessmentName: string;
  timestamp: string; // ISO string
  metadata: string;
}
