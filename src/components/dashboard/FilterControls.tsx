import { Download, Filter } from "lucide-react";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export function FilterControls() {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-card rounded-lg border">
      <div className="flex flex-wrap gap-4 flex-1">
        <Select defaultValue="all-projects">
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-projects">All Projects</SelectItem>
            <SelectItem value="rural-healthcare">
              Rural Healthcare Initiative
            </SelectItem>
            <SelectItem value="education-outreach">
              Education Outreach Program
            </SelectItem>
            <SelectItem value="clean-water">Clean Water Access</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="last-30-days">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Time Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last-7-days">Last 7 days</SelectItem>
            <SelectItem value="last-30-days">Last 30 days</SelectItem>
            <SelectItem value="last-90-days">Last 90 days</SelectItem>
            <SelectItem value="custom">Custom range</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="all-regions">
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-regions">All Regions</SelectItem>
            <SelectItem value="north">North</SelectItem>
            <SelectItem value="south">South</SelectItem>
            <SelectItem value="east">East</SelectItem>
            <SelectItem value="west">West</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          More Filters
        </Button>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
    </div>
  );
}
