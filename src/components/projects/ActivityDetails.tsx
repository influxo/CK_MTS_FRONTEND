import { ArrowLeft, Calendar, FileText, FolderKanban, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import activityService from "../../services/activities/activityService";
import type { Activity } from "../../services/activities/activityModels";
import { Button } from "../ui/button/button";
import { Badge } from "../ui/data-display/badge";
import { Card, CardContent } from "../ui/data-display/card";
import { useTranslation } from "../../hooks/useTranslation";

export function ActivityDetails() {
  const { t } = useTranslation();
  const { projectId, subprojectId, activityId } = useParams<{
    projectId: string;
    subprojectId: string;
    activityId: string;
  }>();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivity = async () => {
      if (!activityId) {
        setError("Activity ID is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await activityService.getActivityById(activityId);
        if (response.success && response.data) {
          setActivity(response.data);
          setError(null);
        } else {
          setError(response.message || "Failed to fetch activity");
        }
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [activityId]);

  const handleBack = () => {
    if (projectId && subprojectId) {
      navigate(`/projects/${projectId}/subprojects/${subprojectId}`);
    } else {
      navigate(-1);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div>{t("activityDetails.loading")}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="mb-4">
          <Button
            variant="outline"
            className="bg-[#E0F2FE] border-0"
            size="sm"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t("activityDetails.back")}
          </Button>
        </div>
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="p-8">
        <div className="mb-4">
          <Button
            variant="outline"
            className="bg-[#E0F2FE] border-0"
            size="sm"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t("activityDetails.back")}
          </Button>
        </div>
        <div>{t("activityDetails.notFound")}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          className="bg-[#E0F2FE] border-0 transition-transform duration-200 ease-in-out hover:scale-[1.02] hover:-translate-y-[1px]"
          size="sm"
          onClick={handleBack}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          {t("activityDetails.backToSubproject")}
        </Button>
      </div>

      {/* Activity Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">{activity.name}</h1>
          <Badge
            variant={activity.status === "active" ? "default" : "outline"}
            className="text-[#4AA785] bg-[#DEF8EE]"
          >
            {activity.status}
          </Badge>
        </div>
        {activity.description && (
          <p className="text-muted-foreground text-lg">{activity.description}</p>
        )}
      </div>

      {/* Activity Information Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Category Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#E0F2FE] rounded-lg">
                <FolderKanban className="h-6 w-6 text-[#0073e6]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("activityDetails.category")}
                </p>
                <p className="text-xl font-semibold">{activity.category}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Frequency Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#DEF8EE] rounded-lg">
                <TrendingUp className="h-6 w-6 text-[#4AA785]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("activityDetails.frequency")}
                </p>
                <p className="text-xl font-semibold capitalize">
                  {activity.frequency}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Created Date Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#FEF3C7] rounded-lg">
                <Calendar className="h-6 w-6 text-[#F59E0B]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("activityDetails.created")}
                </p>
                <p className="text-xl font-semibold">
                  {new Date(activity.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reporting Fields Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#0073e6]" />
              <h2 className="text-xl font-semibold">
                {t("activityDetails.reportingFields")}
              </h2>
            </div>
            {activity.reportingFields &&
            Object.keys(activity.reportingFields).length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2">
                {Object.entries(activity.reportingFields).map(([key, type]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="font-medium">{key}</span>
                    <Badge variant="outline" className="bg-white">
                      {type}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                {t("activityDetails.noReportingFields")}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Metadata Card */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4">
            {t("activityDetails.metadata")}
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">
                {t("activityDetails.activityId")}
              </p>
              <p className="font-mono text-sm">{activity.id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("activityDetails.subprojectId")}
              </p>
              <p className="font-mono text-sm">{activity.subprojectId}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("activityDetails.createdAt")}
              </p>
              <p className="text-sm">
                {new Date(activity.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("activityDetails.updatedAt")}
              </p>
              <p className="text-sm">
                {new Date(activity.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
