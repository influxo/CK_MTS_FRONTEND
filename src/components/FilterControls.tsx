import { ChevronDown, Filter } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export function FilterControls() {
  return (
    <div className="flex flex-col space-y-3 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>Dashboard Overview</h2>
          <p className="text-muted-foreground">
            Key metrics across your projects and activities
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Last 30 days</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
          <Button size="sm" variant="outline" className="ml-2">
            <Filter className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Card className="p-3">
        <div className="grid grid-cols-4 gap-3">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">
              Program
            </label>
            <Select defaultValue="all-programs">
              <SelectTrigger>
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
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">
              Project
            </label>
            <Select defaultValue="all-projects">
              <SelectTrigger>
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
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">
              Sub-Project
            </label>
            <Select defaultValue="all-sub-projects">
              <SelectTrigger>
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
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">
              Date Range
            </label>
            <div className="flex items-center border rounded-md h-10 px-3 justify-between">
              <span className="text-sm">May 1 - May 25, 2025</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <Button size="sm" className="px-6">
            Apply
          </Button>
        </div>
      </Card>
    </div>
  );
}
