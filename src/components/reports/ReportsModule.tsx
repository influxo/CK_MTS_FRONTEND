import { useState } from "react";
import { ReportGenerator } from "./ReportGenerator";
import { ReportsList } from "./ReportsList";
import { ReportViewer } from "./ReportViewer";

type ReportView = "list" | "generator" | "viewer";

export function ReportsModule() {
  const [view, setView] = useState<ReportView>("list");
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [generatorConfig, setGeneratorConfig] = useState<any>(null);

  // Handle when a report is selected from the list
  const handleReportSelect = (reportId: string) => {
    setSelectedReportId(reportId);
    setView("viewer");
  };

  // Handle when a report type is selected for generation
  const handleCreateReport = (config: any) => {
    setGeneratorConfig(config);
    setView("generator");
  };

  // Handle when a report is generated
  const handleReportGenerated = (reportId: string) => {
    setSelectedReportId(reportId);
    setView("viewer");
  };

  // Handle back button
  const handleBack = () => {
    setView("list");
    setSelectedReportId(null);
    setGeneratorConfig(null);
  };

  // Render appropriate view based on state
  if (view === "generator") {
    return (
      <ReportGenerator
        initialConfig={generatorConfig}
        onBack={handleBack}
        onReportGenerated={handleReportGenerated}
      />
    );
  }

  if (view === "viewer" && selectedReportId) {
    return <ReportViewer reportId={selectedReportId} onBack={handleBack} />;
  }

  // Default to list view
  return (
    <ReportsList
      onReportSelect={handleReportSelect}
      onCreateReport={handleCreateReport}
    />
  );
}
