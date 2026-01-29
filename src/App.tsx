import React from "react";
import { Dashboard } from "./components/Dashboard";

const App: React.FC = () => {
  return (
    <div
      style={{
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        minHeight: "100vh",
        backgroundColor: "#f5f5f7",
      }}
    >
      <header
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid #e0e0e0",
          backgroundColor: "#ffffff",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "20px",
            fontWeight: 600,
            color: "#111827",
          }}
        >
          Utkrusht Assessments – Analytics Dashboard
        </h1>
        <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: "13px" }}>
          Internal performance view for proof-of-skill assessments
        </p>
      </header>

      <main style={{ padding: "16px 24px" }}>
        <Dashboard />
      </main>
    </div>
  );
};

export default App;
