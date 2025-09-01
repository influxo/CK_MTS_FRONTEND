import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/data-display/card";
import { Badge } from "../ui/data-display/badge";
import {
  TrendingUp,
  TrendingDown,
  Users,
  FolderKanban,
  ClipboardList,
  BarChart3,
} from "lucide-react";
import { useSelector } from "react-redux";
import { selectSummary } from "../../store/slices/serviceMetricsSlice";

export function SummaryMetrics() {
  const summary = useSelector(selectSummary);
  const loading = summary.loading;
  const data = summary.data || {
    totalDeliveries: 0,
    uniqueBeneficiaries: 0,
    uniqueStaff: 0,
    uniqueServices: 0,
  };
  return (
    <div className="grid  grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <Card className="bg-[#E3F5FF]   drop-shadow-sm shadow-gray-50 border-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm">Service Deliveries</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl">{loading ? "…" : data.totalDeliveries.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                +12% from last month
              </div>
            </div>
            <Badge variant="secondary" className="  text-black ">
              Live
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#E5ECF6] border-0 text-black   drop-shadow-sm shadow-gray-50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm">Unique Beneficiaries</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl">{loading ? "…" : data.uniqueBeneficiaries.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                +8% from last month
              </div>
            </div>
            <Badge variant="secondary" className="  text-black ">
              Live
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#E3F5FF] border-0   drop-shadow-sm shadow-gray-50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm">Unique Staff</CardTitle>
          <ClipboardList className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl">{loading ? "…" : data.uniqueStaff.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                Snapshot
              </div>
            </div>
            <Badge variant="secondary" className="  text-black ">
              Live
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#E5ECF6] border-0   drop-shadow-sm shadow-gray-50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm">Unique Services</CardTitle>
          <FolderKanban className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl">{loading ? "…" : data.uniqueServices.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                Snapshot
              </div>
            </div>
            <Badge variant="secondary" className="  text-black ">
              Live
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
