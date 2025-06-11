import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export function BeneficiaryDemographics() {
  const ageData = [
    { name: "0-18", value: 35, color: "#8884d8" },
    { name: "19-35", value: 28, color: "#82ca9d" },
    { name: "36-55", value: 22, color: "#ffc658" },
    { name: "55+", value: 15, color: "#ff7c7c" },
  ];

  const genderData = [
    { name: "Female", count: 4890 },
    { name: "Male", count: 4052 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Beneficiary Demographics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium mb-4">Age Distribution</h4>
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
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-4">Gender Distribution</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={genderData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
