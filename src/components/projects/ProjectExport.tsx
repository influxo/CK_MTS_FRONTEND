import { Download, FileSpreadsheet, FileText, Printer } from "lucide-react";
import { Button } from "../ui/button/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/data-display/card";
import { Checkbox } from "../ui/form/checkbox";
import { Label } from "../ui/form/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/form/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/navigation/tabs";

interface ProjectExportProps {
  projectId: string;
}

export function ProjectExport({ projectId }: ProjectExportProps) {
  console.log("projectId, veq sa me i ik unused declaration", projectId);
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Export Data & Reports</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="reports">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="reports">Project Reports</TabsTrigger>
            <TabsTrigger value="data">Raw Data Export</TabsTrigger>
          </TabsList>
          <TabsContent value="reports" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select defaultValue="summary">
                <SelectTrigger>
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
                <SelectTrigger>
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
                  <Checkbox id="all-subprojects" defaultChecked />
                  <label
                    htmlFor="all-subprojects"
                    className="text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    All Sub-Projects
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="selected-subprojects" />
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
              <Button className="gap-2">
                <FileText className="h-4 w-4" />
                Export as PDF
              </Button>
              <Button variant="outline" className="gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Export as Excel
              </Button>
              <Button variant="outline" className="gap-2">
                <Printer className="h-4 w-4" />
                Print
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="data" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Data Type</Label>
              <Select defaultValue="all">
                <SelectTrigger>
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
                <SelectTrigger>
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
                  <Checkbox id="include-metadata" defaultChecked />
                  <label
                    htmlFor="include-metadata"
                    className="text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Include metadata
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="include-archived" />
                  <label
                    htmlFor="include-archived"
                    className="text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Include archived data
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="anonymize-data" />
                  <label
                    htmlFor="anonymize-data"
                    className="text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Anonymize sensitive data
                  </label>
                </div>
              </div>
            </div>

            <Button className="gap-2 w-full mt-4">
              <Download className="h-4 w-4" />
              Download Data
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
