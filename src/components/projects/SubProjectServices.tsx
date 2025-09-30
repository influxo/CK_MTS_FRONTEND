import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../../store";
import {
  getEntityServices,
  getAllServices,
  createService,
  assignServiceToEntity,
  assignServicesBatch,
  unassignServiceFromEntity,
  selectEntityServices,
  selectEntityServicesError,
  selectEntityServicesLoading,
  selectAllServices,
  selectServiceIsLoading,
  selectServiceError,
  selectServiceUnassignLoading,
  selectServiceUnassignError,
} from "../../store/slices/serviceSlice";
import type { Service } from "../../services/services/serviceModels";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/overlay/dialog";
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
import { toast } from "sonner";

interface SubProjectServicesProps {
  subProjectId: string;
}

export function SubProjectServices({ subProjectId }: SubProjectServicesProps) {
  const dispatch = useDispatch<AppDispatch>();
  const services = useSelector(selectEntityServices);
  const isLoading = useSelector(selectEntityServicesLoading);
  const error = useSelector(selectEntityServicesError);
  // global services list for Assign dialog
  const allServices = useSelector(selectAllServices);
  const allLoading = useSelector(selectServiceIsLoading);
  const allError = useSelector(selectServiceError);

  // Create dialog state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [creating, setCreating] = useState(false);

  // Assign dialog state
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [assigning, setAssigning] = useState(false);
  const [search, setSearch] = useState("");
  const filteredAllServices = useMemo(
    () =>
      allServices.filter(
        (s) =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.description.toLowerCase().includes(search.toLowerCase())
      ),
    [allServices, search]
  );

  // Unassign dialog state
  const [isUnassignOpen, setIsUnassignOpen] = useState(false);
  const [serviceToUnassign, setServiceToUnassign] = useState<Service | null>(
    null
  );
  const unassignLoading = useSelector(selectServiceUnassignLoading);
  const unassignError = useSelector(selectServiceUnassignError);

  useEffect(() => {
    if (subProjectId) {
      dispatch(
        getEntityServices({ entityId: subProjectId, entityType: "subproject" })
      );
    }
  }, [subProjectId, dispatch]);

  const refresh = () => {
    if (subProjectId) {
      dispatch(
        getEntityServices({ entityId: subProjectId, entityType: "subproject" })
      );
    }
  };

  // When opening Assign modal, load all services (first page, large page size)
  useEffect(() => {
    if (isAssignOpen) {
      setSelectedIds([]);
      dispatch(getAllServices({ page: 1, limit: 200 }));
    }
  }, [isAssignOpen, dispatch]);

  const handleCreateAndAssign = async () => {
    if (!subProjectId) return;
    if (!name.trim() || !category.trim() || !status) return;
    setCreating(true);
    try {
      const res = await dispatch(
        createService({
          name: name.trim(),
          description: description.trim(),
          category: category.trim(),
          status,
        })
      ).unwrap();
      const created = res.data;
      if (created?.id) {
        await dispatch(
          assignServiceToEntity({
            id: created.id,
            data: { entityId: subProjectId, entityType: "subproject" },
          })
        ).unwrap();
        refresh();
        setIsCreateOpen(false);
        setName("");
        setDescription("");
        setCategory("");
        setStatus("active");
      }
      toast.success("Shërbimi u shtua me sukses!", {
        style: {
          backgroundColor: "#d1fae5",
          color: "#065f46",
          border: "1px solid #10b981",
        },
      });
    } catch (e) {
      // errors handled by slice; keep here to stop spinner
    } finally {
      setCreating(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleAssignSelected = async () => {
    if (!subProjectId || selectedIds.length === 0) return;
    setAssigning(true);
    try {
      if (selectedIds.length === 1) {
        await dispatch(
          assignServiceToEntity({
            id: selectedIds[0],
            data: { entityId: subProjectId, entityType: "subproject" },
          })
        ).unwrap();

        //  If we got here, it's successful
        toast.success("Shërbimi u shtua me sukses!", {
          style: {
            backgroundColor: "#d1fae5",
            color: "#065f46",
            border: "1px solid #10b981",
          },
        });
      } else {
        await dispatch(
          assignServicesBatch({
            entityId: subProjectId,
            entityType: "subproject",
            serviceIds: selectedIds,
            removeUnlisted: false,
          })
        ).unwrap();
      }
      refresh();
      setIsAssignOpen(false);
    } catch (e) {
      // handled by slice
    } finally {
      setAssigning(false);
    }
  };

  const openUnassign = (svc: Service) => {
    setServiceToUnassign(svc);
    setIsUnassignOpen(true);
  };

  const handleConfirmUnassign = async () => {
    if (!subProjectId || !serviceToUnassign) return;
    try {
      await dispatch(
        unassignServiceFromEntity({
          id: serviceToUnassign.id,
          data: { entityId: subProjectId, entityType: "subproject" },
        })
      ).unwrap();
      setIsUnassignOpen(false);
      setServiceToUnassign(null);
      refresh();
    } catch (e) {
      // error shown via selector
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3>Services</h3>
        <div className="flex gap-2">
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-[#0073e6] text-white flex items-center
             px-4 py-2 rounded-md border-0
             transition-transform duration-200 ease-in-out
             hover:scale-[1.02] hover:-translate-y-[1px]"
              >
                Create Service
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[560px]">
              <DialogHeader>
                <DialogTitle>Create and Assign Service</DialogTitle>
                <DialogDescription>
                  Create a new service. It will be assigned to this sub-project
                  automatically after creation.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="svc-name" className="text-right">
                    Name *
                  </Label>
                  <Input
                    id="svc-name"
                    className="col-span-3"
                    value={name}
                    onChange={(e) => setName(e.currentTarget.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="svc-category" className="text-right">
                    Category *
                  </Label>
                  <Input
                    id="svc-category"
                    className="col-span-3"
                    value={category}
                    onChange={(e) => setCategory(e.currentTarget.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="svc-description" className="text-right pt-2">
                    Description
                  </Label>
                  <Textarea
                    id="svc-description"
                    className="col-span-3"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.currentTarget.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Status *</Label>
                  <Select
                    value={status}
                    onValueChange={(v) => setStatus(v as "active" | "inactive")}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                  disabled={creating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateAndAssign}
                  disabled={creating || !name.trim() || !category.trim()}
                >
                  {creating ? "Creating..." : "Create & Assign"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="bg-black/5 text-black border-0"
              >
                Assign Service
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[720px]">
              <DialogHeader>
                <DialogTitle>Assign Services to Sub-Project</DialogTitle>
                <DialogDescription>
                  Select one or multiple services to assign to this sub-project.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="flex gap-3 items-center">
                  <Input
                    placeholder="Search services..."
                    value={search}
                    onChange={(e) => setSearch(e.currentTarget.value)}
                  />
                  <Button
                    variant="outline"
                    onClick={() =>
                      dispatch(getAllServices({ page: 1, limit: 200 }))
                    }
                    disabled={allLoading}
                  >
                    Reload
                  </Button>
                </div>
                {allLoading && (
                  <div className="text-sm text-muted-foreground">
                    Loading services...
                  </div>
                )}
                {allError && (
                  <div className="text-sm text-destructive">{allError}</div>
                )}
                <div className="rounded-md border max-h-[360px] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[48px]">
                          <span className="sr-only">Select</span>
                        </TableHead>
                        <TableHead className="w-[320px]">Service</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAllServices.map((svc) => (
                        <TableRow key={svc.id} className="hover:bg-muted/40">
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(svc.id)}
                              onChange={() => toggleSelect(svc.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{svc.name}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {svc.description}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{svc.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                svc.status === "active"
                                  ? "bg-[#2E343E] text-white"
                                  : ""
                              }
                            >
                              {svc.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredAllServices.length === 0 && !allLoading && (
                        <TableRow>
                          <TableCell colSpan={4}>
                            <div className="text-sm text-muted-foreground">
                              No services found.
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAssignOpen(false)}
                  disabled={assigning}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAssignSelected}
                  disabled={assigning || selectedIds.length === 0}
                >
                  {assigning
                    ? "Assigning..."
                    : selectedIds.length > 1
                    ? "Assign Selected (Batch)"
                    : "Assign Selected"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading && (
        <div className="text-sm text-muted-foreground">Loading services...</div>
      )}
      {error && <div className="text-sm text-destructive">{error}</div>}

      {!isLoading && !error && services.length === 0 && (
        <div className="text-sm text-muted-foreground">
          No services assigned to this sub-project.
        </div>
      )}

      {services.length > 0 && (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader className="bg-[#E5ECF6] text-black border-0">
              <TableRow>
                <TableHead className="w-[280px]">Service</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-[#F7F9FB]">
              {services.map((svc) => (
                <TableRow key={svc.id}>
                  <TableCell>
                    <div className="font-medium">{svc.name}</div>
                    <div className="text-sm text-muted-foreground line-clamp-1">
                      {svc.description}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="bg-[#0073e6] text-white"
                    >
                      {svc.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        svc.status === "active"
                          ? "bg-[#DEF8EE] text-[#4AA785]"
                          : ""
                      }
                    >
                      {svc.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {svc.createdAt
                      ? new Date(svc.createdAt).toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {svc.updatedAt
                      ? new Date(svc.updatedAt).toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      className="hover:bg-black/5 text-black border-0"
                      onClick={() => openUnassign(svc)}
                    >
                      Unassign
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Unassign Confirmation Dialog */}
      <Dialog open={isUnassignOpen} onOpenChange={setIsUnassignOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Unassign Service</DialogTitle>
            <DialogDescription>
              Are you sure you want to unassign{" "}
              <span className="font-medium">{serviceToUnassign?.name}</span>{" "}
              from this sub-project?
            </DialogDescription>
          </DialogHeader>
          {unassignError && (
            <div className="text-sm text-destructive">{unassignError}</div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUnassignOpen(false)}
              disabled={unassignLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmUnassign} disabled={unassignLoading}>
              {unassignLoading ? "Unassigning..." : "Unassign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SubProjectServices;
