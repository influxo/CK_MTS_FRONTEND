import { Eye, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import type { AppDispatch } from "../../store";
import {
  createActivity,
  fetchSubprojectActivities,
  selectActivityError,
  selectActivityIsLoading,
  selectSubprojectActivities,
  selectSubprojectActivitiesError,
  selectSubprojectActivitiesLoading,
} from "../../store/slices/activitySlice";
import { Button } from "../ui/button/button";
import { Badge } from "../ui/data-display/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/data-display/table";
import { Input } from "../ui/form/input";
import { Label } from "../ui/form/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/form/select";
import { Textarea } from "../ui/form/textarea";
import { Tabs, TabsContent } from "../ui/navigation/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/overlay/dialog";
import { useTranslation } from "../../hooks/useTranslation";

interface SubProjectActivitiesProps {
  subProjectId: string;
}

export function SubProjectActivities({
  subProjectId,
}: SubProjectActivitiesProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("activities");
  const [isCreateActivityDialogOpen, setIsCreateActivityDialogOpen] =
    useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const dispatch = useDispatch<AppDispatch>();
  const isCreating = useSelector(selectActivityIsLoading);
  const createError = useSelector(selectActivityError);
  const activities = useSelector(selectSubprojectActivities);
  const listLoading = useSelector(selectSubprojectActivitiesLoading);
  const listError = useSelector(selectSubprojectActivitiesError);

  // Prefer URL param if present (route: :subprojectId)
  const { subprojectId: subprojectIdParam, projectId } = useParams<{
    subprojectId: string;
    projectId: string;
  }>();
  const effectiveSubProjectId = subprojectIdParam ?? subProjectId;
  const navigate = useNavigate();

  // Fetch activities when subproject changes
  useEffect(() => {
    if (effectiveSubProjectId) {
      dispatch(fetchSubprojectActivities(effectiveSubProjectId));
    }
  }, [dispatch, effectiveSubProjectId]);

  // Model-based form state
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [status, setStatus] = useState("active");
  const [description, setDescription] = useState("");
  const [reportingFieldsRows, setReportingFieldsRows] = useState<
    { key: string; type: string }[]
  >([{ key: "", type: "text" }]);

  // Filter activities from API for this sub-project
  const filteredActivities = activities.filter((activity) => {
    const matchesSubProject = activity.subprojectId === effectiveSubProjectId;
    const matchesSearch =
      activity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (activity.description || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || activity.status === statusFilter;

    return matchesSubProject && matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3>{t("subProjectActivities.title")}</h3>
          <p className="text-muted-foreground">
            {t("subProjectActivities.subtitle")}
          </p>
        </div>
        <Dialog
          open={isCreateActivityDialogOpen}
          onOpenChange={setIsCreateActivityDialogOpen}
        >
          <DialogTrigger asChild>
            <Button
              className="bg-[#0073e6] text-white flex items-center
             px-4 py-2 rounded-md border-0
             transition-transform duration-200 ease-in-out
             hover:scale-[1.02] hover:-translate-y-[1px]"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("subProjectActivities.recordNewActivity")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>{t("subProjectActivities.dialogTitle")}</DialogTitle>
              <DialogDescription>
                {t("subProjectActivities.dialogDescription")}
              </DialogDescription>
            </DialogHeader>
            {createError && (
              <div className="text-sm text-destructive">{createError}</div>
            )}
            <div className="grid gap-4 py-4">
              {/* Model-based fields */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="activity-name" className="text-right">
                  {t("subProjectActivities.nameLabel")}
                </Label>
                <Input
                  id="activity-name"
                  className="col-span-3"
                  placeholder={t("subProjectActivities.namePlaceholder")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="activity-category" className="text-right">
                  {t("subProjectActivities.categoryLabel")}
                </Label>
                <Input
                  id="activity-category"
                  className="col-span-3"
                  placeholder={t("subProjectActivities.categoryPlaceholder")}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="activity-frequency" className="text-right">
                  {t("subProjectActivities.frequencyLabel")}
                </Label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue
                      placeholder={t("subProjectActivities.selectFrequency")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">
                      {t("subProjectActivities.daily")}
                    </SelectItem>
                    <SelectItem value="weekly">
                      {t("subProjectActivities.weekly")}
                    </SelectItem>
                    <SelectItem value="monthly">
                      {t("subProjectActivities.monthly")}
                    </SelectItem>
                    <SelectItem value="quarterly">
                      {t("subProjectActivities.quarterly")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="activity-status" className="text-right">
                  {t("subProjectActivities.statusLabel")}
                </Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue
                      placeholder={t("subProjectActivities.selectStatus")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">
                      {t("subProjectActivities.active")}
                    </SelectItem>
                    <SelectItem value="inactive">
                      {t("subProjectActivities.inactive")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label
                  htmlFor="activity-description"
                  className="text-right pt-2"
                >
                  {t("subProjectActivities.descriptionLabel")}
                </Label>
                <Textarea
                  id="activity-description"
                  className="col-span-3"
                  placeholder={t("subProjectActivities.descriptionPlaceholder")}
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">
                  {t("subProjectActivities.reportingFields")}
                </Label>
                <div className="col-span-3 space-y-2">
                  {reportingFieldsRows.map((row, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <Input
                        placeholder={t(
                          "subProjectActivities.fieldKeyPlaceholder"
                        )}
                        value={row.key}
                        onChange={(e) => {
                          const next = [...reportingFieldsRows];
                          next[idx] = { ...next[idx], key: e.target.value };
                          setReportingFieldsRows(next);
                        }}
                      />
                      <Select
                        value={row.type}
                        onValueChange={(v: string) => {
                          const next = [...reportingFieldsRows];
                          next[idx] = { ...next[idx], type: v };
                          setReportingFieldsRows(next);
                        }}
                      >
                        <SelectTrigger className="w-[160px]">
                          <SelectValue
                            placeholder={t(
                              "subProjectActivities.typePlaceholder"
                            )}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="number">
                            {t("subProjectActivities.number")}
                          </SelectItem>
                          <SelectItem value="text">
                            {t("subProjectActivities.text")}
                          </SelectItem>
                          <SelectItem value="boolean">
                            {t("subProjectActivities.boolean")}
                          </SelectItem>
                          <SelectItem value="date">
                            {t("subProjectActivities.date")}
                          </SelectItem>
                          <SelectItem value="time">
                            {t("subProjectActivities.time")}
                          </SelectItem>
                          <SelectItem value="datetime">
                            {t("subProjectActivities.datetime")}
                          </SelectItem>
                          <SelectItem value="select">
                            {t("subProjectActivities.select")}
                          </SelectItem>
                          <SelectItem value="multiselect">
                            {t("subProjectActivities.multiselect")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        className="hover:bg-[#E0F2FE] hover:text-black"
                        onClick={() => {
                          const next = reportingFieldsRows.filter(
                            (_, i) => i !== idx
                          );
                          setReportingFieldsRows(next);
                        }}
                      >
                        {t("subProjectActivities.remove")}
                      </Button>
                    </div>
                  ))}
                  <Button
                    className="bg-[#E0F2FE] border-0 text-black"
                    onClick={() =>
                      setReportingFieldsRows([
                        ...reportingFieldsRows,
                        { key: "", type: "text" },
                      ])
                    }
                  >
                    {t("subProjectActivities.addField")}
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                className="bg-[#E0F2FE] border-0 text-black"
                onClick={() => setIsCreateActivityDialogOpen(false)}
                disabled={isCreating}
              >
                {t("subProjectActivities.cancel")}
              </Button>
              <Button
                className="bg-[#0073e6] border-0 text-white"
                onClick={async () => {
                  const reportingFields: Record<string, string> = {};
                  reportingFieldsRows
                    .filter((r) => r.key.trim().length > 0)
                    .forEach((r) => {
                      reportingFields[r.key.trim()] = r.type;
                    });
                  try {
                    await dispatch(
                      createActivity({
                        name,
                        description,
                        category,
                        frequency,
                        reportingFields,
                        status,
                        subprojectId: effectiveSubProjectId,
                      })
                    ).unwrap();
                    // Reset form
                    setName("");
                    setCategory("");
                    setFrequency("monthly");
                    setStatus("active");
                    setDescription("");
                    setReportingFieldsRows([{ key: "", type: "text" }]);
                    setIsCreateActivityDialogOpen(false);
                    // Refresh activities list
                    if (effectiveSubProjectId) {
                      dispatch(
                        fetchSubprojectActivities(effectiveSubProjectId)
                      );
                    }
                  } catch (e) {
                    // error shown via createError
                  }
                }}
                disabled={isCreating}
              >
                {isCreating
                  ? t("subProjectActivities.saving")
                  : t("subProjectActivities.saveActivity")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsContent value="activities" className="pt-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between mb-4">
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("subProjectActivities.searchPlaceholder")}
                  className="pl-9 bg-white border border-gray-100 transition-transform duration-200 ease-in-out hover:scale-105 hover:-translate-y-[1px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px] bg-white border border-gray-100 transition-transform duration-200 ease-in-out hover:scale-105 hover:-translate-y-[1px]">
                  <SelectValue
                    placeholder={t("subProjectActivities.statusFilter")}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("subProjectActivities.allStatus")}
                  </SelectItem>
                  <SelectItem value="active">
                    {t("subProjectActivities.active")}
                  </SelectItem>
                  <SelectItem value="inactive">
                    {t("subProjectActivities.inactive")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Activities
            </Button> */}
          </div>

          <Table className="rounded-md overflow-hidden ">
            <TableHeader className="bg-[#E5ECF6]">
              <TableRow>
                <TableHead className="w-[300px]">
                  {t("subProjectActivities.activityColumn")}
                </TableHead>
                <TableHead>
                  {t("subProjectActivities.categoryColumn")}
                </TableHead>
                <TableHead>
                  {t("subProjectActivities.frequencyColumn")}
                </TableHead>
                <TableHead>{t("subProjectActivities.statusColumn")}</TableHead>
                <TableHead>{t("subProjectActivities.createdColumn")}</TableHead>
                <TableHead>{t("subProjectActivities.updatedColumn")}</TableHead>
                <TableHead className="text-right">
                  {t("subProjectActivities.actionsColumn")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listLoading && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <span className="text-sm text-muted-foreground">
                      {t("subProjectActivities.loadingActivities")}
                    </span>
                  </TableCell>
                </TableRow>
              )}
              {!listLoading && listError && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <span className="text-sm text-destructive">
                      {listError}
                    </span>
                  </TableCell>
                </TableRow>
              )}
              {!listLoading &&
                !listError &&
                filteredActivities.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <span className="text-sm text-muted-foreground">
                        {t("subProjectActivities.noActivitiesFound")}
                      </span>
                    </TableCell>
                  </TableRow>
                )}
              {!listLoading &&
                !listError &&
                filteredActivities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>
                      <div className="font-medium">{activity.name}</div>
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {activity.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="bg-[#0073e6] border-0 text-white"
                      >
                        {activity.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="bg-[#E0F2FE] border-0"
                      >
                        {activity.frequency}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          activity.status === "active" ? "default" : "outline"
                        }
                        className="mt-1 text-[#4AA785] bg-[#DEF8EE]"
                      >
                        {activity.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">
                      {new Date(activity.updatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-[#0073e6] border-0 text-white hover:bg-[#0060c0]"
                          onClick={() => {
                            if (projectId && effectiveSubProjectId) {
                              navigate(
                                `/projects/${projectId}/subprojects/${effectiveSubProjectId}/activities/${activity.id}`
                              );
                            }
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          {t("subProjectActivities.view")}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
}
