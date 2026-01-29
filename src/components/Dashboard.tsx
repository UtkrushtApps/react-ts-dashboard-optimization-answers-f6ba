import React, { useState, useTransition } from "react";
import type { TabId } from "../types/analytics";
import { Tabs } from "./Tabs";
import { OverviewTab } from "./tabs/OverviewTab";
import { ScoresTab } from "./tabs/ScoresTab";
import { ActivityTab } from "./tabs/ActivityTab";

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [isPending, startTransition] = useTransition();

  const handleTabChange = (nextTab: TabId) => {
    if (nextTab === activeTab) return;

    // Use a transition so that the tab switch feels responsive even
    // if the newly selected tab needs to render a large table.
    startTransition(() => {
      setActiveTab(nextTab);
    });
  };

  return (
    <section
      aria-label="Assessment analytics dashboard"
      style={{
        backgroundColor: "#ffffff",
        borderRadius: 8,
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
        padding: 16,
      }}
    >
      <Tabs activeTab={activeTab} onChange={handleTabChange} isPending={isPending} />

      <div style={{ marginTop: 16 }}>
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "scores" && <ScoresTab />}
        {activeTab === "activity" && <ActivityTab />}
      </div>
    </section>
  );
};
