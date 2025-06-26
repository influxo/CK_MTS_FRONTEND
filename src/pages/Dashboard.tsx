import { FilterControls } from "../components/dashboard/FilterControls";
import { SummaryMetrics } from "../components/dashboard/SummaryMetrics";
import { FormSubmissions } from "../components/dashboard/FormSubmissions";
import { KpiHighlights } from "../components/dashboard/KpiHighlights";
import { SyncStatus } from "../components/dashboard/SyncStatus";
import { SystemAlerts } from "../components/dashboard/SystemAlerts";
import { BeneficiaryDemographics } from "../components/dashboard/BeneficiaryDemographics";
import { ServiceDelivery } from "../components/dashboard/ServiceDelivery";
import { RecentActivity } from "../components/dashboard/RecentActivity";
export function Dashboard() {
  // TODO: ka ndryshim t components me /dashboard edhe pa to, ama e ngjashme

  return (
    <>
      <FilterControls />
      <SummaryMetrics />

      {/* FormSubmissions prej /components/FormSubmissions o ndryshe prej ksaj, ama e ngjashme */}
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
