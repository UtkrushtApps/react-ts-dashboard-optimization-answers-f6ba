import { ActivityRow, OverviewMetric, ScoreRow } from "../types/analytics";

const NETWORK_DELAY_MS = 600;

/**
 * Simulate network latency with a Promise wrapper.
 */
function withLatency<T>(factory: () => T, delay: number = NETWORK_DELAY_MS): Promise<T> {
  return new Promise<T>((resolve) => {
    setTimeout(() => {
      resolve(factory());
    }, delay);
  });
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals = 2): number {
  const value = Math.random() * (max - min) + min;
  return parseFloat(value.toFixed(decimals));
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function fetchOverviewMetrics(): Promise<OverviewMetric[]> {
  return withLatency(() => {
    const base: OverviewMetric[] = [
      {
        id: "total-assessments",
        label: "Total Assessments Completed (30d)",
        value: 4873,
        delta: randomFloat(-5, 12),
      },
      {
        id: "avg-score",
        label: "Average Score",
        value: randomFloat(62, 78, 1),
        delta: randomFloat(-3, 4),
      },
      {
        id: "pass-rate",
        label: "Pass Rate",
        value: randomFloat(54, 71, 1),
        delta: randomFloat(-2, 5),
      },
      {
        id: "median-duration",
        label: "Median Duration (mins)",
        value: randomFloat(38, 52, 1),
        delta: randomFloat(-4, 3),
      },
    ];

    return base;
  });
}

export function fetchScoreRows(count: number = 3000): Promise<ScoreRow[]> {
  return withLatency(() => {
    const rows: ScoreRow[] = [];

    const assessmentNames = [
      "Frontend Engineer – React",
      "Backend Engineer – Node.js",
      "Full‑Stack – TypeScript",
      "Data Structures & Algorithms",
      "System Design Foundations",
    ];

    const firstNames = [
      "Aarav",
      "Isha",
      "Rohan",
      "Priya",
      "Kabir",
      "Ananya",
      "Vikram",
      "Sanya",
      "Dev",
      "Neha",
    ];

    const lastNames = [
      "Sharma",
      "Verma",
      "Iyer",
      "Patel",
      "Reddy",
      "Singh",
      "Basu",
      "Nair",
      "Das",
      "Mehta",
    ];

    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    for (let i = 0; i < count; i += 1) {
      const submittedOffsetDays = randomInt(0, 60);
      const submittedAt = new Date(now - submittedOffsetDays * dayMs).toISOString();

      const score = randomInt(0, 100);
      const percentile = Math.min(99, Math.max(1, Math.round(score + randomInt(-10, 10))));

      const row: ScoreRow = {
        id: `score-${i}`,
        candidateName: `${randomFrom(firstNames)} ${randomFrom(lastNames)}`,
        assessmentName: randomFrom(assessmentNames),
        score,
        percentile,
        submittedAt,
        durationMinutes: randomInt(20, 120),
      };

      rows.push(row);
    }

    return rows;
  });
}

export function fetchActivityRows(count: number = 3000): Promise<ActivityRow[]> {
  return withLatency(() => {
    const rows: ActivityRow[] = [];

    const assessmentNames = [
      "Frontend Engineer – React",
      "Backend Engineer – Node.js",
      "Data Engineering – SQL",
      "Mobile – React Native",
      "DevOps – Cloud Basics",
    ];

    const firstNames = [
      "Aditi",
      "Rahul",
      "Kunal",
      "Meera",
      "Irfan",
      "Sneha",
      "Gaurav",
      "Pooja",
      "Kriti",
      "Suresh",
    ];

    const lastNames = [
      "Kulkarni",
      "Jain",
      "Bhatt",
      "Ghosh",
      "Naidu",
      "Malhotra",
      "Khan",
      "Roy",
      "Dixit",
      "Menon",
    ];

    const eventTypes: ActivityRow["eventType"][] = [
      "start",
      "submit",
      "abandon",
      "review",
    ];

    const now = Date.now();
    const hourMs = 60 * 60 * 1000;

    for (let i = 0; i < count; i += 1) {
      const offsetHours = randomInt(0, 24 * 45);
      const timestamp = new Date(now - offsetHours * hourMs).toISOString();
      const eventType = randomFrom(eventTypes);

      const metadataPieces: string[] = [];
      if (eventType === "start") {
        metadataPieces.push("session created");
      }
      if (eventType === "submit") {
        metadataPieces.push("auto‑graded");
      }
      if (eventType === "abandon") {
        metadataPieces.push("timeout");
      }
      if (eventType === "review") {
        metadataPieces.push("manual review");
      }
      metadataPieces.push(`${randomInt(0, 5)} flags`);

      const row: ActivityRow = {
        id: `activity-${i}`,
        candidateName: `${randomFrom(firstNames)} ${randomFrom(lastNames)}`,
        assessmentName: randomFrom(assessmentNames),
        eventType,
        timestamp,
        metadata: metadataPieces.join(" · "),
      };

      rows.push(row);
    }

    return rows;
  });
}
