import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Bar, BarChart, Cell, Legend, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/data-display/card";
import type { RootState } from "../../store";
import { loadDemographics } from "../../store/slices/demographicsSlice";

export function BeneficiaryDemographics() {
  const dispatch = useDispatch();
  const { loading, error, data } = useSelector((s: RootState) => s.demographics);

  React.useEffect(() => {
    // Fetch once on mount
    dispatch(loadDemographics() as any);
  }, [dispatch]);

  const ageData = (data?.age || []).map((a) => ({ ...a, color: bucketColor(a.name) }));
  const genderData = data?.gender || [];

  return (
    <Card className="bg-[#F7F9FB] drop-shadow-sm shadow-gray-50 border-0">
      <CardHeader>
        <CardTitle>Beneficiary Demographics</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && <div className="text-sm text-gray-500">Loading demographics…</div>}
        {error && !loading && (
          <div className="text-sm text-red-600">{error}</div>
        )}
        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium mb-4">Age Distribution</h4>
              {ageData.length === 0 ? (
                <div className="text-xs text-gray-500">No data</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={ageData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {ageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color!} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div>
              <h4 className="text-sm font-medium mb-4">Gender Distribution</h4>
              {genderData.length === 0 ? (
                <div className="text-xs text-gray-500">No data</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={genderData}>
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function bucketColor(name: '0-20' | '19-35' | '36-55' | '55+'): string {
  switch (name) {
    case '0-20':
      return '#8884d8';
    case '19-35':
      return '#82ca9d';
    case '36-55':
      return '#ffc658';
    case '55+':
      return '#ff7c7c';
    default:
      return '#cccccc';
  }
}
