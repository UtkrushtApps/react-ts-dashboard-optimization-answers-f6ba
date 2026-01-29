import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { fetchActivityRows, fetchOverviewMetrics, fetchScoreRows } from "../api/analyticsApi";
import type { ActivityRow, OverviewMetric, ScoreRow } from "../types/analytics";

interface TabState<T> {
  status: "idle" | "loading" | "success" | "error";
  data: T | null;
  error: string | null;
}

interface AnalyticsState {
  overview: TabState<OverviewMetric[]>;
  scores: TabState<ScoreRow[]>;
  activity: TabState<ActivityRow[]>;
}

type Action =
  | { type: "FETCH_OVERVIEW_START" }
  | { type: "FETCH_OVERVIEW_SUCCESS"; payload: OverviewMetric[] }
  | { type: "FETCH_OVERVIEW_ERROR"; payload: string }
  | { type: "FETCH_SCORES_START" }
  | { type: "FETCH_SCORES_SUCCESS"; payload: ScoreRow[] }
  | { type: "FETCH_SCORES_ERROR"; payload: string }
  | { type: "FETCH_ACTIVITY_START" }
  | { type: "FETCH_ACTIVITY_SUCCESS"; payload: ActivityRow[] }
  | { type: "FETCH_ACTIVITY_ERROR"; payload: string };

const initialTabState = <T,>(): TabState<T> => ({
  status: "idle",
  data: null,
  error: null,
});

const initialState: AnalyticsState = {
  overview: initialTabState<OverviewMetric[]>(),
  scores: initialTabState<ScoreRow[]>(),
  activity: initialTabState<ActivityRow[]>(),
};

function analyticsReducer(state: AnalyticsState, action: Action): AnalyticsState {
  switch (action.type) {
    case "FETCH_OVERVIEW_START":
      return {
        ...state,
        overview: {
          ...state.overview,
          status: "loading",
          error: null,
        },
      };
    case "FETCH_OVERVIEW_SUCCESS":
      return {
        ...state,
        overview: {
          status: "success",
          data: action.payload,
          error: null,
        },
      };
    case "FETCH_OVERVIEW_ERROR":
      return {
        ...state,
        overview: {
          status: "error",
          data: state.overview.data,
          error: action.payload,
        },
      };

    case "FETCH_SCORES_START":
      return {
        ...state,
        scores: {
          ...state.scores,
          status: "loading",
          error: null,
        },
      };
    case "FETCH_SCORES_SUCCESS":
      return {
        ...state,
        scores: {
          status: "success",
          data: action.payload,
          error: null,
        },
      };
    case "FETCH_SCORES_ERROR":
      return {
        ...state,
        scores: {
          status: "error",
          data: state.scores.data,
          error: action.payload,
        },
      };

    case "FETCH_ACTIVITY_START":
      return {
        ...state,
        activity: {
          ...state.activity,
          status: "loading",
          error: null,
        },
      };
    case "FETCH_ACTIVITY_SUCCESS":
      return {
        ...state,
        activity: {
          status: "success",
          data: action.payload,
          error: null,
        },
      };
    case "FETCH_ACTIVITY_ERROR":
      return {
        ...state,
        activity: {
          status: "error",
          data: state.activity.data,
          error: action.payload,
        },
      };

    default:
      return state;
  }
}

interface AnalyticsContextValue {
  state: AnalyticsState;
  fetchOverview: () => Promise<void>;
  fetchScores: () => Promise<void>;
  fetchActivity: () => Promise<void>;
}

const AnalyticsDataContext = createContext<AnalyticsContextValue | undefined>(
  undefined,
);

export const AnalyticsDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(analyticsReducer, initialState);

  /**
   * Lazy, cached fetch for overview metrics.
   * Only hits the API if we don't already have successful data.
   */
  const fetchOverview = useCallback(async () => {
    if (state.overview.status === "loading" || state.overview.status === "success") {
      return;
    }

    dispatch({ type: "FETCH_OVERVIEW_START" });

    try {
      const data = await fetchOverviewMetrics();
      dispatch({ type: "FETCH_OVERVIEW_SUCCESS", payload: data });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load overview metrics";
      dispatch({ type: "FETCH_OVERVIEW_ERROR", payload: message });
    }
  }, [state.overview.status]);

  /**
   * Lazy, cached fetch for score rows.
   */
  const fetchScores = useCallback(async () => {
    if (state.scores.status === "loading" || state.scores.status === "success") {
      return;
    }

    dispatch({ type: "FETCH_SCORES_START" });

    try {
      const data = await fetchScoreRows();
      dispatch({ type: "FETCH_SCORES_SUCCESS", payload: data });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load scores";
      dispatch({ type: "FETCH_SCORES_ERROR", payload: message });
    }
  }, [state.scores.status]);

  /**
   * Lazy, cached fetch for activity rows.
   */
  const fetchActivity = useCallback(async () => {
    if (state.activity.status === "loading" || state.activity.status === "success") {
      return;
    }

    dispatch({ type: "FETCH_ACTIVITY_START" });

    try {
      const data = await fetchActivityRows();
      dispatch({ type: "FETCH_ACTIVITY_SUCCESS", payload: data });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load activity";
      dispatch({ type: "FETCH_ACTIVITY_ERROR", payload: message });
    }
  }, [state.activity.status]);

  const value: AnalyticsContextValue = useMemo(
    () => ({ state, fetchOverview, fetchScores, fetchActivity }),
    [state, fetchOverview, fetchScores, fetchActivity],
  );

  return (
    <AnalyticsDataContext.Provider value={value}>
      {children}
    </AnalyticsDataContext.Provider>
  );
};

export function useAnalyticsData(): AnalyticsContextValue {
  const ctx = useContext(AnalyticsDataContext);
  if (!ctx) {
    throw new Error("useAnalyticsData must be used within an AnalyticsDataProvider");
  }
  return ctx;
}
