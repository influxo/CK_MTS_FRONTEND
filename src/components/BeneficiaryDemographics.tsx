import { Card, CardContent, CardHeader, CardTitle } from "./ui/data-display/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/form/select";

export function BeneficiaryDemographics() {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Beneficiary Demographics</CardTitle>
          <Select defaultValue="all-projects">
            <SelectTrigger className="h-8 w-40">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-projects">All Projects</SelectItem>
              <SelectItem value="healthcare">Healthcare</SelectItem>
              <SelectItem value="education">Education</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col">
            <h4 className="text-sm text-center mb-2">Gender distribution</h4>
            <div className="h-48 flex items-center justify-center border rounded-md">
              <div className="w-32 h-32 rounded-full border-8 border-primary relative flex items-center justify-center">
                <div className="absolute inset-0 border-8 border-r-blue-400 border-transparent rounded-full rotate-[120deg]"></div>
                <div className="text-xs text-muted-foreground">
                  Gender chart
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <h4 className="text-sm text-center mb-2">Age group distribution</h4>
            <div className="h-48 flex items-center justify-center border rounded-md">
              <div className="flex h-32 items-end gap-3">
                <div className="h-[70%] w-8 bg-primary rounded-t"></div>
                <div className="h-[85%] w-8 bg-primary rounded-t"></div>
                <div className="h-[55%] w-8 bg-primary rounded-t"></div>
                <div className="h-[30%] w-8 bg-primary rounded-t"></div>
                <div className="h-[45%] w-8 bg-primary rounded-t"></div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
