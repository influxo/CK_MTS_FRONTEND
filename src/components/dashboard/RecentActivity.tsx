import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/data-display/card";
import { Avatar, AvatarFallback } from "../ui/data-display/avatar";
import { Badge } from "../ui/data-display/badge";
import { useTranslation } from "../../hooks/useTranslation";
import { fetchAuditLogs } from "../../services/analytics/activityLogService";
import type { AuditLogItem } from "../../services/analytics/activityLogModels";
import { fetchActivitySummary } from "../../services/analytics/activitySummaryService";

export function RecentActivity() {
  const { t } = useTranslation();
  const [items, setItems] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formSubmissionsCount, setFormSubmissionsCount] = useState<number | null>(null);
  const [projectChangesCount, setProjectChangesCount] = useState<number | null>(null);

  const tr = (key: string, fallback: string) => {
    const val = t(key);
    return val === key ? fallback : val;
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    // Load recent project activity entries
    fetchAuditLogs({ page: 1, limit: 25 })
      .then((res) => {
        if (mounted && res?.success) {
          const allowed = new Set(["PROJECT_CREATED", "PROJECT_UPDATED", "PROJECT_DELETED"]);
          const filtered = (res.data.items || []).filter(it => allowed.has(it.action));
          setItems(filtered.slice(0, 10));
        }
      })
      .catch(() => {
        if (mounted) setError(tr('dashboard.activity_load_error','Unable to load recent activity'));
      })
      .finally(() => setLoading(false));

    // Load summary counts
    fetchActivitySummary()
      .then((res) => {
        if (mounted && res?.success) {
          setFormSubmissionsCount(res.data.formSubmissionsCount);
          setProjectChangesCount(res.data.projectSubprojectChangesCount);
        }
      })
      .catch(() => {
        // non-fatal; keep header clean if failed
      });
    return () => {
      mounted = false;
    };
  }, []);

  const badgeFor = useMemo(() => (action?: string) => {
    const a = action || "";
    if (a.includes("CREATED")) return <Badge variant="secondary" className="text-blue-700 bg-blue-100">{tr('dashboard.created','Created')}</Badge>;
    if (a.includes("UPDATED")) return <Badge variant="secondary" className="text-amber-700 bg-amber-100">{tr('dashboard.updated','Updated')}</Badge>;
    if (a.includes("DELETED") || a.includes("REMOVED")) return <Badge variant="secondary" className="text-red-700 bg-red-100">{tr('dashboard.deleted','Deleted')}</Badge>;
    if (a.includes("ASSIGNED")) return <Badge variant="secondary" className="text-purple-700 bg-purple-100">{tr('dashboard.assigned','Assigned')}</Badge>;
    return <Badge variant="outline">{tr('dashboard.unknown_activity','Activity')}</Badge>;
  }, [t]);

  return (
    <Card className="bg-[#F7F9FB] drop-shadow-sm shadow-gray-50 border-0">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>{tr('dashboard.recentActivity','Recent Activity')}</CardTitle>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {typeof formSubmissionsCount === 'number' && (
              <span className="inline-flex items-center gap-1 rounded border px-2 py-1 bg-white">
                {tr('dashboard.form_submissions','Form submissions')}: <strong>{formSubmissionsCount}</strong>
              </span>
            )}
            {typeof projectChangesCount === 'number' && (
              <span className="inline-flex items-center gap-1 rounded border px-2 py-1 bg-white">
                {tr('dashboard.project_changes','Project/Subproject changes')}: <strong>{projectChangesCount}</strong>
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-sm text-muted-foreground">{tr('dashboard.loading','Loading...')}</div>
        ) : (
          <div className="space-y-4">
            {error && (
              <div className="text-sm text-red-600 flex items-center justify-center py-6 border rounded-md bg-red-50">
                {error}
              </div>
            )}
            {items.map((it) => {
              const initials = (it.userDisplayName || ' ').split(' ').map(s => s[0]).join('').slice(0,2).toUpperCase() || 'U';
              const time = new Date(it.timestamp).toLocaleString();
              return (
                <div key={it.id} className="flex items-start space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="text-sm">
                      <span className="font-medium">{it.userDisplayName || 'System'}</span>
                      <span className="text-muted-foreground"> {" "}</span>
                      <span className="font-medium">{it.description}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{time}</span>
                      {badgeFor(it.action)}
                    </div>
                  </div>
                </div>
              );
            })}
            {items.length === 0 && (
              <div className="text-sm text-muted-foreground flex items-center justify-center py-6 border rounded-md bg-white">
                {tr('dashboard.no_activity','No recent project activity')}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
