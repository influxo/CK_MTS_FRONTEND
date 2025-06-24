import { ChevronDown, Filter } from "lucide-react";
import { Button } from "./ui/button/button";
import { Card } from "./ui/data-display/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/form/select";

export function FilterControls() {
  return (
    <div className="flex flex-col space-y-3 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-lg font-medium">Dashboard Overview</h2>
          <p className="text-muted-foreground text-sm">
            Key metrics across your projects and activities
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center border rounded-md h-9 px-3">
            <span className="text-sm text-muted-foreground">Last 30 days</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground ml-1" />
          </div>
          <Button size="sm" variant="outline" className="flex-shrink-0">
            <Filter className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Card className="p-3 sm:p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">
              Program
            </label>
            <Select defaultValue="all-programs">
              <SelectTrigger className="bg-gray-100 w-full">
                <SelectValue placeholder="All Programs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-programs">All Programs</SelectItem>
                <SelectItem value="health">Health</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="nutrition">Nutrition</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">
              Project
            </label>
            <Select defaultValue="all-projects">
              <SelectTrigger className="bg-gray-100 w-full">
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-projects">All Projects</SelectItem>
                <SelectItem value="rural-healthcare">
                  Rural Healthcare
                </SelectItem>
                <SelectItem value="community-education">
                  Community Education
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">
              Sub-Project
            </label>
            <Select defaultValue="all-sub-projects">
              <SelectTrigger className="bg-gray-100 w-full">
                <SelectValue placeholder="All Sub-Projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-sub-projects">
                  All Sub-Projects
                </SelectItem>
                <SelectItem value="maternal-health">Maternal Health</SelectItem>
                <SelectItem value="child-nutrition">Child Nutrition</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">
              Date Range
            </label>
            <div className="flex items-center border rounded-md h-10 px-3 justify-between bg-gray-100">
              <span className="text-sm">May 1 - May 25, 2025</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button size="sm" className="px-4 h-9 bg-black text-white hover:bg-gray-800">
            Apply Filters
          </Button>
        </div>
      </Card>
    </div>
  );
}
