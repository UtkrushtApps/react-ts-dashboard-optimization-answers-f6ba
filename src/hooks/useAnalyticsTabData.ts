import { useEffect } from "react";
import { useAnalyticsData } from "../context/AnalyticsDataContext";

export function useOverviewTabData(autoFetch: boolean = true) {
  const { state, fetchOverview } = useAnalyticsData();

  useEffect(() => {
    if (autoFetch && state.overview.status === "idle") {
      void fetchOverview();
    }
  }, [autoFetch, state.overview.status, fetchOverview]);

  return state.overview;
}

export function useScoresTabData(autoFetch: boolean = true) {
  const { state, fetchScores } = useAnalyticsData();

  useEffect(() => {
    if (autoFetch && state.scores.status === "idle") {
      void fetchScores();
    }
  }, [autoFetch, state.scores.status, fetchScores]);

  return state.scores;
}

export function useActivityTabData(autoFetch: boolean = true) {
  const { state, fetchActivity } = useAnalyticsData();

  useEffect(() => {
    if (autoFetch && state.activity.status === "idle") {
      void fetchActivity();
    }
  }, [autoFetch, state.activity.status, fetchActivity]);

  return state.activity;
}
