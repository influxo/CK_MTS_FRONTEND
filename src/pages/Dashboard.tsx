import { FilterControls } from "../components/FilterControls";
import { SummaryMetrics } from "../components/SummaryMetrics";
import { FormSubmissions } from "../components/FormSubmissions";
import { KpiHighlights } from "../components/KpiHighlights";
import { SyncStatus } from "../components/SyncStatus";
import { SystemAlerts } from "../components/SystemAlerts";
import { BeneficiaryDemographics } from "../components/BeneficiaryDemographics";
import { ServiceDelivery } from "../components/ServiceDelivery";
import { RecentActivity } from "../components/RecentActivity";
export function Dashboard() {
  return (
    <>
      <FilterControls />
      <SummaryMetrics />

      <FormSubmissions />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <KpiHighlights />
          <div className="lg:col-span-2 py-6">
            <BeneficiaryDemographics />
          </div>
          <div className="lg:col-span-2">
            <KpiHighlights />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-1 py-6 gap-6 mb-6">
            <ServiceDelivery />
          </div>
        </div>
        <div className=" space-y-6">
          <SyncStatus />
          <SystemAlerts />
          <RecentActivity />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6"></div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>{/* Empty space for future components or expansion */}</div>
      </div>
    </>
  );
}
