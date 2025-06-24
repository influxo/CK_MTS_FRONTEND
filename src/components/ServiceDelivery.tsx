import { Card, CardContent, CardHeader, CardTitle } from "./ui/data-display/card";

export function ServiceDelivery() {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Service Delivery Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
          <div className="h-48 flex items-center justify-center border rounded-md mb-4">
            <div className="text-xs text-muted-foreground">
              Service category breakdown chart
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {["Healthcare", "Education", "Nutrition", "Other"].map(
              (category, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center p-3 border rounded-md"
                >
                  <span className="text-sm">{category}</span>
                  <span className="text-lg font-medium mt-1">
                    {[42, 28, 18, 12][index]}%
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
