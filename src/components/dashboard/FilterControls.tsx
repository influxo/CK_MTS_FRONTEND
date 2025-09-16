import { Download, Filter } from "lucide-react";
import { Button } from "../ui/button/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/form/select";

export function FilterControls() {
  return (
    <div className="flex flex-col  bg-[#F7F9FB]   drop-shadow-sm shadow-gray-50 sm:flex-row gap-4 mb-6 p-4 bg-card rounded-lg ">
      <div className="flex flex-wrap gap-4 flex-1">
        <Select defaultValue="all-projects">
          <SelectTrigger
            className="w-[200px] bg-white p-2 rounded-md border-0
             transition-transform duration-200 ease-in-out
             hover:scale-[1.02] hover:-translate-y-[1px] "
          >
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
          <SelectTrigger
            className="w-[180px] bg-white border-0 border-gray-100 p-2 rounded-md 
             transition-transform duration-200 ease-in-out
             hover:scale-[1.02] hover:-translate-y-[1px] "
          >
            <SelectValue placeholder="Time Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last-7-days">Last 7 days</SelectItem>
            <SelectItem value="last-30-days">Last 30 days</SelectItem>
            <SelectItem value="last-90-days">Last 90 days</SelectItem>
            <SelectItem value="custom">Custom range</SelectItem>
          </SelectContent>
        </Select>

        {/* <Select defaultValue="all-regions">
          <SelectTrigger className="w-[150px] bg-black/5 text-black border-0">
            <SelectValue placeholder="Region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-regions">All Regions</SelectItem>
            <SelectItem value="north">North</SelectItem>
            <SelectItem value="south">South</SelectItem>
            <SelectItem value="east">East</SelectItem>
            <SelectItem value="west">West</SelectItem>
          </SelectContent>
        </Select> */}
      </div>

      <div className="flex gap-4">
        <Button
          variant="outline"
          size="sm"
          className="bg-[#E0F2FE] text-black border-0 
             transition-transform duration-200 ease-in-out 
             hover:scale-105 hover:-translate-y-[1px]"
        >
          <Filter className="h-4 w-4 mr-2" />
          More Filters
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="bg-[#0073e6] text-white border-0 
             transition-transform duration-200 ease-in-out 
             hover:scale-105 hover:-translate-y-[1px]"
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
    </div>
  );
}
