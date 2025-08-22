import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/data-display/card";
import { Badge } from "../ui/data-display/badge";
import { Progress } from "../ui/feedback/progress";

export function ServiceDelivery() {
  const services = [
    {
      name: "Healthcare Services",
      delivered: 1247,
      target: 1500,
      completion: 83,
      status: "on-track",
    },
    {
      name: "Educational Programs",
      delivered: 892,
      target: 1000,
      completion: 89,
      status: "ahead",
    },
    {
      name: "Water & Sanitation",
      delivered: 234,
      target: 400,
      completion: 58,
      status: "behind",
    },
    {
      name: "Nutrition Support",
      delivered: 567,
      target: 600,
      completion: 94,
      status: "on-track",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ahead":
        return (
          <Badge variant="secondary" className="text-green-700 bg-green-100">
            Ahead
          </Badge>
        );
      case "on-track":
        return (
          <Badge variant="secondary" className="text-blue-700 bg-blue-100">
            On Track
          </Badge>
        );
      case "behind":
        return (
          <Badge variant="secondary" className="text-amber-700 bg-amber-100">
            Behind
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Card className="bg-[#F7F9FB]      drop-shadow-sm shadow-gray-50 border-0">
      <CardHeader>
        <CardTitle>Service Delivery Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {services.map((service, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{service.name}</span>
                {getStatusBadge(service.status)}
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>
                  {service.delivered} / {service.target} delivered
                </span>
                <span>{service.completion}%</span>
              </div>
              <Progress value={service.completion} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
