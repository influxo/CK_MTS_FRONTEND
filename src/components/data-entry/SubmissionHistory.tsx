import { useEffect, useMemo, useState } from "react";
import { Button } from "../ui/button/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/data-display/card";
import { Input } from "../ui/form/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/form/select";
import { Badge } from "../ui/data-display/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/data-display/table";
import {
  ArrowLeft,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Calendar,
  Loader2,
  MapPin,
  User,
  Phone,
  Mail,
  Home,
  Hash,
  Flag,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/overlay/dropdown-menu";
import {
  Pagination as Pager,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
} from "../ui/navigation/pagination";

import {
  Dialog,
  DialogContent,
  DialogHeader as DialogHeaderUI,
  DialogTitle,
} from "../ui/overlay/dialog";
import type { AppDispatch } from "../../store";
import {
  fetchFormResponsesByEntity,
  fetchAllFormResponses,
  fetchFormResponseById,
  selectResponses,
  selectResponsesError,
  selectResponsesLoading,
  selectResponsesPagination,
  selectSelectedResponse,
  selectSelectedResponseError,
  selectSelectedResponseLoading,
  fetchFormTemplateById,
  selectSelectedTemplate,
  selectSelectedTemplateLoading,
} from "../../store/slices/formSlice";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface SubmissionHistoryProps {
  entityId?: string;
  entityType?: "project" | "subproject" | "activity";
  onBack: () => void;
}

export function SubmissionHistory({
  entityId,
  entityType,
  onBack,
}: SubmissionHistoryProps) {
  const dispatch = useDispatch<AppDispatch>();

  const items = useSelector(selectResponses) as any;
  const safeItems = Array.isArray(items) ? (items as any[]) : [];
  const loading = useSelector(selectResponsesLoading);
  const error = useSelector(selectResponsesError);
  const pagination = useSelector(selectResponsesPagination);

  const selected = useSelector(selectSelectedResponse);
  const position: [number, number] | null =
    selected?.latitude && selected?.longitude
      ? [Number(selected.latitude), Number(selected.longitude)]
      : null;
  const selectedLoading = useSelector(selectSelectedResponseLoading);
  const selectedError = useSelector(selectSelectedResponseError);
  const selectedTemplate = useSelector(selectSelectedTemplate);
  const selectedTemplateLoading = useSelector(selectSelectedTemplateLoading);
  const [searchQuery, setSearchQuery] = useState("");
  const [templateFilter, setTemplateFilter] = useState<string>("all"); // stores templateId or "all"
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);
  const [viewerOpen, setViewerOpen] = useState(false);

  // Fetch template for selected response to resolve field labels
  useEffect(() => {
    if (!viewerOpen) return;
    if (!selected) return;
    const templateId =
      selected.template?.id || (selected as any)?.formTemplateId;
    if (templateId) {
      dispatch(fetchFormTemplateById({ id: templateId }));
    }
  }, [viewerOpen, selected, dispatch]);
  // Build mapping name -> label from the template schema
  const labelMap = useMemo(() => {
    const map: Record<string, string> = {};
    const fields = (selectedTemplate as any)?.schema?.fields || [];
    for (const f of fields) {
      if (f?.name) map[f.name] = f.label || f.name;
    }
    return map;
  }, [selectedTemplate]);

  const formatLabel = (label: string) => {
    if (!label) return label;
    const withSpaces = label.replace(/[_\-]+/g, " ");
    return withSpaces.replace(/\b\w/g, (c) => c.toUpperCase());
  };

  useEffect(() => {
    const templateIdParam =
      templateFilter === "all" ? undefined : templateFilter;
    if (entityId && entityType) {
      dispatch(
        fetchFormResponsesByEntity({
          entityId,
          entityType,
          templateId: templateIdParam,
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
          page,
          limit,
        })
      );
    } else {
      dispatch(
        fetchAllFormResponses({
          templateId: templateIdParam,
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
          page,
          limit,
        })
      );
    }
  }, [
    dispatch,
    entityId,
    entityType,
    templateFilter,
    fromDate,
    toDate,
    page,
    limit,
  ]);

  const templateOptions = useMemo(() => {
    const names = new Map<string, string>();
    safeItems.forEach((r: any) => {
      if (r?.template?.id) names.set(r.template.id, r.template.name);
    });
    return Array.from(names.entries()).map(([id, name]) => ({ id, name }));
  }, [safeItems]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return safeItems.filter((r: any) => {
      const matchSearch =
        !q ||
        r.template?.name?.toLowerCase().includes(q) ||
        r.submitter?.firstName?.toLowerCase().includes(q) ||
        r.submitter?.lastName?.toLowerCase().includes(q) ||
        r.beneficiary?.pseudonym?.toLowerCase().includes(q);
      return matchSearch;
    });
  }, [safeItems, searchQuery]);

  const handleView = (responseId: string) => {
    setViewerOpen(true);
    dispatch(fetchFormResponseById({ id: responseId }));
  };

  const totalPages = pagination?.totalPages ?? 1;
  const currentPage = page;
  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        <Button
          variant="outline"
          size="sm"
          className="bg-[#E0F2FE] border-0 transition-transform duration-200 ease-in-out hover:scale-105 hover:-translate-y-[1px] text-black"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Forms
        </Button>
        <div>
          <h2>Submission History</h2>
          <p className="text-muted-foreground">View completed submissions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by form, submitter, beneficiary..."
            className="pl-9 border-gray-100 bg-white border"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={templateFilter} onValueChange={setTemplateFilter}>
            <SelectTrigger className="w-full bg-white border-gray-100 border sm:w-[220px] transition-transform duration-200 ease-in-out hover:scale-105 hover:-translate-y-[1px]">
              <Filter className="h-4 w-4 mr-2 " />
              <SelectValue placeholder="Template" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Templates</SelectItem>
              {templateOptions.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2 ">
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setPage(1);
                setFromDate(e.target.value);
              }}
              className="w-[160px] border-gray-100 bg-white border transition-transform duration-200 ease-in-out hover:scale-105 hover:-translate-y-[1px]"
              placeholder="From"
            />
            <Input
              type="date"
              value={toDate}
              onChange={(e) => {
                setPage(1);
                setToDate(e.target.value);
              }}
              className="w-[160px] border-gray-100 bg-white border transition-transform duration-200 ease-in-out hover:scale-105 hover:-translate-y-[1px]"
              placeholder="To"
            />
          </div>

          <Select
            value={String(limit)}
            onValueChange={(v) => {
              setPage(1);
              setLimit(Number(v));
            }}
          >
            <SelectTrigger className="w-full sm:w-[120px] border-gray-100 bg-white border transition-transform duration-200 ease-in-out hover:scale-105 hover:-translate-y-[1px]">
              <SelectValue placeholder="Page size" />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 50, 100].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n} / page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            className="bg-[#E0F2FE] transition-transform duration-200 ease-in-out hover:scale-105 hover:-translate-y-[1px] "
            variant="ghost"
            onClick={() => {
              setTemplateFilter("all");
              setFromDate("");
              setToDate("");
              setPage(1);
              setLimit(20);
              setSearchQuery("");
            }}
          >
            Reset
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="py-3 px-4">
          {loading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading
              submissions...
            </div>
          )}
          {!loading && error && (
            <div className="text-sm text-red-600">{error}</div>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#e4ebf6]">
                <TableRow>
                  <TableHead>Form</TableHead>
                  <TableHead>Beneficiary</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-[#f8f9fb]">
                {filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {r.template?.name ?? "—"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {entityType && (
                            <Badge variant="outline" className="mr-1">
                              {entityType}
                            </Badge>
                          )}
                          <span className="font-mono">{r.entityId}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {r.beneficiary ? (
                        <Badge variant="secondary">
                          {r.beneficiary.pseudonym}
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {r.submittedAt
                            ? new Date(r.submittedAt).toLocaleString()
                            : "—"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {`${r.submitter?.firstName ?? ""} ${
                          r.submitter?.lastName ?? ""
                        }`.trim() || "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-[#E0F2FE]"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleView(r.id)}>
                            <Eye className="h-4 w-4 mr-2 hover:bg-[#E0F2FE]" />{" "}
                            View
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {!loading && filtered.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No submissions found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="py-3">
              <Pager>
                <PaginationContent>
                  <PaginationItem className="hover:bg-[#E0F2FE] rounded-lg">
                    <PaginationPrevious
                      className={
                        !canPrev
                          ? "pointer-events-none opacity-50 text-black"
                          : ""
                      }
                      onClick={(e) => {
                        e.preventDefault();
                        if (canPrev) setPage((p) => Math.max(1, p - 1));
                      }}
                      href="#"
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages })
                    .slice(0, 7)
                    .map((_, idx) => {
                      const p = idx + 1;
                      return (
                        <PaginationItem key={p}>
                          <PaginationLink
                            className="hover:bg-[#E0F2FE]"
                            href="#"
                            isActive={p === currentPage}
                            onClick={(e) => {
                              e.preventDefault();
                              setPage(p);
                            }}
                          >
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                  <PaginationItem className="hover:bg-[#E0F2FE] rounded-lg">
                    <PaginationNext
                      className={
                        !canNext ? "pointer-events-none opacity-50" : ""
                      }
                      onClick={(e) => {
                        e.preventDefault();
                        if (canNext)
                          setPage((p) => Math.min(totalPages, p + 1));
                      }}
                      href="#"
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pager>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={viewerOpen}
        onOpenChange={(o) => (!o ? setViewerOpen(false) : null)}
      >
        <DialogContent className="sm:max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeaderUI>
            <DialogTitle className="text-lg ml-10">Form Submission</DialogTitle>
          </DialogHeaderUI>
          {selectedLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading form
              response...
            </div>
          )}
          {!selectedLoading && selectedError && (
            <div className="text-sm text-red-600">{selectedError}</div>
          )}
          {!selectedLoading && !selectedError && selected && (
            <div className="space-y-6 px-6 ml-4">
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h1 className="font-medium text-2xl">
                      {selected.template?.name || "Untitled Template"}
                    </h1>
                    {selected.template?.version !== undefined && (
                      <Badge variant="outline">
                        v{selected.template.version}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      Submitted on{" "}
                      {selected.submittedAt
                        ? new Date(selected.submittedAt).toLocaleString()
                        : "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-3.5 w-3.5" />
                    <span>
                      By{" "}
                      {`${selected.submitter?.firstName ?? ""} ${
                        selected.submitter?.lastName ?? ""
                      }`.trim() || "—"}
                      {selected.submitter?.email
                        ? ` (${selected.submitter.email})`
                        : ""}
                    </span>
                  </div>
                  {selected.beneficiary && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>Beneficiary: {selected.beneficiary.pseudonym}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedTemplateLoading && (
                <div className="text-sm text-muted-foreground">
                  Loading form definition…
                </div>
              )}

              {position && (
                <div style={{ height: "300px", width: "100%" }}>
                  <MapContainer
                    center={position}
                    zoom={13}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />
                    <Marker position={position}></Marker>
                  </MapContainer>
                </div>
              )}

              <Card className="bg-[#F7F9FB] border-0 ">
                <CardHeader>
                  <CardTitle className="text-base">Submitted Data</CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.keys(selected.data || {}).length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      No data fields.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-t border-slate-200 md:border-t">
                      {Object.entries(selected.data || {}).map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className="group relative p-4 border-b border-slate-200 odd:md:border-r"
                          >
                            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                              {(() => {
                                const displayLabel =
                                  labelMap[key] ?? formatLabel(key);
                                const l = displayLabel.toLowerCase();
                                const Icon =
                                  l.includes("date of birth") ||
                                  l.includes("dob") ||
                                  l.includes("birth")
                                    ? Calendar
                                    : l === "email" || l.includes("email")
                                    ? Mail
                                    : l === "phone" || l.includes("phone")
                                    ? Phone
                                    : l === "gender" || l.includes("gender")
                                    ? User
                                    : l.includes("address")
                                    ? Home
                                    : l.includes("last name") ||
                                      l.includes("first name")
                                    ? User
                                    : l.includes("national id") ||
                                      l === "id" ||
                                      l.includes(" id")
                                    ? Hash
                                    : l.includes("nationality")
                                    ? Flag
                                    : l.includes("municipality")
                                    ? MapPin
                                    : undefined;
                                return Icon ? (
                                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                                ) : null;
                              })()}
                              <span>{labelMap[key] ?? formatLabel(key)}</span>
                            </div>
                            <div className="mt-1 text-sm font-medium text-slate-900 break-words">
                              {typeof value === "object"
                                ? JSON.stringify(value)
                                : String(value)}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Linked Service Deliveries */}
              <Card className=" border-0  bg-[#E5ECF6]">
                <CardHeader className="border-0  ">
                  <CardTitle className="text-base ">
                    Linked Service Deliveries
                  </CardTitle>
                </CardHeader>
                <CardContent className=" bg-white">
                  {selected.serviceDeliveries?.length ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Service</TableHead>
                          <TableHead>Staff</TableHead>
                          <TableHead>Entity</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selected.serviceDeliveries.map((d: any) => (
                          <TableRow key={d.id}>
                            <TableCell>
                              {d.deliveredAt
                                ? new Date(d.deliveredAt).toLocaleDateString()
                                : "—"}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {d.service?.category ?? "—"}
                              </Badge>
                            </TableCell>
                            <TableCell>{d.service?.name ?? "—"}</TableCell>
                            <TableCell>
                              {`${d.staff?.firstName ?? ""} ${
                                d.staff?.lastName ?? ""
                              }`.trim() || "—"}
                            </TableCell>
                            <TableCell>
                              {`${d.entityType || ""}`}
                              {d.entityId ? ` • ${d.entityId}` : ""}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      No linked service deliveries.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
