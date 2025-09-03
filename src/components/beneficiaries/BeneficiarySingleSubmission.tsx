import { ArrowLeft, Calendar, MapPin, User } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import type { AppDispatch } from "../../store";
import {
  fetchFormResponseById,
  selectSelectedResponse,
  selectSelectedResponseError,
  selectSelectedResponseLoading,
} from "../../store/slices/formSlice";
import { Button } from "../ui/button/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/data-display/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/data-display/table";
import { Badge } from "../ui/data-display/badge";

export default function BeneficiarySingleSubmission() {
  const { id, formResponseId } = useParams<{
    id: string;
    formResponseId: string;
  }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const response = useSelector(selectSelectedResponse);
  const loading = useSelector(selectSelectedResponseLoading);
  const error = useSelector(selectSelectedResponseError);

  useEffect(() => {
    if (formResponseId) {
      dispatch(fetchFormResponseById({ id: formResponseId }));
    }
  }, [dispatch, formResponseId]);

  const fieldEntries = useMemo(() => {
    if (!response?.data) return [] as Array<[string, any]>;
    return Object.entries(response.data);
  }, [response]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/beneficiaries/${id}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Beneficiary
        </Button>
        <h2>Form Submission</h2>
      </div>

      <Card className="bg-[#F7F9FB] drop-shadow-sm shadow-gray-50 border-0">
        <CardContent className="p-6">
          {loading && (
            <div className="text-sm text-muted-foreground">
              Loading form response...
            </div>
          )}
          {error && !loading && (
            <div className="text-sm text-red-600">{error}</div>
          )}
          {!loading && !error && response && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h1 className="font-medium text-2xl">
                      {response.template?.name || "Untitled Template"}
                    </h1>
                    <Badge variant="outline">
                      v{response.template?.version ?? "-"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      Submitted on{" "}
                      {response.submittedAt
                        ? new Date(response.submittedAt).toLocaleString()
                        : "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-3.5 w-3.5" />
                    <span>
                      By{" "}
                      {`${response.submitter?.firstName ?? ""} ${
                        response.submitter?.lastName ?? ""
                      }`.trim() || "—"}
                      {response.submitter?.email
                        ? ` (${response.submitter.email})`
                        : ""}
                    </span>
                  </div>
                  {response.beneficiary && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>Beneficiary: {response.beneficiary.pseudonym}</span>
                    </div>
                  )}
                </div>
              </div>

              <Card className="bg-white border">
                <CardHeader>
                  <CardTitle className="text-base">Submitted Data</CardTitle>
                </CardHeader>
                <CardContent>
                  {fieldEntries.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      No data fields.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {fieldEntries.map(([key, value]) => (
                        <div
                          key={key}
                          className="p-3 rounded-md border bg-[#F7F9FB]"
                        >
                          <div className="text-xs text-muted-foreground">
                            {key}
                          </div>
                          <div className="text-sm break-words">
                            {typeof value === "object"
                              ? JSON.stringify(value)
                              : String(value)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white border">
                <CardHeader>
                  <CardTitle className="text-base">
                    Linked Service Deliveries
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {response.serviceDeliveries?.length ? (
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
                        {response.serviceDeliveries.map((d) => (
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
        </CardContent>
      </Card>
    </div>
  );
}
