import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "../../hooks/useTranslation";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/data-display/card";
import type { RootState } from "../../store";
import { loadDemographics } from "../../store/slices/demographicsSlice";

export function BeneficiaryDemographics() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { loading, error, data } = useSelector(
    (s: RootState) => s.demographics
  );

  React.useEffect(() => {
    // Fetch once on mount
    dispatch(loadDemographics() as any);
  }, [dispatch]);

  const ageData = (data?.age || []).map((a) => ({
    ...a,
    color: bucketColor(a.name),
  }));
  const genderData = data?.gender || [];

  // Build pie data using ACTUAL counts (not percentages) as requested
  const agePieData = (ageData || []).map((a) => ({
    name: a.name,
    value: a.value || 0,
    color: a.color as string,
  })) as Array<{ name: string; value: number; color: string }>;

  const genderBarData = (genderData || []).map((g) => ({
    name: g.name,
    value: g.count,
    color: genderColor(g.name as any),
  }));

  // Total for legend percentages
  const ageTotalCount = agePieData.reduce((sum, i) => sum + (i.value || 0), 0);

  return (
    <>
      {loading && (
        <div className="text-sm text-gray-500">{t('common.loading')}</div>
      )}
      {error && !loading && <div className="text-sm text-red-600">{error}</div>}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Age Distribution - Pie Card (ReportViewer style) */}
          <Card className="bg-[#F7F9FB] drop-shadow-sm shadow-gray-50 border-0">
            <CardHeader>
              <CardTitle className="text-base">{t('dashboard.ageDistribution')}</CardTitle>
            </CardHeader>
            <CardContent className="p-6 h-[300px] flex items-center justify-center">
              {agePieData.length === 0 ? (
                <div className="text-xs text-gray-500">No data</div>
              ) : (
                <div className="relative h-full w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={agePieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        label={false}
                      >
                        {agePieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number, _name: any, entry: any) => [
                          `${value} ${t('dashboard.beneficiaries')}`,
                          `Age "${entry?.payload?.name}"`,
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-4">
                    {agePieData.map((item, index) => (
                      <div key={index} className="flex items-center gap-1.5">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm">
                          {item.name}: {ageTotalCount
                            ? Math.round((item.value / ageTotalCount) * 100)
                            : 0}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gender Distribution - Bar Card (ReportViewer style) */}
          <Card className="bg-[#F7F9FB] drop-shadow-sm shadow-gray-50 border-0">
            <CardHeader>
              <CardTitle className="text-base">{t('dashboard.genderDistribution')}</CardTitle>
            </CardHeader>
            <CardContent className="p-6 h-[300px]">
              {genderBarData.length === 0 ? (
                <div className="text-xs text-gray-500">{t('common.noData')}</div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={genderBarData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      interval={0}
                    />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value">
                      {genderBarData.map((entry, index) => (
                        <Cell key={`bar-cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

function bucketColor(name: "0-20" | "19-35" | "36-55" | "55+"): string {
  // Use ReportViewer palette: ["#4f46e5", "#06b6d4", "#8b5cf6"].
  // Map age buckets to these colors; reuse the first for the 4th bucket to stay consistent.
  switch (name) {
    case "0-20":
      return "#4f46e5";
    case "19-35":
      return "#06b6d4";
    case "36-55":
      return "#8b5cf6";
    case "55+":
      return "#4f46e5";
    default:
      return "#8b5cf6";
  }
}

function genderColor(name: "Male" | "Female" | "Unknown"): string {
  switch (name) {
    case "Female":
      return "#4f46e5"; // match ReportViewer pie colors
    case "Male":
      return "#4f46e5";
    case "Unknown":
    default:
      return "#8b5cf6";
  }
}
