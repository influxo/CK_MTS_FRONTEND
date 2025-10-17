import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/data-display/card";
import { useDispatch, useSelector } from "react-redux";
import React from "react";
import { useTranslation } from "../../hooks/useTranslation";
import { fetchKpis, fetchKpiValueWithFilters, selectKpis } from "../../store/slices/kpiSlice";
import { selectMetricsFilters } from "../../store/slices/serviceMetricsSlice";

export function KpiHighlights() {
  const { t } = useTranslation();
  const dispatch: any = useDispatch();
  const { items, values, loading, error } = useSelector(selectKpis);
  const filters = useSelector(selectMetricsFilters);

  React.useEffect(() => {
    dispatch(fetchKpis());
  }, [dispatch]);

  React.useEffect(() => {
    if (!items || items.length === 0) return;
    // Map dashboard metrics filters -> KPI calculate params
    const params: any = {};
    if (filters?.startDate) params.fromDate = filters.startDate;
    if (filters?.endDate) params.toDate = filters.endDate;
    if (filters?.entityId) params.entityId = filters.entityId;
    if (filters?.entityType) params.entityType = filters.entityType;
    if ((filters as any)?.projectId) params.projectId = (filters as any).projectId;
    if ((filters as any)?.subprojectId) params.subprojectId = (filters as any).subprojectId;
    if ((filters as any)?.activityId) params.activityId = (filters as any).activityId;

    items.slice(0, 4).forEach((k) => dispatch(fetchKpiValueWithFilters({ id: k.id, params })));
  }, [items, filters, dispatch]);

  return (
    <Card className="bg-[#F7F9FB] drop-shadow-sm shadow-gray-50 border-0">
      <CardHeader>
        <CardTitle>{t('dashboard.kpiHighlights')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading && (
          <div className="text-sm text-muted-foreground">{t('common.loading')}</div>
        )}
        {error && (
          <div className="text-sm text-destructive">{error}</div>
        )}
        {!loading && !error && items.length === 0 && (
          <div className="text-sm text-muted-foreground">{t('dashboard.noKpisConfigured')}</div>
        )}
        {!loading && !error &&
          items.slice(0, 4).map((kpi) => {
            const calc = values[kpi.id];
            const valueText = calc ? `${calc.result}` : "—";
            return (
              <div key={kpi.id} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{kpi.name}</span>
                  <span className="text-sm text-muted-foreground">{valueText}</span>
                </div>
                {kpi.description && (
                  <div className="text-xs text-muted-foreground line-clamp-2">
                    {kpi.description}
                  </div>
                )}
              </div>
            );
          })}
      </CardContent>
    </Card>
  );
}
