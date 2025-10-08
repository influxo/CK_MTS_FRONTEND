import { Download, FileSpreadsheet, FileText, Printer } from "lucide-react";
import { Button } from "../ui/button/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/data-display/card";
import { Checkbox } from "../ui/form/checkbox";
import { Label } from "../ui/form/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/form/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/navigation/tabs";

interface ProjectExportProps {
  projectId: string;
}

export function ProjectExport({ projectId }: ProjectExportProps) {
  console.log("projectId, veq sa me i ik unused declaration", projectId);
  return (
    <Card className="bg-[#F7F9FB] drop-shadow-sm shadow-gray-50 border-0">
      <Tabs defaultValue="reports">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Export Data & Reports</CardTitle>
            <TabsList className="grid  grid-cols-2 bg-[#E0F2FE] items-center ">
              <TabsTrigger
                value="reports"
                className="data-[state=active]:bg-[#0073e6]  data-[state=active]:text-white"
              >
                Project Reports
              </TabsTrigger>
              <TabsTrigger
                value="data"
                className="data-[state=active]:bg-[#0073e6] data-[state=active]:text-white"
              >
                Raw Data Export
              </TabsTrigger>
            </TabsList>
          </div>
        </CardHeader>
        <CardContent>
          <TabsContent value="reports" className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select defaultValue="summary">
                <SelectTrigger className="bg-white border-gray-100 ">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">
                    Project Summary Report
                  </SelectItem>
                  <SelectItem value="activity">
                    Activity Detail Report
                  </SelectItem>
                  <SelectItem value="beneficiary">
                    Beneficiary Report
                  </SelectItem>
                  <SelectItem value="financial">Financial Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Time Period</Label>
              <Select defaultValue="all">
                <SelectTrigger className="bg-white border-gray-100">
                  <SelectValue placeholder="Select time period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Entire Project Duration</SelectItem>
                  <SelectItem value="monthly">Last Month</SelectItem>
                  <SelectItem value="quarterly">Last Quarter</SelectItem>
                  <SelectItem value="yearly">Last Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Include Sub-Projects</Label>
              <div className="flex flex-col gap-2 pt-1">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="all-subprojects"
                    className=" bg-[#E0F2FE] border-gray-100 "
                    defaultChecked
                  />
                  <label
                    htmlFor="all-subprojects"
                    className="text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    All Sub-Projects
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="selected-subprojects"
                    className=" bg-[#E0F2FE] border-gray-100 "
                  />
                  <label
                    htmlFor="selected-subprojects"
                    className="text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Selected Sub-Projects Only
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button className="gap-2 bg-[#E0F2FE] border-0 ">
                <FileText className="h-4 w-4" />
                Export as PDF
              </Button>
              <Button
                variant="outline"
                className="gap-2 bg-[#E0F2FE] border-0 "
              >
                <FileSpreadsheet className="h-4 w-4" />
                Export as Excel
              </Button>
              <Button
                variant="outline"
                className="gap-2 bg-[#E0F2FE] border-0 "
              >
                <Printer className="h-4 w-4" />
                Print
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="data" className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label>Data Type</Label>
              <Select defaultValue="all">
                <SelectTrigger className="bg-white border-gray-100">
                  <SelectValue placeholder="Select data type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Project Data</SelectItem>
                  <SelectItem value="activities">Activities Data</SelectItem>
                  <SelectItem value="beneficiaries">
                    Beneficiaries Data
                  </SelectItem>
                  <SelectItem value="services">Services Data</SelectItem>
                  <SelectItem value="forms">Form Submissions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Export Format</Label>
              <Select defaultValue="excel">
                <SelectTrigger className="bg-white border-gray-100">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Export Options</Label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-metadata"
                    className="bg-[#E0F2FE]"
                    defaultChecked
                  />
                  <label
                    htmlFor="include-metadata"
                    className="text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Include metadata
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="include-archived" className="bg-[#E0F2FE]" />
                  <label
                    htmlFor="include-archived"
                    className="text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Include archived data
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="anonymize-data" className="bg-[#E0F2FE]" />
                  <label
                    htmlFor="anonymize-data"
                    className="text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Anonymize sensitive data
                  </label>
                </div>
              </div>
            </div>

            <Button className="gap-2 w-full mt-4 h-10 bg-[#E0F2FE] border-0 ">
              <Download className="h-4 w-4" />
              Download Data
            </Button>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
}
